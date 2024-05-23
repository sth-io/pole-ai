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
  assistant: 'transparent',
  user: colors.base,
  system: 'transparent',
};

const msgColors = {
  assistant: "black",
  user: "white",
  system: "#555555",
};
const msgBorders = {
  assistant: 'transparent',
  user: 'transparent',
  system: "#555555",
}

const msgFloat = {
  assistant: "left",
  user: "right",
  system: "center",
};

const msgPadding = {
  assistant: "10px 40px 10px 00px",
  user: "10px 40px 10px 40px",
  system: "10px 20px",
};

export const Msg = styled.div`
  background: ${({ role }) => msgBgs[role]};
  float: ${({ role }) => msgFloat[role]};
  color: ${({ role }) => msgColors[role]};
  padding: ${({ role }) => (role === "system" ? "10px" : "0 10px")};
  width: 100%;
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px solid ${({ role }) => msgBorders[role]};
`;

export const MsgOptions = styled.div`
  position: absolute;
  right: 0;
  top: 10px;
  opacity: 0;
  transition: opacity 0.6s;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

export const MsgContainer = styled.div`
  padding: ${({ role }) => msgPadding[role]};
  clear: both;
  position: relative;

  &:hover ${MsgOptions} {
    opacity: 1;
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
