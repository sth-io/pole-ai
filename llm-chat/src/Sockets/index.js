import { useEffect } from "react";
import { useChatStore, useCurrentAnswer, usePrompt } from "../Chat/chatContext";
import { responseToChat } from "../Chat/model";
import { socket } from "./socket";
import { useStatusSnackbar } from "../Snackbar/store";
import { emitEvent } from "./eventBus";
import { actions as StatusActions } from "../Chat/Status";

export const Sockets = () => {
  useEffect(() => {
    socket.emit("join", useChatStore.getState().chatId);

    socket.on("chat:streaming", (message) => {
      usePrompt.setState(() => ({ isStreaming: message.isStreaming }));
    });

    socket.on("snack", (message) => {
      useStatusSnackbar.getState().addElem(message);
    });

    socket.on("chat:new", (message) => {
      const history = [...useChatStore.getState().history];
      history.push(message);
      useChatStore.setState(() => ({
        history,
      }));
    });

    socket.on("update_history", (history) => {
      useChatStore.setState(() => ({
        history,
      }));
    });

    socket.on("chat:answer", (message) => {
      if (message?.done) {
        useCurrentAnswer.setState({ currentAnswer: "" });
        useChatStore.setState({
          chat: responseToChat(useChatStore.getState().chat, message),
        });
      } else {
        emitEvent("tts:chunks", message.chunk);
        useCurrentAnswer.setState({
          currentAnswer: message?.content,
          questionSend: false,
        });
      }
    });

    socket.on("chat:status", (message) => {
      console.log({ message });
      StatusActions.setStatus(message);
    });
    socket.on("tags", (message) => {
      useChatStore.setState({ tags: message.message });
    });

    const handler = ({ detail }) => {
      if (!detail) {
        return;
      }
      const { id, content } = detail;
      switch (id) {
        case "join":
          socket.emit(id, content);
          break;
        case "leave":
          socket.emit(id, content);
          break;
        case "chat:q":
          socket.emit(id, content);
          break;
        case "message:toggle":
          socket.emit(id, content);
          break;
        case "chat:cancel":
          usePrompt.setState(() => ({ isStreaming: false }));
          socket.emit(id, content);
          break;
        case "tags:add":
          socket.emit(id, content);
          break;
        case "tags:remove":
          socket.emit(id, content);
          break;
        case "chat:change":
          socket.emit(id, content);
          break;
        default:
          console.log(`invalid message ${id}: ${JSON.stringify(detail)}`);
      }
    };

    window.addEventListener("sockets", handler);

    return () => {
      window.removeEventListener("sockets", handler);
      socket.removeAllListeners();
    };
  }, []);

  return <></>;
};
