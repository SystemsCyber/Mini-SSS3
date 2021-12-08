#include <FlexCAN_T4.h>

FlexCAN_T4<CAN1, RX_SIZE_256, TX_SIZE_16> can1;
FlexCAN_T4<CAN2, RX_SIZE_256, TX_SIZE_16> can2;
CAN_message_t msg;
CAN_message_t msg1;

void setup(void) {
  can1.begin();
  can1.setBaudRate(250000);
  can2.begin();
  can2.setBaudRate(250000);
  pinMode(20, OUTPUT);
  pinMode(21, OUTPUT);
  pinMode(16, OUTPUT);
  pinMode(15, OUTPUT);
  digitalWrite(15, LOW);
  digitalWrite(16, LOW);

  digitalWrite(20, HIGH);
  delay(1000);
  digitalWrite(16, HIGH );
}

void loop() {
  msg1.id = 0xDEADBEEF;
  msg1.len = 8;
  for ( uint8_t i = 0; i < 8; i++ ) {
    msg1.buf[i] = i;
  }
  msg1.flags.extended = 1;
  can1.write(msg1);
  
  if ( can2.read(msg) ) {
    Serial.print("CAN2 ");
    Serial.print("MB: "); Serial.print(msg.mb);
    Serial.print("  ID: 0x"); Serial.print(msg.id, HEX );
    Serial.print("  EXT: "); Serial.print(msg.flags.extended );
    Serial.print("  LEN: "); Serial.print(msg.len);
    Serial.print(" DATA: ");
    for ( uint8_t i = 0; i < 8; i++ ) {
      Serial.print(msg.buf[i]); Serial.print(" ");
    }
    Serial.print("  TS: "); Serial.println(msg.timestamp);
  }
  delay(100);
}
