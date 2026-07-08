let challenges = [];

fetch('src/challenge-modes.json')
    .then(res => res.json())
    .then(data => {
        challenges = data;

        renderChallengeList(challenges);
        randomChallenge();
    })
    .catch(error => {
        console.error('Load challenge error:', error);
    });

function getTypeIcon(type) {
    switch (type.toLowerCase()) {
        case 'team':
            return '<i class="bi bi-people-fill mb-1"></i>';

        case 'role':
            return '<i class="bi bi-emoji-wink-fill mb-1"></i>';

        case 'gameplay':
            return '<i class="bi bi-diamond-fill mb-1"></i>';

        default:
            return '<i class="bi bi-question-circle-fill mb-1"></i>';
    }
}

function createChallengeCard(item, isMain = false) {
    return `
        <div class="${isMain ? '' : 'col'}">
            <div class="challenge-card border-white-25">
                <div class="px-3">
                    <div class="d-inline-flex align-items-center gap-2 challenge-label ${isMain ? 'main' : ''}">
                        ${getTypeIcon(item.type)}
                        <span class="fw-semibold small">${item.type}</span>
                    </div>
                </div>

                <div class="card-body p-4">
                    <h6 class="fw-bold">${item.title}</h6>
                    <p class="mt-3 mb-0 text-description">${item.description}</p>
                </div>
            </div>
        </div>
    `;
}

function renderChallengeList(list) {
    const listEl = document.getElementById('challenge-list');
    listEl.innerHTML = list.map(item => createChallengeCard(item)).join('');
}

function randomChallenge() {
    if (!challenges.length) return;

    const randomIndex = Math.floor(Math.random() * challenges.length);
    const randomItem = challenges[randomIndex];

    document.getElementById('random-challenge').innerHTML =
        createChallengeCard(randomItem, true);
}

document.getElementById('randomChallengeBtn').addEventListener('click', randomChallenge);