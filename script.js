/* ==========================================================================
   LEGADO MATEMÁTICO - INTERACTIVIDAD Y MOTOR MATEMÁTICO
   Universidad Nacional Abierta y a Distancia (UNAD)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initArchimedesLab();
  initLeverLab();
  initLabTabs();
});

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
    const scrollPos = window.scrollY + 120;

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
   2. PESTAÑAS DEL LABORATORIO
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

      // Redibujar canvas correspondientes al cambiar de pestaña
      if (target === "tab-exhaucion") {
        drawArchimedesSimulation();
      } else if (target === "tab-palanca") {
        drawLeverSimulation();
      }
    });
  });
}

/* ==========================================================================
   3. SIMULACIÓN: MÉTODO DE EXHAUCIÓN DE ARQUÍMEDES (APROXIMACIÓN DE PI)
   ========================================================================== */
let currentSides = 96;

function initArchimedesLab() {
  const nButtons = document.querySelectorAll(".btn-n");
  const nSlider = document.getElementById("nSlider");

  nButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      nButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSides = parseInt(btn.getAttribute("data-n"), 10);
      if (nSlider) nSlider.value = currentSides;
      drawArchimedesSimulation();
    });
  });

  if (nSlider) {
    nSlider.addEventListener("input", (e) => {
      currentSides = parseInt(e.target.value, 10);
      nButtons.forEach(b => {
        b.classList.toggle("active", parseInt(b.getAttribute("data-n"), 10) === currentSides);
      });
      drawArchimedesSimulation();
    });
  }

  // Redibujado en resize
  window.addEventListener("resize", drawArchimedesSimulation);
  drawArchimedesSimulation();
}

function drawArchimedesSimulation() {
  const canvas = document.getElementById("circleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Ajuste de resolución
  const size = 380;
  canvas.width = size;
  canvas.height = size;

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;
  const n = currentSides;

  ctx.clearRect(0, 0, size, size);

  // 1. Fondo técnico oscuro
  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, size, size);

  // Cuadrícula sutil
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Ejes ortogonales
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(cx, 10); ctx.lineTo(cx, size - 10);
  ctx.moveTo(10, cy); ctx.lineTo(size - 10, cy);
  ctx.stroke();

  // 2. Polígono Circunscrito (Exterior - Dorado)
  const angleStep = (2 * Math.PI) / n;
  const halfAngle = angleStep / 2;
  const R_circ = R / Math.cos(halfAngle);

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
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
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 4. Polígono Inscrito (Interior - Azul Cian)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - halfAngle;
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

  // 5. Cálculos Matemáticos Reales
  const lowerBound = n * Math.sin(Math.PI / n);
  const upperBound = n * Math.tan(Math.PI / n);
  const realPi = Math.PI;
  const avgEstimate = (lowerBound + upperBound) / 2;
  const errorPct = Math.abs((avgEstimate - realPi) / realPi) * 100;

  // Actualizar métricas en el DOM
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
        <strong>Cotas exactas del tratado de Arquímedes (n = 96):</strong><br>
        <span style="color:#38BDF8">3 + 10/71 (≈ 3.140845)</span> 
        &lt; <strong>π</strong> &lt; 
        <span style="color:#E5C048">3 + 1/7 (≈ 3.142857)</span>
      `;
    } else {
      valArchimedesInterval.innerHTML = `
        <strong>Acotación para n = ${n}:</strong><br>
        <span style="color:#38BDF8">${lowerBound.toFixed(6)}</span> 
        &lt; <strong>π</strong> &lt; 
        <span style="color:#E5C048">${upperBound.toFixed(6)}</span>
      `;
    }
  }
}

/* ==========================================================================
   4. SIMULACIÓN: LEY DE LA PALANCA DE ARQUÍMEDES (F1 * d1 = F2 * d2)
   ========================================================================== */
let leverF1 = 50;  // Peso 1 en N o kg
let leverD1 = 4;   // Distancia 1 en m
let leverF2 = 100; // Peso 2 en N o kg
let leverD2 = 2;   // Distancia 2 en m

function initLeverLab() {
  const f1Input = document.getElementById("leverF1");
  const d1Input = document.getElementById("leverD1");
  const f2Input = document.getElementById("leverF2");

  if (f1Input) {
    f1Input.addEventListener("input", (e) => {
      leverF1 = parseFloat(e.target.value);
      updateLever();
    });
  }
  if (d1Input) {
    d1Input.addEventListener("input", (e) => {
      leverD1 = parseFloat(e.target.value);
      updateLever();
    });
  }
  if (f2Input) {
    f2Input.addEventListener("input", (e) => {
      leverF2 = parseFloat(e.target.value);
      updateLever();
    });
  }

  updateLever();
}

function updateLever() {
  // Calculamos d2 necesario para el equilibrio: d2 = (F1 * d1) / F2
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

  drawLeverSimulation();
}

function drawLeverSimulation() {
  const canvas = document.getElementById("leverCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const width = 380;
  const height = 240;
  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  // Fondo oscuro
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

  // 2. Punto de Apoyo (Triángulo Fulcro de Arquímedes)
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

  // 3. Barra de la Palanca en equilibrio horizontal
  const leftX = fulcrumX - (beamLength / 2);
  const rightX = fulcrumX + (beamLength / 2);

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(leftX, fulcrumY);
  ctx.lineTo(rightX, fulcrumY);
  ctx.stroke();

  // 4. Marcadores de posición de las cargas
  // Escala máxima de brazo = 5 metros
  const maxMeters = 5;
  const pxPerMeter = (beamLength / 2) / maxMeters;

  const pos1X = fulcrumX - Math.min(leverD1 * pxPerMeter, (beamLength / 2) - 10);
  const pos2X = fulcrumX + Math.min(leverD2 * pxPerMeter, (beamLength / 2) - 10);

  // Carga 1 (Izquierda - azul)
  const size1 = Math.min(14 + (leverF1 / 5), 36);
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(pos1X - (size1 / 2), fulcrumY - size1 - 3, size1, size1);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.strokeRect(pos1X - (size1 / 2), fulcrumY - size1 - 3, size1, size1);

  // Texto Carga 1
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${leverF1}kg`, pos1X, fulcrumY - size1 - 7);
  ctx.fillText(`${leverD1.toFixed(1)}m`, pos1X, fulcrumY + 16);

  // Carga 2 (Derecha - dorada)
  const size2 = Math.min(14 + (leverF2 / 5), 44);
  ctx.fillStyle = "#E5C048";
  ctx.fillRect(pos2X - (size2 / 2), fulcrumY - size2 - 3, size2, size2);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.strokeRect(pos2X - (size2 / 2), fulcrumY - size2 - 3, size2, size2);

  // Texto Carga 2
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${leverF2}kg`, pos2X, fulcrumY - size2 - 7);
  ctx.fillText(`${leverD2.toFixed(2)}m`, pos2X, fulcrumY + 16);

  // Ecuación en pantalla
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`F₁ · d₁  =  F₂ · d₂   →   (${leverF1} × ${leverD1.toFixed(1)}) = (${leverF2} × ${leverD2.toFixed(2)})`, fulcrumX, 30);
}
