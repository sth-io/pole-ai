import React, { useState } from "react";
import {
  ImgContainer,
  Msg,
  MsgContainer,
  MsgOptions,
  StyledImg,
} from "./styled";
import { ButtonIcon } from "../LayoutComponents/Button";
import ReactMarkdown from "react-markdown";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CachedIcon from "@mui/icons-material/Cached";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import Tooltip from "@mui/material/Tooltip";
import { Container, Modal, Paper } from "@mui/material";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { trimText } from "../utils/text";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  boxShadow: 24,
  padding: 1,
};

const ConversationImage = ({ message }) => {
  const [open, setOpen] = useState(false);
  if (!message.images) {
    return null;
  }
  return (
    <>
      <MsgContainer
        style={{ opacity: message.filtered ? 0.7 : 1 }}
        role={message.role}
      >
        <ImgContainer>
          <StyledImg
            onClick={() => setOpen(true)}
            src={`data:image/png;base64,${message.images[0]}`}
            alt="user image"
          />
        </ImgContainer>
      </MsgContainer>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper sx={modalStyle}>
          <img
            style={{ maxWidth: "calc(100vw - 40px)", maxHeight: "100vh" }}
            src={`data:image/png;base64,${message.images[0]}`}
            alt="user provided"
          />
        </Paper>
      </Modal>
    </>
  );
};

const ConversationText = ({ message }) => {
  const [open, setOpen] = useState(false);
  if (!message.context) {
    return null;
  }
  return (
    <>
      <MsgContainer
        style={{ opacity: message.filtered ? 0.7 : 1 }}
        role={message.role}
      >
        <ImgContainer>
          <ReactMarkdown
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                return (
                  <SyntaxHighlighter
                    {...rest}
                    PreTag="div"
                    children={String(children).replace(/\n$/, "")}
                    language="javascript"
                    style={monokaiSublime}
                  />
                );
              },
            }}
          >
            {open ? message.context : trimText(message.context, 200)}
          </ReactMarkdown>

          <p
            style={{ textAlign: "center", cursor: 'pointer' }}
            onClick={() => setOpen((open) => !open)}
          >
            {message.context.length > 200 && `[ click to ${open ? "collapse" : "expand"} ]`}
          </p>
        </ImgContainer>
      </MsgContainer>
    </>
  );
};

export const Message = React.memo(
  ({ message, toggle, diverge, regenerate, children }) => {
    const triggerToggle = () => {
      if (toggle) {
        toggle();
      }
    };

    return (
      <>
        <ConversationImage message={message} />
        <ConversationText message={message} />
        <MsgContainer
          style={{ opacity: message.filtered ? 0.7 : 1 }}
          role={message.role}
        >
          <Msg role={message.role}>
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  return (
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      children={String(children).replace(/\n$/, "")}
                      language="javascript"
                      style={monokaiSublime}
                    />
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {children}
          </Msg>
          <MsgOptions>
            <Tooltip
              title={`Toggle - ${
                message.filtered ? "include" : "exclude"
              } this message in AI context`}
            >
              <Container disableGutters>
                <ButtonIcon
                  onClick={() => triggerToggle()}
                  transparent="true"
                  size="small"
                >
                  {message.filtered ? (
                    <RadioButtonUncheckedIcon />
                  ) : (
                    <RadioButtonCheckedIcon />
                  )}
                </ButtonIcon>
              </Container>
            </Tooltip>
            {message.role === "assistant" && (
              <Tooltip title="Diverge - start a new conversation from this point">
                <Container disableGutters>
                  <ButtonIcon
                    onClick={() => diverge(message.stamp)}
                    transparent="true"
                    size="small"
                  >
                    <AltRouteIcon />
                  </ButtonIcon>
                </Container>
              </Tooltip>
            )}
            {message.role === "assistant" && (
              <Tooltip title="Regenerate - ask system to generate new response">
                <Container disableGutters>
                  <ButtonIcon
                    onClick={() => regenerate(message.stamp)}
                    transparent="true"
                    size="small"
                  >
                    <CachedIcon />
                  </ButtonIcon>
                </Container>
              </Tooltip>
            )}
          </MsgOptions>
        </MsgContainer>
      </>
    );
  }
);
