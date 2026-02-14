# Still



## Mission Statement



I want to build a personal knowledge management app that helps thoughtful creators build a calm, connected second brain. It should feel effortless, calm, straightforward, minimal, and almost invisible — like writing on quiet paper in a silent room.



Notes are **private by default**, but users can **publish** notes (or a graph subset) so others can **attach/fork** them into their own knowledge graph, similar to GitHub forking — with attribution and clean boundaries.



---



## Project Name



**Still**

Branding is intentionally restrained and rarely visible.



---



## Target Audience



* Writers and researchers building long-term idea systems
* Indie founders organizing thinking over time
* Minimalists who want power without visual noise



---



## Core Features \& Pages



### Writing Surface (Primary View)



* Single centered column; no persistent logo
* Cursor auto-focused
* Sidebar hidden by default; appears on hover/shortcut
* Title + body only; everything else is secondary and quiet



Emotional intention: the UI disappears within seconds. (Design-tips principle: start with feeling; design for emotional moments.)



---



### Linked Thinking



* `\[\[Note Title]]` syntax for internal linking
* Backlinks appear as a simple text list at the bottom
* Hover previews are minimal (no heavy cards)



Emotion: connections feel like pencil references, not “features.”



---



### Graph View



* Secondary mode (shortcut-first, not a hero feature)
* Monochrome nodes/lines, gentle fade-in
* Subtle zoom/pan with calm easing



Emotion: quiet constellations, not an analytics diagram.



---



### Command Palette + Search



* CMD/CTRL + K overlay
* Instant search + create note
* Minimal animation (soft fade only)



Emotion: recall a thought, don’t “operate software.”



---



## Publishing \& Forking Collaboration



### Publish Notes and Subgraphs



* A user can publish:



  \* a single note

  \* a folder/collection

  \* a selected subgraph (notes + their links)

* Publishing is explicit and intentional (never accidental)
* Published content has a clean public view:



  \* title, content, links, backlinks (optional)

  \* graph preview for that published set (optional)



**Default privacy:** everything starts private.



---



### Attach/Fork Into My Graph



Other users can “Attach” a published note/subgraph into their own graph:



* Adds a reference node in their graph (like a forked dependency)
* Preserves attribution:



  \* original author name/handle

  \* source link/reference

  \* published version timestamp

* Two modes:



  1. **Linked Attachment (stays synced)**: user references the source and can pull updates

  2. **Forked Copy (independent)**: user makes a local copy they can edit freely



Emotion: sharing feels generous, not invasive.



---



### Updates and Versioning (Quietly Powerful)



* Published items have versions (v1, v2…) without noisy UI
* If attached as “Linked,” show a tiny indicator when updates exist:



  \* “Update available” (subtle, dismissible)

* Pull updates is explicit (never auto-merge)



Emotion: control and calm — no surprise changes.



---



### Permissions and Safety



* Private by default
* Published items can be:



  \* Public

  \* Unlisted (shareable via link)

* Optional license selector (simple):



  \* “Allow forks” toggle

  \* “Require attribution” always on

* Report / hide content pathways are present but minimal



---



## Tech Stack



* **Frontend:** Vite + TypeScript + React + shadcn/ui + Tailwind CSS
* **Backend \& Storage:** **Lovable Cloud** (required for syncing, publishing, versioning, and fork references)
* **Auth:** Email/password (minimal UI), optional Google OAuth



---



## Design Guidelines



### → Emotional Thesis



Feels like clean paper under soft daylight.

The interface has no ego. Sharing is quiet and respectful.



(Use “scenes not screens” and “prompt behavior not state.”)



---



### → Typography



* Title: ~26px, regular weight
* Body: 16px
* Caption/meta: 13px
* 1.65 line-height, generous margins, minimal bolding



Typography is the UI.



---



### → Color System



Nearly colorless:



* Background: #FAFAF8
* Surface: #FFFFFF
* Text: #1C1C1C (soft charcoal)
* Secondary: #7A7A7A
* Dividers: #E5E7EB
* Focus: #C7CDD6 outline



No brand color in core writing experience.



---



### → Layout \& Spacing



* 8pt grid
* Max writing width ~680px
* Large whitespace margins
* No boxed “dashboard” sections
* Publishing UI uses the same visual language: plain, quiet, text-led



---



### → Motion \& Interactions



* 180–220ms fades
* No bounce, no scaling
* Hover states are opacity shifts only
* “Kindness in design” means nothing interrupts thought.



---



### → Voice \& Microcopy



Neutral, restrained:



* “Start writing.”
* “Private.”
* “Published.”
* “Attach to my graph.”
* “Update available.”



No hype, no urgency.



---



### → Branding System



* No persistent logo in writing view
* Wordmark only on auth + settings, and even there: subtle
* No illustrations, no marketing-y empty states
* The product identity is calmness, not visuals



---



### → Accessibility



* WCAG AA contrast minimum
* Keyboard-first navigation (especially for search/publishing/graph)
* Clear focus rings (subtle but visible)
* Semantic structure + ARIA where needed (graph)



---



### → Design Integrity Review



* Does the UI recede so writing dominates?
* Is publishing explicit and reversible?
* Does “Attach/Fork” feel like borrowing a book, not cloning a database?
* Are updates calm and user-controlled?



---



## Optional AI Feature



“Quiet Suggestions” (opt-in only):



* Suggest related notes while writing (one-line hint)
* Summaries only when requested
* For published notes: suggest “related published notes” subtly, never as a feed



AI is infrastructure, not a character.



---



## Final Reflection



Still is a private thinking space first — and a sharing network second.

Publishing + forking makes knowledge portable, but the experience stays quiet, controlled, and almost invisible.

