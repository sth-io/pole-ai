import { Alert, Stack } from "@mui/material";
import React from "react";
import { useStatusSnackbar } from "./store";

const SEVERITY_MAP = {
  ok: "success",
  status: "info",
  warning: "warning",
  error: "error",
};

export const StatusSnackbar = () => {
  const { status, removeElem } = useStatusSnackbar(
    ({ status, removeElem }) => ({
      status,
      removeElem,
    })
  );

  const statusToSeverity = (status) => {
    const result = SEVERITY_MAP[status];
    if (!status || !result) {
      return SEVERITY_MAP.status;
    }
    return result;
  };

  return (
    <>
      <Stack
        spacing={2}
        sx={{ maxWidth: 300, position: "fixed", right: 10, top: 10 }}
      >
        {status.map((elem) => (
          <Alert
            key={elem.id}
            severity={statusToSeverity(elem.status)}
            variant="filled"
            sx={{}}
            onClose={() => {
              removeElem(elem.id);
            }}
          >
            {elem.msg}
          </Alert>
        ))}
      </Stack>
    </>
  );
};
