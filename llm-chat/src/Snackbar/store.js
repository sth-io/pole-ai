import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export const useStatusSnackbar = create((set, get) => ({
  status: [],
  removeElem: (hash) => {
    const status = [...get().status];
    const idx = status.findIndex((elem) => elem.id === hash);
    if (idx === -1) {
      return;
    }
    status.splice(idx, 1);
    set(() => ({ status: status }));
  },
  addElem: (msg) => {
    const newS = [...get().status];
    const hash = uuidv4();
    newS.push({ ...msg, id: hash });
    set(() => ({ status: newS }));
    window.setTimeout(() => {
      get().removeElem(hash);
    }, msg.duration ?? 5000);
  },
}));
