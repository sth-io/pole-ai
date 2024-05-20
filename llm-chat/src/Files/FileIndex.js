import React, { useState } from "react";
import { Dropzone } from "@files-ui/react";
import { API } from "./api";
import { IndexContainer } from "./styled";
import {
  Chip,
  Divider,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import { ButtonSth } from "../LayoutComponents/Button";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxWidth: "90%",
  boxShadow: 24,
  padding: 4,
};

export const FileIndex = ({ model, open, handleClose }) => {
  const [path, setPath] = useState("");
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);

  const removeFile = (name) => {
    setFiles(files.filter((file) => file.name !== name));
  };

  const sendQuery = async () => {
    // upload files
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(file.name, file.file);
      });
      formData.append("model", model);
      formData.append("meta", name);

      await API.uploadFile(formData);
      setFiles([]);
    } else {
      // or post indexing path
      await API.indexFiles({ path, meta: name, model });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Paper sx={modalStyle}>
        <TextField
          id="outlined-basic"
          color="secondary"
          label="name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
        />
        <div style={{ padding: "10px 0 0 0" }}>
          <Dropzone
            onChange={setFiles}
            value={files}
            fontSize="10px"
            label={
              <Typography variant="body2">Drop text files here</Typography>
            }
            footerConfig={{
              customMessage: (
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "arial !important" }}
                >
                  Upload box accepts all files but LLMS understand text only
                </Typography>
              ),
            }}
          ></Dropzone>

          {files.length > 0 && (
            <Stack direction="row" sx={{ p: "10px 0 20px 0" }} spacing={1}>
              {files.map((file) => (
                <Chip
                  key={file.name}
                  label={file.name}
                  onDelete={() => removeFile(file.name)}
                />
              ))}
            </Stack>
          )}

          <Divider sx={{ p: "20px 0 20px 0" }}>
            Or use relative path to index a directory
          </Divider>
          {`Use this to add new files to the collection, it could be absolute path on your system or an URL to the file`}
          <IndexContainer>
            <TextField
              id="outlined-basic"
              color="secondary"
              label="path"
              variant="outlined"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              size="small"
            />

            <ButtonSth
              startIcon={<RadarIcon />}
              variant="outlined"
              onClick={() => sendQuery()}
            >
              index!
            </ButtonSth>
          </IndexContainer>
        </div>
      </Paper>
    </Modal>
  );
};
