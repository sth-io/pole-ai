import React from "react";
import styled from "styled-components";
import { useChatStore } from "../Chat/chatContext";
import { Autocomplete, TextField } from "@mui/material";

export const Container = styled.div`
  padding 0 0 0 0;
  clear: both;
  position: relative;
`;

export const PickPersona = () => {
  const { personas, persona, setPersona } = useChatStore(
    ({ personas, persona, setPersona }) => ({
      personas,
      persona,
      setPersona,
    })
  );
  const noPersona = { value: "", label: "No Persona" };

  return (
    <Container>
      <Autocomplete
        isOptionEqualToValue={(opt, val) => opt.value === val}
        onChange={(e, value) => {
          setPersona(value.value);
        }}
        value={persona}
        size="small"
        options={[
          noPersona,
          ...personas.map((col) => ({
            value: col.title,
            label: col.title,
          })),
        ]}
        renderInput={(params) => <TextField {...params} label="Persona" />}
        sx={{ flex: 1 }}
      />
    </Container>
  );
};
