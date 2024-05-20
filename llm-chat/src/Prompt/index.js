import React, { useState } from "react";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { ButtonIcon } from "../LayoutComponents/Button";
import { FormStyled, ScrollToBottom } from "./styled";
import { useChatStore, useCurrentAnswer } from "../Chat/chatContext";

const ToggleAutoscroll = () => {
  const [autoScroll, setAutoScroll] = useCurrentAnswer((state) => [
    state.autoScroll,
    state.setAutoScroll,
  ]);
  return (
    <ScrollToBottom style={{ opacity: autoScroll ? 1 : 0.7 }}>
      <ButtonIcon onClick={() => setAutoScroll(!autoScroll)}>
        <VerticalAlignBottomIcon />
      </ButtonIcon>
    </ScrollToBottom>
  );
};

export const Prompt = ({ autoScroll, setAutoScroll }) => {
  const [prompt, setPrompt] = useState("");
  const { send, chat, toggleChatMessage } = useChatStore(
    ({ send, chat, toggleChatMessage }) => ({
      send,
      chat,
      toggleChatMessage,
    })
  );

  const onKeys = (e) => {
    // use enter/return to send the message (doesn't trigger on shift+enter)
    if ((e.key === "Enter" || e.key === "Return") && e.shiftKey == false) {
      e.preventDefault();
      send(prompt);
      setPrompt("");
    }

    // revert last messages on arrow up
    if (e.key === "ArrowUp" && !prompt && chat.length > 0) {
      const userMsgs = chat.filter((msg) => msg.role === "user");
      const lastMsg = userMsgs[userMsgs.length - 1];
      setPrompt(lastMsg.content);
      toggleChatMessage(chat.length - 1);
      toggleChatMessage(chat.length - 2);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <FormStyled
        sx={{ marginLeft: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          send(prompt);
          setPrompt("");
        }}
      >
        <TextField
          sx={{
            ml: 1,
            flex: 1,
            background: "white",
            borderRadius: "4px 0 0 4px",
          }}
          id="outlined-multiline-flexible"
          multiline
          maxRows={10}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKeys}
          value={prompt}
          variant="outlined"
        />
        <IconButton
          variant="dashed"
          type="submit"
          sx={{ background: "white", borderRadius: "0 10px 10px 0", p: "10px" }}
          aria-label="search"
        >
          <SendRoundedIcon />
        </IconButton>
        <ToggleAutoscroll />
      </FormStyled>
    </div>
  );
};
