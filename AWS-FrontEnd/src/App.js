// import {Component} from 'react';
import * as React from "react";
import "./App.css";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import Amplify, { Auth, PubSub, API } from "aws-amplify";
import awsconfig from "./aws-exports";
import awsExports from "./aws-exports";

import { AWSIoTProvider } from "@aws-amplify/pubsub/lib/Providers";
import AWS from "aws-sdk";
import { store } from "@risingstack/react-easy-state";

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
import CanTable from "./CanTable";
import UserInfo from "./components/widgets/user-info";
// import EventViewer from "./components/widgets/iot-message-viewer";
import {
  CANData,
  CANGenData,
  pwm1,
  pwm2,
  pwm3,
  pwm4,
  pwm5,
  pwm6,
  pot1,
  pot2,
  pot3,
  pot4,
} from "./data";
import CanGenTable from "./CanGenTable";

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
const LOCAL_STORAGE_KEY = "iot-widget";

// const UUID = require("uuid-int");
// const generator = UUID(0);

const stateKeysToSave = [
  "subscribeTopicInput",
  "publishTopicInput",
  "publishMessage",
];

const state = store({
  iotPolicy: "amplify-toolkit-iot-message-viewer", // This policy is created by this Amplify project; you don't need to change this unless you want to use a different policy.
  iotEndpoint: null, // We retrieve this when the component first loads
  message_history_limit: 1,
  message_count: 0,
  messages: [],
  subscribeTopicInput: "$aws/things/mini-sss3-1/shadow/update/accepted",
  subscribeGET: "$aws/things/mini-sss3-1/shadow/get/accepted",
  publishTopicInput: "$aws/things/mini-sss3-1/shadow/update",
  PublishGET: "$aws/things/mini-sss3-1/shadow/get",
  publishMessage: "Hello, world!",
  isSubscribed: false,
  subscribedTopic: "",
  subscription: null,
  subscriptionGET: null,
  iotProviderConfigured: false,
  flag: false,
});

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

//------------------------------------------------------------------------------
async function getIoTEndpoint() {
  // Each AWS account has a unique IoT endpoint per region. We need to retrieve this value:
  console.log("Getting IoT Endpoint...");
  const credentials = await Auth.currentCredentials();
  console.log(credentials);
  const iot = new AWS.Iot({
    region: awsExports.aws_project_region,
    credentials: Auth.essentialCredentials(credentials),
  });
  const response = await iot
    .describeEndpoint({ endpointType: "iot:Data-ATS" })
    .promise();
  state.iotEndpoint = `wss://${response.endpointAddress}/mqtt`;
  console.log(`Your IoT Endpoint is:\n ${state.iotEndpoint}`);
  configurePubSub();
}

async function configurePubSub() {
  console.log("configurePubSub.");

  if (!state.iotProviderConfigured) {
    console.log(
      `Configuring Amplify PubSub, region = ${awsExports.aws_project_region}, endpoint = ${state.iotEndpoint}`
    );
    Amplify.addPluggable(
      new AWSIoTProvider({
        aws_pubsub_region: awsExports.aws_project_region,
        aws_pubsub_endpoint: state.iotEndpoint,
      })
    );
    state.iotProviderConfigured = true;
  } else {
    console.log("Amplify IoT provider already configured.");
  }
  subscribeToTopic();
}

//------------------------------------------------------------------------------
async function attachIoTPolicyToUser() {
  // This should be the custom cognito attribute that tells us whether the user's
  // federated identity already has the necessary IoT policy attached:
  const IOT_ATTRIBUTE_FLAG = "custom:iotPolicyIsAttached";

  var userInfo = await Auth.currentUserInfo({ bypassCache: true });
  var iotPolicyIsAttached = userInfo.attributes[IOT_ATTRIBUTE_FLAG] === "true";
  console.log(userInfo);
  console.log(iotPolicyIsAttached);
  if (!iotPolicyIsAttached) {
    const apiName = "amplifytoolkit";
    const path = "/attachIoTPolicyToFederatedUser";
    const myInit = {
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
    };

    console.log(
      `Calling API GET ${path} to attach IoT policy to federated user...`
    );
    var response = await API.get(apiName, path, myInit);
    console.log(
      `GET ${path} ${response.status} response:\n ${JSON.stringify(
        response.data,
        null,
        2
      )}`
    );
    console.log(`Attached IoT Policy to federated user.`);
  } else {
    console.log(`Federated user ID already attached to IoT Policy.`);
  }
}

//------------------------------------------------------------------------------
function updateState(key, value) {
  console.log(key, value);
  state[key] = value;
  var localKey = `${LOCAL_STORAGE_KEY}-${key}`;
  localStorage.setItem(localKey, value);
}

//------------------------------------------------------------------------------
async function handleReceivedMessage(data) {
  // Received messages contain the topic name in a Symbol that we have to decode:
  // console.log("Entered Receive Message");
  const symbolKey = Reflect.ownKeys(data.value).find(
    (key) => key.toString() === "Symbol(topic)"
  );
  const publishedTopic = data.value[symbolKey];
  const message = JSON.stringify(data.value.state, null, 2);

  // console.log(`Message received on ${publishedTopic}:\n ${message}`);
  if (state.message_count >= state.message_history_limit) {
    state.messages.shift();
  } else {
    state.message_count += 1;
  }
  const timestamp = new Date().toISOString();
  state.messages.unshift(
    message
    // `${timestamp} - topic '${publishedTopic}':\n ${message}\n\n`
  );
  // this.proccessUpdateMessage(message);
  state.flag = true;
}

//------------------------------------------------------------------------------
function subscribeToTopic() {
  // Fired when user clicks subscribe button:
  if (state.isSubscribed) {
    state.subscription.unsubscribe();
    console.log(`Unsubscribed from ${state.subscribedTopic}`);
    state.isSubscribed = false;
    state.subscribedTopic = "";
  }
  state.subscription = PubSub.subscribe(state.subscribeTopicInput).subscribe({
    next: (data) => handleReceivedMessage(data),
    error: (error) => console.error(error),
    close: () => console.log("Done"),
  });
  state.subscriptionGET = PubSub.subscribe(state.subscribeGET).subscribe({
    next: (data) => handleReceivedMessage(data),
    error: (error) => console.error(error),
    close: () => console.log("Done"),
  });
  state.isSubscribed = true;
  state.subscribedTopic = state.subscribeTopicInput;
  console.log(
    `Subscribed to IoT topic ${state.subscribeTopicInput} , ${state.subscribeGET}`
  );
}

//------------------------------------------------------------------------------
function sendMessage(publishMessage) {
  // Fired when user clicks the publish button:
  PubSub.publish(state.publishTopicInput, { "state": { "reported": publishMessage}});
  console.log(`Published message to ${state.publishTopicInput}.`);
}

function getInitialStatus() {
  // Fired when user clicks the publish button:
  PubSub.publish(state.PublishGET, {});
  console.log(`Published message to ${state.PublishGET}.`);
}

function updateFormValuesFromLocalStorage() {
  for (const [key] of Object.entries(state)) {
    if (stateKeysToSave.includes(key)) {
      console.log(`Getting ${key} from local storage...`);
      var localStorageValue = localStorage.getItem(
        `${LOCAL_STORAGE_KEY}-${key}`
      );

      if (localStorageValue) {
        // Convert true or false strings to boolean (needed for checkboxes):
        if (["true", "false"].includes(localStorageValue)) {
          localStorageValue = localStorageValue === "true";
        }
        //console.log(`Setting ${key} = `, localStorageValue);
        state[key] = localStorageValue;
        console.log("value = " + localStorageValue);
      }
    }
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      KeyOn: false,
      tab: 0,
      pwm: {
        0: pwm1,
        1: pwm2,
        2: pwm3,
        3: pwm4,
        4: pwm5,
        5: pwm6,
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
        0: pot1,
        1: pot2,
        2: pot3,
        3: pot4,
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
    this.setPotMonitor_fromResponse =
      this.setPotMonitor_fromResponse.bind(this);
    this.setPotState_fromResponse = this.setPotState_fromResponse.bind(this);
    this.setPWMState_fromResponse = this.setPWMState_fromResponse.bind(this);
  }

  setLedState(state) {
    this.setState({
      KeyOn: state !== "0",
    });
  }

  
  async handleKeySwButton(event) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var body = {
      KeyOn: event.target.checked,
    };
    var raw = JSON.stringify(body);
    sendMessage({"KeyOn": {"value": this.state.KeyOn}});
    this.setState({
      KeyOn: !event.target.checked,
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
    sendMessage({"PWM":obj});
  }

  // Pots
  setPotState_fromResponse(state) {
    console.log("input of setPotState from response", state);
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
    sendMessage({"Pots":obj});
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
        if (key === "DATA") {
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
    async function setup() {
      await getIoTEndpoint();
      await attachIoTPolicyToUser();
      setTimeout(function () {
        getInitialStatus();
      }, 100);
    }
    setup();
    updateFormValuesFromLocalStorage();
    const interval = setInterval(() => {
      this.proccessUpdateMessage();
    }, 100);
  }

  proccessUpdateMessage() {
    if (state.flag) {
      // console.log("Entered Process Update Message");
      var data = JSON.parse(state.messages);
      var reported = data.reported;
      // console.log(reported);
      if (reported.hasOwnProperty("PAC")) {
        // console.log("Entered PAC Update Message");
        this.setPotMonitor_fromResponse(data.reported.PAC);
      }
      if (reported.hasOwnProperty("PWM")) {
        console.log("Entered PWM Update Message");
        this.setPWMState_fromResponse(data.reported.PWM);
      }
      if (reported.hasOwnProperty("Pots")) {
        this.setPotState_fromResponse(data.reported.Pots);
      }

      state.flag = false;
    }
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
                <Tab label="Debug" {...a11yProps(4)} />
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
                post_pwm={this.post_pwm}
              />
              <PWM
                name="1"
                data={this.state.pwm["1"]}
                Title={"PWM2"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="2"
                data={this.state.pwm["2"]}
                Title={"PWM3"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="3"
                data={this.state.pwm["3"]}
                Title={"PWM4"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="4"
                data={this.state.pwm["4"]}
                Title={"PWM5"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
                post_pwm={this.post_pwm}
              />
              <PWM
                name="5"
                data={this.state.pwm["5"]}
                Title={"PWM6"}
                setPWMSwitch={this.setPWMSwitch}
                setPWMDuty={this.setPWMDuty}
                setPWMFreq={this.setPWMFreq}
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
              <CanTable data={this.state.can_rows}></CanTable>
            </TabPanel>
            <TabPanel value={this.state.tab} index={3}>
              <CanGenTable
                data={this.state.can_gen}
                setCANCell={this.setCANCell}
                PostCANRow={this.PostCANRow}
              ></CanGenTable>
            </TabPanel>
            <TabPanel value={this.state.tab} index={4}>
              <AmplifySignOut />
              <UserInfo />
              {/* <EventViewer
                setPotMonitor_fromResponse={this.setPotMonitor_fromResponse}
                setPotState_fromResponse={this.setPotState_fromResponse}
                setPWMState_fromResponse={this.setPWMState_fromResponse}
              /> */}
            </TabPanel>
          </Box>
        </body>
      </>
    );
  }
}

export default withAuthenticator(App);
