// Hosted MP3 URL
const AUDIO_URL = "https://maddiep88.github.io/rave-overlay/LGO.mp3";

// Overlay duration 32s
const OVERLAY_DURATION_MS = 32000;

// Flicker tuning (subtle, non-strobe)
const FLICKER = {
  minDelay: 80, // fastest time between flicker steps
  maxDelay: 220, // slowest time between flicker steps
  minOpacity: 0.16, // dimmest brightness while active
  maxOpacity: 0.3, // brightest brightness while active
  smoothMs: 140, // should match CSS transition time
};

const overlay = document.getElementById("overlay");
const label = document.getElementById("label");
const audio = document.getElementById("audio");

audio.src = AUDIO_URL;
audio.volume = 0.85;

let flickerTimer = null;
let hideTimer = null;
let isActive = false;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function setOverlayOpacity(value) {
  const v = clamp(value, 0, 1);
  overlay.style.opacity = String(v);
}

function showOverlay(text = "") {
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  label.textContent = text;
}

function hideOverlay() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  label.textContent = "";
  setOverlayOpacity(0);
}

function stopFlicker() {
  if (flickerTimer) clearTimeout(flickerTimer);
  flickerTimer = null;
}

function startFlicker() {
  stopFlicker();

  const step = () => {
    if (!isActive) return;

    // small, smooth random variation
    const next = rand(FLICKER.minOpacity, FLICKER.maxOpacity);
    setOverlayOpacity(next);

    const delay = Math.floor(rand(FLICKER.minDelay, FLICKER.maxDelay));
    flickerTimer = setTimeout(step, delay);
  };

  // initial
  setOverlayOpacity(FLICKER.minOpacity);
  step();
}

async function playAudioFromStart() {
  try {
    audio.pause();
    audio.currentTime = 0;
    await audio.play();
  } catch (err) {
    console.warn("Audio play blocked or failed:", err);
  }
}

function clearTimers() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = null;
}

async function triggerCommunityGift({ gifterName, amount }) {
  // If already active, restart cleanly
  clearTimers();
  stopFlicker();

  isActive = true;

  const who = gifterName ? `${gifterName}` : "Someone";
  const msg = amount ? `${who} gifted ${amount} subs!` : `${who} gifted subs!`;

  showOverlay(msg);
  startFlicker();
  await playAudioFromStart();

  hideTimer = setTimeout(() => {
    isActive = false;
    stopFlicker();
    hideOverlay();
    audio.pause();
  }, OVERLAY_DURATION_MS);
}
