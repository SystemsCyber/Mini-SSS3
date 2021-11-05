import * as React from "react";
import { useCallback } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { Switch, Button, TextField,Box,Typography,Alert   } from "@mui/material";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Pot(props) {
  const WiperChangeHandler = useCallback(({ target: { name, value } }) => {
    // console.log("Wiper Change Handler Inputs: ",name, value);
    props.setPotWiper(name, value);
  });


  const SWChangeHandler = useCallback(({ target: { name, checked } }) => {
    // console.log("Switch Handler Inputs: ", name, checked);
    // props.setPWMSwitch(name,checked)

  });
  const ApplyHandler = useCallback(({ target: { name } }) => {
    // console.log("Apply Button Handler Inputs: ", name);
    props.PostPots(name);
    

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
          error={props.data.wiper.error}
          label="Wiper Value"
          helperText={
            props.data.wiper.helperText +
            " " +
            props.data.wiper.value
          }
          value={props.data.wiper.value}
          onChange={WiperChangeHandler}
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
        <Box sx={{ "& button": { m: 1 } }}>
        {/* <Chip label={props.data.monitor.voltage}  color="primary" variant="outlined"/> */}
        
        <Alert variant="standard"  icon={false} severity="info" style={{width:130}}>{props.data.monitor.voltage  +" V" }</Alert> 
        </Box>
        
      </Stack>
    </div>
  );
}
