import {
  Box,
  Chip,
  FormControl,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  tooltipClasses,
} from "@mui/material";
import React from "react";
import { OPTIONS } from "../Chat/const";
import { ButtonIcon, ButtonSth } from "../LayoutComponents/Button";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";

const countDecimals = (val) => {
  if (Math.floor(val) === val) return 0;
  return val.toString().split(".")[1].length || 0;
};

const getRandomSeed = () => {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now();
  // Generate a random number based on the timestamp
  const randomNumber = Math.floor(Math.random() * 1000000);
  // Combine the timestamp and random number to create a seed
  const seed = `${timestamp}${randomNumber}`;
  return parseInt(seed);
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
  getRandom,
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
        getAriaValueText={() =>
          value && parseFloat(value).toFixed(countDecimals(decimal ?? 0))
        }
        value={value ? value / (decimal ?? 1) : undefined}
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
  getRandom,
}) => {
  return (
    <Box>
      <Tooltip title={tooltip}>
        <Stack direction={"row"} sx={{ alignItems: 'center'}}>
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
          {getRandom && (
            <div style={{margin: '10px 0 0 0'}}>
              <ButtonIcon transparent="true" onClick={() => onChange(getRandomSeed())}>
                <ShuffleRoundedIcon  fontSize="10"/>
              </ButtonIcon>
            </div>
          )}
        </Stack>
      </Tooltip>
    </Box>
  );
};

const EnumInput = ({ label, value, onChange, tooltip, enums }) => {
  return (
    <Stack direction={"row"} sx={{ flexWrap: "wrap", gap: "6px" }}>
      <div>{label}:</div>
      {enums.map((en) => (
        <Chip
          size="small"
          key={en.label}
          label={en.label}
          onClick={() => onChange(en.value)}
          color={value === en.value ? "primary" : undefined}
        />
      ))}
    </Stack>
  );
};

const handlerMap = {
  Number: NumberControl,
  NumberInput: NumberInput,
  Enum: EnumInput,
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
