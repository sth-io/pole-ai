import {
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Message } from "./message";
import { ContainerStyled } from "./styled";
import { removePreviousGenerations } from "./utils";
import { useChatStore, useCurrentAnswer } from "../Chat/chatContext";
import { API } from "./api";
import { trimText } from "../utils/text";
import { Loader } from "../LayoutComponents/Loader";

const StyledStack = styled(Stack)`
  gap: 10px;
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const SystemHello = () => {
  const { personas, setPersona } = useChatStore(({ personas, setPersona }) => ({
    personas,
    setPersona,
  }));
  return (
    <Message
      message={{
        role: "system",
        content: "",
      }}
    >
      <Paper elevation={0} sx={{ p: 2 }}>
        {personas.length > 0 ? `Choose` : `Create`} a Persona to customize your
        interaction and introduce new personas for an enhanced conversational
        experience
      </Paper>
      {personas.length > 0 && (
        <StyledStack direction={"row"} justifyContent={"center"}>
          {personas.slice(-3).map((persona) => (
            <Card
              key={persona.title}
              onClick={() => {
                setPersona(persona.title);
              }}
              elevation={0}
              sx={{
                minWidth: "33%",
                background: "rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
            >
              <CardContent>
                <Typography
                  sx={{ fontSize: 14, textAlign: "center" }}
                  color="text.secondary"
                  gutterBottom
                >
                  {persona.title}
                </Typography>
                <Typography variant="body2">
                  {trimText(persona.content, 100)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </StyledStack>
      )}

      <Paper elevation={0} sx={{ p: 2 }}>
        Choose File to ask the chat about your documents, or simply start
        chatting...
      </Paper>
    </Message>
  );
};

const CurrentAnswer = ({ contentRef }) => {
  const chat = useChatStore((state) => state.chat);
  const { currentAnswer, questionSend } = useCurrentAnswer((state) => ({
    currentAnswer: state.currentAnswer,
    questionSend: state.questionSend,
  }));
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
  }, [currentAnswer, chat]);

  if (!currentAnswer && questionSend) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20px",
        }}
      >
        <Loader />
      </div>
    );
  }
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

  const messages = removePreviousGenerations(chat).filter(
    (item) => item.role !== "system"
  );
  return (
    <Box
      ref={contentRef}
      sx={{ overflow: "auto", width: "100%", paddingTop: "0px", flex: 1 }}
    >
      <ContainerStyled>
        {chat.length === 0 && <SystemHello />}
        {messages.map((msg, i) => (
          <Message
            key={msg.stamp}
            message={msg}
            diverge={diverge}
            regenerate={regenerate}
            toggle={() => toggleChatMessage(i)}
            isLast={i === messages.length - 1}
          />
        ))}
        <CurrentAnswer contentRef={contentRef} />
      </ContainerStyled>
    </Box>
  );
});
