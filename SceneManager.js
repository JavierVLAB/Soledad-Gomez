class SceneManager {
  constructor(content) {
    this.content = content; // JSON completo con todas las clases
    this.currentScene = null;
    this.currentClass = "";
  }

  updateDetectedClass(newClass) {
  if (newClass === this.currentClass) {
    // Nada ha cambiado, mantener escena actual
    return;
  }

  // Caso: clase desaparece (""), empezar fadeOut
  if (newClass === "") {
    if (this.currentScene && this.fadeState !== "out") {
      this.currentScene.startFadeOut();
      this.fadeState = "out";
    }
    this.currentClass = "";
    return;
  }

  // Caso: misma clase que estaba desapareciendo, volver a fadeIn
  if (
    this.currentScene &&
    this.fadeState === "out" &&
    newClass === this.currentScene.label
  ) {
    this.currentScene.startFadeIn();
    this.fadeState = "in";
    this.currentClass = newClass;
    return;
  }

  // Caso: nueva clase detectada
  const sceneData = this.content[newClass];
  if (sceneData) {
    const newScene = new Scene(sceneData);
    newScene.label = newClass; // guardar nombre de clase
    newScene.startFadeIn();
    this.currentScene = newScene;
    this.currentClass = newClass;
    this.fadeState = "in";
  }
}


  update() {
    if (this.currentScene) {
      this.currentScene.update();
    }
    
  }

  render() {
    if (this.currentScene) {
      this.currentScene.render();
    }
  }
}
