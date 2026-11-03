// ---------------- PAGE NAVIGATION ----------------
const pages = document.querySelectorAll(".page");

function showPage(pageId) {
    pages.forEach(page => page.classList.remove("active"));
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.classList.add("active");

    // Stop the music when leaving the cassette scene? Keep it playing instead,
    // so the song can continue while exploring the other sections.
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
});

// ---------------- YOUR EXISTING PLAYLIST ----------------
const playlist = [
    { title: "IVOS - Captivated", src: "music/IV OF SPADES - Captivated (Official Audio).mp3" },
    { title: "Zild - Lia", src: "music/zild.mp3" },
    { title: "TONEEJAY - 711", src: "music/toneejay.mp3" }
];

let currentTrackIndex = 0;
const bgMusic = document.getElementById("bgMusic");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const trackTitle = document.getElementById("trackTitle");

function loadTrack(index) {
    bgMusic.src = playlist[index].src;
    trackTitle.textContent = playlist[index].title;
    bgMusic.load();
}

function playTrack() {
    bgMusic.play().then(() => {
        playPauseBtn.textContent = "⏸ Pause";
        document.querySelector(".cassette-shell")?.classList.add("playing");
    }).catch(error => {
        console.warn("Audio playback could not start. Check the music file path.", error);
    });
}

function pauseTrack() {
    bgMusic.pause();
    playPauseBtn.textContent = "▶ Play";
    document.querySelector(".cassette-shell")?.classList.remove("playing");
}

playPauseBtn.addEventListener("click", () => {
    if (bgMusic.paused) playTrack();
    else pauseTrack();
});

prevBtn.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
});

nextBtn.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
});

bgMusic.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
});

loadTrack(currentTrackIndex);

// ---------------- LETTER ENVELOPE ----------------
const envelopeWrapper = document.getElementById("envelopeWrapper");

envelopeWrapper.addEventListener("click", () => {
    const isOpen = envelopeWrapper.classList.toggle("flap");

    if (isOpen && typeof confetti === "function") {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f1c40f", "#e74c3c", "#e67e22", "#ffffff", "#ff6b6b"]
        });
    }
});

// ---------------- BIRTHDAY CAKE INTERACTION ----------------
const cakeArt = document.getElementById("cakeArt");
const wishButton = document.getElementById("wishButton");
const birthdayMessage = document.getElementById("birthdayMessage");

function blowCandles() {
    cakeArt.classList.add("candles-out");
    birthdayMessage.classList.add("show");
    wishButton.textContent = "Wish made! ♡";

    if (typeof confetti === "function") {
        confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.65 },
            colors: ["#f5b7c8", "#fff0b8", "#ffffff", "#d98ca5"]
        });
    }
}

wishButton.addEventListener("click", blowCandles);
cakeArt.addEventListener("click", blowCandles);
cakeArt.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") blowCandles();
});

// ---------------- MICROPHONE DETECTION FOR CANDLES ----------------
const enableMicBtn = document.getElementById("enableMicBtn");
const micStatus = document.getElementById("micStatus");

let audioContext;
let analyser;
let microphone;
let micStream;
let isMicListening = false;

async function initMicrophone() {
    if (isMicListening) return;

    try {
        // Request microphone access
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        // Initialize Web Audio API
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        microphone = audioContext.createMediaStreamSource(micStream);
        microphone.connect(analyser);

        isMicListening = true;
        enableMicBtn.style.display = "none";
        micStatus.textContent = "🎙️ Mic active! Blow into your microphone to put out the candles.";

        detectBlow();
    } catch (err) {
        console.error("Microphone access denied or error:", err);
        micStatus.textContent = "⚠️ Mic permission denied. You can still tap or click to blow candles!";
    }
}

function detectBlow() {
    if (!isMicListening) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate total average volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const averageVolume = sum / dataArray.length;

    // Threshold value for detecting a "blow" sound (Adjust between 40-70 if too sensitive)
    const BLOW_THRESHOLD = 50; 

    if (averageVolume > BLOW_THRESHOLD && !cakeArt.classList.contains("candles-out")) {
        blowCandles();
        stopMicrophone(); // Stop mic audio once the candles are blown out
        return;
    }

    // Keep listening as long as candles are not blown out
    if (!cakeArt.classList.contains("candles-out")) {
        requestAnimationFrame(detectBlow);
    }
}

function stopMicrophone() {
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    isMicListening = false;
    micStatus.textContent = "✨ Wish blown out successfully!";
}

// Enable mic when the user clicks the button
enableMicBtn.addEventListener("click", initMicrophone);

// Also auto-stop mic if the user clicks/taps manually instead
const originalBlowCandles = blowCandles;
blowCandles = function() {
    originalBlowCandles();
    stopMicrophone();
};