const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const P = require("./projects.json"),
  M = require("./manifest.json");
fs.mkdirSync("downloads", { recursive: true });
for (const p of P) {
  const paths = [];
  for (const a of p.pieces) {
    const f = "media/" + p.slug + "/" + a.id;
    paths.push(f + ".webp", f + "-mobile.webp");
    if (a.type === "application") paths.push(f + "-artifact.webp", f + "-artifact-mobile.webp");
    if (["film", "logo", "sequence"].includes(a.type)) paths.push(f + ".mp4");
    if (a.type === "logo") paths.push(f + ".gif");
    if (a.type === "generated") paths.push("generated/" + a.generated + ".webp");
  }
  const meta = "downloads/" + p.slug + "-manifest.json";
  fs.writeFileSync(
    meta,
    JSON.stringify(
      {
        project: M.files.find((x) => x.slug === p.slug),
        notes:
          "Local review assets. New applications are concepts. Source references point to the unchanged source repository. Desktop/mobile files are size variants, not separate pieces.",
      },
      null,
      2
    )
  );
  r("zip", ["-q", "-j", "downloads/" + p.slug + ".zip", ...paths, meta]);
}
console.log("16 project download packages written");
