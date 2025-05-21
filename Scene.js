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

    this.renderTitle();
    this.renderData();
    this.renderComment();

  }

  renderTitle() {
    const x = screenWidth / 6;
    const y = screenHeight / 6;

    this.drawTextWithBackground(this.title, x, y, {
      fontSize: 40,
      font: fontTitle,
      align: LEFT,
      baseline: CENTER,
    });
  }

  renderData() {
    const startX = screenWidth / 6 - 40;
    let y = screenHeight / 6 + 40;

    for (let line of this.dataLines) {
      this.drawTextWithBackground(line, startX, y, {
        fontSize: 40,
        font: fontText,
        align: LEFT,
        baseline: TOP
      });
      y += 50; // espacio entre líneas
    }
  }

  renderComment() {
    if (this.commentPhrases.length === 0) return;

    const comment = this.commentPhrases[this.commentIndex];
    const x = screenWidth / 2;
    const y = 5 * screenHeight / 6;

    this.drawTextWithBackground(comment, x, y, {
      fontSize: 35,
      align: CENTER,
      baseline: CENTER
    });
  }

  drawTextWithBackground(txt, x, y, options = {}) {
    const {
      align = CENTER,
      baseline = CENTER,
      fontSize = 32,
      font = fontText,
      textColor = [255, this.opacity],
      bgColor = [0, this.opacity],
      padding = 30,
      cornerRadius = 0
    } = options;

    push();
    textSize(fontSize);
    textFont(font);

    const w = textWidth(txt);
    const h = fontSize + 10;

    let rectX, rectY, textX, textY;

    // === Horizontal alignment ===
    if (align === LEFT) {
      rectX = x;
      textX = x + padding / 2;
    } else if (align === RIGHT) {
      rectX = x - w - padding;
      textX = x - padding / 2;
    } else { // CENTER
      rectX = x - (w + padding) / 2;
      textX = x;
    }

    // === Vertical alignment ===
    if (baseline === TOP) {
      rectY = y;
      textY = y + h / 2;
    } else if (baseline === BOTTOM) {
      rectY = y - h;
      textY = y - h / 2;
    } else { // CENTER
      rectY = y - h / 2;
      textY = y;
    }

    // Fondo
    noStroke();
    fill(...bgColor);
    rectMode(CORNER);
    rect(rectX, rectY, w + padding, h, cornerRadius);

    // Texto
    fill(...textColor);
    textAlign(align, CENTER); // siempre vertical CENTER para alinear sobre textY
    text(txt, textX, textY);
    pop();
  }



}
