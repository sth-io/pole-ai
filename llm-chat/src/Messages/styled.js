import styled from "styled-components";
import { colors } from "../LayoutComponents/theme";

export const StyledImg = styled.img`
  max-width: 400px;
  cursor: pointer;
  max-height: 150px;
`;

export const ImgContainer = styled.div`
  background: ${colors.base};
  display: inline-block;
  padding: 5px;
  border-radius: 5px;
`;

const msgBgs = {
  assistant: "transparent",
  user: "transparent",
  system: "transparent",
};

const msgColors = {
  assistant: "black",
  user: "#555555",
  system: "#555555",
};
const msgBorders = {
  assistant: "transparent",
  user: "#5297AA",
  system: "transparent",
};

const msgFloat = {
  assistant: "none",
  user: "right",
  system: "center",
};

const msgPadding = {
  assistant: "0px 40px 10px 00px",
  user: "20px 40px 0px 40px",
  system: "10px 20px",
};

export const Msg = styled.div`
  word-wrap: anywhere;
  background: ${({ role }) => msgBgs[role]};
  color: ${({ role }) => msgColors[role]};
  padding: ${({ role }) => (role === "system" ? "10px" : "0 10px")};
  display: inline-block;
  box-sizing: border-box;
  border: 1px solid ${({ role }) => msgBorders[role]};
  border-radius: 4px;

  ${({ role }) =>
    role === "assistant"
      ? `
  width: 100%;
  `
      : ""}

  ${({ role }) =>
    role === "user"
      ? `
  
  & > p {
    padding: 5px 0;
    margin: 0;
  }
  `
      : ""}
`;

export const MsgOptions = styled.div`
  position: absolute;
  right: 0;
  top: 10px;
  opacity: 0;
  transition: opacity 0.6s;
  display: flex;
  flex-direction: column;
  row-gap: 0px;
`;

export const MsgContainer = styled.div`
  padding: ${({ role }) => msgPadding[role]};
  position: relative;
  max-width: 100%;

  &:hover ${MsgOptions} {
    opacity: 1;
  }

  ${({ role }) =>
    role === "user"
      ? `
    display: flex;
    justify-content: flex-end;  
  `
      : ""}

  @media (max-width: 1024px) {
    padding: 0px !important;
  }
`;

export const ContainerStyled = styled.div`
  max-width: 800px;
  box-sizing: border-box;
  margin: auto;
  width: 100%;
  padding: 40px 20px;
  flex: 1;
  position: relative;
`;
