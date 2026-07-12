// feed.js — the live pulse of life on Earth.
// Consumes the iNaturalist observation firehose (no key, public reads) and
// emits a steady stream of freshly-logged organisms: photo, name, place, time.
//
// The feed is deliberately faster and vaster than the eye downstream can hold.
// That gap is the whole piece — so we never throttle the world, we just sip it.

const API = "https://api.inaturalist.org/v1/observations";
const ANIMAL_GROUPS = [
  "Aves", "Amphibia", "Mammalia", "Reptilia",
  "Actinopterygii", "Insecta", "Arachnida", "Mollusca",
];
const ANIMAL_GROUP_SET = new Set(ANIMAL_GROUPS);

// Newest research-grade animal observations with a photo, globally. Most polls
// are intentionally broad—so the field contains fish, insects, and other life
// alongside birds—while every third poll is sound-only to retain a strong supply
// of recordings for visitors to discover.
function buildUrl(page, soundOnly = false) {
  const q = new URLSearchParams({
    order: "desc",
    order_by: "created_at",
    per_page: "30",
    page: String(page),
    photos: "true",
    quality_grade: "research",
    iconic_taxa: ANIMAL_GROUPS.join(","),
    // keep the payload lean
    fields: "id,taxon,photos,sounds,place_guess,location,observed_on,time_observed_at",
  });
  if (soundOnly) q.set("sounds", "true");
  return `${API}?${q.toString()}`;
}

// iNat thumbnails come as ".../square.jpeg" (75px). Pull the 500px "medium"
// so CLIP has something to look at and the atlas tile is crisp.
function mediumUrl(url) {
  if (!url) return null;
  return url
    .replace("/square.", "/medium.")
    .replace("/thumb.", "/medium.")
    .replace("/small.", "/medium.");
}

// Only the open-data S3 bucket sends Access-Control-Allow-Origin, so only those
// photos can be fetched into the WebGPU atlas. static.inaturalist.org returns the
// image but no CORS header, so those fetches are blocked and the sighting would
// silently vanish. We skip them up front (~18% of the feed) and keep a clean,
// fully-loading stream rather than a field pocked with dropped organisms.
function corsSafe(url) {
  return !!url && url.includes("inaturalist-open-data");
}

function normalize(r) {
  const p = r.photos && r.photos[0];
  if (!p || !p.url || !corsSafe(p.url)) return null;
  const taxon = r.taxon || {};
  // Keep the query's intent intact if an upstream result is unexpectedly broad.
  // This excludes plants and fungi while keeping the full range of animal life.
  if (!ANIMAL_GROUP_SET.has(taxon.iconic_taxon_name)) return null;
  const sound = (r.sounds || []).find((s) => s && s.file_url)?.file_url || null;
  let lat = null, lng = null;
  if (typeof r.location === "string" && r.location.includes(",")) {
    const [a, b] = r.location.split(",").map(Number);
    if (Number.isFinite(a) && Number.isFinite(b)) { lat = a; lng = b; }
  }
  return {
    id: r.id,
    taxonId: taxon.id || null,
    photo: mediumUrl(p.url),
    sound,
    sci: taxon.name || "unknown form",
    common: taxon.preferred_common_name || "",
    iconic: taxon.iconic_taxon_name || "",
    place: r.place_guess || "",
    when: r.time_observed_at || r.observed_on || "",
    lat, lng,
  };
}

// Find a real recording of this species: query iNaturalist for recent observations
// of the taxon that carry a sound, and return the first playable file URL. Many
// taxa (most plants, fungi, insects) have none — then this resolves null and the
// piece simply stays quiet for that form. Birds, frogs and mammals usually sing.
const _soundCache = new Map();
export async function fetchTaxonSound(taxonId) {
  if (!taxonId) return null;
  if (_soundCache.has(taxonId)) return _soundCache.get(taxonId);
  try {
    const q = new URLSearchParams({
      taxon_id: String(taxonId), sounds: "true", per_page: "12",
      order: "desc", order_by: "votes", fields: "sounds",
    });
    const res = await fetch(`${API}?${q.toString()}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`iNat ${res.status}`);
    const data = await res.json();
    let url = null;
    for (const o of data.results || []) {
      const s = o.sounds && o.sounds.find((x) => x && x.file_url);
      if (s) { url = s.file_url; break; }
    }
    _soundCache.set(taxonId, url);
    return url;
  } catch (e) {
    _soundCache.set(taxonId, null);
    return null;
  }
}

export class Feed {
  // onOrganism: called once per never-before-seen observation
  constructor(onOrganism, { intervalMs = 3800 } = {}) {
    this.onOrganism = onOrganism;
    this.intervalMs = intervalMs;
    this.seen = new Set();
    this.seenOrder = [];
    this.timer = null;
    this.alive = false;
    this.totalSighted = 0;
    this.lastError = null;
    this.page = 1;        // rotate through the newest pages for variety + density
    this.maxPage = 6;
    this.polls = 0;
  }

  async tick() {
    // grab + advance the page synchronously so overlapping seed ticks differ
    const page = this.page;
    this.page = (this.page % this.maxPage) + 1;
    const soundOnly = this.polls++ % 3 === 0;
    try {
      const res = await fetch(buildUrl(page, soundOnly), { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`iNat ${res.status}`);
      const data = await res.json();
      const results = data.results || [];
      // API returns newest-first; reverse so we emit in chronological order.
      for (const r of results.reverse()) {
        if (this.seen.has(r.id)) continue;
        const org = normalize(r);
        // record even skipped ids so we don't re-check the same ones each tick
        this.seen.add(r.id);
        this.seenOrder.push(r.id);
        if (!org) continue;
        // bound the dedupe memory
        if (this.seenOrder.length > 4000) {
          const old = this.seenOrder.shift();
          this.seen.delete(old);
        }
        this.totalSighted++;
        this.onOrganism(org);
      }
      this.lastError = null;
    } catch (e) {
      this.lastError = e;
      // swallow — the firehose is allowed to stutter; we just wait for the next sip
    }
  }

  start() {
    if (this.alive) return;
    this.alive = true;
    // seed a denser starting field by pulling the first few pages right away
    this.tick();
    setTimeout(() => this.tick(), 700);
    setTimeout(() => this.tick(), 1400);
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  stop() {
    this.alive = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
