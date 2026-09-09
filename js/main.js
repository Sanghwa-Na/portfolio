/* ===========================
   1. 요소 선택
=========================== */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const navMenu     = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const navLinks    = document.querySelectorAll('.nav__link');
const sections    = document.querySelectorAll('section[id]');

/* ===========================
   2. 햄버거 메뉴
=========================== */
hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  hamburger.textContent = isOpen ? '✕' : '☰';
});

// 링크 클릭 시 메뉴 닫기
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.textContent = '☰';
    hamburger.setAttribute('aria-label', '메뉴 열기');
  });
});

// 메뉴 바깥 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.textContent = '☰';
    hamburger.setAttribute('aria-label', '메뉴 열기');
  }
});

/* ===========================
   3. 다크모드
=========================== */
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

/* ===========================
   4. 스크롤 이벤트
=========================== */
const HEADER_HEIGHT = 64; // CSS --header-height 값과 동일하게

const onScroll = () => {
  // 헤더 그림자
  header.classList.toggle('scrolled', window.scrollY > 10);

  // 활성 네비 링크
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - HEADER_HEIGHT - 20;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
};

window.addEventListener('scroll', onScroll, { passive: true });