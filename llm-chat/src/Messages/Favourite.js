import React from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { ButtonIcon } from "../LayoutComponents/Button";
import { useChatStore } from "../Chat/chatContext";
import { API } from "./api";

const isFavourite = (history, id) => {
  const chat = history.find((chat) => chat.chatId === id);
  return chat?.favourite;
};

export const Favourite = () => {
  const { history, chatId } = useChatStore(({ history, chatId }) => ({
    history,
    chatId,
  }));
  const isFav = isFavourite(history, chatId);

  return (
    <ButtonIcon
      sx={{ flex: 1 }}
      transparent="true"
      onClick={() => {
        API.toggleFav(chatId);
      }}
    >
      {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </ButtonIcon>
  );
};
