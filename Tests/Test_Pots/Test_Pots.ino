/*
  this program taken from arduino Example .
  modified by By Mohannad Rawashdeh
  http://www.genotronex.com
  https://www.instructables.com/

  This code used to control the digital potentiometer
  MCP41100 connected to  arduino Board
  CS >>> D10
  SCLK >> D13
  DI  >>> D11
  PA0 TO VCC
  PBO TO GND
  PW0 TO led with resistor 100ohm .
*/
#include <SPI.h>
byte address = 0x00;
//int CS= 7;
int i = 0;

void setup()
{
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  digitalWrite(7, HIGH);
  digitalWrite(8, HIGH);
  digitalWrite(9, HIGH);
  digitalWrite(10, HIGH);

  SPI.begin();
  //  // adjust high and low resistance of potentiometer
  //  // adjust Highest Resistance .
  //   digitalPotWrite(0x00,7);
  //   delay(1000);
  //
  //      // adjust  wiper in the  Mid point  .
  //   digitalPotWrite(0x80,7);
  //   delay(1000);
  //
  //   // adjust Lowest Resistance .
  //   digitalPotWrite(0xFF,7);
  //   delay(1000);
}

void loop()
{
  for (i = 0; i <= 255; i++)
  {
    digitalPotWrite(i, 7);
    delay(10);
  }
  delay(50);
  MCP41HV_SetTerminals(3, 7);
  delay(1000);
  MCP41HV_SetTerminals(7, 7);
  for (i = 255; i >= 0; i--)
  {
    if (i == 128) {
      MCP41HV_SetTerminals(6, 7);
      delay(1000);
      MCP41HV_SetTerminals(7, 7);
    }
    digitalPotWrite(i, 7);


    delay(10);
  }


}

int digitalPotWrite(int value, int CS)
{
  digitalWrite(CS, LOW);
  SPI.transfer(address);
  SPI.transfer(value);
  digitalWrite(CS, HIGH);
  return 1;
}

void MCP41HV_SetTerminals(int TCON_Value, int CS)
{
  digitalWrite(CS, LOW);
  SPI.transfer(0x40); //Write to TCON Register
  SPI.transfer(TCON_Value + 8);
  SPI.transfer(0x4C); //Read Command
  uint8_t result = SPI.transfer(0xFF); //Rea
  digitalWrite(CS, HIGH);

}
