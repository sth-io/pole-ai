import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import { useChatStore } from "../Chat/chatContext";
import { trimText } from "../utils/text";
import { ButtonIcon } from "../LayoutComponents/Button";
import { API } from "./api";
import { ManagePersona } from "./managePersona";

const ListPersonas = () => {
  const { personas, setPersona, getPersonas, persona } = useChatStore(
    ({ personas, setPersona, getPersonas, persona }) => ({
      personas,
      setPersona,
      getPersonas,
      persona,
    })
  );
  const commonStyle = { cursor: "pointer" };

  const deleteElement = async (title) => {
    await API.delete(title);
    getPersonas();
  };

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        position: "relative",
        overflow: "auto",
        maxHeight: 300,
        "& ul": { padding: 0 },
      }}
      subheader={<li />}
    >
      {personas.length === 0 &&
        `There are no Personas. Start with creating one`}
      {personas.map((item) => (
        <ListItem
          sx={{ padding: 0, borderTop: "1px solid #e5e5e5" }}
          key={`item-${item.title}}`}
          secondaryAction={
            <ButtonIcon
              transparent="true"
              edge="end"
              aria-label="delete"
              onClick={() => deleteElement(item.title)}
            >
              <DeleteIcon fontSize="small" />
            </ButtonIcon>
          }
        >
          <ListItemButton sx={{ padding: 0 }}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={persona === item.title}
                disableRipple
                inputProps={{ "aria-labelledby": item.title }}
                onClick={() =>
                  setPersona(persona === item.title ? "" : item.title)
                }
              />
              <ManagePersona title="Save" init={item} />
            </ListItemIcon>
            <ListItemText
              disableTypography
              sx={commonStyle}
              primary={<Typography>{item.title}</Typography>}
              secondary={trimText(item.content, 130)}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ListPersonas;
