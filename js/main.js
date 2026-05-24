(() => {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerQuery = window.matchMedia("(pointer: fine)");
  let reducedMotion = motionQuery.matches;
  let activeProject = 0;
  const maxDiveDepth = 10935;
  const enableDecorativeScrollEffects = false;
  const enableCustomCursor = false;

  document.addEventListener("DOMContentLoaded", () => {
    handleReducedMotion();
    initCanvas();
    const gsapReady = initGSAP();
    initNavigation(gsapReady);
    initHeroAnimation(gsapReady);
    initWordmarkScroll(gsapReady);
    initDiveExperience(gsapReady);
    initScrollAnimations(gsapReady);
    initLayeredStory(gsapReady);
    initProjectShowcase(gsapReady);
    initResearchArchive(gsapReady);
    if (enableDecorativeScrollEffects) {
      initOceanMotion(gsapReady);
      initPanelReflex();
    }
    if (enableCustomCursor) initCursor();
  });

  window.addEventListener("load", () => {
    if (window.ScrollTrigger && !reducedMotion) {
      window.ScrollTrigger.refresh();
    }
  });

  function handleReducedMotion() {
    reducedMotion = motionQuery.matches;
    document.documentElement.classList.toggle("is-reduced-motion", reducedMotion);
    motionQuery.addEventListener("change", () => {
      window.location.reload();
    });
  }

  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) {
      document.documentElement.classList.add("is-ready", "no-gsap");
      const preloader = document.querySelector(".preloader");
      if (preloader) preloader.remove();
      return false;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
    return true;
  }

  function initHeroAnimation(gsapReady) {
    const preloader = document.querySelector(".preloader");
    const heroTitle = document.querySelector(".js-hero-title");
    const startsAwayFromHero = window.location.hash && window.location.hash !== "#intro";

    const settleHero = () => {
      document.documentElement.classList.add("is-ready");
      if (preloader) preloader.remove();

      if (gsapReady) {
        gsap.set([".js-hero-title:not(.js-hero-wordmark)", ".js-hero-title:not(.js-hero-wordmark) .hero-char", ".js-hero-subtitle", ".hero-accent-line"], {
          clearProps: "opacity,transform,filter,clipPath,willChange"
        });
      }
    };

    if (heroTitle && !heroTitle.classList.contains("js-hero-wordmark") && gsapReady && !reducedMotion && !heroTitle.dataset.split) {
      const text = heroTitle.textContent || "";
      heroTitle.dataset.split = "true";
      heroTitle.setAttribute("aria-label", text);
      heroTitle.textContent = "";

      text.split("").forEach((character) => {
        const span = document.createElement("span");
        span.className = "hero-char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = character === " " ? "\u00a0" : character;
        heroTitle.appendChild(span);
      });
    }

    if (!gsapReady || reducedMotion) {
      settleHero();
      return;
    }

    if (startsAwayFromHero) {
      settleHero();
      return;
    }

    if (preloader) {
      preloader.remove();
    }

    gsap.set([".js-hero-title:not(.js-hero-wordmark)", ".js-hero-title:not(.js-hero-wordmark) .hero-char", ".js-hero-subtitle", ".hero-accent-line"], {
      willChange: "transform, opacity, clip-path, filter"
    });

    const tl = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: settleHero
    });

    tl.from(".site-header", {
      opacity: 0,
      y: -22,
      duration: 0.95,
      immediateRender: false
    }, 0)
      .from(".js-hero-title:not(.js-hero-wordmark)", {
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.7,
        immediateRender: false
      }, "-=0.58")
      .from(".js-hero-title:not(.js-hero-wordmark) .hero-char", {
        opacity: 0,
        yPercent: 62,
        filter: "blur(14px)",
        duration: 1.24,
        stagger: 0.035,
        immediateRender: false
      }, "-=0.54")
      .from(".js-hero-subtitle", {
        opacity: 0,
        y: 30,
        filter: "blur(8px)",
        duration: 1,
        immediateRender: false
      }, "-=0.68")
      .from(".hero-accent-line", {
        scaleX: 0,
        opacity: 0,
        duration: 0.88,
        immediateRender: false
      }, "-=0.64");
  }

  function initWordmarkScroll(gsapReady) {
    const wordmark = document.querySelector(".js-hero-wordmark");
    const wordmarkSvg = wordmark ? wordmark.querySelector(".hero-wordmark__svg") : null;
    const wordmarkText = wordmark ? wordmark.querySelector(".hero-wordmark__text") : null;
    const logo = document.querySelector(".site-logo");

    if (!wordmark || !wordmarkSvg || !wordmarkText || !logo) return;

    if (!gsapReady || reducedMotion) {
      document.documentElement.classList.add("wordmark-static");
      return;
    }

    const root = document.documentElement;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const viewBoxWidth = wordmarkSvg.viewBox.baseVal.width || 1000;
    const startTextLength = parseFloat(wordmarkText.getAttribute("textLength")) || viewBoxWidth;
    const logoMeasurement = document.createElement("span");
    logoMeasurement.textContent = (logo.textContent || "").trim();
    logoMeasurement.setAttribute("aria-hidden", "true");
    Object.assign(logoMeasurement.style, {
      position: "fixed",
      top: "0",
      left: "-10000px",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "nowrap"
    });
    document.body.appendChild(logoMeasurement);
    let metrics = null;

    const measureNaturalTextMetrics = () => {
      const clone = wordmarkText.cloneNode(true);
      clone.removeAttribute("textLength");
      clone.removeAttribute("lengthAdjust");
      clone.setAttribute("opacity", "0");
      clone.setAttribute("aria-hidden", "true");
      wordmarkSvg.appendChild(clone);
      const box = clone.getBBox();
      const length = typeof clone.getComputedTextLength === "function" ? clone.getComputedTextLength() : box.width;
      clone.remove();
      return {
        length: length || box.width || startTextLength,
        x: box.x || 0,
        y: box.y || 0
      };
    };

    const measureLogoTextWidth = (fallbackWidth) => {
      const style = getComputedStyle(logo);
      logoMeasurement.style.fontFamily = style.fontFamily;
      logoMeasurement.style.fontStyle = style.fontStyle;
      logoMeasurement.style.fontWeight = style.fontWeight;
      logoMeasurement.style.fontSize = style.fontSize;
      logoMeasurement.style.lineHeight = style.lineHeight;
      logoMeasurement.style.letterSpacing = style.letterSpacing;
      logoMeasurement.style.textTransform = style.textTransform;
      return logoMeasurement.getBoundingClientRect().width || fallbackWidth;
    };

    const measure = () => {
      const wordmarkWidth = wordmark.offsetWidth || wordmark.getBoundingClientRect().width || 1;
      const wordmarkHeight = wordmark.offsetHeight || wordmark.getBoundingClientRect().height || 1;
      const logoRect = logo.getBoundingClientRect();
      const logoTextWidth = measureLogoTextWidth(logoRect.width);
      const startCenterY = window.innerHeight * (window.innerWidth < 900 ? 0.44 : 0.48);
      const naturalText = measureNaturalTextMetrics();
      const endTextLength = clamp(naturalText.length, viewBoxWidth * 0.35, startTextLength);
      const endTextWidth = Math.max(1, wordmarkWidth * (endTextLength / viewBoxWidth));
      const targetScale = clamp(logoTextWidth / endTextWidth, 0.04, 0.24);

      metrics = {
        startX: (window.innerWidth - wordmarkWidth) / 2,
        startY: startCenterY - wordmarkHeight / 2,
        endX: logoRect.left,
        endY: logoRect.top + (logoRect.height - wordmarkHeight * targetScale) / 2,
        endScale: targetScale,
        startTextLength,
        endTextLength
      };

      return metrics;
    };

    const getMetrics = () => metrics || measure();
    const invalidateMetrics = () => {
      metrics = null;
    };

    gsap.set(wordmark, {
      x: () => getMetrics().startX,
      y: () => getMetrics().startY,
      scale: 1,
      transformOrigin: "0 0"
    });
    gsap.set(wordmarkText, {
      attr: {
        textLength: () => getMetrics().startTextLength
      }
    });

    const handoffStart = 0.9;
    const setDockedState = (progress) => {
      root.classList.toggle("wordmark-is-docked", progress >= handoffStart);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#intro",
        start: "top top",
        end: () => `+=${window.innerHeight * (window.innerWidth < 900 ? 0.62 : 0.72)}`,
        scrub: 0.32,
        invalidateOnRefresh: true,
        onRefreshInit: invalidateMetrics,
        onRefresh: (self) => setDockedState(self.animation ? self.animation.progress() : self.progress)
      }
    });
    tl.eventCallback("onUpdate", () => setDockedState(tl.progress()));

    tl.to(wordmark, {
      x: () => getMetrics().endX,
      y: () => getMetrics().endY,
      scale: () => getMetrics().endScale,
      ease: "power2.out",
      duration: 1
    }, 0)
      .to(wordmarkText, {
        attr: {
          textLength: () => getMetrics().endTextLength
        },
        ease: "power2.out",
        duration: 1
      }, 0);

    window.addEventListener("resize", () => {
      invalidateMetrics();
      ScrollTrigger.refresh();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        invalidateMetrics();
        ScrollTrigger.refresh();
      });
    }
  }

  function initDiveExperience(gsapReady) {
    const stages = Array.from(document.querySelectorAll("[data-dive-stage]"));
    const phase = document.querySelector("[data-dive-phase]");
    const depth = document.querySelector("[data-dive-depth]");

    if (stages.length === 0) return;

    let activeStage = "";
    let activeLabel = "";
    let diveTicking = false;
    let depthKeyframes = [];
    let measuredScrollable = 0;
    let lastDiveProgressKey = -1;
    let lastMeterYKey = -1;
    let lastPaletteKey = -1;
    let lastDepthLabel = "";
    const depthFormatter = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 0
    });
    const depthStages = [
      { meters: 0, stage: "surface", label: "Surface" },
      { meters: 200, stage: "midwater", label: "Mesopelagic" },
      { meters: 1000, stage: "midwater", label: "Bathypelagic" },
      { meters: 4000, stage: "floor", label: "Abyssal floor" },
      { meters: 6000, stage: "hadal", label: "Hadal / Challenger Deep" }
    ];
    const surfacePalette = {
      top: [239, 250, 251],
      mid: [214, 235, 238],
      bottom: [246, 248, 238],
      sectionTop: [232, 246, 246],
      sectionMid: [208, 232, 235],
      sectionBottom: [240, 244, 232],
      title: [16, 23, 22],
      muted: [65, 82, 79]
    };
    const deepPalette = {
      top: [10, 24, 38],
      mid: [5, 17, 31],
      bottom: [2, 8, 18],
      sectionTop: [13, 42, 62],
      sectionMid: [6, 24, 42],
      sectionBottom: [2, 8, 18],
      title: [229, 243, 243],
      muted: [173, 203, 205]
    };

    const mixNumber = (from, to, progress) => Math.round(from + (to - from) * progress);
    const mixColor = (from, to, progress) => from.map((value, index) => mixNumber(value, to[index], progress));
    const rgb = (color) => `rgb(${color.join(", ")})`;
    const rgba = (color, alpha) => `rgba(${color.join(", ")}, ${alpha.toFixed(3)})`;

    const setDepthPalette = (meterProgress) => {
      const root = document.documentElement;
      const darkness = Math.min(1, Math.max(0, Math.pow(meterProgress, 0.52)));
      const foregroundShift = Math.min(1, Math.max(0, (darkness - 0.18) / 0.5));
      const glow = 0.56 - darkness * 0.46;
      const caustic = 0.04 + darkness * 0.06;
      const grid = 0;

      root.style.setProperty("--depth-darkness", darkness.toFixed(4));
      root.style.setProperty("--depth-bg-top", rgb(mixColor(surfacePalette.top, deepPalette.top, darkness)));
      root.style.setProperty("--depth-bg-mid", rgb(mixColor(surfacePalette.mid, deepPalette.mid, darkness)));
      root.style.setProperty("--depth-bg-bottom", rgb(mixColor(surfacePalette.bottom, deepPalette.bottom, darkness)));
      root.style.setProperty("--depth-section-top", rgb(mixColor(surfacePalette.sectionTop, deepPalette.sectionTop, darkness)));
      root.style.setProperty("--depth-section-mid", rgb(mixColor(surfacePalette.sectionMid, deepPalette.sectionMid, darkness)));
      root.style.setProperty("--depth-section-bottom", rgb(mixColor(surfacePalette.sectionBottom, deepPalette.sectionBottom, darkness)));
      root.style.setProperty("--depth-heading", rgb(mixColor(surfacePalette.title, deepPalette.title, foregroundShift)));
      root.style.setProperty("--depth-muted", rgba(mixColor(surfacePalette.muted, deepPalette.muted, foregroundShift), 0.82));
      root.style.setProperty("--depth-glow-opacity", Math.max(0.12, glow).toFixed(3));
      root.style.setProperty("--depth-caustic-opacity", caustic.toFixed(3));
      root.style.setProperty("--depth-grid-opacity", grid.toFixed(3));
    };

    const sectionTop = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return 0;

      let top = 0;
      let current = element;
      while (current) {
        top += current.offsetTop || 0;
        current = current.offsetParent;
      }
      return top;
    };

    const buildDepthKeyframes = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      measuredScrollable = maxScroll;
      const stageSwitch = (selector) => sectionTop(selector) - window.innerHeight * 0.52;
      const rawKeyframes = [
        { scroll: 0, meters: 0 },
        { scroll: sectionTop("#intro") + window.innerHeight * 0.68, meters: 35 },
        { scroll: stageSwitch("#portfolio"), meters: 200 },
        { scroll: stageSwitch("#portfolio") + window.innerHeight * 1.4, meters: 1000 },
        { scroll: stageSwitch("#writing"), meters: 4000 },
        { scroll: stageSwitch("#contact"), meters: 6000 },
        { scroll: maxScroll, meters: maxDiveDepth }
      ];

      depthKeyframes = rawKeyframes
        .map((point) => ({
          scroll: Math.min(maxScroll, Math.max(0, point.scroll)),
          meters: point.meters
        }))
        .sort((a, b) => a.scroll - b.scroll)
        .reduce((points, point) => {
          const previous = points[points.length - 1];
          if (previous && Math.abs(previous.scroll - point.scroll) < 1) {
            previous.meters = point.meters;
          } else {
            points.push(point);
          }
          return points;
        }, []);
    };

    const interpolateDepth = (scrollY) => {
      if (depthKeyframes.length === 0) buildDepthKeyframes();

      const clamped = Math.min(depthKeyframes[depthKeyframes.length - 1].scroll, Math.max(0, scrollY));
      const nextIndex = depthKeyframes.findIndex((point) => point.scroll >= clamped);
      const next = depthKeyframes[nextIndex < 0 ? depthKeyframes.length - 1 : nextIndex];
      const previous = depthKeyframes[Math.max(0, (nextIndex < 0 ? depthKeyframes.length : nextIndex) - 1)];
      const span = Math.max(1, next.scroll - previous.scroll);
      const localProgress = (clamped - previous.scroll) / span;
      return previous.meters + (next.meters - previous.meters) * localProgress;
    };

    const setStageState = (stage, label) => {
      if (stage === activeStage && label === activeLabel) return;

      activeStage = stage;
      activeLabel = label;
      document.documentElement.dataset.diveStage = stage;
      if (phase) phase.textContent = label;
    };

    const setStage = (section) => {
      setStageState(section.dataset.diveStage || "", section.dataset.diveLabel || "");
    };

    const setStageFromDepth = (meters) => {
      const depthStage = depthStages.reduce((current, candidate) => (
        meters >= candidate.meters ? candidate : current
      ), depthStages[0]);

      setStageState(depthStage.stage, depthStage.label);
    };

    const updateProgress = () => {
      const root = document.documentElement;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(scrollable - measuredScrollable) > 1) buildDepthKeyframes();

      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      const meters = window.scrollY >= scrollable - 1 ? maxDiveDepth : interpolateDepth(window.scrollY);
      const meterProgress = Math.min(1, Math.max(0, meters / maxDiveDepth));
      const progressKey = Math.round(progress * 2000);
      const meterYKey = Math.round(meterProgress * 10000);
      const paletteKey = Math.round(meterProgress * 600);

      if (progressKey !== lastDiveProgressKey) {
        root.style.setProperty("--dive-progress", (progressKey / 2000).toFixed(4));
        lastDiveProgressKey = progressKey;
      }

      if (meterYKey !== lastMeterYKey) {
        root.style.setProperty("--dive-meter-y", `${(meterYKey / 100).toFixed(2)}%`);
        lastMeterYKey = meterYKey;
      }

      if (paletteKey !== lastPaletteKey) {
        setDepthPalette(paletteKey / 600);
        lastPaletteKey = paletteKey;
      }

      if (depth) {
        const depthLabel = `${depthFormatter.format(Math.round(meters))} m`;
        if (depthLabel !== lastDepthLabel) {
          depth.textContent = depthLabel;
          lastDepthLabel = depthLabel;
        }
      }
      setStageFromDepth(meters);
    };

    const scheduleDiveUpdate = () => {
      if (diveTicking) return;
      diveTicking = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        diveTicking = false;
      });
    };

    buildDepthKeyframes();
    setStage(stages[0]);
    scheduleDiveUpdate();
    window.addEventListener("scroll", scheduleDiveUpdate, { passive: true });
    window.addEventListener("resize", () => {
      buildDepthKeyframes();
      scheduleDiveUpdate();
    });
    window.addEventListener("load", () => {
      buildDepthKeyframes();
      scheduleDiveUpdate();
    }, { once: true });

    if (!gsapReady || reducedMotion || !enableDecorativeScrollEffects) {
      return;
    }

    gsap.set(".dive-atmosphere__layer, .dive-particle", {
      willChange: "transform, opacity, filter"
    });

    const diveTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        invalidateOnRefresh: true,
        onRefresh: () => {
          buildDepthKeyframes();
          updateProgress();
        },
        onUpdate: () => {
          updateProgress();
        }
      }
    });

    diveTimeline
      .to(".dive-atmosphere__layer--surface", {
        opacity: 0.14,
        yPercent: -18,
        scale: 1.08,
        filter: "blur(9px)",
        duration: 0.34
      }, 0)
      .to(".dive-atmosphere__layer--midwater", {
        opacity: 0.74,
        yPercent: -8,
        duration: 0.42
      }, 0.08)
      .to(".dive-atmosphere__layer--midwater", {
        opacity: 0.2,
        yPercent: -23,
        duration: 0.32
      }, 0.55)
      .to(".dive-atmosphere__layer--floor", {
        opacity: 0.82,
        yPercent: -10,
        duration: 0.42
      }, 0.43)
      .to(".dive-atmosphere__layer--floor", {
        opacity: 0.18,
        yPercent: -24,
        duration: 0.24
      }, 0.82)
      .to(".dive-atmosphere__layer--hadal", {
        opacity: 0.84,
        yPercent: -8,
        duration: 0.26
      }, 0.78)
      .to(".dive-particle", {
        yPercent: -170,
        xPercent: (index) => (index % 2 ? 24 : -18),
        opacity: 0.76,
        stagger: 0.08,
        duration: 1
      }, 0);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const descentTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".intro",
          start: "top top",
          end: "+=72%",
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: [0, 1],
            duration: { min: 0.16, max: 0.34 },
            delay: 0.02,
            inertia: false,
            ease: "power2.inOut"
          }
        }
      });

      descentTimeline
        .to(".hero-content", {
          yPercent: -18,
          scale: 0.985,
          opacity: 0.74,
          filter: "blur(1.2px)",
          duration: 1
        }, 0)
        .to(".intro .scene", {
          scale: 1.08,
          yPercent: -3,
          duration: 1
        }, 0)
        .to(".intro .water-surface", {
          yPercent: 68,
          opacity: 0.02,
          duration: 1
        }, 0);
    });

    gsap.to(".archive-shell", {
      y: -32,
      ease: "none",
      scrollTrigger: {
        trigger: ".writing",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    });

    gsap.fromTo(".contact-inner", {
      y: 72,
      opacity: 0.72
    }, {
      y: 0,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".contact",
        start: "top bottom",
        end: "top 35%",
        scrub: 0.8
      }
    });
  }

  function initScrollAnimations(gsapReady) {
    if (!gsapReady) {
      updateProgressFallback();
      return;
    }

    if (reducedMotion) {
      gsap.set(".scroll-progress__bar", { scaleX: 1 });
      return;
    }

    gsap.to(".scroll-progress__bar", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15
      }
    });

    gsap.to(".scientific-grid", {
      yPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".scan-line", {
      y: () => window.innerHeight * 0.28,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.utils.toArray(".js-section-heading").forEach((heading) => {
      gsap.from(heading, {
        opacity: 0,
        y: 42,
        filter: "blur(10px)",
        clipPath: "inset(0 0 100% 0)",
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 78%",
          once: true
        }
      });
    });
  }

  function initLayeredStory(gsapReady) {
    const introPanel = document.querySelector("#intro[data-story-panel]");
    const projectPanel = document.querySelector("#portfolio[data-story-panel]");
    const panels = [introPanel, projectPanel].filter(Boolean);

    if (!introPanel || !projectPanel) return;

    panels.forEach((panel, index) => {
      panel.style.setProperty("--story-z", index + 1);
    });

    if (!gsapReady || reducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const triggers = [];
      const introContent = Array.from(introPanel.children).filter((child) => !child.classList.contains("scene"));

      const resetIntro = () => {
        introPanel.style.setProperty("--story-dim", "0");
        gsap.set(introPanel, { clearProps: "transform" });
        gsap.set(projectPanel, { clearProps: "transform" });
        gsap.set(introContent, { clearProps: "transform" });
      };

      gsap.set([introPanel, projectPanel], {
        force3D: true,
        transformOrigin: "50% 12%"
      });

      gsap.fromTo(projectPanel, {
        yPercent: 8,
        scale: 0.965
      }, {
        yPercent: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: projectPanel,
          start: "top bottom",
          end: "top top",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onLeave: () => gsap.set(projectPanel, { clearProps: "transform" })
        }
      });

      if (introContent.length > 0) {
        gsap.to(introContent, {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: introPanel,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        });
      }

      triggers.push(ScrollTrigger.create({
        trigger: projectPanel,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          introPanel.style.setProperty("--story-dim", (progress * 0.42).toFixed(3));
          gsap.set(introPanel, {
            yPercent: -progress * 3.4,
            scale: 1 - progress * 0.045
          });
        },
        onLeaveBack: resetIntro
      }));

      triggers.push(ScrollTrigger.create({
        trigger: introPanel,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 0.82)}`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }));

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        resetIntro();
      };
    });
  }

  function initOceanMotion(gsapReady) {
    if (!gsapReady || reducedMotion) return;

    gsap.to(".caustic-field", {
      xPercent: 5,
      yPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: "bottom top",
        scrub: 1.2
      }
    });

    gsap.to(".water-surface", {
      yPercent: 16,
      opacity: 0.18,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.utils.toArray(".section-tide").forEach((tide, index) => {
      gsap.to(tide, {
        xPercent: index % 2 ? -7 : 7,
        yPercent: index % 2 ? 12 : -10,
        rotate: index % 2 ? "-=3" : "+=3",
        ease: "none",
        scrollTrigger: {
          trigger: tide.closest(".section"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.6
        }
      });
    });

    gsap.utils.toArray(".project-card__visual, .archive-emblem").forEach((element, index) => {
      gsap.to(element, {
        y: index % 2 ? -9 : 8,
        x: index % 3 ? 3 : -3,
        duration: 5.8 + index * 0.35,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
  }

  function initProjectShowcase(gsapReady) {
    const stage = document.querySelector(".project-stage");
    const viewport = document.querySelector(".project-viewport");
    const track = document.querySelector(".project-track");
    const portfolio = document.querySelector(".portfolio");
    const cards = Array.from(document.querySelectorAll(".project-card"));

    if (!stage || !viewport || !track || !portfolio || cards.length === 0) return;

    if (!gsapReady || reducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const clampProgress = gsap.utils.clamp(0, 1);
      const prominenceEase = gsap.parseEase("power2.out");
      const setTrackX = gsap.quickSetter(track, "x", "px");
      const cardSetters = cards.map((card) => ({
        opacity: gsap.quickSetter(card, "opacity"),
        y: gsap.quickSetter(card, "y", "px"),
        scale: gsap.quickSetter(card, "scale")
      }));
      const pageTop = (element) => {
        let top = 0;
        let current = element;
        while (current) {
          top += current.offsetTop || 0;
          current = current.offsetParent;
        }
        return top;
      };
      let projectDistance = 0;
      let projectStart = 0;
      let projectLength = 1;
      let frame = 0;
      let refreshFrame = 0;
      let targetProgress = 0;
      let renderedProgress = 0;
      let focusedProject = -1;

      const progressFromScroll = () => clampProgress((window.scrollY - projectStart) / projectLength);

      const renderProjects = (progress) => {
        const clamped = clampProgress(progress);
        const focusedIndex = clamped * Math.max(1, cards.length - 1);
        const nextProject = Math.round(focusedIndex);

        if (nextProject !== focusedProject) {
          focusedProject = nextProject;
          activeProject = nextProject;
        }

        setTrackX(-projectDistance * clamped);
        cards.forEach((card, index) => {
          const prominence = prominenceEase(clampProgress(1 - Math.abs(index - focusedIndex) / 2.25));
          const setters = cardSetters[index];

          setters.opacity(0.84 + prominence * 0.16);
          setters.y((1 - prominence) * 10);
          setters.scale(0.992 + prominence * 0.008);
        });
      };

      const animateTowardTarget = () => {
        const delta = targetProgress - renderedProgress;

        if (Math.abs(delta) < 0.001) {
          renderedProgress = targetProgress;
          renderProjects(renderedProgress);
          frame = 0;
          return;
        }

        renderedProgress += delta * 0.34;
        renderProjects(renderedProgress);
        frame = window.requestAnimationFrame(animateTowardTarget);
      };

      const scheduleRender = () => {
        targetProgress = progressFromScroll();
        if (frame) return;
        frame = window.requestAnimationFrame(animateTowardTarget);
      };

      const renderImmediately = () => {
        targetProgress = progressFromScroll();
        renderedProgress = targetProgress;
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        renderProjects(renderedProgress);
      };

      const refreshMeasurements = () => {
        refreshFrame = 0;
        projectDistance = Math.max(0, track.scrollWidth - viewport.clientWidth + window.innerWidth * 0.08);
        projectStart = pageTop(stage) - window.innerHeight * 0.14;
        projectLength = Math.max(1, projectDistance + window.innerHeight * 2);
        document.documentElement.style.setProperty("--project-scroll-space", `${Math.ceil(projectLength)}px`);
        renderImmediately();
        ScrollTrigger.refresh();
      };

      const scheduleRefresh = () => {
        if (refreshFrame) return;
        refreshFrame = window.requestAnimationFrame(refreshMeasurements);
      };

      refreshMeasurements();
      window.addEventListener("scroll", scheduleRender, { passive: true });
      window.addEventListener("resize", scheduleRefresh);
      window.addEventListener("load", scheduleRefresh, { once: true });

      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
        window.removeEventListener("scroll", scheduleRender);
        window.removeEventListener("resize", scheduleRefresh);
        document.documentElement.style.removeProperty("--project-scroll-space");
        gsap.set(track, { clearProps: "transform" });
        gsap.set(cards, { clearProps: "opacity,transform" });
      };
    });

    mm.add("(max-width: 899px)", () => {
      gsap.from(cards, {
        opacity: 0,
        y: 44,
        scale: 0.96,
        stagger: 0.08,
        duration: 0.78,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stage,
          start: "top 78%",
          once: true
        }
      });
    });
  }

  function initPanelReflex() {
    const panels = Array.from(document.querySelectorAll(".project-card"));

    if (panels.length === 0 || reducedMotion) return;

    const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
    const pointOnBorder = (progress) => {
      const loop = ((progress % 1) + 1) % 1;

      if (loop < 0.25) return { x: loop / 0.25 * 100, y: 0 };
      if (loop < 0.5) return { x: 100, y: (loop - 0.25) / 0.25 * 100 };
      if (loop < 0.75) return { x: 100 - (loop - 0.5) / 0.25 * 100, y: 100 };
      return { x: 0, y: 100 - (loop - 0.75) / 0.25 * 100 };
    };

    let ticking = false;

    const render = () => {
      ticking = false;
      const viewportHeight = window.innerHeight || 1;
      const viewportFocus = viewportHeight * 0.5;

      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < viewportHeight;

        if (!visible) {
          panel.style.setProperty("--edge-reflex-opacity", "0");
          panel.classList.remove("is-reflex-active");
          return;
        }

        const travel = clamp(0, 1, (viewportHeight - rect.top) / (viewportHeight + rect.height));
        const centerDistance = Math.abs(rect.top + rect.height / 2 - viewportFocus);
        const focus = clamp(0, 1, 1 - centerDistance / (viewportHeight * 0.62));
        const opacity = clamp(0, 0.92, focus * 0.92);
        const point = pointOnBorder(travel + index * 0.065);

        panel.style.setProperty("--edge-reflex-x", `${point.x.toFixed(2)}%`);
        panel.style.setProperty("--edge-reflex-y", `${point.y.toFixed(2)}%`);
        panel.style.setProperty("--edge-reflex-opacity", opacity.toFixed(3));
        panel.classList.toggle("is-reflex-active", opacity > 0.08);
      });
    };

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule, { once: true });
  }

  function initResearchArchive(gsapReady) {
    const groups = Array.from(document.querySelectorAll(".archive-group"));
    const emojiDisplay = document.getElementById("writing-emoji-display");
    const emojiMap = ["📄", "💬", "💻", "🧁"];

    groups.forEach((group, index) => {
      const updateEmoji = () => {
        if (emojiDisplay) emojiDisplay.textContent = emojiMap[index];
      };
      group.addEventListener("mouseenter", updateEmoji);
      group.addEventListener("focusin", updateEmoji);
    });

    if (!gsapReady || reducedMotion) return;

    groups.forEach((group) => {
      const header = group.querySelector(".archive-header");
      const items = group.querySelectorAll("li");

      gsap.fromTo(
        group,
        { "--divider-progress": 0 },
        {
          "--divider-progress": 1,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            once: true
          }
        }
      );

      gsap.from(header, {
        opacity: 0,
        y: 28,
        filter: "blur(8px)",
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: group,
          start: "top 82%",
          once: true
        }
      });

      gsap.from(items, {
        opacity: 0,
        y: 24,
        stagger: 0.045,
        duration: 0.72,
        ease: "power3.out",
        scrollTrigger: {
          trigger: group,
          start: "top 76%",
          once: true
        }
      });
    });
  }

  function initNavigation(gsapReady) {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    const indicator = document.querySelector(".nav-indicator");
    const nav = document.querySelector(".site-nav");
    let activeSectionId = "";
    let shouldRefreshIndicator = false;

    const setActive = (sectionId, force = false) => {
      if (!force && sectionId === activeSectionId && !shouldRefreshIndicator) return;

      const activeLink = links.find((link) => link.getAttribute("href") === `#${sectionId}`);
      if (!activeLink) return;

      if (sectionId !== activeSectionId) {
        links.forEach((link) => link.classList.toggle("is-active", link === activeLink));
        activeSectionId = sectionId;
      }

      if (!indicator || !nav || window.innerWidth < 900) {
        shouldRefreshIndicator = false;
        return;
      }

      const linkRect = activeLink.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const left = linkRect.left - navRect.left;
      shouldRefreshIndicator = false;

      if (gsapReady && !reducedMotion) {
        gsap.to(indicator, {
          x: left,
          width: linkRect.width,
          autoAlpha: 1,
          duration: force ? 0.26 : 0.38,
          overwrite: "auto",
          ease: "power3.out"
        });
      } else {
        indicator.style.opacity = "1";
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${linkRect.width}px`;
      }
    };

    setActive("intro");

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        setActive(href.replace("#", ""), true);
      });
    });

    let navTicking = false;
    const updateFromViewport = () => {
      const readingLine = window.innerHeight * 0.45;
      const activeSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= readingLine && rect.bottom >= readingLine;
      }) || sections[0];

      setActive(activeSection.id);
      navTicking = false;
    };

    const scheduleUpdate = () => {
      if (navTicking) return;
      navTicking = true;
      window.requestAnimationFrame(updateFromViewport);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", () => {
      shouldRefreshIndicator = true;
      scheduleUpdate();
    });
    scheduleUpdate();

    initMagnetic(gsapReady);
  }

  function initMagnetic(gsapReady) {
    if (!gsapReady || reducedMotion || !pointerQuery.matches) return;

    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.18;

        gsap.to(item, {
          x,
          y,
          duration: 0.45,
          ease: "power3.out"
        });
      });

      item.addEventListener("pointerleave", () => {
        gsap.to(item, {
          x: 0,
          y: 0,
          duration: 0.62,
          ease: "elastic.out(1, 0.45)"
        });
      });
    });
  }

  function initCursor() {
    if (reducedMotion || !pointerQuery.matches || !window.gsap) return;

    const cursor = document.querySelector(".custom-cursor");
    const halo = document.querySelector(".custom-cursor--halo");
    if (!cursor || !halo) return;

    document.documentElement.classList.add("cursor-ready");

    const moveCursor = (event) => {
      gsap.to(cursor, {
        x: event.clientX,
        y: event.clientY,
        autoAlpha: 1,
        duration: 0.16,
        ease: "power2.out"
      });
      gsap.to(halo, {
        x: event.clientX,
        y: event.clientY,
        autoAlpha: 1,
        duration: 0.42,
        ease: "power3.out"
      });
    };

    window.addEventListener("pointermove", moveCursor);

    document.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        gsap.to(halo, {
          scale: 1.55,
          borderColor: "rgba(126, 180, 189, 0.62)",
          boxShadow: "0 0 48px rgba(126, 180, 189, 0.34)",
          duration: 0.28
        });
      });
      element.addEventListener("pointerleave", () => {
        gsap.to(halo, {
          scale: 1,
          borderColor: "rgba(126, 180, 189, 0.4)",
          boxShadow: "0 0 38px rgba(126, 180, 189, 0.22)",
          duration: 0.34
        });
      });
    });
  }

  function initCanvas() {
    const canvas = document.getElementById("network-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const particles = [];
    let width = 0;
    let height = 0;
    let raf = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles.length = 0;

      const count = Math.max(28, Math.min(64, Math.floor(width / 24)));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.55 + Math.random() * 1.6,
          drift: 0.04 + Math.random() * 0.14,
          lift: (Math.random() - 0.5) * 0.04,
          pulse: Math.random() * Math.PI * 2,
          alpha: 0.08 + Math.random() * 0.16
        });
      }

      draw(0);
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      context.lineCap = "round";
      context.lineJoin = "round";

      const movement = reducedMotion ? 0 : time;

      context.save();
      context.globalCompositeOperation = "screen";
      context.shadowBlur = 18;
      context.shadowColor = "rgba(255, 255, 255, 0.45)";

      const lineCount = width < 720 ? 6 : 10;
      for (let line = 0; line < lineCount; line += 1) {
        const baseY = height * (0.1 + line * 0.062);
        const alpha = 0.1 + line * 0.006;
        context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        context.beginPath();

        for (let x = -80; x <= width + 80; x += 22) {
          const y = baseY
            + Math.sin(x * 0.011 + movement * 0.00042 + line * 0.72) * 16
            + Math.sin(x * 0.026 - movement * 0.00028 + line) * 6;

          if (x === -80) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.stroke();
      }

      context.restore();

      context.save();
      context.globalCompositeOperation = "multiply";
      context.shadowBlur = 0;

      const centerX = width * 0.73;
      const centerY = height * 0.47;
      const contourCount = width < 720 ? 4 : 7;
      for (let index = 0; index < contourCount; index += 1) {
        const radius = 82 + index * 46;
        const wobble = reducedMotion ? 0 : Math.sin(movement * 0.00035 + index) * 8;
        context.strokeStyle = `rgba(36, 92, 101, ${0.035 + index * 0.007})`;
        context.beginPath();
        context.ellipse(centerX, centerY + wobble, radius * 1.42, radius * 0.62, -0.24, 0.12, Math.PI * 1.58);
        context.stroke();
      }

      context.strokeStyle = "rgba(126, 180, 189, 0.12)";
      for (let index = 0; index < 10; index += 1) {
        const y = height * (0.22 + index * 0.055);
        const start = width * (0.56 + (index % 3) * 0.04);
        context.beginPath();
        context.moveTo(start, y);
        context.bezierCurveTo(
          start + 58,
          y + (index % 2 ? 18 : -12),
          start + 128,
          y + (index % 2 ? -8 : 16),
          Math.min(width - 28, start + 184 + (index % 4) * 26),
          y + (index % 2 ? 7 : -7)
        );
        context.stroke();
      }

      context.restore();

      particles.forEach((particle) => {
        const pulse = reducedMotion ? 0.5 : (Math.sin(movement * 0.001 + particle.pulse) + 1) / 2;
        if (!reducedMotion) {
          particle.x += particle.drift;
          particle.y += particle.lift;
          if (particle.x > width + 12) particle.x = -12;
          if (particle.y < -12) particle.y = height + 12;
          if (particle.y > height + 12) particle.y = -12;
        }

        context.fillStyle = `rgba(255, 255, 255, ${particle.alpha + pulse * 0.12})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius + pulse * 0.6, 0, Math.PI * 2);
        context.fill();
      });

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      raf = window.requestAnimationFrame(draw);
    }

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(raf);
    });
  }

  function updateProgressFallback() {
    const bar = document.querySelector(".scroll-progress__bar");
    if (!bar || reducedMotion) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 1 : window.scrollY / scrollable;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }
})();
