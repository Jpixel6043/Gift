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

// --- MICROPHONE BLOW DETECTION FOR BIRTHDAY CAKE ---
const enableMicBtn = document.getElementById('enableMicBtn');
const micStatus = document.getElementById('micStatus');

let audioContext = null;
let microphone = null;
let analyser = null;
let javascriptNode = null;
let isListening = false;

// Function to put out the candles
function extinguishCandles() {
    cakeArt.classList.add('candles-out');
    birthdayMessage.classList.add('show');
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    stopListening();
}

// Manual click fallback
cakeArt.addEventListener('click', extinguishCandles);
wishButton.addEventListener('click', extinguishCandles);

// Enable Mic Listener
enableMicBtn.addEventListener('click', async () => {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Microphone API is not supported in this browser.");
            return;
        }

        micStatus.textContent = "Requesting microphone access...";
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            
            let values = 0;
            for (let i = 0; i < array.length; i++) {
                values += array[i];
            }
            const average = values / array.length;

            // Threshold for blowing detection (adjust sensitivity here if needed)
            if (average > 45 && !cakeArt.classList.contains('candles-out')) {
                extinguishCandles();
            }
        };

        isListening = true;
        micStatus.textContent = "🎙️ Mic active! Try blowing into your mic.";
        enableMicBtn.style.display = 'none';

    } catch (err) {
        console.error("Microphone access denied or error:", err);
        micStatus.textContent = "Microphone access denied or unavailable.";
    }
});

function stopListening() {
    if (isListening && audioContext) {
        if (microphone && microphone.mediaStream) {
            microphone.mediaStream.getTracks().forEach(track => track.stop());
        }
        audioContext.close();
        isListening = false;
        micStatus.textContent = "🎂 Candles blown out!";
    }
}