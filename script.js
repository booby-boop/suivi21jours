const DAYS = 21;
let EMOJIS = ["🏆","🌞","❤️","🌩️","⭐"];
let COLORS = ["#000000","#ff0000","#ffff00","#00ff00","#ff99cc"];

const daysDiv = document.getElementById('days');
const emojiMenu = document.getElementById('emojiMenu');
const startBtn = document.getElementById('startBtn');
const configForm = document.getElementById('configForm');
const emojiInputs = document.getElementById('emojiInputs');
const colorInputs = document.getElementById('colorInputs');

let currentDayBox = null;

// bascule entre emoji et couleur
document.getElementById('modeEmoji').addEventListener('change', () => {
  emojiInputs.classList.remove('hidden');
  colorInputs.classList.add('hidden');
});
document.getElementById('modeColor').addEventListener('change', () => {
  emojiInputs.classList.add('hidden');
  colorInputs.classList.remove('hidden');
});

// démarrer la Vision 21 Jours
startBtn.addEventListener('click', () => {
  // récupérer date de début
  const startDate = document.getElementById('startDate').value;

  // récupérer emojis personnalisés
  for(let i=1;i<=5;i++){
    EMOJIS[i-1] = document.getElementById(`emojiInput${i}`).value || EMOJIS[i-1];
    COLORS[i-1] = document.getElementById(`color${i}`).value || COLORS[i-1];
  }

  // masquer le formulaire
  configForm.classList.add('hidden');
  // afficher la grille
  daysDiv.classList.remove('hidden');

  // créer les 21 cases
  daysDiv.innerHTML = '';
  for (let i = 1; i <= DAYS; i++) {
    const box = document.createElement('div');
    box.className = 'dayBox';
    box.textContent = `Jour ${i}`;
    box.addEventListener('click', () => {
      currentDayBox = box;
      emojiMenu.classList.remove('hidden');
      // selon le mode choisi
      if(document.getElementById('modeColor').checked){
        EMOJIS = COLORS;
        for(let j=1;j<=5;j++){
          document.getElementById(`emoji${j}`).textContent = EMOJIS[j-1];
        }
      }
    });
    daysDiv.appendChild(box);
  }
});

// choisir un émoji / couleur
for(let i=1;i<=5;i++){
  document.getElementById(`emoji${i}`).addEventListener('click', () => {
    if(currentDayBox){
      currentDayBox.textContent = EMOJIS[i-1];
    }
    emojiMenu.classList.add('hidden');
  });
}
