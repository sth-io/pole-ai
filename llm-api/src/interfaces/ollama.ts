import axios from "axios";
import { config } from "../config";
import { AddMessage } from "./filestore";
import { Readable } from "stream";
import { jsonrepair } from "jsonrepair";
import { ChromaModel } from "./chroma";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { load } from "cheerio";

export const getModels = async (res) => {
  const url = `${config.ollama.server}/${config.ollama.api.tags}`;
  const externalResponse = await axios.get(url);
  res.setHeader("Content-Type", "application/json");
  res.send(externalResponse.data);
};

export const askOllama = async (prompt, model) => {
  const requestData = {
    prompt,
    model,
    stream: false,
  };

  try {
    const url = `${config.ollama.server}/${config.ollama.api.generate}`;
    // 2mins
    const externalResponse = await axios.post(url, requestData, {
      timeout: 1000 * 60 * 2,
    });

    return externalResponse.data.response;
  } catch (e) {
    console.log("llm opinion error", e.message);
    console.log("retrying", requestData);
    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
    await sleep(500);
    return askOllama(prompt, model);
  }
};

export const getMeta = async (requestData, feedback) => {
  try {
    const request = {
      stream: false,
      model: requestData.model,
      system: `You're indexing machine. When user sends message you'll answer only in valid JSON, precisely and on point by following this template:
        { description: [biref description of a file], language: [language of the file], functions: [JSON array of functions in the code files]}`,
      prompt: requestData.prompt,
    };
    console.log(requestData);
    const url = `${config.ollama.server}/${config.ollama.api.generate}`;
    const response = await axios.post(url, request);
    const repaired = jsonrepair(response.data.response);
    return { res: JSON.parse(repaired), feedback };
  } catch (e) {
    console.log("retrying", feedback?.i);
    return await getMeta(requestData, feedback);
  }
};

export const pullWebsite = async (trigger, messages, options = {}) => {
  if (!trigger) {
    return "";
  }
  // if (!options.lookForUrl) {
  //   return;
  // }
  const lastIndex = messages.length - 1;
  const current = messages[lastIndex];

  function findUrl(text) {
    const regex =
      /\b(https?:\/\/[^\s]+(?:\/[^?#]+)?(?:\?(?:[^#]+)(?:&(?:[^=]+=[^&]+))*)?(?:#[^\s]*)?)?\b/gi;
    return text.match(regex).filter((url) => url !== "");
  }
  const urls = findUrl(current.content);

  if (urls.length === 0) {
    return;
  }

  // Parsing to markdown to preserve context
  const extractBodyContent = (content) => {
    const $ = load(content);
    const key = $("article").text() ? "article" : "body";
    const target = $(key).children().remove("script").end().text();
    return target.replace(/\\+n/g, "").replace(/"/g, "'");

    // return NodeHtmlMarkdown.translate(content);
  };

  const response = await axios.get(urls[0], { responseType: "text" });
  const htmlContent = response.data;
  const body = extractBodyContent(htmlContent);

  return `
    Use this website content for your response, make it clear what is coming from the website content and what's not:
    ${body}
  `;
};

const cleanAndExtendMsgs = (msg, i, length, extend) => {
  const shouldExtend = length - 1 === i;
  const additionalData = extend.join(". ");
  const content = shouldExtend
    ? `${additionalData}, the question is: ${msg.content}`
    : msg.content;
  return {
    role: msg.role,
    content,
  };
};

export const getData = async (collection, model, ragModel, question, limit) => {
  if (!collection) {
    return "";
  }
  const Model = ChromaModel(collection, ragModel);
  const distilledQuestion = await askOllama(
    `create keywords for the following text, provide keywords only in form of a comma delimited list. The text is: "${question}"`,
    model
  );
  const collections = await Model.query(distilledQuestion, limit);
  const documents = collections.documents
    .map(
      (document, i) =>
        `pageContent: ${document}. fileName:${collections.ids[i]}`
    )
    .join(",")
    .replace(/\\+n/g, "")
    .replace(/"/g, "'");

  const systemPrompt = `Use these documents content for your response. End your response with a list of used document names. If documents dont contain the answer say that you dont know. document structure is pageContent document contents, name document name. The list of documents is ${documents}`;
  return systemPrompt;
};

export const streamingChat = async (requestData, res) => {
  try {
    // last msg
    const msg = requestData.messages[requestData.messages.length - 1];

    // add message to storage
    if (!requestData.withoutAppend) {
      await AddMessage(msg, requestData.model);
    }

    // get RAG data
    const documents = await getData(
      requestData.collection,
      requestData.model,
      requestData.ragOptions.model,
      msg.content,
      requestData.ragOptions.chunks || 10
    );

    // get website data
    // do not extend with website data if collection is provided - to preserve context
    const websiteData = await pullWebsite(
      !requestData.collection,
      requestData.messages,
      requestData.config
    );

    // Prepare request
    const request = {
      messages: [
        ...requestData.messages.map((elem, i) =>
          cleanAndExtendMsgs(elem, i, requestData.messages.length, [
            documents,
            websiteData,
          ])
        ),
      ],
      options: requestData.options ?? {},
      model: requestData.model,
    };
    console.log(request);

    // pass the prepared data to Ollama
    const url = `${config.ollama.server}/${config.ollama.api.chat}`;
    const call = async () => {
      const response = await axios.post(url, request, {
        responseType: "stream", // Set response type to stream
      });

      // Set headers to indicate streaming
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");

      // Variable to accumulate all chunks into a single string
      let collectedChunks = "";

      // Transform each chunk to a readable stream and accumulate them
      response.data.on("data", (chunk) => {
        const chunkStream = new Readable();
        chunkStream.push(chunk);
        chunkStream.push(null); // Signal end of stream
        chunkStream.setEncoding("utf8"); // Set encoding to UTF-8
        const read = chunkStream.read();
        const json = JSON.parse(read);
        collectedChunks += json.message.content; // Read and append chunk to collectedChunks
      });

      // Listen for 'end' event to finalize data collection and call AddMessage function
      response.data.on("end", async () => {
        // Call AddMessage function with the collected data
        await AddMessage(
          {
            role: "assistant",
            stamp: Date.now(),
            chatId: msg.chatId,
            content: collectedChunks,
          },
          requestData.model
        );
      });
      response.data.pipe(res);
    };
    try {
      await call();
    } catch {
      console.log("retry");
      await call();
    }

    // Pipe the external endpoint stream to the response to the client
  } catch (e) {
    console.log("question failed", e);
  }
};
