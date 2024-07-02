import config from "../config";
import { makeQuery } from "../utils/api";

export const API = {
  createNewChat: (id, history, model) => {
    const url = `${config.apiUrl}/api/messages/create/${id}`;
    makeQuery(url, "POST", { messages: history, model });
  },
  getModels: async () => {
    const url = `${config.apiUrl}/api/model/list`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  getHistory: async (id) => {
    const url = `${config.apiUrl}/api/messages/${id}`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  getPersonas: async () => {
    const url = `${config.apiUrl}/api/personas`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  sendChat: async (data) => {
    const url = `${config.apiUrl}/api/chat`;
    const response = await makeQuery(url, "POST", data);
    return response;
  },
  getMessages: async () => {
    const url = `${config.apiUrl}/api/messages/list`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  getTags: async () => {
    const url = `${config.apiUrl}/api/tags/list`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
};
