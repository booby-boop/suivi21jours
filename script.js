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

  const emojiTemplateHTML = emojiEditor.outerHTML;
  const colorTemplateHTML = colorEditor.outerHTML;

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

  // --- Affichage des éditeurs ---
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
    const txt = contentEl?.textContent.trim() || '';
    const isEmoji = txt.length > 0 && /[^\w\d\s]/u.test(txt);

    if (contentEl) {
      contentEl.style.fontSize = isEmoji ? '34px' : '14px';
      contentEl.style.lineHeight = isEmoji ? '1' : '1.1';
    }

    if (box.style.background && box.style.background !== 'white' && box.style.background !== '#ffffff') {
      box.classList.add('colored');
      box.style.color = '#fff';
    } else {
      box.classList.remove('colored');
      box.style.color = '#1d1d1d';
    }
  }

  // --- Vérifier si palette remplie ---
  function isPaletteFilled() {
    return emojiInputs.some(i => i.value.trim() !== '') || colorPickers.some(c => c.value.trim() !== '');
  }

  // --- Création grille ---
  function createGrid() {
    if (!isPaletteFilled()) return alert("Tu dois choisir au moins un emoji ou une couleur avant de générer la grille !");

    // reset avant création
    daysContainer.innerHTML = '';
    dayBoxes = [];
    currentDay = null;

    let startDate = null;
    if (startDateEl.value) {
      const parts = startDateEl.value.split('/');
      startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (isNaN(startDate.getTime())) startDate = null;
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
        contentEl.textContent = '';
        dateEl.textContent = label;
        box.dataset.label = label;
        box.dataset.date = d.toISOString();
      } else {
        const label = `Jour ${i + 1}`;
        contentEl.textContent = '';
        dateEl.textContent = label;
        box.dataset.label = label;
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
    emojiInputs.forEach(i => i.disabled = true);
    colorPickers.forEach(p => p.disabled = true);

    removeOverlays();

    const mode = document.querySelector('input[name="mode"]:checked')?.value || '';
    if (mode === 'emoji' || mode === 'both') overlayEmoji();
    if (mode === 'color' || mode === 'both') overlayColor();
  }

  // --- Overlay emojis ---
  function overlayEmoji() {
    const overlay = document.createElement('div');
    overlay.id = 'emojiPaletteOverlay';
    overlay.className = 'editor-row';
    emojiInputs.forEach(inp => {
      if (!inp.value) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn quick-palette';
      btn.style.width = '68px';
      btn.style.height = '68px';
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.fontSize = '34px';
      btn.textContent = inp.value;
      btn.addEventListener('click', () => {
        if (!currentDay) return alert('Clique d\'abord sur un jour.');
        const contentEl = currentDay.querySelector('.mainContent');
        contentEl.textContent = btn.textContent;
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = btn.textContent;
        updateBoxAppearance(currentDay);
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
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.background = p.value;
      btn.addEventListener('click', () => {
        if (!currentDay) return alert('Clique d\'abord sur un jour.');
        currentDay.style.background = p.value;
        currentDay.dataset.type = 'color';
        currentDay.dataset.value = p.value;
        updateBoxAppearance(currentDay);
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

  // --- Capture ---
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

  // --- Réinitialisation complète ---
  function resetApp() {
    daysContainer.innerHTML = '';
    dayBoxes = [];
    currentDay = null;
    gridGenerated = false;
    generateBtn.textContent = 'Générer les 21 jours';
    captureBtn.classList.add('hidden');
    instructionP.classList.add('hidden');
    startDateEl.value = '';

    // recréer les éditeurs originaux
    emojiEditor.replaceWith(createElementFromHTML(emojiTemplateHTML));
    colorEditor.replaceWith(createElementFromHTML(colorTemplateHTML));
    emojiEditor = document.getElementById('emojiEditor');
    colorEditor = document.getElementById('colorEditor');

    emojiInputs = Array.from(document.querySelectorAll('.emoji-input'));
    colorPickers = Array.from(document.querySelectorAll('.color-picker'));

    // réactiver radios et inputs
    radioEls.forEach(r => r.disabled = false);
    emojiInputs.forEach(i => i.disabled = false);
    colorPickers.forEach(p => p.disabled = false);

    showEditors();
    attachInputListeners();
  }

  function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  // --- Soumission formulaire ---
  configForm.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!gridGenerated) {
      createGrid();
      generateBtn.textContent = 'Réinitialiser';
    } else {
      if (!confirm("Es-tu sûr de vouloir réinitialiser ?")) return;
      resetApp();
    }
  });

  // --- Inputs directs ---
  function attachInputListeners() {
    emojiInputs.forEach(inp => {
      inp.addEventListener('input', ev => {
        if (!currentDay) return;
        const contentEl = currentDay.querySelector('.mainContent');
        contentEl.textContent = ev.target.value || '';
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = ev.target.value || '';
        updateBoxAppearance(currentDay);
      });
    });

    colorPickers.forEach(p => {
      p.addEventListener('input', () => {
        if (!currentDay) return;
        currentDay.style.background = p.value;
        currentDay.dataset.type = 'color';
        currentDay.dataset.value = p.value;
        updateBoxAppearance(currentDay);
      });
    });
  }
  attachInputListeners();

  captureBtn.addEventListener('click', captureGrid);
});