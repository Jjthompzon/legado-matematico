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
let currentSides = 6;
let isAutoPlaying = true;
let autoPlayTimer = null;
let zoomActive = false;
let pulsePhase = 0;
let rotationAngle = 0;
const archimedesSteps = [6, 12, 24, 48, 96, 192];
let stepIndex = 0;

function initArchimedesLab() {
  const canvas = document.getElementById("circleCanvas");
  if (!canvas) return;

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

  startAutoPlay();
  updateControlsUI();
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
  }, 2200);
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
  rotationAngle += 0.005;
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

  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, cssSize, cssSize);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < cssSize; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssSize); ctx.stroke();
  }
  for (let y = 0; y < cssSize; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssSize, y); ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(cx, 15); ctx.lineTo(cx, cssSize - 15);
  ctx.moveTo(15, cy); ctx.lineTo(cssSize - 15, cy);
  ctx.stroke();

  const angleStep = (2 * Math.PI) / n;
  const halfAngle = angleStep / 2;
  const R_circ = R / Math.cos(halfAngle);

  // Polígono circunscrito
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

  // Radios visuales
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

  // Circunferencia
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  const glow = 0.7 + 0.3 * Math.sin(pulsePhase);
  ctx.strokeStyle = `rgba(255, 255, 255, ${glow})`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Polígono inscrito
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

  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(15, 15, 130, 28);
  ctx.strokeStyle = "rgba(201, 162, 39, 0.6)";
  ctx.strokeRect(15, 15, 130, 28);
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillText(`Polígono: ${n} lados`, 24, 34);

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

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1 / zoomScale;
    ctx.stroke();

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
   4. SIMULACIÓN Y ANIMACIÓN EN VIVO: BALANZA MECÁNICA DE ALTA PRECISIÓN
   ========================================================================== */
let leverF1 = 50;
let leverD1 = 4.0;
let leverF2 = 100;
let leverD2 = 2.0;
let leverMode = "auto"; // "auto" (didáctico) o "free" (modo desafío libre)

// Física del oscilador armónico
let leverAngle = 0;
let leverAngularVel = 0;
let leverTargetAngle = 0;

function initLeverLab() {
  const canvas = document.getElementById("leverCanvas");
  if (!canvas) return;

  setupCanvasResolution(canvas, 420, 270);

  const f1Input = document.getElementById("leverF1");
  const d1Input = document.getElementById("leverD1");
  const f2Input = document.getElementById("leverF2");
  const d2Input = document.getElementById("leverD2");

  const btnAuto = document.getElementById("btnModeAuto");
  const btnFree = document.getElementById("btnModeFree");

  if (btnAuto && btnFree) {
    btnAuto.addEventListener("click", () => {
      leverMode = "auto";
      btnAuto.classList.add("btn-primary");
      btnAuto.classList.remove("btn-secondary");
      btnFree.classList.add("btn-secondary");
      btnFree.classList.remove("btn-primary");
      if (d2Input) d2Input.disabled = true;
      applyLeverImpulse(0.04);
      updateLeverData();
    });

    btnFree.addEventListener("click", () => {
      leverMode = "free";
      btnFree.classList.add("btn-primary");
      btnFree.classList.remove("btn-secondary");
      btnAuto.classList.add("btn-secondary");
      btnAuto.classList.remove("btn-primary");
      if (d2Input) d2Input.disabled = false;
      applyLeverImpulse(-0.04);
      updateLeverData();
    });
  }

  if (f1Input) {
    f1Input.addEventListener("input", (e) => {
      leverF1 = parseFloat(e.target.value);
      applyLeverImpulse(0.05);
      updateLeverData();
    });
  }
  if (d1Input) {
    d1Input.addEventListener("input", (e) => {
      leverD1 = parseFloat(e.target.value);
      applyLeverImpulse(0.06);
      updateLeverData();
    });
  }
  if (f2Input) {
    f2Input.addEventListener("input", (e) => {
      leverF2 = parseFloat(e.target.value);
      applyLeverImpulse(-0.05);
      updateLeverData();
    });
  }
  if (d2Input) {
    d2Input.addEventListener("input", (e) => {
      if (leverMode === "free") {
        leverD2 = parseFloat(e.target.value);
        applyLeverImpulse(-0.06);
        updateLeverData();
      }
    });
  }

  window.addEventListener("resize", () => {
    setupCanvasResolution(canvas, 420, 270);
  });

  updateLeverData();
  requestAnimationFrame(leverAnimationLoop);
}

function applyLeverImpulse(amount) {
  leverAngularVel += amount;
}

function updateLeverData() {
  const d2Input = document.getElementById("leverD2");

  if (leverMode === "auto") {
    leverD2 = (leverF1 * leverD1) / leverF2;
    // Acotar visualmente a 5m
    if (leverD2 > 5) leverD2 = 5;
    if (d2Input) d2Input.value = leverD2.toFixed(1);
    leverTargetAngle = 0; // En modo auto siempre busca el equilibrio
  } else {
    // Modo libre: la balanza se inclina según el desbalance de momentos
    const torque1 = leverF1 * leverD1;
    const torque2 = leverF2 * leverD2;
    const deltaTorque = torque1 - torque2;
    
    // Inclinación máxima de ±14 grados (±0.24 rad)
    leverTargetAngle = -Math.max(-0.24, Math.min(0.24, deltaTorque / 280));
  }

  const torque1 = leverF1 * leverD1;
  const torque2 = leverF2 * leverD2;
  const deltaTorque = Math.abs(torque1 - torque2);
  const mechanicalAdv = (leverD1 / leverD2);

  // Actualizar DOM
  const f1Val = document.getElementById("valF1");
  const d1Val = document.getElementById("valD1");
  const f2Val = document.getElementById("valF2");
  const d2Val = document.getElementById("valD2");
  const torque1Val = document.getElementById("valTorque1");
  const torque2Val = document.getElementById("valTorque2");
  const mechAdvVal = document.getElementById("valMechanicalAdv");
  const netTorqueVal = document.getElementById("valNetTorque");
  const statusBadge = document.getElementById("leverStatusBadge");

  if (f1Val) f1Val.textContent = `${leverF1} kg`;
  if (d1Val) d1Val.textContent = `${leverD1.toFixed(1)} m`;
  if (f2Val) f2Val.textContent = `${leverF2} kg`;
  if (d2Val) d2Val.textContent = `${leverD2.toFixed(2)} m`;
  if (torque1Val) torque1Val.textContent = `${torque1.toFixed(1)} kg·m`;
  if (torque2Val) torque2Val.textContent = `${torque2.toFixed(1)} kg·m`;
  
  if (mechAdvVal) {
    mechAdvVal.textContent = `${mechanicalAdv.toFixed(2)}× (Ventaja mecánica: ${mechanicalAdv >= 1 ? 'Multiplica la fuerza' : 'Requiere más esfuerzo'})`;
  }

  if (netTorqueVal) {
    if (deltaTorque <= 2) {
      netTorqueVal.textContent = "0.0 kg·m (Equilibrio)";
      netTorqueVal.style.color = "#16A34A";
    } else {
      netTorqueVal.textContent = `${(torque1 - torque2).toFixed(1)} kg·m`;
      netTorqueVal.style.color = "#DC2626";
    }
  }

  if (statusBadge) {
    if (deltaTorque <= 2) {
      statusBadge.textContent = "● EQUILIBRIO PERFECTO";
      statusBadge.className = "badge-balanced";
    } else if (torque1 > torque2) {
      statusBadge.textContent = "◀ INCLINADA A LA IZQUIERDA (M₁ > M₂)";
      statusBadge.className = "badge-unbalanced";
    } else {
      statusBadge.textContent = "▶ INCLINADA A LA DERECHA (M₂ > M₁)";
      statusBadge.className = "badge-unbalanced";
    }
  }
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
  const width = 420;
  const height = 270;

  ctx.save();
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // 1. Fondo de gabinete científico renacentista
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
  bgGrad.addColorStop(0, "#132144");
  bgGrad.addColorStop(1, "#070E1E");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const fulcrumX = width / 2;
  const fulcrumY = height * 0.58;
  const beamLength = width * 0.84;
  const maxMeters = 5.0;
  const pxPerMeter = (beamLength / 2) / maxMeters;

  // 2. Pedestal Clásico de Piedra y Bronce
  // Base inferior
  ctx.fillStyle = "#1E293B";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  ctx.fillRect(fulcrumX - 60, height - 25, 120, 16);
  ctx.strokeRect(fulcrumX - 60, height - 25, 120, 16);

  // Columna central cónica de bronce
  const colGrad = ctx.createLinearGradient(fulcrumX - 25, fulcrumY, fulcrumX + 25, height - 25);
  colGrad.addColorStop(0, "#E5C048");
  colGrad.addColorStop(0.4, "#C9A227");
  colGrad.addColorStop(1, "#78580D");
  ctx.fillStyle = colGrad;
  ctx.beginPath();
  ctx.moveTo(fulcrumX - 16, fulcrumY + 6);
  ctx.lineTo(fulcrumX + 16, fulcrumY + 6);
  ctx.lineTo(fulcrumX + 32, height - 25);
  ctx.lineTo(fulcrumX - 32, height - 25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#F1E5AC";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Limbo semicircular de grados (Indicador superior de nivelación)
  ctx.save();
  ctx.beginPath();
  ctx.arc(fulcrumX, fulcrumY, 38, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Marcas de escala en el limbo
  for (let deg = -20; deg <= 20; deg += 10) {
    const rad = (deg - 90) * (Math.PI / 180);
    const x1 = fulcrumX + 34 * Math.cos(rad);
    const y1 = fulcrumY + 34 * Math.sin(rad);
    const x2 = fulcrumX + 40 * Math.cos(rad);
    const y2 = fulcrumY + 40 * Math.sin(rad);

    ctx.strokeStyle = (deg === 0) ? "#10B981" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = (deg === 0) ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.restore();

  // 4. BARRA DE LA BALANZA CON ROTACIÓN FÍSICA
  ctx.save();
  ctx.translate(fulcrumX, fulcrumY);
  ctx.rotate(leverAngle);

  // Fiel o aguja vertical rígidamente fijada a la barra
  ctx.strokeStyle = "#E5C048";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -36);
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, -36, 2.5, 0, 2 * Math.PI);
  ctx.fill();

  // Viga metálica de latón
  const beamGrad = ctx.createLinearGradient(0, -5, 0, 5);
  beamGrad.addColorStop(0, "#F5E6B3");
  beamGrad.addColorStop(0.5, "#C9A227");
  beamGrad.addColorStop(1, "#6B4E08");
  ctx.fillStyle = beamGrad;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(-beamLength / 2, -5, beamLength, 10, 3);
  ctx.fill();
  ctx.stroke();

  // Regla graduada milimetrada sobre la viga (Marcas métricas de -5m a +5m)
  ctx.fillStyle = "#1E293B";
  ctx.font = "8px 'Inter', monospace";
  ctx.textAlign = "center";
  for (let m = -5; m <= 5; m++) {
    const mx = m * pxPerMeter;
    ctx.beginPath();
    ctx.moveTo(mx, -5);
    ctx.lineTo(mx, -1);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (m !== 0 && Math.abs(m) <= 5) {
      ctx.fillText(`${Math.abs(m)}m`, mx, 3);
    }
  }

  // Puntos de suspensión para las cargas
  const leftX = -leverD1 * pxPerMeter;
  const rightX = leverD2 * pxPerMeter;

  // Ganchos deslizantes sobre la barra
  ctx.fillStyle = "#E2E8F0";
  ctx.beginPath();
  ctx.arc(leftX, 0, 4, 0, 2 * Math.PI);
  ctx.arc(rightX, 0, 4, 0, 2 * Math.PI);
  ctx.fill();

  // 5. PLATILLOS Y PESAS SUSPENDIDAS (Verticales por gravedad)
  // Platillo 1 (Izquierdo)
  ctx.save();
  ctx.translate(leftX, 0);
  ctx.rotate(-leverAngle); // Contrarotación para que cuelguen siempre verticales

  // Cadenas de suspensión
  const chainLen = 48;
  ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-18, chainLen);
  ctx.moveTo(0, 0); ctx.lineTo(18, chainLen);
  ctx.stroke();

  // Platillo de latón
  ctx.fillStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.ellipse(0, chainLen, 24, 5, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#94A3B8";
  ctx.stroke();

  // Pesa clásica (Azul Cian)
  const weightH1 = Math.min(20 + (leverF1 / 5), 45);
  const weightW1 = Math.min(18 + (leverF1 / 7), 36);

  const pGrad1 = ctx.createLinearGradient(-weightW1/2, chainLen - weightH1, weightW1/2, chainLen);
  pGrad1.addColorStop(0, "#7DD3FC");
  pGrad1.addColorStop(0.5, "#0284C7");
  pGrad1.addColorStop(1, "#0369A1");
  ctx.fillStyle = pGrad1;

  ctx.beginPath();
  ctx.roundRect(-weightW1 / 2, chainLen - weightH1, weightW1, weightH1, 3);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Asa superior de la pesa
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, chainLen - weightH1, 4, Math.PI, 2 * Math.PI);
  ctx.stroke();

  // Texto de la pesa
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 10px 'Inter', sans-serif";
  ctx.fillText(`${leverF1}kg`, 0, chainLen - (weightH1 / 2) + 4);

  // Etiqueta de distancia bajo el platillo
  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 10px 'Inter', sans-serif";
  ctx.fillText(`${leverD1.toFixed(1)}m`, 0, chainLen + 15);

  ctx.restore();

  // Platillo 2 (Derecho)
  ctx.save();
  ctx.translate(rightX, 0);
  ctx.rotate(-leverAngle); // Contrarotación para verticalidad

  // Cadenas de suspensión
  ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-18, chainLen);
  ctx.moveTo(0, 0); ctx.lineTo(18, chainLen);
  ctx.stroke();

  // Platillo
  ctx.fillStyle = "#E5C048";
  ctx.beginPath();
  ctx.ellipse(0, chainLen, 24, 5, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#C9A227";
  ctx.stroke();

  // Pesa clásica (Dorada / Latón)
  const weightH2 = Math.min(20 + (leverF2 / 5), 45);
  const weightW2 = Math.min(18 + (leverF2 / 7), 36);

  const pGrad2 = ctx.createLinearGradient(-weightW2/2, chainLen - weightH2, weightW2/2, chainLen);
  pGrad2.addColorStop(0, "#FDE047");
  pGrad2.addColorStop(0.5, "#D97706");
  pGrad2.addColorStop(1, "#92400E");
  ctx.fillStyle = pGrad2;

  ctx.beginPath();
  ctx.roundRect(-weightW2 / 2, chainLen - weightH2, weightW2, weightH2, 3);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Asa superior
  ctx.strokeStyle = "#FDE047";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, chainLen - weightH2, 4, Math.PI, 2 * Math.PI);
  ctx.stroke();

  // Texto de la pesa
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 10px 'Inter', sans-serif";
  ctx.fillText(`${leverF2}kg`, 0, chainLen - (weightH2 / 2) + 4);

  // Etiqueta de distancia bajo el platillo
  ctx.fillStyle = "#E5C048";
  ctx.font = "bold 10px 'Inter', sans-serif";
  ctx.fillText(`${leverD2.toFixed(2)}m`, 0, chainLen + 15);

  ctx.restore();

  ctx.restore(); // Fin de la rotación de la barra

  // 6. Pivote Central (Cojinete central dorado en el fulcro)
  ctx.beginPath();
  ctx.arc(fulcrumX, fulcrumY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#E5C048";
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fulcrumX, fulcrumY, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "#0B132B";
  ctx.fill();

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
