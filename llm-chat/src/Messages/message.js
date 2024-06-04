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
import { Chip, Container, Modal, Paper, Stack } from "@mui/material";
import { Highlighter } from "rc-highlight";
import { trimText } from "../utils/text";
import { Alternatives } from "./Alternatives";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  boxShadow: 24,
  padding: 1,
};

const nanoToS = (time, fixed = 1) => {
  const value = time / 1000000000;
  if (parseInt(value) !== value) {
    return value.toFixed(fixed);
  }
  return value;
};

export const MessageStats = ({ message }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "flex-end",
    }}
  >
    {message.load_duration && (
      <Tooltip
        title={`
      tokens: ${message.eval_count},
      load: ${nanoToS(message.load_duration, 4)}s,
      eval: ${nanoToS(message.prompt_eval_duration, 4)}s 
      total: ${nanoToS(message.total_duration, 4)}s
      ≈${(message.eval_count / nanoToS(message.total_duration)).toFixed(1)}t/s
      `}
      >
        <Chip
          size="small"
          label={`
                  ≈${(
                    message.eval_count / nanoToS(message.total_duration)
                  ).toFixed(1)}t/s`}
          variant="outlined"
        />
      </Tooltip>
    )}
    {message.model && (
      <Tooltip title={message.model}>
        <Chip
          size="small"
          label={`${trimText(message.model, 10)}`}
          variant="outlined"
        />
      </Tooltip>
    )}
    <Alternatives alternatives={message.alternatives} />
  </div>
);

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
                  <Highlighter
                    {...rest}
                    style={{ display: "inline-block" }}
                    code={String(children).replace(/\n$/, "")}
                    language="javascript"
                    copyToClipBoard={children && children.length > 100}
                  />
                );
              },
            }}
          >
            {open ? message.context : trimText(message.context, 200)}
          </ReactMarkdown>

          <p
            style={{ textAlign: "center", cursor: "pointer" }}
            onClick={() => setOpen((open) => !open)}
          >
            {message.context.length > 200 &&
              `[ click to ${open ? "collapse" : "expand"} ]`}
          </p>
        </ImgContainer>
      </MsgContainer>
    </>
  );
};

export const Message = React.memo(
  ({ message, toggle, diverge, regenerate, children, isLast }) => {
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
                    <Highlighter
                      {...rest}
                      style={{ display: "inline-block" }}
                      code={String(children).replace(/\n$/, "")}
                      language="javascript"
                      copyToClipBoard={children && children.length > 100}
                    />
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {children}
            {message.role === "assistant" && <MessageStats message={message} />}
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
            {message.role === "assistant" && isLast && (
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
