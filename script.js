document.addEventListener('DOMContentLoaded', () => {
  const DAYS = 21;
  const startDateEl = document.getElementById('startDate');
  const configForm = document.getElementById('configForm');
  const daysContainer = document.getElementById('daysContainer');
  const generateBtn = document.getElementById('generateBtn');
  const captureBtn = document.getElementById('captureBtn');
  const instructionP = document.querySelector('.instruction');

  const radioEls = Array.from(document.querySelectorAll('input[name="mode"]'));
  let emojiEditor = document.getElementById('emojiEditor');
  let colorEditor = document.getElementById('colorEditor');

  let emojiInputs = Array.from(document.querySelectorAll('.emoji-input'));
  let colorPickers = Array.from(document.querySelectorAll('.color-picker'));

  let dayBoxes = [];
  let currentDay = null;
  let gridGenerated = false;

  // --- flatpickr ---
  if (typeof flatpickr === 'function') {
    flatpickr(startDateEl, {
      dateFormat: "d/m/Y",
      allowInput: true,
      defaultDate: null,
      onClose: fp => fp.close(),
      onChange: fp => fp.close(),
      onReady: (selectedDates, dateStr, fp) => {
        if (fp && fp.calendarContainer) {
          fp.calendarContainer.style.fontFamily = "Montserrat, sans-serif";
          fp.calendarContainer.style.borderRadius = "12px";
          fp.calendarContainer.style.border = "2px solid #c19751";
          fp.calendarContainer.style.background = "#fff";
          fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => d.style.color = '#00008B');
        }
      }
    });
  }

  // --- Affichage éditeurs ---
  function showEditors() {
    const mode = document.querySelector('input[name="mode"]:checked')?.value || '';
    emojiEditor.classList.toggle('hidden', !(mode === 'emoji' || mode === 'both'));
    colorEditor.classList.toggle('hidden', !(mode === 'color' || mode === 'both'));
  }
  radioEls.forEach(r => r.addEventListener('change', showEditors));
  showEditors();

  // --- Mise à jour apparence d'une box ---
  function updateBoxAppearance(box) {
    const contentEl = box.querySelector('.mainContent');
    const txt = box.dataset.emoji || '';
    const isEmoji = txt.length > 0;

    if (contentEl) {
      contentEl.textContent = txt;
      contentEl.style.fontSize = isEmoji ? '34px' : '14px';
      contentEl.style.lineHeight = isEmoji ? '1' : '1.1';
      contentEl.style.fontFamily = isEmoji ? 'Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji,sans-serif' : 'inherit';
    }

    box.style.background = box.dataset.color || 'white';
    if (box.dataset.color && box.dataset.color.toLowerCase() !== 'white' && box.dataset.color !== '#ffffff') {
      box.classList.add('colored');
      box.style.color = '#fff';
    } else {
      box.classList.remove('colored');
      box.style.color = '#1d1d1d';
    }
  }

  function isPaletteFilled() {
    return emojiInputs.some(i => i.value.trim() !== '') || colorPickers.some(c => c.value.trim() !== '');
  }

  // --- Fonction pour récupérer l'emoji complet ---
  function getFullEmoji(str) {
    if (!str) return '';
    // Utilisation de grapheme-splitter pour prendre tout l'emoji complet
    // ou fallback simple : on prend la première séquence entière
    return [...str][0] || '';
  }

  // --- Création grille ---
  function createGrid(savedData = null) {
    if (!isPaletteFilled() && !savedData) return alert("Tu dois choisir au moins un emoji ou une couleur avant de générer la grille !");

    daysContainer.innerHTML = '';
    dayBoxes = [];
    currentDay = null;

    // --- restaurer date ---
    let startDate = null;
    if (savedData?.startDate) {
      startDate = parseDate(savedData.startDate);
      startDateEl.value = formatDateForInput(startDate);
    } else if (startDateEl.value) {
      startDate = parseDate(startDateEl.value);
    }

    for (let i = 0; i < DAYS; i++) {
      const box = document.createElement('div');
      box.className = 'dayBox';

      const contentEl = document.createElement('div');
      contentEl.className = 'mainContent';
      box.appendChild(contentEl);

      const dateEl = document.createElement('div');
      dateEl.className = 'dateLabel';
      box.appendChild(dateEl);

      if (startDate) {
        const d = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
        const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        dateEl.textContent = label;
        box.dataset.label = label;
        box.dataset.date = d.toISOString();
      } else {
        const label = `Jour ${i + 1}`;
        dateEl.textContent = label;
        box.dataset.label = label;
      }

      if (savedData?.days?.[i]) {
        const dayData = savedData.days[i];
        box.dataset.emoji = dayData.emoji || '';
        box.dataset.color = dayData.color || '';
        updateBoxAppearance(box);
      }

      box.addEventListener('click', () => {
        if (!isPaletteFilled()) return alert("Choisis au moins un emoji ou une couleur avant de sélectionner un jour !");
        dayBoxes.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        currentDay = box;
      });

      daysContainer.appendChild(box);
      dayBoxes.push(box);
      updateBoxAppearance(box);
    }

    gridGenerated = true;
    captureBtn.classList.remove('hidden');
    instructionP.classList.remove('hidden');

    radioEls.forEach(r => r.disabled = true);
    removeOverlays();

    if (savedData) {
      emojiInputs.forEach((inp, idx) => {
        inp.value = savedData.emojiInputs?.[idx] || inp.value;
      });
      colorPickers.forEach((p, idx) => {
        p.value = savedData.colorPickers?.[idx] || p.value;
      });
    }

    const mode = savedData?.mode || document.querySelector('input[name="mode"]:checked')?.value || '';
    if (mode === 'emoji' || mode === 'both') overlayEmoji();
    if (mode === 'color' || mode === 'both') overlayColor();

    attachInputListeners();
    generateBtn.textContent = 'Réinitialiser';
    saveToLocalStorage(mode);
  }

  // --- overlay emoji ---
  function overlayEmoji() {
    const overlay = document.createElement('div');
    overlay.id = 'emojiPaletteOverlay';
    overlay.className = 'editor-row';
    emojiInputs.forEach(inp => {
      if (!inp.value) return;
      const fullChar = getFullEmoji(inp.value);
      if (!fullChar) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn quick-palette';
      btn.style.width = '68px';
      btn.style.height = '68px';
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.fontSize = '34px';
      btn.textContent = fullChar;
      btn.addEventListener('click', () => {
        if (!currentDay) return alert('Clique d\'abord sur un jour.');
        currentDay.dataset.emoji = btn.textContent;
        updateBoxAppearance(currentDay);
        saveToLocalStorage(document.querySelector('input[name="mode"]:checked')?.value || 'both');
      });
      overlay.appendChild(btn);
    });
    emojiEditor.replaceWith(overlay);
    emojiEditor = document.getElementById('emojiPaletteOverlay');
  }

  // --- overlay couleur ---
  function overlayColor() {
    const overlay = document.createElement('div');
    overlay.id = 'colorPaletteOverlay';
    overlay.className = 'editor-row';
    colorPickers.forEach(p => {
      if (!p.value) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-btn quick-palette';
      btn.style.width = '68px';
      btn.style.height = '68px';
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.background = p.value;
      btn.addEventListener('click', () => {
        if (!currentDay) return alert('Clique d\'abord sur un jour.');
        currentDay.dataset.color = p.value;
        updateBoxAppearance(currentDay);
        saveToLocalStorage(document.querySelector('input[name="mode"]:checked')?.value || 'both');
      });
      overlay.appendChild(btn);
    });
    colorEditor.replaceWith(overlay);
    colorEditor = document.getElementById('colorPaletteOverlay');
  }

  function removeOverlays() {
    const oldEmojiOverlay = document.getElementById('emojiPaletteOverlay');
    if (oldEmojiOverlay) oldEmojiOverlay.remove();
    const oldColorOverlay = document.getElementById('colorPaletteOverlay');
    if (oldColorOverlay) oldColorOverlay.remove();
  }

  async function captureGrid() {
    if (!gridGenerated) return alert('Génère la grille d\'abord.');
    try {
      dayBoxes.forEach(b => b.classList.remove('selected'));
      const canvas = await html2canvas(daysContainer, { backgroundColor: null, useCORS: true, scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'vision-21-jours.png';
      link.click();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la capture. Réessaie.');
    }
  }

  function resetApp() {
    localStorage.removeItem('vision21Data');
    location.reload();
  }

  configForm.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!gridGenerated) {
      createGrid();
    } else {
      if (!confirm("Es-tu sûr de vouloir réinitialiser ?")) return;
      resetApp();
    }
  });

  function attachInputListeners() {
    emojiInputs.forEach(inp => {
      inp.addEventListener('input', ev => {
        if (!currentDay) return;
        const fullChar = getFullEmoji(ev.target.value);
        currentDay.dataset.emoji = fullChar;
        updateBoxAppearance(currentDay);
        saveToLocalStorage(document.querySelector('input[name="mode"]:checked')?.value || 'both');
      });
    });

    colorPickers.forEach(p => {
      p.addEventListener('input', () => {
        if (!currentDay) return;
        currentDay.dataset.color = p.value || '';
        updateBoxAppearance(currentDay);
        saveToLocalStorage(document.querySelector('input[name="mode"]:checked')?.value || 'both');
      });
    });
  }

  attachInputListeners();
  captureBtn.addEventListener('click', captureGrid);

  function saveToLocalStorage(mode = null) {
    const data = {
      startDate: startDateEl.value || null,
      days: dayBoxes.map(b => ({ emoji: b.dataset.emoji || '', color: b.dataset.color || '' })),
      emojiInputs: emojiInputs.map(i => i.value),
      colorPickers: colorPickers.map(c => c.value),
      mode: mode || document.querySelector('input[name="mode"]:checked')?.value || 'both'
    };
    localStorage.setItem('vision21Data', JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem('vision21Data');
    if (data) createGrid(JSON.parse(data));
  }

  // --- FIX BUG DATE ---
  function parseDate(input) {
    if (!input) return null;
    const parts = input.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  function formatDateForInput(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  loadFromLocalStorage();

  // --- date par défaut au jour actuel si vide ---
  if (!startDateEl.value) {
    const today = new Date();
    startDateEl.value = formatDateForInput(today);
  }
});