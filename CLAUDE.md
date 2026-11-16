# Institutional Trading Academy

Single-page trading course app. HTML + Tailwind CDN + Vanilla JS. No build tools, no npm, no frameworks.

## Files
- index.html: layout, sidebar, script tags
- js/store.js: Store.get(key, default), Store.set(key, value), Store.exportAll(), Store.importAll(file). Keys prefixed "ita_"
- js/app.js: App.registerModule({id, title, icon, render(container)}) plus routing
- js/course.js: lesson engine, reads window.COURSE
- js/course-data-1.js, js/course-data-2.js: lesson content (large, data only)
- js/simulator.js, js/tools.js, js/journal.js, js/flashcards.js: one module group each

## Store keys
course_progress, gates, setups, sim_scores, backtest, demo, calc, flashcards

## Design
Background #090d16, cards #111827, emerald #10b981 (bullish/correct), crimson #ef4444 (bearish/mistake), amber #f59e0b (liquidity/warning). Mobile responsive.

## Language
All UI text, notes and feedback in simple Roman Urdu. Technical terms stay in English (BOS, CHoCH, FVG, OTE, Order Block, Liquidity Sweep, Expectancy).

## Working rules (save tokens)
- Only open the files the task needs. Do not read course-data files unless the task is about lesson content.
- Edit existing files with small targeted edits. Never rewrite a whole file to change a few lines.
- Never change the Store or App.registerModule API.
- Do not re-read a file you just wrote.
- Do not run a browser, tests or servers unless asked.
- When done, reply with a 2-3 line summary only. No long explanations.