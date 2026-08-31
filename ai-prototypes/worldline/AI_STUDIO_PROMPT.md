# Google AI Studio build prompt

Build a Maps-grounded spatial climate proposal service called Worldline.

Input:

- A place name and latitude/longitude
- Observed air temperature, feels-like temperature, current canopy percentage, and active weather condition
- One resident goal in plain language

Use Google Maps grounding to understand the real street, nearby transit, public uses, businesses, and likely curb constraints. Create one block-scale heat adaptation proposal that prioritizes a continuous safe walking route. Preserve accessible curb access, emergency movement, loading, and public transport.

Return structured JSON with:

- `title`: short proposal name
- `summary`: two direct sentences for residents
- `rationale`: evidence-based reason this intervention fits this block
- `interventions.trees`: integer from 2 to 24
- `interventions.shadeStructures`: integer from 0 to 6
- `interventions.rainGardens`: integer from 0 to 8
- `interventions.pedestrianEdge`: boolean
- `constraints`: actual place constraints that shaped the proposal
- `mapSources`: Maps-grounded sources used

Do not invent precise climate benefits. Worldline calculates prototype impact separately from the intervention counts and labels those numbers as predicted. If location context is insufficient, return the missing input rather than guessing.
