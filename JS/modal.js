

/**
 *
 * @param {number} id 
 */
async function openModal(id) {
  const overlay   = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `
    <div class="modal-loader">
      <div class="loader" style="display:block"></div>
      Loading...
    </div>`;
  overlay.classList.add('show');

  try {
    let poke = dexData.find(p => p.id === id);

    if (!poke || !poke.stats) {
      poke = await fetchModalPokemon(id);   
    }

    modalBody.innerHTML = buildModalHTML(poke);

  } catch (e) {
    modalBody.innerHTML = `
      <div style="padding:2rem;text-align:center;color:var(--accent)">
        Failed to load Pokémon data. Please try again.
      </div>`;
  }
}


/**

 * @param {Object} poke 
 * @returns {string} 
 */
function buildModalHTML(poke) {
  const typeBadges = buildTypeBadges(poke.types);
  const statBars   = buildStatBars(poke.stats || []);
  const abilities  = buildAbilities(poke.abilities || []);

  const numLabel = poke.genus
    ? `#${padNumber(poke.id)} &middot; ${poke.genus}`
    : `#${padNumber(poke.id)}`;

  return `
    <img class="modal-pokemon-img" src="${poke.artwork}" alt="${poke.name}" />

    <div class="modal-name">${capitalize(poke.name)}</div>
    <div class="modal-num">${numLabel}</div>
    <div class="modal-types">${typeBadges}</div>

    <div class="modal-divider"></div>

    <div class="modal-grid">
      <div class="modal-stat">
        <div class="modal-stat-label">Weight</div>
        <div class="modal-stat-val">${poke.weight} kg</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-label">Height</div>
        <div class="modal-stat-val">${poke.height} m</div>
      </div>
    </div>

    <div class="modal-section-title">Base Stats</div>
    <div class="stat-bars">${statBars}</div>

    <div class="modal-divider"></div>

    <div class="modal-section-title">Abilities</div>
    <div class="modal-abilities">${abilities}</div>
  `;
}

/**
 * @param {string[]} types
 * @returns {string}
 */
function buildTypeBadges(types) {
  return types.map(t => {
    const color = TYPE_COLORS[t] || '#888';
    return `<span class="modal-type-badge type-${t}"
                  style="background:${color}22;color:${color};border-color:${color}55">
              ${capitalize(t)}
            </span>`;
  }).join('');
}

/**
 * @param {Object[]} stats 
 * @returns {string}
 */
function buildStatBars(stats) {
  return stats.map(s => {
    const pct   = Math.min(100, (s.value / 255) * 100).toFixed(1);
    const color =
      s.value >= 100 ? 'var(--green)'  :
      s.value >= 60  ? 'var(--blue)'   :
      s.value >= 40  ? 'var(--yellow)' :
                       'var(--accent)';

    return `
      <div class="stat-bar-row">
        <div class="stat-bar-label">${s.name.replace('-', ' ')}</div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="stat-bar-num">${s.value}</div>
      </div>`;
  }).join('');
}

/**
 * @param {string[]} abilities
 * @returns {string}
 */
function buildAbilities(abilities) {
  return abilities.map(a =>
    `<span class="ability-chip">${capitalize(a.replace('-', ' '))}</span>`
  ).join('');
}


/**
 * @param {MouseEvent} e
 */
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('show');
  }
}

function closeModalBtn() {
  document.getElementById('modal-overlay').classList.remove('show');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('modal-overlay').classList.remove('show');
  }
});