import React, { useState } from "react";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { ButtonIcon } from "../LayoutComponents/Button";
import { FormStyled, ScrollToBottom } from "./styled";
import { useChatStore, useCurrentAnswer, usePrompt } from "../Chat/chatContext";
import { FileUploadComponent } from "./FileUpload";
import { InputAdornment, InputBase, Paper } from "@mui/material";
import { colors } from "../LayoutComponents/theme";

const ToggleAutoscroll = () => {
  const [autoScroll, setAutoScroll] = useCurrentAnswer((state) => [
    state.autoScroll,
    state.setAutoScroll,
  ]);
  return (
    <ScrollToBottom style={{ opacity: autoScroll ? 1 : 0.7 }}>
      <ButtonIcon size="small" onClick={() => setAutoScroll(!autoScroll)}>
        <VerticalAlignBottomIcon />
      </ButtonIcon>
    </ScrollToBottom>
  );
};

export const Prompt = ({ autoScroll, setAutoScroll }) => {
  const { prompt, setPrompt } = usePrompt(({ prompt, setPrompt }) => ({
    prompt,
    setPrompt,
  }));
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
        <div
          style={{
            border: `1px solid ${colors.base}`,
            borderRadius: "5px",
            width: "100%",
            display: "flex",
          }}
        >
          <InputBase
            sx={{
              ml: 1,
              flex: 1,
              background: "white",
            }}
            multiline
            maxRows={10}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeys}
            value={prompt}
            variant="outlined"
            startAdornment={<FileUploadComponent />}
            endAdornment={
              <InputAdornment position="end">
                <ButtonIcon
                  transparent
                  size="small"
                  type="submit"
                  edge="end"
                  sx={{
                    m: "0 10px 0 0",
                  }}
                >
                  <PlayArrowRoundedIcon />
                </ButtonIcon>
              </InputAdornment>
            }
          />
        </div>
      </FormStyled>
    </div>
  );
};
