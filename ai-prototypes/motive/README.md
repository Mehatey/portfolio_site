# Motive

Motive is an intelligent cursor for complex software. Instead of putting AI in a detached chat panel, it attaches understanding and actions to the exact interface object under the pointer.

## Interaction model

1. **Hover to understand.** The cursor reads the target's role, label, state, and a small amount of nearby context. Its geometry changes with the object.
2. **Hold Space to decide.** A four-direction intent bloom opens around the pointer: Explain, Trace, Draft, and Plan.
3. **Move and release to run.** Direction selects the intent. The response appears beside its source instead of in a remote conversation history.
4. **Confirm before side effects.** Motive can propose a plan or draft. It never sends, edits, or runs an external action without a separate confirmation.

Touch users tap an object, then tap an intent. Keyboard users focus any marked object, press Space, use Left or Right to choose, and release Space to run.

## AI architecture

Motive uses Chrome's built-in `LanguageModel` Prompt API and Gemini Nano when available. Inference stays on device. The session is prepared only after the user presses the model control, and receives only the selected object's semantic label plus at most 240 characters of relevant context.

When the API or model is unavailable, the demo clearly reports **Semantic demo** and uses curated outputs. It never passes canned text off as model inference.

## Chrome extension

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `ai-prototypes/motive/extension`. Press the Motive toolbar icon on any normal web page to toggle the cursor.

The extension requests only `activeTab` and `scripting`. It requests no browsing history, storage, debugger, clipboard, or network permissions.

## Run and test

```bash
python3 -m http.server 5193 --bind 127.0.0.1
node --test ai-prototypes/motive/tests/*.test.mjs
```

Then open `http://127.0.0.1:5193/ai-prototypes/motive/`.
