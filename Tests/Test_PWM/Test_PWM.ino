const uint8_t numPWMs = 4;
const int8_t PWMPins[numPWMs] = {2, 4, 5, 6};
uint16_t pwmValue[numPWMs] = {500, 1000, 2048, 4096};
uint16_t pwmFrequency[numPWMs] = {245, 245, 200, 200};

void setup() {
  uint8_t i;
  for (i = 0; i < numPWMs; i++)
    pinMode(PWMPins[i], OUTPUT);
  // analogWrite value 0 to 4095, or 4096 for high
  analogWriteResolution(12);

  analogWrite(PWMPins[0], 512);
  analogWrite(PWMPins[1], 512);
  analogWrite(PWMPins[2], 512);
  analogWrite(PWMPins[3], 512);

  analogWriteFrequency(PWMPins[0], 500);
  analogWriteFrequency(PWMPins[1], 1000);
  analogWriteFrequency(PWMPins[2], 1500);
  analogWriteFrequency(PWMPins[3], 2000);

}

void loop() {
  // put your main code here, to run repeatedly:
}
