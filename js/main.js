document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    // accessibility
    if (!hamburgerBtn.hasAttribute('aria-controls')) hamburgerBtn.setAttribute('aria-controls', 'navMenu');
    if (!hamburgerBtn.hasAttribute('aria-expanded')) hamburgerBtn.setAttribute('aria-expanded', 'false');

    const openMenu = () => {
      navMenu.classList.add('open');
      hamburgerBtn.classList.add('active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navMenu.classList.remove('open');
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
 
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });

    navMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('open')) return;
      if (e.target.closest('#navMenu')) return;
      if (e.target.closest('#hamburgerBtn')) return;
      closeMenu();
    });
  }
 
  // 다크모드 토글 (localStorage 저장)
  const themeToggleBtn = document.getElementById('themeToggle');
  const root = document.documentElement; // <html>

  const savedTheme = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-theme', savedTheme);

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }

  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }

  // 스크롤 이벤트 (Nav 그림자, 스크롤 탑 버튼)
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    if (scrollTopBtn) {
      if (scrollY > 300) scrollTopBtn.classList.add('visible');
      else scrollTopBtn.classList.remove('visible');
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
});

