// Variables
let targetNumber = 0;
let attempts = 0;
let minRange = 1;
let maxRange = 100;

// ပွဲတစ်ပွဲမှာ ခန့်မှန်းလိုက်တဲ့ ဂဏန်းတွေ သိမ်းထားမယ်
let guessHistory = [];

// LocalStorage မှ Stats များ ဆွဲထုတ်ခြင်း
let stats = JSON.parse(localStorage.getItem('guessGameStats')) || { totalGames: 0, bestScore: null };

// အစပိုင်းတွင် Stats ပြသရန်
updateStatsUI();

// 1. ဂိမ်းစတင်ခြင်း (Range သတ်မှတ်ခြင်း)
function startGame() {
    minRange = parseInt(document.getElementById('minVal').value);
    maxRange = parseInt(document.getElementById('maxVal').value);

    if (isNaN(minRange) || isNaN(maxRange) || minRange >= maxRange) {
        alert("ကျေးဇူးပြု၍ မှန်ကန်သော ဂဏန်းများကို ထည့်ပါ။ (အစ ဂဏန်းသည် အဆုံးဂဏန်းထက် ငယ်ရပါမည်)");
        return;
    }

    // Random ဂဏန်းထုတ်ခြင်း
    targetNumber = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    attempts = 0;
    guessHistory = [];
    updateStatsUI();
    renderGuessHistory();

    // UI ပြောင်းခြင်း
    document.getElementById('displayMin').innerText = minRange;
    document.getElementById('displayMax').innerText = maxRange;
    
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
    const guess = parseInt(guessInput.value);
    const feedbackText = document.getElementById('feedbackText');

    if (isNaN(guess)) {
        feedbackText.innerText = "ဂဏန်းတစ်ခုခု ရိုက်ထည့်ပါဦး 🙄";
        shakeFeedback();
        return;
    }

    attempts++;
    updateStatsUI();

    let resultClass = '';

    if (guess > targetNumber) {
        feedbackText.innerText = "နည်းနည်း ကြီးနေပါတယ်... ထပ်လျော့ကြည့်ပါဦး 📉";
        feedbackText.style.color = "#d63031";
        shakeFeedback();
        resultClass = 'too-high';
    } else if (guess < targetNumber) {
        feedbackText.innerText = "နည်းနည်း ငယ်နေပါတယ်... ထပ်တိုးကြည့်ပါဦး 📈";
        feedbackText.style.color = "#0984e3";
        shakeFeedback();
        resultClass = 'too-low';
    } else {
        // အဖြေမှန်သွားသောအခါ
        resultClass = 'correct';
        handleWin();
    }

    // ခန့်မှန်းထားတဲ့ ဂဏန်းကို history ထဲ ထည့်ပြီး ပြသခြင်း
    guessHistory.push({ value: guess, cls: resultClass });
    renderGuessHistory();

    guessInput.value = '';
    guessInput.focus();
}

// 3. အဖြေမှန်သွားသောအခါ
function handleWin() {
    stats.totalGames++;
    
    // အကောင်းဆုံးစံချိန် သတ်မှတ်ခြင်း (စံချိန်မရှိသေးရင် သို့မဟုတ် လက်ရှိအကြိမ်က ပိုနည်းနေရင်)
    if (stats.bestScore === null || attempts < stats.bestScore) {
        stats.bestScore = attempts;
    }

    // LocalStorage သိမ်းခြင်း
    localStorage.setItem('guessGameStats', JSON.stringify(stats));
    updateStatsUI();

    // Modal ပြခြင်း
    document.getElementById('winMessage').innerHTML = `<strong>${attempts}</strong> ကြိမ်တည်းနဲ့ မှန်အောင် ခန့်မှန်းနိုင်ခဲ့ပါတယ်။ တော်လိုက်တာ 😘`;
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
        el.textContent = (index + 1) + '. ' + item.value;
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
    document.getElementById('totalGames').innerText = stats.totalGames;
    document.getElementById('bestScore').innerText = stats.bestScore === null ? "-" : stats.bestScore;
    document.getElementById('currentAttempts').innerText = attempts;
}

// နောက်တစ်ခါ ထပ်ဆော့ရန် (Modal ပိတ်ပြီး Range ပြန်ရွေးခိုင်းမည်)
function playAgain() {
    document.getElementById('winModal').classList.remove('active');
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