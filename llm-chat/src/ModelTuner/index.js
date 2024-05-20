import {
  Box,
  FormControl,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { OPTIONS } from "../Chat/const";
import { ButtonIcon, ButtonSth } from "../LayoutComponents/Button";

const countDecimals = (val) => {
  if(Math.floor(val) === val) return 0;
  return val.toString().split(".")[1].length || 0; 
}


const NumberControl = ({ label, value, onChange, tooltip, min, max, decimal }) => {
  const minmax = {};
  if (min) {
    minmax.min = min;
  }
  if (max) {
    minmax.max = decimal ? max / decimal : max;
  }

  return (
    <Box>
      <Tooltip title={tooltip}>
        <Typography id="input-slider" gutterBottom>
          {label} {value && ' - '} {value && parseFloat(value).toFixed(countDecimals(decimal ?? 1))}
        </Typography>
      </Tooltip>
      <Slider
        value={value ? value / (decimal ?? 1) : ''}
        onChange={(e) => onChange(e.target.value * (decimal ?? 1))}
        {...minmax}
      />
    </Box>
  );
};

const NumberInput = ({
  label,
  value,
  onChange,
  tooltip,
  defaultValue,
  name,
}) => {
  return (
    <Box>
      <Tooltip title={tooltip}>
        <Typography gutterBottom>
          {label}
        </Typography>
      </Tooltip>
      <TextField
        id="outlined-basic"
        color="secondary"
        label={label}
        variant="outlined"
        value={value ?? defaultValue}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ margin: "10px 0 0 0" }}
      />
    </Box>
  );
};
const handlerMap = {
  Number: NumberControl,
  NumberInput: NumberInput,
  // Text: TextControl,
};

export const ModelTuner = ({ model, options, setOptions }) => {
  return (
    <>
      <FormControl sx={{ display: "block", padding: "0 20px 0 10px" }}>
        <Tooltip title="reset tuning">
          <ButtonIcon sx={{ float: "right" }} onClick={() => setOptions()}>
            <RestartAltRoundedIcon />
          </ButtonIcon>
        </Tooltip>
        {Object.entries(OPTIONS).map(([name, option]) => {
          const Component = handlerMap[option.type] || handlerMap.text;
          return (
            <Component
              key={name}
              {...option}
              name={name}
              value={options[name] ?? option.default}
              onChange={(value) => setOptions(name, value)}
            />
          );
        })}
      </FormControl>
    </>
  );
};
