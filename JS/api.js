
const BASE_URL = 'https://pokeapi.co/api/v2';


const GEN_RANGES = [
  { name: 'Generation I',   min: 1,   max: 151 },
  { name: 'Generation II',  min: 152, max: 251 },
  { name: 'Generation III', min: 252, max: 386 },
];


const GENERATIONS = [
  { label: 'Generation I',   min: 1,   max: 151 },
  { label: 'Generation II',  min: 152, max: 251 },
  { label: 'Generation III', min: 252, max: 386 },
  { label: 'Generation IV',  min: 387, max: 493 },
  { label: 'Generation V',   min: 494, max: 649 },
  { label: 'Generation VI',  min: 650, max: 721 },
];


const TYPE_COLORS = {
  fire:     '#ff6b35',
  water:    '#4cc9f0',
  grass:    '#06d6a0',
  electric: '#ffd60a',
  psychic:  '#f72585',
  ice:      '#a8dadc',
  dragon:   '#7b2fff',
  dark:     '#aaa',
  fighting: '#e07d54',
  poison:   '#b967db',
  ground:   '#e8c26c',
  flying:   '#90b4e6',
  bug:      '#a8c550',
  rock:     '#c5b88a',
  ghost:    '#8e6fbb',
  steel:    '#b0c4d8',
  fairy:    '#f4a7c3',
  normal:   '#b8b8a0',
};



/**
 * @param {number} id 
 * @returns {Promise<Object>} 
 */
async function fetchGamePokemon(id) {
  const [pokeRes, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${id}`),
    fetch(`${BASE_URL}/pokemon-species/${id}`),
  ]);

  const pokeData    = await pokeRes.json();
  const speciesData = await speciesRes.json();

  return {
    id,
    name:       pokeData.name,
    weight:     pokeData.weight / 10,      
    height:     pokeData.height / 10,      
    types:      pokeData.types.map(t => t.type.name),
    sprite:     pokeData.sprites.other['official-artwork'].front_default
                || pokeData.sprites.front_default,
    generation: speciesData.generation.name,
  };
}

/**
 * @param {number} id 
 * @returns {Promise<Object>}
 */
async function fetchModalPokemon(id) {
  const [pokeRes, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${id}`),
    fetch(`${BASE_URL}/pokemon-species/${id}`),
  ]);

  const pokeData    = await pokeRes.json();
  const speciesData = await speciesRes.json();

  return {
    id,
    name:      pokeData.name,
    weight:    pokeData.weight / 10,
    height:    pokeData.height / 10,
    types:     pokeData.types.map(t => t.type.name),
    artwork:   pokeData.sprites.other['official-artwork'].front_default
               || pokeData.sprites.front_default,
    stats:     pokeData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    abilities: pokeData.abilities.map(a => a.ability.name),
    genus:     speciesData.genera?.find(g => g.language.name === 'en')?.genus || '',
  };
}



/**
 * @param {number} offset 
 * @param {number} limit  
 * @returns {Promise<Object[]>} 
 */
async function fetchDexBatch(offset, limit) {
  const listRes  = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  const listData = await listRes.json();

  const batch = await Promise.all(
    listData.results.map(async (_, i) => {
      const id     = offset + i + 1;
      const detRes = await fetch(`${BASE_URL}/pokemon/${id}`);
      const detail = await detRes.json();

      return {
        id,
        name:      detail.name,
        weight:    detail.weight / 10,
        height:    detail.height / 10,
        types:     detail.types.map(t => t.type.name),
        sprite:    detail.sprites.front_default,
        artwork:   detail.sprites.other['official-artwork'].front_default
                   || detail.sprites.front_default,
        stats:     detail.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        abilities: detail.abilities.map(a => a.ability.name),
      };
    })
  );

  return batch;
}