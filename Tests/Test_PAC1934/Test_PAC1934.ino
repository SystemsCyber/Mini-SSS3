/***********************************************************

   This is an application example for Microchip PAC193x
  
   © 2020 Microchip Technology Inc. and its subsidiaries.  
 
   Subject to your compliance with these terms, you may use Microchip
   software and any derivatives of this software. You must retain the above
   copyright notice with any redistribution of this software and the 
   following disclaimers. 
   It is your responsibility to comply with third party license terms 
   applicable to your use of third party software (including open source 
   software) that may accompany this Microchip software.
  
   THIS SOFTWARE IS SUPPLIED BY MICROCHIP "AS IS".  NO WARRANTIES, WHETHER 
   EXPRESS, IMPLIED OR STATUTORY, APPLY TO THIS SOFTWARE, INCLUDING 
   ANY IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS
   FOR A PARTICULAR PURPOSE.  
  
   IN NO EVENT WILL MICROCHIP BE LIABLE FOR ANY INDIRECT, SPECIAL, PUNITIVE,
   INCIDENTAL OR CONSEQUENTIAL LOSS, DAMAGE, COST OR EXPENSE OF ANY KIND 
   WHATSOEVER RELATED TO THE SOFTWARE, HOWEVER CAUSED, EVEN IF MICROCHIP
   HAS BEEN ADVISED OF THE POSSIBILITY OR THE DAMAGES ARE FORESEEABLE. 
   TO THE FULLEST EXTENT ALLOWED BY LAW, MICROCHIP'S TOTAL LIABILITY ON ALL
   CLAIMS IN ANY WAY RELATED TO THIS SOFTWARE WILL NOT EXCEED THE AMOUNT OF
   FEES, IF ANY, THAT YOU HAVE PAID DIRECTLY TO MICROCHIP FOR THIS SOFTWARE.
   
***********************************************************/

/***********************************************************

  Version 1.0.0

***********************************************************/

#include <Microchip_PAC193x.h>
#include <Wire.h>

#include <SPI.h>
byte address = 0x00;
int i = 0;
Microchip_PAC193x PAC;

void setup()
{
  Wire.begin();
  PAC.begin();
  Serial.begin(9600);
  while (!Serial)


  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);

  SPI.begin();
 
  digitalPotWrite(0, 7);
  digitalPotWrite(0, 8);
  digitalPotWrite(0, 9);
  digitalPotWrite(0, 10);
}

void loop()
{
  digitalPotWrite(10, 7);
  digitalPotWrite(100, 8);
  digitalPotWrite(200, 9);
  digitalPotWrite(255, 10);

  Serial.print("\n\nRead start:");
  Serial.print("\n Voltage1    (mV) = ");
  PAC.UpdateVoltage();
  Serial.print(PAC.Voltage1);

  Serial.print("\n Voltage2    (mV) = ");
  PAC.UpdateVoltage();
  Serial.print(PAC.Voltage2);

  Serial.print("\n Voltage3    (mV) = ");
  PAC.UpdateVoltage();
  Serial.print(PAC.Voltage3);

  Serial.print("\n Voltage4    (mV) = ");
  PAC.UpdateVoltage();
  Serial.print(PAC.Voltage4);

  delay(2000);
}
//  
//  Serial.print("\n Product      ID: ");
//  PAC.UpdateProductID();
//  Serial.print(PAC.ProductID, HEX);
//  Serial.print("\n Manufacturer ID: ");
//  PAC.UpdateManufacturerID();
//  Serial.print(PAC.ManufacturerID, HEX);
//  Serial.print("\n Revision     ID: ");
//  PAC.UpdateRevisionID();
//  Serial.print(PAC.RevisionID, HEX);
  // Serial.print("\n Vsense     (mV) = ");
  // PAC.UpdateVsense();
  // Serial.print(PAC.Vsense,6);
  // Serial.print("\n Current    (mA) = ");
  // PAC.UpdateCurrent();
  // Serial.print(PAC.Current,6);
  // Serial.print("\n Raw Power (HEX) = ");
  // PAC.UpdatePowerRaw();
  // Serial.print(PAC.PowerRaw, HEX);
  // Serial.print("\n Power      (mW) = ");
  // PAC.UpdatePower();
  // Serial.print(PAC.Power,6);
  // Serial.print("\n Power Acc  (mW) = ");
  // PAC.UpdatePowerAcc() ;
  // Serial.print(PAC.PowerAcc,6);
  // Serial.print("\n Energy    (mWh) = ");
  // PAC.UpdateEnergy();
  // Serial.print(PAC.Energy,6);
//
//   // adjust high and low resistance of potentiometer
//  // adjust Highest Resistance .
//  digitalPotWrite(0x00, 8);
//  delay(1000);
//
//  // adjust  wiper in the  Mid point  .
//  digitalPotWrite(0x80, 8);
//  delay(1000);
//
//  // adjust Lowest Resistance .
//  digitalPotWrite(0xFF, 8);
//  delay(1000);


void digitalPotWrite(int value, int CS)
{
  digitalWrite(CS, LOW);
  SPI.transfer(address);
  SPI.transfer(value);
  digitalWrite(CS, HIGH);
}
