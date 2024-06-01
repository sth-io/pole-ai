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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxWidth: "90%",
  maxHeight: "100vh",
  overflow: "auto",
  boxShadow: 24,
  padding: 4,
};

export const Alternatives = ({ alternatives }) => {
  const [open, setOpen] = useState(false);

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
        <Paper sx={modalStyle}>
          {alternatives.map((alt, i) => (
            <>
              <Typography>{i}</Typography>
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
                          copyToClipBoard={children && children.length > 100}
                        />
                      );
                    },
                  }}
                >
                  {alt.content}
                </ReactMarkdown>
                {alt.role === "assistant" && <MessageStats message={alt} />}
              </Msg>
            </>
          ))}
        </Paper>
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
