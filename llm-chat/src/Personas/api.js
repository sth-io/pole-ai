import config from "../config";
import { makeQuery } from "../utils/api";

export const API = {
  add: async (persona) => {
    const url = `${config.apiUrl}/api/personas`;
    const response = await makeQuery(url, "POST", persona);
    return response;
  },
  edit: async (persona) => {
    const url = `${config.apiUrl}/api/personas/${persona.title}`;
    const response = await makeQuery(url, 'PUT', persona)
    return response
  },
  delete: async (persona) => {
    const url = `${config.apiUrl}/api/personas/${persona}`;
    const response = await makeQuery(url, "DELETE");
    return response;
  }
};
