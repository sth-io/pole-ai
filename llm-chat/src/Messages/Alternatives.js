import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Chip,
  Container,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { Highlighter } from "rc-highlight";
import { Msg } from "./styled";
import { MessageStats } from "./message";
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import { useChatStore } from "../Chat/chatContext";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "90%",
  maxHeight: "100vh",
  overflow: "auto",
  boxShadow: 24,
  padding: '20px 0 20px 0',
  background: "#fff",

  "@media (min-width: 600px)": {
    paddingLeft: 0,
    paddingRight: 0,
  },
};

export const Alternatives = ({ alternatives }) => {
  const [open, setOpen] = useState(false);
  const toggleChatMessage = useChatStore((store) => store.toggleChatMessage);

  if (!alternatives || alternatives.length === 0) {
    return null;
  }
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container sx={modalStyle}>
          <Container
            sx={{
              width: `${
                320 * alternatives.length + 20 * alternatives.length
              }px`,
              display: "flex",
              margin: 0,
              justifyContent: "space-between",
            }}
          >
            {alternatives.map((alt, i) => (
              <div key={alt.stamp} style={{textAlign: 'center'}}>
                {alt.filtered ? (
                  <Chip
                    onClick={() =>
                      toggleChatMessage(
                        undefined,
                        alt.stamp,
                        alternatives
                          .filter((elem) => elem.stamp !== alt.stamp)
                          .map((alt) => alt.stamp)
                      )
                    }
                    icon={<RadioButtonUncheckedRoundedIcon />}
                    label={`${i}. click to select`}
                    variant="outlined"
                  />
                ) : (
                  <Chip label={`${i}. selected`} icon={<RadioButtonCheckedRoundedIcon />} />
                )}
                <Container
                  sx={{ width: 320, maxHeight: "80vh", overflowY: "auto",  textAlign: 'left'}}
                >
                  <Msg role={alt.role}>
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
                              copyToClipBoard={
                                children && children.length > 100
                              }
                            />
                          );
                        },
                      }}
                    >
                      {alt.content}
                    </ReactMarkdown>
                    {alt.role === "assistant" && <MessageStats message={alt} />}
                  </Msg>
                </Container>
              </div>
            ))}
          </Container>
        </Container>
      </Modal>
      {alternatives && alternatives.length > 0 && (
        <Chip
          size="small"
          icon={<HistoryIcon />}
          label={`${alternatives.length}`}
          variant="outlined"
          color="primary"
          onClick={() => setOpen(true)}
        />
      )}
    </>
  );
};
