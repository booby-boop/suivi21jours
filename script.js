// script.js — clean, robust implementation
document.addEventListener('DOMContentLoaded', () => {
  const DAYS = 21;
  const startDateEl = document.getElementById('startDate');
  const configForm = document.getElementById('configForm');
  const emojiEditor = document.getElementById('emojiEditor');
  const colorEditor = document.getElementById('colorEditor');
  const daysContainer = document.getElementById('daysContainer');
  const generateBtn = document.getElementById('generateBtn');
  const captureBtn = document.getElementById('captureBtn');

  const radioEls = Array.from(document.querySelectorAll('input[name="mode"]'));
  const emojiInputs = Array.from(document.querySelectorAll('.emoji-input'));
  const colorPickers = Array.from(document.querySelectorAll('.color-picker'));

  let dayBoxes = [];
  let currentDay = null;
  let gridGenerated = false;

  // initialize flatpickr
  if (typeof flatpickr === 'function') {
    flatpickr(startDateEl, {
      dateFormat: "d/m/Y",
      allowInput: true,
      defaultDate: null,
      onReady: function(selectedDates, dateStr, fp) {
        if (fp && fp.calendarContainer) {
          fp.calendarContainer.style.fontFamily = "Montserrat, sans-serif";
          fp.calendarContainer.style.borderRadius = "12px";
          fp.calendarContainer.style.border = "2px solid #c19751";
          fp.calendarContainer.style.background = "#2b2f5a";
          // ensure day text white
          fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => d.style.color = '#fff');
        }
      }
    });
  } else {
    console.warn('flatpickr not loaded');
  }

  // show editors depending on radio
  function showEditors() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'emoji') {
      emojiEditor.classList.remove('hidden');
      colorEditor.classList.add('hidden');
    } else if (mode === 'color') {
      colorEditor.classList.remove('hidden');
      emojiEditor.classList.add('hidden');
    } else {
      emojiEditor.classList.remove('hidden');
      colorEditor.classList.remove('hidden');
    }
  }
  radioEls.forEach(r => r.addEventListener('change', showEditors));
  showEditors();

  // helper to set box appearance (font size, colored class)
  function updateBoxAppearance(box) {
    const txt = (box.textContent || '').trim();
    const isEmoji = /\p{Emoji}/u.test(txt) || (txt.length <= 3 && /[^\w\d\s]/u.test(txt));
    if (isEmoji) {
      box.style.fontSize = '34px';
      box.style.lineHeight = '1';
    } else {
      box.style.fontSize = '14px';
      box.style.lineHeight = '1.1';
    }
    if (box.style.background && box.style.background !== 'white' && box.style.background !== '#ffffff') {
      box.classList.add('colored');
      box.style.color = '#fff';
    } else {
      box.classList.remove('colored');
      box.style.color = '#1d1d1d';
    }
  }

  // create grid
  function createGrid() {
    daysContainer.innerHTML = '';
    dayBoxes = [];
    const startRaw = startDateEl.value;
    let startDate = null;
    if (startRaw) {
      // parse d/m/Y or yyyy-mm-dd
      if (startRaw.includes('/')) {
        const parts = startRaw.split('/');
        startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        startDate = new Date(startRaw);
      }
      if (isNaN(startDate.getTime())) startDate = null;
    }

    for (let i = 0; i < DAYS; i++) {
      const box = document.createElement('div');
      box.className = 'dayBox';
      if (startDate) {
        const d = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
        const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        box.textContent = label;
        box.dataset.label = label;
        box.dataset.date = d.toISOString();
      } else {
        const label = `Jour ${i + 1}`;
        box.textContent = label;
        box.dataset.label = label;
      }

      // select day on click
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

    // after grid created, freeze palette inputs (disable editing) but create small clickable palette overlays that apply value
    emojiInputs.forEach(i => i.disabled = true);
    colorPickers.forEach(p => p.disabled = true);

    // create overlays (remove if exist)
    createPaletteOverlays();
  }

  // create palette overlays (clickable buttons showing current palette values)
  function createPaletteOverlays() {
    // remove existing overlays if present
    const existingEmojiOverlay = document.getElementById('emojiPaletteOverlay');
    if (existingEmojiOverlay) existingEmojiOverlay.remove();
    const existingColorOverlay = document.getElementById('colorPaletteOverlay');
    if (existingColorOverlay) existingColorOverlay.remove();

    // emoji overlay
    const emojiOverlay = document.createElement('div');
    emojiOverlay.id = 'emojiPaletteOverlay';
    emojiOverlay.className = 'editor-row';
    emojiInputs.forEach(inp => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emoji-btn quick-palette';
      b.style.width = '68px';
      b.style.height = '68px';
      b.style.borderRadius = '12px';
      b.style.border = '4px solid transparent';
      b.style.fontSize = '34px';
      b.textContent = inp.value || '';
      b.addEventListener('click', () => {
        if (!currentDay) { alert('Clique d\'abord sur un jour.'); return; }
        currentDay.textContent = b.textContent || currentDay.dataset.label || '';
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = b.textContent || '';
        updateBoxAppearance(currentDay);
      });
      emojiOverlay.appendChild(b);
    });

    // color overlay
    const colorOverlay = document.createElement('div');
    colorOverlay.id = 'colorPaletteOverlay';
    colorOverlay.className = 'editor-row';
    colorPickers.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'color-btn quick-palette';
      b.style.width = '68px';
      b.style.height = '68px';
      b.style.borderRadius = '12px';
      b.style.border = '4px solid transparent';
      b.style.background = p.value;
      b.addEventListener('click', () => {
        if (!currentDay) { alert('Clique d\'abord sur un jour.'); return; }
        currentDay.style.background = p.value;
        currentDay.dataset.type = 'color';
        currentDay.dataset.value = p.value;
        updateBoxAppearance(currentDay);
      });
      colorOverlay.appendChild(b);
    });

    // insert overlays after editors
    emojiEditor.after(emojiOverlay);
    colorEditor.after(colorOverlay);

    // make overlays visible (palettes are fixed after generation but overlays are clickable)
    emojiOverlay.classList.remove('hidden');
    colorOverlay.classList.remove('hidden');
  }

  // capture grid as PNG via html2canvas
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

  // form submit: generate or reset
  configForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!gridGenerated) {
      // generate grid
      createGrid();
      generateBtn.textContent = 'Réinitialiser';
    } else {
      // reset with confirmation
      if (!confirm("Es-tu sûr de vouloir réinitialiser ?")) return;
      // reset UI
      daysContainer.innerHTML = '';
      dayBoxes = [];
      gridGenerated = false;
      currentDay = null;
      generateBtn.textContent = 'Générer les 21 jours';
      captureBtn.classList.add('hidden');
      // remove overlays
      const eo = document.getElementById('emojiPaletteOverlay'); if (eo) eo.remove();
      const co = document.getElementById('colorPaletteOverlay'); if (co) co.remove();
      // re-enable palette inputs
      emojiInputs.forEach(i => i.disabled = false);
      colorPickers.forEach(p => p.disabled = false);
      showEditors();
    }
  });

  // apply emoji input Enter to current day while editing BEFORE generation (live edit)
  emojiInputs.forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentDay && !gridGenerated) {
          currentDay.textContent = inp.value || currentDay.dataset.label || '';
          updateBoxAppearance(currentDay);
        }
      }
    });
    // live preview if day selected and before generation
    inp.addEventListener('input', () => {
      if (currentDay && !gridGenerated) {
        currentDay.textContent = inp.value || currentDay.dataset.label || '';
        updateBoxAppearance(currentDay);
      }
    });
  });

  // color pickers live preview before generation
  colorPickers.forEach(p => {
    p.addEventListener('input', () => {
      if (currentDay && !gridGenerated) {
        currentDay.style.background = p.value;
        currentDay.classList