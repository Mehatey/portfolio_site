# Per-answer voice lines

Drop one audio file here per conversation thread and the cube will speak that
answer in Sid's own voice, with captions timed to the audio. Anything missing
falls back to the six recorded voice colours in `../`, so the page works with
none of these files, some of them, or all of them. Nothing else needs changing.

## Naming

The filename is the thread id from `cubeScript` in `web/tv-head-viewer.js`, plus
`.mp3`. Exactly these thirteen:

| File | What it says |
| --- | --- |
| `who.mp3` | Designer and technologist in New York. MFA from Parsons, with work spanning EyeJack, Deloitte, and Philips. The cube claims only partial credit. |
| `builds.mp3` | AR exhibitions, VR narratives, enterprise interfaces, spatial systems, and identities. Most alive where design meets emerging technology. |
| `best.mp3` | ENCODED earned two Webbys at the Met. Mandala is a quiet AR and VR room for sitting with yourself. Cube of Creations is the seven-year character study that became a game. |
| `encoded.mp3` | An AR exhibition at the Met. Two Webbys. That is the short version the cube is cleared to give. Ask him for the long one. |
| `mandala.mp3` | An AR and VR room you sit in rather than play. Quiet on purpose. People tend to stay longer than they planned. |
| `cubeof.mp3` | Seven years of drawing one character until it turned into a game. The cube you are talking to is a cousin. |
| `tools.mp3` | Figma, Unity, TouchDesigner, Unreal, JavaScript, Python, Arduino, Premiere, and Three.js when the moment calls for it. |
| `process.mp3` | Prototype early, in whatever medium answers the question fastest. Paper, Unity, a browser tab. The considered version comes after the thing works. |
| `awards.mp3` | Two Webbys for ENCODED, and a Kyoorius. Both are bolted to the front of this machine, so he cannot quietly forget them. |
| `why.mp3` | A photograph would have been a claim. A cube is an invitation. It is also much easier to light. |
| `me.mp3` | A stand-in. Six recorded voices, a short list of answers, and no opinions of my own yet. The real conversation is one email away. |
| `available.mp3` | Open to full-time, freelance, and good collaborations from summer 2026. |
| `reach.mp3` | Email is fastest: sidmehtadesign@gmail.com. LinkedIn, Instagram, and GitHub are close behind. Carrier pigeons are not recommended. |

The answer text lives in `cubeScript`. If you change an answer, regenerate that
one file so the captions and the audio still agree.

## Format

MP3, mono is fine, 44.1kHz, roughly 96 to 128 kbps. Each file is a few seconds,
so the whole set should land well under a megabyte. To use a different container,
change `LINE_AUDIO.ext` in `tv-head-viewer.js`.

## Captions

Captions are generated from the answer text and the audio duration, split by
sentence and weighted by word length. They are approximate, not forced-aligned.
If a line drifts noticeably, shorten the sentence rather than fighting the timing.

## manifest.json

The page reads `manifest.json` in this folder and only requests recordings that
are listed there, so a half finished set never fills the console with 404s.

- Nothing recorded yet: `[]`
- Some threads recorded: `["who", "best", "reach"]`
- Every thread recorded: `["*"]`

If `manifest.json` is missing entirely the cube just uses the voice colours.
