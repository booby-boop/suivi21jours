const DAYS = 21;

const startForm = document.getElementById('startForm');
const startDateInput = document.getElementById('startDate');
const daysGrid = document.getElementById('daysGrid');
const generateBtn = document.getElementById('generateBtn');

const useColorsCheckbox = document.getElementById('useColors');
const useEmojisCheckbox = document.getElementById('useEmojis');

const colorMenu = document.getElementById('colorMenu');
const emojiMenu = document.getElementById('emojiMenu');

let currentBox = null;

// Afficher les menus selon les cases cochées
useColorsCheckbox.addEventListener('change', () => {
  colorMenu.classList.toggle('hidden', !useColorsCheckbox.checked);
});
useEmojisCheckbox.addEventListener('change', () => {
  emojiMenu.classList.toggle('hidden', !useEmojisCheckbox.checked);
});

// Génération de la grille
startForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!startDateInput.value) {
    alert("Merci de choisir une date de départ !");
    return;
  }

  // Si déjà généré, demander confirmation pour réinitialiser
  if (daysGrid.children.length > 0) {
    if (!confirm("Es-tu sûr de vouloir réinitialiser ?")) return;
    daysGrid.innerHTML = '';
    generateBtn.textContent = "Générer les 21 jours";
  }

  const startDate = new Date(startDateInput.value);

  for (let i = 0; i < DAYS; i++) {
    const dayBox = document.createElement('div');
    dayBox.className = 'dayBox';

    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    const dayStr = day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

    dayBox.textContent = dayStr;
    dayBox.addEventListener('click', () => {
      currentBox = dayBox;
      if (useColorsCheckbox.checked) colorMenu.classList.remove('hidden');
      if (useEmojisCheckbox.checked) emojiMenu.classList.remove('hidden');
    });
    daysGrid.appendChild(dayBox);
  }

  generateBtn.textContent = "Réinitialiser";
});

// Sélection couleur
document.querySelectorAll('.colorBox').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentBox) {
      currentBox.style.backgroundColor = btn.style.backgroundColor;
      currentBox.style.color = '#ffffff';
    }
  });
});

// Sélection emoji
document.querySelectorAll('.emojiBox').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentBox) currentBox.textContent = btn.textContent;
  });
});
