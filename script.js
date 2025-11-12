const DAYS = 21;
const daysDiv = document.getElementById('days');
const selectionMenu = document.getElementById('selectionMenu');
const colorChoices = document.getElementById('colorChoices');
const emojiChoices = document.getElementById('emojiChoices');
const useColors = document.getElementById('useColors');
const useEmojis = document.getElementById('useEmojis');
const startDateInput = document.getElementById('startDateInput');
const generateBtn = document.getElementById('generateDays');

let currentDayBox = null;

// afficher les options selon les cases cochées
function updateMenuOptions() {
  colorChoices.classList.toggle('hidden', !useColors.checked);
  emojiChoices.classList.toggle('hidden', !useEmojis.checked);
}
useColors.addEventListener('change', updateMenuOptions);
useEmojis.addEventListener('change', updateMenuOptions);

// générer les jours
generateBtn.addEventListener('click', () => {
  const startDate = new Date(startDateInput.value);
  if (isNaN(startDate)) {
    alert("Merci de choisir une date de départ !");
    return;
  }
  daysDiv.innerHTML = '';
  for (let i = 0; i < DAYS; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const box = document.createElement('div');
    box.className = 'dayBox';
    box.dataset.date = date.toLocaleDateString('fr-FR');
    box.textContent = box.dataset.date;
    box.addEventListener('click', () => {
      currentDayBox = box;
      selectionMenu.classList.remove('hidden');
      updateMenuOptions();
    });
    daysDiv.appendChild(box);
  }
});

// appliquer couleur
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentDayBox) {
      currentDayBox.style.backgroundColor = btn.style.backgroundColor;
      selectionMenu.classList.add('hidden');
    }
  });
});

// appliquer émoji
document.querySelectorAll('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentDayBox) {
      currentDayBox.textContent = btn.textContent;
      selectionMenu.classList.add('hidden');
    }
  });
});
