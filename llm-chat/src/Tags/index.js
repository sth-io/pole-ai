import React, { useEffect, useState } from "react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import { ButtonIcon, ButtonSth } from "../LayoutComponents/Button";
import { emit } from "../Sockets/eventBus";
import { actions, useChatStore } from "../Chat/chatContext";

export const Tags = () => {
  const tags = useChatStore((store) => store.tags);
  const selectedTags = useChatStore((store) => store.selectedTags);

  return (
    <div style={{ padding: "0 0 20px" }}>
      <AddTag />
      <Stack direction={"row"} sx={{ flexWrap: "wrap", gap: "6px" }}>
        {tags.map((tag) => (
          <Chip
            key={tag.tag}
            variant={selectedTags.includes(tag.tag) ? "filled" : "outlined"}
            label={tag.tag}
            onClick={() => {
              actions.selectTag(tag.tag);
            }}
            sx={{ borderColor: tag.color }}
            onDelete={() => {
              emit("tags:remove", tag);
            }}
          />
        ))}
      </Stack>
    </div>
  );
};

export const PickTags = () => {
  const [tags, getTags] = useChatStore((store) => [store.tags, store.getTags]);
  const [tag, setTag] = useState({ value: "no tag", color: "" });
  const [changeMode, setMode] = useState(false);
  const availableTags = [...tags, { tag: "no tag" }];
  const chatId = useChatStore((store) => store.chatId);
  const history = useChatStore((store) => store.history);
  const current = history.find((elem) => elem.chatId === chatId) ?? {};

  useEffect(() => {
    getTags();
  }, []);

  useEffect(() => {
    if (tag.value !== current?.tag && availableTags && availableTags.length) {
      setTag({
        value: current.tag,
        color: availableTags.find((elem) => elem.tag === current.tag)?.color,
      });
    }
  }, [current, availableTags]);

  if (changeMode) {
    return (
      <div style={{ width: "100px", display: "flex" }}>
        <Autocomplete
          sx={{ width: "100px" }}
          isOptionEqualToValue={(opt, val) => {
            return opt.value === val;
          }}
          onChange={(e, value) => {
            if (!value) {
              return;
            }
            setTag(value);
            emit("chat:change", { chatId, key: "tag", value: value.value });
            setMode(false);
            // setModel(value ? value.tag : "");
          }}
          getOptionLabel={(elem) => elem.value}
          // autocomplete complains that it couldn't match a value
          // because during initialisation we know previously selected model
          // but models list is still loading
          value={tags.length === 0 ? "" : tag}
          size="small"
          options={availableTags.map((col) => ({
            value: col.tag,
            label: col.tag,
            c: col.color,
          }))}
          renderOption={(props, option) => (
            <Chip
              {...props}
              sx={{ backgroundColor: option.c }}
              label={option.label}
            />
          )}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                sx={{ width: "100px" }}
                variant="standard"
              />
            );
          }}
        />
      </div>
    );
  }
  return (
    <Chip
      onClick={() => setMode(true)}
      label={tag.value ?? "no tag"}
      sx={{ backgroundColor: tag.color }}
    />
  );
};

const AddTag = () => {
  const [tag, setTag] = useState({ tag: "", color: "" });

  return (
    <div style={{ padding: "0 0 20px 0" }}>
      <TextField
        size="small"
        value={tag.tag}
        onChange={(e) => setTag((tag) => ({ ...tag, tag: e.target.value }))}
        id="outlined-basic"
        label="tag name"
        variant="outlined"
      />
      <MuiColorInput
        size="small"
        format="hex"
        value={tag.color}
        sx={{ width: "50px" }}
        onChange={(color) => setTag((tag) => ({ ...tag, color }))}
      />
      <ButtonIcon
        fullWidth
        onClick={() => {
          emit("tags:add", tag);
          setTag({ tag: "", color: "" });
        }}
        transparent
      >
        <AddCircleOutlineRoundedIcon />
      </ButtonIcon>
    </div>
  );
};
