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

  function isPaletteFilled() {
    return emojiInputs.some(i => i.value.trim() !== '') || colorPickers.some(c => c.value.trim() !== '');
  }

  // --- Création grille ---
  function createGrid(savedData = null) {
    if (!isPaletteFilled() && !savedData) return alert("Choisis au moins un emoji ou une couleur !");

    daysContainer.innerHTML = '';
    dayBoxes = [];
    currentDay = null;

    // restaurer inputs
    if (savedData) {
      emojiInputs.forEach((i, idx) => i.value = savedData.emojiInputs?.[idx] || i.value);
      colorPickers.forEach((i, idx) => i.value = savedData.colorPickers?.[idx] || i.value);
    }

    // date de départ
    let startDate = null;
    if (savedData?.startDate) {
      startDate = new Date(savedData.startDate);
      startDateEl.value = formatDateForInput(startDate);
    } else if (startDateEl.value) {
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
        dateEl.textContent = label;
        box.dataset.label = label;
        box.dataset.date = d.toISOString();
      } else {
        dateEl.textContent = `Jour ${i + 1}`;
        box.dataset.label = `Jour ${i + 1}`;
      }

      if (savedData?.days?.[i]) {
        const dayData = savedData.days[i];
        if (dayData.type === 'emoji') contentEl.textContent = dayData.value;
        if (dayData.type === 'color') box.style.background = dayData.value;
        box.dataset.type = dayData.type || '';
        box.dataset.value = dayData.value || '';
      }

      box.addEventListener('click', () => {
        if (!isPaletteFilled()) return alert("Sélectionne d'abord une palette !");
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
    generateBtn.textContent = 'Réinitialiser';

    radioEls.forEach(r => r.disabled = true);
    emojiInputs.forEach(i => i.disabled = true);
    colorPickers.forEach(p => p.disabled = true);

    removeOverlays();

    const mode = document.querySelector('input[name="mode"]:checked')?.value || '';
    if (mode === 'emoji' || mode === 'both') overlayEmoji();
    if (mode === 'color' || mode === 'both') overlayColor();

    saveToLocalStorage();
  }

  function overlayEmoji() {
    emojiEditor.innerHTML = '';
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
        if (!currentDay) return alert('Sélectionne un jour.');
        currentDay.querySelector('.mainContent').textContent = btn.textContent;
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = btn.textContent;
        updateBoxAppearance(currentDay);
        saveToLocalStorage();
      });
      emojiEditor.appendChild(btn);
    });
  }

  function overlayColor() {
    colorEditor.innerHTML = '';
    colorPickers.forEach(inp => {
      if (!inp.value) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-btn quick-palette';
      btn.style.width = '68px';
      btn.style.height = '68px';
      btn.style.borderRadius = '12px';
      btn.style.border = '4px solid transparent';
      btn.style.background = inp.value;
      btn.addEventListener('click', () => {
        if (!currentDay) return alert('Sélectionne un jour.');
        currentDay.style.background = inp.value;
        currentDay.dataset.type = 'color';
        currentDay.dataset.value = inp.value;
        updateBoxAppearance(currentDay);
        saveToLocalStorage();
      });
      colorEditor.appendChild(btn);
    });
  }

  function removeOverlays() {
    emojiEditor.innerHTML = '';
    colorEditor.innerHTML = '';
  }

  async function captureGrid() {
    if (!gridGenerated) return alert('Génère la grille d\'abord.');
    dayBoxes.forEach(b => b.classList.remove('selected'));
    const canvas = await html2canvas(daysContainer, { backgroundColor: null, useCORS: true, scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'vision-21-jours.png';
    link.click();
  }

  function resetApp() {
    localStorage.removeItem('vision21Data');
    location.reload();
  }

  configForm.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!gridGenerated) createGrid();
    else if (confirm("Es-tu sûr de vouloir réinitialiser ?")) resetApp();
  });

  function attachInputListeners() {
    emojiInputs.forEach(inp => {
      inp.addEventListener('input', ev => {
        if (!currentDay) return;
        currentDay.querySelector('.mainContent').textContent = ev.target.value || '';
        currentDay.dataset.type = 'emoji';
        currentDay.dataset.value = ev.target.value || '';
        updateBoxAppearance(currentDay);
        overlayEmoji();
        saveToLocalStorage();
      });
    });

    colorPickers.forEach(inp => {
      inp.addEventListener('input', () => {
        if (!currentDay) return;
        currentDay.style.background = inp.value;
        currentDay.dataset.type = 'color';
        currentDay.dataset.value = inp.value;
        updateBoxAppearance(currentDay);
        overlayColor();
        saveToLocalStorage();
      });
    });
  }
  attachInputListeners();
  captureBtn.addEventListener('click', captureGrid);

  function saveToLocalStorage() {
    const data = {
      startDate: startDateEl.value || null,
      days: dayBoxes.map(b => ({ type: b.dataset.type || '', value: b.dataset.value || '' })),
      emojiInputs: emojiInputs.map(i => i.value || ''),
      colorPickers: colorPickers.map(i => i.value || '')
    };
    localStorage.setItem('vision21Data', JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem('vision21Data');
    if (data) createGrid(JSON.parse(data));
  }

  function formatDateForInput(date) {
    const day = String(date.getDate()).padStart(2,'0');
    const month = String(date.getMonth()+1).padStart(2,'0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  loadFromLocalStorage();
});