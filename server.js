const http = require('http');
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8080;
const RTSP_URL = 'rtsp://javieye:javieye8220@192.168.0.178:554/stream1';

// FFmpeg subprocess to capture RTSP and convert to MJPEG
const ffmpeg = spawn('ffmpeg', [
  '-rtsp_transport', 'tcp',
  '-fflags', 'nobuffer',
  '-flags', 'low_delay',
  '-strict', 'experimental',
  '-probesize', '32',
  '-analyzeduration', '0',
  '-hwaccel', 'videotoolbox',
  '-i', RTSP_URL,
  '-f', 'mjpeg',
  '-q:v', '5',
  '-r', '10',
  'pipe:1'
]);

ffmpeg.stderr.on('data', (data) => {
  console.error('FFmpeg STDERR:', data.toString());
});

let clients = [];

// MJPEG server over Express
const app = express();
const server = http.createServer(app);

// Endpoint para el stream de video
app.get('/video', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });

  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Sirve los archivos estáticos (tu app p5.js)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Ruta por defecto redirige a index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Manejo de frames de video
let buffer = Buffer.alloc(0);

ffmpeg.stdout.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  let start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
  let end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));

  while (start !== -1 && end !== -1 && end > start) {
    const frame = buffer.slice(start, end + 2);
    buffer = buffer.slice(end + 2);

    const header = `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`;
    const data = Buffer.concat([Buffer.from(header), frame, Buffer.from('\r\n')]);

    clients.forEach(client => client.write(data));

    start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
    end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
  }
});

// Inicia servidor
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  // Abre el navegador automáticamente (solo macOS)
  require('child_process').exec(`open http://localhost:${PORT}`);
});
