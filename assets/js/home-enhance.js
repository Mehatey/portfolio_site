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
})();
