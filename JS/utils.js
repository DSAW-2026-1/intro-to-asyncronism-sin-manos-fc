
/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @param {number} num
 * @param {number} length
 * @returns {string}
 */
function padNumber(num, length = 3) {
  return String(num).padStart(length, '0');
}

/**
 * @param {number} id
 * @returns {string}
 */
function genFromId(id) {
  for (const g of GEN_RANGES) {
    if (id >= g.min && id <= g.max) return g.name;
  }
  return 'Generation I';
}

/**
 * @param {number} id
 * @returns {number}
 */
function getGenIndex(id) {
  for (let i = 0; i < GENERATIONS.length; i++) {
    if (id >= GENERATIONS[i].min && id <= GENERATIONS[i].max) return i;
  }
  return 0;
}