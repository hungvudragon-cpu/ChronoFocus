// State & Constants
const MODES = {
  focus: { name: "Deep Focus", duration: 25 * 60, tag: "Flow State Active", color: "text-emerald-400" },
  short_break: { name: "Nghỉ ngắn", duration: 5 * 60, tag: "Recharge & Breathe", color: "text-teal-400" },
  long_break: { name: "Nghỉ dài", duration: 15 * 60, tag: "Mind Recovery", color: "text-indigo-400" }
};

const SOUNDSCAPES = [
  { id: "rain", name: "Mưa rừng Amazon", icon: "cloud-rain", desc: "Pink Noise dịu êm giúp át tiếng ồn xung quanh", color: "emerald" },
  { id: "alpha", name: "Sóng não Alpha (10Hz)", icon: "activity", desc: "Binaural beat kích thích trí nhớ & sáng tạo", color: "teal" },
  { id: "cosmic", name: "Cosmic Drone Deep", icon: "orbit", desc: "Hợp âm hài hòa không lời triệt tiêu xao nhãng", color: "purple" },
  { id: "fire", name: "Lửa trại & Gió đêm", icon: "flame", desc: "Tần số ấm cúng, thư giãn hệ thần kinh", color: "amber" }
];

const COACH_TIPS = [
  {
    title: "Quy tắc 2 phút khởi động",
    desc: "Nếu cảm thấy lười bắt đầu, hãy cam kết chỉ ngồi làm trong đúng 2 phút. Quán tính tâm lý sẽ giúp não bạn duy trì tập trung tự nhiên sau đó."
  },
  {
    title: "Tối ưu hóa Adenosine",
    desc: "Không gian làm việc sáng sủa và uống 1 ngụm nước lạnh kích thích dây thần kinh phế vị, giúp triệt tiêu cảm giác buồn ngủ giữa phiên."
  },
  {
    title: "Triệt tiêu xao nhãng chủ động",
    desc: "Để điện thoại ở một phòng khác hoặc úp màn hình xuống. Chỉ một cái liếc nhìn thông báo cũng làm mất tới 23 phút để não tìm lại trạng thái Flow."
  },
  {
    title: "Kỹ thuật Monotasking (Đơn nhiệm)",
    desc: "Não bộ không thực sự làm đa nhiệm được, nó chỉ chuyển ngữ cảnh liên tục gây kiệt sức. Ghim duy nhất 1 mục tiêu phiên bên dưới và chỉ làm nó."
  },
  {
    title: "Hít thở 4-7-8 khi chuyển phiên",
    desc: "Hít vào 4 giây, giữ 7 giây và thở ra 8 giây. Đây là nhịp thở hạ nhịp tim nhanh nhất, chuẩn bị tâm thế tối ưu trước khi bước vào Pomodoro mới."
  }
];

let currentMode = "focus";
let timeLeft = MODES.focus.duration;
let totalDuration = MODES.focus.duration;
let timerInterval = null;
let isRunning = false;
let isAudioActive = false;
let currentSoundId = "rain";

// Stats
let stats = {
  completedSessions: 0,
  totalMinutes: 0
};

// Elements
const timerDisplay = document.getElementById("timerDisplay");
const timerCircleProgress = document.getElementById("timerCircleProgress");
const sessionStatusTag = document.getElementById("sessionStatusTag");
const btnToggleTimer = document.getElementById("btnToggleTimer");
const timerPlayText = document.getElementById("timerPlayText");
const timerPlayIcon = document.getElementById("timerPlayIcon");
const btnResetTimer = document.getElementById("btnResetTimer");
const btnSkipTimer = document.getElementById("btnSkipTimer");
const modeTabBtns = document.querySelectorAll(".mode-tab-btn");
const soundscapeList = document.getElementById("soundscapeList");
const btnToggleMasterAudio = document.getElementById("btnToggleMasterAudio");
const masterAudioIcon = document.getElementById("masterAudioIcon");
const masterAudioText = document.getElementById("masterAudioText");
const activeSoundLabel = document.getElementById("activeSoundLabel");
const soundStatusDot = document.getElementById("soundStatusDot");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const waveformContainer = document.getElementById("waveformContainer");

// Coach & Goal Elements
const coachTitle = document.getElementById("coachTitle");
const coachText = document.getElementById("coachText");
const btnNewAdvice = document.getElementById("btnNewAdvice");
const sessionGoalInput = document.getElementById("sessionGoalInput");
const btnPinGoal = document.getElementById("btnPinGoal");
const pinnedGoalWrap = document.getElementById("pinnedGoalWrap");
const pinnedGoalText = document.getElementById("pinnedGoalText");
const btnRemoveGoal = document.getElementById("btnRemoveGoal");

// Stats Elements
const statCompleted = document.getElementById("statCompleted");
const statMinutes = document.getElementById("statMinutes");

// Render Waveform Bars
function initWaveform() {
  waveformContainer.innerHTML = "";
  for (let i = 0; i < 36; i++) {
    const bar = document.createElement("div");
    bar.className = "flex-1 bg-slate-800 rounded-full transition-all duration-300 h-2";
    bar.id = `waveBar_${i}`;
    waveformContainer.appendChild(bar);
  }
}

// Animate Waveform
let waveAnimationInterval = null;
function toggleWaveAnimation(active) {
  if (active) {
    if (!waveAnimationInterval) {
      waveAnimationInterval = setInterval(() => {
        for (let i = 0; i < 36; i++) {
          const bar = document.getElementById(`waveBar_${i}`);
          if (bar) {
            const h = Math.floor(Math.random() * 85) + 12;
            bar.style.height = `${h}%`;
            bar.className = "flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full transition-all duration-150";
          }
        }
      }, 150);
    }
  } else {
    clearInterval(waveAnimationInterval);
    waveAnimationInterval = null;
    for (let i = 0; i < 36; i++) {
      const bar = document.getElementById(`waveBar_${i}`);
      if (bar) {
        bar.style.height = "8%";
        bar.className = "flex-1 bg-slate-800 rounded-full transition-all duration-300";
      }
    }
  }
}

// Render Soundscapes
function renderSoundscapes() {
  soundscapeList.innerHTML = "";
  SOUNDSCAPES.forEach(snd => {
    const isSelected = snd.id === currentSoundId;
    const card = document.createElement("div");
    card.className = `p-3.5 rounded-2xl border cursor-pointer transition-all ${
      isSelected
        ? "bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10"
        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
    }`;
    card.onclick = () => selectSoundscape(snd.id);

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl ${isSelected ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300'} flex items-center justify-center shrink-0 transition-colors">
          <i data-lucide="${snd.icon}" class="w-4 h-4"></i>
        </div>
        <div class="truncate">
          <h4 class="text-xs font-bold text-white truncate">${snd.name}</h4>
          <p class="text-[10px] text-slate-400 truncate mt-0.5">${snd.desc}</p>
        </div>
      </div>
    `;
    soundscapeList.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

function selectSoundscape(id) {
  currentSoundId = id;
  const snd = SOUNDSCAPES.find(s => s.id === id);
  activeSoundLabel.textContent = snd ? snd.name : "Âm thanh tùy chọn";
  renderSoundscapes();

  if (isAudioActive && window.soundEngine) {
    window.soundEngine.playSound(id);
  }
}

// Format seconds into MM:SS
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Update Radial Progress
function updateProgress() {
  timerDisplay.textContent = formatTime(timeLeft);
  const circumference = 660; // 2 * PI * 105
  const fraction = timeLeft / totalDuration;
  const offset = circumference - fraction * circumference;
  timerCircleProgress.style.strokeDashoffset = offset;
}

// Timer Loop
function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateProgress();
  } else {
    // Session Done!
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timerPlayText.textContent = "Bắt đầu Focus";
    timerPlayIcon.setAttribute("data-lucide", "play");

    if (window.soundEngine) {
      window.soundEngine.playCompletionChime();
    }

    if (window.confetti) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }

    if (currentMode === "focus") {
      stats.completedSessions++;
      stats.totalMinutes += Math.round(MODES.focus.duration / 60);
      statCompleted.textContent = stats.completedSessions;
      statMinutes.textContent = `${stats.totalMinutes}m`;
    }

    alert(`🎉 Phiên ${MODES[currentMode].name} đã hoàn tất xuất sắc!`);
    if (window.lucide) lucide.createIcons();
  }
}

// Start / Pause
function toggleTimer() {
  if (isRunning) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timerPlayText.textContent = "Tiếp tục";
    timerPlayIcon.setAttribute("data-lucide", "play");
    sessionStatusTag.textContent = "Tạm dừng";
    sessionStatusTag.className = "text-xs font-bold uppercase tracking-widest text-amber-400 mt-2";
  } else {
    // Start
    isRunning = true;
    timerPlayText.textContent = "Tạm dừng";
    timerPlayIcon.setAttribute("data-lucide", "pause");
    sessionStatusTag.textContent = MODES[currentMode].tag;
    sessionStatusTag.className = "text-xs font-bold uppercase tracking-widest text-emerald-400 mt-2";
    timerInterval = setInterval(tick, 1000);

    // Auto trigger audio if not playing
    if (!isAudioActive) {
      toggleAudio();
    }
  }
  if (window.lucide) lucide.createIcons();
}

// Reset
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  timeLeft = MODES[currentMode].duration;
  totalDuration = timeLeft;
  timerPlayText.textContent = "Bắt đầu Focus";
  timerPlayIcon.setAttribute("data-lucide", "play");
  sessionStatusTag.textContent = MODES[currentMode].tag;
  updateProgress();
  if (window.lucide) lucide.createIcons();
}

// Switch Mode
function setMode(modeKey) {
  if (!MODES[modeKey]) return;
  currentMode = modeKey;
  modeTabBtns.forEach(btn => {
    if (btn.getAttribute("data-mode") === modeKey) {
      btn.className = "mode-tab-btn px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 text-black shadow-md transition-all";
    } else {
      btn.className = "mode-tab-btn px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white transition-all";
    }
  });
  resetTimer();
}

// Audio Toggle
function toggleAudio() {
  if (!window.soundEngine) return;
  if (isAudioActive) {
    window.soundEngine.stopAll();
    isAudioActive = false;
    masterAudioText.textContent = "Bật Âm Thanh";
    masterAudioIcon.setAttribute("data-lucide", "volume-x");
    soundStatusDot.className = "w-2 h-2 rounded-full bg-slate-600";
    toggleWaveAnimation(false);
  } else {
    window.soundEngine.playSound(currentSoundId);
    isAudioActive = true;
    masterAudioText.textContent = "Tắt Âm Thanh";
    masterAudioIcon.setAttribute("data-lucide", "volume-2");
    soundStatusDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-ping";
    toggleWaveAnimation(true);
  }
  if (window.lucide) lucide.createIcons();
}

// Goal Pinning
btnPinGoal.addEventListener("click", () => {
  const val = sessionGoalInput.value.trim();
  if (!val) return;
  pinnedGoalText.textContent = val;
  pinnedGoalWrap.classList.remove("hidden");
  sessionGoalInput.value = "";
  if (window.lucide) lucide.createIcons();
});

btnRemoveGoal.addEventListener("click", () => {
  pinnedGoalWrap.classList.add("hidden");
  pinnedGoalText.textContent = "";
});

// Random Tip
btnNewAdvice.addEventListener("click", () => {
  const randomTip = COACH_TIPS[Math.floor(Math.random() * COACH_TIPS.length)];
  coachTitle.textContent = randomTip.title;
  coachText.textContent = randomTip.desc;
});

// Event Listeners
btnToggleTimer.addEventListener("click", toggleTimer);
btnResetTimer.addEventListener("click", resetTimer);
btnSkipTimer.addEventListener("click", () => {
  if (currentMode === "focus") setMode("short_break");
  else setMode("focus");
});

modeTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    setMode(btn.getAttribute("data-mode"));
  });
});

btnToggleMasterAudio.addEventListener("click", toggleAudio);

volumeSlider.addEventListener("input", (e) => {
  const val = e.target.value / 100;
  volumeValue.textContent = `${e.target.value}%`;
  if (window.soundEngine) {
    window.soundEngine.setVolume(val);
  }
});

// Init
initWaveform();
renderSoundscapes();
updateProgress();
if (window.lucide) lucide.createIcons();
