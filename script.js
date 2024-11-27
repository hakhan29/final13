const audio = new Audio();
audio.src = './music/happy.mp3',
        './music/sad.mp3',
        './music/anger.mp3',
        './music/neutral.mp3',
        './music/surprised.mp3',
        './music/fear.mp3'

function playEmotionMusic(emotion) {
    const emotionMusic = {
        happy: './music/happy.mp3',
        sad: './music/sad.mp3',
        anger: './music/anger.mp3',
        neutral: './music/neutral.mp3',
        surprised: './music/surprised.mp3',
        fear: './music/fear.mp3'
    };

    if (audio.src !== emotionMusic[emotion]) {
        audio.pause();
        audio.src = emotionMusic[emotion];
        audio.volume = 0.5; // 0과 1 사이 값
        audio.play().catch(err => console.error('Audio play error:', err));
    }
}


function fadeInAudio(audio) {
    let volume = 0;
    fadeInterval = setInterval(() => {
        if (volume < 1) {
            volume += 0.05;
            audio.volume = volume;
        } else {
            clearInterval(fadeInterval);
        }
    }, 100);
}

function fadeOutAudio(audio) {
    let volume = audio.volume;
    fadeInterval = setInterval(() => {
        if (volume > 0) {
            volume -= 0.05;
            audio.volume = volume;
        } else {
            audio.pause();
            clearInterval(fadeInterval);
        }
    }, 100);
}

const video = document.getElementById('video');
const expressionDiv = document.getElementById('expression');
const colorBox = document.getElementById('colorBox');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

video.addEventListener('play', () => {
    setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

    if (detections.length > 0) {
        const expressions = detections[0].expressions;

        const highestExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
        );

        // 감정별 기본 색상 정의
        const emotionColors = {
            anger: [255, 0, 0],       // 빨강
            happy: [255, 255, 0],     // 노랑
            sad: [0, 0, 255],         // 파랑
            neutral: [128, 128, 128], // 회색
            surprised: [255, 165, 0], // 주황
            fear: [128, 0, 128]       // 보라
        };

        // 선택된 감정 색상 가져오기
        const [red, green, blue] = emotionColors[highestExpression] || [255, 255, 255];

        // RGB 값 범위 제한 (0~255 사이로)
        const clampColor = (value) => Math.min(255, Math.max(0, value));

        // 배경 색상 적용
        colorBox.style.background = `rgb(${clampColor(red)}, ${clampColor(green)}, ${clampColor(blue)})`;

        // 텍스트 업데이트 (페이드 효과)
        if (expressionDiv.textContent !== `Detected Expression: ${highestExpression}`) {
            expressionDiv.style.opacity = 0; // 페이드아웃
            setTimeout(() => {
                expressionDiv.textContent = `Detected Expression: ${highestExpression}`;
                expressionDiv.style.opacity = 1; // 페이드인
            }, 500); // 페이드 효과 타이밍과 일치
        }
    } else {
        // 얼굴이 감지되지 않았을 경우
        if (expressionDiv.textContent !== 'No face detected') {
            expressionDiv.style.opacity = 0; // 페이드아웃
            setTimeout(() => {
                expressionDiv.textContent = 'No face detected';
                expressionDiv.style.opacity = 1; // 페이드인
            }, 500);
        }
        colorBox.style.background = 'white'; // 기본값
    }
}, 100);

});