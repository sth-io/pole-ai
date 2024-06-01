export const emit = (id, content) => {
  window.dispatchEvent(
    new CustomEvent("sockets", {
      bubbles: true,
      detail: { id, content },
    })
  );
};
