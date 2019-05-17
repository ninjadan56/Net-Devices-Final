var source, fft;
var bNormalize = true;
var centerClip = false;
var index;
var socket;
var remoteHost = '192.168.1.206'; // the IP address of your microcontroller goes here

let ctx, ctnOn;


var flat = 1024;
var high = 1024;
var tuned = 1024;

function noteFromPitch( frequency ) {
    var noteText = ['Eb', 'E', 'F', 'Eb2', 'E2', 'F2'];
    var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
    var nnum = Math.round( noteNum ) + 69;
    var note = nnum % 12;
    return noteText[note];
}

function setup() {
    createCanvas(300, 400);
    fill(225);
    noStroke();
    setupOsc(9999, 8888);
    
    textAlign(CENTER); 
    source = new p5.AudioIn();
    source.start();
    fft = new p5.FFT();
    fft.setInput(source);
    
    ctx = getAudioContext();
    ctxOn = createButton('turn on Audio');
    ctxOn.mousePressed(() => {
  	ctx.resume().then(() => {
  	console.log('Audio Context is now ON');
        ctxOn.hide();
  	});
    });
    
}


function draw() {
    background(0);

    // array of values from -1 to 1
    var timeDomain = fft.waveform(2048, 'float32');
    var corrBuff = autoCorrelate(timeDomain);
    var freq = findFrequency(corrBuff);
    textSize(100);
    text("" + noteFromPitch(freq), width / 2, height / 2);
    
    if ((noteFromPitch(freq) == 'Eb')|| (noteFromPitch(freq) == 'Eb2')) {
        sendOsc('/led', flat); 
    }
    else if((noteFromPitch(freq) == 'F')|| (noteFromPitch(freq) == 'F2')) {
        sendOsc('/led2', high);
    }
   else { ((noteFromPitch(freq) == 'E')|| (noteFromPitch(freq) == 'E2')) 
//         tuned = 1024;
//         flat = 0;
//         high = 0;
         sendOsc('/led3', tuned);
}
}

function autoCorrelate(buffer) {
    var newBuffer = [];
    var nSamples = buffer.length;

    var autocorrelation = [];

    // center clip removes any samples under 0.1
    if (centerClip) {
        var cutoff = 0.1;
        for (var i = 0; i < buffer.length; i++) {
            var val = buffer[i];
            buffer[i] = Math.abs(val) > cutoff ? val : 0;
        }
    }

    for (var lag = 0; lag < nSamples; lag++){
        var sum = 0;
        for (index = 0; index < nSamples; index++){
            var indexLagged = index+lag;
            if (indexLagged < nSamples){
                var sound1 = buffer[index];
                var sound2 = buffer[indexLagged];
                var product = sound1 * sound2;
                sum += product;
            }
        }

        // average to a value between -1 and 1
        newBuffer[lag] = sum/nSamples;
    }

    if (bNormalize){
        var biggestVal = 0;
        for (index = 0; index < nSamples; index++){
            if (abs(newBuffer[index]) > biggestVal){
                biggestVal = abs(newBuffer[index]);
            }
        }
        for (index = 0; index < nSamples; index++){
            newBuffer[index] /= biggestVal;
        }
    }

    return newBuffer;
}


function findFrequency(autocorr) {

  var nSamples = autocorr.length;
  var valOfLargestPeakSoFar = 0;
  var indexOfLargestPeakSoFar = -1;

  for (var index = 1; index < nSamples; index++){
    var valL = autocorr[index-1];
    var valC = autocorr[index];
    var valR = autocorr[index+1];

    var bIsPeak = ((valL < valC) && (valR < valC));
    if (bIsPeak){
      if (valC > valOfLargestPeakSoFar){
        valOfLargestPeakSoFar = valC;
        indexOfLargestPeakSoFar = index;
      }
    }
  }
  
  var distanceToNextLargestPeak = indexOfLargestPeakSoFar - 0;

  // convert sample count to frequency
  var fundamentalFrequency = sampleRate() / distanceToNextLargestPeak;
  return fundamentalFrequency;
}

function receiveOsc(address, value) {
	console.log("received OSC: " + address + ", " + value);
}

function sendOsc(address, value) {
	socket.emit('message', [address].concat(value));
    console.log(noteFromPitch(freq));
    console.log(flat);
    console.log(high);
    console.log(tuned);
}

function setupOsc(oscPortIn, oscPortOut) {
    socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: remoteHost} 
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

