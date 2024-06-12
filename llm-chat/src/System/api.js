import config from "../config";
import { makeQuery } from "../utils/api";

export const API = {
  getStatus: async () => {
    const url = `${config.apiUrl}/api/status`;
    const response = await makeQuery(url, "GET");
    return response.json();
  }
};
