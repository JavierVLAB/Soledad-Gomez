//let modelURL = './my_model/';
let modelURL = 'https://teachablemachine.withgoogle.com/models/2HucpcZdT/';
//let modelURL = 'https://teachablemachine.withgoogle.com/models/-owFz2BSZ/';

let classifier;
let video;
let currentClass = "";
let confidence = 0;
let sceneManager;
let contentData;

let rotateScreen = true;
let rotateCamera = true;
let screenWidth;
let screenHeight;
let fontTitle, fontText;

function preload() {
  contentData = loadJSON("content.json?v=" + Date.now());
  fontTitle = loadFont('assets/MXYRPZ-UniversLTStd-BoldCnObl.ttf');
  fontText = loadFont('assets/MXYRPZ-UniversLTStd-BoldCnObl.ttf');
}


let cam;

function setup() {
  createCanvas(windowWidth, windowHeight);
  //video = createCapture(VIDEO);
  video = createImg("http://localhost:8080/video", "stream");
  //video.size(320, 240);
  video.hide();

  sceneManager = new SceneManager(contentData);
  classifier = ml5.imageClassifier(modelURL + 'model.json', () => {
    console.log("Modelo personalizado cargado");
    modelReady();
  });

  if(rotateScreen){
    screenWidth = height;
    screenHeight = width;
  } else {
    screenWidth = width;
    screenHeight = height;
  }

}

function draw() {
  background(0);

  push();

  

  if (rotateScreen) {
    // Rota 90 grados y ajusta el sistema de coordenadas

    image(video, 0, 0, screenHeight, screenHeight * 240 / 320);
    translate(width, 0);
    rotate(HALF_PI);
  } else {   
    // Muestra el video sin rotar
    image(video, 0, 0, screenWidth, screenWidth * 240 / 320);
  }
  
  //image(video, 0, 0, screenWidth, screenWidth * 240 / 320);
  sceneManager.update();
  sceneManager.render();


  pop();
}

function modelReady() {
  classifyVideo();
}

function classifyVideo() {
  const tempW = 320;
  const tempH = 240;

  // Creamos un buffer temporal y dibujamos el video IP
  const g = createGraphics(tempW, tempH);
  g.image(video, 0, 0, tempW, tempH); // escalado

  let frame;

  if (rotateCamera) {
    const rotated = createGraphics(tempH, tempW); // rotado
    rotated.push();
    rotated.translate(rotated.width / 2, rotated.height / 2);
    rotated.rotate(HALF_PI);
    rotated.imageMode(CENTER);
    rotated.image(g, 0, 0);
    rotated.pop();

    frame = rotated.get();
    rotated.remove();
  } else {
    frame = g.get();
  }

  g.remove();

  classifier.classify(frame, gotResult);
}



function gotResult(error, results) {
  if (error) {
    console.warn("Advertencia:", error);
  }

  let detectedClass = "";
  let confidenceValue = 0;

  if (results && results.length > 0) {
    const result = results[0];
    if (result.label !== "Clase 4" && result.confidence > 0.8) {
      detectedClass = result.label;
      confidenceValue = result.confidence;
      console.log(detectedClass, confidenceValue);
    }
  }

  // Actualiza solo si se detectó clase válida con >90%
  currentClass = detectedClass;
  confidence = confidenceValue;
  sceneManager.updateDetectedClass(currentClass);

  classifyVideo();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function keyPressed() {
  if (key === '1') {
    currentClass = "Class 1";
  } else if (key === '3') {
    currentClass = "Molto piacere";
  } else {
    currentClass = "";
  }

  sceneManager.updateDetectedClass(currentClass);
}
