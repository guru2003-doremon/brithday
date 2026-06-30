/* =========================================================
   Birthday site — script.js
   GSAP + canvas-confetti driven
   ========================================================= */
/* ---------- 1. Starfield ---------- */
(function starfield() {
  const c = document.getElementById('stars');
  const ctx = c.getContext('2d');
  let w, h, stars;
  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    const count = Math.floor((w * h) / 6000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.02 + 0.005,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.a += s.s;
      const alpha = 0.4 + Math.abs(Math.sin(s.a)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();
/* ---------- 2. Floating particles ---------- */
(function particles() {
  const wrap = document.getElementById('particles');
  const N = 30;
  for (let i = 0; i < N; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.bottom = -Math.random() * 100 + 'vh';
    p.style.animationDuration = 14 + Math.random() * 18 + 's';
    p.style.animationDelay = -Math.random() * 20 + 's';
    p.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
    wrap.appendChild(p);
  }
})();
/* ---------- 3. Envelope tap system ---------- */
const envelope = document.getElementById('envelope');
const tapCountEl = document.getElementById('tapCount');
const envGlow = envelope.querySelector('.env-glow');
let taps = 0;
let opened = false;
envelope.addEventListener('click', handleTap);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
});
function handleTap() {
  if (opened) return;
  taps++;
  if (taps > 5) taps = 5;
  // animated counter
  gsap.fromTo(tapCountEl, { scale: 1.6, color: '#fff' },
    { scale: 1, color: '#fff', duration: .4, ease: 'back.out(2)' });
  tapCountEl.textContent = taps;
  switch (taps) {
    case 1: sparkleBurst(); break;
    case 2: floatingHearts(); break;
    case 3: increaseGlow(); break;
    case 4: shakeEnvelope(); break;
    case 5: openEnvelope(); break;
  }
}
function sparkleBurst() {
  const rect = envelope.getBoundingClientRect();
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    scalar: .7,
    ticks: 80,
    colors: ['#ffd6e8', '#ffffff', '#ffb4d1', '#fff7a8'],
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  });
}
function floatingHearts() {
  const rect = envelope.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.textContent = ['❤️', '💖', '💕'][i % 3];
    h.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;font-size:${14 + Math.random() * 20}px;pointer-events:none;z-index:50`;
    document.body.appendChild(h);
    gsap.to(h, {
      x: (Math.random() - .5) * 260,
      y: -120 - Math.random() * 180,
      opacity: 0, duration: 1.6 + Math.random(),
      ease: 'power2.out',
      onComplete: () => h.remove(),
    });
  }
}
function increaseGlow() {
  gsap.to(envGlow, { opacity: 1, scale: 1.4, duration: .8, ease: 'power2.out' });
  gsap.to(envelope, { filter: 'drop-shadow(0 0 30px rgba(255,150,200,.8))', duration: .6 });
}
function shakeEnvelope() {
  gsap.fromTo(envelope,
    { x: 0 },
    { x: 0, duration: .6, ease: 'elastic.out(1,.25)',
      keyframes: [
        { x: -14 }, { x: 14 }, { x: -10 }, { x: 10 }, { x: -6 }, { x: 6 }, { x: 0 },
      ],
    });
}
/* ---------- 4. Envelope opening (tap 5) ---------- */
function openEnvelope() {
  opened = true;
  const tl = gsap.timeline();
  tl.to(envelope, { scale: 1.15, duration: .6, ease: 'power2.out' })
    .to('.landing-title, .landing-sub, .landing-hint',
        { opacity: 0, y: -20, duration: .5 }, '<')
    .to('.bg-layer', { filter: 'brightness(.55)', duration: .6 }, '<')
    .add(() => envelope.classList.add('open'))
    .to({}, { duration: .9 }) // wait flap
    .add(() => burstFromEnvelope())
    .add(() => bigConfetti(), '+=.1')
    .add(() => startHeartRain(), '+=.1')
    .to('#landing', { opacity: 0, duration: 1, ease: 'power2.inOut' }, '+=1.2')
    .add(() => {
      document.getElementById('landing').classList.add('hidden');
      showCollage();
    });
}
function burstFromEnvelope() {
  const rect = envelope.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 40; i++) {
    const h = document.createElement('div');
    h.textContent = ['❤️', '💖', '💘', '💕'][i % 4];
    h.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${18 + Math.random() * 22}px;pointer-events:none;z-index:60`;
    document.body.appendChild(h);
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 320;
    gsap.to(h, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 80,
      rotation: (Math.random() - .5) * 360,
      opacity: 0, duration: 1.8 + Math.random(),
      ease: 'power2.out',
      onComplete: () => h.remove(),
    });
  }
}
function bigConfetti() {
  const end = Date.now() + 1500;
  (function frame() {
    confetti({ particleCount: 7, angle: 60, spread: 70, origin: { x: 0 }, colors: ['#ff4d8d','#ffd6e8','#fff','#a78bfa'] });
    confetti({ particleCount: 7, angle: 120, spread: 70, origin: { x: 1 }, colors: ['#ff4d8d','#ffd6e8','#fff','#a78bfa'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
/* ---------- 5. Heart rain (continuous) ---------- */
let heartRainStarted = false;
function startHeartRain() {
  if (heartRainStarted) return;
  heartRainStarted = true;
  const wrap = document.getElementById('heartRain');
  const HEARTS = ['❤️','💖','💕','💗','💞'];
  // initial burst of 100+
  for (let i = 0; i < 110; i++) spawnHeart(wrap, HEARTS, Math.random() * 6);
  setInterval(() => spawnHeart(wrap, HEARTS, 0), 220);
}
function spawnHeart(wrap, HEARTS, delay) {
  const h = document.createElement('div');
  h.className = 'heart';
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (12 + Math.random() * 26) + 'px';
  const dur = 5 + Math.random() * 8;
  h.style.animationDuration = dur + 's';
  h.style.animationDelay = (-delay) + 's';
  h.style.opacity = (.4 + Math.random() * .6).toFixed(2);
  wrap.appendChild(h);
  setTimeout(() => h.remove(), (dur - delay) * 1000 + 500);
}
/* ---------- 6. Photo collage ---------- */
function showCollage() {
  const collage = document.getElementById('collage');
  collage.classList.remove('hidden');
  const grid = document.getElementById('polaroidGrid');
  grid.innerHTML = '';
  const captions = ['you','are','my','bachaaa','you','are','my','sunshine'];
  for (let i = 1; i <= 8; i++) {
    const card = document.createElement('div');
    card.className = 'polaroid';
    const rot = (Math.random() * 10 - 5).toFixed(1);
    card.style.transform = `rotate(${rot}deg)`;
    card.innerHTML = `
      <img src="images/photo${i}.jpg" alt="memory ${i}" loading="lazy"
           onerror="this.style.background='linear-gradient(135deg,#fcd5e0,#d8b4fe)';this.removeAttribute('src');" />
      <div class="caption">${captions[i-1]}</div>`;
    grid.appendChild(card);
  }
  // smooth scroll to it
  collage.scrollIntoView({ behavior: 'smooth' });
  // staggered entrance
  gsap.fromTo('.polaroid',
    { opacity: 0, y: 60, scale: .8 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: .9, ease: 'back.out(1.4)',
      stagger: .2,
      onComplete: showLetterSoon,
    });
}
function showLetterSoon() {
  setTimeout(() => {
    const letter = document.getElementById('letter');
    letter.classList.remove('hidden');
    letter.scrollIntoView({ behavior: 'smooth' });
    gsap.fromTo('.glass-card',
      { opacity: 0, y: 60, scale: .9, rotateX: 12 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.2, ease: 'power3.out',
        onComplete: typeLetter });
  }, 1800);
}
/* ---------- 7. Typewriter ---------- */
const letterText =
`Happy Birthday ❤️
betuuuuuuuuuuuuuuuuuuuuuuuuuu
sonaaaaaaaaaaaaaaaaaaaaaaaaaa
jaanuuuuuuuuuuuuuuuuuuuuuuuuu
wiefyyyyyyyyyyyyyyyyyyyyyyyyy

Aaj ka din sirf tumhare naam hai.

Pata nahi main words me kitna achha hu,
lekin itna zaroor kehna chahta hu ki
tum bahut special ho.

Tumhari smile kisi bhi din ko better bana sakti hai.
Main dua karta hu ki tumhari life me
hamesha happiness, success aur peace rahe.

Jo bhi sapne tum dekh rahi ho,
wo sab poore ho.

Stay happy.
Stay blessed.
And keep smiling forever. ✨

Happy Birthday 🎂❤️ 
a ver big 
umhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa umhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa umhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa umhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;;
function typeLetter() {
  const tw = document.getElementById('typewriter');
  const cursor = document.getElementById('cursor');
  let i = 0;
  tw.textContent = '';
  const id = setInterval(() => {
    tw.textContent += letterText[i++];
    if (i >= letterText.length) {
      clearInterval(id);
      const btn = document.getElementById('surpriseBtn');
      btn.classList.remove('hidden');
      gsap.fromTo(btn, { opacity: 0, y: 30, scale: .8 },
        { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.6)' });
    }
  }, 40);
}
/* ---------- 8. Final surprise ---------- */
document.getElementById('surpriseBtn').addEventListener('click', () => {
  const final = document.getElementById('final');
  final.classList.remove('hidden');
  final.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    runFireworks(10000);
    massiveHeartExplosion();
    confettiShower();
    gsap.to('#cake', { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)' });
    gsap.to('.final', { boxShadow: 'inset 0 0 200px rgba(255,150,200,.4)', duration: 1.5 });
    gsap.to('#finalMessage', { opacity: 1, y: 0, duration: 1.4, delay: .8, ease: 'power3.out' });
  }, 400);
});
function massiveHeartExplosion() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  for (let i = 0; i < 80; i++) {
    const h = document.createElement('div');
    h.textContent = '❤️';
    h.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${18 + Math.random() * 30}px;pointer-events:none;z-index:60`;
    document.body.appendChild(h);
    const angle = Math.random() * Math.PI * 2;
    const dist = 250 + Math.random() * 400;
    gsap.to(h, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0, rotation: (Math.random() - .5) * 720,
      duration: 2 + Math.random() * 1.5,
      ease: 'power2.out',
      onComplete: () => h.remove(),
    });
  }
}
function confettiShower() {
  const dur = 5 * 1000;
  const end = Date.now() + dur;
  (function frame() {
    confetti({ particleCount: 4, angle: 60,  spread: 80, origin: { x: 0, y: .8 } });
    confetti({ particleCount: 4, angle: 120, spread: 80, origin: { x: 1, y: .8 } });
    confetti({ particleCount: 3, spread: 360, startVelocity: 25, origin: { x: .5, y: .3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
/* ---------- 9. Fireworks canvas ---------- */
function runFireworks(duration) {
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = canvas.offsetWidth;
  let h = canvas.height = canvas.offsetHeight;
  window.addEventListener('resize', () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });
  const particles = [];
  const colors = ['#ff4d8d','#ffd6e8','#a78bfa','#fbbf24','#34d399','#60a5fa','#fff'];
  function launch() {
    const x = w * (.2 + Math.random() * .6);
    const y = h * (.2 + Math.random() * .4);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const N = 70 + Math.floor(Math.random() * 50);
    for (let i = 0; i < N; i++) {
      const a = (Math.PI * 2 * i) / N;
      const sp = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 60 + Math.random() * 40,
        age: 0, color,
      });
    }
  }
  const end = Date.now() + duration;
  const interval = setInterval(() => { if (Date.now() < end) launch(); else clearInterval(interval); }, 600);
  launch();
  function step() {
    ctx.fillStyle = 'rgba(5,0,10,.18)';
    ctx.fillRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age++; p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= .99;
      const alpha = Math.max(0, 1 - p.age / p.life);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      if (p.age >= p.life) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    if (Date.now() < end + 2500) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, w, h);
  }
  step();
}
/* ---------- 10. Finger-follow hearts ---------- */
(function cursorHearts() {
  const wrap = document.getElementById('cursorHearts');
  let last = 0;
  function spawn(x, y) {
    const now = performance.now();
    if (now - last < 35) return;
    last = now;
    const h = document.createElement('span');
    h.className = 'ch';
    h.textContent = '❤';
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    h.style.fontSize = (12 + Math.random() * 10) + 'px';
    wrap.appendChild(h);
    gsap.to(h, {
      x: (Math.random() - .5) * 40,
      y: -40 - Math.random() * 30,
      scale: .3, opacity: 0,
      duration: 1, ease: 'power2.out',
      onComplete: () => h.remove(),
    });
  }
  window.addEventListener('mousemove', e => spawn(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (t) spawn(t.clientX, t.clientY);
  }, { passive: true });
})();
/* ---------- 11. Music ---------- */
(function music() {
  const btn = document.getElementById('musicBtn');
  const icon = document.getElementById('musicIcon');
  const audio = document.getElementById('bgMusic');
  audio.volume = .55;
  let playing = false;
  let triedAutoplay = false;
  function play() {
    audio.play().then(() => {
      playing = true; icon.textContent = '🔊'; btn.classList.add('playing');
    }).catch(() => {/* needs user interaction */});
  }
  function pause() {
    audio.pause(); playing = false; icon.textContent = '🔇'; btn.classList.remove('playing');
  }
  btn.addEventListener('click', () => playing ? pause() : play());
  // Autoplay after first interaction
  function firstInteract() {
    if (triedAutoplay) return;
    triedAutoplay = true;
    play();
    window.removeEventListener('click', firstInteract);
    window.removeEventListener('touchstart', firstInteract);
    window.removeEventListener('keydown', firstInteract);
  }
  window.addEventListener('click', firstInteract);
  window.addEventListener('touchstart', firstInteract);
  window.addEventListener('keydown', firstInteract);
})();
/* ---------- 12. Intro reveal ---------- */
window.addEventListener('load', () => {
  gsap.from('.landing-title', { opacity: 0, y: -30, duration: 1.2, ease: 'power3.out' });
  gsap.from('.envelope', { opacity: 0, y: 60, scale: .7, duration: 1.4, delay: .3, ease: 'back.out(1.4)' });
  gsap.from('.landing-sub, .landing-hint', { opacity: 0, y: 30, duration: 1, delay: .8, stagger: .15 });
});
