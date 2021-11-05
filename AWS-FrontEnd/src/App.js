// import {Component} from 'react';
import * as React from "react";
import "./App.css";
import { Switch } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import CSULogo from "./CSU-Ram-357-617.svg";

import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PWM from "./PWM";
import Pot from "./Pot";
import CAN_Table from "./CAN_Table";

import {
  PWMD,
  Duty,
  Freq,
  SW,
  PotD,
  Wiper,
  Monitor,
  CANData,
  CANGenData,
} from "./data";
import CAN_Gen_Table from "./CAN_Gen_Table";
import { v4 as uuidv4 } from "uuid";
const UUID = require('uuid-int');
const generator = UUID(0);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledTabs = styled(Tabs)({
  borderBottom: "1px solid #e8e8e8",
  "& .MuiTabs-indicator": {
    backgroundColor: "#1E4D2B",
  },
});

// const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
//   ({ theme }) => ({
//     textTransform: "none",
//     minWidth: 0,
//     [theme.breakpoints.up("sm")]: {
//       minWidth: 0,
//     },
//     fontWeight: theme.typography.fontWeightRegular,
//     marginRight: theme.spacing(1),
//     color: "rgba(0, 0, 0, 0.85)",
//     fontFamily: [
//       "-apple-system",
//       "BlinkMacSystemFont",
//       '"Segoe UI"',
//       "Roboto",
//       '"Helvetica Neue"',
//       "Arial",
//       "sans-serif",
//       '"Apple Color Emoji"',
//       '"Segoe UI Emoji"',
//       '"Segoe UI Symbol"',
//     ].join(","),
//     "&:hover": {
//       color: "#40a9ff",
//       opacity: 1,
//     },
//     "&.Mui-selected": {
//       color: "#1890ff",
//       fontWeight: theme.typography.fontWeightMedium,
//     },
//     "&.Mui-focusVisible": {
//       backgroundColor: "#d1eaff",
//     },
//   })
// );

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
    },
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(1),
    color: "rgba(0, 0, 0, 0.85)",
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:hover": {
      color: "#1E4D2B",
      opacity: 1,
    },
    "&.Mui-selected": {
      color: "#1E4D2B",
      fontWeight: theme.typography.fontWeightMedium,
    },
    "&.Mui-focusVisible": {
      backgroundColor: "#1E4D2B",
    },
  })
);

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));
const DC_desc = "Duty Cycle";

const pwm1 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
const pwm2 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
const pwm3 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
const pwm4 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
const pwm5 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
const pwm6 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);

const pot1 = PotD(
  Wiper(1, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
const pot2 = PotD(
  Wiper(2, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
const pot3 = PotD(
  Wiper(3, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
const pot4 = PotD(
  Wiper(4, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);

const can1 = CANData("0xDEAD", 159, 8, 1, 2, 3, 4, 5, 6, 7, 8);
// enable,ThreadName, num_messages,message_index, cycle_count,channel,tx_periodLEN, tx_delay,stop_after_count,extended, ID,DLC,B0, B1,B2,B3,B4,B5,B6,B7
const can_gen_data = CANGenData(
  0,
  0,
  "Test Thread Name",
  1,
  0,
  123,
  0,
  100,
  100,
  123,
  1,
  "0xDEAD",
  8,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ledOn: false,
      tab: 0,
      pwm: {
        "0": pwm1,
        "1": pwm2,
        "2": pwm3,
        "3": pwm4,
        "4": pwm5,
        "5": pwm6,
        // {
        //   // duty: { value: 0, error: 0, helperText: "test" },
        //   // freq: { value: 0, error: 0, helperText: "test" },
        //   // switch: { value: false, meta: "" },
        // },
        // pwm2: {
        //   duty: { value: 0, error: 0, helperText: "test" },
        //   freq: { value: 0, error: 0, helperText: "test" },
        //   switch: { value: false, meta: "" },
        // },
        // pwm3: {
        //   duty: { value: 0, error: 0, helperText: "test" },
        //   freq: { value: 0, error: 0, helperText: "test" },
        //   switch: { value: false, meta: "" },
        // },
        // pwm4: {
        //   duty: { value: 0, error: 0, helperText: "test" },
        //   freq: { value: 0, error: 0, helperText: "test" },
        //   switch: { value: false, meta: "" },
        // },
        // pwm5: {
        //   duty: { value: 0, error: 0, helperText: "test" },
        //   freq: { value: 0, error: 0, helperText: "test" },
        //   switch: { value: false, meta: "" },
        // },
        // pwm6: {
        //   duty: { value: 0, error: 0, helperText: "test" },
        //   freq: { value: 0, error: 0, helperText: "test" },
        //   switch: { value: false, meta: "" },
        // },
      },
      pots: {
        "0": pot1,
        "1": pot2,
        "2": pot3,
        "3": pot4,
      },
      can_rows: [],
      can_gen: {},
    };
    this.handleChange = this.handleChange.bind(this);
    // this.setPWMDuty = this.setPWMDuty.bind(this);
    this.setPWMSwitch = this.setPWMSwitch.bind(this);
    this.setPWMDuty = this.setPWMDuty.bind(this);
    this.setPWMFreq = this.setPWMFreq.bind(this);
    this.post_pwm = this.post_pwm.bind(this);
    this.PostPots = this.PostPots.bind(this);
    this.setPotWiper = this.setPotWiper.bind(this);
    this.setCANCell = this.setCANCell.bind(this);
    this.PostCANRow = this.PostCANRow.bind(this);
  }

  setLedState(state) {
    this.setState({
      ledOn: state !== "0",
    });
  }
  setPWMState(state) {
    this.setState({
      pwm: state,
    });
  }

  handleChange(event, newValue) {
    //console.log(event, newValue);
    this.setState({
      tab: newValue,
    });
  }

  // PWM
  setPWMState_fromResponse(state) {
    //console.log("input of setPWMstatea from response", state);
    let items = this.state.pwm;
    for (const [key, value] of Object.entries(state)) {
      let item = { ...items[key] };
      item["freq"] = {};
      for (const [key, duty] of Object.entries(value)) {
        //console.log(key, duty);
        if (!(key in item)) {
          item[key] = {};
        }
        item[key]["value"] = duty.value;
        item[key]["error"] = false;
        // item[key]["helperText"] = "teast";
        // item["freq"]["value"] = 123;
        // item["freq"]["error"] = false;
        // item["freq"]["helperText"] = "Test";
      }
      items[key] = item;
    }
    //console.log("items: ", items);
    this.setState({
      pwm: items,
    });
  }

  setPWMDuty(name, duty) {
    console.log("Input of setPWMDuty", name, duty);
    // //console.log("State:", this.state.pwm);
    let items = this.state.pwm;
    //console.log("Items:", items);
    let item = { ...items[name] };
    //console.log("Item:", item);
    item.duty.value = duty;
    if (duty > 4096 || duty < 0) {
      item.duty.error = true;
      item.duty.helperText = "value should be between 0-4096";
    } else {
      item.duty.error = false;
      item.duty.helperText = "";
      items[name] = item;
    }
    this.setState({
      pwm: items,
    });
  }

  setPWMFreq(name, freq) {
    //console.log("Input of setPWMState", name, freq);
    //console.log("State:", this.state.pwm);
    let items = this.state.pwm;
    //console.log("Items:", items);
    let item = { ...items[name] };
    //console.log("Item:", item);
    item.freq.value = freq;
    if (freq > 4096 || freq < 0) {
      item.freq.error = true;
      item.freq.helperText = "value should be between 0-4096";
      items[name] = item;
    } else {
      item.freq.error = false;
      item.freq.helperText = "";
      items[name] = item;
    }
    this.setState({
      pwm: items,
    });
  }

  setPWMSwitch(name, value) {
    // console.log("Input of setPWMSwitch", name, value);
    let items = this.state.pwm;
    //console.log("Items:", items);
    let item = { ...items[name] };
    //console.log("Item:", item);
    item.sw.value = value;
    items[name] = item;

    this.setState({
      pwm: items,
    });
    this.post_pwm();
  }

  DCChangeHandler(event) {
    //console.log("DC Handler Inputs: ", event.target.name, event.target.value);
    let value = event.target.value;
    let name = event.target.name;

    this.setPWMDuty(name, value);
  }

  SwitchHandler(event) {
    // console.log(
    //   "SwitchHandler Inputs: ",
    //   event.target.name,
    //   event.target.checked
    // );
    let value = event.target.checked;
    let name = event.target.name;

    this.setPWMSwitch(name, value);
  }

  FreqChangeHandler(event) {
    //console.log(
    //   "Freq Change Handler Inputs: ",
    //   event.target.name,
    //   event.target.value
    // );
    let value = event.target.value;
    let name = event.target.name;

    if (event.target.name === "pwm1" || event.target.name === "pwm2") {
      this.setPWMFreq("pwm1", value);
      this.setPWMFreq("pwm2", value);
    } else if (event.target.name === "pwm4" || event.target.name === "pwm5") {
      this.setPWMFreq("pwm4", value);
      this.setPWMFreq("pwm5", value);
    } else {
      this.setPWMFreq(name, value);
    }
  }

  
  async post_pwm(name) {
    // console.log("input to post_pwm: ", name);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var pots_body = this.state.pwm[name];
    var obj = {};
    obj[name] = pots_body;

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(obj),
      redirect: "follow",
    };

    let response = await fetch("/pwm", requestOptions);
    let state = await response.json();
    //console.log(state);
    this.setPWMState_fromResponse(state);
  }

  // Pots 
  setPotState_fromResponse(state) {
    //console.log("input of setPotState from response", state);
    let items = this.state.pots;
    for (const [key, value] of Object.entries(state)) {
      let item = { ...items[key] };
      for (const [key, wiper] of Object.entries(value)) {
        //console.log(key, wiper);
        if (!(key in item)) {
          item[key] = {};
        }
        item[key]["value"] = wiper.value;
        item[key]["error"] = false;
      }
      items[key] = item;
    }
    //console.log("items: ", items);
    this.setState({
      pots: items,
    });
  }

  setPotWiper(name, value) {
    // console.log("Input of setPotWiper", name, value);
    // console.log("State:", this.state.pwm);
    let items = this.state.pots;
    //console.log("Items:", items);
    let item = { ...items[name] };
    //console.log("Item:", item);
    item.wiper.value = value;
    if (value > 256 || value < 0) {
      item.wiper.error = true;
      item.wiper.helperText = "value should be between 0-256";
    } else {
      item.wiper.error = false;
      item.wiper.helperText = "";
      items[name] = item;
    }

    // console.log("items: ", items);
    this.setState({
      pots: items,
    });
  }

  async PostPots(name) {
    //console.log("input to post_pot: ", name);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var pwm_body = this.state.pots[name];

    var obj = {};
    obj[name] = pwm_body;
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(obj),
      redirect: "follow",
    };
    // //console.log(requestOptions)
    let response = await fetch("/pots", requestOptions);
    let state = await response.json();
    //console.log(state);
    this.setPWMState_fromResponse(state);

    // //console.log(this.state);
  }

  setPotMonitor_fromResponse(state) {
    // //console.log("input of setPotMonitor from response", state);
    let items = this.state.pots;
    for (const [key, value] of Object.entries(state)) {
      let item = { ...items[key] };
      for (const [key2, value] of Object.entries(value)) {
        // console.log(key, key2,value);
        // console.log(item);
        item["monitor"][key2] = value;
      }
      items[key] = item;
    }
    // console.log("item s: ", items);
    this.setState({
      pots: items,
    });
  }

  // CAN Gen
  setCANGenState_fromResponse(state) {
    // console.log("input of setCANGenState from response", state);
    let items = this.state.can_gen;
    for (const [ThreadID, value] of Object.entries(state)) {
      if (!(ThreadID in items)) {
        console.log(ThreadID + " not in items");
        items[ThreadID] = can_gen_data;
      }
      let item = { ...items[ThreadID] };
      // let item = {};
      // console.log(item);
      for (const [key, value] of Object.entries(value)) {
        // console.log(ThreadID, key,value);

        if (!(key in item)) {
          item[key] = {};
        }
        if (key == "DATA") {
          item["B0"] = value[0];
          item["B1"] = value[1];
          item["B2"] = value[2];
          item["B3"] = value[3];
          item["B4"] = value[4];
          item["B5"] = value[5];
          item["B6"] = value[6];
          item["B7"] = value[7];
        } else {
          item[key] = value;
        }
      }
      // item["ThreadID"] = ThreadID;
      // item["id"] = generator.uuid();
      item["id"] = parseInt(ThreadID);
      // console.log(item);
      // console.log("Index of : ", ThreadID,items.indexOf(item,0));
      items[ThreadID] = item;
    }
    // console.log("items: ", items);
    this.setState({
      can_gen: items,
    });
  }

  setCANCell(id, field, value) {
    // console.log("setCANCell: ",id,field,value);
    let items = [...this.state.can_gen];
    let item = { ...items[id] };
    item[field] = value;
    items[id] = item;
    // console.log(items);
    this.setState({
      can_gen: items,
    });
  }

  async PostCANRow(id) {
    // console.log("PostCANRow: ", id);
    let items = [...this.state.can_gen];
    let item = { ...items[id] };

    // console.log(items);
    item["DATA"] = [];
    // for(int i=0; i<item["DLC"]; i++) {

    // }
    item["DATA"].push(item["B0"]);
    item["DATA"].push(item["B1"]);
    item["DATA"].push(item["B2"]);
    item["DATA"].push(item["B3"]);
    item["DATA"].push(item["B4"]);
    item["DATA"].push(item["B5"]);
    item["DATA"].push(item["B6"]);
    item["DATA"].push(item["B7"]);

    //console.log("input to post_pwm: ", this.state.pwm);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var body = item;
    var raw = JSON.stringify(body);
    // console.log(raw);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let response = await fetch("/cangen", requestOptions);
    let state = await response.json();
    //console.log(state);
    this.setCANGenState_fromResponse(state);
    // this.setState({
  }

  // CAN Monitor

  setCAN_fromResponse(state) {
    ////console.log("input of setCAN from response", state);
    let items = this.state.can_rows;
    if (state) {
      for (const [key, value] of Object.entries(state)) {
        //   let item = { ...items[key] };
        //   for (const [key2, value] of Object.entries(value)) {
        // ////console.log(key);
        let item = { ...items[key] };
        if (!(key in items)) {
          ////console.log("Here");
          item = CANData(
            value.ID,
            value.count,
            value.LEN,
            value.DATA[0],
            value.DATA[1],
            value.DATA[2],
            value.DATA[3],
            value.DATA[4],
            value.DATA[5],
            value.DATA[6],
            value.DATA[7]
          );
        } else {
          item.ID = value.ID;
          item.Count = value.count;
          item.LEN = value.LEN;
          item.B0 = value.DATA[0];
          item.B1 = value.DATA[1];
          item.B2 = value.DATA[2];
          item.B3 = value.DATA[3];
          item.B4 = value.DATA[4];
          item.B5 = value.DATA[5];
          item.B6 = value.DATA[6];
          item.B7 = value.DATA[7];
        }
        // item.ID = value.ID;
        // ////console.log("item: ",item);

        //   }
        items[key] = item;
      }
    }
    // ////console.log("items: ", items);
    // this.setState({
    //   pots: items,
    // });
  }


  componentDidMount() {
    Promise.all([
      fetch("/led")
        .then((response) => response.text())
        .then((state) => this.setLedState(state)),
      fetch("/pwm")
        .then((response) => response.json())
        // .then((state) => //console.log(state)),
        .then((state) => this.setPWMState_fromResponse(state)),
      fetch("/pots")
        .then((response) => response.json())
        // .then((state) => //console.log(state)),
        .then((state) => this.setPotState_fromResponse(state)),

      fetch("/cangen")
        .then((response) => response.json())
        // .then((state) => console.log(state)),
        .then((state) => this.setCANGenState_fromResponse(state)),
    ]);
    const interval = setInterval(() => {
      this.read_voltage();
    }, 500);
    const can_interval = setInterval(() => {
      this.read_CAN();
    }, 100);
    const can_gen_interval = setInterval(() => {
      this.read_CAN_Gen();
    }, 1000);


    
  }

  async handleKeySwButton(event) {
    //console.log("input to handleStateChange2: ", event.target.checked);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var body = {
      ledOn: event.target.checked,
    };
    var raw = JSON.stringify(body);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch("/led", requestOptions);
    const state = await response.text();
    //console.log(state);
    this.setState({
      ledOn: state !== "0",
    });
    //console.log(this.state);
  }

  async read_voltage() {
    fetch("/voltage")
      .then((response) => response.json())
      .then((state) => this.setPotMonitor_fromResponse(state));
  }

  async read_CAN() {
    fetch("/can")
      .then((response) => response.json())
      .then((state) => this.setCAN_fromResponse(state));
  }

  async read_CAN_Gen() {
    fetch("/cangen")
      .then((response) => response.json())
      .then((state) => this.setCANGenState_fromResponse(state));
  }

  render() {
    return (
      <>
        <header className="App-header">
          <Stack direction="row" spacing={1} style={{ margin: 10 }}>
            <img
              src={CSULogo}
              alt="React Logo"
              width="50"
              style={{ allign: "left" }}
            />
            <h2>Smart Sensor Simulator 3</h2>
          </Stack>
        </header>
        <body className="App">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Off</Typography>
            <Switch
              checked={this.state.ledOn}
              id="ledOn"
              onChange={(event) => this.handleKeySwButton(event)}
            />
            <Typography>On</Typography>
          </Stack>
          {/* <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Off</Typography>
            <MaterialUISwitch
              onChange={(event) => this.handleStateChange(event)}
            />
            <Typography>On</Typography>
          </Stack> */}

          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={this.state.tab}
                onChange={this.handleChange}
                aria-label="basic tabs example"
                variant="fullWidth"
              >
                <Tab label="PWM" {...a11yProps(0)} />
                <Tab label="Potentiometer" {...a11yProps(1)} />
                <Tab label="CAN" {...a11yProps(2)} />
                <Tab label="CAN Message Generator" {...a11yProps(3)} />
              </Tabs>
            </Box>
            <TabPanel value={this.state.tab} index={0}>
              <PWM
                name="0"
                data={this.state.pwm["0"]}
                Title={"PWM1"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="1"
                data={this.state.pwm["1"]}
                Title={"PWM2"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="2"
                data={this.state.pwm["2"]}
                Title={"PWM3"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="3"
                data={this.state.pwm["3"]}
                Title={"PWM4"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="4"
                data={this.state.pwm["4"]}
                Title={"PWM5"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="5"
                data={this.state.pwm["5"]}
                Title={"PWM6"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                setPWMSwitch={this.setPWMSwitch}
                post_pwm={this.post_pwm}
              />
            </TabPanel>
            <TabPanel value={this.state.tab} index={1}>
              <Pot
                name="0"
                Title={"Pot1"}
                data={this.state.pots["0"]}
                PostPots={this.PostPots}
                setPotWiper={this.setPotWiper}
              />
              <Pot
                name="1"
                Title={"Pot2"}
                data={this.state.pots["1"]}
                PostPots={this.PostPots}
                setPotWiper={this.setPotWiper}
              />
              <Pot
                name="2"
                Title={"Pot3"}
                data={this.state.pots["2"]}
                PostPots={this.PostPots}
                setPotWiper={this.setPotWiper}
              />
              <Pot
                name="3"
                Title={"Pot4"}
                data={this.state.pots["3"]}
                PostPots={this.PostPots}
                setPotWiper={this.setPotWiper}
              />
            </TabPanel>
            <TabPanel value={this.state.tab} index={2}>
              <CAN_Table data={this.state.can_rows}></CAN_Table>
            </TabPanel>
            <TabPanel value={this.state.tab} index={3}>
              <CAN_Gen_Table
                data={this.state.can_gen}
                setCANCell={this.setCANCell}
                PostCANRow={this.PostCANRow}
              ></CAN_Gen_Table>
            </TabPanel>
          </Box>
        </body>
      </>
    );
  }
}

export default App;
