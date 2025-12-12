// app.js (최신 정리본)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // ← .env를 최상단에서 로드

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // ← 반드시 promise 버전만 사용

// 환경 변수 확인 로그
console.log('[ENV CHECK]', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
});

const app = express();
const port = 3000;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일
app.use(express.static(path.join(__dirname, 'public')));

// contactInfo
const contactInfo = {
  naver: { email: 'hbm7802@naver.com', link: 'mailto:hbm7802@naver.com' },
  google: { email: 'kisook2557@gmail.com', link: 'mailto:kisook2557@gmail.com' },
  phone: { number: '010-2264-2557', link: 'tel:010-2264-2557' },
  kakao: { id: 'hbm2557', link: 'https://open.kakao.com/o/[your-kakao-open-chat-id]' },
  address: {
    text: '인천광역시 남구 학익동 하나2차',
    link: 'https://map.naver.com/p/search/%EC%9D%B8%EC%B2%9C%20%EB%82%A8%EA%B5%AC%20%ED%95%99%EC%9D%B5%EB%8F%99%20%ED%95%98%EB%82%982%EC%B0%A8/place/16598606?c=15.00,0,0,0,dh&placePath=%3Fentry%253Dbmp'
  },
  github: { username: 'thisNorm', link: 'https://github.com/thisNorm' }
};

// 현재 페이지 설정
app.use((req, res, next) => {
  res.locals.currentPage = req.path.substring(1) || 'home';
  next();
});

// 라우트
app.get('/', (req, res) => {
  res.render('index', { title: '홈', pageDescription: '환영합니다!', contactInfo });
});
app.get('/profile', (req, res) =>
  res.render('profile', { title: '프로필', pageDescription: '프로필 정보입니다.', layout: false })
);
app.get('/blog', (req, res) => res.render('blog', { layout: false }));
app.get('/stack', (req, res) =>
  res.render('stack', { title: '기술 스택', pageDescription: '사용 가능한 기술 스택입니다.', layout: false })
);
app.get('/project', (req, res) => res.render('project', { layout: false }));
app.get('/contact', (req, res) =>
  res.render('contact', { title: '연락처', pageDescription: '연락처 정보입니다.', contactInfo, layout: false })
);
app.get('/sections/contact', (req, res) =>
  res.render('contact', { title: '연락처', pageDescription: '연락처 정보입니다.', contactInfo, layout: false })
);
app.get('/partials/modals/:modalType', (req, res) =>
  res.render(`partials/modals/${req.params.modalType}`, { layout: false })
);

// 404/500
app.use((req, res) => res.status(404).render('404', { title: '페이지를 찾을 수 없습니다', currentPage: '404' }));
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).render('500', { title: '서버 오류', currentPage: '500' });
});

// --- DB 연결 후 서버 시작 ---
async function start() {
  try {
    const cfg = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME || 'portfolio',
      waitForConnections: true,
      connectionLimit: 10,
    };
    console.log('[DB CFG]', { ...cfg, password: cfg.password ? '***' : '(empty)' });

    const pool = await mysql.createPool(cfg);
    await pool.query('SELECT 1');
    console.log('MySQL 연결 성공');

    app.locals.db = pool;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (e) {
    console.error('MySQL 연결 실패:', e);
    process.exit(1);
  }
}
start();
