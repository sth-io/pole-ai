import { Box, TextField, Typography } from "@mui/material";
import React from "react";

const storages = [
  { name: "system", label: "system settings", default: "../db/storage" },
  { name: "messages", label: "messages store", default: "../db/messages" },
  { name: "tmp", label: "temporary data", default: "../db/tmp" },
  { name: "uploads", label: "uploads", default: "../db/uploads" },
];

export const StorageSettings = () => {
  return (
    <Box
      sx={{ maxWidth: "300px", "& .MuiTextField-root": { m: 1 } }}
      component="form"
      noValidate
      autoComplete="off"
    >
      <Typography variant="h6">Data stores</Typography>
      <Typography sx={{ fontSize: 14 }} gutterBottom>
        This defines where is all of your data stored, messages, descriptions,
        personas, uploaded files etc. Everything is stored as a JSON object for
        easy backup, inspection or even to run custom code over them
      </Typography>
      {storages.map((store) => (
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
