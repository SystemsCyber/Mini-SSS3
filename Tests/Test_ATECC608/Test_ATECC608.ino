#include <ArduinoECCX08.h>
#include <utility/ECCX08CSR.h>
void setup() {
  Serial.begin(9600);
  while (!Serial);
 if (!ECCX08.begin(35)) {
    Serial.println("No ECCX08 present!");
    while (1);
  }
  String serialNumber = ECCX08.serialNumber();
  Serial.print("ECCX08 Serial Number = ");
  Serial.println(serialNumber);
  Serial.println();
  if (!ECCX08CSR.begin(0, 0)) {
    Serial.println("Error starting CSR generation!");
    while (1);
  }
  ECCX08CSR.setCountryName("US");
  ECCX08CSR.setStateProvinceName("CO");
  ECCX08CSR.setLocalityName("Fort Collins");
  ECCX08CSR.setOrganizationName("CSU");
  ECCX08CSR.setOrganizationalUnitName("SystemCyber");
  ECCX08CSR.setCommonName(serialNumber.c_str());
  String csr = ECCX08CSR.end();
  Serial.println("Here's your CSR, enjoy!");
  Serial.println();
  Serial.println(csr);
}

void loop() {
  // put your main code here, to run repeatedly:

}
