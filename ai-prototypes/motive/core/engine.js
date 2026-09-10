const fallbacks = {
  delay: {
    explain: "This delay is not isolated. It began after route planning moved traffic from Newark to Elizabeth at 14:08.",
    trace: "Likely chain: weather hold → Newark capacity rule → Elizabeth reroute → 47 late deliveries.",
    draft: "47 deliveries may arrive 25–40 minutes late after a weather reroute. Drivers are moving through Elizabeth now.",
    plan: "1. Confirm Elizabeth capacity. 2. Notify affected customers. 3. Recheck the route in 20 minutes.",
  },
  service: {
    explain: "Route Planner is healthy, but its fallback rule increased travel time while keeping error rate low.",
    trace: "The change correlates with policy release RP-184, deployed 22 minutes before latency rose.",
    draft: "Route Planner is operating normally. A fallback policy is producing slower routes, and the team is reviewing it.",
    plan: "Compare RP-184 with the prior policy, simulate rollback, then request approval before changing production.",
  },
  message: {
    explain: "The customer needs a concrete arrival window and acknowledgment, not an internal incident explanation.",
    trace: "Their order is one of 47 on the Elizabeth reroute. Last scan: Pulaski Skyway, 14:31.",
    draft: "Your delivery is moving again and should arrive between 4:10 and 4:40 PM. I’ll update you if that changes.",
    plan: "Draft the update, show the source facts, and wait for you to approve sending it.",
  },
  metric: {
    explain: "The spike is concentrated in one rerouted cohort. The rest of the network remains inside its normal range.",
    trace: "47 delayed deliveries share route rule RP-184 and the same Elizabeth transfer point.",
    draft: "Delay rate rose to 8.4% after one route cohort was diverted through Elizabeth.",
    plan: "Segment by route rule, compare before and after, then monitor the affected cohort separately.",
  },
};

let session = null;

export function modelState() {
  if (!("LanguageModel" in globalThis)) return { state: "fallback", label: "Semantic demo" };
  return { state: session ? "ready" : "available", label: session ? "Gemini Nano ready" : "Gemini Nano available" };
}

export async function enableModel(onProgress = () => {}) {
  if (!("LanguageModel" in globalThis)) return modelState();
  const availability = await LanguageModel.availability();
  if (availability === "unavailable") return { state: "fallback", label: "Model unavailable" };
  session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content:
          "You are the reasoning layer of Motive, a spatial AI cursor. Answer in two short, factual sentences. Use only supplied interface context. Never claim an action happened. Plans always stop before an external side effect.",
      },
    ],
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => onProgress(event.loaded));
    },
  });
  return modelState();
}

export async function runIntent(context, intent, onChunk = () => {}) {
  const safeContext = {
    kind: context.kind,
    label: context.label.slice(0, 80),
    detail: context.detail.slice(0, 240),
  };
  if (session) {
    const stream = session.promptStreaming(
      `Intent: ${intent}. Interface object: ${JSON.stringify(safeContext)}. Explain what matters and what the user can do next.`
    );
    let output = "";
    for await (const chunk of stream) {
      output += chunk;
      onChunk(output);
    }
    return { text: output, source: "Gemini Nano · on device" };
  }
  const text = fallbacks[context.kind]?.[intent] || `${context.label}: ${context.detail}`;
  onChunk(text);
  return { text, source: "Curated semantic fallback" };
}
