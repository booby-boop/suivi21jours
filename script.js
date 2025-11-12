document.addEventListener('DOMContentLoaded', () => {
  const DAYS = 21;
  const startDateEl = document.getElementById('startDate');
  const configForm = document.getElementById('configForm');
  const emojiEditor = document.getElementById('emojiEditor');
  const colorEditor = document.getElementById('colorEditor');
  const daysContainer = document.getElementById('daysContainer');
  const generateBtn = document.getElementById('generateBtn');
  const captureBtn = document.getElementById('captureBtn');
  const instructionP = document.querySelector('.instruction');

  const radioEls = Array.from(document.querySelectorAll('input[name="mode"]'));
  const emojiInputs = Array.from(document.querySelectorAll('.emoji-input'));
  const colorPickers = Array.from(document.querySelectorAll('.color-picker'));

  let dayBoxes = [];
  let currentDay = null;
  let gridGenerated = false;

  // flatpickr sur fond blanc
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
          fp.calendarContainer.style.background = "#fff"; // fond blanc
          fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => {
            d.style.color = '#000'; // texte noir
          });
        }
      },
      onMonthChange: function(fp) {
        fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => d.style.color = '#000');
      },
      onYearChange: function(fp) {
        fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => d.style.color = '#000');
      },
      onValueUpdate: function(fp) {
        fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(d => d.style.color = '#000');
      }
    });
  }

  function showEditors() {
    const mode = document.querySelector('input[name="mode"]:checked')?.value || '';
    emojiEditor.classList.toggle('hidden', !(mode === 'emoji' || mode === 'both'));
    colorEditor.classList.toggle('hidden', !(mode === 'color' || mode === 'both'));
  }
  radioEls.forEach(r => r.addEventListener('change', showEditors));
  showEditors();

  function updateBoxAppearance(box) {
    const txt = (box.textContent || '').trim();
    const isEmoji = txt.length > 0 && /[^\w\d\s]/u.test(txt); // accepte tout caractère spécial comme emoji
    if (isEmoji) {
      box.style.fontSize = '34px';
      box.style.lineHeight = '1';
    } else {
      box.style.fontSize = '14px'; // texte réduit de 10px
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

  function createGrid() {
    daysContainer.innerHTML = '';
    dayBoxes = [];
    let startDate = null;
    if (startDateEl.value) {
      const parts = startDateEl.value.split('/');
      startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
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

    emojiInputs.forEach(i => i.disabled = true);
    colorPickers.forEach(p => p.disabled = true);

    const mode = document.querySelector('input[name="mode"]:checked')?.value || '';
    if (mode === 'emoji' || mode === 'both') {
      emojiEditor.replaceWith(createEmojiOverlay());
    } else if (document.getElementById('emojiPaletteOverlay')) {
      document.getElementById('emojiPaletteOverlay').remove();
    }

    if (mode === 'color' || mode === 'both') {
      colorEditor.replaceWith(createColorOverlay());
    } else if (document.getElementById('colorPaletteOverlay')) {
      document.getElementById('colorPaletteOverlay').remove();
    }
  }

  function createEmojiOverlay() {
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
    return emojiOverlay;
  }

  function createColorOverlay() {
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
    return colorOverlay;
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

  configForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!gridGenerated) {
      createGrid();
      generateBtn.textContent = 'Réinitialiser';
    } else {
      if (!confirm("Es-tu sûr de vouloir réinitialiser ?")) return;
      daysContainer.innerHTML = '';
      dayBoxes = [];
      gridGenerated = false;
      currentDay = null;
      generateBtn.textContent = 'Générer les 21 jours';
      captureBtn.classList.add('hidden');
      instructionP.classList.add('hidden');
      showEditors();
      emojiInputs.forEach(i => i.disabled = false);
      colorPickers.forEach(p => p.disabled = false);
    }
  });

  // emoji input accepte maintenant tout caractère
  emojiInputs.forEach(inp => {
    inp.addEventListener('input', (ev) => {
      if (currentDay) {
        currentDay.textContent = ev.target.value || currentDay.dataset.label || '';
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = ev.target.value || '';
        updateBoxAppearance(currentDay);
      }
    });
  });

  colorPickers.forEach(p => {
    p.addEventListener('input', () => {
      if (currentDay && !gridGenerated) {
        currentDay.style.background = p.value;
        currentDay.classList.add('colored');
        updateBoxAppearance(currentDay);
      }
    });
  });

  captureBtn.addEventListener('click', captureGrid);
});