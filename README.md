

ffmpeg -i "rtsp://javi_eye:JAVIEYE8220@192.168.8.162:554/stream1" -f mjpeg -q:v 5 -r 10 -an http://localhost:8090/feed.ffm
