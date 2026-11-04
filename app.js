/* Kenya · 2 años — fotos, contador y nuestras canciones */
(() => {
  "use strict";

  // Día en que empezamos (hoy, 3 de noviembre de 2026, cumplimos 2 años).
  const START = new Date(2024, 10, 3, 0, 0, 0);

  // Nuestras canciones (videos de YouTube de los canales oficiales).
  const SONGS = [
    { id: "eCcGKCFxFZQ", title: "Un Regalo de Amor", artist: "Liberación" },
    { id: "M-eaIh0mzaI", title: "Tel Aviv", artist: "Danny Ocean" },
    { id: "8obld3JrBNM", title: "Cosas Que No Te Dije", artist: "Saiko" },
    { id: "h-GSyBwKuGE", title: "La Gloria Eres Tú", artist: "Luis Miguel" },
    { id: "Mcj75l2gJcY", title: "Brillas", artist: "León Larregui" },
    { id: "iItec_J9x7M", title: "Si Pudiera", artist: "Manuel Medrano" },
    { id: "c6du9gSEDu8", title: "Quédate", artist: "Manuel Medrano" },
    { id: "EH1_UqlmAYE", title: "Siento Que Merezco Más", artist: "Latin Mafia" },
    { id: "YNqug5jirKc", title: "Te Regalo", artist: "Rels B, J Abecia" },
    { id: "SmF4wY7U7QE", title: "Amapolas", artist: "Leo Rizzi" },
  ];

  const PHOTOS = Array.isArray(window.FOTOS) ? window.FOTOS : [];
  const $ = (id) => document.getElementById(id);

  /* ---------- Corazones de la portada ---------- */
  const hearts = document.querySelector(".hearts");
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("span");
    s.textContent = "♥";
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 10 + Math.random() * 26 + "px";
    s.style.animationDuration = 7 + Math.random() * 9 + "s";
    s.style.animationDelay = -Math.random() * 14 + "s";
    hearts.appendChild(s);
  }

  /* ---------- Contador ---------- */
  function tick() {
    const now = new Date();
    let years = now.getFullYear() - START.getFullYear();
    let anniv = new Date(START);
    anniv.setFullYear(START.getFullYear() + years);
    if (anniv > now) {
      years -= 1;
      anniv = new Date(START);
      anniv.setFullYear(START.getFullYear() + years);
    }
    let rest = Math.max(0, Math.floor((now - anniv) / 1000));
    const days = Math.floor(rest / 86400); rest -= days * 86400;
    const hours = Math.floor(rest / 3600); rest -= hours * 3600;
    const minutes = Math.floor(rest / 60);
    const seconds = rest - minutes * 60;
    $("cYears").textContent = years;
    $("cDays").textContent = days;
    $("cHours").textContent = hours;
    $("cMinutes").textContent = minutes;
    $("cSeconds").textContent = seconds;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Aparecer al hacer scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Galería: una foto tras otra al bajar ---------- */
  const timeline = $("timeline");
  if (!PHOTOS.length) $("galleryEmpty").hidden = false;
  const showMoment = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); showMoment.unobserve(e.target); }
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  PHOTOS.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "moment";
    li.innerHTML = '<div class="moment__card"><button class="moment__photo" type="button"><img alt="" /></button>' +
                   (p.frase ? '<p class="moment__note"></p>' : '') + '</div>';
    li.querySelector(".moment__card").style.setProperty("--tilt", (((i * 37) % 5) - 2) * 0.8 + "deg");
    const img = li.querySelector("img");
    img.src = p.mini;
    img.width = p.w;
    img.height = p.h;
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = "Kenya y Santi, foto " + (i + 1);
    if (p.frase) {
      li.classList.add("moment--song");
      li.querySelector(".moment__note").textContent = "«" + p.frase + "»";
    }
    li.querySelector(".moment__photo").setAttribute("aria-label", "Ver en grande la foto " + (i + 1));
    li.querySelector(".moment__photo").addEventListener("click", () => openLightbox(i));
    timeline.appendChild(li);
    showMoment.observe(li);
  });

  /* ---------- Los dos bajando por el hilo ---------- */
  const climbers = $("climbers"), wrap = $("timelineWrap");
  let climbY = 0, lastScroll = window.scrollY, stopTimer = null, ticking = false;
  function placeClimbers() {
    ticking = false;
    const r = wrap.getBoundingClientRect();
    const span = Math.max(0, wrap.offsetHeight - climbers.offsetHeight - 40);
    // bajan al ritmo de la página: su sitio es un poco arriba del centro de la pantalla
    const target = Math.min(span, Math.max(0, window.innerHeight * 0.42 - r.top));
    climbY += (target - climbY) * 0.35;
    if (Math.abs(target - climbY) < 0.5) climbY = target;
    climbers.style.transform = "translateY(" + climbY.toFixed(1) + "px)";
    if (climbY !== target) requestAnimationFrame(placeClimbers);
  }
  function onScroll() {
    if (Math.abs(window.scrollY - lastScroll) > 2) {
      climbers.classList.add("is-moving");
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => climbers.classList.remove("is-moving"), 220);
    }
    lastScroll = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(placeClimbers); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  placeClimbers();

  /* ---------- Visor ---------- */
  const lb = $("lightbox"), lbImg = $("lbImg"), lbCount = $("lbCount");
  let current = 0, slideTimer = null;

  function show(i) {
    current = (i + PHOTOS.length) % PHOTOS.length;
    lbImg.style.animation = "none";
    void lbImg.offsetWidth;  // reinicia la animación de entrada
    lbImg.style.animation = "";
    lbImg.src = PHOTOS[current].src;
    lbImg.alt = "Kenya y Santi, foto " + (current + 1);
    $("lbNote").textContent = PHOTOS[current].frase ? "«" + PHOTOS[current].frase + "»" : "";
    lbCount.textContent = (current + 1) + " / " + PHOTOS.length +
                          (slideTimer ? "  ·  toca la foto para pausar" : "");
    new Image().src = PHOTOS[(current + 1) % PHOTOS.length].src;  // precarga la siguiente
  }
  function openLightbox(i) {
    if (!PHOTOS.length) return;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(i);
  }
  function closeLightbox() {
    stopSlides();
    lb.hidden = true;
    document.body.style.overflow = "";
  }
  function startSlides() {
    openLightbox(0);
    slideTimer = setInterval(() => show(current + 1), 4000);
    show(0);
  }
  function stopSlides() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }

  $("lbClose").addEventListener("click", closeLightbox);
  $("lbPrev").addEventListener("click", (e) => { e.stopPropagation(); stopSlides(); show(current - 1); });
  $("lbNext").addEventListener("click", (e) => { e.stopPropagation(); stopSlides(); show(current + 1); });
  lbImg.addEventListener("click", (e) => { e.stopPropagation(); if (slideTimer) { stopSlides(); show(current); } });
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  $("slideshowBtn").addEventListener("click", startSlides);
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") { stopSlides(); show(current + 1); }
    if (e.key === "ArrowLeft") { stopSlides(); show(current - 1); }
  });
  // Deslizar con el dedo en el teléfono
  let tx = null, ty = null;
  lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { stopSlides(); show(current + (dx < 0 ? 1 : -1)); }
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
  });

  /* ---------- Música ---------- */
  const playerBar = $("player"), playBtn = $("playBtn");
  const songsList = $("songs");
  let yt = null, ytReady = false, wantPlay = false, songIndex = 0, playing = false;

  SONGS.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "song";
    b.innerHTML = '<span class="song__n">' + (i + 1) + '</span><span><span class="song__t"></span><span class="song__a"></span></span>';
    b.querySelector(".song__t").textContent = s.title;
    b.querySelector(".song__a").textContent = s.artist;
    b.addEventListener("click", () => playSong(i));
    li.appendChild(b);
    songsList.appendChild(li);
  });

  function markSong() {
    const s = SONGS[songIndex];
    $("songTitle").textContent = s.title;
    $("songArtist").textContent = s.artist;
    songsList.querySelectorAll(".song").forEach((b, i) => b.classList.toggle("is-current", i === songIndex));
  }
  function setPlaying(on) {
    playing = on;
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", on ? "Pausar" : "Reproducir");
    playerBar.classList.toggle("is-paused", !on);
  }
  function playSong(i) {
    songIndex = (i + SONGS.length) % SONGS.length;
    markSong();
    playerBar.hidden = false;
    if (ytReady) { yt.loadVideoById(SONGS[songIndex].id); setPlaying(true); }
    else wantPlay = true;
  }

  // La API de YouTube llama a esta función cuando está lista.
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player("yt", {
      width: 2, height: 2,
      videoId: SONGS[0].id,
      playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
      events: {
        onReady: () => {
          ytReady = true;
          yt.setVolume(85);
          if (wantPlay) { wantPlay = false; yt.loadVideoById(SONGS[songIndex].id); setPlaying(true); }
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.ENDED) playSong(songIndex + 1);
          else if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
          else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
        },
        onError: () => playSong(songIndex + 1),  // si un video falla, la siguiente
      },
    });
  };
  const api = document.createElement("script");
  api.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(api);

  playBtn.addEventListener("click", () => {
    if (!ytReady) { wantPlay = true; return; }
    if (playing) { yt.pauseVideo(); setPlaying(false); }
    else { yt.playVideo(); setPlaying(true); }
  });
  $("nextBtn").addEventListener("click", () => playSong(songIndex + 1));
  $("prevBtn").addEventListener("click", () => playSong(songIndex - 1));

  /* ---------- Abrir el regalo ---------- */
  $("openGift").addEventListener("click", () => {
    $("cover").classList.add("is-open");
    document.body.classList.remove("locked");
    // El toque de este botón es el que permite que el navegador deje sonar la música.
    playerBar.hidden = false;
    markSong();
    if (ytReady) { yt.playVideo(); setPlaying(true); }
    else wantPlay = true;
    setTimeout(() => $("cover").remove(), 1300);
  });
  markSong();
  // Vista previa sin portada (pruebas): index.html#abierto
  if (location.hash.startsWith("#abierto")) {
    $("cover").remove();
    document.body.classList.remove("locked");
    document.querySelectorAll(".reveal, .moment").forEach((el) => el.classList.add("is-visible"));
    const y = parseInt(location.hash.split("-")[1] || "0", 10);  // #abierto-3000: baja hasta ahí
    if (y) setTimeout(() => window.scrollTo(0, y), 300);
  }
})();
