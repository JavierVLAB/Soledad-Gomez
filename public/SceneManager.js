class SceneManager {
  constructor(content) {
    this.content = content; // JSON completo con todas las clases
    this.currentScene = null;
    this.currentClass = "";

    this.lastDetectedTime = millis();
    this.idleThreshold = 1 * 30 * 1000; // Tiempo de espera
    this.idleSceneDuration = 20 * 1000; // Tiempo que se muestra
    this.idleScene = null;
    this.idleSceneStartTime = null;
    this.idleTexts = []; // la carga vendrá desde fuera
    
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

    if (newClass && newClass !== "" && newClass !== "Control") {
      this.lastDetectedTime = millis();

      // Si había escena idle activa, desactívala
      if (this.idleScene) {
        this.idleScene.startFadeOut();
        this.idleScene = null;
        this.idleSceneStartTime = null;
        this.idleSceneFadingOut = false;
      }
    }



  }

  loadIdleTexts(idleData) {
    this.idleTexts = idleData.textos;
  }



  update() {
    let now = millis();

    // Actualizar escena principal
    if (this.currentScene) {
      this.currentScene.update();

      if (this.currentScene.isInvisible()) {
        this.currentScene = null;
        this.lastDetectedTime = millis(); // Reinicia temporizador tras escena normal
      }
    }

    // Crear escena idle si no hay escena principal ni idle activa
    if (!this.currentScene && !this.idleScene) {
      if (now - this.lastDetectedTime > this.idleThreshold && this.idleTexts.length > 0) {
        let frases = random(this.idleTexts);

        this.idleScene = new Scene({
          title: "",
          data: [],
          comments: frases,
          isIdle: true
        });

        this.idleScene.startFadeIn();
        this.idleSceneStartTime = now;
        this.idleSceneFadingOut = false;
        console.log("🟢 Idle scene started");
      }
    }

    // Actualizar escena idle (si existe)
    if (this.idleScene) {
      this.idleScene.update();

      // Programar desaparición después del tiempo configurado
      if (
        now - this.idleSceneStartTime > this.idleSceneDuration &&
        !this.idleSceneFadingOut
      ) {
        this.idleScene.startFadeOut();
        this.idleSceneFadingOut = true;
        console.log("🟡 Idle scene fading out");
      }

      // Eliminar la escena idle una vez desaparece
      if (this.idleScene.isInvisible()) {
        console.log("⚫ Idle scene removed");
        this.idleScene = null;
        this.idleSceneStartTime = null;
        this.idleSceneFadingOut = false;
        this.lastDetectedTime = millis(); // Reinicia espera para nueva escena idle
      }
    }
  }


  render() {
    if (this.currentScene) {
      this.currentScene.render();
    }
    if (!this.currentScene && this.idleScene) {
      this.idleScene.render();
    }
  }
}
