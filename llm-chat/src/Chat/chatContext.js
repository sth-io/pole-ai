import React, { useState, useEffect, createContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { API } from "./api";
import {
  callChat,
  makeDivergedHistory,
  promptToChat,
  responseToChat,
  setupChat,
  toggleMessage,
} from "./model";
import { removePreviousGenerations } from "../Messages/utils";
import { create } from "zustand";

const params = new URLSearchParams(window.location.search);
const lsG = (name, def) =>
  localStorage.getItem(name) ? JSON.parse(localStorage.getItem(name)) : def;

export const useCurrentAnswer = create((set) => ({
  currentAnswer: "",
  setCurrentAnswer: (value) => {
    set(() => ({ currentAnswer: value }));
  },
  autoScroll: true,
  setAutoScroll: (value) => {
    set(() => ({ autoScroll: value }));
  },
}));

export const usePrompt = create((set) => ({
  prompt: "",
  file: {},
  setFile: (value) => {
    set(() => ({ file: value }));
  },
  setPrompt: (value) => {
    set(() => ({ prompt: value }));
  },
}));

export const useChatStore = create((set, get) => ({
  chat: [],
  personas: [],
  models: [],
  model: localStorage.getItem("model") || "",
  collection: localStorage.getItem("collection") || "",
  chatId: params.get("chat_id") || uuidv4(),
  options: lsG("options", {}),
  ragOptions: lsG("ragOptions", { chunks: 10, embedModel: "" }),
  history: [],
  persona: "",
  diverge: (timestamp) => {
    const newId = uuidv4();
    const newHistory = makeDivergedHistory(get().chat, timestamp, newId);
    set(() => ({
      chat: newHistory,
      chatId: newId,
    }));
    updateUrl("chat_id", newId);
    API.createNewChat(newId, newHistory, get().model);
  },
  setOptions: (option, value) => {
    // reset values
    if (!option && !value) {
      set(() => ({
        options: {},
      }));
      localStorage.setItem("options", "{}");
      return;
    }
    set((store) => {
      const newSet = {
        ...store.options,
        [option]: value,
      };
      localStorage.setItem("options", JSON.stringify(newSet));
      return {
        options: newSet,
      };
    });
  },
  ragOptionsSetter: (option, value) => {
    set((store) => {
      const newSet = {
        ...store.ragOptions,
        [option]: value,
      };
      localStorage.setItem("ragOptions", JSON.stringify(newSet));
      return {
        ragOptions: newSet,
      };
    });
  },
  setHistory: (val) =>
    set(() => ({
      history: val,
    })),
  setPersona: (val) =>
    set(() => ({
      persona: val,
    })),
  getPersonas: async () => {
    const personas = await API.getPersonas();
    set(() => ({ personas }));
  },
  regenerate: async (timestamp) => {
    const messages = makeDivergedHistory(get().chat, timestamp, get().chatId);
    const userQuestions = messages.filter((elem) => elem.role === "user");
    const lastIndex = userQuestions.length - 1;
    const actualHistory =
      lastIndex > 0
        ? makeDivergedHistory(
            get().chat,
            userQuestions[lastIndex].stamp,
            get().chatId
          )
        : [];
    await get().send(userQuestions[lastIndex].content, true, actualHistory);
  },
  setModel: (model) => {
    set(() => ({ model }));
    localStorage.setItem("model", model);
  },
  setCollection: (collection) => {
    set(() => ({ collection }));
    localStorage.setItem("collection", collection);
  },
  clearChat: () => {
    set(() => ({ chat: [] }));
    useCurrentAnswer.setState({ currentAnswer: "" });
  },
  toggleChatMessage: (index) => {
    set((store) => ({ chat: toggleMessage(store.chat, index) }));
  },
  setChatId: (id) => {
    set(() => ({ chatId: id }));
    updateUrl("chat_id", id);
  },
  getModels: async () => {
    const modelData = await API.getModels();
    set((store) => ({
      models: modelData.models,
      model:
        !store.model && modelData.models.length > 0
          ? modelData.models[0].name
          : store.model,
    }));
  },
  newChat: () => {
    const newId = uuidv4();
    set(() => ({
      chat: [],
      chatId: newId,
    }));
    useCurrentAnswer.setState({ currentAnswer: "" });
    updateUrl("chat_id", newId);
  },
  setChat: (chat) => {
    set(() => ({ chat }));
  },
  send: async (question, withoutAppend, history) => {
    // convert prompt to visible chat
    const file = usePrompt.getState().file
    const newState = promptToChat(
      removePreviousGenerations(history ?? get().chat),
      get().chatId,
      question,
      file
    );
    const persona = get().persona;
    const hasPersona =
      persona && get().personas.find((p) => p.title === persona);
    // visible chat extended with required data
    const messages = setupChat(newState, hasPersona);
    set(() => ({
      ...(!withoutAppend ? { chat: newState } : {}),
    }));

    const setNewState = (chunks) => {
      set(() => ({
        chat: responseToChat(get().chat, chunks),
      }));
    };


    await callChat(
      {
        messages,
        model: get().model,
        collection: get().collection,
        ragOptions: get().ragOptions,
        options: get().options,
      },
      (msg) => useCurrentAnswer.setState({ currentAnswer: msg }),
      setNewState,
      withoutAppend
    );
    useCurrentAnswer.setState({ currentAnswer: "" });
  },
}));

export const updateUrl = (paramKey, paramValue) => {
  let searchParams = new URLSearchParams(window.location.search);
  const existingParams = Object.fromEntries(searchParams.entries()); // Parse existing params to an object
  existingParams[paramKey] = paramValue; // Update the value for the given key
  searchParams = Object.entries(existingParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  window.history.pushState(null, null, `?${searchParams}`);
};
