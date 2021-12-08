// #include <Arduino.h>
// #include <unity.h>
// #include <Wire.h>

// // void tearDown(void) {
// // // clean stuff up here
// // }
// void test_i2c_at_60(void)
// {
//     // Test that the device address is 0x04
//     Wire.beginTransmission(0x60);
//     TEST_ASSERT_EQUAL(0, Wire.endTransmission());
// }
// // void test_led_builtin_pin_number(void) {
// //     TEST_ASSERT_EQUAL(13, LED_BUILTIN);
// // }

// // void test_led_state_high(void) {
// //     digitalWrite(LED_BUILTIN, HIGH);
// //     TEST_ASSERT_EQUAL(HIGH, digitalRead(LED_BUILTIN));
// // }

// // void test_led_state_low(void) {
// //     digitalWrite(LED_BUILTIN, LOW);
// //     TEST_ASSERT_EQUAL(LOW, digitalRead(LED_BUILTIN));
// // }

// // void setup() {
// //     // NOTE!!! Wait for >2 secs
// //     // if board doesn't support software reset via Serial.DTR/RTS
// //     delay(2000);
// //     while(!Serial);
// //     UNITY_BEGIN();    // IMPORTANT LINE!
// //     RUN_TEST(test_led_builtin_pin_number);

// //     pinMode(LED_BUILTIN, OUTPUT);
// // }

// // uint8_t i = 0;
// // uint8_t max_blinks = 5;

// void setup()
// {
//     // set stuff up here
//     delay(2000);
//     Serial.begin(9600);
//     while(!Serial);
//     Wire.begin();

//     UNITY_BEGIN(); // IMPORTANT LINE!
//     // RUN_TEST(test_i2c_at_60);
// }
// uint8_t i = 0;
// uint8_t max_blinks = 5;
// void loop()
// {

//     if (i < max_blinks)
//     {
//         RUN_TEST(test_i2c_at_60);
//         delay(500);
//         i++;
//     }
//     else if (i == max_blinks)
//     {
//         UNITY_END(); // stop unit testing
//     }
//     // UNITY_END(); // stop unit testing
// }



#include <Arduino.h>
#include <unity.h>

// void setUp(void) {
// // set stuff up here
// }

// void tearDown(void) {
// // clean stuff up here
// }

void test_led_builtin_pin_number(void) {
    TEST_ASSERT_EQUAL(13, LED_BUILTIN);
}

void test_led_state_high(void) {
    digitalWrite(LED_BUILTIN, HIGH);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(LED_BUILTIN));
}

void test_led_state_low(void) {
    digitalWrite(LED_BUILTIN, LOW);
    TEST_ASSERT_EQUAL(LOW, digitalRead(LED_BUILTIN));
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    while(!Serial);
    delay(7000);

    UNITY_BEGIN();    // IMPORTANT LINE!
    RUN_TEST(test_led_builtin_pin_number);

    pinMode(LED_BUILTIN, OUTPUT);
}

uint8_t i = 0;
uint8_t max_blinks = 5;

void loop() {
    if (i < max_blinks)
    {
        RUN_TEST(test_led_state_high);
        delay(500);
        RUN_TEST(test_led_state_low);
        delay(500);
        i++;
    }
    else if (i == max_blinks) {
      UNITY_END(); // stop unit testing
    }
}