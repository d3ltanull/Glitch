/* global gsap, ScrollTrigger, Lenis, lucide */

(function () {
  "use strict";

  const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;

  function initLenis() {
    if (typeof Lenis === "undefined") return;
    try {
      document.documentElement.classList.add("lenis");
      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        smoothTouch: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
      window.lenis = lenis;
    } catch (e) {
      console.warn("Lenis init:", e);
    }
  }

  function initCursor() {
    const ring = document.getElementById("cursor-ring");
    const dot = document.getElementById("cursor-dot");
    if (!ring || !dot || prefersCoarse) {
      if (ring) ring.style.display = "none";
      if (dot) dot.style.display = "none";
      return;
    }
    if (typeof gsap === "undefined" || typeof gsap.quickTo !== "function") {
      return;
    }

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    gsap.set(dot, { x: cx, y: cy, xPercent: -50, yPercent: -50 });
    gsap.set(ring, { x: cx, y: cy, xPercent: -50, yPercent: -50 });

    const ringX = gsap.quickTo(ring, "x", { duration: 0.65, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.65, ease: "power3.out" });

    const refr = ring.querySelector(".cursor-ring__refraction");
    let refXTo;
    let refYTo;
    let refRotTo;
    if (refr) {
      gsap.set(refr, { x: 0, y: 0, rotation: 0, transformOrigin: "50% 50%" });
      refXTo = gsap.quickTo(refr, "x", { duration: 0.32, ease: "power2.out" });
      refYTo = gsap.quickTo(refr, "y", { duration: 0.32, ease: "power2.out" });
      refRotTo = gsap.quickTo(refr, "rotation", { duration: 0.5, ease: "power1.out" });
    }

    const hoverSelectors =
      "a, button, [role='button'], input, textarea, select, .cursor-hover, .nav-link";

    window.addEventListener(
      "mousemove",
      (e) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        ringX(e.clientX);
        ringY(e.clientY);
        if (refXTo && refYTo && refRotTo) {
          const nx = (e.clientX / window.innerWidth - 0.5) * 20;
          const ny = (e.clientY / window.innerHeight - 0.5) * 20;
          refXTo(nx);
          refYTo(ny);
          refRotTo((e.clientX + e.clientY) * 0.035);
        }
        dot.classList.add("is-visible");
        ring.classList.add("is-visible");
        const over = e.target.closest(hoverSelectors);
        ring.classList.toggle("is-hover", !!over);
      },
      { passive: true }
    );

    window.addEventListener(
      "mouseleave",
      () => {
        dot.classList.remove("is-visible");
        ring.classList.remove("is-visible");
        ring.classList.remove("is-hover");
      },
      { passive: true }
    );
  }

  function initScrollReveal() {
    gsap.utils.toArray(".reveal-up").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 56, skewY: 3, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    gsap.utils.toArray(".reveal-stagger").forEach((container) => {
      const kids = container.querySelectorAll(":scope > *");
      gsap.fromTo(
        kids,
        { opacity: 0, y: 40, skewY: 2 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: container,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  function initHeroParallax() {
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length) return;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute("data-parallax") || "0.15");
      gsap.to(layer, {
        yPercent: -12 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: layer.closest("section") || document.body,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  function initHeadlineDistort() {
    document.querySelectorAll(".distort-headline").forEach((el) => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          skewX: -6,
          skewY: 4,
          scaleX: 1.06,
          filter: "blur(10px) contrast(1.2)",
        },
        {
          opacity: 1,
          skewX: 0,
          skewY: 0,
          scaleX: 1,
          filter: "blur(0px) contrast(1)",
          duration: 1.2,
          ease: "power4.out",
          delay: 0.15,
        }
      );
    });
  }

  function initCourseFilter() {
    const root = document.getElementById("course-filter");
    if (!root) return;
    const buttons = root.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll("[data-category]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.getAttribute("data-filter");
        buttons.forEach((b) => {
          b.classList.toggle("bg-white/15", b === btn);
          b.classList.toggle("border-white/30", b === btn);
          b.classList.toggle("text-white", b === btn);
          b.classList.toggle("border-white/10", b !== btn);
          b.classList.toggle("text-zinc-400", b !== btn);
        });

        cards.forEach((card) => {
          const cat = card.getAttribute("data-category");
          const show = f === "all" || cat === f;
          gsap.to(card, {
            opacity: show ? 1 : 0.22,
            scale: show ? 1 : 0.97,
            filter: show ? "blur(0px)" : "blur(1px)",
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              card.style.pointerEvents = show ? "auto" : "none";
            },
          });
        });
      });
    });
  }

  function initIcons() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  function initCourseProgram() {
    if (typeof gsap === "undefined") return;
    const root = document.getElementById("course-program");
    if (!root) return;

    const modules = root.querySelectorAll(".course-module");

    modules.forEach((mod) => {
      const panel = mod.querySelector(".course-module__panel");
      const inner = mod.querySelector(".course-module__inner");
      if (!panel) return;

      gsap.set(panel, { height: 0, opacity: 0, overflow: "hidden" });
      if (inner) gsap.set(inner, { y: -8, opacity: 0 });

      let activeTween;
      const killActive = () => {
        if (activeTween) {
          activeTween.kill();
          activeTween = null;
        }
      };

      const expand = () => {
        killActive();
        mod.classList.add("is-open");
        gsap.set(panel, { height: "auto", opacity: 1, overflow: "hidden" });
        const fullH = panel.scrollHeight;
        gsap.set(panel, { height: 0, opacity: 0 });
        if (inner) gsap.set(inner, { y: -8, opacity: 0 });
        const tl = gsap.timeline({
          onComplete: () => {
            activeTween = null;
            gsap.set(panel, { height: "auto" });
          },
        });
        activeTween = tl;
        tl.to(panel, {
          height: fullH,
          opacity: 1,
          duration: 0.48,
          ease: "power2.out",
        });
        if (inner) {
          tl.to(
            inner,
            { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" },
            "-=0.34"
          );
        }
      };

      const collapse = () => {
        killActive();
        mod.classList.remove("is-open");
        gsap.set(panel, { overflow: "hidden" });
        const h = panel.offsetHeight;
        if (h < 1) {
          gsap.set(panel, { height: 0, opacity: 0 });
          if (inner) gsap.set(inner, { y: -8, opacity: 0 });
          return;
        }
        gsap.set(panel, { height: h });
        const tl = gsap.timeline({ onComplete: () => (activeTween = null) });
        activeTween = tl;
        if (inner) {
          tl.to(inner, { y: -6, opacity: 0, duration: 0.22, ease: "power2.in" });
        }
        tl.to(
          panel,
          {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
          },
          inner ? "-=0.08" : 0
        );
      };

      mod.addEventListener("mouseenter", expand);
      mod.addEventListener("mouseleave", collapse);
    });
  }

  function initModal() {
    const openBtn = document.querySelector("[data-open-enroll]");
    const modal = document.getElementById("enroll-modal");
    const closeBtn = document.querySelector("[data-close-enroll]");
    if (!openBtn || !modal) return;

    const setOpen = (open) => {
      modal.classList.toggle("hidden", !open);
      modal.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("overflow-hidden", open);
    };

    openBtn.addEventListener("click", () => setOpen(true));
    closeBtn?.addEventListener("click", () => setOpen(false));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) setOpen(false);
    });
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeadlineDistort();
    initScrollReveal();
    initHeroParallax();
    initCourseFilter();
    initCourseProgram();
    initModal();
  }

  initCursor();
  initIcons();
})();
