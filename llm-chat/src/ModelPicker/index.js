import { Autocomplete, IconButton, TextField } from "@mui/material";
import React, { useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useChatStore } from "../Chat/chatContext";

export const ModelPicker = ({
  setModel: propSetModel,
  model: propModel,
  trigger,
  label = "model",
}) => {
  const {
    models,
    setModel: ctxSetModel,
    getModels,
    model: ctxModel,
  } = useChatStore(({ models, setModel, getModels, model }) => ({
    models,
    setModel,
    getModels,
    model,
  }));
  const model = propModel || ctxModel;
  const setModel = propSetModel || ctxSetModel;

  useEffect(() => {
    if (trigger) {
      getModels();
    }
  }, [trigger, getModels]);

  const noModel = { value: "", label: "No model" };

  return (
    <div style={{ display: "flex" }}>
      <Autocomplete
        isOptionEqualToValue={(opt, val) => {
          return opt.value === val;
        }}
        onChange={(e, value) => {
          setModel(value ? value.value : "");
        }}
        // autocomplete complains that it couldn't match a value
        // because during initialisation we know previously selected model
        // but models list is still loading
        value={models.length === 0 ? "" : model}
        size="small"
        options={[
          noModel,
          ...models.map((col) => ({ value: col.name, label: col.name })),
        ]}
        renderInput={(params) => <TextField {...params} label={label} />}
        sx={{ flex: 1 }}
      />
      <IconButton onClick={() => getModels()}>
        <RefreshIcon size="small" />
      </IconButton>
    </div>
  );
};
