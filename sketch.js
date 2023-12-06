// serial variables
let mSerial;

let connectButton;

let readyToReceive;

// project variables
let bgColor=10;
let choiceSlider;

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line);
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("error: ", line);
    readyToReceive = true;
    return;
  }

  // get data from Serial string
  let data = JSON.parse(line).data;
  let a0 = data.A0;
  let d2 = data.D2;
  let d3 = data.D3;

  // use data to update project variables
  // bgColor = map(a0.value, 0, 4095, 0, 255); //a0.min and a0.max somehow don't work here
  choiceSlider.value(floor(map(a0.value, 0, 4095, 0, 4)));

  // serial update
  readyToReceive = true;
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);

    readyToReceive = true;
    connectButton.hide();
  }
}

// face api example from ml5  https://learn.ml5js.org/#/reference/face-api

// credit to Joey Lee.  https://jk-lee.com/
// credit to Bomani Oseni McClendon. https://github.com/ml5js/ml5-library/tree/main/examples/p5js/FaceApi

let faceapi;
let video;
let detections;
let prevDetectionsLeng;

// by default all options are set to true
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  // load up your video
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas
  faceapi = ml5.faceApi(video, detectionOptions, modelReady);
  textAlign(RIGHT);

  // setup serial
  readyToReceive = false;

  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);

  choiceSlider = createSlider(0, 4, 0, 1);
  choiceSlider.position(width / 2, height / 4*3);
}

function modelReady() {
  console.log("ready!");
  console.log(faceapi);
  faceapi.detect(gotResults);
}

// Since the function is iterative, it in fact functions as "draw()"
function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;
  // console.log(detections.length);

  background(bgColor);
  // image(video, 0, 0, width, height); // Comment out to avoid showing the webcam video
  if (detections) {
    if (detections.length > 0) {
      // console.log(detections)
      push();
      translate(width,0);
      scale(-1, 1);
      drawBox(detections);
      drawLandmarks(detections);
      pop();
    }
  }

  drawOthers(); // Put other project logic in drawOthers() function
  

  faceapi.detect(gotResults);
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i += 1) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;

    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    rect(x, y, boxWidth, boxHeight);
  }
}

function drawLandmarks(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);

  for (let i = 0; i < detections.length; i += 1) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function drawOthers() {
  // project logic


  // update serial: request new data
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    
    
    if (detections.length && prevDetectionsLeng == 0) {     
      mSerial.write(1);
      mSerial.write(0xab);
    } else if (detections.length == 0 && prevDetectionsLeng) {
      mSerial.write(0);
      mSerial.write(0xab);
    } else {      
      mSerial.write(0xab);
      console.log(0xab);
    }
    prevDetectionsLeng = detections.length;
    
  }

  // update serial: read new data
  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}

// function draw() {
//   // project logic
//   background(bgColor);
//   faceapi.detect(gotResults);
//   // update serial: request new data
//   if (mSerial.opened() && readyToReceive) {
//     readyToReceive = false;
//     mSerial.clear();
//     mSerial.write(0xab);
//   }

//   // update serial: read new data
//   if (mSerial.availableBytes() > 8) {
//     receiveSerial();
//   }
// }
