/* ==========================================================================
   LEGADO MATEMÁTICO - INTERACTIVIDAD, ANIMACIÓN Y MOTOR MATEMÁTICO
   Universidad Nacional Abierta y a Distancia (UNAD)
   Curso: Historia de las Matemáticas (551104)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initKaTeX();
  initArchimedesLab();
  initLeverLab();
  initLabTabs();
  initGuionToggle();
  initScrollTop();
});

/* ==========================================================================
   0. RENDERIZADO MATEMÁTICO ROBUSTO (KaTeX)
   ========================================================================== */
function initKaTeX() {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }
}

/* ==========================================================================
   1. NAVEGACIÓN Y MENÚ MÓVIL
   ========================================================================== */
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const links = document.querySelectorAll(".nav-links a");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    links.forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }

  // Actualizar enlace activo en scroll
  window.addEventListener("scroll", () => {
    let current = "";
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    links.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

/* ==========================================================================
   2. PESTAÑAS DEL LABORATORIO INTERACTIVO
   ========================================================================== */
function initLabTabs() {
  const tabBtns = document.querySelectorAll(".lab-tab-btn");
  const tabViews = document.querySelectorAll(".lab-view");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      tabBtns.forEach(b => b.classList.remove("active"));
      tabViews.forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      const activeView = document.getElementById(target);
      if (activeView) activeView.classList.add("active");
    });
  });
}

/* ==========================================================================
   3. SIMULACIÓN Y ANIMACIÓN EN VIVO: MÉTODO DE EXHAUCIÓN DE ARQUÍMEDES (PI)
   ========================================================================== */
let currentSides = 96;
let rotationAngle = 0;
let isAutoPlaying = false;
let autoPlayInterval = null;
let zoomActive = false;
const allowedSteps = [6, 12, 24, 48, 96, 192];
let stepIndex = 4; // Comienza en 96 (índice 4)

function initArchimedesLab() {
  const nButtons = document.querySelectorAll(".btn-n");
  const nSlider = document.getElementById("nSlider");
  const playBtn = document.getElementById("btnPlayExhaucion");
  const zoomBtn = document.getElementById("btnZoomToggle");

  nButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (isAutoPlaying) toggleAutoPlay();
      currentSides = parseInt(btn.getAttribute("data-n"), 10);
      stepIndex = allowedSteps.indexOf(currentSides);
      updateControlsUI();
    });
  });

  if (nSlider) {
    nSlider.addEventListener("input", (e) => {
      if (isAutoPlaying) toggleAutoPlay();
      currentSides = parseInt(e.target.value, 10);
      updateControlsUI();
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", toggleAutoPlay);
  }

  if (zoomBtn) {
    zoomBtn.addEventListener("click", () => {
      zoomActive = !zoomActive;
      zoomBtn.classList.toggle("btn-primary", zoomActive);
      zoomBtn.classList.toggle("btn-secondary", !zoomActive);
      zoomBtn.innerHTML = zoomActive ? "🔍 Lupa Microscópica: ACTIVA" : "🔍 Activar Lupa / Zoom";
    });
  }

  updateControlsUI();
  requestAnimationFrame(archimedesAnimationLoop);
}

function toggleAutoPlay() {
  const playBtn = document.getElementById("btnPlayExhaucion");
  isAutoPlaying = !isAutoPlaying;

  if (isAutoPlaying) {
    if (playBtn) playBtn.innerHTML = "⏸ Pausar Animación";
    autoPlayInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % allowedSteps.length;
      currentSides = allowedSteps[stepIndex];
      updateControlsUI();
    }, 1800);
  } else {
    if (playBtn) playBtn.innerHTML = "▶ Iniciar Animación Automática (Paso a Paso)";
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function updateControlsUI() {
  const nButtons = document.querySelectorAll(".btn-n");
  const nSlider = document.getElementById("nSlider");

  nButtons.forEach(b => {
    b.classList.toggle("active", parseInt(b.getAttribute("data-n"), 10) === currentSides);
  });
  if (nSlider) nSlider.value = currentSides;

  updateArchimedesMetrics();
}

function updateArchimedesMetrics() {
  const n = currentSides;
  const lowerBound = n * Math.sin(Math.PI / n);
  const upperBound = n * Math.tan(Math.PI / n);
  const realPi = Math.PI;
  const avgEstimate = (lowerBound + upperBound) / 2;
  const errorPct = Math.abs((avgEstimate - realPi) / realPi) * 100;

  const valN = document.getElementById("metricN");
  const valLower = document.getElementById("metricLower");
  const valUpper = document.getElementById("metricUpper");
  const valError = document.getElementById("metricError");
  const valArchimedesInterval = document.getElementById("archimedesInterval");

  if (valN) valN.textContent = `${n} lados`;
  if (valLower) valLower.textContent = lowerBound.toFixed(6);
  if (valUpper) valUpper.textContent = upperBound.toFixed(6);
  if (valError) valError.textContent = `${errorPct.toFixed(5)} %`;

  if (valArchimedesInterval) {
    if (n === 96) {
      valArchimedesInterval.innerHTML = `
        <strong>Cotas del tratado de Arquímedes (n = 96):</strong><br>
        <span style="color:#0284C7">3 + 10/71 (≈ 3.140845)</span> 
        &lt; <strong>π</strong> &lt; 
        <span style="color:#B45309">3 + 1/7 (≈ 3.142857)</span>
      `;
    } else {
      valArchimedesInterval.innerHTML = `
        <strong>Acotación actual para n = ${n}:</strong><br>
        <span style="color:#0284C7">${lowerBound.toFixed(6)}</span> 
        &lt; <strong>π</strong> &lt; 
        <span style="color:#B45309">${upperBound.toFixed(6)}</span>
      `;
    }
  }
}

// Bucle de animación continua con requestAnimationFrame
function archimedesAnimationLoop() {
  rotationAngle += 0.003; // Rotación orbital suave en vivo
  renderArchimedesCanvas();
  requestAnimationFrame(archimedesAnimationLoop);
}

function renderArchimedesCanvas() {
  const canvas = document.getElementById("circleCanvas");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const cssSize = 380;
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  canvas.style.width = cssSize + "px";
  canvas.style.height = cssSize + "px";

  const ctx = canvas.getContext("2d");
  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const R = cssSize * 0.38;
  const n = currentSides;

  ctx.clearRect(0, 0, cssSize, cssSize);

  // 1. Fondo técnico con cuadrícula animada
  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, cssSize, cssSize);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < cssSize; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, cssSize); ctx.stroke();
  }
  for (let y = 0; y < cssSize; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(cssSize, y); ctx.stroke();
  }

  // Ejes ortogonales
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(cx, 15); ctx.lineTo(cx, cssSize - 15);
  ctx.moveTo(15, cy); ctx.lineTo(cssSize - 15, cy);
  ctx.stroke();

  // 2. Polígono Circunscrito (Dorado exterior) con rotación continua
  const angleStep = (2 * Math.PI) / n;
  const halfAngle = angleStep / 2;
  const R_circ = R / Math.cos(halfAngle);

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep + rotationAngle;
    const x = cx + R_circ * Math.cos(angle);
    const y = cy + R_circ * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(201, 162, 39, 0.12)";
  ctx.fill();
  ctx.strokeStyle = "#E5C048";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Circunferencia Teórica (Blanco / Celeste)
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Polígono Inscrito (Azul Cian interior)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - halfAngle + rotationAngle;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.18)";
  ctx.fill();
  ctx.strokeStyle = "#38BDF8";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Centro
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // 5. Inset Lupa Microscópica de Aumento (Efecto de Exhaución)
  if (zoomActive) {
    const zoomSize = 110;
    const zx = cssSize - zoomSize - 12;
    const zy = 12;

    // Caja de aumento
    ctx.save();
    ctx.beginPath();
    ctx.rect(zx, zy, zoomSize, zoomSize);
    ctx.clip();

    ctx.fillStyle = "#030712";
    ctx.fillRect(zx, zy, zoomSize, zoomSize);

    // Dibujar ampliación 5x en la zona superior de contacto
    const zoomScale = 5;
    ctx.translate(zx + zoomSize / 2, zy + zoomSize / 2);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-cx, -(cy - R));

    // Circunferencia ampliada
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1 / zoomScale;
    ctx.stroke();

    // Polígono circunscrito ampliado
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep + rotationAngle;
      const x = cx + R_circ * Math.cos(angle);
      const y = cy + R_circ * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#E5C048";
    ctx.lineWidth = 1 / zoomScale;
    ctx.stroke();

    // Polígono inscrito ampliado
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - halfAngle + rotationAngle;
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 1 / zoomScale;
    ctx.stroke();

    ctx.restore();

    // Marco de la lupa
    ctx.strokeStyle = "rgba(201, 162, 39, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(zx, zy, zoomSize, zoomSize);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillText("LUPA 5X: Brecha (Exhaución)", zx + 6, zy + zoomSize - 6);
  }
}

/* ==========================================================================
   4. SIMULACIÓN Y ANIMACIÓN EN VIVO: LEY DE LA PALANCA CON OSCILACIÓN FÍSICA
   ========================================================================== */
let leverF1 = 50;
let leverD1 = 4;
let leverF2 = 100;
let leverD2 = 2;

// Física oscilatoria para animación de balanza
let leverAngle = 0;
let leverAngularVel = 0;
let leverTargetAngle = 0;

function initLeverLab() {
  const f1Input = document.getElementById("leverF1");
  const d1Input = document.getElementById("leverD1");
  const f2Input = document.getElementById("leverF2");

  if (f1Input) {
    f1Input.addEventListener("input", (e) => {
      leverF1 = parseFloat(e.target.value);
      applyLeverImpulse(0.04);
      updateLeverData();
    });
  }
  if (d1Input) {
    d1Input.addEventListener("input", (e) => {
      leverD1 = parseFloat(e.target.value);
      applyLeverImpulse(0.05);
      updateLeverData();
    });
  }
  if (f2Input) {
    f2Input.addEventListener("input", (e) => {
      leverF2 = parseFloat(e.target.value);
      applyLeverImpulse(-0.04);
      updateLeverData();
    });
  }

  updateLeverData();
  requestAnimationFrame(leverAnimationLoop);
}

function applyLeverImpulse(amount) {
  leverAngularVel += amount;
}

function updateLeverData() {
  leverD2 = (leverF1 * leverD1) / leverF2;

  const f1Val = document.getElementById("valF1");
  const d1Val = document.getElementById("valD1");
  const f2Val = document.getElementById("valF2");
  const d2Val = document.getElementById("valD2");
  const torque1Val = document.getElementById("valTorque1");
  const torque2Val = document.getElementById("valTorque2");

  if (f1Val) f1Val.textContent = `${leverF1} kg`;
  if (d1Val) d1Val.textContent = `${leverD1.toFixed(1)} m`;
  if (f2Val) f2Val.textContent = `${leverF2} kg`;
  if (d2Val) d2Val.textContent = `${leverD2.toFixed(2)} m`;
  if (torque1Val) torque1Val.textContent = `${(leverF1 * leverD1).toFixed(1)} kg·m`;
  if (torque2Val) torque2Val.textContent = `${(leverF2 * leverD2).toFixed(1)} kg·m`;
}

// Bucle de animación física de oscilación amortiguada
function leverAnimationLoop() {
  // Modelo de oscilador armónico amortiguado hacia el ángulo cero (equilibrio)
  const spring = 0.08;
  const damping = 0.88;

  const force = -spring * (leverAngle - leverTargetAngle);
  leverAngularVel = (leverAngularVel + force) * damping;
  leverAngle += leverAngularVel;

  renderLeverCanvas();
  requestAnimationFrame(leverAnimationLoop);
}

function renderLeverCanvas() {
  const canvas = document.getElementById("leverCanvas");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = 380;
  const height = 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");
  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, width, height);

  const fulcrumX = width / 2;
  const fulcrumY = height * 0.65;
  const beamLength = width * 0.85;

  // 1. Suelo
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, fulcrumY + 35);
  ctx.lineTo(width - 15, fulcrumY + 35);
  ctx.stroke();

  // 2. Fulcro de Arquímedes
  ctx.beginPath();
  ctx.moveTo(fulcrumX, fulcrumY);
  ctx.lineTo(fulcrumX - 22, fulcrumY + 35);
  ctx.lineTo(fulcrumX + 22, fulcrumY + 35);
  ctx.closePath();
  ctx.fillStyle = "#C9A227";
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Barra con inclinación animada (leverAngle)
  ctx.save();
  ctx.translate(fulcrumX, fulcrumY);
  ctx.rotate(leverAngle);

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-beamLength / 2, 0);
  ctx.lineTo(beamLength / 2, 0);
  ctx.stroke();

  // Marcadores de posición de masas
  const maxMeters = 5;
  const pxPerMeter = (beamLength / 2) / maxMeters;
  const pos1X = -Math.min(leverD1 * pxPerMeter, (beamLength / 2) - 10);
  const pos2X = Math.min(leverD2 * pxPerMeter, (beamLength / 2) - 10);

  // Carga 1
  const size1 = Math.min(14 + (leverF1 / 5), 36);
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(pos1X - (size1 / 2), -size1 - 3, size1, size1);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.strokeRect(pos1X - (size1 / 2), -size1 - 3, size1, size1);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "11px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${leverF1}kg`, pos1X, -size1 - 7);
  ctx.fillText(`${leverD1.toFixed(1)}m`, pos1X, 16);

  // Carga 2
  const size2 = Math.min(14 + (leverF2 / 5), 44);
  ctx.fillStyle = "#E5C048";
  ctx.fillRect(pos2X - (size2 / 2), -size2 - 3, size2, size2);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.strokeRect(pos2X - (size2 / 2), -size2 - 3, size2, size2);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${leverF2}kg`, pos2X, -size2 - 7);
  ctx.fillText(`${leverD2.toFixed(2)}m`, pos2X, 16);

  ctx.restore();

  // Ecuación superior
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`F₁ · d₁ = F₂ · d₂   →   (${leverF1} × ${leverD1.toFixed(1)}) = (${leverF2} × ${leverD2.toFixed(2)})`, fulcrumX, 28);
}

/* ==========================================================================
   5. DESPLIEGUE DEL GUION TÉCNICO DE LA ENTREVISTA (FASE 2)
   ========================================================================== */
function initGuionToggle() {
  const btn = document.getElementById("btnToggleGuion");
  const accordion = document.getElementById("guionAccordion");

  if (btn && accordion) {
    btn.addEventListener("click", () => {
      const isOpen = accordion.classList.contains("open");
      if (isOpen) {
        accordion.classList.remove("open");
        btn.innerHTML = "Consultar Guion Técnico y Estructura (5:00 min) &darr;";
      } else {
        accordion.classList.add("open");
        btn.innerHTML = "Ocultar Guion Técnico &uarr;";
      }
    });
  }
}

/* ==========================================================================
   6. BOTÓN FLOTANTE SCROLL-TO-TOP
   ========================================================================== */
function initScrollTop() {
  const scrollBtn = document.getElementById("scrollTopBtn");
  if (!scrollBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
