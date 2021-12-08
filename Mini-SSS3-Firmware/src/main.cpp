#define ARDUINO_ETHERNET_SHIELD
#define BOARD_HAS_ECCX08
#define ARDUINOJSON_ENABLE_PROGMEM 0
#define DEBUGSERIAL

#include <Arduino.h>

// #include "Arduino_DebugUtils.h"
#include <SPI.h>
#include <Ethernet.h>
#include <aWOT.h>
#include <StaticFiles.h>
#include <ArduinoJson.h>
#include "Mini_SSS3_board_defs_rev_2.h"
#include <Microchip_PAC193x.h>
#include <FlexCAN_T4.h>
#include "CAN_Message_Threads.h"
#include <ArduinoBearSSL.h>
#include <ArduinoECCX08.h>
#include <ArduinoMqttClient.h>
#include <arduino_secrets.h>
#include <TimeLib.h>
// #include <cryptoauthlib.h>
// #include "EthernetServerSecureBearSSL.h"
#include "TeensyDebug.h"
#include "Watchdog_t4.h"
WDT_T4<WDT1> wdt;

// #include <BearSSLServer.h>

#pragma GCC optimize("O0")

int mark = 0;
void test_function()
{
  mark++;
}
time_t RTCTime;

// extern void reloadCAN();
// Enter a MAC address for your controller below.
// Newer Ethernet shields have a MAC address printed on a sticker on the shield
void publishMessage();
void publishPots();
void publishPWM();
IPAddress ip(192, 168, 1, 177);

EthernetServer server(80);
// BearSSLServer server(443);
EthernetClient client;
BearSSLClient sslClient(client); // Used for SSL/TLS connection, integrates with ECC508
MqttClient mqttClient(sslClient);
const char broker[] = SECRET_BROKER;
const char *certificate = SECRET_CERTIFICATE;
unsigned long lastMillis = 0;

bool Monitor = false;
Application app;
uint8_t buff[2048];
char buff_c[2048];
DynamicJsonDocument doc(2048);

Microchip_PAC193x PAC;

CAN_message_t msg;
StaticJsonDocument<2048> can_dict;
// bool DEBUG = true;

// CAN Threads

// extern ThreadController can_thread_controller;

// extern CanThread* can_messages;

/* AWS IOT related Functions */
extern "C"
{
  // This must exist to keep the linker happy but is never called.
  int _gettimeofday(struct timeval *tv, void *tzvp)
  {
    Serial.println("_gettimeofday dummy");
    uint64_t t = Teensy3Clock.get();
    ;                                      // get uptime in nanoseconds
    tv->tv_sec = t / 1000000000;           // convert to seconds
    tv->tv_usec = (t % 1000000000) / 1000; // get remaining microseconds
    return 0;                              // return non-zero for error
  }                                        // end _gettimeofday()
}

unsigned long getTime()
{
  return Teensy3Clock.get();
}

bool parse_response(uint8_t *buffer)
{
  // Serial.print((char *)buffer);
  // Serial.println(" EOF");
  //Serial.println("parse_response");

  DeserializationError error = deserializeJson(doc, buffer);
  serializeJsonPretty(doc, Serial);

  if (error)
  {
    //debug.print(DBG_ERROR, "deserializeJson() failed: ");
    // Serial.println(error.f_str());
    return false;
  }

  return true;
}

void readKeySw(Request &req, Response &res)
{
  if (DEBUG)
    Serial.print("Got GET Request for LED returned: ");
  if (DEBUG)
    Serial.println(ignitionCtlState);
  res.print(ignitionCtlState);
}

void set_keySw(bool value)
{
  ignitionCtlState = value;
  redLEDstate = value;

  digitalWrite(redLEDpin, redLEDstate);           // Remove Later
  digitalWrite(ignitionCtlPin, ignitionCtlState); // Remove Later
}

void updateKeySw(Request &req, Response &res)
{

  // JsonObject& config = jb.parseObject( &req);
  if (DEBUG)
    Serial.print("Got POST Request for LED: ");
  req.body(buff, sizeof(buff));
  if (!parse_response(buff))
  {
    res.print("Not a valid Json Format");
  }
  else
  {
    bool state = doc["ledOn"];
    set_keySw(state);
    mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
    StaticJsonDocument<256> update;
    update["state"]["reported"]["KeyOn"]["value"] = state;
    serializeJson(update, mqttClient);
    mqttClient.endMessage();
    return readKeySw(req, res);
  }
  // return readKeySw(req, res);
}

DynamicJsonDocument getStatus_Pots()
{
  DynamicJsonDocument response(2048);
  for (int i = 0; i < 4; i++)
  {
    response[String(i)]["wiper"]["value"] = SPIpotWiperSettings[i];
    response[String(i)]["sw"]["value"] = 0;
    response[String(i)]["sw"]["meta"] = "TBD";
  }

  return response;
}

DynamicJsonDocument getStatus_PWM()
{
  DynamicJsonDocument response(2048);
  for (int i = 0; i < numPWMs; i++)
  {
    response[String(i)]["duty"]["value"] = pwmValue[i];
    response[String(i)]["freq"]["value"] = pwmFrequency[i];
    response[String(i)]["sw"]["value"] = 1;
  }
  return response;
}

DynamicJsonDocument getStatus_PAC()
{
  DynamicJsonDocument response(2048);
  PAC.UpdateVoltage();

  response["0"]["voltage"] = PAC.Voltage1 / 1000;
  response["0"]["current"] = -1;
  response["1"]["voltage"] = PAC.Voltage2 / 1000;
  response["1"]["current"] = -1;
  response["2"]["voltage"] = PAC.Voltage4 / 1000;
  response["2"]["current"] = -1;
  response["3"]["voltage"] = PAC.Voltage3 / 1000;
  response["3"]["current"] = -1;

  return response;
}

void readPots(Request &req, Response &res)
{
  char json[2048];
  //debug.print(DBG_INFO, "Got GET Request for Potentiometers, returned: ");
  serializeJsonPretty(getStatus_Pots(), json);
  //debug.print(DBG_INFO, json);
  res.print(json);
}

void readPAC1934(Request &req, Response &res)
{
  char json[2048];
  //debug.print(DBG_DEBUG, "Got GET Request for PAC1934: ");
  serializeJsonPretty(getStatus_PAC(), json);
  res.print(json);
}

void readPWM(Request &req, Response &res)
{
  char json[2048];
  //debug.print(DBG_INFO, "Got GET Request for PAC1934: ");
  serializeJsonPretty(getStatus_PWM(), json);
  //debug.print(DBG_DEBUG, json);
  res.print(json);
}

void readCAN(Request &req, Response &res)
{
  //debug.print(DBG_DEBUG, "Got GET Request for Read CAN:");
  char json[2048];
  serializeJsonPretty(can_dict, json);
  // if (DEBUG) Serial.println(json);
  res.print(json);
}

uint8_t MCP41HV_SetWiper(int pin, int potValue)
{
  digitalWrite(pin, LOW);
  SPI.transfer(0x00); //Write to wiper Register
  SPI.transfer(potValue);
  SPI.transfer(0x0C);                  //Read command
  uint8_t result = SPI.transfer(0xFF); //Read Wiper Register
  digitalWrite(pin, HIGH);
  return result;
}

uint8_t MCP41HV_SetTerminals(uint8_t pin, uint8_t TCON_Value)
{
  digitalWrite(pin, LOW);
  SPI1.transfer(0x40); //Write to TCON Register
  SPI1.transfer(TCON_Value + 8);
  SPI1.transfer(0x4C);                 //Read Command
  uint8_t result = SPI.transfer(0xFF); //Read Terminal Connection (TCON) Register
  digitalWrite(pin, HIGH);

  return result & 0x07;
}

void update_Pots(uint8_t idx, int value)
{
  if (value > 256)
  {
    //debug.print(DBG_WARNING, "Value: %d is out of bound setting it to 256", value);
    value = 256;
  }
  else if (value < 0)
  {
    //debug.print(DBG_WARNING, "Value: %d is out of bound setting it to 0", value);
    value = 0;
  }

  if (idx > numSPIpots)
  {
    //debug.print(DBG_ERROR, "idx : %d is out of range of numSPIpots: %d", idx, numSPIpots);
    return;
  }
  //debug.print(DBG_INFO, "Entered update_Pots function with idx: %d, value: %d: ", idx, value);
  SPIpotWiperSettings[idx] = value;
  MCP41HV_SetWiper(SPIpotCS[idx], value);
}

void updatePots(Request &req, Response &res)
{

  // JsonObject& config = jb.parseObject( &req);
  if (DEBUG)
    Serial.print("Got POST Request for Potentiometers: ");
  req.body(buff, sizeof(buff));
  if (!parse_response(buff))
  {
    //debug.print(DBG_ERROR, "Not a valid Json Format");
    res.print("Not a valid Json Format");
  }
  else
  {
    if (doc["0"])
    {
      update_Pots(0, doc["0"]["wiper"]["value"]);
    }
    if (doc["1"])
    {
      update_Pots(1, doc["1"]["wiper"]["value"]);
    }
    if (doc["2"])
    {
      update_Pots(2, doc["2"]["wiper"]["value"]);
    }
    if (doc["3"])
    {
      update_Pots(3, doc["3"]["wiper"]["value"]);
    }
    publishPots();

    return readPots(req, res);
  }
}

void update_PWM(uint8_t idx, int duty, int freq)
{
  if (idx > numPWMs)
  {
    //debug.print(DBG_ERROR, "idx : %d is out of range of numPWMs: %d", idx, numPWMs);
    return;
  }
  if (duty > 4096)
  {
    //debug.print(DBG_WARNING, "Duty: %d is out of bound setting it to 4096", duty);
    duty = 4096;
  }
  else if (duty < 0)
  {
    //debug.print(DBG_WARNING, "Duty: %d is out of bound setting it to 0", duty);
    duty = 0;
  }
  if (freq > 4096)
  {
    //debug.print(DBG_WARNING, "Frequency: %d is out of bound setting it to 4096", freq);
    freq = 4096;
  }
  else if (freq < 0)
  {
    //debug.print(DBG_WARNING, "Frequency: %d is out of bound setting it to 0", freq);
    freq = 0;
  }

  //debug.print(DBG_INFO, "Entered update_PWM function with idx: %d, duty: %d, freq: %d: ", idx, duty, freq);
  char buffer[100];
  sprintf(buffer, "Entered update_PWM function with idx: %d, duty: %d, freq: %d: ", idx, duty, freq);
  Serial.print(buffer);

  pwmValue[idx] = duty;
  pwmFrequency[idx] = freq;
  analogWrite(PWMPins[idx], duty);
  analogWriteFrequency(PWMPins[idx], freq);
}

void updatePWM(Request &req, Response &res)
{
  //debug.print(DBG_INFO, "Got POST Request for PWM: ");
  doc.clear();
  req.body(buff, sizeof(buff));
  if (!parse_response(buff))
  {
    //debug.print(DBG_ERROR, "Not a valid Json Format");
    res.sendStatus(400);
    // res.print("Not a valid Json Format");
  }
  else
  {
    //debug.print(DBG_INFO, "Got POST Request for PWM");
    Serial.print("Got POST Request for PWM: ");
    if (doc["0"])
    {

      String duty = doc["0"]["duty"]["value"];
      String freq = doc["0"]["freq"]["value"];
      int sw = doc["0"]["sw"]["value"];
      if (sw == 1)
        update_PWM(0, duty.toInt(), freq.toInt());
      else
        update_PWM(0, 0, 0);
    }
    if (doc["1"])
    {
      String duty = doc["1"]["duty"]["value"];
      String freq = doc["1"]["freq"]["value"];
      int sw = doc["1"]["sw"]["value"];
      if (sw == 1)
        update_PWM(1, duty.toInt(), freq.toInt());
      else
        update_PWM(1, 0, 0);
    }
    if (doc["2"])
    {
      String duty = doc["2"]["duty"]["value"];
      String freq = doc["2"]["freq"]["value"];
      int sw = doc["2"]["sw"]["value"];
      if (sw == 1)
        update_PWM(2, duty.toInt(), freq.toInt());
      else
        update_PWM(2, 0, 0);
    }
    if (doc["3"])
    {
      String duty = doc["3"]["duty"]["value"];
      String freq = doc["3"]["freq"]["value"];
      int sw = doc["3"]["sw"]["value"];
      if (sw == 1)
        update_PWM(3, duty.toInt(), freq.toInt());
      else
        update_PWM(3, 0, 0);
    }
    publishPWM();
    return readPWM(req, res);
    // res.print("PWM Updated");
  }
}

void connectMQTT()
{
  Serial.print("Attempting to MQTT broker: ");
  Serial.print(broker);
  Serial.println(" ");

  while (!mqttClient.connect(broker, 8883))
  {
    // failed, retry
    Serial.print(".");
    delay(5000);
  }
  Serial.println();

  Serial.println("You're connected to the MQTT broker");
  Serial.println();

  // subscribe to a topic
  mqttClient.subscribe("arduino/incoming");
  mqttClient.subscribe("update/PWM");
  mqttClient.subscribe("update/PAC");
  mqttClient.subscribe("update/Pots");
  mqttClient.subscribe("$aws/things/mini-sss3-1/shadow/get/accepted");
  mqttClient.subscribe("$aws/things/mini-sss3-1/shadow/update/accepted");

  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/get");
  mqttClient.endMessage();
  publishMessage();
}

void onMessageReceived(int messageSize)
{
  // we received a message, print out the topic and contents
  Serial.println();
  Serial.print("Received a message with topic '");
  Serial.print(mqttClient.messageTopic());
  Serial.print("', length ");
  Serial.print(messageSize);
  Serial.println(" bytes:");

  StaticJsonDocument<5000> onMessage;
  deserializeJson(onMessage, mqttClient);
  // serializeJsonPretty(onMessage, Serial);
  JsonObject root = onMessage.as<JsonObject>();

  for (JsonPair kv : root)
  {
    // Serial.println(kv.key().c_str());
    if (kv.key() == "state")
    {

      // serializeJsonPretty(kv.value(), Serial);
      JsonObject d_state = kv.value().as<JsonObject>();
      JsonObject r_state = d_state["reported"];
      for (JsonPair kw : r_state)
      {
        // //debug.print(DBG_DEBUG, "Entered 2nd for loop");
        // Serial.print(kw.key().c_str());
        // serializeJsonPretty(kw.value(), Serial);
        if (kw.key() == "Pots")
        {
          //debug.print(DBG_DEBUG, "Entered Pots");
          // serializeJsonPretty(kw.value(), Serial);
          JsonObject Pots = kw.value().as<JsonObject>();
          for (JsonPair kp : Pots)
          {
            //debug.print(DBG_INFO, "Entered 2nd for loop");

            JsonObject Pot = kp.value().as<JsonObject>();
            uint8_t val = Pot["wiper"]["value"];
            //debug.print(DBG_INFO, "got Wiper value: %d for pot%s", val, kp.key().c_str());
            update_Pots(atoi(kp.key().c_str()), val);
          }
        }
        else if (kw.key() == "PWM")
        {
        }
        else if (kw.key() == "KeyOn")
        {
          JsonObject KeyOn = kw.value().as<JsonObject>();
          bool val = KeyOn["value"];
          //debug.print(DBG_INFO, "AWS: got KeyOn value: %d ", val);
          set_keySw(val);
        }
        else if (kw.key() == "Monitor")
        {
          Monitor = kw.value();
          PAC.begin();
        }
      }
    }
    // Serial.println();
  }
}

void publishMessage()
{
  //debug.print(DBG_INFO, "Publishing message");

  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  StaticJsonDocument<2048> update;
  update["state"]["reported"]["Pots"] = getStatus_Pots();
  serializeJson(update, mqttClient);
  mqttClient.endMessage();

  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  update.clear();
  update["state"]["reported"]["PWM"] = getStatus_PWM();
  serializeJson(update, mqttClient);
  mqttClient.endMessage();

  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  update.clear();
  update["state"]["reported"]["PAC"] = getStatus_PAC();
  serializeJson(update, mqttClient);

  mqttClient.endMessage();

  // mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  // update.clear();
  // update["state"]["reported"]["KeyOn"]["value"] = ignitionCtlState;
  // serializeJson(update, mqttClient);
  // mqttClient.endMessage();
}

void publishPAC()
{
  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  StaticJsonDocument<2048> update;
  update["state"]["reported"]["PAC"] = getStatus_PAC();
  serializeJson(update, mqttClient);
  serializeJsonPretty(getStatus_PAC(), Serial);

  mqttClient.endMessage();
}

void publishPWM()
{
  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  StaticJsonDocument<2048> update;
  update["state"]["reported"]["PWM"] = getStatus_PWM();
  serializeJson(update, mqttClient);
  mqttClient.endMessage();
}

void publishPots()
{
  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  StaticJsonDocument<2048> update;
  update["state"]["reported"]["Pots"] = getStatus_Pots();
  serializeJson(update, mqttClient);
  mqttClient.endMessage();
}

void publishIP()
{
  mqttClient.beginMessage("$aws/things/mini-sss3-1/shadow/update");
  StaticJsonDocument<2048> update;
  update["state"]["reported"]["IP"] = Ethernet.localIP();
  serializeJson(update, mqttClient);
  mqttClient.endMessage();
}

void WatchdogCallback()
{
  Serial.println("YOU DIDNT FEED THE DOG, 255 CYCLES TILL RESET...");
}

void setup()
{

  Serial.begin(115200);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  // debug.begin(SerialUSB1);
  // halt();
  setPinModes();
  Wire.begin();
  SPI.begin();
  // Debug.setDebugLevel(DBG_INFO);
  PAC.begin();
  // Get burned in MAC address
  byte mac[6];
  for (uint8_t by = 0; by < 2; by++)
    mac[by] = (HW_OCOTP_MAC1 >> ((1 - by) * 8)) & 0xFF;
  for (uint8_t by = 0; by < 4; by++)
    mac[by + 2] = (HW_OCOTP_MAC0 >> ((3 - by) * 8)) & 0xFF;
  Serial.print("MAC: ");
  for (uint8_t by = 0; by < 6; by++)
    Serial.print(mac[by], HEX);
  Serial.print(":");
  Serial.println();
  Ethernet.init(14); // Most Arduino shields

  // Setup watchdog timer
  WDT_timings_t config;
  config.window = 5;   /* in seconds, 32ms to 522.232s, must be smaller than timeout */
  config.timeout = 10; /* in seconds, 32ms to 522.232s */
  config.callback = WatchdogCallback;
  wdt.begin(config);

  //setup CAN
  Can1.begin();
  Can1.setBaudRate(250000);
  Can2.begin();
  Can2.setBaudRate(250000);
  // Open serial communications and wait for port to open:

  // start the Ethernet connection and the server:
  // Ethernet.begin(mac, ip); for server
  Ethernet.begin(mac);
  // Check for Ethernet hardware present
  if (Ethernet.hardwareStatus() == EthernetNoHardware)
  {
    //debug.print(DBG_DEBUG, "Ethernet shield was not found.  Sorry, can't run without hardware. :(");
    while (true)
    {
      delay(1); // do nothing, no point running without Ethernet hardware
    }
  }
  if (Ethernet.linkStatus() == LinkOFF)
  {
    //debug.print(DBG_DEBUG, "Ethernet cable is not connected.");
  }

  //debug.print(DBG_INFO, "MAC: %02x:%02x:%02x:%02x:%02x:%02x\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.println();
  //debug.print(DBG_INFO, "My IP address: ");
  Serial.println(Ethernet.localIP());
  ArduinoBearSSL.onGetTime(getTime);
  sslClient.setEccSlot(0, certificate);
  mqttClient.onMessage(onMessageReceived);

  app.get("/led", &readKeySw);
  app.put("/led", &updateKeySw);
  app.post("/led", &updateKeySw);
  app.get("/pots", &readPots);
  app.post("/pots", &updatePots);
  app.get("/pwm", &readPWM);
  app.post("/pwm", &updatePWM);
  app.get("/voltage", &readPAC1934);
  app.get("/can", &readCAN);
  app.get("/cangen", &readCANGen);
  app.post("/cangen", &updateCANGen);
  app.route(staticFiles());
  server.begin();
  ignitionCtlState = true;
  reloadCAN();
  delay(100);
  stopCAN();
  // Serial.println("atca_delay_us");
  // atca_delay_us(100);
  // Serial.println("Running cfg_ateccx08a_i2c_default");
  // atcab_init(&cfg_ateccx08a_i2c_default);
  // atcab_init(&cfg);
  // Serial.println("Finished");
  publishMessage();
  publishIP();
}

void loop()
{
  static uint32_t feed = millis();
  // BearSSLClient client = server.available();
  EthernetClient client = server.available();

  if (!mqttClient.connected())
  {
    // MQTT client is disconnected, connect
    connectMQTT();
  }

  // poll for new MQTT messages and send keep alive
  mqttClient.poll();

  // publish a message roughly every 5 seconds.
  if (millis() - lastMillis > 1000)
  {
    lastMillis = millis();
    // Serial.print("Hello");
    // if(Monitor) publishPAC();
    // publishIP();

    // publishMessage();

    // // cfg_ateccx08a_i2c_default
  }
  if (client.connected())
  {
    app.process(&client);
  }
  if (Can1.read(msg))
  {
    digitalWrite(greenLEDpin, HIGH);
    // Serial.print("CAN1 ");
    // Serial.print("MB: "); Serial.print(msg.mb);
    char CAN_ID[32];
    itoa(msg.id, CAN_ID, 16);
    // Serial.print("  ID: 0x"); Serial.println(outputString);
    bool hasID = can_dict.containsKey(CAN_ID); // true
    if (hasID)
    {
      int count = can_dict[CAN_ID]["count"];
      can_dict[CAN_ID]["count"] = count + 1;
      can_dict[CAN_ID]["LEN"] = msg.len;
      can_dict[CAN_ID]["ID"] = CAN_ID;
      for (uint8_t i = 0; i < 8; i++)
      {
        char CAN_data[4];
        // itoa( msg.buf[i], CAN_data, 16);
        sprintf(CAN_data, "%02X", msg.buf[i]);
        can_dict[CAN_ID]["DATA"][i] = CAN_data;
      }
    }
    else
    {
      can_dict[CAN_ID]["count"] = 1;
    }
    digitalWrite(greenLEDpin, LOW);
  }
  // else if ( can2.read(msg) ) {
  //   Serial.print("CAN2 ");
  //   Serial.print("MB: "); Serial.print(msg.mb);
  //   Serial.print("  ID: 0x"); Serial.print(msg.id, HEX );
  //   Serial.print("  EXT: "); Serial.print(msg.flags.extended );
  //   Serial.print("  LEN: "); Serial.print(msg.len);
  //   Serial.print(" DATA: ");
  //   for ( uint8_t i = 0; i < 8; i++ ) {
  //     Serial.print(msg.buf[i]); Serial.print(" ");
  //   }
  //   Serial.print("  TS: "); Serial.println(msg.timestamp);
  // }
  if (Ethernet.linkStatus() == LinkOFF)
  {
    //debug.print(DBG_DEBUG, "Ethernet cable is not connected.");
  }
  else
  {
    wdt.feed();
  }
}

// // #include <ArduinoECCX08.h>
// // #include <utility/ECCX08CSR.h>
// // #include <utility/ECCX08JWS.h>

// //  byte signature[64];
// //   byte digest[32];

// //   byte publicKey[64];
// // //   byte message[32] = {
// // //   0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
// // //   0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
// // // };
// // byte message[32] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
// // void setup() {
// //   Serial.begin(9600);
// //   while (!Serial);
// //  if (!ECCX08.begin()) {
// //     Serial.println("No ECCX08 present!");
// //     while (1);
// //   }
// //   String serialNumber = ECCX08.serialNumber();
// //   Serial.print("ECCX08 Serial Number = ");
// //   Serial.println(serialNumber);
// //   Serial.println();
// //   if (!ECCX08CSR.begin(0,false)) {
// //     Serial.println("Error starting CSR generation!");
// //     while (1);
// //   }
// //   ECCX08CSR.setCountryName("US");
// //   ECCX08CSR.setStateProvinceName("CO");
// //   ECCX08CSR.setLocalityName("Fort Collins");
// //   ECCX08CSR.setOrganizationName("CSU");
// //   ECCX08CSR.setOrganizationalUnitName("SystemCyber");
// //   ECCX08CSR.setCommonName(serialNumber.c_str());
// //   String csr = ECCX08CSR.end();
// //   Serial.println("Here's your CSR generated from the private key in slot 0:");
// //   Serial.println();
// //   Serial.println(csr);
// //    // put your main code here, to run repeatedly:

// //    String publicKeyPem = ECCX08JWS.publicKey(0, false);

// //   if (!publicKeyPem || publicKeyPem == "") {
// //     Serial.println("Error generating public key!");
// //     while (1);
// //   }

// //   Serial.println("Here's your public key PEM, enjoy!");
// //   Serial.println();
// //   Serial.println(publicKeyPem);

// //   ECCX08.beginSHA256();
// //   ECCX08.updateSHA256(message);
// //   ECCX08.endSHA256(digest);
// //  Serial.println("digest = [");
// //     for (int i = 0; i < sizeof(digest) ; i++)
// //   {
// //     Serial.print("0x");
// //     if ((digest[i] >> 4) == 0) Serial.print("0"); // print preceeding high nibble if it's zero
// //     Serial.print(digest[i], HEX);
// //     if (i != 63) Serial.print(", ");
// //     if ((31 - i) % 16 == 0) Serial.println();
// //   }
// //   Serial.println("]");

// // Serial.println("message = ");
// //     for (int i = 0; i < sizeof(message) ; i++)
// //   {
// //     Serial.print("0x");
// //     if ((message[i] >> 4) == 0) Serial.print("0"); // print preceeding high nibble if it's zero
// //     Serial.print(message[i], HEX);
// //     if (i != 63) Serial.print(", ");
// //     if ((31 - i) % 16 == 0) Serial.println();
// //   }
// //   Serial.println("]");

// //    ECCX08.ecSign(0,message,signature);
// //    ECCX08.generatePublicKey(0,publicKey);
// //   Serial.println("uint8_t publicKey[64] = {");
// //     for (int i = 0; i < sizeof(publicKey) ; i++)
// //   {
// //     Serial.print("0x");
// //     if ((publicKey[i] >> 4) == 0) Serial.print("0"); // print preceeding high nibble if it's zero
// //     Serial.print(publicKey[i], HEX);
// //     if (i != 63) Serial.print(", ");
// //     if ((31 - i) % 16 == 0) Serial.println();
// //   }
// //   Serial.println("};");

// //   Serial.println("uint8_t signature[64] = {");
// //   for (int i = 0; i < sizeof(signature) ; i++)
// //   {
// //     Serial.print("0x");
// //     if ((signature[i] >> 4) == 0) Serial.print("0"); // print preceeding high nibble if it's zero
// //     Serial.print(signature[i], HEX);
// //     if (i != 63) Serial.print(", ");
// //     if ((31 - i) % 16 == 0) Serial.println();
// //   }
// //   Serial.println("};");

// // }

// // void loop() {
// // // Serial.println("uint8_t publicKey[64] = {");
// // //     for (int i = 0; i < sizeof(publicKey) ; i++)
// // //   {
// // //     Serial.print("0x");
// // //     if ((publicKey[i] >> 4) == 0) Serial.print("0"); // print preceeding high nibble if it's zero
// // //     Serial.print(publicKey[i], HEX);
// // //     if (i != 31) Serial.print(", ");
// // //     if ((31 - i) % 16 == 0) Serial.println();
// // //   }
// // //   Serial.println("};");
// // //   delay(2000);

// // }

// /*
// Alice
// */
// #include <ArduinoECCX08.h>
// byte signature[64];
// byte message[32] = {
// 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
// 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
// 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
// 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
// };
// byte publicKey[64];

// void printMessage()
// {
//   Serial.println("byte message[32] = {");
//   for (int i = 0; i < sizeof(message); i++)
//   {
//     Serial.print("0x");
//     if ((message[i] >> 4) == 0)
//       Serial.print("0"); // print preceeding high nibble if it's zero
//     Serial.print(message[i], HEX);
//     if (i != 63)
//       Serial.print(", ");
//     if ((31 - i) % 16 == 0)
//       Serial.println();
//   }
//   Serial.println("};");
// }
// void printPublicKey()
// {
//   Serial.println("byte publicKey[64] = {");
//   for (int i = 0; i < sizeof(publicKey); i++)
//   {
//     Serial.print("0x");
//     if ((publicKey[i] >> 4) == 0)
//       Serial.print("0"); // print preceeding high nibble if it's zero
//     Serial.print(publicKey[i], HEX);
//     if (i != 63)
//       Serial.print(", ");
//     if ((31 - i) % 16 == 0)
//       Serial.println();
//   }
//   Serial.println("};");
// }
// void printSignature()
// {
//   Serial.println("byte signature[64] = {");
//   for (int i = 0; i < sizeof(signature); i++)
//   {
//     Serial.print("0x");
//     if ((signature[i] >> 4) == 0)
//       Serial.print("0"); // print preceeding high nibble if it's zero
//     Serial.print(signature[i], HEX);
//     if (i != 63)
//       Serial.print(", ");
//     if ((31 - i) % 16 == 0)
//       Serial.println();
//   }
//   Serial.println("};");
// }
// void setup()
// {
//   Serial.begin(9600);
//   while (!Serial);
//   ECCX08.begin();
//   String serialNumber = ECCX08.serialNumber();
//   Serial.print("ECCX08 Serial Number = ");
//   Serial.println(serialNumber);

//   ECCX08.ecSign(0, message, signature);
//   ECCX08.generatePublicKey(0, publicKey);
//   printMessage();
//   printPublicKey();
//   printSignature();
// }
// void loop()
// {
// }

// #include <ArduinoECCX08.h>
// #include <ArduinoBearSSL.h>
// #include <utility/ECCX08CSR.h>
// #include <utility/ECCX08JWS.h>

// // // byte signature[64];
// // // byte digest[32];

// byte message[32] = {
// 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
// 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
// };

// byte publicKey[64] = {
// 0x98, 0x59, 0xFE, 0x69, 0x8D, 0x69, 0x82, 0x05, 0xEB, 0x3C, 0xCA, 0x40, 0x09, 0xC5, 0x4D, 0xA5,
// 0x01, 0xC1, 0xF9, 0x1E, 0xF5, 0x0B, 0xD3, 0x37, 0x33, 0x8F, 0xE5, 0xCE, 0xE7, 0x24, 0x83, 0xC6,
// 0x82, 0x93, 0x0A, 0x9D, 0x13, 0xAE, 0x27, 0x3B, 0xB9, 0x96, 0x3E, 0xD7, 0x82, 0x0F, 0xD7, 0xE7,
// 0xFD, 0x40, 0x9E, 0x40, 0x75, 0x6B, 0x15, 0xF2, 0x28, 0x35, 0x5C, 0x5F, 0x4D, 0x84, 0x51, 0x2D
// };

// byte signature[64] = {
// 0x8E, 0xB2, 0x5C, 0xE7, 0x7A, 0x1A, 0x2B, 0x87, 0xF7, 0x37, 0x30, 0x6A, 0x2F, 0xA9, 0xE5, 0x70,
// 0x14, 0x52, 0x7B, 0x0D, 0x36, 0xED, 0xD7, 0xB0, 0x7B, 0xA4, 0x60, 0x7F, 0xF0, 0xB9, 0xEF, 0x30,
// 0x8B, 0x9D, 0x0C, 0x69, 0x40, 0x10, 0x8D, 0xC3, 0x5B, 0x9E, 0x83, 0x07, 0x2F, 0x55, 0x65, 0xF0,
// 0x83, 0x82, 0x95, 0xBB, 0x95, 0x03, 0x76, 0x31, 0x24, 0x16, 0xED, 0x98, 0x16, 0xB4, 0x9E, 0xC3
// };

// void setup()
// {
//   Serial.begin(9600);
//   while (!Serial);
//   ECCX08.begin(0x35);
//   String serialNumber = ECCX08.serialNumber();
//   Serial.print("ECCX08 Serial Number = ");
//   Serial.println(serialNumber);

//   if(ECCX08.ecdsaVerify(message, signature, publicKey))
//   {
//     Serial.println("Signature Verified");
//   }
//   else
//   {
//     Serial.println("Signature Failed");
//   }
// }

// void loop()
// {
// }