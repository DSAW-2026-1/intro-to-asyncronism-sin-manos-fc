

let currentPage = 'game';  
let dexLoaded   = false;   

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menu-btn');
  const overlay = document.getElementById('overlay');

  const isOpen = sidebar.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  overlay.classList.toggle('show', isOpen);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('menu-btn').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}


/**
 * @param {string} page
 */
function switchPage(page) {
  if (currentPage === page) {
    closeSidebar();
    return;
  }

  currentPage = page;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');
  document.getElementById(`nav-${page}`).classList.add('active');

  closeSidebar();

  if (page === 'pokedex' && !dexLoaded) {
    dexLoaded = true;
    loadDex();  
  }
}