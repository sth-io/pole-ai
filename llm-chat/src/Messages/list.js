import React, { useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonIcon } from "../LayoutComponents/Button";
import { API } from "./api";
import { colors } from "../LayoutComponents/theme";
import { useChatStore } from "../Chat/chatContext";
import { Divider, Typography } from "@mui/material";
import { format } from "date-fns";
import { trimText } from "../utils/text";

const sortDescWithFav = (a, b) => {
  // Separate favourites and non-favourites
  if (a.favourite !== b.favourite) {
    return a.favourite === true ? -1 : 1;
  }

  // Sort by timestamp descending for both groups
  const timestampA = a.timestamp;
  const timestampB = b.timestamp;
  return timestampB - timestampA;
};

const ListHistory = ({ history, setChatId, chatId }) => {
  const commonStyle = { cursor: "pointer" };
  const deleteElement = async (chatId) => {
    await API.delete(chatId);
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
      {history.length === 0 &&
        `There's no history yet. Get chatting and this place will get full of messages.`}
      {history.map((item) => (
        <ListItem
          sx={{ padding: 0, borderTop: "1px solid #e5e5e5" }}
          key={`item-${item.chatId}}`}
          secondaryAction={
            <ButtonIcon
              transparent="true"
              edge="end"
              aria-label="delete"
              onClick={() => deleteElement(item.chatId)}
            >
              <>
                <DeleteIcon fontSize="small" />
              </>
            </ButtonIcon>
          }
        >
          <ListItemButton
            sx={{ padding: 0 }}
            onClick={() => setChatId(item.chatId)}
          >
            <ListItemText
              disableTypography
              sx={
                item.chatId === chatId
                  ? { ...commonStyle, color: colors.accent }
                  : commonStyle
              }
              primary={trimText(item.title, 110)}
              secondary={
                <Typography variant="caption" display="block">
                  {format(new Date(item.timestamp), "dd-MM-yyyy HH:mm")}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export const MessageList = ({ trigger }) => {
  const { setChatId, chatId, history } = useChatStore(
    ({ setChatId, chatId, history }) => ({
      setChatId,
      chatId,
      history,
    })
  );
  const sorted = history.sort(sortDescWithFav);

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      <Divider
        textAlign="left"
        sx={{ p: "10px 0 10px 0", background: colors.base, color: "#fff" }}
      >
        ♥ favourites
      </Divider>
      <ListHistory
        history={sorted.filter((elem) => elem.favourite)}
        setChatId={setChatId}
        chatId={chatId}
      />
      <Divider
        textAlign="left"
        sx={{ p: "10px 0 10px 0", background: colors.secondary }}
      >
        ■ regular messages
      </Divider>
      <ListHistory
        history={sorted.filter((elem) => !elem.favourite)}
        setChatId={setChatId}
        chatId={chatId}
      />
    </div>
  );
};
