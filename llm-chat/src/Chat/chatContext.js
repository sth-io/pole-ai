import { v4 as uuidv4 } from "uuid";
import { API } from "./api";
import {
  makeDivergedHistory,
  promptToChat,
  setupChat,
  toggleMessage,
} from "./model";
import { create } from "zustand";
import { emit } from "../Sockets/eventBus";
import { removePreviousGenerations } from "../Messages/utils";

const params = new URLSearchParams(window.location.search);
const lsG = (name, def) =>
  localStorage.getItem(name) ? JSON.parse(localStorage.getItem(name)) : def;

export const useCurrentAnswer = create((set) => ({
  questionSend: false,
  currentAnswer: "",
  setCurrentAnswer: (value) => {
    set(() => ({ currentAnswer: value }));
  },
  autoScroll: true,
  setAutoScroll: (value) => {
    set(() => ({ autoScroll: value }));
  },
  setQuestionSend: (value) => {
    set(() => ({ questionSend: true }));
  },
}));

export const usePrompt = create((set) => ({
  prompt: "",
  file: {},
  isStreaming: false,
  setFile: (value) => {
    set(() => ({ file: value }));
  },
  setPrompt: (value) => {
    set(() => ({ prompt: value }));
  },
}));

export const send = (question, withoutAppend, history) => {
  // convert prompt to visible chat
  const chatState = useChatStore.getState();
  useCurrentAnswer.setState({ questionSend: true });
  const file = usePrompt.getState().file;
  const newChatState = promptToChat(
    history ?? chatState.chat,
    chatState.chatId,
    question,
    file
  );
  const persona = chatState.persona;
  const hasPersona =
    persona && chatState.personas.find((p) => p.title === persona);
  // visible chat extended with required data
  const messages = setupChat(
    promptToChat(
      removePreviousGenerations(history ?? chatState.chat),
      chatState.chatId,
      question,
      file
    ),
    hasPersona
  );
  useChatStore.setState({
    ...(!withoutAppend ? { chat: newChatState } : {}),
  });
  const data = {
    chatId: chatState.chatId,
    messages,
    model: chatState.model,
    collection: chatState.collection,
    ragOptions: chatState.ragOptions,
    options: chatState.options,
    withoutAppend,
  };

  emit("chat:q", data);
};

const startId = params.get("chat_id") || uuidv4();
export const useChatStore = create((set, get) => {
  return {
    tags: [],
    chat: [],
    personas: [],
    models: [],
    selectedTags: [],
    model: localStorage.getItem("model") || "",
    collection: localStorage.getItem("collection") || "",
    chatId: startId,
    options: lsG("options", {}),
    ragOptions: lsG("ragOptions", { chunks: 10, embedModel: "" }),
    history: [],
    persona: "",
    diverge: (timestamp) => {
      const newId = uuidv4();
      emit("leave", get().chatId);
      emit("join", newId);
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
    getTags: async () => {
      const tags = await API.getTags();
      set(() => ({ tags }));
    },
    regenerate: async (timestamp) => {
      const index = get().chat.findIndex((m) => m.stamp === timestamp);
      set((store) => ({ chat: toggleMessage(store.chat, index) }));
      emit("message:toggle", {
        chatId: get().chatId,
        element: timestamp,
        value: true,
      });
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
      // await useSocket
      //   .getState()
      //   .send(userQuestions[lastIndex].content, true, actualHistory);
      send(userQuestions[lastIndex].content, true, actualHistory);
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
    toggleChatMessage: (userIndex, timestamp, falseArray) => {
      const index =
        userIndex ?? get().chat.findIndex((elem) => elem.stamp === timestamp);
      const msg = get().chat[index];
      if (!msg) {
        return;
      }
      emit("message:toggle", {
        chatId: get().chatId,
        element: msg.stamp,
        value: !msg.filtered,
      });
      set((store) => ({ chat: toggleMessage(store.chat, index) }));
      if (falseArray) {
        falseArray.forEach((item) => {
          const fullItem = get().chat.find((elem) => elem.stamp === item);
          if (!fullItem.filtered) {
            useChatStore.getState().toggleChatMessage(undefined, item);
          }
        });
      }
    },
    setChatId: (id) => {
      emit("leave", get().chatId);
      emit("join", id);
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
    getMessages: async () => {
      const data = await API.getMessages();
      set(() => ({
        history: data,
      }));
    },
    newChat: () => {
      const newId = uuidv4();
      emit("leave", get().chatId);
      emit("join", newId);
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
  };
});

export const updateUrl = (paramKey, paramValue) => {
  let searchParams = new URLSearchParams(window.location.search);
  const existingParams = Object.fromEntries(searchParams.entries()); // Parse existing params to an object
  existingParams[paramKey] = paramValue; // Update the value for the given key
  searchParams = Object.entries(existingParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  window.history.pushState(null, null, `?${searchParams}`);
};

// get initial state
const init = () => {
  const store = useChatStore.getState();
  store.getModels();
  store.getMessages();
};

init();

export const actions = {
  selectTag: (tag) => {
    const selectedTags = useChatStore.getState().selectedTags;
    if (selectedTags.includes(tag)) {
      useChatStore.setState({
        selectedTags: selectedTags.filter((t) => t !== tag),
      });
    } else {
      useChatStore.setState({
        selectedTags: [...selectedTags, tag],
      });
    }
  },
};
