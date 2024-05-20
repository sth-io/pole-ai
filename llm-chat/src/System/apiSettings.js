import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const apis = [
  { name: "chroma", label: "chroma server", default: "http://localhost:8101" },
  { name: "ollama", label: "ollama server", default: "http://localhost:11434" },
];

export const APISettings = () => {
  return (
    <Box
      sx={{ maxWidth: "300px", "& .MuiTextField-root": { m: 1 } }}
      component="form"
      noValidate
      autoComplete="off"
    >
      <Typography variant="h6">API endpoints</Typography>
      <Typography sx={{ fontSize: 14 }} gutterBottom>
        Pole does not run inference engines on it's own. To make use of the LLM
        you'll need to connect to API. Currently it only supports Ollama, others
        are on the roadmap.
      </Typography>
      Chroma is needed as a vector storage for file indexing.
      <Typography sx={{ fontSize: 14 }} gutterBottom></Typography>
      {apis.map((store) => (
        <TextField
          key={store.name}
          id={store.name}
          label={store.label}
          defaultValue={store.default}
        />
      ))}
    </Box>
  );
};
