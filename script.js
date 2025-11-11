const DAYS = 21;
const EMOJIS = ["🏆","🌞","❤️","🌩️","⭐"];
const daysDiv = document.getElementById('days');
const emojiMenu = document.getElementById('emojiMenu');
let currentDayBox = null;

// créer les 21 cases
for (let i = 1; i <= DAYS; i++) {
  const box = document.createElement('div');
  box.className = 'dayBox';
  box.textContent = i;
  box.addEventListener('click', () => {
    currentDayBox = box;
    emojiMenu.classList.remove('hidden');
  });
  daysDiv.appendChild(box);
}

// choisir un émoji
EMOJIS.forEach((emoji, idx) => {
  const btn = document.getElementById(`emoji${idx+1}`);
  btn.addEventListener('click', () => {
    if (currentDayBox) currentDayBox.textContent = emoji;
    emojiMenu.classList.add('hidden');
  });
});
