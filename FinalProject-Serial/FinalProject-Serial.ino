#include <ArduinoJson.h>

// project variables
// a0 Pin: potentiometer value detection
int a0Val = 0;
// d2 pin: connected to button1, controls the write/erase action of music note
int d2Val = 0;
// d3 pin: connected to button2, switch to new line upon pressing
int d3ClickCount = 0;
int d3Val = 0;

const int ledPin = 4;

int prevD3Val = 0;

void sendData() {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject A0 = data.createNestedObject("A0");
  JsonObject D2 = data.createNestedObject("D2");
  JsonObject D3 = data.createNestedObject("D3");

  A0["value"] = a0Val;
  D2["isPressed"] = d2Val;
  D3["isPressed"] = d3Val;
  D3["count"] = d3ClickCount;

  String resTxt = "";
  serializeJson(resJson, resTxt);

  Serial.println(resTxt);
}

void setup() {
  // Serial setup
  Serial.begin(9600);
  while (!Serial) {}
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // read pins
  a0Val = analogRead(A0);
  d2Val = digitalRead(2);
  d3Val = digitalRead(3);

  // calculate if d3 was clicked
  if (d3Val && d3Val != prevD3Val) {
    d3ClickCount++;
  }

  prevD3Val = d3Val;

  // check if there was a request for data, and if so, send new data
  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) {
      Serial.flush();
      sendData();
    } else if (byteIn == 1) {
      digitalWrite(ledPin, HIGH);
    } else if (byteIn == 0){
      digitalWrite(ledPin, LOW);
    }
  }

  delay(2);
}
