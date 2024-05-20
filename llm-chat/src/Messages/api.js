import config from "../config";
import { makeQuery } from "../utils/api";

export const API = {
  getCollections: async () => {
    const url = `${config.apiUrl}/api/messages/list`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  toggleFav: async (chatId) => {
    const url = `${config.apiUrl}/api/messages/fav`;
    const response = await makeQuery(url, "POST", { chatId });
    return response;
  },
  delete: async (chatId) => {
    const url = `${config.apiUrl}/api/messages/${chatId}`;
    const response = await makeQuery(url, "DELETE");
    return response;
  },
  getHistory: async (id) => {
    const url = `${config.apiUrl}/api/messages/${id}`;
    const response = await makeQuery(url, "GET");
    return response.json();
  }
};
