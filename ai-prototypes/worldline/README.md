# Worldline

Worldline makes block-scale climate adaptation visible. A person enters a real street, compares today with a proposed future inside one 3D scene, adjusts the intervention, and sees predicted effects on shade, heat exposure, stormwater capture, and walking comfort.

This is not a chat product. Each technology performs a distinct job:

- Google Maps grounding supplies current place context, street activity, transit, and nearby uses.
- Google Earth Engine supplies land-surface temperature, canopy, and environmental layers.
- Gemini spatial reasoning proposes interventions within real constraints.
- Three.js turns the proposal into an explorable before-and-after street.
- Imagen or Veo can generate a high-fidelity communication view after the interactive proposal is approved.
- Cloud Run protects the Gemini key and returns a structured proposal to the browser.

## Prototype status

The browser prototype includes one handcrafted golden block, Allen Street at Delancey Street, with interactive intervention logic. This makes the core experience testable without exposing a key or pretending generated data is live.

The Cloud Run endpoint in `cloudrun/server.mjs` is executable. Add a Gemini API key, deploy it, and put the service URL in `config.js` to replace the handcrafted proposal with Maps-grounded output.

## Golden path

1. Open Allen Street during the 3 PM heat condition.
2. Drag the vertical seam to compare today and proposed.
3. Adjust trees, shade structures, rain gardens, or the pedestrian edge.
4. Watch the 3D future and impact metrics update together.
5. Select **Generate a cooler block** to see the Google data and reasoning pipeline.

## Run locally

From the portfolio root:

```bash
ruby -run -e httpd . -p 5179
```

Open `http://127.0.0.1:5179/ai-prototypes/worldline/`.

## Connect Google AI Studio and Cloud Run

1. Create a Gemini API key in Google AI Studio.
2. Deploy `cloudrun/` with `GEMINI_API_KEY` stored as a Cloud Run secret.
3. Restrict `ALLOWED_ORIGIN` to the portfolio domain.
4. Set `WORLDLINE_CONFIG.apiUrl` in `config.js` to the deployed service.
5. Replace the prototype climate object with Earth Engine sampled data.

Never put the Gemini key in `config.js` or any browser file.

## Product evidence

- [Grounding with Google Maps](https://blog.google/innovation-and-ai/technology/developers-tools/grounding-google-maps-gemini-api/)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini spatial reasoning](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-developers/)
- [Google Earth Engine](https://earthengine.google.com/)
- [Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)
