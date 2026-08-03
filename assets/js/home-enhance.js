/* Homepage enhancements — kinetic typewriter headline, gentle scroll parallax,
   and blur-to-sharp reveals. Every effect is defensive: if its target is missing
   or anything throws, it silently no-ops and the page renders normally. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) Typewriter headline -------------------------------------------------
  try {
    var h = document.getElementById("home-title");
    if (h && !reduce) {
      var original = h.innerHTML;
      var full = h.textContent.replace(/\s+/g, " ").trim();
      var accent = "clear, useful experiences.";
      var accentIdx = full.indexOf("clear, useful");
      h.setAttribute("aria-label", full);
      h.innerHTML = '<span class="ht-type" aria-hidden="true"></span><span class="ht-caret" aria-hidden="true"></span>';
      var type = h.querySelector(".ht-type");
      var caret = h.querySelector(".ht-caret");
      var i = 0;
      var render = function (n) {
        if (accentIdx >= 0 && n > accentIdx) {
          type.innerHTML = full.slice(0, accentIdx) + '<span class="home-title__accent">' + full.slice(accentIdx, n) + "</span>";
        } else {
          type.textContent = full.slice(0, n);
        }
      };
      var tick = function () {
        try {
          if (i <= full.length) {
            render(i);
            i++;
            var c = full.charAt(i - 1);
            var d = c === "," || c === "." ? 260 : 30 + Math.random() * 34;
            setTimeout(tick, d);
          } else if (caret) {
            caret.classList.add("is-done");
          }
        } catch (e) {
          h.innerHTML = original;
        }
      };
      setTimeout(tick, 480);
    }
  } catch (e) {
    /* leave headline untouched */
  }

  // 2) Gentle parallax on the project thumbnails --------------------------
  try {
    if (!reduce) {
      var thumbs = document.querySelector(".home-projects");
      if (thumbs) {
        var ticking = false;
        var onScroll = function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            var y = window.pageYOffset || 0;
            thumbs.style.transform = "translate3d(0," + (y * -0.05).toFixed(1) + "px,0)";
            ticking = false;
          });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    }
  } catch (e) {}

  // 3) Blur-to-sharp reveals ----------------------------------------------
  try {
    if (!reduce && "IntersectionObserver" in window) {
      var els = document.querySelectorAll(".home-projects a, .home-actions, [data-blur-in]");
      if (els.length) {
        els.forEach(function (el) {
          el.classList.add("he-blurin");
        });
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                en.target.classList.add("he-sharp");
                io.unobserve(en.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        els.forEach(function (el) {
          io.observe(el);
        });
        // safety: if anything is already on-screen but observer is late, sharpen after 1.4s
        setTimeout(function () {
          els.forEach(function (el) {
            el.classList.add("he-sharp");
          });
        }, 1400);
      }
    }
  } catch (e) {}

  // 4) Project hover-preview -----------------------------------------------
  // The thumbnails bottom-right carry data-title/meta/description/image and the
  // hero has a hidden #home-project-focus takeover layer. Hovering a thumbnail
  // populates + reveals it (via .home-stage.has-project); leaving hides it; click
  // still navigates. (This logic existed in-page but was disabled by a stray
  // early return in a retired peephole IIFE.)
  try {
    var stage = document.getElementById("home-stage");
    var fImg = document.getElementById("home-focus-image");
    var fTitle = document.getElementById("home-focus-title");
    var fMeta = document.getElementById("home-focus-meta");
    var fDesc = document.getElementById("home-focus-description");
    var fLink = document.getElementById("home-focus-link");
    var projects = document.querySelectorAll(".home-project");
    if (stage && fImg && fTitle && projects.length) {
      var show = function (p) {
        fImg.src = p.dataset.image || "";
        fImg.alt = (p.dataset.title || "") + " project preview";
        fTitle.textContent = p.dataset.title || "";
        if (fMeta) fMeta.textContent = p.dataset.meta || "";
        if (fDesc) fDesc.textContent = p.dataset.description || "";
        if (fLink) {
          fLink.href = p.href;
          fLink.textContent = "Open " + (p.dataset.title || "project");
        }
        stage.classList.add("has-project");
      };
      var hide = function () {
        stage.classList.remove("has-project");
      };
      var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      projects.forEach(function (p) {
        if (fine) {
          p.addEventListener("pointerenter", function () {
            show(p);
          });
          p.addEventListener("pointerleave", hide);
        }
        // keyboard users still get the preview on focus, on any device
        p.addEventListener("focus", function () {
          show(p);
        });
        p.addEventListener("blur", hide);
      });
    }
  } catch (e) {}
})();
