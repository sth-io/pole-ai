import axios from "axios";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { load } from "cheerio";
import { Readable } from "stream";
import { config } from "../config";
import { AddMessage, ListMessages } from "./filestore";
import { jsonrepair } from "jsonrepair";
import { ChromaModel } from "./chroma";
import eventBus from "./eventBus";
import { prompts } from "./prompts";

export const getModels = async (res) => {
  const url = `${config.ollama.server}/${config.ollama.api.tags}`;
  const externalResponse = await axios.get(url);
  res.setHeader("Content-Type", "application/json");
  res.send(externalResponse.data);
};

export const askOllama = async (prompt, model, tries = 3) => {
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
    if (tries > 0) {
      console.log("llm opinion error", e.message);
      console.log("retrying", requestData);
      function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
      await sleep(500);
      return askOllama(prompt, model, tries - 1);
    } else {
      eventBus.emit("error", {
        message: {
          msg: `Failed to get valid response from ${model}`,
          status: "error",
        },
      });
    }
  }
};

export const getMeta = async (requestData, feedback, tries = 3) => {
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
    if (tries > 0) {
      console.log("retrying", feedback?.i);
      return await getMeta(requestData, feedback, tries - 1);
    } else {
      eventBus.emit("error", {
        message: {
          msg: `Failed to get valid meta data from ${requestData.model}`,
          status: "error",
        },
      });
    }
  }
};

export const pullWebsite = async (trigger, messages, options = {}) => {
  if (!trigger) {
    return "";
  }
  const lastIndex = messages.length - 1;
  const current = messages[lastIndex];

  function findUrl(text) {
    const regex =
      /#(https?:\/\/[^\s]+(?:\/[^?#]+)?(?:\?(?:[^#]+)(?:&(?:[^=]+=[^&]+))*)?(?:#[^\s]*)?)?/gi;
    return text.match(regex)?.filter((url) => url !== "");
  }
  const urls = findUrl(current.content);
  if (!urls) {
    return;
  }
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

  try {
    const response = await axios.get(urls[0].substring(1), {
      responseType: "text",
    });
    const htmlContent = response.data;
    const body = extractBodyContent(htmlContent);

    return prompts.extend_with_website(body);
  } catch (e) {
    eventBus.emit("error", {
      chatId: current.chatId,
      message: {
        msg: `Failed to get url content from ${urls[0].substring(1)}`,
        status: "error",
      },
    });
  }
};

const cleanAndExtendMsgs = (msg, i, length, extend) => {
  const shouldExtend = length - 1 === i;
  const additionalData = extend.filter((elem) => elem).join(". ");
  const content = shouldExtend
    ? `${additionalData ?? ""}${additionalData ? ", the question is: " : ""}${
        msg.content
      }`
    : msg.content;
  return {
    role: msg.role,
    content,
    ...(msg.images ? { images: msg.images } : {}),
  };
};

export const getData = async (collection, model, ragModel, question, limit) => {
  if (!collection) {
    return "";
  }
  const Model = ChromaModel(collection, ragModel);
  const distilledQuestion = await askOllama(
    prompts.generate_keywords(question),
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

  return prompts.extend_with_documents(documents);
};

export const streamingChat = async (requestData) => {
  try {
    // last msg
    const msg = requestData.messages[requestData.messages.length - 1];
    // add user message to storage
    if (!requestData.withoutAppend) {
      await AddMessage(msg, requestData.model);
      if (requestData.messages.length === 1) {
        setTimeout(() => {
          const messages = ListMessages();
          console.log(messages);
          eventBus.emit("chat:new", { message: messages[0] });
        }, 1000);
      }
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

    const messageContext = msg.context
      ? `this is the context of the question: ${msg.context}.`
      : "";

    // Prepare request
    let request = {
      messages: [
        ...requestData.messages.map((elem, i) =>
          cleanAndExtendMsgs(elem, i, requestData.messages.length, [
            documents,
            websiteData,
            messageContext,
          ])
        ),
      ],
      options: requestData.options ?? {},
      model: requestData.model,
    };
    console.log("request", request);

    // pass the prepared data to Ollama
    const url = `${config.ollama.server}/${config.ollama.api.chat}`;
    const call = async () => {
      const response = await axios.post(url, request, {
        responseType: "stream", // Set response type to stream
      });
      // response.data.pipe(res);

      // Variable to accumulate all chunks into a single string
      let collectedChunks = "";

      let result: {
        model?: string;
        created_at?: string;
        total_duration?: number;
        load_duration?: number;
        prompt_eval_count?: number;
        prompt_eval_duration?: number;
        eval_count?: number;
        eval_duration?: number;
      } = {};

      // Transform each chunk to a readable stream and accumulate them
      response.data.on("data", (chunk) => {
        const chunkStream = new Readable();
        chunkStream.push(chunk);
        chunkStream.push(null); // Signal end of stream
        chunkStream.setEncoding("utf8"); // Set encoding to UTF-8
        const read = chunkStream.read();
        const json = JSON.parse(read);
        collectedChunks += json.response ? json.response : json.message.content; // Read and append chunk to collectedChunks
        if (json.done) {
          console.log("answer done");
          result = {
            model: json.model,
            created_at: json.created_at,
            total_duration: json.total_duration,
            load_duration: json.load_duration,
            prompt_eval_count: json.prompt_eval_count,
            prompt_eval_duration: json.prompt_eval_duration,
            eval_count: json.eval_count,
            eval_duration: json.eval_duration,
          };
          eventBus.emit("chat:answer", {
            chatId: msg.chatId,
            message: {
              done: true,
              content: collectedChunks,
              ...result,
            },
          });
        } else {
          eventBus.emit("chat:answer", {
            chatId: msg.chatId,
            message: { content: collectedChunks },
          });
        }
      });

      // Listen for 'end' event to finalize data collection and call AddMessage function
      response.data.on("end", async () => {
        // Call AddMessage function with the collected data
        await AddMessage(
          {
            ...result,
            role: "assistant",
            stamp: Date.now(),
            chatId: msg.chatId,
            content: collectedChunks,
          },
          requestData.model
        );
      });
    };
    let tries = 3;
    try {
      await call();
    } catch {
      if (tries > 0) {
        eventBus.emit("error", {
          chatId: msg.chatId,
          msg: {
            msg: `failed response from the ${requestData.model}. Attempt: ${
              4 - tries
            }/${3}`,
            status: "warning",
          },
        });
        tries = tries - 1;
        await call();
      } else {
        eventBus.emit("error", {
          chatId: msg.chatId,
          msg: {
            msg: `couldn't get valid response from the ${requestData.model}.`,
            status: "error",
          },
        });
      }
    }

    // Pipe the external endpoint stream to the response to the client
  } catch (e) {
    console.log("question failed", e);
  }
};
