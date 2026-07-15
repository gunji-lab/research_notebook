# PaperTrail 1st Launch Definition

## Goal

Enable students to begin reading papers now, even before Research Starter is complete.

The launch succeeds when a student can:

1. register a paper with minimal typing,
2. make a useful Abstract note with guidance,
3. leave one personal question or point of interest,
4. find the paper again in My Notebook,
5. share selected learning with Lab Notebook,
6. see their own progress in Dashboard.

## In scope

### Read a Paper

- DOI/OpenAlex bibliographic import
- discovery route and search keywords
- PDF availability
- reading reason and intended use
- staged reading: quick, careful, deep
- guided Abstract memo
- bilingual keywords and vocabulary
- small-question prompt
- today's harvest
- lightweight recommendation

### My Notebook

- personal paper list
- reading level/status
- title/DOI/keyword search
- tags and intended use filters
- continue reading
- recent updates
- recommendation marker

### Lab Notebook

- only explicitly shared records
- display name/author
- title, keywords, short summary
- useful part or recommendation reason
- no original Abstract, translation, body text, or figure images

### Dashboard

Student view:

- current reading trail
- papers by reading level
- recent keywords
- today's/this month's steps
- questions generated

Instructor view:

- active users
- papers started/completed
- stalled records
- common keywords
- discovery routes
- recommended papers

## Out of scope for first launch

- Research Starter full workflow
- AI-generated summaries
- automatic full-text/PDF storage
- social ranking
- complex recommendation algorithms
- direct messaging
- grade calculation

## Privacy and copyright

Save only student-created notes and bibliographic metadata. Do not save:

- PDF files,
- Abstract or body text,
- temporary translations,
- figure images.

## Product principle

The first launch must be useful before it is comprehensive. A student who currently uses no systematic note format should be able to make a solid memo. A student who already uses Notion should gain structure, searchability, staged reading, and laboratory sharing without losing flexibility.


# v2.8.4 — Reading-stage refinement

## Discovery tools

The discovery-source field is named “検索ツール・見つけた場所,” not only “search engine.” Options include conventional databases and AI-assisted discovery tools:

- Google Scholar
- PubMed
- OpenAlex
- Connected Papers
- Consensus
- Elicit
- ResearchRabbit
- Semantic Scholar
- Perplexity
- ChatGPT
- Web of Science
- Scopus
- citation list
- class, seminar, or conference
- other

Recording a tool does not certify the reliability of its output. Students still confirm the original paper and bibliographic information.

## Quick reading

The Quick stage focuses only on what can reasonably be learned from the Abstract:

- bibliographic information,
- discovery route,
- reading reason,
- five-view Abstract scaffold,
- final one-to-three-point summary.

The former prompts “この研究の対象は？” and “この研究は何を知ろうとしている？” were removed because they duplicated the five-view scaffold.

Vocabulary, curiosity, harvest, and recommendation are not requested at the Quick stage. Abstract-only reading may not provide enough evidence for those reflections.

## Completion-page structure

Every reading level follows the same emotional structure:

1. reading-level completion title,
2. core PaperTrail message,
3. explanation of what the student has accomplished,
4. next action.

Core message:

> **小さな「気になる」が、研究のはじまり。**
> *Small steps, big discoveries.*

### Quick completion

No extended reflection is required. Students may finish an Abstract-only paper here.

### Careful completion

After working through results, background, discussion, and methods, students record:

- interesting/new vocabulary,
- today's “あれ？”,
- today's harvest,
- laboratory recommendation and useful part.

### Deep completion

After reviewing citations, analysis, limitations, and connection to their own work, students may add or revise the same four types of reflection.

The Careful and Deep reflections are stored separately so that changes in understanding remain visible.


# v2.8.5 Reading preparation refinement

The Quick stage should be psychologically lightweight.

Preparation is organized into three small cards:

1. STEP1 / 論文の基本情報
2. STEP2 / なぜこの論文を読む？
3. STEP3 / この論文をどの検索ツール・経路で見つけた？

The amount of information is unchanged. Only the presentation changes so that students feel they are completing a sequence of small steps rather than facing one large form.

Future UI:
- each card becomes an independent page
- progress indicator (●○○ → ●●○ → ●●●)
- transition screen: 「🌱 準備完了！まずはAbstractを読んでみましょう。」
