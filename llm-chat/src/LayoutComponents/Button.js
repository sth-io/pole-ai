import React from "react";
import IconButton from "@mui/material/IconButton";
import { Button, styled } from "@mui/material";
import { colors } from "./theme";

const StyledIconButton = styled(IconButton)((props) => ({
  background: props.transparent ? "transparent" : colors.accent,
  color: props.transparent ? colors.accent : "#fff",

  "&:hover": {
    background: colors.accent,
    color: colors.secondary,
  },
}));

const StyledButton = styled(Button)((props) => ({
  background: props.transparent ? "transparent" : colors.accent,
  color: props.transparent ? colors.accent : "#fff",

  "&:hover": {
    background: colors.accent,
    color: colors.secondary,
  },
}));

export const ButtonIcon = (props) => {
  const { children, ...other } = props;
  return <StyledIconButton {...other}>{children}</StyledIconButton>;
};

export const ButtonSth = (props) => {
  const { children, ...other } = props;
  return <StyledButton {...other}>{children}</StyledButton>;
};
