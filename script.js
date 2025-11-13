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

  // --- rendre le placeholder visible si Flatpickr interfère ---
  if (startDateEl) {
    startDateEl.setAttribute('placeholder', 'Date de départ');
  }

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
      contentEl.textContent = box.dataset.emoji || '';
      contentEl.style.fontSize = isEmoji ? '34px' : '14px';
      contentEl.style.lineHeight = isEmoji ? '1' : '1.1';
      contentEl.style.display = 'block';
      contentEl.style.textAlign = 'center';
      contentEl.style.width = '100%';
    }

    box.style.background = box.dataset.color || 'white';

    if (box.dataset.color && box.dataset.color !== 'white' && box.dataset.color !== '#ffffff') {
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

  // --- Création grille ---
  function createGrid(savedData = null) {
    if (!isPaletteFilled() && !savedData) return alert("Tu dois choisir au moins un emoji ou une couleur avant de générer la grille !");

    // reset
    daysContainer.innerHTML = '';
    dayBoxes = [];
    currentDay = null;

    // --- restaurer date ---
    let startDate = null;
    if (savedData?.startDate) {
      startDate = parseDate(savedData.startDate);
      startDateEl.value = startDate ? formatDateForInput(startDate) : '';
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

      // restaurer données sauvegardées
      if (savedData?.days?.[i]) {
        const dayData = savedData.days[i];
        box.dataset.emoji = dayData.emoji || '';
        box.dataset.color = dayData.color || '';
        updateBoxAppearance(box); // met à jour l'affichage immédiatement
      }

      // --- IMPORTANT : on **n'empêche plus** la sélection du jour ; on sélectionne d'abord la case ---
      box.addEventListener('click', () => {
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

    // --- désactiver radios après génération ---
    radioEls.forEach(r => r.disabled = true);

    removeOverlays();

    // --- restaurer palettes personnalisées ---
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

  // --- Overlay emojis (taille & centrage pour éviter demi-emoji) ---
  function overlayEmoji() {
    const overlay = document.createElement('div');
    overlay.id = 'emojiPaletteOverlay';
    overlay.className = 'editor-row';
    emojiInputs.forEach(inp => {
      if (!inp.value) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn quick-palette';

      // styles pour éviter demi-emoji : centrer et line-height = taille
      btn.style.width = '68px';
      btn.style.height = '68px';
      btn.style.minWidth = '48px';
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';

      // taille responsive de l'emoji, calcule un nombre sûr entre 28 et 48
      const base = Math.max(28, Math.min(48, Math.floor(window.innerWidth * 0.08)));
      btn.style.fontSize = `${base}px`;
      btn.style.lineHeight = '1';

      btn.textContent = inp.value;
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

  // --- Overlay couleurs ---
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
      btn.style.minWidth = '48px';
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
    // tenter de retrouver les éditeurs