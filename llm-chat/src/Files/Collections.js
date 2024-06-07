import React, { useEffect, useState } from "react";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonIcon } from "../LayoutComponents/Button";
import { API } from "./api";
import { useChatStore } from "../Chat/chatContext";
import { trimText } from "../utils/text";

const commonStyle = { cursor: "pointer" };
/**
 * Display a list of collections with a picker
 * @param {trigger} boolean - triggers data pull
 */
export const Collections = ({ trigger }) => {
  const [collections, setCollections] = useState([]);
  const { collection, setCollection, ragOptions, ragOptionsSetter } =
    useChatStore(
      ({ collection, setCollection, ragOptions, ragOptionsSetter }) => ({
        collection,
        setCollection,
        ragOptions,
        ragOptionsSetter,
      })
    );

  const getCollections = async () => {
    const data = await API.getCollections();
    setCollections(data);
  };
  // pull latest collections
  useEffect(() => {
    if (trigger) {
      getCollections();
    }
  }, [trigger]);

  const deleteElement = async (collection) => {
    try {
      await API.deleteFiles(collection);
      getCollections();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: "0 0 10px 0" }}>
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
        {collections.length === 0 &&
          `There are no files. Start with indexing one`}
        {collections.map((item) => (
          <ListItem
            sx={{ padding: 0, borderTop: "1px solid #e5e5e5" }}
            key={`item-${item.name}}`}
            secondaryAction={
              <ButtonIcon
                transparent="true"
                edge="end"
                aria-label="delete"
                onClick={() => deleteElement(item.name)}
              >
                <DeleteIcon fontSize="small" />
              </ButtonIcon>
            }
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={collection === item.name}
                disableRipple
                inputProps={{ "aria-labelledby": item.name }}
                onClick={() => setCollection(item.name)}
              />
            </ListItemIcon>
            <ListItemText
              disableTypography
              sx={commonStyle}
              onClick={() => setCollection(item.name)}
              primary={<Typography>{item.name}</Typography>}
              secondary={trimText(item.content, 130)}
            />
          </ListItem>
        ))}
      </List>
      <Typography sx={{ p: "10px 0 0 0" }} variant="body2">
        Maximum provided chunks: {ragOptions.chunks}
      </Typography>
      <Slider
        label="xxs"
        value={ragOptions.chunks}
        onChange={(e) => ragOptionsSetter("chunks", e.target.value)}
        min={1}
        max={50}
      />
      <FormControlLabel
        control={
          <Switch
            checked={ragOptions.useSearch}
            onChange={(e, value) => ragOptionsSetter("useSearch", value)}
          />
        }
        label="Use search queries"
      />
    </div>
  );
};
