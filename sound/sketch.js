var socket;
var song;

function setup() {
	createCanvas(500, 500); 
    setupOsc(9999, 8888);
    song = loadSound('Estring.mp3'); 
}
s
function draw() {
    background(0, 0, 255);
    textAlign(CENTER);
    text("Tuner", width/2, height/2); 
    
}

function receiveOsc(address, value) {
	console.log("received OSC: " + address + ", " + value);
     if ((address == '/test') && (value == 1)) {
//        background(0, 255, 0);
        song.play(); 
	} else {
        song.stop(); 
    }   
}

function setupOsc(oscPortIn, oscPortOut) {
	var socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}