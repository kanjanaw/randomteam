let characters = [];

const elements = [
    'Anemo',
    'Geo',
    'Electro',
    'Dendro',
    'Hydro',
    'Pyro',
    'Cryo'
];

const weapons = [
    'Sword',
    'Claymore',
    'Polearm',
    'Bow',
    'Catalyst'
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        characters = await loadCharacters();

        const resetBtn = document.getElementById('resetBtn');

        resetBtn?.addEventListener('click', generateElementMatch);

        // สุ่มทันทีเมื่อเปิดหน้า
        generateElementMatch();

    } catch (error) {
        console.error('Error loading characters:', error);
        showLoadError();
    }
});


/**
 * โหลดข้อมูลตัวละครจาก JSON
 */
async function loadCharacters() {
    const response = await fetch('src/characters.json');

    if (!response.ok) {
        throw new Error(
            `Cannot load characters.json (${response.status})`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            'characters.json must contain an array'
        );
    }

    return data;
}


/**
 * สุ่มธาตุและอาวุธ
 */
function generateElementMatch() {
    const availableMatches = getAvailableMatches();

    /*
     * กรณีไม่มีข้อมูลตัวละคร
     * ให้สุ่มธาตุและอาวุธแบบปกติ
     */
    if (availableMatches.length === 0) {
        const randomElement = getRandomItem(elements);
        const randomWeapon = getRandomItem(weapons);

        renderSelection(
            randomElement,
            randomWeapon
        );

        renderCharacters([]);

        return;
    }

    /*
     * สุ่มเฉพาะคู่ธาตุและอาวุธ
     * ที่มีตัวละครตรงเงื่อนไขจริง
     */
    const selectedMatch = getRandomItem(availableMatches);

    renderSelection(
        selectedMatch.element,
        selectedMatch.weapon
    );

    renderCharacters(
        selectedMatch.characters
    );
}


/**
 * หาคู่ธาตุและอาวุธ
 * ที่มีตัวละครตรงเงื่อนไข
 */
function getAvailableMatches() {
    const matches = [];

    elements.forEach(element => {
        weapons.forEach(weapon => {
            const matchedCharacters = characters.filter(character => {
                const characterElement = normalize(
                    character.Elemental
                );

                const characterWeapon = normalize(
                    character.Weapon
                );

                return (
                    characterElement === normalize(element) &&
                    characterWeapon === normalize(weapon)
                );
            });

            if (matchedCharacters.length > 0) {
                matches.push({
                    element: element,
                    weapon: weapon,
                    characters: matchedCharacters
                });
            }
        });
    });

    return matches;
}


/**
 * แสดงธาตุและอาวุธที่สุ่มได้
 */
function renderSelection(element, weapon) {
    const elementImage = document.getElementById(
        'randomElementImage'
    );

    const elementName = document.getElementById(
        'randomElementName'
    );

    const weaponImage = document.getElementById(
        'randomWeaponImage'
    );

    const weaponName = document.getElementById(
        'randomWeaponName'
    );

    const elementSlug = normalize(element);
    const weaponSlug = normalize(weapon);

    if (elementImage) {
        elementImage.src =
            `src/images/icons/elements/${elementSlug}.webp`;

        elementImage.alt = element;
    }

    if (elementName) {
        elementName.textContent = element;
    }

    if (weaponImage) {
        weaponImage.src =
            `src/images/icons/weapons/${weaponSlug}.webp`;

        weaponImage.alt = weapon;
    }

    if (weaponName) {
        weaponName.textContent = weapon;
    }
}


/**
 * แสดงตัวละครที่ตรงกับธาตุและอาวุธ
 * แสดงเฉพาะรูปตัวละคร
 */
function renderCharacters(matchedCharacters) {
    const container = document.getElementById(
        'characterList'
    );

    const template = document.getElementById(
        'matchedCharacterTemplate'
    );

    const count = document.getElementById(
        'matchedCharacterCount'
    );

    const noMatchMessage = document.getElementById(
        'noMatchMessage'
    );

    if (!container || !template) {
        console.error(
            'Cannot find characterList or matchedCharacterTemplate'
        );

        return;
    }

    container.innerHTML = '';

    if (count) {
        count.textContent =
            `${matchedCharacters.length} ${
                matchedCharacters.length === 1
                    ? 'character'
                    : 'characters'
            }`;
    }

    if (noMatchMessage) {
        noMatchMessage.classList.toggle(
            'd-none',
            matchedCharacters.length > 0
        );
    }

    matchedCharacters.forEach(character => {
        const clone = template.content.cloneNode(true);

        const imageWrapper = clone.querySelector(
            '.character-block-img'
        );

        const characterImage = clone.querySelector(
            '.character-image'
        );

        if (!characterImage) {
            return;
        }

        characterImage.src = character.Image;
        characterImage.alt = character.Name || 'Character';

        if (character.Rarity && imageWrapper) {
            imageWrapper.classList.add(
                `rarity-${character.Rarity}`
            );
        }

        container.appendChild(clone);
    });
}


/**
 * แสดงข้อความเมื่อโหลด JSON ไม่สำเร็จ
 */
function showLoadError() {
    const noMatchMessage = document.getElementById(
        'noMatchMessage'
    );

    const count = document.getElementById(
        'matchedCharacterCount'
    );

    const container = document.getElementById(
        'characterList'
    );

    if (container) {
        container.innerHTML = '';
    }

    if (count) {
        count.textContent = '0 characters';
    }

    if (noMatchMessage) {
        noMatchMessage.textContent =
            'Unable to load character data.';

        noMatchMessage.classList.remove('d-none');
    }
}


/**
 * สุ่มสมาชิกใน Array
 */
function getRandomItem(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(
        Math.random() * items.length
    );

    return items[randomIndex];
}


/**
 * แปลงข้อความเป็นตัวพิมพ์เล็ก
 */
function normalize(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase();
}
