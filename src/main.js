import "./style.css";
import { animate, stagger } from "motion";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

const navbar = qs("#navbar");
const updateNavbar = () => {
  if (!navbar) return;
  navbar.dataset.scrolled = window.scrollY > 12 ? "true" : "false";
};

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

const menuButton = qs("#mobile-menu-button");
const mobileMenu = qs("#mobile-menu");
let menuOpen = false;

const setMenuAria = (open) => {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.dataset.open = open ? "true" : "false";
};

const openMenu = (immediate = false) => {
  if (!mobileMenu) return;
  menuOpen = true;
  setMenuAria(true);
  mobileMenu.hidden = false;

  if (prefersReducedMotion || immediate) {
    mobileMenu.style.height = "auto";
    mobileMenu.style.opacity = "1";
    mobileMenu.style.transform = "translateY(0px)";
    return;
  }

  const height = mobileMenu.scrollHeight;
  mobileMenu.style.height = "0px";
  mobileMenu.style.opacity = "0";
  mobileMenu.style.transform = "translateY(-8px)";

  const controls = animate(
    mobileMenu,
    {
      height: [0, height],
      opacity: [0, 1],
      transform: ["translateY(-8px)", "translateY(0px)"],
    },
    { duration: 0.25, easing: "ease-out" }
  );

  controls.finished.then(() => {
    mobileMenu.style.height = "auto";
  });
};

const closeMenu = (immediate = false) => {
  if (!mobileMenu) return;
  menuOpen = false;
  setMenuAria(false);

  if (prefersReducedMotion || immediate) {
    mobileMenu.hidden = true;
    mobileMenu.style.height = "auto";
    mobileMenu.style.opacity = "1";
    mobileMenu.style.transform = "translateY(0px)";
    return;
  }

  const height = mobileMenu.scrollHeight;
  mobileMenu.style.height = `${height}px`;

  const controls = animate(
    mobileMenu,
    {
      height: [height, 0],
      opacity: [1, 0],
      transform: ["translateY(0px)", "translateY(-8px)"],
    },
    { duration: 0.2, easing: "ease-in" }
  );

  controls.finished.then(() => {
    mobileMenu.hidden = true;
    mobileMenu.style.height = "auto";
    mobileMenu.style.opacity = "1";
    mobileMenu.style.transform = "translateY(0px)";
  });
};

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  qsa("#mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeMenu(true);
    }
  });

  document.addEventListener("click", (event) => {
    if (!menuOpen) return;
    if (menuButton.contains(event.target)) return;
    if (mobileMenu.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && menuOpen) {
      closeMenu(true);
    }
  });
}

const heroItems = qsa("[data-hero]");
if (!prefersReducedMotion && heroItems.length) {
  heroItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(18px)";
  });

  animate(
    heroItems,
    { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] },
    { duration: 0.6, delay: stagger(0.08), easing: "ease-out" }
  );
}

const heroCarousel = qs("[data-carousel]");
if (heroCarousel) {
  const carouselSlides = qsa("[data-carousel-slide]", heroCarousel);
  if (carouselSlides.length) {
    const carouselPrev = qs("[data-carousel-prev]", heroCarousel);
    const carouselNext = qs("[data-carousel-next]", heroCarousel);
    const carouselStatus = qs("[data-carousel-status]", heroCarousel);
    const slideCount = carouselSlides.length;
    let activeIndex = 0;
    let autoplayId = null;
    let hoverPaused = false;
    let focusPaused = false;

    const formatStatus = (index) =>
      `Banner ${String(index + 1).padStart(2, "0")} / ${String(
        slideCount
      ).padStart(2, "0")}`;

    const renderSlide = (index) => {
      activeIndex = (index + slideCount) % slideCount;

      carouselSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.dataset.active = String(isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      if (carouselStatus) {
        carouselStatus.textContent = formatStatus(activeIndex);
      }
    };

    const stopAutoplay = () => {
      if (autoplayId === null) return;
      window.clearInterval(autoplayId);
      autoplayId = null;
    };

    const canAutoplay = () =>
      !prefersReducedMotion &&
      slideCount > 1 &&
      !document.hidden &&
      !hoverPaused &&
      !focusPaused;

    const startAutoplay = () => {
      if (!canAutoplay() || autoplayId !== null) return;
      autoplayId = window.setInterval(() => {
        renderSlide(activeIndex + 1);
      }, 5000);
    };

    const refreshAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    if (slideCount < 2) {
      if (carouselPrev) carouselPrev.disabled = true;
      if (carouselNext) carouselNext.disabled = true;
    }

    renderSlide(0);
    startAutoplay();

    carouselPrev?.addEventListener("click", () => {
      renderSlide(activeIndex - 1);
      refreshAutoplay();
    });

    carouselNext?.addEventListener("click", () => {
      renderSlide(activeIndex + 1);
      refreshAutoplay();
    });

    heroCarousel.addEventListener("mouseenter", () => {
      hoverPaused = true;
      stopAutoplay();
    });

    heroCarousel.addEventListener("mouseleave", () => {
      hoverPaused = false;
      refreshAutoplay();
    });

    heroCarousel.addEventListener("focusin", () => {
      focusPaused = true;
      stopAutoplay();
    });

    heroCarousel.addEventListener("focusout", (event) => {
      if (event.relatedTarget && heroCarousel.contains(event.relatedTarget)) {
        return;
      }

      focusPaused = false;
      refreshAutoplay();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
        return;
      }

      refreshAutoplay();
    });
  }
}

const statCards = qsa("[data-stat]");
if (!prefersReducedMotion && statCards.length) {
  statCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(14px)";
  });

  animate(
    statCards,
    { opacity: [0, 1], transform: ["translateY(14px)", "translateY(0px)"] },
    { duration: 0.55, delay: stagger(0.12), easing: "ease-out" }
  );
}

const revealItems = qsa("[data-reveal]");
if (!prefersReducedMotion && revealItems.length) {
  revealItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(
          entry.target,
          {
            opacity: [0, 1],
            transform: ["translateY(20px)", "translateY(0px)"],
          },
          { duration: 0.6, easing: "ease-out" }
        );
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

qsa("[data-cta]").forEach((button) => {
  if (prefersReducedMotion) return;
  button.addEventListener("mouseenter", () => {
    animate(button, { scale: 1.03 }, { duration: 0.15 });
  });
  button.addEventListener("mouseleave", () => {
    animate(button, { scale: 1 }, { duration: 0.2 });
  });
  button.addEventListener("focus", () => {
    animate(button, { scale: 1.03 }, { duration: 0.15 });
  });
  button.addEventListener("blur", () => {
    animate(button, { scale: 1 }, { duration: 0.2 });
  });
});

qsa("[data-accordion]").forEach((item) => {
  const trigger = qs(".faq-trigger", item);
  const panel = qs("[data-panel]", item);
  if (!trigger || !panel) return;

  const openPanel = () => {
    item.dataset.open = "true";
    trigger.setAttribute("aria-expanded", "true");
    panel.hidden = false;

    if (prefersReducedMotion) {
      panel.style.height = "auto";
      panel.style.opacity = "1";
      return;
    }

    const height = panel.scrollHeight;
    panel.style.height = "0px";
    panel.style.opacity = "0";

    const controls = animate(
      panel,
      { height: [0, height], opacity: [0, 1] },
      { duration: 0.25, easing: "ease-out" }
    );

    controls.finished.then(() => {
      panel.style.height = "auto";
    });
  };

  const closePanel = () => {
    item.dataset.open = "false";
    trigger.setAttribute("aria-expanded", "false");

    if (prefersReducedMotion) {
      panel.hidden = true;
      panel.style.height = "auto";
      panel.style.opacity = "1";
      return;
    }

    const height = panel.scrollHeight;
    panel.style.height = `${height}px`;

    const controls = animate(
      panel,
      { height: [height, 0], opacity: [1, 0] },
      { duration: 0.2, easing: "ease-in" }
    );

    controls.finished.then(() => {
      panel.hidden = true;
      panel.style.height = "auto";
      panel.style.opacity = "1";
    });
  };

  trigger.addEventListener("click", () => {
    const isOpen = item.dataset.open === "true";
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });
});

const form = qs("#contact-form");
const status = qs("#form-status");
const nameField = qs("#name");
const phoneField = qs("#phone");
const needsField = qs("#needs");

const clearFieldError = (field) => {
  if (!field) return;
  field.classList.remove("field-error");
  field.removeAttribute("aria-invalid");
};

const setFieldError = (field) => {
  if (!field) return;
  field.classList.add("field-error");
  field.setAttribute("aria-invalid", "true");
};

const setStatus = (message, type) => {
  if (!status) return;
  status.textContent = message;
  status.classList.remove("status-error", "status-success");
  if (type === "error") {
    status.classList.add("status-error");
  }
  if (type === "success") {
    status.classList.add("status-success");
  }
};

if (form && nameField && phoneField && needsField) {
  [nameField, phoneField, needsField].forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = [];
    const nameValue = nameField.value.trim();
    const phoneValue = phoneField.value.trim();
    const needsValue = needsField.value.trim();
    const normalizedPhone = phoneValue.replace(/[^\d]/g, "");

    if (nameValue.length < 2) {
      errors.push("Nama minimal 2 karakter.");
      setFieldError(nameField);
    }

    if (normalizedPhone.length < 9) {
      errors.push("Nomor WhatsApp belum valid.");
      setFieldError(phoneField);
    }

    if (needsValue.length < 10) {
      errors.push("Jelaskan kebutuhan material minimal 10 karakter.");
      setFieldError(needsField);
    }

    if (errors.length) {
      setStatus(errors.join(" "), "error");
      return;
    }

    setStatus(
      "Terima kasih! Tim kami akan menghubungi Anda secepatnya.",
      "success"
    );
    form.reset();
  });
}

const year = qs("[data-year]");
if (year) {
  year.textContent = new Date().getFullYear();
}
