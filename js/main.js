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

/* ===========================
   5. GitHub API 연동
=========================== */
const GITHUB_USERNAME = 'Sanghwa-Na';
const GITHUB_API_URL  = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

// 언어별 색상
const LANG_COLORS = {
  JavaScript : '#f1e05a',
  TypeScript : '#3178c6',
  Python     : '#3572A5',
  HTML       : '#e34c26',
  CSS        : '#563d7c',
  Java       : '#b07219',
  C          : '#555555',
  'C++'      : '#f34b7d',
  default    : '#8b949e',
};

/* ---------- 유틸 함수 ---------- */

// 로딩 스피너 HTML
const createLoader = () => `
  <div class="github__loader">
    <div class="spinner"></div>
    <p>레포지토리 불러오는 중...</p>
  </div>
`;

// 에러 메시지 HTML
const createError = (msg) => `
  <div class="github__error">
    <span>⚠️</span>
    <p>${msg}</p>
    <button class="btn btn--outline" onclick="fetchGithubRepos()">다시 시도</button>
  </div>
`;

// 레포 카드 1개 HTML
const createRepoCard = (repo) => {
  const lang      = repo.language || 'Unknown';
  const langColor = LANG_COLORS[lang] || LANG_COLORS.default;
  const desc      = repo.description || '설명이 없습니다.';
  const stars     = repo.stargazers_count;
  const forks     = repo.forks_count;
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('ko-KR');

  return `
    <article class="repo__card">
      <div class="repo__header">
        <span class="repo__icon">📁</span>
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
           class="repo__name">${repo.name}</a>
      </div>

      <p class="repo__desc">${desc}</p>

      <div class="repo__footer">
        <div class="repo__meta">
          <span class="repo__lang">
            <span class="lang__dot" style="background:${langColor}"></span>
            ${lang}
          </span>
          <span class="repo__stat">⭐ ${stars}</span>
          <span class="repo__stat">🍴 ${forks}</span>
        </div>
        <span class="repo__date">업데이트: ${updatedAt}</span>
      </div>
    </article>
  `;
};

/* ---------- 메인 fetch 함수 ---------- */
async function fetchGithubRepos() {
  const container = document.getElementById('github-repos');

  // 1) 로딩 표시
  container.innerHTML = createLoader();

  try {
    // 2) API 호출
    const response = await fetch(GITHUB_API_URL);

    // 3) 응답 상태 체크
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else if (response.status === 404) {
        throw new Error('GitHub 유저를 찾을 수 없습니다.');
      } else {
        throw new Error(`오류가 발생했습니다. (${response.status})`);
      }
    }

    // 4) JSON 파싱
    const repos = await response.json();

    // 5) 레포가 없을 때
    if (repos.length === 0) {
      container.innerHTML = createError('공개된 레포지토리가 없습니다.');
      return;
    }

    // 6) fork 제외 + 최신순 정렬 후 카드 렌더링
    const filtered = repos
      .filter(repo => !repo.fork)       // fork 레포 제외
      .slice(0, 6);                     // 최대 6개

    container.innerHTML = `
      <div class="github__profile">
        <a href="https://github.com/${GITHUB_USERNAME}"
           target="_blank" rel="noopener noreferrer"
           class="github__profile-link">
          🐙 @${GITHUB_USERNAME} GitHub 바로가기
        </a>
      </div>
      <div class="repos__grid">
        ${filtered.map(createRepoCard).join('')}
      </div>
    `;

  } catch (error) {
    // 7) 에러 처리
    console.error('GitHub API 오류:', error);
    container.innerHTML = createError(error.message);
  }
}

// 페이지 로드 시 자동 실행
fetchGithubRepos();