


let dexData    = [];     
let activeGen  = 'all'; 
let searchQuery = '';  

async function loadDex() {
  const wrap      = document.getElementById('dex-grid-wrap');
  const TOTAL     = 721;
  const BATCH_SIZE = 50;
  const allPokes  = [];

  wrap.innerHTML = `
    <div class="dex-initial-loader">
      <div class="mini-spin"></div> Loading Pokédex data...
    </div>`;

  for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
    const limit = Math.min(BATCH_SIZE, TOTAL - offset);
    const batch = await fetchDexBatch(offset, limit);  

    allPokes.push(...batch);
    renderDex(allPokes);  
  }

  dexData = allPokes;
}


/**
 * @param {Object[]} data 
 */
function renderDex(data) {
  const wrap  = document.getElementById('dex-grid-wrap');
  const query = searchQuery.toLowerCase();

  let filtered = data;
  if (query) {
    filtered = data.filter(p =>
      p.name.includes(query) || String(p.id).includes(query)
    );
  }

 
  if (activeGen !== 'all') {
    filtered = filtered.filter(p => getGenIndex(p.id) === parseInt(activeGen));
  }

  if (filtered.length === 0) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:4rem;color:var(--muted);font-size:14px;">
        No Pokémon found.
      </div>`;
    return;
  }

  const byGen = {};
  filtered.forEach(p => {
    const gi = getGenIndex(p.id);
    if (!byGen[gi]) byGen[gi] = [];
    byGen[gi].push(p);
  });

  wrap.innerHTML = Object.keys(byGen)
    .sort((a, b) => a - b)
    .map(gi => {
      const gen   = GENERATIONS[gi];
      const cards = byGen[gi].map(p => buildPokeCard(p)).join('');
      return `
        <div class="gen-section" data-gen="${gi}">
          <div class="gen-section-title">
            ${gen.label} &nbsp;&middot;&nbsp; #${gen.min}&ndash;#${gen.max}
          </div>
          <div class="poke-grid">${cards}</div>
        </div>`;
    })
    .join('');
}

/**
 * @param {Object} p 
 * @returns {string} 
 */
function buildPokeCard(p) {
  const typeChips = p.types.map(t => {
    const color = TYPE_COLORS[t] || '#888';
    return `<span class="type-chip"
                  style="background:${color}22;color:${color};border:1px solid ${color}44">
              ${t}
            </span>`;
  }).join('');

  return `
    <div class="poke-card" onclick="openModal(${p.id})" title="${capitalize(p.name)}">
      <div class="poke-card-num">#${padNumber(p.id)}</div>
      <img
        src="${p.sprite || ''}"
        alt="${p.name}"
        loading="lazy"
        onerror="this.style.opacity='0.3'"
      />
      <div class="poke-card-name">${capitalize(p.name)}</div>
      <div class="poke-card-type">${typeChips}</div>
    </div>`;
}

/**

 * @param {string|number} gen
 * @param {HTMLElement} btn 
 */
function filterByGen(gen, btn) {
  activeGen = gen;
  document.querySelectorAll('.gen-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderDex(dexData);
}

/**
 * @param {string} val
 */
function filterDex(val) {
  searchQuery = val;
  renderDex(dexData);
}