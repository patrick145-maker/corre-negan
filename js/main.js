/* CORRE, NEGAN — interacciones de la landing page */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- Datos reales del juego (GameManager / Chaser) ---------- */
  var GAME = {
    pointsPerLevel: 100,
    startSpeed: 9,
    maxSpeed: 22,
    speedPerLevel: 1.4,
    freddyStart: 1.8,   // distancia de Freddy en el nivel 1
    freddyClosest: 0.9, // lo más cerca que llega sin tropezar
    freddyStep: 0.15    // cuánto se acerca por nivel
  };
  function speedAt(level) { return Math.min(GAME.maxSpeed, GAME.startSpeed + GAME.speedPerLevel * (level - 1)); }
  function distAt(level) { return Math.max(GAME.freddyClosest, GAME.freddyStart - GAME.freddyStep * (level - 1)); }

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Barra de progreso + enlace activo ---------- */
  var bar = document.getElementById('progress');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]:not(.btn)'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    var y = h.scrollTop + 120, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Aparición al hacer scroll ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Gráfico: dificultad por nivel (SVG) ---------- */
  var chart = document.getElementById('chart');
  if (chart) {
    var W = 640, H = 300, L = 44, R = 46, T = 16, B = 34;
    var N = 12, maxS = 24, maxD = 2;
    function x(l) { return L + (l - 1) / (N - 1) * (W - L - R); }
    function ys(v) { return T + (1 - v / maxS) * (H - T - B); }
    function yd(v) { return T + (1 - v / maxD) * (H - T - B); }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" font-family="IBM Plex Mono, monospace" font-size="11">';
    for (var g = 0; g <= 4; g++) {
      var gy = T + g / 4 * (H - T - B);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + gy + '" y2="' + gy + '" stroke="#2f2a25"/>';
      s += '<text x="' + (L - 8) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#f2b705">' + Math.round(maxS * (1 - g / 4)) + '</text>';
      s += '<text x="' + (W - R + 8) + '" y="' + (gy + 4) + '" fill="#ff5a4d">' + (maxD * (1 - g / 4)).toFixed(1) + '</text>';
    }
    var pS = [], pD = [];
    for (var l = 1; l <= N; l++) {
      pS.push(x(l).toFixed(1) + ',' + ys(speedAt(l)).toFixed(1));
      pD.push(x(l).toFixed(1) + ',' + yd(distAt(l)).toFixed(1));
      s += '<text x="' + x(l) + '" y="' + (H - 10) + '" text-anchor="middle" fill="#a79f90">' + l + '</text>';
    }
    s += '<text x="' + (W / 2) + '" y="' + (H + 2) + '" text-anchor="middle" fill="#6d665a" font-size="10" letter-spacing="2">NIVEL</text>';
    s += '<polyline class="line" points="' + pS.join(' ') + '" fill="none" stroke="#f2b705" stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<polyline class="line" points="' + pD.join(' ') + '" fill="none" stroke="#d92b1f" stroke-width="3.5" stroke-linejoin="round"/>';
    for (var k = 1; k <= N; k++) {
      s += '<rect x="' + (x(k) - 3.5) + '" y="' + (ys(speedAt(k)) - 3.5) + '" width="7" height="7" fill="#f2b705"/>';
      s += '<rect x="' + (x(k) - 3.5) + '" y="' + (yd(distAt(k)) - 3.5) + '" width="7" height="7" fill="#d92b1f"/>';
    }
    s += '</svg>';
    chart.innerHTML = s;
    var lines = chart.querySelectorAll('.line');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Array.prototype.forEach.call(lines, function (ln) {
        var len = ln.getTotalLength ? ln.getTotalLength() : 900;
        ln.style.strokeDasharray = len;
        ln.style.strokeDashoffset = len;
        ln.style.transition = 'stroke-dashoffset 1.6s ease';
      });
      var co = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          Array.prototype.forEach.call(lines, function (ln) { ln.style.strokeDashoffset = 0; });
          co.disconnect();
        }
      }, { threshold: 0.3 });
      co.observe(chart);
    }
  }

  /* ---------- Simulador de nivel ---------- */
  var range = document.getElementById('lvl');
  if (range) {
    var oL = document.getElementById('o-lvl'), oP = document.getElementById('o-pts'),
        oS = document.getElementById('o-speed'), oD = document.getElementById('o-dist'),
        fr = document.getElementById('s-freddy'), track = document.getElementById('track');
    function sim() {
      var lv = parseInt(range.value, 10);
      var sp = speedAt(lv), d = distAt(lv);
      oL.textContent = lv;
      oP.textContent = (lv - 1) * GAME.pointsPerLevel;
      oS.textContent = sp.toFixed(1);
      oD.textContent = d.toFixed(2);
      // Negan fijo al 62%; Freddy se coloca según la distancia (1 unidad ≈ 14% del ancho)
      var negan = track.clientWidth * 0.62;
      fr.style.left = Math.max(4, negan - 54 - d * (track.clientWidth * 0.14)) + 'px';
      track.style.setProperty('--spd', (1.6 - (sp - GAME.startSpeed) / (GAME.maxSpeed - GAME.startSpeed) * 1.25).toFixed(2) + 's');
    }
    range.addEventListener('input', sim);
    window.addEventListener('resize', sim);
    sim();
  }

  /* ---------- Reproductor del juego (Unity WebGL) ---------- */
  var player = document.getElementById('player');
  var frame = document.getElementById('game');
  var startBtn = document.getElementById('start');
  var fsBtn = document.getElementById('fs');
  var live = false;

  function startGame() {
    if (live || !frame) return;
    live = true;
    frame.src = frame.getAttribute('data-src');
    player.classList.add('is-live');
    setTimeout(function () { try { frame.focus(); } catch (e) {} }, 400);
  }
  if (startBtn) startBtn.addEventListener('click', startGame);

  // Los botones «Jugar ahora» llevan a la sección y arrancan la partida
  Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (a) {
    a.addEventListener('click', function () { setTimeout(startGame, 650); });
  });

  if (fsBtn) fsBtn.addEventListener('click', function () {
    startGame();
    var el = player;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) req.call(el);
  });

  // Evita que Espacio y las flechas muevan la página mientras se juega
  window.addEventListener('keydown', function (e) {
    if (!live || !player) return;
    var keys = [' ', 'Spacebar', 'ArrowUp', 'ArrowDown'];
    if (keys.indexOf(e.key) === -1) return;
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' || t === 'BUTTON' || t === 'A' || t === 'TEXTAREA') return;
    var r = player.getBoundingClientRect();
    var visible = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
    if (visible) e.preventDefault();
  });
})();
