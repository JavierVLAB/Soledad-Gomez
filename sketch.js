//let modelURL = './my_model/';
//let modelURL = 'https://teachablemachine.withgoogle.com/models/2HucpcZdT/';
let modelURL = 'https://teachablemachine.withgoogle.com/models/-owFz2BSZ/';

let classifier;
let video;
let currentClass = "";
let confidence = 0;
let sceneManager;
let contentData;

let fontTitle, fontText;

function preload() {
  contentData = loadJSON("content.json?v=" + Date.now());
  fontTitle = loadFont('assets/fonts/Oswald/static/Oswald-Regular.ttf');
  fontText = loadFont('assets/fonts/Roboto_Condensed/static/RobotoCondensed-Regular.ttf');
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  sceneManager = new SceneManager(contentData);
  classifier = ml5.imageClassifier(modelURL + 'model.json', () => {
    console.log("Modelo personalizado cargado");
    modelReady();
  });


}

function draw() {
  background(0);

  push();
  // Mueve el origen al centro y rota 90 grados (PI/2 radianes)
  translate(width, 0);
  rotate(HALF_PI);

  // TODO: aquí todo se dibuja rotado
  image(video, 0, 0, width, width*240/320);
  sceneManager.update();
  sceneManager.render();

  pop();


}

function modelReady() {
  classifyVideo();
}

function classifyVideo() {
  const frame = video.get();
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
    currentClass = "Class 3";
  } else {
    currentClass = "";
  }

  sceneManager.updateDetectedClass(currentClass);
}
