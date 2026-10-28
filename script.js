// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== Mobile menu toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navButtons = document.querySelector('.nav-buttons');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('active');
  navButtons.classList.toggle('active');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navButtons.classList.remove('active');
  });
});

// ===== Animated counter for stats =====
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const decimals = el.getAttribute('data-decimal') ? 1 : 0;
  let current = 0;
  const duration = 1500;
  const stepTime = 16;
  const steps = duration / stepTime;
  const increment = target / steps;

  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(counter);
    }
    el.textContent = current.toFixed(decimals) + suffix;
  }, stepTime);
}

// ===== Scroll reveal using IntersectionObserver =====
const revealElements = document.querySelectorAll('.stat-card, .step-card, .feature-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // trigger counter animation once stat card is visible
      if (entry.target.classList.contains('stat-card')) {
        const numberEl = entry.target.querySelector('.stat-number');
        if (numberEl && !numberEl.dataset.animated) {
          numberEl.dataset.animated = 'true';
          animateCounter(numberEl);
        }
      }

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealElements.forEach(el => observer.observe(el));

// ===== Subtle animated background chart (canvas) =====
const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resizeCanvas() {
  width = canvas.width = canvas.offsetWidth;
  height = canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Generate pseudo-random candlestick-like data
let points = [];
function generatePoints() {
  points = [];
  let value = height * 0.55;
  const count = 60;
  for (let i = 0; i < count; i++) {
    value += (Math.random() - 0.5) * (height * 0.08);
    value = Math.max(height * 0.2, Math.min(height * 0.8, value));
    points.push(value);
  }
}
generatePoints();

let offset = 0;

function drawChart() {
  ctx.clearRect(0, 0, width, height);

  const spacing = width / (points.length - 1);

  // Line
  ctx.beginPath();
  ctx.moveTo(0, points[0]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(i * spacing, points[i]);
  }
  ctx.strokeStyle = 'rgba(16, 217, 122, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gradient fill under line
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(16, 217, 122, 0.15)');
  gradient.addColorStop(1, 'rgba(16, 217, 122, 0)');
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Glow dot at the end
  const lastX = (points.length - 1) * spacing;
  const lastY = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#10d97a';
  ctx.fill();
}

function animateChart() {
  // shift points slowly to the left for a "live market" feel
  offset += 0.3;
  if (offset >= width / (points.length - 1)) {
    offset = 0;
    points.shift();
    let last = points[points.length - 1];
    last += (Math.random() - 0.5) * (height * 0.08);
    last = Math.max(height * 0.2, Math.min(height * 0.8, last));
    points.push(last);
  }
  drawChart();
  requestAnimationFrame(animateChart);
}

animateChart();
