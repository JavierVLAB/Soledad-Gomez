class Scene {
  constructor(data) {
    this.title = data.title;
    this.dataLines = data.data || [];
    this.commentPhrases = data.comments || [];

    this.opacity = 0;
    this.fadeDirection = 0; // 1: fade-in, -1: fade-out

    // Subtítulos frase por frase
    this.commentIndex = 0;
    this.commentTimer = 0;
    this.commentInterval = 180; // frames por frase (~3 segundos a 60fps)
  }

  startFadeIn() {
    this.fadeDirection = 1;
  }

  startFadeOut() {
    this.fadeDirection = -1;
  }

  update() {
    // Fade
    if (this.fadeDirection === 1) {
      this.opacity += 10;
      if (this.opacity >= 255) {
        this.opacity = 255;
        this.fadeDirection = 0;
      }
    } else if (this.fadeDirection === -1) {
      this.opacity -= 1;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this.fadeDirection = 0;
        this.commentIndex = 0;
        this.commentTimer = 0;
      }
    }

    // Avance de frases
    if (this.opacity > 0 && this.commentPhrases.length > 0) {
      this.commentTimer++;
      if (this.commentTimer >= this.commentInterval) {
        this.commentIndex = (this.commentIndex + 1) % this.commentPhrases.length;
        this.commentTimer = 0;
      }
    }
  }

  render() {
    if (this.opacity <= 0) return;

    // Título
    push();
    textAlign(CENTER, CENTER);
    textSize(48);
    textFont(fontTitle);
    fill(0, this.opacity);
    text(this.title, height / 2, width / 4);
    pop();

    // Data (esquina superior izquierda)
    push();
    textAlign(LEFT, TOP);
    textSize(18);
    textFont(fontText);
    fill(200,0,0, this.opacity);
    let yOffset = 20;
    for (let i = 0; i < this.dataLines.length; i++) {
      text(this.dataLines[i], 20, yOffset);
      yOffset += 24;
    }
    pop();

    // Comment (frase completa)
    if (this.commentPhrases.length > 0) {
      push();
      textAlign(CENTER, BOTTOM);
      textSize(24);
      textFont(fontText);
      fill(255,255,0, this.opacity);
      text(this.commentPhrases[this.commentIndex], height / 2, width - 100);
      pop();
    }
  }
}
