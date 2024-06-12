export const emit = (id, content) => {
  window.dispatchEvent(
    new CustomEvent("sockets", {
      bubbles: true,
      detail: { id, content },
    })
  );
};

export const emitEvent = (id, text) => {
  window.dispatchEvent(
    new CustomEvent(id, {
      bubbles: true,
      detail: { content: text },
    })
  );
}