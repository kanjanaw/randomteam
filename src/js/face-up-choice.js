let characters = [];
let characterDeck = [];
let displayedCards = [];

const INITIAL_CARD_COUNT = 3;

document.addEventListener('DOMContentLoaded', () => {
  loadCharacters();
});

/**
 * โหลดข้อมูลตัวละคร
 */
async function loadCharacters() {
  try {
    const response = await fetch('src/characters.json');

    if (!response.ok) {
      throw new Error(`Cannot load characters.json: ${response.status}`);
    }

    const data = await response.json();

    characters = removeDuplicateTraveler(data);

    setupButtons();
    resetGame();
  } catch (error) {
    console.error('Error loading characters:', error);

    const revealContainer = document.getElementById('front-card-reveal');

    if (revealContainer) {
      revealContainer.innerHTML = `
        <p class="text-danger text-center mb-0">
          Cannot load character data
        </p>
      `;
    }
  }
}

/**
 * กรอง Traveler ให้เหลือเพียงตัวเดียว
 */
function removeDuplicateTraveler(characterList) {
  let travelerFound = false;

  return characterList.filter(character => {
    const characterName = String(character.Name || '').toLowerCase();

    if (characterName === 'traveler') {
      if (travelerFound) {
        return false;
      }

      travelerFound = true;
    }

    return true;
  });
}

/**
 * สุ่ม Array แบบไม่แก้ข้อมูลต้นฉบับ
 */
function shuffleArray(array) {
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

/**
 * เริ่มเกมใหม่
 */
function resetGame() {
  characterDeck = shuffleArray(characters);
  displayedCards = [];

  // ตัวแรกใช้เป็นการ์ดเปิดด้านบน
  const frontCharacter = characterDeck.shift();

  renderFrontCard(frontCharacter);

  // ด้านล่างเริ่มต้น 3 ใบ
  for (let index = 0; index < INITIAL_CARD_COUNT; index++) {
    addCard(false);
  }
}

/**
 * แสดงการ์ดเปิดด้านบน
 */
function renderFrontCard(character) {
  const revealContainer = document.getElementById('front-card-reveal');

  if (!revealContainer || !character) {
    return;
  }

  revealContainer.innerHTML = `
    <div class="scene">
      <div class="card-ynum is-flipped">
        <div class="card__face card__face--front">
          <span>?</span>
        </div>

        <div
          class="card__face card__face--back"
          style="background-image: url('${character.Image}');"
        ></div>
      </div>
    </div>

    <p class="text-center text-white fw-semibold mt-3 mb-0">
      ${character.Name}
    </p>
  `;
}

/**
 * เพิ่มการ์ดด้านล่าง 1 ใบ
 */
function addCard(shouldAnimate = true) {
  if (!characterDeck.length) {
    console.warn('No more characters in deck');
    return;
  }

  const character = characterDeck.shift();

  displayedCards.push({
    character,
    isFlipped: false
  });

  renderBottomCards();

  if (shouldAnimate) {
    const cards = document.querySelectorAll(
      '#card-random-number .character-choice-card'
    );

    const lastCard = cards[cards.length - 1];

    if (lastCard) {
      lastCard.classList.add('card-added');

      lastCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }
}

/**
 * แสดงการ์ดด้านล่างทั้งหมด
 */
function renderBottomCards() {
  const container = document.getElementById('card-random-number');

  if (!container) {
    console.error('Cannot find #card-random-number');
    return;
  }

  container.innerHTML = '';

  displayedCards.forEach((cardData, index) => {
    const cardWrapper = document.createElement('div');

    cardWrapper.className = 'character-choice-card';

    cardWrapper.innerHTML = `
      <div class="scene">
        <div
          class="card-ynum ${cardData.isFlipped ? 'is-flipped' : ''}"
          role="button"
          tabindex="0"
          data-card-index="${index}"
          aria-label="Card ${index + 1}"
        >
          <div class="card__face card__face--front">
            ${index + 1}
          </div>

          <div
            class="card__face card__face--back"
            style="background-image: url('${cardData.character.Image}');"
          ></div>
        </div>
      </div>
    `;

    container.appendChild(cardWrapper);
  });

  setupCardEvents();
}

/**
 * Event สำหรับพลิกการ์ดด้านล่าง
 */
function setupCardEvents() {
  const cards = document.querySelectorAll(
    '#card-random-number .card-ynum'
  );

  cards.forEach(card => {
    const flipCard = () => {
      const cardIndex = Number(card.dataset.cardIndex);

      if (
        Number.isNaN(cardIndex) ||
        !displayedCards[cardIndex]
      ) {
        return;
      }

      displayedCards[cardIndex].isFlipped =
        !displayedCards[cardIndex].isFlipped;

      card.classList.toggle(
        'is-flipped',
        displayedCards[cardIndex].isFlipped
      );

      const cardName = card
        .closest('.scene')
        ?.querySelector('.character-name');

      if (cardName) {
        cardName.classList.toggle(
          'd-none',
          !displayedCards[cardIndex].isFlipped
        );
      }
    };

    card.addEventListener('click', flipCard);

    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flipCard();
      }
    });
  });
}

/**
 * ปุ่ม Draw และ Reset
 */
function setupButtons() {
  const drawButton =
    document.getElementById('drawBtn') ||
    document.querySelector('#shuffleBtn');

  const resetButton =
    document.getElementById('resetBtn') ||
    document.querySelectorAll('#shuffleBtn')[1];

  drawButton?.addEventListener('click', () => {
    addCard(true);
  });

  resetButton?.addEventListener('click', () => {
    resetGame();
  });
}