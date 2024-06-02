import React from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { ButtonIcon } from "../LayoutComponents/Button";
import { FormStyled } from "./styled";
import { send, useChatStore, usePrompt, useSocket } from "../Chat/chatContext";
import { FileUploadComponent } from "./FileUpload";
import { InputAdornment, InputBase } from "@mui/material";
import { colors } from "../LayoutComponents/theme";

export const Prompt = () => {
  const { prompt, setPrompt } = usePrompt(({ prompt, setPrompt }) => ({
    prompt,
    setPrompt,
  }));
  const { chat, toggleChatMessage } = useChatStore(
    ({ chat, toggleChatMessage }) => ({
      chat,
      toggleChatMessage,
    })
  );
  // const send = useSocket((state) => state.send);

  const onKeys = (e) => {
    // use enter/return to send the message (doesn't trigger on shift+enter)
    if ((e.key === "Enter" || e.key === "Return") && e.shiftKey == false) {
      e.preventDefault();
      send(prompt)
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
