/* ===========================
   1. 요소 선택
=========================== */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const navMenu     = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const navLinks    = document.querySelectorAll('.nav__link');
const sections    = document.querySelectorAll('section[id]');

// 중앙 상태 관리 객체 (간단한 UI 상태 분리)
const state = {
  menuOpen: false,
};

const setMenuOpen = (open) => {
  state.menuOpen = !!open;
  navMenu.classList.toggle('open', state.menuOpen);
  hamburger.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
  hamburger.textContent = state.menuOpen ? '✕' : '☰';
};

/* ===========================
   2. 햄버거 메뉴
=========================== */
hamburger.addEventListener('click', () => {
  setMenuOpen(!state.menuOpen);
});

// 링크 클릭 시 메뉴 닫기
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

// 메뉴 바깥 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    setMenuOpen(false);
  }
});

/* ===========================
   3. 다크모드 (상태 분리)
   - state.theme으로 관리하고 setTheme()으로 렌더와 상태 변경 분리
=========================== */
// 초기 테마 (localStorage 우선)
const initialTheme = localStorage.getItem('theme') || 'light';
state.theme = initialTheme;

const setTheme = (next) => {
  state.theme = next;
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
};

// 초기 적용
setTheme(state.theme);

// 토글 이벤트는 상태 변경만 담당
themeToggle.addEventListener('click', () => {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
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

  // 오른쪽 하단 플로팅 버튼 보이기/숨기기
  const floatingBtn = document.getElementById('floating-feedback');
  if (floatingBtn) {
    // 스크롤이 충분히 내려가면 표시 (예: 400px)
    floatingBtn.classList.toggle('visible', window.scrollY > 400);
  }
};

window.addEventListener('scroll', onScroll, { passive: true });

/* ===========================
   8. 플로팅 버튼 동작: 클릭하면 맨위로 이동
   - 접근성: prefers-reduced-motion을 존중
=========================== */
const initFloatingButton = () => {
  const btn = document.getElementById('floating-feedback');
  if (!btn) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTop = (e) => {
    e.preventDefault();
    if (reduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  btn.addEventListener('click', goTop);

  // 키보드 접근성: Enter / Space 처리
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTop(e);
    }
  });
};

// 초기화 호출 (스크립트가 바디 끝에서 로드되므로 바로 호출 가능)
initFloatingButton();

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

// 에러 메시지 HTML (버튼은 inline onclick 사용하지 않음)
const createError = (msg) => `
  <div class="github__error">
    <span>⚠️</span>
    <p>${msg}</p>
    <button class="btn btn--outline" id="github-retry">다시 시도</button>
  </div>
`;

// 에러 UI의 재시도 버튼에 이벤트 바인딩
const bindGithubRetry = () => {
  const retryBtn = document.getElementById('github-retry');
  if (retryBtn) {
    // 중복 바인딩 방지
    retryBtn.removeEventListener('click', fetchGithubRepos);
    retryBtn.addEventListener('click', fetchGithubRepos);
  }
};

// 레포 카드 1개 HTML
const createRepoCard = (repo) => {
  const lang      = repo.language || 'Unknown';
  const langColor = LANG_COLORS[lang] || LANG_COLORS.default;
  const desc      = repo.description || '설명이 없습니다.';
  const stars     = repo.stargazers_count;
  const forks     = repo.forks_count;
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('ko-KR');

  return `
    <article class="repo__card reveal stagger">
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
      bindGithubRetry();
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
           class="github__profile-link reveal">
          🐙 @${GITHUB_USERNAME} GitHub 바로가기
        </a>
      </div>
      <div class="repos__grid">
        ${filtered.map(createRepoCard).join('')}
      </div>
    `;

    // 동적 생성된 .reveal 요소들을 Intersection Observer에 등록
    document.querySelectorAll('.github__profile-link.reveal, .repo__card.reveal').forEach((el) => {
      revealObserver.observe(el);
    });

    // stagger 딜레이 설정
    document.querySelectorAll('.repo__card.stagger').forEach((el) => {
      const siblings = el.parentElement.querySelectorAll('.stagger');
      const order    = Array.from(siblings).indexOf(el);
      el.style.setProperty('--stagger-delay', `${order * 0.1}s`);
    });

  } catch (error) {
    // 7) 에러 처리
    console.error('GitHub API 오류:', error);
    container.innerHTML = createError(error.message);
    bindGithubRetry();
  }
}

// 페이지 로드 시 자동 실행
fetchGithubRepos();

/* ===========================
   6. 폼 유효성 검사
=========================== */
const contactForm = document.getElementById('contact-form');

const nameInput    = document.getElementById('name');
const emailInput   = document.getElementById('email');
const messageInput = document.getElementById('message');

const nameError    = document.getElementById('name-error');
const emailError   = document.getElementById('email-error');
const messageError = document.getElementById('message-error');

/* ---------- 검사 규칙 ---------- */
const validators = {

  // 이름: 2자 이상 20자 이하
  name: (value) => {
    if (!value.trim()) return '이름을 입력해주세요.';
    if (value.trim().length < 2) return '이름은 2자 이상 입력해주세요.';
    if (value.trim().length > 20) return '이름은 20자 이하로 입력해주세요.';
    return '';
  },

  // 이메일: 형식 체크
  email: (value) => {
    if (!value.trim()) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return '올바른 이메일 형식이 아닙니다.';
    return '';
  },

  // 메시지: 10자 이상 500자 이하
  message: (value) => {
    if (!value.trim()) return '메시지를 입력해주세요.';
    if (value.trim().length < 10) return `메시지는 10자 이상 입력해주세요. (현재 ${value.trim().length}자)`;
    if (value.trim().length > 500) return `메시지는 500자 이하로 입력해주세요. (현재 ${value.trim().length}자)`;
    return '';
  },
};

/* ---------- 유틸 함수 ---------- */

// 에러 표시
const showError = (input, errorEl, message) => {
  input.classList.remove('input--success');
  input.classList.add('input--error');
  errorEl.textContent = message;
};

// 성공 표시
const showSuccess = (input, errorEl) => {
  input.classList.remove('input--error');
  input.classList.add('input--success');
  errorEl.textContent = '';
};

// 초기화
const resetField = (input, errorEl) => {
  input.classList.remove('input--error', 'input--success');
  errorEl.textContent = '';
};

// 필드 하나 검사
const validateField = (input, errorEl, validatorKey) => {
  const error = validators[validatorKey](input.value);
  if (error) {
    showError(input, errorEl, error);
    return false;
  } else {
    showSuccess(input, errorEl);
    return true;
  }
};
 
/* ---------- 실시간 검사 (blur: 포커스 벗어날 때) ---------- */
nameInput.addEventListener('blur', () => {
  validateField(nameInput, nameError, 'name');
});

emailInput.addEventListener('blur', () => {
  validateField(emailInput, emailError, 'email');
});

messageInput.addEventListener('blur', () => {
  validateField(messageInput, messageError, 'message');
});

/* ---------- 입력 중 에러 실시간 해제 ---------- */
nameInput.addEventListener('input', () => {
  if (nameInput.classList.contains('input--error')) {
    validateField(nameInput, nameError, 'name');
  }
});

emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('input--error')) {
    validateField(emailInput, emailError, 'email');
  }
});

messageInput.addEventListener('input', () => {
  // 메시지는 글자수도 실시간으로 보여주기
  updateCharCount();
  if (messageInput.classList.contains('input--error')) {
    validateField(messageInput, messageError, 'message');
  }
});

/* ---------- 글자수 카운터 ---------- */
// HTML에 카운터 요소 동적 추가
const charCount = document.createElement('span');
charCount.className = 'char__count';
charCount.textContent = '0 / 500';
messageInput.parentElement.appendChild(charCount);

const updateCharCount = () => {
  const len = messageInput.value.trim().length;
  charCount.textContent = `${len} / 500`;

  // 500자 초과 시 빨간색
  if (len > 500) {
    charCount.classList.add('char__count--over');
  } else {
    charCount.classList.remove('char__count--over');
  }
};

/* ---------- 폼 제출 ---------- */
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // 전체 검사
  const isNameValid    = validateField(nameInput,    nameError,    'name');
  const isEmailValid   = validateField(emailInput,   emailError,   'email');
  const isMessageValid = validateField(messageInput, messageError, 'message');

  // 하나라도 실패 시 중단
  if (!isNameValid || !isEmailValid || !isMessageValid) {
    // 첫 번째 에러 필드로 포커스
    if (!isNameValid)         nameInput.focus();
    else if (!isEmailValid)   emailInput.focus();
    else                      messageInput.focus();
    return;
  }

  // 전체 통과 → 성공 처리
  handleFormSuccess();
});

/* ---------- 성공 처리 ---------- */
const handleFormSuccess = () => {
  // 버튼 로딩 상태
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.textContent = '전송 중...';
  submitBtn.disabled = true;

  // 실제 전송 시뮬레이션 (1.5초 후 성공)
  setTimeout(() => {
    // 폼 숨기고 성공 메시지 표시
    contactForm.style.display = 'none';

    const successMsg = document.createElement('div');
    successMsg.className = 'form__success';
    successMsg.innerHTML = `
      <div class="success__icon">✅</div>
      <h3>메시지가 전송되었습니다!</h3>
      <p>빠른 시일 내에 답변 드리겠습니다 😊</p>
      <button class="btn btn--outline" id="form-reset">다시 작성하기</button>
    `;
    contactForm.parentElement.appendChild(successMsg);

    // 다시 작성하기 버튼
    document.getElementById('form-reset').addEventListener('click', () => {
      successMsg.remove();
      contactForm.style.display = 'flex';
      contactForm.reset();
      submitBtn.textContent = '보내기';
      submitBtn.disabled = false;
      charCount.textContent = '0 / 500';

      // 모든 필드 초기화
      resetField(nameInput,    nameError);
      resetField(emailInput,   emailError);
      resetField(messageInput, messageError);
    });

  }, 1500);
};

/* ===========================
   7. 스크롤 애니메이션
   (Intersection Observer)
=========================== */

/* ---------- 1) 일반 reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('revealed');

      // 한 번 보이면 더 이상 감지 안 함
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15,      // 15% 보이면 실행
    rootMargin: '0px 0px -50px 0px', // 하단 50px 여유
  }
);

// .reveal 요소 전부 등록
document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/* ---------- 2) stagger (순서대로 등장) ---------- */
// 같은 부모 안의 stagger 요소들에 딜레이 자동 부여
document.querySelectorAll('.stagger').forEach((el, index) => {
  // 형제 중 몇 번째인지 계산
  const siblings = el.parentElement.querySelectorAll('.stagger');
  const order    = Array.from(siblings).indexOf(el);
  el.style.setProperty('--stagger-delay', `${order * 0.1}s`);
});

/* ---------- 3) 스킬바 애니메이션 ---------- */
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // 스킬바 fill 요소 찾아서 width 적용
      const fills = entry.target.querySelectorAll('.skill__fill');
      fills.forEach((fill) => {
        const targetWidth = fill.style.getPropertyValue('--fill') 
                         || fill.getAttribute('data-fill');
        fill.style.width = targetWidth;
      });

      skillObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.3 }
);

// 스킬 섹션 등록
const skillsSection = document.getElementById('skills');
if (skillsSection) {
  skillObserver.observe(skillsSection);
}

/* ---------- 4) 히어로 텍스트 등장 ---------- */
// 페이지 로드 시 Hero 요소 순서대로 등장
const heroElements = document.querySelectorAll(
  '.hero__greeting, .hero__title, .hero__subtitle, .hero__btns'
);

heroElements.forEach((el, index) => {
  el.style.animationDelay = `${index * 0.2}s`;
  el.classList.add('hero__animate');
});