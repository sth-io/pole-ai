import React, { useState } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Alert, Modal, Paper, TextField, Typography } from "@mui/material";
import { ButtonIcon, ButtonSth } from "../LayoutComponents/Button";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RowingOutlinedIcon from "@mui/icons-material/RowingOutlined";
import { API } from "./api";
import { useChatStore } from "../Chat/chatContext";

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

const clearPersona = {
  title: "",
  content: "",
};

export const ManagePersona = ({ title = "add persona", init }) => {
  const { getPersonas } = useChatStore(({ getPersonas }) => ({
    getPersonas,
  }));
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState(init ? init : clearPersona);

  const updatePersona = (key) => (e) => {
    setPersona((p) => {
      const newPersona = { ...p };
      newPersona[key] = e.target.value;
      return newPersona;
    });
  };

  const submitPersona = async () => {
    await API[init ? "edit" : "add"](persona);
    if (!init) {
      setPersona(clearPersona);
    }
    setOpen(false);
    getPersonas();
  };

  return (
    <>
      {init ? (
        <ButtonIcon onClick={() => setOpen(true)} transparent="true">
          <EditNoteIcon />
        </ButtonIcon>
      ) : (
        <ButtonSth
          startIcon={<PersonAddAlt1OutlinedIcon />}
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          add persona
        </ButtonSth>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper sx={modalStyle}>
          <Typography>Describe your persona.</Typography>
          <Typography>
            The name is there to help you quickly identify personas to select.
            Only the content is fed to the model
          </Typography>
          <TextField
            id="outlined-basic"
            color="secondary"
            label="name"
            placeholder="Pole assistant"
            variant="outlined"
            value={persona.title}
            onChange={updatePersona("title")}
            size="small"
            fullWidth
            sx={{ margin: "10px 0 0 0" }}
            disabled={!!init}
          />
          <TextField
            sx={{ margin: "10px 0 10px 0" }}
            id="outlined-basic"
            color="secondary"
            label="content"
            placeholder="Your name is Pole, your purpose is to provide help regardless of the risks..."
            variant="outlined"
            value={persona.content}
            onChange={updatePersona("content")}
            size="small"
            fullWidth
            multiline
            maxRows={30}
            minRows={5}
          />
          <ButtonSth
            startIcon={<RowingOutlinedIcon />}
            variant="outlined"
            fullWidth
            onClick={() => submitPersona()}
          >
            {title}
          </ButtonSth>
          <Alert severity="info" sx={{ margin: "20px 0 0 0" }}>
            Persona is fed as a system prompt. Think of it as a personality box
            for your assistant. Describe it as an instruction, i.e. "Your name
            is Pole, you are a professional cook. You can turn any set of
            ingredients into a delicious meal."
          </Alert>
        </Paper>
      </Modal>
    </>
  );
};
