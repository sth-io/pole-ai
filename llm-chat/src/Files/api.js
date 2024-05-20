import config from "../config";
import { makeQuery } from "../utils/api";

export const API = {
  getCollections: async () => {
    const url = `${config.apiUrl}/api/index/list`;
    const response = await makeQuery(url, "GET");
    return response.json();
  },
  uploadFile: async (formData) => {
    const url = `${config.apiUrl}/api/index/upload`;
    const response = await makeQuery(url, "POST", formData);
    return response;
  },
  indexFiles: async ({ path, meta: name, model }) => {
    const url = `${config.apiUrl}/api/index/path`;
    const response = await makeQuery(url, "post", { path, meta: name, model });
    return response;
  },
  deleteFiles: async (collection) => {
    try {
      const url = `${config.apiUrl}/api/index/${collection}`;
      await makeQuery(url, "delete");
    } catch (e) {
      throw e 
    }
  },
};
