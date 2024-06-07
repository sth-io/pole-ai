import {
  Box,
  FormControl,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { OPTIONS } from "../Chat/const";
import { ButtonIcon, ButtonSth } from "../LayoutComponents/Button";

const countDecimals = (val) => {
  if (Math.floor(val) === val) return 0;
  return val.toString().split(".")[1].length || 0;
};

const NumberControl = ({
  label,
  value,
  onChange,
  tooltip,
  min,
  max,
  decimal,
  step = 1,
}) => {
  const minmax = {};
  if (min) {
    minmax.min = min;
  }
  if (max) {
    minmax.max = decimal ? max / decimal : max;
  }
  return (
    <Stack direction={"row"}>
      <Tooltip title={tooltip}>
        <Typography sx={{ minWidth: "120px" }} id="input-slider" gutterBottom>
          {label}
        </Typography>
      </Tooltip>
      <Slider
        getAriaValueText={() => value && parseFloat(value).toFixed(countDecimals(decimal ?? 0))}
        value={value ? value / (decimal ?? 1) : ""}
        onChange={(e) => onChange(e.target.value * (decimal ?? 1))}
        valueLabelDisplay="auto"
        step={step}
        {...minmax}
      />
    </Stack>
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
        <TextField
          id="outlined-basic"
          color="secondary"
          label={label}
          fullWidth
          variant="outlined"
          value={value ?? defaultValue}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          sx={{ margin: "10px 0 0 0" }}
        />
      </Tooltip>
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
        <Tooltip title="reset tuning">
          <ButtonSth
            fullWidth
            sx={{ margin: "15px 0 0 0" }}
            onClick={() => setOptions()}
          >
            reset
          </ButtonSth>
        </Tooltip>
      </FormControl>
    </>
  );
};
