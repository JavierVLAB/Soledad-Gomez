const http = require('http');
const { spawn } = require('child_process');

const PORT = 8080;
const RTSP_URL = 'rtsp://javieye:javieye8220@192.168.1.141:554/stream1';

// const ffmpeg = spawn('ffmpeg', [
//   '-hwaccel', 'videotoolbox',
//   '-i', RTSP_URL,
//   '-f', 'mjpeg',
//   '-q:v', '5',
//   '-r', '10',
//   'pipe:1'
// ]);

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

const server = http.createServer((req, res) => {
  if (req.url === '/video') {
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
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<img src="/video">');
  }
});

let buffer = Buffer.alloc(0);

ffmpeg.stdout.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  let start = buffer.indexOf(Buffer.from([0xFF, 0xD8])); // JPEG start
  let end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));   // JPEG end

  while (start !== -1 && end !== -1 && end > start) {
    const frame = buffer.slice(start, end + 2);
    const remaining = buffer.slice(end + 2);
    buffer = remaining;

    const header = `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`;
    const data = Buffer.concat([Buffer.from(header), frame, Buffer.from('\r\n')]);

    clients.forEach(client => client.write(data));

    start = buffer.indexOf(Buffer.from([0xFF, 0xD8]));
    end = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Servidor MJPEG activo en http://localhost:${PORT}/video`);
});
