import { createServer } from "node:http";

const port = Number(process.env.PORT || 8080);
const apiKey = process.env.GEMINI_API_KEY;
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://127.0.0.1:5179";

const rubricSchema = {
  type: "object",
  properties: {
    overallScore: { type: "number", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestamp: { type: "string" },
          criterion: { type: "string" },
          severity: { type: "string", enum: ["pass", "low", "medium", "high"] },
          finding: { type: "string" },
          evidence: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["timestamp", "criterion", "severity", "finding", "evidence", "confidence"],
      },
    },
  },
  required: ["overallScore", "summary", "findings"],
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

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100_000) throw new Error("Request exceeds 100KB metadata limit");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function evaluateVideo({ videoUri, brief, criteria }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const prompt = [
    "Act as an evidence-first creative QA reviewer.",
    "Evaluate the supplied video against the brief and criteria.",
    "Cite visible or audible evidence with MM:SS timestamps.",
    "Never turn uncertainty into a fact. Flag unsupported claims.",
    "The score is advisory. A human makes the release decision.",
    `Creative brief: ${brief}`,
    `Criteria: ${criteria.join(", ")}`,
  ].join("\n");

  const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      model: "gemini-3.7-flash",
      input: [
        { type: "video", uri: videoUri },
        { type: "text", text: prompt },
      ],
      response_format: { type: "json_schema", json_schema: { name: "framecheck_evaluation", schema: rubricSchema } },
    }),
  });

  if (!geminiResponse.ok) {
    const detail = await geminiResponse.text();
    throw new Error(`Gemini request failed (${geminiResponse.status}): ${detail.slice(0, 400)}`);
  }

  const result = await geminiResponse.json();
  const outputText = result.output_text || result.steps?.flatMap((step) => step.content || []).find((part) => part.text)?.text;
  if (!outputText) throw new Error("Gemini returned no structured evaluation");
  return JSON.parse(outputText);
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method !== "POST" || request.url !== "/evaluate") return send(response, 404, { error: "Not found" });

  try {
    const body = await readJson(request);
    if (typeof body.videoUri !== "string" || !/^https:\/\//.test(body.videoUri)) throw new Error("videoUri must be an HTTPS URL");
    if (typeof body.brief !== "string" || body.brief.length < 10) throw new Error("brief must contain at least 10 characters");
    const criteria = Array.isArray(body.criteria) ? body.criteria.slice(0, 12).map(String) : [];
    const evaluation = await evaluateVideo({ videoUri: body.videoUri, brief: body.brief.slice(0, 5000), criteria });
    send(response, 200, evaluation);
  } catch (error) {
    send(response, 400, { error: error.message });
  }
}).listen(port, () => console.log(`Framecheck API listening on ${port}`));
