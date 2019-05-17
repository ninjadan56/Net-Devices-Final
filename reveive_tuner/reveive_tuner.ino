#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>
#include <OSCBundle.h>
#include <OSCData.h>

char ssid[] = "Fios-KJWLX";          // your network SSID (name)
char pass[] = "pop614sock5577goof";                    // your network password

// A UDP instance to let us send and receive packets over UDP
WiFiUDP Udp;
const IPAddress outIp(10,40,10,105);        // remote IP (not needed for receive)
const unsigned int outPort = 9999;          // remote port (not needed for receive)
const unsigned int localPort = 8888;        // local port to listen for UDP packets (here's where we send the packets)


OSCErrorCode error;
unsigned int ledState = 1;              // LOW means led is *on*
unsigned int led2State = 1;
//unsigned int led3State = 1;

void setup() {
  pinMode(4, OUTPUT);
  digitalWrite(4, 1);    // turn *on* led
  pinMode(5, OUTPUT);
  digitalWrite(5, 1);
//  pinMode(2, OUTPUT);
//  digitalWrite(2, 1);


  Serial.begin(115200);

  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Starting UDP");
  Udp.begin(localPort);
  Serial.print("Local port: ");
  Serial.println(Udp.localPort());
}


void led(OSCMessage &msg) {
  ledState = msg.getInt(0);
  analogWrite(4, ledState);
  Serial.print("/led: ");
  Serial.println(ledState);
}

void led2(OSCMessage &msg) {
  led2State = msg.getInt(0);
  analogWrite(5, led2State);
  Serial.print("/led2: ");
  Serial.println(led2State);
}

//void led3(OSCMessage &msg) {
//  led3State = msg.getInt(0);
//  analogWrite(2, led3State);
//  Serial.print("/led3: ");
//  Serial.println(led3State);
//}


void loop() {
  OSCMessage bundle;
  int size = Udp.parsePacket();

  if (size > 0) {
    while (size--) {
      bundle.fill(Udp.read());
    }
    if (!bundle.hasError()) {
      bundle.dispatch("/led", led);
      bundle.dispatch("/led2", led2);
//      bundle.dispatch("/led3", led3);
    } else {
      error = bundle.getError();
      Serial.print("error: ");
      Serial.println(error);
    }
  }
}
