let characters = [];

function loadCharacters(callback) {
  if (characters.length > 0) {
    // JSON โหลดแล้ว เคลียร์ callback
    callback();
    return;
  }

  fetch('src/characters.json')
    .then(res => res.json())
    .then(data => {
      characters = data;
      callback();
    })
    .catch(err => console.error('Error loading JSON:', err));
}


document.addEventListener('DOMContentLoaded', () => {
  loadCharacters(() => {
    renderAllCharacters();
    applyAllFilters();
    generateRandomTeams();
    setupEventListeners();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  loadCharacters(() => {
    renderCharacterCards(shuffleArray([...characters]));
    setupFilters();
    setupShuffleButton();
  });
});


// ---------------------- Render ตัวละครทั้งหมด ----------------------
function renderAllCharacters() {
  const filterContainer = document.getElementById('character-filter');
  const template = document.getElementById('character-template-filter');
  filterContainer.innerHTML = '';

  characters.forEach(char => {
    const clone = template.content.cloneNode(true);

    const checkbox = clone.querySelector('.btn-check');
    const label = clone.querySelector('.character-selector');
    const imgWrapper = clone.querySelector('.character-block-img');
    const charImg = clone.querySelector('.img-fluid');
    const elemImg = clone.querySelector('.elemental');
    const name = clone.querySelector('.name');

    // id พิเศษกรณี Traveler
    let checkboxId = char.Name;
    if (char.Name.toLowerCase() === 'traveler') {
      checkboxId = `${char.Name}-${char.Elemental}`;
    }
    checkboxId = checkboxId.toLowerCase().replace(/\s+/g, '-');

    checkbox.id = checkboxId;
    label.setAttribute('for', checkbox.id);
    checkbox.checked = true;

    charImg.src = char.Image;
    charImg.alt = char.Name;
    elemImg.src = `src/images/icons/elements/${char.Elemental.toLowerCase()}.webp`;
    name.textContent = char.Name;

    imgWrapper.classList.add(`rarity-${char.Rarity}`);

    filterContainer.appendChild(clone);
  });
}

// ---------------------- ฟังก์ชันกรองตัวละคร ----------------------
function applyAllFilters() {
  const show4 = document.getElementById('4star').checked;
  const show5 = document.getElementById('5star').checked;

  const selectedElements = ['pyro','hydro','dendro','electro','anemo','cryo','geo']
    .filter(id => document.getElementById(id).checked);

  const selectedWeapons = ['sword','claymore','bow','catalyst','polearm']
    .filter(id => document.getElementById(id).checked);

  const selectedRegions = Array.from(document.querySelectorAll('.region-checkbox:checked'))
    .map(cb => cb.value.toLowerCase());

  const femaleChecked = document.getElementById('female').checked;
  const maleChecked = document.getElementById('male').checked;
  const sustainChecked = document.getElementById('sustain').checked;
  const sustainLess = document.getElementById('sustainless')?.checked || false;

  const allCharacterCols = document.querySelectorAll('#character-filter .col');
  let visibleCount = 0;

  allCharacterCols.forEach((col, idx) => {
    const char = characters[idx]; 
    let visible = true;

    // --- Rarity ---
    if (show4 || show5) {
      if (show4 && !show5) visible = (char.Rarity === 4);
      else if (!show4 && show5) visible = (char.Rarity === 5);
      else visible = (char.Rarity === 4 || char.Rarity === 5);
    }

    // --- Element ---
    if (visible && selectedElements.length > 0) {
      visible = selectedElements.includes(char.Elemental.toLowerCase());
    }

    // --- Weapon ---
    if (visible && selectedWeapons.length > 0) {
      visible = selectedWeapons.includes(char.Weapon.toLowerCase());
    }

    // --- Region ---
    if (visible && selectedRegions.length > 0) {
      visible = selectedRegions.includes(char.Region.toLowerCase());
    }

    // --- Gender ---
    if (visible && (femaleChecked || maleChecked)) {
      if (femaleChecked && !maleChecked) visible = (char.Gender === 'Female');
      else if (!femaleChecked && maleChecked) visible = (char.Gender === 'Male');
      else visible = (char.Gender === 'Female' || char.Gender === 'Male');
    }

    // --- Sustain ---
    if (visible && sustainChecked) {
      visible = char.Sustainable === true;
    }

    // --- No Sustain ---
    if (visible && sustainLess && char.Sustainable) {
      visible = false;
    }

    col.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  document.getElementById('characterCount').textContent = `Showing ${visibleCount} characters`;
}

// ---------------------- ฟังก์ชันสุ่มทีม ----------------------
function generateRandomTeams() {
  const includeSustain = document.getElementById('flexSwitchCheckChecked').checked;
  const sustainLess = document.getElementById('sustainless')?.checked || false;

  const availableCols = document.querySelectorAll('#character-filter .col');
  const availableCheckboxes = document.querySelectorAll('#character-filter .btn-check');

  const availableChars = characters.filter((char, idx) => {
    const col = availableCols[idx];
    const checkbox = availableCheckboxes[idx];
    if (!checkbox.checked || col.style.display === 'none') return false;
    if (sustainLess && char.Sustainable) return false; 
    return true;
  });

  if (availableChars.length < 8 && !includeSustain) {
    alert('มีตัวละครไม่พอสำหรับสุ่มทีม');
    return;
  }

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  let pool = shuffleArray([...availableChars]);
  const sustainChars = pool.filter(c => c.Sustainable);

  const team1 = [];
  const team2 = [];

  if (includeSustain && !sustainLess) {
    if (sustainChars.length < 2) {
      alert('ไม่มีตัว Sustain เพียงพอ');
      return;
    }

    const sustainSelected = shuffleArray(sustainChars).slice(0, 2);
    const otherChars = pool.filter(c => !sustainSelected.includes(c)).slice(0, 6);

    team1.push(...otherChars.slice(0, 3), sustainSelected[0]);
    team2.push(...otherChars.slice(3, 6), sustainSelected[1]);
  } else {
    const selected = pool.slice(0, 8);
    team1.push(...selected.slice(0, 4));
    team2.push(...selected.slice(4, 8));
  }

  renderTeam('character-row', [team1, team2]);
}

// ---------------------- Render ทีม ----------------------
function renderTeam(containerId, teams) {
  const row = document.getElementById(containerId);
  row.innerHTML = '';
  const template = document.getElementById('character-template-random');

  teams.forEach(team => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';

    const flex = document.createElement('div');
    flex.className = 'd-flex gap-2';

    team.forEach(char => {
      const clone = template.content.cloneNode(true);
      const imgWrapper = clone.querySelector('.character-block-img');
      const charImg = clone.querySelector('.img-fluid');
      const elemImg = clone.querySelector('.elemental');
      const name = clone.querySelector('.name');

      charImg.src = char.Image;
      charImg.alt = char.Name;
      elemImg.src = `src/images/icons/elements/${char.Elemental.toLowerCase()}.webp`;
      name.textContent = char.Name;
      imgWrapper.classList.add(`rarity-${char.Rarity}`);

      flex.appendChild(clone);
    });

    col.appendChild(flex);
    row.appendChild(col);
  });
}

// ---------------------- Event Binding ----------------------
function setupEventListeners() {
  [
    '4star','5star',
    'pyro','hydro','dendro','electro','anemo','cryo','geo',
    'sword','claymore','bow','catalyst','polearm',
    'female','male','sustain'
  ].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyAllFilters);
  });

  document.querySelectorAll('.region-checkbox').forEach(cb => {
    cb.addEventListener('change', applyAllFilters);
  });

  // ปุ่ม Random
  document.getElementById('randomBtn')?.addEventListener('click', generateRandomTeams);

  // ปุ่ม All
  const allCheckbox = document.getElementById('all');
  allCheckbox.addEventListener('change', function() {
    document.querySelectorAll('#character-filter .btn-check').forEach(cb => cb.checked = allCheckbox.checked);
  });

  document.addEventListener('change', e => {
    if (e.target.matches('#character-filter .btn-check')) {
      const allChecked = Array.from(document.querySelectorAll('#character-filter .btn-check')).every(cb => cb.checked);
      allCheckbox.checked = allChecked;
    }
  });

  // ✅ เชื่อมปุ่ม sustain / no sustain
  const includeSustainSwitch = document.getElementById('flexSwitchCheckChecked');
  const sustainFilter = document.getElementById('sustain');
  const sustainLessFilter = document.getElementById('sustainless');

  includeSustainSwitch.addEventListener('change', function () {
    if (this.checked) {
      sustainLessFilter.checked = false;
      sustainFilter.checked = true;
    } else {
      sustainFilter.checked = false;
    }
    applyAllFilters();
    generateRandomTeams();
  });

  sustainLessFilter.addEventListener('change', function () {
    if (this.checked) {
      includeSustainSwitch.checked = false;
      sustainFilter.checked = false;
    }
    applyAllFilters();
    generateRandomTeams();
  });
}

// Render การ์ด + shuffle ทุกครั้ง
function renderCharacterCards(filteredChars = characters) {
  const container = document.getElementById('card-random-number');
  if (!container) return console.error('Cannot find card container');

  container.innerHTML = '';

  // ✅ กรองไม่ให้ Traveler ซ้ำ
  let seenTraveler = false;
  const uniqueChars = filteredChars.filter(char => {
    if (char.Name === "Traveler") {
      if (seenTraveler) return false; // ถ้าเจอ Traveler แล้ว ตัดทิ้ง
      seenTraveler = true;
      return true; // เก็บ Traveler แค่ตัวแรก
    }
    return true; // ตัวอื่นเก็บหมด
  });

  // ✅ Shuffle ก่อน render
  const shuffled = uniqueChars.sort(() => Math.random() - 0.5);

  shuffled.forEach((char, idx) => {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
      <div class="scene">
        <div class="card-ynum">
          <div class="card__face card__face--front">${idx + 1}</div>
          <div class="card__face card__face--back" style="background-image: url('${char.Image}');"></div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  // Flip event
  container.querySelectorAll('.card-ynum').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));
  });
}


// Shuffle array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Filter ตาม region
function getFilteredCharacters() {
  const checkboxes = document.querySelectorAll('.region-checkbox:checked');
  if (!checkboxes.length) return [...characters]; // ถ้าไม่เลือก filter -> all
  const selectedRegions = Array.from(checkboxes).map(cb => cb.value);
  return characters.filter(c => selectedRegions.includes(c.Region));
}

// Setup dropdown filter
function setupFilters() {
  const checkboxes = document.querySelectorAll('.region-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const filtered = getFilteredCharacters();
      renderCharacterCards(filtered); // จะ shuffle ภายใน
    });
  });

  const selectAllBtn = document.getElementById('selectAllBtn');
  selectAllBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = true);
    const filtered = getFilteredCharacters();
    renderCharacterCards(filtered); // จะ shuffle ภายใน
  });
}

// Setup shuffle button
function setupShuffleButton() {
  const btn = document.getElementById('shuffleBtn');
  btn.addEventListener('click', () => {
    const filtered = getFilteredCharacters();
    renderCharacterCards(shuffleArray(filtered));
  });
}





let bosses = [];

// โหลด JSON
fetch("src/bosses.json")
  .then(res => res.json())
  .then(data => {
    bosses = data;

    // ✅ แสดงบอสทั้งหมดใน list
    const container = document.getElementById("boss-list");
    data.forEach(boss => {
      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
        <div class="card rounded-2 bg-grey-303 text-light p-2 h-100">
          <div class="row g-2">
            <div class="col-md-3">
              <img src="${boss.image}" class="img-fluid rounded-2" alt="${boss.name}">
            </div>
            <div class="col-md-9">
              <div class="card-body p-2">
                <p class="mb-1 fw-bold">${boss.name}</p>
                <small class="text-secondary">${boss.location} • ${boss.boss_type}</small>
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    // ✅ สุ่มบอสครั้งแรกเลย (ไม่ต้องกดปุ่มก่อน)
    getRandomBoss();
  })
  .catch(err => console.error("Error loading JSON:", err));

// ฟังก์ชันสุ่ม
function getRandomBoss() {
  if (bosses.length === 0) return;

  const randomIndex = Math.floor(Math.random() * bosses.length);
  const boss = bosses[randomIndex];

  document.getElementById("bossImg").src = boss.image;
  document.getElementById("bossName").textContent = boss.name;
  document.getElementById("bossInfo").textContent = `${boss.location} • ${boss.boss_type}`;
}

// Event listener ปุ่ม
document.getElementById("randomBossBtn").addEventListener("click", getRandomBoss);
