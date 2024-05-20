import styled from "styled-components"
import { colors } from "../LayoutComponents/theme"

export const InputStyled = styled.textarea`
  border: 1px solid ${colors.base};
  padding: 5px;
  border-radius: 5px;
  flex: 2
`
export const FormStyled = styled.form`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
  max-width: 800px;
  margin: auto;
  width: 100%;
`
export const ScrollToBottom = styled.div`
  padding: 0 0 0 10px;
  margin: auto 0 10px 0;
`;