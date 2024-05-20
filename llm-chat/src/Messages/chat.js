import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Message } from "./message";
import { ContainerStyled } from "./styled";
import { removePreviousGenerations } from "./utils";
import { useChatStore, useCurrentAnswer } from "../Chat/chatContext";
import { API } from "./api";

const CurrentAnswer = ({ contentRef }) => {
  const currentAnswer = useCurrentAnswer((state) => state.currentAnswer);
  const [autoScroll, setAutoScroll] = useCurrentAnswer((state) => [
    state.autoScroll,
    state.setAutoScroll,
  ]);
  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    let lastScroll = 0;
    const handleScroll = (e, y) => {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const currentScroll = scrollTop;
      if (autoScroll && currentScroll < lastScroll) {
        setAutoScroll(false);
      }
      if (
        !autoScroll &&
        currentScroll > lastScroll &&
        currentScroll > scrollHeight - clientHeight - 10
      ) {
        setAutoScroll(true);
      }
      lastScroll = currentScroll;
    };

    contentRef.current.addEventListener("scroll", handleScroll);

    return () => {
      // Cleanup: Remove the event listener when component unmounts
      contentRef.current.removeEventListener("scroll", handleScroll);
    };
  }, [autoScroll]);
  useEffect(() => {
    if (!contentRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = contentRef.current;
    if (contentRef.current && autoScroll) {
      if (
        contentRef.current &&
        autoScroll &&
        scrollTop < scrollHeight - clientHeight
      ) {
        contentRef.current.scrollTop = scrollHeight;
      }
    }
  }, [currentAnswer]);

  return currentAnswer ? (
    <Message message={{ content: currentAnswer, role: "assistant" }} />
  ) : null;
};

export const Chat = React.memo(() => {
  const {
    toggleChatMessage,
    diverge,
    chat,
    regenerate,
    getPersonas,
    setChat,
    chatId,
  } = useChatStore(
    ({
      toggleChatMessage,
      diverge,
      chat,
      regenerate,
      getPersonas,
      setChat,
      chatId,
    }) => ({
      toggleChatMessage,
      diverge,
      chat,
      regenerate,
      getPersonas,
      setChat,
      chatId,
    })
  );
  const contentRef = useRef(null);
  useEffect(() => {
    const execute = async () => {
      const history = await API.getHistory(chatId);
      if (!history.error) {
        setChat(history);
      }
      getPersonas();
    };
    execute();
  }, [chatId]);

  return (
    <Box
      ref={contentRef}
      sx={{ overflow: "auto", width: "100%", paddingTop: "0px", flex: 1 }}
    >
      <ContainerStyled>
        {chat.length === 0 && (
          <Message
            message={{
              role: "system",
              content: "",
            }}
          >
            <Typography sx={{ p: "0 0 20px" }}>
              This is the begining of the conversation.
            </Typography>
            <Typography sx={{ p: "0 0 20px" }}>
              Choose Persona to customize your interaction and introduce new
              personas for an enhanced conversational experience
            </Typography>
            <Typography sx={{ p: "0 0 20px" }}>
              Choose File to ask the chat about your documents
            </Typography>
          </Message>
        )}
        {removePreviousGenerations(chat)
          .filter((item) => item.role !== "system")
          .map((msg, i) => (
            <Message
              key={msg.stamp}
              message={msg}
              diverge={diverge}
              regenerate={regenerate}
              toggle={() => toggleChatMessage(i)}
            />
          ))}
        <CurrentAnswer contentRef={contentRef} />
      </ContainerStyled>
    </Box>
  );
});
