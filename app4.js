/* ── Progress bar ── */
window.addEventListener('scroll', () => {
  const el = document.getElementById('progress-bar');
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  el.style.width = (scrollTop / scrollHeight * 100) + '%';
});

/* ── NAV ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});
function toggleMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }
function closeMenu()  { document.getElementById('mobile-menu').classList.remove('open'); }

/* ── Contact form → Google Forms ── */
const GOOGLE_FORM_CONFIG = {
  FORM_ACTION_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd4bzibmxDbhs03kT7852twEr8Q2s_v2X55eXbfuyZjYsUTpQ/formResponse',
  ENTRIES: {
    name: 'entry.236996633',
    company: 'entry.100015974',
    email: 'entry.1808168783',
    service: 'entry.2080477961',
    period: 'entry.740428173',
    message: 'entry.2016539096'
  },
  HIDDEN_FIELDS: {
    fvv: '1',
    partialResponse: '[null,null,"5895922779701442006"]',
    pageHistory: '0',
    fbzx: '5895922779701442006',
    submissionTimestamp: '-1'
  }
};

function isGoogleFormConfigured() {
  return GOOGLE_FORM_CONFIG.FORM_ACTION_URL.includes('formResponse') &&
    Object.values(GOOGLE_FORM_CONFIG.ENTRIES).every(id => /^entry\.\d+$/.test(id));
}

function setContactFormStatus(message, type) {
  const status = document.getElementById('contact-form-status');
  if (!status) return;
  status.textContent = message;
  status.className = `form-status ${type ? 'is-' + type : ''}`;
}

function buildGoogleFormPayload(form) {
  const formData = new FormData(form);
  const payload = {};
  Object.entries(GOOGLE_FORM_CONFIG.ENTRIES).forEach(([fieldName, entryId]) => {
    payload[entryId] = formData.get(fieldName) || '';
  });
  Object.assign(payload, GOOGLE_FORM_CONFIG.HIDDEN_FIELDS);
  return payload;
}

function submitGoogleForm(payload) {
  return new Promise((resolve, reject) => {
    const frameName = `google-form-submit-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.style.display = 'none';

    const googleForm = document.createElement('form');
    googleForm.action = GOOGLE_FORM_CONFIG.FORM_ACTION_URL;
    googleForm.method = 'POST';
    googleForm.target = frameName;
    googleForm.style.display = 'none';

    Object.entries(payload).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      googleForm.appendChild(input);
    });

    const cleanup = () => {
      googleForm.remove();
      iframe.remove();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Googleフォームへの送信がタイムアウトしました。'));
    }, 10000);

    iframe.addEventListener('load', () => {
      window.clearTimeout(timeout);
      cleanup();
      resolve();
    }, { once: true });

    document.body.appendChild(iframe);
    document.body.appendChild(googleForm);
    googleForm.submit();
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setContactFormStatus('必須項目を入力してください。', 'error');
      return;
    }
    if (!isGoogleFormConfigured()) {
      setContactFormStatus('Googleフォーム連携の設定が未完了です。フォームURLとentry IDを設定してください。', 'error');
      return;
    }

    const submitButton = form.querySelector('.btn-submit');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';
    setContactFormStatus('', '');

    try {
      await submitGoogleForm(buildGoogleFormPayload(form));
      form.reset();
      setContactFormStatus('送信しました。お問い合わせありがとうございます。', 'success');
    } catch (error) {
      setContactFormStatus('送信できませんでした。時間をおいて再度お試しください。', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}
document.addEventListener('DOMContentLoaded', initContactForm);

function fillContactPeriodFromDate(dateStr) {
  const periodInput = document.getElementById('contact-period');
  if (!periodInput || periodInput.value.trim()) return;
  const d = new Date(dateStr + 'T00:00:00');
  periodInput.value = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日ごろ`;
}

/* ── Scroll-in animation ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.anim-in').forEach(el => observer.observe(el));

/* ── Hero Slideshow ── */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current = 0, timer = null;
  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  window.goToSlide = function(n) { goTo(n); reset(); };
  function reset() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5000); }
  reset();
})();

/* ── MARQUEE BUILD ── */
const REC_DATA = [
  {
    keyword: '空気感をすくい上げる',
    from: '社内イベント主催者',
    preview: '彼女の描く絵は、参加者の声や空気感をその場で丁寧にすくい上げ、視覚的にわかりやすく、そして印象深く表現されます。',
    full: `社内のイベントで、吉川観奈さんによるグラフィックレコーディングを導入しました。\n\n幾つかのグループに分かれてセッションを実施するので、他のグループのディスカッション内容を参加者全員に共有したく、その手法としてグラフィックに残すことは面白いかな、と考えた次第です。\n\n彼女の描く絵は、参加者の声や空気感をその場で丁寧にすくい上げ、視覚的にわかりやすく、そして印象深く表現されます。議論の流れや気づきが絵として残ることで、内容が鮮明に思い出されるようで、参加者同士の共通理解が深まったように感じます。\n\n特に、言葉では伝えづらい感情やニュアンスが、色や構図を通じて自然に伝わってくる点が素晴らしく、グラフィックの力を改めて実感しました。`
  },
  {
    keyword: 'Attentive & Bilingual',
    from: 'International graphic recorder',
    preview: 'She is attentive to each client, dedicating much time to understand the purpose of the event. I am amazed by her ability to shift between Japanese and English.',
    full: `Kanna is a wonderful graphic recorder. She is attentive to each client, dedicating much time to understand the purpose of the event and then prepares her work to fit that specific need. She has bold, direct writing that is balanced beautifully with her soft background colors. I am amazed by her ability to shift between writing Japanese and English.\n\nWhat is most impressive about Kanna is her drive to improve her skills. She is already an accomplished visualizer, but she works continually to refine her work to make it increasingly useful for clients.\n\nI highly recommend her to graphically record your next meeting.`
  },
  {
    keyword: 'Listens Deeply',
    from: 'Graphic recording colleague',
    preview: 'She listens deeply, distills complex discussions into clear, visually engaging narratives, and brings energy and insight to every project.',
    full: `Kanna is an exceptional graphic recorder whose talent goes far beyond simply capturing words on a page. She listens deeply, distills complex discussions into clear, visually engaging narratives, and brings energy and insight to every project.\n\nHer work not only reflects the conversation but enhances it, helping participants see connections and ideas they might have missed. Kanna is professional, creative, and a joy to collaborate with — I would highly recommend her to anyone looking to make their meetings and events more impactful and memorable.`
  },
  {
    keyword: '複雑な情報を視覚で届ける',
    from: '日本製薬医学会 大会主催者',
    preview: '講演の内容を的確に整理し、医学・薬学・行政など幅広い分野の要点を、美しくわかりやすい図解としてまとめてくださいました。',
    full: `吉川さんは、私が主催した第14回日本製薬医学会年次大会において、グラフィックレコーダーとして大きな力を発揮してくれました。講演の内容を的確に整理し、医学・薬学・行政など幅広い分野の要点を、美しくわかりやすい図解としてまとめてくださいました。\n\nクロージングセッションでは、そのグラフィックをスクリーンに映しながら大会を総括し、参加者の記憶に鮮やかによみがえる講演内容と、図解による整理効果が相まって、会場全体に深い理解と感動が広がりました。\n\n吉川さんの作品は単なる記録にとどまらず、複雑な情報を整理し、視覚的に伝えることで知識の定着を促す力を持っています。`
  },
  {
    keyword: '人は人の中で癒される',
    from: '「人権・生命倫理・精神科医療」セミナー協力者',
    preview: '辛い状況や問題群を表現しながらも、淡く柔らかい色調で包み込み、理想に向かって協力する決意を描き出してくれました。',
    full: `私がグラレコに涙した理由－「人は人の中で癒される」\n\n2025年6月21日に神戸で開催されたハイブリッドセミナー「人権・生命倫理・精神科医療　改革のグランドデザインを語ろう！」に協力をいただいた吉川観奈さんのグラフィックレコーディング作品に、私は感涙してしまいました。グラレコ作品にこんなに心が打ち震える感動を受けるとは、思いも寄りませんでした。\n\nこの集いでは過酷な、非人道的ともいえる人権侵害の事例や、長期に及ぶ隔離による入院期間中に亡くなった患者さんの事例が伝えられました。しかしそうした人権侵害を無くすというだけでなく、当事者の方たちが創造的で楽しくハッピーな地域での生活を営んでいる取り組みも紹介されました。\n\n吉川さんが披露した7つのグラレコ作品は、それぞれの発表内容を素晴らしくとらえていました。その中でも胸を打たれたのは「人は人の中で癒される」という言葉とともに描かれた「母子像」です。美しい母親の弧を描くような髪と腕の中に抱かれた、涙を流しながらも微笑んでいる男の子。この姿に出会うと今も涙してしまいます。\n\n辛い状況や問題群を表現しながらも、ブルー、ピンク、紫、グリーンの淡く柔らかい色調で包み込まれ、心を寄せ合った神戸の街のシンボルとともに描かれた最後のグラレコは、理想に向かって力強く協力し、当事者・市民が主人公になって新しい世界を築いていく決意を描き出しました。\n\n吉川さんは、2回にわたる事前相談会にも参加してくださり、どんどん共感を深めてくださいました。打ち合わせ中の吉川さんの表情からも、感情の高まり、魂が引き込まれているような様子が感じられ、「社会共創」という言葉をそのまま体現するようでした。\n\n小さな力でも、心を寄せ合って、声を出し続ければ、きっと「世界を変えられる」。そんな確信を共有することができました。吉川さん、素敵な作品を本当にありがとうございました！`,
    image: 'images/jinken.jpg',
    imageAlt: '人権・生命倫理・精神科医療セミナーのグラフィックレコーディング'
  },
  {
    keyword: '心強い伴走と象徴になる記録',
    from: '肝炎医療コーディネーター講座 ご担当者',
    preview: '講座直前まで試行錯誤を重ねる中で、相談できたことがとても心強く、活動を象徴する貴重な資材になりました。',
    full: `初めてご連絡を差し上げて以来、何度も打ち合わせのお時間を頂戴し、その中から多くのアイディアを生み出すことができました。講座直前まで試行錯誤を重ねる中で、吉川様にご相談させていただけたことがどれほど心強かったか、感謝の気持ちでいっぱいです。\n\n今回の企画を通じて、私自身も改めて肝炎医療コーディネーター活動について深く向き合い、考える貴重な機会となりました。\n\nまた、作成いただいたグラフィックレコーダーは、鹿児島県の肝炎医療コーディネーター活動を象徴する大変貴重な資材であり、今後の研修会や講座でも大切に活用させていただきたく存じます。`,
    image: 'images/tirashi.png',
    imageAlt: '鹿児島県の肝炎医療コーディネーター活動のグラフィックレコーディング'
  }
];

function buildMarquee() {
  function makeCard(d, i) {
    const card = document.createElement('div');
    card.className = 'mq-card';
    card.innerHTML = `
      <div class="mq-quote">"</div>
      <div class="mq-keyword">${d.keyword}</div>
      <p class="mq-text">${d.preview}</p>
      <div class="mq-from">— ${d.from}</div>
      <button class="mq-read-btn" onclick="openRecModal(${i})">全文を読む →</button>
    `;
    return card;
  }
  const row1 = document.getElementById('mq-row1');
  const row2 = document.getElementById('mq-row2');
  const half1 = REC_DATA.slice(0, 2);
  const half2 = REC_DATA.slice(2);
  for (let rep = 0; rep < 4; rep++) {
    half1.forEach((d, i) => row1.appendChild(makeCard(d, i)));
    half2.forEach((d, i) => row2.appendChild(makeCard(d, i + 2)));
  }
}

function openRecModal(idx) {
  const d = REC_DATA[idx];
  if (!d) return;
  document.getElementById('rec-modal-keyword').textContent = d.keyword;
  document.getElementById('rec-modal-text').innerHTML =
    d.full.split('\n\n').map(p => `<p>${p}</p>`).join('') +
    (d.image ? `<img src="${d.image}" alt="${d.imageAlt || ''}" class="rec-modal-img" onerror="this.style.display='none'">` : '');
  document.getElementById('rec-modal-from').textContent = '― ' + d.from;
  document.getElementById('rec-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRecModal() {
  document.getElementById('rec-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   WORKS SHOWCASE
══════════════════════════════════════ */
const WORKS = [
  { cat:'leaflet',   type:'image', src:'images/tirashi.png', title:'リーフレット',         catLabel:'Leaflet'    },
  { cat:'medical',   type:'image', src:'images/gra1.png',     title:'医療カンファレンス',   catLabel:'Healthcare'  },
  { cat:'diversity', type:'image', src:'images/gra2.jpg',     title:'ダイバーシティ研修',   catLabel:'Inclusion'   },
  { cat:'bilingual', type:'image', src:'images/gra3.png',     title:'バイリンガル対応',     catLabel:'Bilingual'   },
  { cat:'animation', type:'video', src:'images/video1.mp4',   title:'グラレコ動画',         catLabel:'Animation'   },
];

let currentFilter  = 'all';
let currentIndex   = 0;
let filteredList   = WORKS.map((_,i) => i);
let showcaseTimer  = null;

function getFilteredList() {
  return WORKS.map((_,i) => i).filter(i => currentFilter === 'all' || WORKS[i].cat === currentFilter);
}

function buildShowcase() {
  const inner = document.getElementById('showcase-inner');
  inner.innerHTML = '';
  WORKS.forEach((w, i) => {
    const div = document.createElement('div');
    div.className = 'showcase-slide';
    div.dataset.windex = i;

    const blurDiv = document.createElement('div');
    blurDiv.className = 'showcase-blur-bg';
    if (w.src && w.type === 'image') blurDiv.style.backgroundImage = `url('${w.src}')`;
    div.appendChild(blurDiv);

    if (w.type === 'video' && w.src) {
      const vid = document.createElement('video');
      vid.className = 'showcase-bg';
      vid.src = w.src;
      vid.muted = true; vid.loop = true; vid.playsInline = true;
      div.appendChild(vid);
    } else if (w.type === 'image' && w.src) {
      const img = document.createElement('img');
      img.className = 'showcase-bg'; img.src = w.src; img.alt = w.title;
      div.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'showcase-placeholder';
      ph.textContent = w.title;
      div.appendChild(ph);
    }

    const ov = document.createElement('div');
    ov.className = 'showcase-overlay';
    div.appendChild(ov);

    const info = document.createElement('div');
    info.className = 'showcase-info';
    info.innerHTML = `<span class="showcase-cat">${w.catLabel}</span><h3 class="showcase-title">${w.title}</h3>`;
    div.appendChild(info);

    div.addEventListener('click', () => openLightbox(i));
    inner.appendChild(div);
  });
}

function applyFilter() {
  filteredList = getFilteredList();
  currentIndex = 0;
  const allSlides = document.querySelectorAll('.showcase-slide');
  allSlides.forEach(s => {
    const wi = parseInt(s.dataset.windex);
    s.classList.remove('active');
    s.classList.toggle('hidden', !filteredList.includes(wi));
  });
  showSlide(currentIndex);
  buildDots();
  resetShowcaseTimer();
}

function showSlide(idx) {
  const allSlides = document.querySelectorAll('.showcase-slide');
  allSlides.forEach(s => s.classList.remove('active'));
  const wi = filteredList[idx];
  if (wi == null) return;
  const target = document.querySelector(`.showcase-slide[data-windex="${wi}"]`);
  if (target) {
    target.classList.add('active');
    const vid = target.querySelector('video');
    if (vid) vid.play().catch(()=>{});
    document.querySelectorAll('.showcase-slide:not(.active) video').forEach(v => { v.pause(); v.currentTime = 0; });
  }
  document.querySelectorAll('.showcase-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
  currentIndex = idx;
}

function buildDots() {
  const wrap = document.getElementById('showcase-dots');
  wrap.innerHTML = '';
  filteredList.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'showcase-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `作品${i+1}`);
    btn.addEventListener('click', () => { showSlide(i); resetShowcaseTimer(); });
    wrap.appendChild(btn);
  });
}

function showcaseNav(dir) {
  const next = (currentIndex + dir + filteredList.length) % filteredList.length;
  showSlide(next);
  resetShowcaseTimer();
}

function resetShowcaseTimer() {
  clearInterval(showcaseTimer);
  showcaseTimer = setInterval(() => {
    const next = (currentIndex + 1) % filteredList.length;
    showSlide(next);
  }, 5000);
}

function setFilter(btn, cat) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = cat;
  applyFilter();
}

(function () {
  let startX = 0;
  const outer = document.getElementById('showcase-outer');
  outer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  outer.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) showcaseNav(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* ── Lightbox ── */
function openImageLightbox(src, caption) {
  const inner = document.getElementById('lightbox-inner');
  inner.innerHTML = '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = caption || '';
  img.style.cssText = 'max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain;';
  inner.appendChild(img);
  if (caption) {
    const cap = document.createElement('p');
    cap.className = 'lightbox-caption';
    cap.textContent = caption;
    inner.appendChild(cap);
  }
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openLightbox(wi) {
  const w = WORKS[wi];
  const inner = document.getElementById('lightbox-inner');
  inner.innerHTML = '';
  if (w.type === 'video' && w.src) {
    const vid = document.createElement('video');
    vid.src = w.src; vid.controls = true; vid.autoplay = true;
    vid.style.cssText = 'max-width:90vw;max-height:75vh;border-radius:12px;';
    inner.appendChild(vid);
  } else if (w.type === 'image' && w.src) {
    const img = document.createElement('img');
    img.src = w.src; img.alt = w.title;
    img.style.cssText = 'max-width:90vw;max-height:75vh;border-radius:12px;object-fit:contain;';
    inner.appendChild(img);
  }
  const cap = document.createElement('p');
  cap.className = 'lightbox-caption';
  cap.textContent = w.title;
  inner.appendChild(cap);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  const vid = lb.querySelector('video');
  if (vid) { vid.pause(); vid.src = ''; }
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeRecModal(); }
});

buildMarquee();
buildShowcase();
applyFilter();

/* ══════════════════════════════════════
   GOOGLE CALENDAR VIA APPS SCRIPT
══════════════════════════════════════ */
const GCAL_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyi-fRybVHUcp-R5n-agJ5ykfZ2J2mm41O4n5Od49-EgWlVQHsIFwRxJ4BYhW2dQ08/exec',
  SHOW_EVENT_TITLES: true,
  CACHE_TTL_MS: 0,
};

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth() + 1;
let calEventCache = {};
let calLoading = false;
let selectedDate = null;

function getCalendarCacheKey(year, month) {
  return `site-calendar:${GCAL_CONFIG.APPS_SCRIPT_URL}:${year}-${String(month).padStart(2,'0')}`;
}

function getCachedEvents(year, month) {
  if (GCAL_CONFIG.CACHE_TTL_MS <= 0) return null;
  const key = getCalendarCacheKey(year, month);
  const memoryCache = calEventCache[key];
  const now = Date.now();
  if (memoryCache && now - memoryCache.cachedAt < GCAL_CONFIG.CACHE_TTL_MS) {
    return memoryCache.events;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (!stored || !stored.cachedAt || !stored.events) return null;
    if (now - stored.cachedAt >= GCAL_CONFIG.CACHE_TTL_MS) return null;
    calEventCache[key] = stored;
    return stored.events;
  } catch (err) {
    return null;
  }
}

function setCachedEvents(year, month, events) {
  if (GCAL_CONFIG.CACHE_TTL_MS <= 0) return;
  const key = getCalendarCacheKey(year, month);
  const payload = { cachedAt: Date.now(), events };
  calEventCache[key] = payload;
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {}
}

function loadAppsScriptEvents(year, month) {
  return new Promise((resolve, reject) => {
    const callbackName = `handleCalendarEvents_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Scriptからの応答がありません。'));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = data => {
      cleanup();
      resolve(data || { items: [] });
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Apps Scriptの読み込みに失敗しました。'));
    };

    const url = new URL(GCAL_CONFIG.APPS_SCRIPT_URL);
    url.searchParams.set('year', year);
    url.searchParams.set('month', month);
    url.searchParams.set('callback', callbackName);
    script.src = url.toString();
    document.head.appendChild(script);
  });
}

async function fetchEvents(year, month) {
  const cached = getCachedEvents(year, month);
  if (cached) return cached;

  const data = await loadAppsScriptEvents(year, month);
  const byDate = {};
  (data.items||[]).forEach(ev => {
    const start = ev.startDate || ev.start?.date || ev.start?.dateTime?.slice(0,10) || ev.start?.slice?.(0,10);
    const end   = ev.endDate   || ev.end?.date   || ev.end?.dateTime?.slice(0,10)   || ev.end?.slice?.(0,10) || start;
    if (!start) return;
    let cur = new Date(start + 'T00:00:00');
    const endD = new Date(end + 'T00:00:00');
    const maxLoops = 370;
    let loops = 0;
    const isAllDay = !!ev.allDay || !!ev.start?.date;
    const isInRange = () => isAllDay ? cur < endD : cur <= endD;
    while (isInRange() && loops < maxLoops) {
      const d = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
      if (!byDate[d]) byDate[d]=[];
      byDate[d].push({
        id: ev.id,
        title: ev.title || ev.summary || '予定あり',
        allDay: isAllDay,
        start: ev.start?.dateTime || ev.start,
        end: ev.end?.dateTime || ev.end
      });
      cur.setDate(cur.getDate()+1);
      loops++;
    }
  });
  setCachedEvents(year, month, byDate);
  return byDate;
}

function getDemoEvents(year, month) {
  const byDate = {};
  const days = new Date(year, month, 0).getDate();
  for (let d=1; d<=days; d++) {
    const date = new Date(year, month-1, d);
    const dow = date.getDay();
    const k = date.toISOString().slice(0,10);
    if (dow===0 || dow===6 || [5,10,15,20].includes(d)) byDate[k]=[{id:d,title:'予定あり',allDay:true}];
  }
  return byDate;
}

function formatCalendarTimeLabel(ev) {
  if (!ev || ev.allDay || !ev.start) return '終日';
  const start = new Date(ev.start);
  const end = ev.end ? new Date(ev.end) : null;
  if (Number.isNaN(start.getTime())) return '予定あり';
  const startText = start.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
  if (!end || Number.isNaN(end.getTime())) return startText;
  const endText = end.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
  return `${startText}-${endText}`;
}

async function renderCalendar(year, month) {
  if (calLoading) return;
  calLoading = true;
  const isDemo = (GCAL_CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL');
  document.getElementById('cal-month-label').textContent = `${year}年 ${month}月`;
  document.getElementById('cal-loading').style.display = 'flex';
  document.getElementById('cal-error').style.display   = 'none';
  document.getElementById('cal-body').style.display    = 'none';
  closeEventDetail();
  let eventsByDate;
  try {
    eventsByDate = isDemo ? getDemoEvents(year, month) : await fetchEvents(year, month);
    document.querySelector('.cal-sync-badge').innerHTML =
      `<span class="cal-sync-dot"></span>` + (isDemo ? 'デモ表示（Apps Script URL未設定）' : 'Googleカレンダー連携中');
  } catch (err) {
    document.getElementById('cal-loading').style.display = 'none';
    document.getElementById('cal-error').style.display   = 'block';
    document.getElementById('cal-error-msg').textContent = `読み込みに失敗しました。\n${err.message}`;
    calLoading = false; return;
  }
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  ['月','火','水','木','金','土','日'].forEach(d => {
    const c = document.createElement('div');
    c.className = 'cal-cell cal-head-cell'; c.textContent = d; grid.appendChild(c);
  });
  const firstDow = new Date(year, month-1, 1).getDay();
  const offset   = (firstDow===0) ? 6 : firstDow-1;
  const days     = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().slice(0,10);
  for (let i=0; i<offset; i++) {
    const c = document.createElement('div'); c.className='cal-cell cal-empty'; grid.appendChild(c);
  }
  for (let d=1; d<=days; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const events  = eventsByDate[dateStr]||[];
    const isBusy  = events.length>0;
    const isToday = dateStr===todayStr;
    const cell = document.createElement('div');
    let cls = 'cal-cell';
    if (isToday) cls += isBusy?' cal-today cal-busy':' cal-today cal-avail';
    else         cls += isBusy?' cal-busy':' cal-avail';
    if (dateStr===selectedDate) cls+=' cal-selected';
    cell.className = cls;
    const dayNum = document.createElement('span');
    dayNum.className = 'cal-day-num';
    dayNum.textContent = d;
    cell.appendChild(dayNum);
    if (events.length>0) {
      const b=document.createElement('div');
      b.className='cal-event-badge';
      cell.appendChild(b);
      const time=document.createElement('span');
      time.className='cal-time-label';
      time.textContent = events.length > 1
        ? `${formatCalendarTimeLabel(events[0])} 他${events.length - 1}`
        : formatCalendarTimeLabel(events[0]);
      cell.appendChild(time);
    }
    if (!isBusy) {
      cell.addEventListener('click', () => {
        selectedDate = dateStr;
        document.querySelectorAll('.cal-cell').forEach(c=>c.classList.remove('cal-selected'));
        cell.classList.add('cal-selected');
        fillContactPeriodFromDate(dateStr);
        document.getElementById('cal-event-detail').style.display='none';
        document.querySelector('.contact-right').scrollIntoView({behavior:'smooth',block:'center'});
      });
    } else if (GCAL_CONFIG.SHOW_EVENT_TITLES) {
      cell.addEventListener('click', () => {
        selectedDate = dateStr;
        document.querySelectorAll('.cal-cell').forEach(c=>c.classList.remove('cal-selected'));
        cell.classList.add('cal-selected');
        showEventDetail(dateStr, events);
      });
    }
    grid.appendChild(cell);
  }
  document.getElementById('cal-loading').style.display = 'none';
  document.getElementById('cal-body').style.display    = 'block';
  calLoading = false;
}

function showEventDetail(dateStr, events) {
  const panel = document.getElementById('cal-event-detail');
  const d = new Date(dateStr+'T00:00:00');
  document.getElementById('cal-event-date').textContent =
    `${d.getMonth()+1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`;
  document.getElementById('cal-event-list').innerHTML = events.map(ev => {
    const t = formatCalendarTimeLabel(ev).replace('-', ' – ');
    return `<div class="cal-event-item"><div class="cal-event-dot" style="background:#a0aab4;"></div><div><div class="cal-event-name">${ev.title}</div><div class="cal-event-time">${t}</div></div></div>`;
  }).join('');
  panel.style.display = 'block';
}
function closeEventDetail() { document.getElementById('cal-event-detail').style.display='none'; selectedDate=null; }
function changeMonth(delta) {
  calMonth+=delta;
  if(calMonth>12){calMonth=1;calYear++;} if(calMonth<1){calMonth=12;calYear--;}
  renderCalendar(calYear,calMonth);
}
function goToToday() { calYear=new Date().getFullYear(); calMonth=new Date().getMonth()+1; renderCalendar(calYear,calMonth); }
function initCalendar() { renderCalendar(calYear,calMonth); }
document.addEventListener('DOMContentLoaded', initCalendar);
