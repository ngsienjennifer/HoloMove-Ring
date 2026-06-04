lucide.createIcons();

let seconds = 0;
let timer = null;

let breaks = 0;
let points = 0;
let progress = 35;
let ringConnected = true;
let battery = 82;

const timerDisplay = document.getElementById("timerDisplay");
const timerMode = document.getElementById("timerMode");
const hologramCard = document.getElementById("hologramCard");
const hologramTitle = document.getElementById("hologramTitle");
const hologramText = document.getElementById("hologramText");
const hologramIcon = document.getElementById("hologramIcon");

const breaksToday = document.getElementById("breaksToday");
const pointsToday = document.getElementById("pointsToday");
const movementBreaks = document.getElementById("movementBreaks");
const totalPoints = document.getElementById("totalPoints");
const totalSitting = document.getElementById("totalSitting");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const connectionText = document.getElementById("connectionText");
const connectionDot = document.getElementById("connectionDot");
const connectBtn = document.getElementById("connectBtn");
const ringStatusText = document.getElementById("ringStatusText");
const batteryText = document.getElementById("batteryText");
const batteryFill = document.getElementById("batteryFill");

const reminderInput = document.getElementById("reminderInput");
const goalSelect = document.getElementById("goalSelect");

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateUI() {
  timerDisplay.textContent = formatTime(seconds);

  breaksToday.textContent = breaks;
  pointsToday.textContent = points;
  movementBreaks.textContent = breaks;
  totalPoints.textContent = points;
  totalSitting.textContent = `${Math.floor(seconds / 60)} min`;

  progressFill.style.width = `${progress}%`;
  progressPercent.textContent = `${progress}%`;

  batteryText.textContent = ringConnected ? `${battery}%` : "--";
  batteryFill.style.width = ringConnected ? `${battery}%` : "0%";

  connectionText.textContent = ringConnected ? "Ring Connected" : "Ring Disconnected";
  connectBtn.textContent = ringConnected ? "Disconnect" : "Connect";
  ringStatusText.textContent = ringConnected
    ? "Your ring is connected and ready to detect inactivity."
    : "Ring is disconnected. Connect to start monitoring.";

  connectionDot.classList.toggle("off", !ringConnected);
}

function setHologram(state, title, text, iconName) {
  hologramCard.className = `hologram-card ${state}`;
  hologramTitle.textContent = title;
  hologramText.textContent = text;

  hologramIcon.setAttribute("data-lucide", iconName);
  lucide.createIcons();
}

function startTimer() {
  if (!ringConnected) {
    setHologram(
      "active",
      "Ring disconnected",
      "Please connect your Move Ring before starting a session.",
      "wifi-off"
    );
    return;
  }

  if (timer) return;

  timerMode.textContent = "Active";

  setHologram(
    "idle",
    "Monitoring started",
    "The ring is now checking for prolonged sitting.",
    "radar"
  );

  timer = setInterval(() => {
    seconds++;
    updateUI();

    const reminderMinutes = Number(reminderInput.value);
    const reminderSeconds = reminderMinutes * 60;

    if (seconds >= reminderSeconds) {
      triggerReminder();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
  timerMode.textContent = "Paused";
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 0;
  timerMode.textContent = "Ready";

  setHologram(
    "idle",
    "Hologram inactive",
    "Start a study session. The ring will prompt you after long sitting.",
    "sparkles"
  );

  updateUI();
}

function triggerReminder() {
  clearInterval(timer);
  timer = null;

  const goal = goalSelect.value;

  timerMode.textContent = "Move now";

  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  setHologram(
    "active",
    "Time to move!",
    `You've been sitting for too long. Goal: ${goal}`,
    "projector"
  );
}

function completeGoal() {
  if (!ringConnected) {
    setHologram(
      "active",
      "Ring disconnected",
      "Connect your ring before logging a movement goal.",
      "wifi-off"
    );
    return;
  }

  breaks += 1;
  points += 100;
  progress = Math.min(100, progress + 15);
  seconds = 0;

  timerMode.textContent = "Goal done";

  setHologram(
    "success",
    "Goal achieved!",
    "+100 points earned. Hologram powers down.",
    "badge-check"
  );

  updateUI();
}

function toggleConnection() {
  ringConnected = !ringConnected;

  if (!ringConnected) {
    clearInterval(timer);
    timer = null;
    timerMode.textContent = "Offline";

    setHologram(
      "active",
      "Ring disconnected",
      "Reconnect the Move Ring to continue monitoring inactivity.",
      "wifi-off"
    );
  } else {
    timerMode.textContent = "Ready";

    setHologram(
      "idle",
      "Ring connected",
      "Haptic reminder and hologram projection are ready.",
      "sparkles"
    );
  }

  updateUI();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-page").forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");

    const pageId = tab.dataset.tab;
    document.getElementById(pageId).classList.add("active");

    lucide.createIcons();
  });
});

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
document.getElementById("completeGoalBtn").addEventListener("click", completeGoal);
connectBtn.addEventListener("click", toggleConnection);

updateUI();
