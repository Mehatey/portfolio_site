/* tab-life.js
 * The cube mark in the browser tab reacts to the visitor leaving and returning.
 * Hidden: eyes close and the title says it is still here. Back: eyes open,
 * the title greets for a moment, then the real title returns.
 * No timers while the tab is hidden, no animation loop, nothing on load. */
(function () {
  "use strict";
  var realTitle = document.title;
  var greetTimer = 0;
  var link = null;
  var cache = {};

  function draw(asleep) {
    var key = asleep ? "z" : "o";
    if (cache[key]) return cache[key];
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    if (!g) return "";
    g.scale(2, 2);
    g.fillStyle = "#000";
    g.fillRect(0, 0, 32, 32);
    g.strokeStyle = "rgba(255,255,255,0.8)";
    g.lineWidth = 1.2;
    g.lineJoin = "round";
    g.translate(8, 6);
    g.strokeRect(2, 4, 12, 12);
    g.beginPath();
    g.moveTo(2, 4);
    g.lineTo(8, 0);
    g.lineTo(20, 0);
    g.lineTo(14, 4);
    g.closePath();
    g.moveTo(14, 4);
    g.lineTo(20, 0);
    g.lineTo(20, 12);
    g.lineTo(14, 16);
    g.stroke();
    g.fillStyle = "#fff";
    g.strokeStyle = "#fff";
    if (asleep) {
      // closed eyes: two short lines
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(4.5, 10.5);
      g.lineTo(7, 10.5);
      g.moveTo(9.5, 10.5);
      g.lineTo(12, 10.5);
      g.stroke();
    } else {
      g.fillRect(5, 8.5, 1.6, 3);
      g.fillRect(10, 8.5, 1.6, 3);
    }
    cache[key] = c.toDataURL("image/png");
    return cache[key];
  }

  function setIcon(asleep) {
    var url = draw(asleep);
    if (!url) return;
    if (link && link.parentNode) link.parentNode.removeChild(link);
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "64x64";
    link.href = url;
    document.head.appendChild(link);
  }

  function restore() {
    if (link && link.parentNode) link.parentNode.removeChild(link);
    link = null;
    document.title = realTitle;
  }

  document.addEventListener("visibilitychange", function () {
    clearTimeout(greetTimer);
    if (document.hidden) {
      realTitle = document.title.replace(/^(Still here|Hi again) · /, "");
      document.title = "Still here · " + realTitle;
      setIcon(true);
    } else {
      document.title = "Hi again · " + realTitle;
      setIcon(false);
      greetTimer = setTimeout(restore, 1600);
    }
  });
})();
