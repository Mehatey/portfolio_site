# Framecheck

Framecheck is a human-in-the-loop AI evaluation workspace for creator video. It demonstrates a workflow, not an AI-themed interface:

1. Register a public YouTube URL, local upload, or Cloud Storage URI.
2. Gemini maps scenes, speech, claims, captions, and salient timestamps.
3. A configurable rubric evaluates brief alignment, pacing, accessibility, safety, and factual support.
4. Every finding includes evidence and confidence.
5. A human accepts, dismisses, or corrects the finding before approving a release.

The static portfolio prototype contains representative evaluation data and interactive states. The `cloudrun` directory documents the production API boundary. No secret is shipped to the browser.

## Why this belongs in the portfolio

The project fills a specific gap between Siddharth's existing enterprise UX, AR, spatial computing, and AI experimentation:

- AI evaluation and annotation workflows
- Multimodal video understanding
- Data-heavy interface design
- Probabilistic output and uncertainty
- Human oversight and responsible release decisions
- Google AI Studio and Google Cloud deployment literacy

These skills map directly to current roles across Apple AI/ML tools, Gemini product design, Google Cloud AI UX, and YouTube creator tooling.

## Google workflow

- Prototype prompts and structured JSON in Google AI Studio.
- Use Gemini video understanding with a YouTube URL or file reference.
- Return timestamped findings through a Cloud Run API.
- Store evaluation runs and human decisions in Firestore.
- Move mature rubrics to Vertex AI's generative AI evaluation service.
- Compare model scores against human ratings before trusting the judge.

## Sources

- [Apple Senior Product Designer, AI/ML Tools](https://jobs.apple.com/en-us/details/200657699/senior-product-designer-ui-ux-ai-ml-tools)
- [Google Staff AI Product Designer, Gemini Assistant](https://www.google.com/about/careers/applications/jobs/results/142352814872371910-staff-ai-product-designer-gemini-assistant-deepmind)
- [YouTube Emerging Experience and Community UX](https://www.google.com/about/careers/applications/jobs/results/111747046498542278-senior-director-ux-youtube-emerging-experience-and-community)
- [Gemini video understanding](https://ai.google.dev/gemini-api/docs/video-understanding)
- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Vertex AI generative AI evaluation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs)
- [Google Design, Simulating Intelligence](https://design.google/library/simulating-intelligence)

## Local preview

From the repository root:

```bash
ruby -run -e httpd . -p 5179
```

Open `http://127.0.0.1:5179/ai-prototypes/framecheck/`.
