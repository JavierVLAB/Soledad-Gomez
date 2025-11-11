

ffmpeg -i "rtsp://javi_eye:JAVIEYE8220@192.168.8.162:554/stream1" -f mjpeg -q:v 5 -r 10 -an http://localhost:8090/feed.ffm


# Tutorial Para Detection con Yolo

- Abres label-studio en el ordenador
- Creas proyecto de deteccion con bouding boxes
- creas los labels en el settings
- Tageas cada imagen, escogiendo el label y haciendo el tamaño de la deteccion
- Exportas para Yolo con imagenes
- Coges el comprimido lo abres y creas el archivo detect.yaml, el archivo tiene el mismo nombre que la carpeta
- coges la carpeta la comprimes
- en ultralitics hub creas un dataset de detection
- subes el coomprimido
- creas un proyecto y con el dataset escoges un modelo, 11n, y entrenas en google colab el modelo
