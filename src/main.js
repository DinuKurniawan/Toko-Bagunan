import './style.css';
import { createIcons, icons } from 'lucide';
import Lenis from 'lenis';
import SplitType from 'split-type';
import { animate, stagger, inView } from 'motion';

// --- INIT LUCIDE ICONS ---
createIcons({ icons });

// --- UTILS ---
const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- INIT LENIS (SMOOTH SCROLL) ---
let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    anchors: true,
  });

  // Ensure anchor links scroll smoothly via Lenis
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = qs(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement);
      }
    });
  });
}

// --- NAVBAR SCROLL STYLE ---
const initNavbar = () => {
  const navbar = qs('#navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'border-slate-200');
      navbar.classList.remove('bg-transparent', 'border-transparent');
    } else {
      navbar.classList.remove('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'border-slate-200');
      navbar.classList.add('bg-transparent', 'border-transparent');
    }
  }, { passive: true });
};

// --- MOBILE MENU ---
const initMobileMenu = () => {
  const btn = qs('#mobile-menu-btn');
  const menu = qs('#mobile-menu');
  const iconOpen = qs('#menu-icon-open');
  const iconClose = qs('#menu-icon-close');
  if (!btn || !menu) return;

  let isOpen = false;

  const toggleMenu = () => {
    isOpen = !isOpen;
    btn.setAttribute('aria-expanded', String(isOpen));
    
    if (isOpen) {
      menu.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      
      if (!prefersReducedMotion) {
        animate(menu, { opacity: [0, 1], y: [-10, 0] }, { duration: 0.3, easing: "ease-out" });
      }
    } else {
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      
      if (!prefersReducedMotion) {
        const controls = animate(menu, { opacity: [1, 0], y: [0, -10] }, { duration: 0.2, easing: "ease-in" });
        controls.finished.then(() => {
          if (!isOpen) menu.classList.add('hidden');
        });
      } else {
        menu.classList.add('hidden');
      }
    }
  };

  btn.addEventListener('click', toggleMenu);

  // Close menu on link click
  qsa('.mobile-link', menu).forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });
};

// --- HERO ANIMATION ---
const initHeroAnimation = () => {
  if (prefersReducedMotion) return;

  const headline = qs('#hero-headline');
  const subheadline = qs('#hero-subheadline');
  const ctas = qs('#hero-ctas');
  const stats = qs('#hero-stats');
  const badge = qs('#hero-badge');
  const visual = qs('#hero-visual');

  if (headline) {
    const splitText = new SplitType(headline, { types: 'words' });
    
    // Hide initially
    splitText.words.forEach(w => {
      w.style.opacity = '0';
      w.style.transform = 'translateY(20px)';
    });

    animate(
      splitText.words,
      { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
      { duration: 0.8, delay: stagger(0.04), easing: [0.16, 1, 0.3, 1] }
    );
  }

  const elementsToFade = [badge, subheadline, ctas, stats, visual].filter(Boolean);
  elementsToFade.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  });

  animate(
    elementsToFade,
    { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
    { duration: 0.8, delay: stagger(0.15, { startDelay: 0.4 }), easing: "ease-out" }
  );

  // Floating cards subtle loop animation
  qsa('.floating-card').forEach((card) => {
    const delayStr = card.style.getPropertyValue('--delay') || '0s';
    const delayNum = parseFloat(delayStr) || 0;
    
    // Floating animation using motion
    animate(
      card,
      { y: [-8, 8] },
      { 
        duration: 2.5, 
        direction: "alternate", 
        repeat: Infinity, 
        easing: "ease-in-out",
        delay: Math.abs(delayNum)
      }
    );
  });
};

// --- MOUSE PARALLAX ---
const initParallax = () => {
  if (prefersReducedMotion) return;
  const parallaxElements = qsa('[data-parallax]');
  if (!parallaxElements.length) return;

  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (clientX - centerX) / centerX;
    const moveY = (clientY - centerY) / centerY;

    parallaxElements.forEach(el => {
      const factor = parseFloat(el.getAttribute('data-parallax') || '0.05');
      const x = moveX * 100 * factor;
      const y = moveY * 100 * factor;
      // Use standard CSS transform for fast smooth update
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  }, { passive: true });
};

// --- SCROLL REVEAL ---
const initScrollReveal = () => {
  const elements = qsa('.scroll-reveal');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach(el => el.style.opacity = '1');
    return;
  }

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
  });

  inView('.scroll-reveal', (info) => {
    animate(
      info.target,
      { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0px)'] },
      { duration: 0.7, easing: [0.16, 1, 0.3, 1] }
    );
  }, { margin: "-10% 0px" });
};

// --- FAQ ACCORDION ---
const initFAQ = () => {
  qsa('.faq-item').forEach(item => {
    const trigger = qs('.faq-trigger', item);
    const content = qs('.faq-content', item);
    const icon = qs('.faq-icon', item);
    
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Close all others first
      qsa('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          const otherTrigger = qs('.faq-trigger', otherItem);
          const otherContent = qs('.faq-content', otherItem);
          const otherIcon = qs('.faq-icon', otherItem);
          
          otherTrigger.setAttribute('aria-expanded', 'false');
          if (!prefersReducedMotion) {
            animate(otherContent, { height: 0 }, { duration: 0.3, easing: "ease-out" });
          } else {
            otherContent.style.height = '0px';
          }
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      
      if (!isExpanded) {
        icon.style.transform = 'rotate(180deg)';
        if (!prefersReducedMotion) {
          // Set to auto to get scrollHeight, then animate
          content.style.height = 'auto';
          const height = content.scrollHeight;
          content.style.height = '0px';
          animate(content, { height: height }, { duration: 0.3, easing: "ease-out" });
        } else {
          content.style.height = 'auto';
        }
      } else {
        icon.style.transform = 'rotate(0deg)';
        if (!prefersReducedMotion) {
          animate(content, { height: 0 }, { duration: 0.3, easing: "ease-in" });
        } else {
          content.style.height = '0px';
        }
      }
    });
  });
};

// --- CONTACT FORM ---
const initContactForm = () => {
  const form = qs('#contact-form');
  if (!form) return;

  const nameInput = qs('#name');
  const waInput = qs('#whatsapp');
  const kebInput = qs('#kebutuhan');
  
  const errName = qs('#err-name');
  const errWa = qs('#err-whatsapp');
  const errKeb = qs('#err-kebutuhan');
  const successMsg = qs('#form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset errors
    let isValid = true;
    [errName, errWa, errKeb, successMsg].forEach(el => el.classList.add('hidden'));
    [nameInput, waInput, kebInput].forEach(el => el.classList.remove('border-red-500', 'focus:ring-red-500/50', 'focus:border-red-500'));

    if (!nameInput.value.trim()) {
      isValid = false;
      errName.classList.remove('hidden');
      nameInput.classList.add('border-red-500', 'focus:ring-red-500/50', 'focus:border-red-500');
    }

    if (!waInput.value.trim()) {
      isValid = false;
      errWa.classList.remove('hidden');
      waInput.classList.add('border-red-500', 'focus:ring-red-500/50', 'focus:border-red-500');
    }

    if (!kebInput.value.trim()) {
      isValid = false;
      errKeb.classList.remove('hidden');
      kebInput.classList.add('border-red-500', 'focus:ring-red-500/50', 'focus:border-red-500');
    }

    if (isValid) {
      // Simulate success
      successMsg.classList.remove('hidden');
      form.reset();
      
      // Send to WA link (optional functionality, requested is just form validation)
      // const text = `Halo Maju Jaya, nama saya ${nameInput.value.trim()}. Saya butuh: ${kebInput.value.trim()}`;
      // window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(text)}`, '_blank');
    }
  });

  // Clear errors on input
  [nameInput, waInput, kebInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('border-red-500', 'focus:ring-red-500/50', 'focus:border-red-500');
      const errEl = qs(`#err-${input.id === 'whatsapp' ? 'whatsapp' : input.id}`);
      if(errEl) errEl.classList.add('hidden');
    });
  });
};

// --- FOOTER YEAR ---
const initCurrentYear = () => {
  const yearSpan = qs('#year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
};

// --- PRODUCT CARD HOVER (using Motion for smooth lift if needed, but CSS is fine too. We use CSS hover for cards, but CTA micro interaction with motion) ---
const initCTAInteraction = () => {
  if (prefersReducedMotion) return;
  qsa('[data-cta]').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      animate(btn, { scale: 1.03 }, { duration: 0.15 });
    });
    btn.addEventListener('mouseleave', () => {
      animate(btn, { scale: 1 }, { duration: 0.2 });
    });
    btn.addEventListener('focus-visible', () => {
      animate(btn, { scale: 1.03 }, { duration: 0.15 });
    });
    btn.addEventListener('blur', () => {
      animate(btn, { scale: 1 }, { duration: 0.2 });
    });
  });
};

// --- RUN ALL ---
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initHeroAnimation();
  initParallax();
  initScrollReveal();
  initFAQ();
  initContactForm();
  initCurrentYear();
  initCTAInteraction();
});
