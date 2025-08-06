let characters = [];

fetch('src/characters.json')
  .then(res => res.json())
  .then(characters => {
    const row = document.getElementById('character-row');
    const filterContainer = document.getElementById('character-filter');
    const randomTemplate = document.getElementById('character-template-random');
    const filterTemplate = document.getElementById('character-template-filter');

    // 1) สุ่มตัวละคร 8 ตัว ใส่ character-row
    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    const showCharacters = shuffled.slice(0, 8);

    for (let i = 0; i < showCharacters.length; i += 4) {
      const col = document.createElement('div');
      col.className = 'col-6';

      const flex = document.createElement('div');
      flex.className = 'd-flex gap-2';

      showCharacters.slice(i, i + 4).forEach(char => {
        const clone = randomTemplate.content.cloneNode(true);

        const imgWrapper = clone.querySelector('.character-block-img');
        const charImg = clone.querySelector('.img-fluid');
        const elemImg = clone.querySelector('.elemental');
        const name = clone.querySelector('.name');

        if (!imgWrapper || !charImg || !elemImg || !name) {
          console.error('Template missing elements');
          return;
        }

        charImg.src = char.Image;
        charImg.alt = char.Name;
        elemImg.src = `https://raw.githubusercontent.com/kanjanaw/randomteam/main/src/images/icons/elements/${char.Elemental.toLowerCase()}.webp`;
        elemImg.loading = 'lazy';
        name.textContent = char.Name;

        imgWrapper.classList.add(`rarity-${char.Rarity}`);

        flex.appendChild(clone);
      });

      col.appendChild(flex);
      row.appendChild(col);
    }

    // 2) แสดงตัวละครทั้งหมด ใส่ character-filter
    characters.forEach(char => {
      const clone = filterTemplate.content.cloneNode(true);

      const checkbox = clone.querySelector('.btn-check');
      const label = clone.querySelector('.character-selector');
      const imgWrapper = clone.querySelector('.character-block-img');
      const charImg = clone.querySelector('.img-fluid');
      const elemImg = clone.querySelector('.elemental');
      const name = clone.querySelector('.name');

      if (!checkbox || !label || !imgWrapper || !charImg || !elemImg || !name) {
        console.error('Template missing elements');
        return;
      }

      // id/for สำหรับ checkbox (Traveler พิเศษ)
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
      elemImg.src = `https://raw.githubusercontent.com/kanjanaw/randomteam/main/src/images/icons/elements/${char.Elemental.toLowerCase()}.webp`;
      name.textContent = char.Name;

      imgWrapper.classList.add(`rarity-${char.Rarity}`);

      filterContainer.appendChild(clone);
    });

    applyAllFilters();

    // === ควบคุมปุ่ม All check/uncheck ตัวละครทั้งหมด ===
    const allCheckbox = document.getElementById('all');

    // คลิกที่ปุ่ม All → check/uncheck ทั้งหมด
    allCheckbox.addEventListener('change', function() {
      const characterCheckboxes = document.querySelectorAll('#character-filter .btn-check');
      characterCheckboxes.forEach(cb => {
        cb.checked = allCheckbox.checked;
      });
    });

    // ฟังก์ชัน sync ปุ่ม All กับสถานะ checkbox ตัวละคร
    function updateAllCheckbox() {
      const characterCheckboxes = document.querySelectorAll('#character-filter .btn-check');
      const allChecked = Array.from(characterCheckboxes).every(cb => cb.checked);
      allCheckbox.checked = allChecked;
    }

    // เมื่อมีการเปลี่ยนแปลง checkbox ของตัวละคร → อัพเดตปุ่ม All
    document.addEventListener('change', e => {
      if (e.target.matches('#character-filter .btn-check')) {
        updateAllCheckbox();
      }
    });


// ฟังก์ชันกรองตัวละคร
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
      visible = char.Sustainable === true; // 🔹ใช้ field ที่ถูกต้อง
    }

    col.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  // อัปเดตจำนวนตัวละครที่แสดง
  document.getElementById('characterCount').textContent = `Showing ${visibleCount} characters`;
}

// === ผูก Event หลังประกาศฟังก์ชัน ===
[
  '4star','5star',
  'pyro','hydro','dendro','electro','anemo','cryo','geo',
  'sword','claymore','bow','catalyst','polearm',
  'female','male','sustain'
].forEach(id => {
  document.getElementById(id).addEventListener('change', applyAllFilters);
});

document.querySelectorAll('.region-checkbox').forEach(cb => {
  cb.addEventListener('change', applyAllFilters);
});




  })
  .catch(err => console.error('Error loading JSON:', err));




// function สำหรับ dropdown แสดง ... และจำนวน
const dropdownBtn = document.getElementById('dropdownRegion');
const checkboxes = document.querySelectorAll('.region-checkbox');
const selectAllBtn = document.getElementById('selectAllBtn');

function updateDropdownText() {
  const selected = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
  if (selected.length === 0) {
    dropdownBtn.textContent = 'Select Region';
  } else {
    let label = selected.join(', ');
    const count = ` (${selected.length})`;
    const maxLength = 25;
    if (label.length > maxLength) label = label.slice(0, maxLength - 3) + '...';
    dropdownBtn.textContent = label + count;
  }

  // ปรับปุ่ม Select All / Unselect All
  if (selected.length === checkboxes.length) {
    selectAllBtn.textContent = 'Unselect All';
  } else {
    selectAllBtn.textContent = 'Select All';
  }
}

checkboxes.forEach(cb => cb.addEventListener('change', updateDropdownText));

selectAllBtn.addEventListener('click', () => {
  const allSelected = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allSelected);
  updateDropdownText();
  applyAllFilters();
});

