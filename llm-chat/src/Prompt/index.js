import React from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import { ButtonIcon } from "../LayoutComponents/Button";
import { FormStyled } from "./styled";
import { send, useChatStore, usePrompt, useSocket } from "../Chat/chatContext";
import { FileUploadComponent } from "./FileUpload";
import { InputAdornment, InputBase } from "@mui/material";
import { colors } from "../LayoutComponents/theme";
import { emit } from "../Sockets/eventBus";

export const Prompt = () => {
  const { prompt, setPrompt, isStreaming } = usePrompt(
    ({ prompt, setPrompt, isStreaming }) => ({
      prompt,
      setPrompt,
      isStreaming,
    })
  );
  const { chat, toggleChatMessage, chatId } = useChatStore(
    ({ chat, toggleChatMessage, chatId }) => ({
      chat,
      toggleChatMessage,
      chatId
    })
  );
  // const send = useSocket((state) => state.send);

  const submit = (e) => {
    e.preventDefault();
    if (isStreaming) {
     emit('chat:cancel', chatId) 
    } else {
      send(prompt);
      setPrompt("");
    }
  };

  const onKeys = (e) => {
    // use enter/return to send the message (doesn't trigger on shift+enter)
    if ((e.key === "Enter" || e.key === "Return") && e.shiftKey == false) {
      submit(e);
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
          submit(e);
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
              flex: 1,
              borderRadius: "5px",
              background: "white",
              p: "10px 0 10px 0",
            }}
            multiline
            maxRows={10}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeys}
            value={prompt}
            variant="outlined"
            startAdornment={
              <InputAdornment
                position="start"
                style={{ alignSelf: "flex-end" }}
              >
                <FileUploadComponent />{" "}
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end" style={{ alignSelf: "flex-end" }}>
                <ButtonIcon
                  transparent
                  size="small"
                  type="submit"
                  edge="end"
                  sx={{
                    m: "0 10px 22px 0",
                  }}
                >
                  {isStreaming ? (
                    <CancelPresentationRoundedIcon />
                  ) : (
                    <PlayArrowRoundedIcon />
                  )}
                </ButtonIcon>
              </InputAdornment>
            }
          />
        </div>
      </FormStyled>
    </div>
  );
};
