/* ==========================================================================
   LEGADO MATEMÁTICO - INTERACTIVIDAD, ANIMACIÓN VISUAL Y MOTOR MATEMÁTICO
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
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
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
   3. SIMULACIÓN Y ANIMACIÓN VISUAL: MÉTODO DE EXHAUCIÓN DE ARQUÍMEDES
   ========================================================================== */
let currentSides = 6; // Arranca en 6 para que la forma poligonal sea 100% visible
let isAutoPlaying = true; // Arranca animando automáticamente para que el usuario vea acción inmediata
let autoPlayTimer = null;
let zoomActive = false;
let pulsePhase = 0;
let rotationAngle = 0;
const archimedesSteps = [6, 12, 24, 48, 96, 192];
let stepIndex = 0;

function initArchimedesLab() {
  const canvas = document.getElementById("circleCanvas");
  if (!canvas) return;

  // Ajustar tamaño del canvas UNA SOLA VEZ
  setupCanvasResolution(canvas, 380, 380);

  const nButtons = document.querySelectorAll(".btn-n");
  const nSlider = document.getElementById("nSlider");
  const playBtn = document.getElementById("btnPlayExhaucion");
  const zoomBtn = document.getElementById("btnZoomToggle");

  nButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      pauseAutoPlay();
      currentSides = parseInt(btn.getAttribute("data-n"), 10);
      stepIndex = archimedesSteps.indexOf(currentSides);
      if (stepIndex === -1) stepIndex = 0;
      updateControlsUI();
    });
  });

  if (nSlider) {
    nSlider.addEventListener("input", (e) => {
      pauseAutoPlay();
      currentSides = parseInt(e.target.value, 10);
      updateControlsUI();
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (isAutoPlaying) {
        pauseAutoPlay();
      } else {
        startAutoPlay();
      }
    });
  }

  if (zoomBtn) {
    zoomBtn.addEventListener("click", () => {
      zoomActive = !zoomActive;
      zoomBtn.classList.toggle("btn-primary", zoomActive);
      zoomBtn.classList.toggle("btn-secondary", !zoomActive);
      zoomBtn.innerHTML = zoomActive ? "🔍 Lupa de Exhaución: ACTIVA (5X)" : "🔍 Activar Lupa / Zoom (5X)";
    });
  }

  window.addEventListener("resize", () => {
    setupCanvasResolution(canvas, 380, 380);
  });

  // Iniciar autoplay de ciclo continuo de exhaución
  startAutoPlay();
  updateControlsUI();

  // Bucle de renderizado continuo 60 FPS
  requestAnimationFrame(archimedesAnimationLoop);
}

function setupCanvasResolution(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
}

function startAutoPlay() {
  isAutoPlaying = true;
  const playBtn = document.getElementById("btnPlayExhaucion");
  if (playBtn) {
    playBtn.innerHTML = "⏸ Pausar Animación";
    playBtn.classList.add("btn-playing");
  }

  if (autoPlayTimer) clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    stepIndex = (stepIndex + 1) % archimedesSteps.length;
    currentSides = archimedesSteps[stepIndex];
    updateControlsUI();
  }, 2200); // Cambia cada 2.2 segundos para apreciar la duplicación de lados
}

function pauseAutoPlay() {
  isAutoPlaying = false;
  const playBtn = document.getElementById("btnPlayExhaucion");
  if (playBtn) {
    playBtn.innerHTML = "▶ Reanudar Animación Automática";
    playBtn.classList.remove("btn-playing");
  }
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
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

  if (valN) valN.textContent = `${n} lados (${isAutoPlaying ? "Paso Animado " + (stepIndex + 1) + "/6" : "Manual"})`;
  if (valLower) valLower.textContent = lowerBound.toFixed(6);
  if (valUpper) valUpper.textContent = upperBound.toFixed(6);
  if (valError) valError.textContent = `${errorPct.toFixed(5)} %`;

  if (valArchimedesInterval) {
    if (n === 96) {
      valArchimedesInterval.innerHTML = `
        <span style="display:inline-block; background:rgba(201,162,39,0.2); padding:2px 8px; border-radius:4px; margin-bottom:4px;">
          ★ TRATADO CLÁSICO DE ARQUÍMEDES (n = 96 lados) ★
        </span><br>
        <span style="color:#0284C7; font-size:1.15rem; font-weight:bold;">3 + 10/71 (≈ 3.140845)</span> 
        &nbsp;&lt;&nbsp; <strong style="font-size:1.25rem;">π</strong> &nbsp;&lt;&nbsp; 
        <span style="color:#B45309; font-size:1.15rem; font-weight:bold;">3 + 1/7 (≈ 3.142857)</span>
      `;
    } else {
      valArchimedesInterval.innerHTML = `
        <strong>Acotación de Exhaución (n = ${n} lados):</strong><br>
        <span style="color:#0284C7; font-size:1.05rem;">${lowerBound.toFixed(6)}</span> 
        &nbsp;&lt;&nbsp; <strong>π</strong> &nbsp;&lt;&nbsp; 
        <span style="color:#B45309; font-size:1.05rem;">${upperBound.toFixed(6)}</span>
      `;
    }
  }
}

function archimedesAnimationLoop() {
  pulsePhase += 0.04;
  rotationAngle += 0.005; // Rotación apreciable
  renderArchimedesCanvas();
  requestAnimationFrame(archimedesAnimationLoop);
}

function renderArchimedesCanvas() {
  const canvas = document.getElementById("circleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssSize = 380;

  ctx.save();
  ctx.scale(dpr, dpr);

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const R = cssSize * 0.38;
  const n = currentSides;

  ctx.clearRect(0, 0, cssSize, cssSize);

  // 1. Fondo técnico
  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, cssSize, cssSize);

  // Cuadrícula sutil
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < cssSize; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssSize); ctx.stroke();
  }
  for (let y = 0; y < cssSize; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssSize, y); ctx.stroke();
  }

  // Ejes cartesianos
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(cx, 15); ctx.lineTo(cx, cssSize - 15);
  ctx.moveTo(15, cy); ctx.lineTo(cssSize - 15, cy);
  ctx.stroke();

  const angleStep = (2 * Math.PI) / n;
  const halfAngle = angleStep / 2;
  const R_circ = R / Math.cos(halfAngle);

  // 2. POLÍGONO CIRCUNSCRITO (Dorado Exterior)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep + rotationAngle;
    const x = cx + R_circ * Math.cos(angle);
    const y = cy + R_circ * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(201, 162, 39, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "#E5C048";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. RADIOS VISUALES (Demostración geométrica viva)
  if (n <= 48) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep + rotationAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R_circ * Math.cos(angle), cy + R_circ * Math.sin(angle));
      ctx.stroke();
    }
  }

  // 4. CIRCUNFERENCIA TEÓRICA (Blanco con pulso sutil de luz)
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  const glow = 0.7 + 0.3 * Math.sin(pulsePhase);
  ctx.strokeStyle = `rgba(255, 255, 255, ${glow})`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 5. POLÍGONO INSCRITO (Azul Cian Interior)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - halfAngle + rotationAngle;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "#38BDF8";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Vértices del polígono inscrito resaltados
  if (n <= 48) {
    ctx.fillStyle = "#38BDF8";
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - halfAngle + rotationAngle;
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Centro luminoso
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // Indicador de Lados flotante sobre el Canvas
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(15, 15, 130, 28);
  ctx.strokeStyle = "rgba(201, 162, 39, 0.6)";
  ctx.strokeRect(15, 15, 130, 28);
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillText(`Polígono: ${n} lados`, 24, 34);

  // 6. LUPA MICROSCÓPICA (Efecto de Exhaución ampliada 5X)
  if (zoomActive) {
    const zoomSize = 120;
    const zx = cssSize - zoomSize - 12;
    const zy = 12;

    ctx.save();
    ctx.beginPath();
    ctx.rect(zx, zy, zoomSize, zoomSize);
    ctx.clip();

    ctx.fillStyle = "#020617";
    ctx.fillRect(zx, zy, zoomSize, zoomSize);

    const zoomScale = 6;
    ctx.translate(zx + zoomSize / 2, zy + zoomSize / 2);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-cx, -(cy - R));

    // Circunferencia
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1 / zoomScale;
    ctx.stroke();

    // Circunscrito
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
    ctx.lineWidth = 1.2 / zoomScale;
    ctx.stroke();

    // Inscrito
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
    ctx.lineWidth = 1.2 / zoomScale;
    ctx.stroke();

    ctx.restore();

    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 2;
    ctx.strokeRect(zx, zy, zoomSize, zoomSize);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillText("LUPA 6X (Brecha)", zx + 6, zy + zoomSize - 6);
  }

  ctx.restore();
}

/* ==========================================================================
   4. SIMULACIÓN Y ANIMACIÓN EN VIVO: LEY DE LA PALANCA (F1 * d1 = F2 * d2)
   ========================================================================== */
let leverF1 = 50;
let leverD1 = 4;
let leverF2 = 100;
let leverD2 = 2;
let leverAngle = 0;
let leverAngularVel = 0;
let leverTargetAngle = 0;

function initLeverLab() {
  const canvas = document.getElementById("leverCanvas");
  if (!canvas) return;

  setupCanvasResolution(canvas, 380, 240);

  const f1Input = document.getElementById("leverF1");
  const d1Input = document.getElementById("leverD1");
  const f2Input = document.getElementById("leverF2");

  if (f1Input) {
    f1Input.addEventListener("input", (e) => {
      leverF1 = parseFloat(e.target.value);
      applyLeverImpulse(0.06);
      updateLeverData();
    });
  }
  if (d1Input) {
    d1Input.addEventListener("input", (e) => {
      leverD1 = parseFloat(e.target.value);
      applyLeverImpulse(0.07);
      updateLeverData();
    });
  }
  if (f2Input) {
    f2Input.addEventListener("input", (e) => {
      leverF2 = parseFloat(e.target.value);
      applyLeverImpulse(-0.06);
      updateLeverData();
    });
  }

  window.addEventListener("resize", () => {
    setupCanvasResolution(canvas, 380, 240);
  });

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

function leverAnimationLoop() {
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

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = 380;
  const height = 240;

  ctx.save();
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

  // 3. Barra con inclinación animada
  ctx.save();
  ctx.translate(fulcrumX, fulcrumY);
  ctx.rotate(leverAngle);

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-beamLength / 2, 0);
  ctx.lineTo(beamLength / 2, 0);
  ctx.stroke();

  // Cargas
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

  // Ecuación
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`F₁ · d₁ = F₂ · d₂   →   (${leverF1} × ${leverD1.toFixed(1)}) = (${leverF2} × ${leverD2.toFixed(2)})`, fulcrumX, 28);

  ctx.restore();
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
