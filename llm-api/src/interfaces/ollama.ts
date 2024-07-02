import axios from "axios";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { load } from "cheerio";
import { Readable } from "stream";
import { config } from "../config";
import { AddMessage, ListMessages, STORAGES } from "./filestore";
import { jsonrepair } from "jsonrepair";
import { ChromaModel } from "./chroma";
import eventBus from "./eventBus";
import { prompts } from "./prompts";
import path, { resolve } from "path";
import { SearchXng } from "./searchxng";
import { Severity, log } from "../utils/logging";

const __dirname = resolve(".");

export const getModels = async (res) => {
  const url = `${config.ollama.server}/${config.ollama.api.tags}`;
  const externalResponse = await axios.get(url);
  res.setHeader("Content-Type", "application/json");
  res.send(externalResponse.data);
};

export const askOllama = async (prompt, model, tries = 3, options = {}) => {
  const requestData = {
    prompt,
    model,
    stream: false,
    options,
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
      log(Severity.info, "askOllama", `question error, retrying`);
      function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
      await sleep(500);
      return askOllama(prompt, model, tries - 1, options);
    } else {
      log(Severity.error, "askOllama", e.message);
      eventBus.emit("error", {
        msg: {
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
      system: prompts.index_code(),
      prompt: requestData.prompt,
    };
    log(Severity.debug, "getMeta", JSON.stringify(request));
    const url = `${config.ollama.server}/${config.ollama.api.generate}`;
    const response = await axios.post(url, request);
    const repaired = jsonrepair(response.data.response);
    return { res: JSON.parse(repaired), feedback };
  } catch (e) {
    if (tries > 0) {
      log(Severity.info, "getMeta", "retrying");
      return await getMeta(requestData, feedback, tries - 1);
    } else {
      log(Severity.error, "getMeta", e.message);
      eventBus.emit("error", {
        msg: {
          msg: `Failed to get valid meta data from ${requestData.model}`,
          status: "error",
        },
      });
    }
  }
};

export const getUrlData = async (url, chatId, status = (msg) => {}) => {
  // Parsing to markdown to preserve context
  const extractBodyContent = (content) => {
    const $ = load(content);
    const key = $("article").text() ? "article p" : "body p";
    const target = $(key).text();
    return target.replace(/\\+n/g, "").replace(/"/g, "").replace(/,/g, "");
  };

  try {
    status(`[URL] starting data pull`);
    const response = await axios.get(url, {
      responseType: "text",
    });
    const htmlContent = response.data;
    const body = extractBodyContent(htmlContent);
    status(`[URL] website added to context`);

    return {
      prompt: prompts.extend_with_website(body, url ?? ""),
      url,
    };
  } catch (e) {
    log(Severity.error, "getUrlData", e.message);
    eventBus.emit("error", {
      chatId: chatId,
      msg: {
        msg: `Failed to get url content from ${url}`,
        status: "error",
      },
    });
    return {
      prompt: "",
      url: "",
    };
  }
};

export const pullWebsite = async (
  trigger,
  messages,
  options = { system: false },
  status: (msg) => {}
) => {
  if (!trigger) {
    return { prompt: "", url: "" };
  }
  const lastIndex = messages.length - 1;
  const current = messages[lastIndex];

  function findUrl(text) {
    const regexSystem =
      /\b(https?:\/\/[^\s]+(?:\/[^?#]+)?(?:\?(?:[^#]+)(?:&(?:[^=]+=[^&]+))*)?(?:#[^\s]*)?)?\b/gi;
    const regexUser =
      /#(https?:\/\/[^\s]+(?:\/[^?#]+)?(?:\?(?:[^#]+)(?:&(?:[^=]+=[^&]+))*)?(?:#[^\s]*)?)?/gi;
    const regex = options.system ? regexSystem : regexUser;
    return text.match(regex)?.filter((url) => url !== "");
  }
  const urls = findUrl(current.content);
  log(Severity.debug, "pullWebsite", `found url ${JSON.stringify(urls)}`);
  if (!urls || urls.length === 0) {
    return { prompt: "", url: "" };
  }
  status(`[URL] website detected`);
  const substrLength = options.system ? 0 : 1;
  return getUrlData(urls[0].substring(substrLength), current.chatId, status);
};

export const pullSearch = async (requestData, msg, status = (msg) => {}) => {
  if (requestData.ragOptions.useSearch) {
    status(`[web-search] checking if needs a web search`);
    const shouldQueryA = await askOllama(
      prompts.should_search(msg.content),
      requestData.model,
      undefined,
      { num_predict: 12, temperature: 0 }
    );
    const shouldQuery = `${shouldQueryA}`.toLowerCase().indexOf("true") > -1;
    log(Severity.debug, "pullSearch", `${shouldQuery}, ${shouldQueryA}`);
    status(
      `[web-search] ${
        shouldQuery ? "requires web search" : "decided not to search"
      }`
    );
    if (shouldQuery) {
      status(`[web-search] preparing search query`);
      const query = await askOllama(
        prompts.geneare_search_query(msg.content),
        requestData.model,
        undefined,
        { temperature: 0 }
      );
      log(Severity.debug, "pullSearch", `searchQuery: ${query}`);

      const results = await SearchXng().search(query.replace(/"|'/g, ""));
      status(`[web-search] got search results, picking the best`);
      const pick = await askOllama(
        prompts.pick_search_result(results, msg.content),
        requestData.model,
        undefined,
        { temperature: 0, num_predict: 100 }
      );
      log(Severity.debug, "pullSearch", `choice: ${pick}`);
      status(`[web-search] pulling website content`);
      const urlData = await pullWebsite(
        true,
        [{ content: pick, chatId: msg.chatId }],
        { system: true },
        //@ts-expect-error
        status
      );
      status(`[web-search] passed results to context`);
      return urlData;
    } else {
      return { prompt: "", url: "" };
    }
  } else {
    return { prompt: "", url: "" };
  }
};

export const pullDate = async () => {
  return {
    prompt: `
    
    ** context: if you need it the current date is: ${new Date().toString()}. **`,
  };
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

export const getData = async (
  collection,
  model,
  ragModel,
  question,
  limit,
  status = (msg) => {}
) => {
  if (!collection) {
    return "";
  }
  const Model = ChromaModel(collection, ragModel);
  status(`[RAG] distilling keywords`);
  const distilledQuestion = await askOllama(
    prompts.generate_keywords(question),
    model
  );
  status(`[RAG] getting data based on keywords`);
  const collections = await Model.query(distilledQuestion, limit);
  const indexRoot = path.resolve(__dirname, STORAGES().indexing);
  const documents = collections.documents
    .map(
      (document, i) =>
        `[start] filePath:${collections.metadatas[0][i].name.replace(
          indexRoot,
          ""
        )}, pageContent: ${document}. [end] `
    )
    .join(",")
    .replace(/\\+n/g, "")
    .replace(/"/g, "'");

  status(`[RAG] prepared ${documents.length} chunks`);
  return prompts.extend_with_documents(documents);
};

export const streamingChat = async (requestData) => {
  try {
    // last msg
    const msg = requestData.messages[requestData.messages.length - 1];
    const chatId = msg.chatId;
    const userQ = msg;

    const currentDate = await pullDate();

    const statusCallback = (msg) =>
      eventBus.emit("chat:status", {
        chatId: chatId,
        msg,
      });

    // get RAG data
    const documents = await getData(
      requestData.collection,
      requestData.model,
      requestData.ragOptions.model,
      msg.content,
      requestData.ragOptions.chunks || 10,
      statusCallback
    );
    // get website data
    // do not extend with website data if collection is provided - to preserve context
    const websiteData = await pullWebsite(
      !requestData.collection,
      requestData.messages,
      requestData.config,
      statusCallback
    );

    const searchData = await pullSearch(requestData, msg, statusCallback);
    const messageContext = msg.context
      ? `this is the context of the question: ${msg.context}.`
      : "";

    log(
      Severity.debug,
      "streamingChat",
      `${JSON.stringify({ websiteData, searchData })}`
    );
    // Prepare request
    let request = {
      messages: [
        ...requestData.messages.map((elem, i) =>
          cleanAndExtendMsgs(elem, i, requestData.messages.length, [
            currentDate.prompt,
            documents,
            websiteData.prompt,
            searchData.prompt,
            messageContext,
          ])
        ),
      ],
      options: requestData.options ?? {},
      model: requestData.model,
    };

    log(Severity.debug, "streamingChat", `request: ${JSON.stringify(request)}`);

    // pass the prepared data to Ollama
    const url = `${config.ollama.server}/${config.ollama.api.chat}`;

    statusCallback("query sent to LLM");
    const call = async () => {
      eventBus.emit("chat:streaming", {
        chatId,
        message: { isStreaming: true },
      });
  ;
      const controller = new AbortController();
      const response = await axios.post(url, request, {
        responseType: "stream", // Set response type to stream
        signal: controller.signal,
      });
      eventBus.emit("controller", { chatId, controller });

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
        used_url?: string;
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
          result = {
            model: json.model,
            created_at: json.created_at,
            total_duration: json.total_duration,
            load_duration: json.load_duration,
            prompt_eval_count: json.prompt_eval_count,
            prompt_eval_duration: json.prompt_eval_duration,
            eval_count: json.eval_count,
            eval_duration: json.eval_duration,
            used_url: searchData.url || websiteData.url,
          };
          eventBus.emit("chat:answer", {
            chatId: msg.chatId,
            message: {
              done: true,
              content: collectedChunks,
              ...result,
            },
          });
          eventBus.emit("chat:streaming", {
            chatId,
            message: { isStreaming: false },
          });
          statusCallback("")
        } else {
          eventBus.emit("chat:answer", {
            chatId: msg.chatId,
            message: { content: collectedChunks, chunk: json.message.content },
          });
        }
      });

      // Listen for 'end' event to finalize data collection and call AddMessage function
      response.data.on("end", async () => {
        // add user message to storage
        if (!requestData.withoutAppend) {
          await AddMessage(userQ, requestData.model);
          if (requestData.messages.length === 1) {
            setTimeout(() => {
              const messages = ListMessages();
              if (messages) {
                eventBus.emit("chat:new", { message: messages[0] });
              }
            }, 1000);
          }
        }

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
    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    const executor = async (tries = 3) => {
      try {
        await call();
      } catch (e) {
        if (tries > 0) {
          eventBus.emit("error", {
            chatId: chatId,
            msg: {
              msg: `failed response from the ${requestData.model}. Attempt: ${
                4 - tries
              }/${3}`,
              status: "warning",
            },
          });
          await sleep(2000);
          log(Severity.debug, "streamingChat:executor", `retry`);
          executor(tries - 1);
        } else {
          log(Severity.error, "streamingChat:executor", e.message);
          eventBus.emit("error", {
            chatId: chatId,
            msg: {
              msg: `couldn't get valid response from the ${requestData.model}.`,
              status: "error",
            },
          });
        }
      }
    };

    executor();

    // Pipe the external endpoint stream to the response to the client
  } catch (e) {
    log(Severity.error, "streamingChat", e.message);
  }
};
