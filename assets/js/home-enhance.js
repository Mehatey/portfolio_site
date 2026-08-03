/* Homepage enhancements — kinetic typewriter headline, scroll parallax/depth,
   blur-to-sharp reveals, stat count-ups and the project hover-preview.
   Every effect is defensive: if its target is missing or anything throws, it
   silently no-ops and the page renders normally. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) Typewriter headline with a backspace swap ---------------------------
  // Types the whole line once, then keeps rewriting just the middle phrase:
  // "complex technology" -> backspace -> "messy systems" -> ... and back.
  // Pauses whenever the headline is off-screen or the tab is hidden.
  try {
    var h = document.getElementById("home-title");
    if (h && !reduce) {
      var original = h.innerHTML;
      var full = h.textContent.replace(/\s+/g, " ").trim();
      var HEAD = "I turn ";
      var SWAPS = ["complex technology", "messy systems", "half-built ideas"];
      var TAIL = " into ";
      var ACCENT = "clear, useful experiences.";
      // Only run the swap version if the headline is the one we expect.
      var canSwap = full.indexOf(HEAD) === 0 && full.indexOf(SWAPS[0]) === HEAD.length;
      if (canSwap) {
        h.setAttribute("aria-label", full);
        h.innerHTML =
          '<span class="ht-head" aria-hidden="true"></span>' +
          '<span class="ht-swap" aria-hidden="true"></span>' +
          '<span class="ht-caret" aria-hidden="true"></span>' +
          '<span class="ht-tail" aria-hidden="true"></span>';
        var elHead = h.querySelector(".ht-head");
        var elSwap = h.querySelector(".ht-swap");
        var elTail = h.querySelector(".ht-tail");
        var caret = h.querySelector(".ht-caret");
        var tailFull = TAIL + ACCENT;
        var tailHTML = function (n) {
          if (n <= TAIL.length) return TAIL.slice(0, n);
          return TAIL + '<span class="home-title__accent">' + ACCENT.slice(0, n - TAIL.length) + "</span>";
        };

        var visible = true;
        try {
          if ("IntersectionObserver" in window) {
            new IntersectionObserver(
              function (es) {
                visible = es[0].isIntersecting;
              },
              { threshold: 0.2 }
            ).observe(h);
          }
        } catch (e) {}
        var awake = function () {
          return visible && !document.hidden;
        };

        var jitter = function (base) {
          return base + Math.random() * base * 0.7;
        };
        var wait = function (ms, next) {
          setTimeout(next, ms);
        };
        var typeInto = function (el, text, html, done) {
          var i = 0;
          var step = function () {
            if (i > text.length) return done();
            if (html) el.innerHTML = html(i);
            else el.textContent = text.slice(0, i);
            var c = text.charAt(i - 1);
            i++;
            wait(c === "," || c === "." ? 240 : jitter(26), step);
          };
          step();
        };
        var backspace = function (el, keep, done) {
          var step = function () {
            var t = el.textContent;
            if (t.length <= keep) return done();
            el.textContent = t.slice(0, -1);
            wait(jitter(20), step);
          };
          step();
        };

        // Run through the alternates once, settle back on the real phrase, then
        // finish the sentence and hand the headline over to the letter-scatter
        // physics that already lives in the page (they used to fight over the
        // same <h1>; now they take turns).
        var handoff = function () {
          h.innerHTML = original;
          h.removeAttribute("aria-label");
          try {
            document.dispatchEvent(new CustomEvent("home-title:typed"));
          } catch (e) {}
        };

        var cycle = function (k) {
          if (k >= SWAPS.length) {
            // back to the phrase the page actually claims
            return backspace(elSwap, 0, function () {
              typeInto(elSwap, SWAPS[0], null, function () {
                typeInto(elTail, tailFull, tailHTML, function () {
                  caret.classList.add("is-done");
                  wait(900, handoff);
                });
              });
            });
          }
          if (!awake())
            return wait(500, function () {
              cycle(k);
            });
          wait(560, function () {
            backspace(elSwap, 0, function () {
              typeInto(elSwap, SWAPS[k], null, function () {
                cycle(k + 1);
              });
            });
          });
        };

        var boot = function () {
          try {
            typeInto(elHead, HEAD, null, function () {
              typeInto(elSwap, SWAPS[0], null, function () {
                cycle(1);
              });
            });
          } catch (e) {
            h.innerHTML = original;
            handoff();
          }
        };
        setTimeout(boot, 420);
      }
    }
  } catch (e) {
    /* leave headline untouched */
  }

  // 2) Scroll depth: hero thumbnails drift, work cards get per-card parallax
  try {
    if (!reduce) {
      var thumbs = document.querySelector(".home-projects");
      var cards = [].slice.call(document.querySelectorAll(".hs-card"));
      var ticking = false;
      var frame = function () {
        var y = window.pageYOffset || 0;
        var vh = window.innerHeight || 1;
        if (thumbs) thumbs.style.transform = "translate3d(0," + (y * -0.05).toFixed(1) + "px,0)";
        // Each cover pans inside its own frame, at a slightly different rate per
        // column, so the grid gains depth. Driven through object-position rather
        // than transform so it never fights the card's hover/reveal transforms.
        for (var i = 0; i < cards.length; i++) {
          var r = cards[i].getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) continue;
          var mid = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
          var depth = 5 + (i % 3) * 2.5;
          var img = cards[i].querySelector("img");
          if (img) img.style.objectPosition = "center " + (50 + mid * depth).toFixed(1) + "%";
        }
        ticking = false;
      };
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(frame);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }
  } catch (e) {}

  // 3) Blur-to-sharp reveals, staggered ------------------------------------
  try {
    if (!reduce && "IntersectionObserver" in window) {
      var els = document.querySelectorAll(".home-projects a, .home-actions, .hs-card, .hs-stat, [data-blur-in]");
      if (els.length) {
        els.forEach(function (el) {
          el.classList.add("he-blurin");
        });
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              if (!en.isIntersecting) return;
              var sibs = en.target.parentNode ? [].slice.call(en.target.parentNode.children) : [];
              var idx = Math.max(0, sibs.indexOf(en.target));
              en.target.style.transitionDelay = Math.min(idx * 70, 420) + "ms";
              en.target.classList.add("he-sharp");
              io.unobserve(en.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        els.forEach(function (el) {
          io.observe(el);
        });
        // safety: if anything is already on-screen but the observer is late
        setTimeout(function () {
          els.forEach(function (el) {
            el.classList.add("he-sharp");
          });
        }, 1600);
      }
    }
  } catch (e) {}

  // 4) Stat count-up -------------------------------------------------------
  // The numbers under "By the numbers" tick up the first time they scroll in.
  try {
    var nums = document.querySelectorAll(".hs-stat b");
    if (nums.length && !reduce && "IntersectionObserver" in window) {
      var countUp = function (el) {
        var raw = el.textContent.trim();
        var m = raw.match(/^([\d.]+)(.*)$/);
        if (!m) return;
        var target = parseFloat(m[1]);
        var suffix = m[2] || "";
        var dur = 1100;
        var t0 = performance.now();
        var step = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * e) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        };
        el.textContent = "0" + suffix;
        requestAnimationFrame(step);
      };
      var nio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            nio.unobserve(en.target);
            countUp(en.target);
          });
        },
        { threshold: 0.6 }
      );
      nums.forEach(function (n) {
        nio.observe(n);
      });
    }
  } catch (e) {}

  // 5) Project hover-preview -----------------------------------------------
  // The bottom-right thumbnails carry data-title/meta/description/image and the
  // hero has a #home-project-focus takeover layer. Hovering a thumbnail
  // populates + reveals it (via .home-stage.has-project); leaving hides it;
  // click still navigates.
  try {
    var stage = document.getElementById("home-stage");
    var fImg = document.getElementById("home-focus-image");
    var fTitle = document.getElementById("home-focus-title");
    var fMeta = document.getElementById("home-focus-meta");
    var fDesc = document.getElementById("home-focus-description");
    var fLink = document.getElementById("home-focus-link");
    var projects = document.querySelectorAll(".home-project");
    if (stage && fImg && fTitle && projects.length) {
      // Warm the covers so the first hover does not flash an empty frame.
      projects.forEach(function (p) {
        if (p.dataset.image) {
          var pre = new Image();
          pre.src = p.dataset.image;
        }
      });
      var hideTimer = null;
      var show = function (p) {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
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
        // small grace period so moving between adjacent thumbs does not flicker
        hideTimer = setTimeout(function () {
          stage.classList.remove("has-project");
        }, 90);
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
