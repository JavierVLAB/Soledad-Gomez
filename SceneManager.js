class SceneManager {
  constructor(content) {
    this.content = content; // JSON completo con todas las clases
    this.currentScene = null;
    this.currentClass = "";
  }

  updateDetectedClass(newClass) {
    if (newClass === this.currentClass) return;

    if (newClass === "" || !this.content[newClass]) {
      // Si no hay clase o clase no encontrada, desactiva la escena
      if (this.currentScene) {
        this.currentScene.startFadeOut();
        this.currentClass = "";
      }
    } else {
      // Si hay una nueva clase válida, inicia transición
      const sceneData = this.content[newClass];
      const newScene = new Scene(sceneData);
      newScene.startFadeIn();

      this.currentScene = newScene;
      this.currentClass = newClass;
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
