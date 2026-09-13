const fs = require("fs");
process.chdir(__dirname);
const pic = (src, label, detail = "") => ({ src, label, detail });
const piece = (id, type, title, deck, items, extra = {}) => ({ id, type, title, deck, items, ...extra });
const film = (id, title, deck, clips) => piece(id, "film", title, deck, [], { clips });
const clip = (src, start, duration, label) => ({ src, start, duration, label });
const project = (slug, title, color, bg, ink, problem, change, pieces) => ({ slug, title, color, bg, ink, problem, change, pieces });
const P = [];
P.push(
  project(
    "m-health-fairview",
    "M Health Fairview",
    "#82162c",
    "#fafafa",
    "#231c20",
    "The opening reads as a pitch deck. Dense research slides and an oversized 3D impact poster obscure the decision that changed the product.",
    "Replace the first five slides with a patient question, a readable audit and the urgency model. Keep the impact evidence in the same visual language.",
    [
      piece("care-question", "diagram", "Where should I start?", "A patient should not need to understand the health system before choosing care.", [
        pic("assets/img/fairview/03-audit.webp", "Too many overlapping routes", "eVisit, virtual urgent care and in-person options compete."),
        pic("output/image-review-2026-09-07/round-4/layers/fairview-ui.png", "One starting decision", "Get Care Today or Schedule Your Care."),
      ]),
      piece(
        "audit",
        "plate",
        "Three things made choosing harder.",
        "A closer reading of the existing Get Care page.",
        [pic("assets/img/fairview/03-audit.webp", "Existing experience")],
        {
          notes: [
            "Long explanations push action down.",
            "Emergency Care promises more than its destination provides.",
            "Two scheduling links lead to the same provider list.",
          ],
        }
      ),
      piece("constraints", "matrix", "Two sprints. A fixed API. No patient access.", "The constraints shaped the method and the scope.", [
        { label: "Two sprints", detail: "Focus the first fold on a clear care choice." },
        { label: "Third-party API", detail: "Work with the available scheduling routes." },
        { label: "No patient access", detail: "Use the heuristic audit and secondary research. Do not present this as patient-tested." },
      ]),
      film("care-in-motion", "From care discovery to a clear route.", "Edited original interface recording. No reconstructed screens.", [
        clip("assets/img/fairview/07-choose.mp4", 1, 6, "Choose care"),
        clip("assets/img/fairview/11-assistant.mp4", 2, 6, "Guided help"),
      ]),
      piece(
        "impact",
        "impact",
        "Make the evidence easier to read.",
        "Reported in the supplied project deck. These describe the broader scheduling experience; attribution to this two-sprint redesign is not isolated.",
        [
          { label: "$13.6M+", detail: "Revenue generated through scheduling" },
          { label: "22%", detail: "Increase in e-visits" },
          { label: "32%", detail: "Increase in new patients scheduling" },
        ],
        { source: "assets/img/fairview/13-impact.webp" }
      ),
      piece(
        "compare-care",
        "plate",
        "Compare before committing.",
        "Cost, wait and what each care type treats belong in one comparison.",
        [pic("assets/img/fairview/09-comparison.webp", "Original care comparison")],
        { notes: ["Comparable fields across care types.", "Eligibility details stay available.", "The next step remains visible."] }
      ),
    ]
  )
);
P.push(
  project(
    "marriott",
    "Marriott Bonvoy SPOG",
    "#b7863d",
    "#191816",
    "#f6f3ee",
    "The UI is strong, but the page moves between specifications and final screens without explaining the associate’s shift.",
    "Lead with the work an associate needs to do. Pair each screen with the decision it supports.",
    [
      piece("shift", "diagram", "A whole shift, in one place.", "The employee dashboard groups daily operations around work at the desk.", [
        pic("assets/img/marriott/04-overview-poster.jpg", "Read the day", "Arrivals, departures, occupancy"),
        pic("assets/img/marriott/05-flow-poster.jpg", "Watch what needs attention", "Reservation flow, cases and events"),
        pic("assets/img/marriott/06-enroll-poster.jpg", "Help the guest", "Bonvoy membership and enrolment"),
      ]),
      film("operations", "Read the day. Find the exception.", "Two original dashboard recordings, edited as one task sequence.", [
        clip("assets/img/marriott/04-overview.mp4", 0, 5, "Daily overview"),
        clip("assets/img/marriott/05-flow.mp4", 0, 6, "Flow and cases"),
      ]),
      film("enrolment", "Keep enrolment inside the work.", "Original membership and modal recordings.", [
        clip("assets/img/marriott/06-enroll.mp4", 0, 5, "Membership and benefits"),
        clip("assets/img/marriott/08-enrollmodal.mp4", 1, 6, "Enrol without losing context"),
      ]),
      piece(
        "hierarchy",
        "plate",
        "Density needs a hierarchy.",
        "A restrained palette lets exceptions carry more weight.",
        [pic("assets/img/marriott/03-spec.webp", "Original dashboard specification")],
        { notes: ["Time-sensitive information reads first.", "Detail sits below the overview.", "Strong colour is reserved for attention."] }
      ),
      piece(
        "handoff",
        "application",
        "Carry the shift forward.",
        "Proposed application: a handover summary drawn from existing dashboard categories.",
        [
          { label: "Occupancy and arrivals", detail: "Begin with the state of the property." },
          { label: "Open cases", detail: "Keep unresolved work visible to the next associate." },
          { label: "Events and departures", detail: "Carry forward what is coming next." },
        ],
        { src: "assets/img/marriott/05-flow-poster.jpg", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "mool",
    "Mool",
    "#50b55e",
    "#303778",
    "#ffffff",
    "The visual system is memorable, but the page does not explain how folk-art richness coexists with financial clarity.",
    "Show the identity in motion, then zoom into actual interface decisions. Make the audience and the proposed low-bandwidth direction concrete.",
    [
      piece("identity", "logo", "Roots, in motion.", "Motion study using the original Mool identity.", [pic("5.mool/1.jpg", "Original identity")], {
        logo: "5.mool/1.jpg",
        motion: "mool",
      }),
      piece(
        "two-voices",
        "comparison",
        "Rich surroundings. Plain numbers.",
        "The visual language carries belonging; amounts and dates carry trust.",
        [
          pic("5.mool/2.1.webp", "Cultural vocabulary", "Regional colour, motifs and illustration"),
          pic(
            "output/image-review-2026-09-07/round-2/layers/mool-plans-source.png",
            "Financial clarity",
            "Amounts, dates and progress remain explicit"
          ),
        ]
      ),
      piece("goals", "triptych", "A balance becomes a plan.", "Read the existing screens as a financial journey.", [
        pic("5.mool/7.webp", "A personal question", "Can I send my kid to their dream school?"),
        pic("5.mool/8.webp", "A visible path", "Goals sit alongside amounts and dates."),
        pic("5.mool/9.webp", "A future made concrete", "Can I buy a home in this city?"),
      ]),
      piece(
        "familiar",
        "matrix",
        "Designed for interface literacy.",
        "The original case describes the challenge as learning an interface, not learning what money means.",
        [
          { label: "One decision at a time", detail: "Pace the journey for first-time smartphone use." },
          { label: "Explicit confirmation", detail: "Show that an action has completed." },
          { label: "Visible controls", detail: "Avoid requiring a discovered gesture." },
        ]
      ),
      piece(
        "low-data",
        "application",
        "Keep the money visible on a slow connection.",
        "Proposed next iteration: a low-bandwidth mode for the existing interface.",
        [
          { label: "Load first", detail: "Amounts, dates, labels and actions." },
          { label: "Load later", detail: "Large illustrations and decorative imagery." },
          { label: "Keep the identity", detail: "Colour and the original wordmark survive the lighter view." },
        ],
        { src: "output/image-review-2026-09-07/round-2/layers/mool-plans-source.png", concept: true }
      ),
      piece(
        "first-use",
        "application",
        "A guide that can leave the screen.",
        "Proposed application: a printed first-use foldout for a supported introduction to Mool.",
        [
          { label: "Know where you are", detail: "Read the balance and current plan." },
          { label: "Look ahead", detail: "Find a goal and its target date." },
          { label: "Return with confidence", detail: "Keep the same labels in print and in the app." },
        ],
        { src: "5.mool/2.1.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "naavo",
    "Naavo",
    "#d09129",
    "#073d36",
    "#fffdf2",
    "The brand system is strong, but many similar packaging shots dilute the relationship between doshas, shapes and product choice.",
    "Lead with the logic of the identity, show the product family once, then add a distinct new application.",
    [
      piece(
        "identity",
        "logo",
        "A family inside one mark.",
        "Motion study using the original identity.",
        [pic("7.naavo/1.png", "Original Naavo identity")],
        { logo: "7.naavo/1.png", motion: "naavo" }
      ),
      piece("shape-language", "comparison", "From dosha to form.", "The existing construction connects the three doshas to a single human figure.", [
        pic("7.naavo/6.webp", "Identity construction"),
        pic("7.naavo/4.2.webp", "Pattern exploration"),
      ]),
      piece("family", "triptych", "One system, different products.", "Compare the existing applications at the same visual scale.", [
        pic("7.naavo/13.3 solo.webp", "Oils"),
        pic("7.naavo/17.1.webp", "Incense"),
        pic("7.naavo/18.1.webp", "Creams and oils"),
      ]),
      piece(
        "guided-choice",
        "plate",
        "A guided way into the range.",
        "The original mobile concept connects a profile to product discovery.",
        [pic("7.naavo/12.webp", "Original guided product app")],
        { notes: ["Start with the existing profile flow.", "Keep the product family recognisable.", "Make discovery feel connected to the pack."] }
      ),
      piece(
        "travel",
        "generated",
        "A ritual, packed for a shorter stay.",
        "Proposed application: a compact travel presentation for the existing product family.",
        [],
        { concept: true, generated: "naavo-travel" }
      ),
      piece(
        "shelf-guide",
        "application",
        "Let the shelf explain the system.",
        "Proposed application: a compact shelf guide built from the existing shapes and names.",
        [
          { label: "Vata", detail: "Use the existing teal family." },
          { label: "Pitta", detail: "Use the existing red family." },
          { label: "Kapha", detail: "Use the existing ochre family." },
        ],
        { src: "7.naavo/6.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "aananda",
    "Aananda",
    "#87a44b",
    "#fafaf6",
    "#292820",
    "App, book and temple print arrive as separate galleries, so the shared philosophy and visual language become hard to follow.",
    "Connect the cultural source to the visual system, then show how one idea moves between learning formats.",
    [
      piece(
        "identity",
        "logo",
        "A quieter introduction.",
        "Motion study using the original Aananda wordmark.",
        [pic("9.aananda/1.png", "Original Aananda identity")],
        { logo: "9.aananda/1.png", motion: "aananda" }
      ),
      piece(
        "source-to-form",
        "triptych",
        "A source, a language, a page.",
        "Jain philosophy and temple references become a consistent learning system.",
        [
          pic("9.aananda/4.webp", "Cultural references"),
          pic("9.aananda/2.webp", "Identity development"),
          pic("9.aananda/14.webp", "Ahimsa, in the book"),
        ]
      ),
      piece(
        "learning",
        "comparison",
        "Teachers and students share a place.",
        "The original app brings learning, conversations and community into the same visual language.",
        [pic("9.aananda/6.webp", "Learning and events"), pic("9.aananda/9.webp", "Conversation and profile")]
      ),
      piece("book-sequence", "sequence", "One book, several entry points.", "An editorial sequence through the original spreads.", [
        pic("9.aananda/14.webp", "Ahimsa"),
        pic("9.aananda/15.1.webp", "A different chapter"),
        pic("9.aananda/17.1.webp", "The visual system continues"),
      ]),
      piece(
        "learning-kit",
        "generated",
        "Carry a question into the next conversation.",
        "Proposed application: a reading kit with a bookmark and discussion cards derived from existing print work.",
        [],
        { concept: true, generated: "aananda-kit" }
      ),
    ]
  )
);
P.push(
  project(
    "alpha-stockathon",
    "Alpha Stockathon",
    "#ffe444",
    "#0b202b",
    "#f3f5ed",
    "The long screen archive delays the learning mechanic. A viewer sees a game before understanding how it teaches.",
    "Make the decision and consequence loop visible first. Put character, economy and reward screens in supporting roles.",
    [
      piece("learning-loop", "diagram", "Learn by making a choice.", "The game turns a financial concept into a visible consequence.", [
        pic("10.alpha/27.3.webp", "Meet a challenge"),
        pic("10.alpha/29.1.webp", "See one consequence"),
        pic("10.alpha/29.2.webp", "Read the feedback"),
      ]),
      piece(
        "characters",
        "plate",
        "Characters carry the lesson.",
        "The existing cast gives information and conflict a place in the world.",
        [pic("10.alpha/5.webp", "Stock Baba, the Dragon and the Hero")],
        { notes: ["A guide introduces the world.", "A challenge creates a reason to act.", "The player learns through the journey."] }
      ),
      piece("consequence", "sequence", "Feedback belongs in the world.", "A motion comparison of the original wrong and correct states.", [
        pic("10.alpha/29.1.webp", "Wrong state"),
        pic("10.alpha/29.2.webp", "Correct state"),
      ]),
      piece(
        "economy",
        "plate",
        "Keep the economy readable.",
        "The dashboard makes progress and resources available outside the moment of play.",
        [pic("10.alpha/21.webp", "Original player dashboard")],
        {
          notes: [
            "Portfolio and resources stay explicit.",
            "Progress is visible beside the player identity.",
            "The game world and account view use the same vocabulary.",
          ],
        }
      ),
      piece(
        "challenge-cards",
        "application",
        "Bring the challenge to a group.",
        "Proposed application: classroom discussion cards using the existing game characters.",
        [
          { label: "Choose", detail: "Discuss the options in a scenario." },
          { label: "Commit", detail: "Explain the decision before seeing the answer." },
          { label: "Reflect", detail: "Compare the reasoning with the game feedback." },
        ],
        { src: "10.alpha/5.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "encoded",
    "Encoded",
    "#d6e15a",
    "#121311",
    "#f4f5ef",
    "The work has strong capture and AR footage, but repeated silent clips make the technical contribution hard to read.",
    "Present capture, localisation and activation as one pipeline. Keep artist interpretation separate from the technical role.",
    [
      film("pipeline-film", "From gallery capture to AR activation.", "Original project footage, edited into a clear technical sequence.", [
        clip("1.met/2.mp4", 1, 4, "Capture the gallery"),
        clip("1.met/5.mp4", 1, 4, "Align the work"),
        clip("1.met/8.mp4", 1, 5, "Activate the interpretation"),
      ]),
      piece("pipeline", "diagram", "Make the spatial pipeline visible.", "Siddharth’s contribution: on-site capture and spatial deployment.", [
        { label: "Polycam capture", detail: "Scan artworks and gallery context on a phone." },
        { label: "Visual positioning", detail: "Localise against the space through Niantic Lightship VPS." },
        { label: "AR activation", detail: "Register the artist’s interpretation to the physical work." },
      ]),
      piece(
        "alignment",
        "triptych",
        "Alignment is part of the experience.",
        "Original views connect the physical gallery to the registered overlay.",
        [pic("1.met/4.mp4", "Captured forms"), pic("1.met/5.mp4", "Physical and digital alignment"), pic("1.met/6.mp4", "Deployment view")]
      ),
      piece(
        "visitor",
        "diagram",
        "The technology serves a different reading.",
        "The exhibition reinterprets the American Wing through contemporary Indigenous perspectives.",
        [pic("1.met/7.mp4", "Open the experience"), pic("1.met/8.mp4", "Encounter the interpretation"), pic("1.met/10.mp4", "Return to the artwork")]
      ),
      piece(
        "durability",
        "application",
        "Design for the day the gallery changes.",
        "Proposed next application: a maintenance view for a location-dependent exhibition.",
        [
          { label: "Check the location", detail: "Has the artwork or gallery arrangement changed?" },
          { label: "Check alignment", detail: "Does the overlay still register where intended?" },
          { label: "Recapture when needed", detail: "Treat a changing VPS map as a maintenance dependency." },
        ],
        { src: "1.met/5.mp4", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "mandalas",
    "Bloom; who are you",
    "#b5a7ed",
    "#151119",
    "#f7f3fb",
    "The installation, EEG experiments, pixel game and visual studies blur into one long archive. Their roles and maturity are unclear.",
    "Separate the core encounter, the responsive system and earlier studies. Show measurement as documentation, not proof of a health outcome.",
    [
      film("encounter", "The room is part of the interface.", "Original installation footage connects arrival, light and the guided encounter.", [
        clip("4.mandala/final-walking.mp4", 1, 4, "The world outside"),
        clip("4.mandala/13.2.mp4", 1, 4, "The room"),
        clip("4.mandala/ab.mp4", 1, 5, "The visual encounter"),
      ]),
      piece("system", "diagram", "Movement influences a slower system.", "A conceptual explanation of the interaction described in the case study.", [
        { label: "Body tracking", detail: "MediaPipe reads movement." },
        { label: "Generative system", detail: "TouchDesigner changes the mandala over time." },
        { label: "Room-scale output", detail: "Projection and sound shape the encounter." },
      ]),
      piece(
        "conditions",
        "comparison",
        "The same work needs the right room.",
        "Existing experiments show why lighting and physical conditions matter.",
        [pic("4.mandala/13.1.webp", "Room documentation"), pic("4.mandala/12.1.mp4", "Material and reflection study")]
      ),
      film("identity-motion", "The identity opens into the visual world.", "Edited original logo and mandala footage.", [
        clip("4.mandala/k1.mp4", 0, 4, "Bloom"),
        clip("4.mandala/ma2.mp4", 1, 5, "Generative form"),
      ]),
      piece(
        "longer-stay",
        "application",
        "Give a longer encounter somewhere to go.",
        "Proposed next iteration, based on the reflection in the case study.",
        [
          { label: "Arrive", detail: "One question and a quiet beginning." },
          { label: "Stay", detail: "Slower visual structure becomes perceptible over time." },
          { label: "Leave", detail: "An intentional end without a score or task to finish." },
        ],
        { src: "4.mandala/ma34.mp4", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "bloom",
    "Bodhi on Vision Pro",
    "#8cc8ad",
    "#10231c",
    "#f1f8ef",
    "The headset footage proves a build, but the relationship between the person in the room, gaze and the internal view needs a clearer bridge.",
    "Show paired perspectives and explain the spatial decisions before the scene archive.",
    [
      film("encounter", "A person, a tree, a conversation.", "Edited original visitor and headset recordings.", [
        clip("15.bloom-vp/visitor-1.mp4", 1, 4, "In the room"),
        clip("15.bloom-vp/tree.mp4", 1, 5, "Inside the headset"),
      ]),
      piece(
        "distance",
        "diagram",
        "Distance changes the relationship.",
        "The case study places the tree at roughly two metres, at conversational rather than monumental scale.",
        [
          { label: "A person in a room", detail: "A seated encounter rather than an audience position." },
          { label: "Roughly two metres", detail: "The stated spatial design target." },
          { label: "A conversational presence", detail: "Voice and attention carry the exchange." },
        ]
      ),
      piece("inputs", "triptych", "Attention, voice and a mark in space.", "Three ways the existing experience lets someone remain present.", [
        pic("15.bloom-vp/gaze.mp4", "Look"),
        pic("15.bloom-vp/tree.mp4", "Listen and respond"),
        pic("15.bloom-vp/vp-21.mp4", "Draw in space"),
      ]),
      film("drawing", "The answer can take a spatial form.", "A focused edit of the original drawing interaction.", [
        clip("15.bloom-vp/vp-21.mp4", 3, 8, "Drawing inside the existing experience"),
      ]),
      piece(
        "recovery",
        "application",
        "A patient interface still needs a way back.",
        "Proposed recovery direction for the unresolved problem named in the reflection.",
        [
          { label: "Acknowledge", detail: "Make a missed exchange perceptible." },
          { label: "Offer a choice", detail: "Allow repetition or a pause without breaking the tone." },
          { label: "Make leaving clear", detail: "A quiet exit remains available." },
        ],
        { src: "15.bloom-vp/tree.mp4", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "mind-your-feelings",
    "Mind Your Feelings",
    "#9d69d3",
    "#e9f2f3",
    "#292333",
    "The installation photographs are compelling, but the developer contribution sits mainly in prose.",
    "Make the input-to-light connection and the software/hardware bridge visible. Preserve team attribution.",
    [
      film("response", "Draw a feeling. See the brain respond.", "Continuous original kiosk recording, edited for the interaction.", [
        clip("6.mindu/kiosk2.mp4", 0, 7, "Touchscreen input to sculpture response"),
      ]),
      piece(
        "bridge",
        "diagram",
        "The work between the touchscreen and the light.",
        "Siddharth’s developer role connects the web interface to the responsive sculpture.",
        [
          { label: "Web interface", detail: "A visitor chooses and draws." },
          { label: "Python bridge", detail: "The input is passed to the hardware system." },
          { label: "WLED / Arduino", detail: "The sculpture responds with colour." },
        ]
      ),
      piece("journey", "triptych", "The visitor can understand the response.", "Original touchscreen documentation.", [
        pic("6.mindu/kiosk1.mp4", "Choose a feeling"),
        pic("6.mindu/kiosk2.mp4", "Map it on the body"),
        pic("6.mindu/kiosk3.mp4", "See the result"),
      ]),
      piece(
        "footprint",
        "plate",
        "A public interface has a physical shape.",
        "The touchscreen and brain form one readable installation.",
        [pic("6.mindu/1.webp", "Original installation object")],
        { notes: ["Input stays within reach.", "The response is visible to others.", "The library setting gives the interaction a shared context."] }
      ),
      piece(
        "takeaway",
        "application",
        "Let the question travel beyond the kiosk.",
        "Proposed application: a small take-home prompt card, not a diagnostic result.",
        [
          { label: "Notice", detail: "What are you feeling right now?" },
          { label: "Locate", detail: "Where do you feel it in your body?" },
          { label: "Reflect", detail: "Has it changed since you arrived?" },
        ],
        { src: "6.mindu/0.2.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "ai-self",
    "AI Self",
    "#8ab8e9",
    "#141b29",
    "#f2f4fb",
    "Three different research phases look like one product. Concept work and built VR footage need clearer boundaries.",
    "Give each phase its own question and evidence. Label Chaise as a concept.",
    [
      piece("three-arcs", "triptych", "Three questions, three forms of evidence.", "A research arc, not one continuous shipped product.", [
        pic("2.ai-self/2.webp", "AI perception", "What does a model notice?"),
        pic("2.ai-self/13.webp", "AR companion concept", "When does presence become intrusion?"),
        pic("2.ai-self/21.webp", "VR world study", "What would an AI inherit from us?"),
      ]),
      piece(
        "perception",
        "plate",
        "Pattern is not the same as meaning.",
        "The original Cloud Vision experiment makes the gap visible.",
        [pic("2.ai-self/2.webp", "Original experiment output")],
        {
          notes: [
            "The input is a personal photograph.",
            "The output names detected patterns.",
            "The design question concerns what is worth noticing.",
          ],
        }
      ),
      film("chaise", "A companion, imagined alongside you.", "Original AR concept walkthrough. This is concept footage, not a live AR build.", [
        clip("2.ai-self/14.1.mp4", 4, 9, "Chaise · concept walkthrough"),
      ]),
      film("vr", "An AI assembles a world from what it inherited.", "Edited original VR study footage.", [
        clip("2.ai-self/19.mp4", 2, 4, "Arrival"),
        clip("2.ai-self/23.mp4", 1, 4, "Inherited media"),
        clip("2.ai-self/26.mp4", 1, 4, "A world of fragments"),
      ]),
      piece(
        "boundaries",
        "application",
        "Presence needs boundaries.",
        "Proposed companion interaction policy, extending the research question.",
        [
          { label: "Invited", detail: "Respond when the person asks." },
          { label: "Uncertain", detail: "Make uncertainty visible rather than guessing confidently." },
          { label: "Unwanted", detail: "Let the person pause or dismiss the presence." },
        ],
        { src: "2.ai-self/13.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "b-plus-b",
    "Broken and Beautiful",
    "#9cd8bb",
    "#172323",
    "#f3faf4",
    "The physical stand, online interface and interviews are separate blocks. The simple public invitation gets lost in the production archive.",
    "Connect invitation, contribution and shared reading, then show the making.",
    [
      piece(
        "invitation",
        "plate",
        "One question is enough to begin.",
        "What feels beautiful, and what feels broken?",
        [pic("5.bb/board1.3.webp", "Original public invitation")],
        {
          notes: [
            "A familiar public sign becomes an invitation.",
            "The prompt allows a personal answer.",
            "Participation can continue through the online interface.",
          ],
        }
      ),
      film("making", "Build it. Place it. See who stops.", "Original making and placement footage. No generated participants.", [
        clip("5.bb/board2.1.mp4", 1, 4, "Build the stand"),
        clip("5.bb/board4.mp4", 1, 4, "Place it in public"),
        clip("5.bb/board7.mp4", 1, 4, "Adjust the encounter"),
      ]),
      film("response", "The invitation continues on a phone.", "Edited original interface and response recordings.", [
        clip("5.bb/d2.mp4", 6, 5, "An answer begins"),
        clip("5.bb/d5.mp4", 1, 5, "Responses become visible"),
      ]),
      piece(
        "entry-points",
        "diagram",
        "Different entry points, one question.",
        "The existing print experiments connect the street to the same online space.",
        [pic("5.bb/d4.webp", "Encounter a poster"), pic("5.bb/d2.mp4", "Write an answer"), pic("5.bb/d5.mp4", "Read what others shared")]
      ),
      piece(
        "pocket-card",
        "application",
        "An invitation you can keep.",
        "Proposed application: a pocket response card with space to answer privately before sharing.",
        [
          { label: "Beautiful", detail: "What feels beautiful to you today?" },
          { label: "Broken", detail: "What feels broken to you today?" },
          { label: "Your choice", detail: "Keep it, share it, or return to it later." },
        ],
        { src: "5.bb/branding.webp", concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "cube-guy",
    "Cube of Creations",
    "#d5b563",
    "#111c21",
    "#f7f4df",
    "The character’s continuity is the strongest idea, but a very long film and game archive makes it hard to see that continuity.",
    "Use a character-first edit to connect paper, film and play. Keep chronological detail in the archive.",
    [
      piece("continuity", "triptych", "The medium changed. The character stayed.", "An existing character world across drawing, film and games.", [
        pic("2.cube/conception/7.3.jpg", "On paper"),
        pic("2.cube/short film hd/0.webp", "In film"),
        pic("2.cube/3d/3.1.webp", "In a playable world"),
      ]),
      film("dimension", "A square gains another dimension.", "Edited original film and 3D footage.", [
        clip("2.cube/short film hd/6.1.mp4", 0, 4, "A story in film"),
        clip("2.cube/3d/1.mp4", 1, 4, "Forms become three dimensional"),
        clip("2.cube/3d/13.mp4", 1, 4, "The world becomes playable"),
      ]),
      film("game", "A character becomes something you can play.", "Edited original 2D game footage.", [
        clip("2.cube/2d/1.mp4", 0, 4, "Enter the world"),
        clip("2.cube/2d/8.mp4", 1, 4, "Move through it"),
        clip("2.cube/2d/11.mp4", 1, 4, "Encounter Doubt"),
      ]),
      piece(
        "mechanics",
        "diagram",
        "Personal questions become game structure.",
        "The existing game turns distractions and doubt into things to encounter.",
        [
          { label: "Personalisation", detail: "The opening asks who the player is." },
          { label: "Distractions", detail: "Familiar things become obstacles." },
          { label: "Doubt", detail: "The journey culminates in a boss encounter." },
        ]
      ),
      piece(
        "character-sheet",
        "application",
        "A character sheet that can leave the archive.",
        "Proposed application: a foldout companion to a screening or playable installation.",
        [
          pic("2.cube/conception/6.2.webp", "Early character vocabulary"),
          pic("2.cube/2d/3.1.webp", "Playable variations"),
          pic("2.cube/3d/3.1.webp", "The dimensional character"),
        ],
        { concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "shot-on-iphone",
    "Shot on iPhone",
    "#c22928",
    "#f6f6f4",
    "#202020",
    "The page repeats landscape posters while the interaction that makes the project distinct appears only once.",
    "Explain the image-to-story transition first, then use a tighter photographic edit and new print applications.",
    [
      piece("interaction", "diagram", "The image is the beginning.", "A self-initiated response to the campaign format, not an Apple commission.", [
        pic("8.shotoniphone/3.webp", "See the photograph"),
        pic("8.shotoniphone/4.webp", "Scan into its story"),
      ]),
      piece("photo-edit", "sequence", "Three frames, three different questions.", "A short editorial sequence through existing photographic work.", [
        pic("8.shotoniphone/3.webp", "Escapism"),
        pic("8.shotoniphone/8.webp", "Happiness"),
        pic("8.shotoniphone/11.webp", "Nature"),
      ]),
      piece(
        "story-layer",
        "plate",
        "Show what happens after the scan.",
        "The original interface makes room for the photographer’s intention and other people’s thoughts.",
        [pic("8.shotoniphone/4.webp", "Original story interface")],
        { notes: ["Read the intention behind the frame.", "See other thoughts on the topic.", "Record a response."] }
      ),
      piece(
        "zine",
        "generated",
        "A sequence you can hold.",
        "Proposed application: a small photo zine that pairs existing images with their story prompts.",
        [],
        { concept: true, generated: "shot-zine" }
      ),
      piece(
        "story-cards",
        "application",
        "Give a frame room for a reply.",
        "Proposed application: a set of take-away photo cards with a question on the reverse.",
        [pic("8.shotoniphone/8.webp", "Happiness"), pic("8.shotoniphone/10.webp", "Emotions"), pic("8.shotoniphone/11.webp", "Nature")],
        { concept: true }
      ),
    ]
  )
);
P.push(
  project(
    "illustrations",
    "Illustrations",
    "#f1b632",
    "#1c191a",
    "#faf5ec",
    "Independent series blend into one visual archive. Apna Adda’s explorations are easy to mistake for the selected identity.",
    "Name each series, show the final identity separately, and turn selected work into motion and concrete applications.",
    [
      film("music", "A visual diary can move.", "A focused edit of the existing music illustration film.", [
        clip("11.illu/2.mp4", 0, 5, "Music illustrations"),
        clip("11.illu/4.mp4", 1, 5, "An evolving visual vocabulary"),
      ]),
      piece("reminiscence", "sequence", "A typeface made from a visual idea.", "Motion study through the original Reminiscence material.", [
        pic("11.illu/22.1.png", "The underlying rhythm"),
        pic("11.illu/22.2.webp", "The letterforms"),
        pic("11.illu/23.1.webp", "The type in use"),
      ]),
      piece(
        "apna-identity",
        "logo",
        "The selected identity, clearly separated.",
        "Motion study extracted from the final Apna Adda menu, not the rejected explorations.",
        [pic("11.illu/30.1.webp", "Final menu identity")],
        { logo: "11.illu/30.1.webp", motion: "apna" }
      ),
      piece(
        "food-wrap",
        "generated",
        "Let the food carry the identity.",
        "Proposed application: a food wrap using the existing contour illustration system.",
        [],
        { concept: true, generated: "apna-wrap" }
      ),
      piece("series", "triptych", "Three independent visual voices.", "A curated introduction to the archive, without pretending it is one brand.", [
        pic("11.illu/7.2.webp", "Music illustration"),
        pic("11.illu/12.2.webp", "Illustrative storytelling"),
        pic("11.illu/30.1.webp", "Applied shop identity"),
      ]),
    ]
  )
);
P.push(
  project(
    "ai-prototypes",
    "2026 AI Experiments",
    "#9fbced",
    "#151c28",
    "#f1f4fb",
    "The collection has strong live demos, but tool lists compete with the design question each prototype investigates.",
    "Turn five representative prototypes into focused evidence pieces. Keep the remaining experiments accessible in the archive.",
    [
      film("captcha", "A test can be adversarial and humane.", "Original CAPTCHA interaction: a person draws and the system responds.", [
        clip("assets/media/ai-prototypes/captcha/CAPTCHA-02-never-optimize.mp4", 0, 8, "CAPTCHA · drawing as evidence"),
      ]),
      film("atlas", "Search becomes movement.", "Original Latent Atlas semantic search recording.", [
        clip("assets/media/ai-prototypes/latent-atlas/module-02-semantic-search-web.mp4", 0, 8, "Latent Atlas · search by meaning"),
      ]),
      film("mimic", "Resemblance makes a different kind of atlas.", "Original Mimic recording, including its imagined-form state.", [
        clip("assets/media/ai-prototypes/mimic/MIMIC-walkthrough.mp4", 5, 5, "A visual field forms"),
        clip("assets/media/ai-prototypes/mimic/MIMIC-walkthrough.mp4", 44, 6, "An expected form without a sighting"),
      ]),
      film("amnesiac", "Forgetting becomes an interface material.", "Original Amnesiac recording, edited around its changing memory state.", [
        clip("assets/media/ai-prototypes/amnesiac/AMNESIAC-open-and-forget.mp4", 20, 9, "Amnesiac · memory and forgetting"),
      ]),
      piece(
        "vantage",
        "diagram",
        "Separate an internal reaction from a public reply.",
        "Vantage is a speculative customer-care concept.",
        [
          { label: "Customer message", detail: "The situation enters the system." },
          { label: "Private internal voice", detail: "The concept gives Alex a raw reaction." },
          { label: "Professional response", detail: "A calm customer-facing message is produced." },
        ],
        { source: "_data/ai_prototypes.yml" }
      ),
    ]
  )
);
fs.writeFileSync("projects.json", JSON.stringify(P, null, 2));
console.log(P.map((p) => p.slug + ": " + p.pieces.length).join("\n"));
console.log(
  "TOTAL",
  P.reduce((n, p) => n + p.pieces.length, 0)
);
