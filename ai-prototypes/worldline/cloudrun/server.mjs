import { createServer } from "node:http";
import { GoogleGenAI } from "@google/genai";

const port = Number(process.env.PORT || 8080);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://127.0.0.1:5179";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const proposalSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    rationale: { type: "string" },
    interventions: {
      type: "object",
      properties: {
        trees: { type: "integer", minimum: 2, maximum: 24 },
        shadeStructures: { type: "integer", minimum: 0, maximum: 6 },
        rainGardens: { type: "integer", minimum: 0, maximum: 8 },
        pedestrianEdge: { type: "boolean" },
      },
      required: ["trees", "shadeStructures", "rainGardens", "pedestrianEdge"],
    },
    constraints: { type: "array", items: { type: "string" } },
    mapSources: { type: "array", items: { type: "string" } },
  },
  required: ["title", "summary", "rationale", "interventions", "constraints", "mapSources"],
};

function send(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100_000) throw new Error("Request is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function createProposal(input) {
  const prompt = [
    "Design one feasible block-scale heat adaptation proposal for the supplied real location.",
    "Use Google Maps grounding to respect the actual place, street network, public transport, and nearby uses.",
    "Treat the supplied climate measurements as observed inputs, not facts to regenerate.",
    "Prioritize a continuous safe walking route. Preserve accessible curb access, emergency movement, and deliveries.",
    "Return concise language for residents, not planning jargon.",
    `Location: ${input.place}`,
    `Coordinates: ${JSON.stringify(input.coordinates)}`,
    `Observed climate: ${JSON.stringify(input.climate)}`,
    `Goal: ${input.goal}`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      responseMimeType: "application/json",
      responseJsonSchema: proposalSchema,
      temperature: 0.35,
    },
  });
  return JSON.parse(response.text);
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method !== "POST" || request.url !== "/propose") return send(response, 404, { error: "Not found" });
  try {
    const input = await readBody(request);
    if (typeof input.place !== "string" || input.place.length < 3) throw new Error("A place is required");
    if (!Number.isFinite(input.coordinates?.latitude) || !Number.isFinite(input.coordinates?.longitude))
      throw new Error("Valid coordinates are required");
    const proposal = await createProposal(input);
    send(response, 200, proposal);
  } catch (error) {
    send(response, 400, { error: error.message });
  }
}).listen(port, () => console.log(`Worldline grounding API listening on ${port}`));
