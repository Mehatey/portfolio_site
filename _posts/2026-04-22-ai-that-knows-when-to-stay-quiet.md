---
layout: post
title: designing an AI that knows when to stay quiet
date: 2026-04-22
description: what I learned wiring claude and elevenlabs into a meditation app, and why most AI products talk too much.
tags: ai design voice
categories: essays
related_posts: false
---

The hardest part of building a voice AI is not the model. The model is, at this point, almost embarrassingly good. The hardest part is teaching it when to shut up.

I spent the spring putting an AI guide inside a meditation app. The user wears a headset, sits down, and an AI voice walks them through a breathing practice, a body scan, a moment of stillness. Under the hood it is Claude generating the script, ElevenLabs voicing it, a small state machine deciding when to pause and listen. The technical part took two weeks. The design part took four months.

Almost every default the modern AI stack gives you is wrong for this kind of work.

The first default is helpfulness. Chat models are trained to answer. Ask one a question and it will, with great cheerfulness, produce three paragraphs. For a chat interface this is fine. For a voice inside someone's head, in a room they came to in order to be alone, three paragraphs is a violation. I had to write the prompt as a refusal: do not explain, do not summarize, do not offer alternatives, do not ask if there is anything else you can help with. The model wanted to be a concierge. I needed it to be a presence.

The second default is fluency. Modern TTS is shockingly good at sounding human, which is exactly the problem. A perfectly fluent voice telling you to "take a deep breath now" feels like an ad. The voice has to stumble a little. It has to leave space. Real teachers pause before the important word, not after. They mumble sometimes. They say "okay" three times before they say the thing they came to say. None of that is in the default model output. You have to write it in by hand, beat by beat, and trust that the imperfection is the design.

The third default is responsiveness. Every AI product I have shipped has been optimized for time to first token. Lower latency, faster reply, snappier feel. In a meditation context, latency is the product. If the AI replies the instant you stop talking, it feels like a robot. If it waits four seconds, breathes once, then speaks, it feels like a person who was actually listening. I ended up writing a deliberate delay into the response pipeline. A latency bug, on purpose, that ships.

The fourth default is memory. The current industry obsession is making AI remember everything about you across sessions. For a meditation app this is poison. The user is here to forget, briefly, who they are. An AI that opens with "welcome back, last time we worked on your anxiety about the job interview" would be a horror movie. The model is allowed to remember the last sixty seconds, and then it lets go. The whole experience is designed around forgetting.

The fifth default, and the one that took me longest to see, is the assumption that more interaction is better. AI products grade themselves on engagement. Time on app, messages exchanged, return rate. The meditation app grades itself on the opposite: the longer the user is silent, the better the session is going. If the AI is talking, something has failed. The KPI is its own absence.

I think a lot of the discomfort people have with AI right now is that they are meeting it through products built by teams optimizing for engagement metrics from the social media era. They are getting a slot machine wearing a friend's face. It is not the model's fault. The model will be whatever you ask it to be. The product around it is the actual design decision, and most of the products being shipped in 2026 are asking the model to perform helpfulness theater.

There is a different product possible. One where the AI is small, specific, and most of the time absent. Where it has the discipline to disappear after it has done its job. Where the measure of quality is how rarely you noticed it was there.

That product does not look like a chatbot. It barely looks like AI at all. It looks like a room that knew what you needed before you walked into it, and then quietly stepped out.
