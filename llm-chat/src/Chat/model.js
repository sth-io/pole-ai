import { API } from "./api";

export const zeroContext = {
  chat: {},
  prompt: "",
  inputHandler: () => {},
  send: () => {},
  currentAnswer: "",
  models: [],
  setModel: () => {},
  model: "",
  embedModel: "",
  setEmbedModel: () => {},
  getModels: () => {},
  collection: "",
  setCollection: () => {},
  clearChat: () => {},
  toggleChatMessage: () => {},
  setChatId: () => {},
  chatId: () => {},
  newChat: () => {},
  diverge: () => {},
  options: {},
  setOptions: () => {},
  personas: [],
  setPersonas: () => {},
};

export const chunkFallbackMechanism = (chunk) => {
  // Extract content using regex as a fallback mechanism
  const reg = /"content":\s*\"([^\\"\"]+?)\"/g;
  const match = reg.exec(chunk);
  if (match) {
    console.error("err", match[1]);
    return match[1];
    // return match[1].replace(/\\/g, " ");
  } else return "";
};

/**
 * Asynchronously reads and parses all chunks from a readable stream.
 * @function readAllChunks
 * @param {ReadableStream} readableStream - The stream containing JSON data.
 * @param {function} callback - A function to be called incrementally 
 to update the state.
 * @return {Promise<void>} A promise that resolves once all chunks have been 
*/
export async function readAllChunks(readableStream, callback) {
  const chunks = [];

  async function parseChunk(chunk) {
    try {
      const json = JSON.parse(decodeURIComponent(chunk.trim()));
      return json;
    } catch (e) {
      return chunkFallbackMechanism({ message: { content: chunk } });
    }
  }

  const reader = readableStream.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const decoded = new TextDecoder().decode(value);
    const chunk = await parseChunk(decoded);

    if (chunk.message) {
      chunks.push(chunk.message.content);
    } else {
      console.error('e', chunk)
    }

    // Call the callback function to update the state incrementally
    callback({ ...chunk, message: { content: chunks.join("") } });
  }
}

/**
 * Creates and returns a new chat message object with specified details
 * and appends it to the existing chat array
 * @param {Array} chat - The existing chat history array
 * @param {string} chatId - The ID of the chat
 * @param {Object} options - Additional options for the prompt message
 * @param {string} prompt - The content/text of the prompt message
 * @param {Object} file - {image: base64, name: string} | { context: string, name: string}
 * @return {Array} A new array with the appended prompt message object
 */
export const promptToChat = (chat, chatId, prompt, file) => {

  return [
    ...chat,
    { role: "user", content: prompt, stamp: Date.now(), chatId, ...file },
  ];
};

/**
 * Creates a new message object representing an assistant's response
 * and appends it to the chat history
 * @param {Array} chat - The current chat history array
 * @param {string} chunks - The content of the response message
 * @return {Array} A new array with the response message added
 */
export const responseToChat = (chat, response) => {
  return [
    ...chat,
    {
      ...response,
      role: "assistant",
      stamp:  new Date(response.created_at).getTime(),
    },
  ];
};

/**
 * Sets up the initial chat state by optionally adding a persona message
 * and filtering any hidden messages
 * @param {Array} chat - The chat history array
 * @param {boolean} hasPersona - A flag indicating whether to add a persona message
 * @return {Array} A new array with initial state changes applied
 */
export const setupChat = (chat, hasPersona) => {
  const persona = hasPersona
    ? [{ role: "system", content: hasPersona.content }]
    : [];

  return [...persona, ...chat].filter((elem) => !elem.filtered);
};

/**
 * @function toggleMessage
 * @description Toggles the 'filtered' property of a message in the msgs array
 * @param {Array} msgs - the array of message objects
 * @param {number} index - the index of the message to be toggled
 * @return {Array} a new array with the changes applied
 */
export const toggleMessage = (msgs, index) => {
  return msgs.map((msg, i) => {
    if (index === i) {
      return {
        ...msg,
        filtered: !msg.filtered,
      };
    }
    return msg;
  });
};

/**
 * @function makeDivergedHistory
 * @description creates a new array which is a slice of the original chat history up to a specified timestamp
 * @param {Array} chat - the full chat history array
 * @param {number} timestamp - the target timestamp after which the array will be sliced
 * @returns {Array} a new array containing the chat history up to the given timestamp
 */
export const makeDivergedHistory = (chat, timestamp, newId) => {
  const msgIndex = chat.findIndex((elem) => elem.stamp === timestamp) + 1;
  // we're using zero because not found is -1 and then we add 1.
  if (msgIndex === 0) {
    return chat;
  }
  const newHistory = chat
    .slice(0, msgIndex)
    .map((elem) => ({ ...elem, chatId: newId }));

  return newHistory;
};

/**
 * Updates the query parameter without refreshing the page.
 * @param {string} paramKey - The key/name of the parameter to update.
 * @param {string|null} param The new value for the parameter. If null or undefined, the parameter will be removed.
 */
export const updateUrl = (paramKey, paramValue) => {
  const params = new URLSearchParams(window.location.search).entries();
  // Remove existing key from the query parameters
  const filteredParams = params.filter(([k]) => k !== paramKey);
  if (paramValue) {
    filteredParams.push([paramKey, paramValue]);
  }
  window.history.pushState(
    null,
    null,
    [...filteredParams].reduce((url, [key, val]) => `${url}&${key}=${val}`, "?")
  );
};

export const callChat = async (
  { messages, model, collection, ragOptions, options, chatId },
  withoutAppend
) => {
  await API.sendChat({
    chatId,
    messages,
    model,
    options,
    collection,
    ragOptions,
    withoutAppend,
  });
};
