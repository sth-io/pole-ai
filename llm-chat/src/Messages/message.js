import React from "react";
import { Msg, MsgContainer, MsgOptions } from "./styled";
import { ButtonIcon } from "../LayoutComponents/Button";
import ReactMarkdown from "react-markdown";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CachedIcon from "@mui/icons-material/Cached";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import Tooltip from "@mui/material/Tooltip";
import { Container } from "@mui/material";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/esm/styles/hljs";

export const Message = React.memo(
  ({ message, toggle, diverge, regenerate, children }) => {
    const triggerToggle = () => {
      if (toggle) {
        toggle();
      }
    };

    return (
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
    );
  }
);
