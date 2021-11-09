import * as React from "react";
import { useCallback } from "react";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";
import { Switch, Button, TextField,Box,Typography } from "@mui/material";


export default function PWM(props) {
  const DCChangeHandler = useCallback(({ target: { name, value } }) => {
    // console.log("DC Handler Inputs: ", name, value);
    props.setPWMDuty(name, value);
  });
  const FreqChangeHandler = useCallback(({ target: { name, value } }) => {
    // console.log("Freq Handler Inputs: ", name, value);
    props.setPWMFreq(name, value);

  });
  const SWChangeHandler = useCallback(({ target: { name, checked } }) => {
    // console.log("Switch Handler Inputs: ", name, checked);
    props.setPWMSwitch(name,checked)
    props.post_pwm(name);

  });

  const ApplyHandler = useCallback(({ target: { name, checked } }) => {
    // console.log("Switch Handler Inputs: ", name, checked);
    props.post_pwm(name);
    

  });
 
  useEffect(() => {
    // console.log(props.data);
  });
  return (
    <div>
      <Stack
        direction="row"
        spacing={1}
        alignItems="top"
        style={{ margin: 5, padding: 5 }}
      >
        <Typography style={{ "margin-top": 10 }}>{props.Title}</Typography>
        <Switch
          name={props.name}
          onChange={SWChangeHandler}
          checked={props.data.sw.value}
        />
        <TextField
          name={props.name}
          size="small"
          id="outlined-basic"
          error={props.data.duty.error}
          label="Duty Cycle"
          helperText={
            props.data.duty.helperText +
            " " +
            props.data.duty.value
          }
          value={props.data.duty.value}
          onChange={DCChangeHandler}
          type="number"
        />
        <TextField
          name={props.name}
          size="small"
          id="outlined-basic"
          label="Frequency"
          error={props.data.freq.error}
          onChange={FreqChangeHandler}
          helperText={props.data.freq.helperText}
          value={props.data.freq.value}
          type="number"
        />
        <Box sx={{ "& button": { m: 0 } }}>
          <Button
            name={props.name}
            variant="contained"
            color="success"
            onClick={ApplyHandler}
          >
            Apply
          </Button>
        </Box>
      </Stack>
    </div>
  );
}
