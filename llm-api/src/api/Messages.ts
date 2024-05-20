import path from "path";
import {
  STORAGES,
  addDescription,
  createFile,
  removeElement,
  removeFile,
} from "../interfaces/filestore";

const historyPath = () => {
  const filePath = `${STORAGES().system}/history.json`;
  const fullPath = path.resolve(__dirname, filePath);
  return fullPath;
};

const deleteMessage = async (chatId) => {
  removeElement(historyPath(), "chatId", chatId);
  removeFile(`${STORAGES().messages}/${chatId}.json`);
};

const createHistory = async (chatId, messages, model) => {
  try {
    const messagePath = path.resolve(
      __dirname,
      `${STORAGES().messages}/${chatId}.json`
    );
    const lastMessage = messages[messages.length - 1];
    await createFile(messagePath, JSON.stringify(messages));
    await addDescription(lastMessage, chatId, model);
  } catch (e) {
    throw new Error(e)
  }
};

export const Messages = () => {
  return {
    createHistory: createHistory,
    delete: deleteMessage,
  };
};
