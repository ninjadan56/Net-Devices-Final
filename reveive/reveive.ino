/*---------------------------------------------------------------------------------------------
  Open Sound Control (OSC) library for the ESP8266
  Example for sending messages from the ESP8266 to a remote computer
  The example is sending "hello, osc." to the address "/test".
  This example code is in the public domain.
--------------------------------------------------------------------------------------------- */
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>

char ssid[] = "Fios-KJWLX";          // your network SSID (name)
char pass[] = "pop614sock5577goof";                    // your network password

WiFiUDP Udp;                                // A UDP instance to let us send and receive packets over UDP
const IPAddress outIp(192,168,1,163);        // remote IP of your computer
const unsigned int outPort = 9999;          // remote port to receive OSC
const unsigned int localPort = 8888;        // local port to listen for OSC packets (actually not used for sending)

const int notePin = 4; //digital pin input
int buttonState = 0; //button status

void setup() {
    pinMode(notePin, OUTPUT); //output
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

void loop() {
  // read the analog in value:
 buttonState = digitalRead(notePin);

 
  if (buttonState == HIGH) {
    Serial.println("State is = ");  // print the results to the Serial Monitor:
    Serial.println(buttonState);
    sendSignal("/test", buttonState);
    delay(500);
  } else {
    Serial.println("Please press a Button");
    delay(500);
  }

}

void sendSignal(char* path, int value) {
    OSCMessage msg(path);
    msg.add(value);
    Udp.beginPacket(outIp, outPort);
    msg.send(Udp);
    Udp.endPacket();
    msg.empty();
}
