// Variables
let targetNumber = 0;
let attempts = 0;
let minRange = 1;
let maxRange = 100;

// A1: အကြိမ်ရေ ကန့်သတ်ချက်
let maxGuesses = 9;
// C4: ခန့်မှန်းချို့အအောက် ဖြတ်ထားသော နယ် (possible range)
let lowPossible = 1;
let highPossible = 100;
// A2: အကျန်ရှိသော အကြံပြု (hint) အကြိမ်ရေ
let hintsLeft = 3;

// ဂဏန်းကို ၃ လုံးတစ်ချက် ကော်မာ (,) ခွဲပြီး ပြသရန်
// ဉပမာ: 1000 -> 1,000, 1000000 -> 1,000,000
function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
}

// ပွဲတစ်ပွဲမှာ ခန့်မှန်းလိုက်တဲ့ ဂဏန်းတွေ သိမ်းထားမယ်
let guessHistory = [];

// LocalStorage မှ Stats များ ဆွဲထုတ်ခြင်း
let stats = JSON.parse(localStorage.getItem('guessGameStats')) || { totalGames: 0, bestScore: null, totalScore: 0 };
if (typeof stats.totalScore !== 'number') stats.totalScore = 0;

// အစပိုင်းတွင် Stats ပြသရန်
updateStatsUI();

// 1.1 အအဆင့်အတိုင်း ချက်ချင်း ဂိမ်းစခြင်း
// ဉပမာ: startQuickGame(100) -> 1 မှ 100 ကြား
function startQuickGame(maxValue) {
    document.getElementById('minVal').value = 1;
    document.getElementById('maxVal').value = maxValue;
    startGame(); // setup logic အားလုံးကို ပြန်သုံးသည်
}

// 1. ဂိမ်းစတင်ခြင်း (Range သတ်မှတ်ခြင်း)
function startGame() {
    const minVal = document.getElementById('minVal').value;
    const maxVal = document.getElementById('maxVal').value;

    const minParsed = Number(minVal);
    const maxParsed = Number(maxVal);

    // ရှည်ထည့်ထားရင် နံပါတ်မဟုတ်ရင်
    if (minVal.trim() === '' || maxVal.trim() === '' || !Number.isFinite(minParsed) || !Number.isFinite(maxParsed)) {
        showSetupError("ကျေးဇူးပြုပါ၍ မှန်ကန်သော ဂဏန်းများကို ထည့်ပါ။");
        return;
    }

    // ကိန်းပြည် (Whole number) / Integer သာ လက်ခံသည်
    if (!Number.isInteger(minParsed) || !Number.isInteger(maxParsed)) {
        showSetupError("ကိန်းပြည်သာ ထည့်ပါ။ (ဥပမာ -1, 1.5, 2.7 စသည့် ကိန်းတွေ မထည့်ရ)");
        return;
    }

    // အစဂဏန်းသည် 1 အောက် ငယ်လို့မရ
    if (minParsed < 1) {
        showSetupError("အစဂဏန်းသည် 1 ထက်ငယ်လို့မရပါ။ (အနည်းဆုံး 1 ထားပါ)");
        return;
    }

    // အစသည် အဆုံးထက် ငယ်ရမည်
    if (minParsed >= maxParsed) {
        showSetupError("အစဂဏန်းသည် အဆုံးဂဏန်းထက် ငယ်ရပါမည်။");
        return;
    }

    // Range နှစ်ခု ကြားက ခြားနားမှုသည် အနည်းဆုံး 48 ရှိရမည်
    if (((maxParsed - minParsed)-1) < 48) {
        showSetupError("အစဂဏန်းနှင့် အဆုံးဂဏန်းကြားက ခြားနားမှုသည် အနည်းဆုံး 48 ရှိရမည်။");
        return;
    }

    // Error ရှိရင် ဖျောက်ပြီး ဂိမ်းစတင်မည်
    hideSetupError();

    minRange = minParsed;
    maxRange = maxParsed;

    // A1: Range အကြီးအသိမ် အလက်အကြိမ်ရေ ကန့်သတ်ချက် တွက်ခြင်း
    const rangeSize = maxRange - minRange + 1;
    maxGuesses = Math.ceil(Math.log2(rangeSize)) + 2;

    // C4: ဖြတ်ထားသော နယ်ကို အလိုက်အလိုက် reset
    lowPossible = minRange;
    highPossible = maxRange;

    // A2: အကြံပြု အကြိမ်ရေ reset
    hintsLeft = 3;

    // Random ဂဏန်းထုတ်ခြင်း
    targetNumber = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    attempts = 0;
    guessHistory = [];
    updateStatsUI();
    updateGameHUD();
    renderGuessHistory();

    // Hint button ပြန်ဖွင့်ခြင်း
    document.getElementById('hintBtn').disabled = false;
    document.getElementById('hintBtn').innerHTML = '💡 အအကြံပြု (x3)';
    document.getElementById('hintBtn').style.opacity = '1';

    // UI ပြောင်းခြင်း
    document.getElementById('displayMin').innerText = formatNumber(minRange);
    document.getElementById('displayMax').innerText = formatNumber(maxRange);
    
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    
    document.getElementById('guessVal').value = '';
    document.getElementById('feedbackText').innerText = '';
    document.getElementById('guessVal').focus();
    
    // Console မှာ အဖြေခိုးကြည့်ချင်ရင် ဖွင့်ထားလို့ရပါတယ် 😂
    // console.log("Target Number:", targetNumber);
}

// 2. ခန့်မှန်းခြင်း စစ်ဆေးခြင်း
function checkGuess() {
    const guessInput = document.getElementById('guessVal');
    const guessInputValue = guessInput.value;
    const guess = Number(guessInputValue);
    const feedbackText = document.getElementById('feedbackText');

    if (guessInputValue.trim() === '' || !Number.isFinite(guess)) {
        feedbackText.innerText = "ဂဏန်းတစ်ခုခု ရိုက်ထည့်ပါဦး 🙄";
        shakeFeedback();
        return;
    }

    // ကိန်းပြည် (Integer) သာ လက်ခံသည် - decimal/fraction မလက်ခံပါ
    if (!Number.isInteger(guess)) {
        feedbackText.innerText = "ကိန်းပြည်သာ ထည့်ပါဦး 🙅 (-1, 1.5 လို ကိန်းတွေ မထည့်ရ)";
        feedbackText.style.color = "#d63031";
        shakeFeedback();
        return;
    }

// ဂဏန်းသည် သတ်မှတ်ထားသော Range ထဲမှာသာ ရှိရမည်
    if (guess <= minRange || guess >= maxRange) {
        feedbackText.innerText = "ဂဏန်းက " + formatNumber(minRange) + " ကနေ " + formatNumber(maxRange) + " ကြားမှာသာ ထည့်လို့ရပါတယ် 🙅";
        feedbackText.style.color = "#d63031";
        shakeFeedback();
        return;
    }
    attempts++;
    updateStatsUI();

    let resultClass = '';

    if (guess > targetNumber) {
        // C4: 'ကြီးလွန်း' → ဖြတ်ထားသော နယ် အမြင့်ကို လျော့ပြီး binary-search အတိုင်း ပြတင်း
        highPossible = guess - 1;
        feedbackText.innerText = "နည်းနည်း ကြီးနေပါတယ်... ထပ်လျော့ကြည့်ပါဦး 📉";
        feedbackText.style.color = "#d63031";
        shakeFeedback();
        resultClass = 'too-high';
    } else if (guess < targetNumber) {
        // C4: 'ငယ်လွန်း' → ဖြတ်ထားသော နယ် အနိမ့်ကို တိုးပြီး binary-search အတိုင်း ပြတင်း
        lowPossible = guess + 1;
        feedbackText.innerText = "နည်းနည်း ငယ်နေပါတယ်... ထပ်တိုးကြည့်ပါဦး 📈";
        feedbackText.style.color = "#0984e3";
        shakeFeedback();
        resultClass = 'too-low';
    } else {
        // အဖြေမှန်သွားသောအခါ
        resultClass = 'correct';
        handleWin();
    }

    // A1: အကြိမ်ရေ ကုန်သွားရင် Game Over
    if (resultClass !== 'correct' && attempts >= maxGuesses) {
        handleGameOver();
    }

    updateGameHUD();

    // ခန့်မှန်းထားတဲ့ ဂဏန်းကို history ထဲ ထည့်ပြီး ပြသခြင်း
    guessHistory.push({ value: guess, cls: resultClass });
    renderGuessHistory();
    if (resultClass !== 'correct') {
        guessInput.focus();
    }

    guessInput.value = '';
}

// 3. အဖြေမှန်သွားသောအခါ
function handleWin() {
    stats.totalGames++;
    
    // အကောင်းဆုံးစံချိန် သတ်မှတ်ခြင်း (စံချိန်မရှိသေးရင် သို့မဟုတ် လက်ရှိအကြိမ်က ပိုနည်းနေရင်)
    if (stats.bestScore === null || attempts < stats.bestScore) {
        stats.bestScore = attempts;
    }

    // A3: အရတ်စန္တ (Score) တွက်ပြီး အစုစုပေါင်း ထည့်ခြင်း
    const scoreGained = calculateScore();
    stats.totalScore += scoreGained;

    // LocalStorage သိမ်းခြင်း
    localStorage.setItem('guessGameStats', JSON.stringify(stats));
    updateStatsUI();

    // Modal ပြခြင်း
    document.getElementById('winMessage').innerHTML =
        `<strong>${formatNumber(attempts)}</strong> ကြိမ်တည်းနဲ့ မှန်အောင် ခန့်မှန်းနိုင်ခဲ့ပါတယ်။ တော်လိုက်တာ 😘<br>✨ +<strong>${formatNumber(scoreGained)}</strong> အဂိုး ရရှိခဲ့ပါတယ်!`;
    document.getElementById('winModal').classList.add('active');

    // Confetti ပန်းပွင့်များ
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

// Enter ခလုတ်နှိပ်လျှင်ပါ အလုပ်လုပ်စေရန်
function handleEnter(event) {
    if (event.key === 'Enter') {
        checkGuess();
    }
}

// B2: အကီးဘုဒ် အချစား (Keyboard shortcut)
// H = အကြံပြု, R = နောက်ဆုတ်  (input ထဲမှာ ရိုက်နေချိန်မှာ မဖြစ်စေရန်)
function handleGlobalKey(e) {
    const inGame = document.getElementById('gameSection').style.display === 'block';
    if (!inGame) return;
    const focusedInput = document.activeElement && document.activeElement.tagName === 'INPUT';
    if (focusedInput) return;

    if (e.key === 'h' || e.key === 'H') {
        giveHint();
    } else if (e.key === 'r' || e.key === 'R') {
        resetSetup();
    }
}
document.addEventListener('keydown', handleGlobalKey);

// A1: Range အကြီးအသိမ် အလက်အကြိမ်ရေ ကန့်သတ်ချက်
function calculateMaxGuesses() {
    const rangeSize = maxRange - minRange + 1;
    maxGuesses = Math.ceil(Math.log2(rangeSize)) + 2;
}

// A3: အရတ်စန္တ (Score) တွက်ခြင်း — အကြိမ်ရေ အနညင့်လေ, အခဲတဲ့ level ဖြစ်လေ အဂိုး အမြင့်လေ
function calculateScore() {
    const rangeSize = maxRange - minRange + 1;
    let multiplier = 1;
    if (rangeSize > 100000) multiplier = 5;
    else if (rangeSize > 10000) multiplier = 4;
    else if (rangeSize > 1000) multiplier = 3;
    else if (rangeSize > 100) multiplier = 2;
    const base = Math.max(1, maxGuesses - attempts + 1);
    return base * multiplier;
}

// C4 + A1: HUD (ဖြတ်ထားသော နယ် / အလက Spencer အကြိမ်ရေ) update
function updateGameHUD() {
    document.getElementById('possibleRange').innerText =
        formatNumber(lowPossible) + ' – ' + formatNumber(highPossible);
    const left = Math.max(0, maxGuesses - attempts);
    const el = document.getElementById('guessesLeft');
    el.innerText = formatNumber(left);
    el.style.color = left <= 2 ? '#d63031' : '#0984e3';
}

// A2: အကြံပြု (Hint) — ဖြတ်ထားသော နယ်ကို အဝက်အတောင်းအလောက် လျော့ပြီး target အနီးကို ညွှန်ပေးသည်
function giveHint() {
    if (document.getElementById('gameSection').style.display !== 'block') return;
    if (hintsLeft <= 0) {
        document.getElementById('feedbackText').innerText = "အကြံပြု အကုန်သွားပါပြီ 🙅";
        shakeFeedback();
        return;
    }
    if (targetNumber === 0) return; // game မစသေးချိန်

    hintsLeft--;
    const mid = Math.floor((lowPossible + highPossible) / 2);
    const fb = document.getElementById('feedbackText');

    if (targetNumber <= mid) {
        highPossible = mid;
        fb.innerText = "💡 ဂဏန်းသည် " + formatNumber(lowPossible) + " နဲ့ " + formatNumber(highPossible) + " ကြားမှာ ရှိပါတယ်။";
    } else {
        lowPossible = mid + 1;
        fb.innerText = "💡 ဂဏန်းသည် " + formatNumber(lowPossible) + " နဲ့ " + formatNumber(highPossible) + " ကြားမှာ ရှိပါတယ်။";
    }
    fb.style.color = "#9b59b6";

    updateGameHUD();
    const btn = document.getElementById('hintBtn');
    btn.innerHTML = '💡 အအကြံပြု (x' + hintsLeft + ')';
    if (hintsLeft <= 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

// A1: Game Over ဖြစ်ချိန်
function handleGameOver() {
    document.getElementById('gameOverMessage').innerText =
        "မှန်တဲ့ ဂဏန်းက " + formatNumber(targetNumber) + " ဖြစ်ခဲ့ပါတယ်။ အကြိမ်ရေ အကုန်သွားပါပြီ 😅 နောက်တစ်ခါ ထပ်ကြိုးစားပါဦး 💪";
    document.getElementById('gameOverModal').classList.add('active');
}

// Feedback စာသားကို တုန်ခါစေရန် (Animation)
function shakeFeedback() {
    const fb = document.getElementById('feedbackText');
    fb.classList.remove('shake');
    void fb.offsetWidth; // trigger reflow
    fb.classList.add('shake');
}
// ခန့်မှန်းခဲ့သော ဂဏန်းများကို ပြန်ပြခြင်း
function renderGuessHistory() {
    const list = document.getElementById('guessHistoryList');

    if (guessHistory.length === 0) {
        list.innerHTML = '<span class="history-empty">ဂဏန်းတွေ ခန့်မှန်းလိုက်တာတွေ ဒီမှာ ပေါ်လာမှာပါ 👇</span>';
        return;
    }

    list.innerHTML = '';
    guessHistory.forEach(function (item, index) {
        const el = document.createElement('span');
        el.className = 'history-item ' + item.cls;
        el.textContent = (index + 1) + '. ' + formatNumber(item.value);
        list.appendChild(el);
    });

    // အောက်ဆုံးကို အလိုအလျောက် scroll
    const container = document.getElementById('historyContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Stats UI အမြဲတမ်း Update လုပ်ပေးရန်
function updateStatsUI() {
    document.getElementById('totalGames').innerText = formatNumber(stats.totalGames);
    document.getElementById('bestScore').innerText = stats.bestScore === null ? "-" : formatNumber(stats.bestScore);
    document.getElementById('currentAttempts').innerText = formatNumber(attempts);
    document.getElementById('totalScore').innerText = formatNumber(stats.totalScore);
}

// Setup section မှာ inline error ပြခြင်း
function showSetupError(message) {
    const el = document.getElementById('setupError');
    el.innerHTML = '⚠️ ' + message;
    el.classList.add('show');
}

// Setup section မှာ inline error ဖျောက်ခြင်း
function hideSetupError() {
    const el = document.getElementById('setupError');
    el.innerHTML = '';
    el.classList.remove('show');
}

// နောက်တစ်ခါ ထပ်ဆော့ရန် (Modal ပိတ်ပြီး Range ပြန်ရွေးခိုင်းမည်)
function playAgain() {
    document.getElementById('winModal').classList.remove('active');
    document.getElementById('gameOverModal').classList.remove('active');
    resetSetup();
}

// အစသို့ ပြန်သွားရန်
function resetSetup() {
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    attempts = 0;
    guessHistory = [];
    renderGuessHistory();
    updateStatsUI();
}