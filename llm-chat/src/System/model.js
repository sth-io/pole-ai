import { create } from "zustand";
import { API } from "./api";

export const useSystem = create((set) => ({
  status: {
    ollama: false,
    web_search: false,
    chroma: false,
    coqui: false,
  },
  getStatus: async () => {
    const state = await API.getStatus();
    set(() => ({ status: state.availableServices }));
  },
}));
