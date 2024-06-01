import { useEffect } from "react";
import { useChatStore, useCurrentAnswer } from "../Chat/chatContext";
import { responseToChat } from "../Chat/model";
import { socket } from "./socket";

export const Sockets = () => {
  useEffect(() => {
    socket.emit("join", useChatStore.getState().chatId);
    socket.on("chat:answer", (message) => {
      if (message?.done) {
        useCurrentAnswer.setState({ currentAnswer: "" });
        useChatStore.setState({
          chat: responseToChat(useChatStore.getState().chat, message),
        });
      } else {
        useCurrentAnswer.setState({
          currentAnswer: message?.content,
          questionSend: false,
        });
      }
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
        default:
          console.log("invalid message");
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