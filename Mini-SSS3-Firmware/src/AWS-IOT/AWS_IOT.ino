

/* SECRET_ fields are in arduino_secrets.h included above
 * if using a WiFi board (Arduino MKR1000, MKR WiFi 1010, Nano 33 IoT, UNO
 * WiFi Rev 2 or ESP8266/32), create a WiFiConnectionHandler object by adding
 * Network Name (SECRET_SSID) and password (SECRET_PASS) in the arduino_secrets.h
 * file (or Secrets tab in Create Web Editor).
 *
 *    WiFiConnectionHandler conMan(SECRET_SSID, SECRET_PASS);
 *
 * If using a MKR GSM 1400 or other GSM boards supporting the same API you'll
 * need a GSMConnectionHandler object as follows
 *
 *    GSMConnectionHandler conMan(SECRET_PIN, SECRET_APN, SECRET_GSM_USER, SECRET_GSM_PASS);
 *
 * If using a MKR NB1500 you'll need a NBConnectionHandler object as follows
 *
 *    NBConnectionHandler conMan(SECRET_PIN);
 */
#include "Arduino_DebugUtils.h"

#include "Mini_SSS3_board_defs_rev_2.h"
#include "Arduino_DebugUtils.h"
#include <ArduinoBearSSL.h>
#include <ArduinoECCX08.h>
#include <ArduinoMqttClient.h>
#include <TimeLib.h>
#include "arduino_secrets.h"
#include <Ethernet.h>
#include <SPI.h>
time_t RTCTime;
#define ARDUINO_ETHERNET_SHIELD
#define BOARD_HAS_ECCX08

EthernetClient client;
BearSSLClient sslClient(client); // Used for SSL/TLS connection, integrates with ECC508
MqttClient mqttClient(sslClient);
char server[] = "google.com"; // name address for Google (using DNS)
const char broker[] = SECRET_BROKER;
const char *certificate = SECRET_CERTIFICATE;
unsigned long lastMillis = 0;

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
}

void publishMessage()
{
  Serial.println("Publishing message");

  // send message, the Print interface can be used to set the message contents
  mqttClient.beginMessage("arduino/outgoing");
  mqttClient.print("hello ");
  mqttClient.print(millis());
  mqttClient.endMessage();
}

void onMessageReceived(int messageSize)
{
  // we received a message, print out the topic and contents
  Serial.print("Received a message with topic '");
  Serial.print(mqttClient.messageTopic());
  Serial.print("', length ");
  Serial.print(messageSize);
  Serial.println(" bytes:");

  // use the Stream interface to print the contents
  while (mqttClient.available())
  {
    Serial.print((char)mqttClient.read());
  }
  Serial.println();

  Serial.println();
}

void setup()
{
  byte mac[6];
  for (uint8_t by = 0; by < 2; by++)
    mac[by] = (HW_OCOTP_MAC1 >> ((1 - by) * 8)) & 0xFF;
  for (uint8_t by = 0; by < 4; by++)
    mac[by + 2] = (HW_OCOTP_MAC0 >> ((3 - by) * 8)) & 0xFF;
  setPinModes();
  SPI.begin();
  Ethernet.init(14); // Most Arduino shields

  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  Debug.timestampOn();
  Debug.setDebugLevel(DBG_DEBUG);

  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  // start the Ethernet connection and the server:

  if (!ECCX08.begin())
  {
    //debug.print(DBG_WARNING, "No ECCX08 present!");
    while (1)
      ;
  }

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
  // print your local IP address:
  //debug.print(DBG_INFO,"MAC: %02x:%02x:%02x:%02x:%02x:%02x\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.println();
  //debug.print(DBG_INFO,"My IP address: ");
  Serial.println(Ethernet.localIP());
  // //debug.print(DBG_INFO, "DEBUG IP address: %s", String(Ethernet.localIP()));
  //  //debug.print(DBG_ERROR ,"%sString(Ethernet.localIP()));

  Serial.begin(9600);
  /* Give a few seconds for the Serial connection to be available */
  delay(4000);

  // conMan.addCallback(NetworkConnectionEvent::CONNECTED, onNetworkConnect);
  // conMan.addCallback(NetworkConnectionEvent::DISCONNECTED, onNetworkDisconnect);
  // conMan.addCallback(NetworkConnectionEvent::ERROR, onNetworkError);
  ArduinoBearSSL.onGetTime(getTime);
  sslClient.setEccSlot(0, certificate);
  mqttClient.onMessage(onMessageReceived);
}
void loop()
{
  /* The following code keeps on running connection workflows on our
   * ConnectionHandler object, hence allowing reconnection in case of failure
   * and notification of connect/disconnect event if enabled (see
   * addConnectCallback/addDisconnectCallback) NOTE: any use of delay() within
   * the loop or methods called from it will delay the execution of .update(),
   * which might not guarantee the correct functioning of the ConnectionHandler
   * object.
   */


  if (!mqttClient.connected()) {
    // MQTT client is disconnected, connect
    connectMQTT();
  }

  // poll for new MQTT messages and send keep alive
  mqttClient.poll();

  // publish a message roughly every 5 seconds.
  if (millis() - lastMillis > 5000) {
    lastMillis = millis();

    publishMessage();
  }
}

void onNetworkConnect()
{
  //debug.print(DBG_INFO,">>>> CONNECTED to network");
  Serial.print("My IP address: ");
  Serial.println(Ethernet.localIP());
}

void onNetworkDisconnect()
{
  //debug.print(DBG_WARNING,">>>> DISCONNECTED from network");
}

void onNetworkError()
{
  //debug.print(DBG_ERROR,">>>> ERROR");
}