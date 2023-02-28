let stream;
let camType = 'user';
let isRecording = false;
let mediaRecorder;
let blobs;

const camTypeContext = document.querySelector('span#camType');

const preview = document.querySelector('video#preview');
const playRecord = document.querySelector('video#playRecord');

const openCamButton = document.querySelector('button#openCamButton');
const changeCamButton = document.querySelector('button#changeCamButton');
const recordButton = document.querySelector('button#recordButton');
const downloadButton = document.querySelector('button#downloadButton');

async function changeCam() {
  if (camType === 'user') {
    camType = 'enviroment';
    camTypeContext.textContent = 'Back-End';
  } else {
    camType = 'user';
    camTypeContext.textContent = 'Front-End';
  }
  openCam(camType);
}

async function openCam(_type) {
  if (openCamButton.textContent === 'Open Cam') {
    if (await isMobile()) {
      console.log('is mobile');
      _type = { exact: _type };
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { facingMode: _type },
        })
        .then(async (_stream) => {
          if ('srcObject' in preview) {
            stream = _stream;
            preview.srcObject = _stream;
            await preview.play();
            preview.style.display = 'block';
            changeCamButton.disabled = false;
            recordButton.disabled = false;
            openCamButton.textContent = 'Close Cam';
          }
        });
    }
  } else {
    openCamButton.textContent = 'Open Cam';
    await stream.getTracks().forEach(function (track) {
      track.stop();
    });
    stream = null;
    preview.style.display = 'none';
    recordButton.disabled = true;
    changeCamButton.disabled = true;
  }
}

async function onRecord() {
  if (isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  console.log('stream', stream);
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = function (_event) {
    mediaRecorder.blobs = new Blob([_event.data], {
      type: _event.data.type,
    });
  };
  mediaRecorder.onstop = function (_event) {
    blobs = _event.target.blobs;
    onPlayRecord(_event.target.blobs);
  };
  mediaRecorder.start();
  openCamButton.disabled = true;
  recordButton.textContent = 'Stop Record';
  changeCamButton.disabled = true;
  downloadButton.disabled = true;
  isRecording = true;
}

async function stopRecording() {
  await mediaRecorder.stop();
  preview.pause();
  preview.style.display = 'none';
  recordButton.textContent = 'Start Record';
  changeCamButton.disabled = false;
  downloadButton.disabled = false;
  isRecording = false;
  openCamButton.disabled = false;
}

async function onPlayRecord(_blobs) {
  playRecord.style.display = 'block';
  playRecord.src = window.URL.createObjectURL(_blobs);
  playRecord.play();
}

async function onDownload() {
  const aElement = document.createElement('a');
  const href = window.URL.createObjectURL(blobs);
  aElement.href = href;
  aElement.download = `${new Date().getTime()}.mp4`;
  document.body.appendChild(aElement);
  aElement.click();
  document.body.removeChild(aElement);
  window.URL.revokeObjectURL(href);
}

async function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

openCamButton.addEventListener('click', async function () {
  await openCam();
});
changeCamButton.addEventListener('click', async function () {
  await changeCam();
});

recordButton.addEventListener('click', async function () {
  await onRecord();
});

downloadButton.addEventListener('click', async function () {
  await onDownload();
});
