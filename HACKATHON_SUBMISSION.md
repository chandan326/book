# SPEED August AI Challenge — Submission Kit

## Project name

PANNA.AI — Turn Every Chapter Into a Learning Experience

## One-line pitch

PANNA.AI is a privacy-first reading and authoring platform that converts any chapter into a summary, key concepts, grounded answers, and an interactive knowledge check.

## Inspiration

Long chapters are difficult to revise and generic AI chat tools can answer beyond the learner's source. We wanted one focused workspace where students can understand a chapter, test themselves, and trace every answer back to the text they supplied.

## What it does

Learners paste a chapter or their course notes into the AI Learning Lab. PANNA then:

1. estimates reading time and difficulty;
2. ranks the most informative sentences into a study summary;
3. extracts high-signal concepts;
4. answers questions using only evidence found in the chapter;
5. displays a grounding confidence score and source evidence; and
6. generates a quiz with immediate explanations.

PANNA also includes a broader book workflow for creating, editing, publishing, discovering, and reading books.

## How we built it

- React and Vite for the responsive learning interface
- JavaScript NLP pipeline for tokenization, stop-word filtering, frequency-weighted sentence ranking, lexical relevance scoring, and concept-based quiz generation
- FastAPI and SQLAlchemy in the broader authoring platform
- Local browser processing for the Learning Lab, avoiding an API key and keeping pasted learning material on the user's device
- GitHub for source control and Vercel for continuous deployment

## Challenges we ran into

The biggest challenge was making the demo reliable without depending on a paid model or remote API. We designed a deterministic NLP pipeline that remains transparent: summaries are extractive, answers expose their evidence, and unsupported questions are declined instead of being fabricated.

## Accomplishments that we're proud of

- A complete learning loop from reading to recall
- Evidence-grounded answers that reduce hallucination risk
- A zero-setup, privacy-first demo that works without an API key
- Responsive UX suitable for desktop and mobile learners
- Transparent explanation of the analysis method

## What we learned

Educational AI is more useful when learners can inspect why an answer was produced. Reliability and traceability can be as important as fluent generation, especially for study material.

## What's next

- Import chapters directly from the PANNA book library
- Multilingual explanations and accessibility modes
- Personalized revision paths based on quiz history
- Semantic retrieval for longer books
- Teacher dashboards and classroom learning analytics

## Transparency note

PANNA.AI began as a book creation and publishing foundation. The education-focused AI Learning Lab—chapter analysis, grounded Q&A, concept extraction, quiz generation, learning metrics, responsive interface, and related documentation—is the new challenge contribution.

## Links to add before submission

- Demo: `https://book-tau-green.vercel.app/#/learn`
- Source: `https://github.com/chandan326/book`
- Video: `[ADD PUBLIC VIDEO LINK]`

## Two-minute demo script

**0:00–0:15 — Problem**

“Students often read long chapters but struggle to identify the key ideas, ask reliable questions, and check what they actually understood. PANNA.AI turns a static chapter into an interactive learning experience.”

**0:15–0:30 — Platform**

“PANNA already supports creating, publishing, discovering, and reading books. For this challenge, we built the AI Learning Lab to connect reading directly with understanding and recall.”

**0:30–0:48 — Input and analysis**

“I can paste any chapter or course notes here. PANNA processes the text locally on my device, estimates its difficulty and reading time, and does not send my learning material to an external service.”

**0:48–1:08 — Summary and concepts**

“With one click, the NLP engine ranks information-rich sentences into a concise study summary and extracts the chapter's highest-signal concepts.”

**1:08–1:30 — Grounded Q&A**

“Now I can ask a question. PANNA searches the supplied chapter, returns the most relevant answer, and shows both a confidence score and supporting evidence. If the chapter does not contain an answer, it says so instead of inventing one.”

**1:30–1:49 — Knowledge check**

“PANNA also generates a knowledge check from the chapter. After I submit my answers, I receive a score and see the original explanatory sentence, making revision immediate and traceable.”

**1:49–2:00 — Close**

“PANNA.AI makes knowledge more accessible, engaging, and verifiable—transforming every chapter from something learners simply read into something they can actively understand.”

## Recording checklist

- Keep the final video at 1:50–1:58; Devpost says videos over two minutes will not be viewed.
- Record at 1080p with browser zoom around 90%.
- Show the source text, generated learning kit, one grounded answer, and one completed quiz.
- Remove notification pop-ups and private browser tabs before recording.
- Test the public video link in an incognito window.
