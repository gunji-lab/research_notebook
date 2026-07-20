# PaperTrail UX Blueprint v1.0

## 0. Document purpose

This document defines the user experience of PaperTrail before further feature development.

PaperTrail is not primarily a paper-management application. It is a learning environment that helps students:

1. begin reading a paper without feeling overwhelmed,
2. make useful notes even when they do not yet know how,
3. notice small questions and points of interest,
4. revisit their own learning,
5. share useful knowledge with the laboratory,
6. gradually develop the habits of a researcher.

The first launch focuses on four experiences:

- 論文を読んでみる
- My Notebook
- Lab Notebook
- Dashboard

Research Starter remains an important later component, but is outside the first-launch critical path.

---

# 1. Product vision

## Core vision

> **「論文を読む」から、「研究がおもしろい」へ。**

## Core message

> **小さな「気になる」が、研究のはじまり。**

## English brand message

> **Small steps, big discoveries.**

## Experience promise

Students do not need to understand an entire paper at once.

PaperTrail breaks reading into small, visible steps and allows partial completion. A student should always know:

- where they are,
- what to do next,
- what is enough for now,
- what will be saved,
- what may remain unfinished.

---

# 2. Primary users

## 2.1 Third-year undergraduate students

Typical state:

- beginning laboratory placement,
- limited experience reading English papers,
- unsure what to write in a paper memo,
- may assume that research requires a brilliant original idea,
- may stop when faced with a large empty form.

UX need:

- strong guidance,
- small steps,
- examples,
- permission to leave fields blank,
- visible completion points.

## 2.2 Fourth-year and graduate students

Typical state:

- already reading papers for their own projects,
- may use Notion, Word, Zotero, or handwritten notes,
- wants faster retrieval, consistent structure, and lab sharing.

UX need:

- flexibility,
- quick entry,
- searchability,
- ability to continue from prior notes,
- useful filters,
- recommendation and sharing.

## 2.3 Instructor

Typical state:

- wants to support reading habits without grading every note,
- wants to see where students stall,
- wants lab knowledge to accumulate.

UX need:

- dashboard overview,
- student progress without surveillance-like pressure,
- common keywords,
- recommended papers,
- stalled records,
- useful lab-wide trails.

---

# 3. UX principles

## 3.1 One card, one purpose

Each card or page should ask the student to do one coherent thing.

Avoid combining:

- bibliographic information,
- reading motivation,
- discovery route,
- reflection,

inside one large form.

## 3.2 Reduce intimidation, not intellectual depth

PaperTrail should not oversimplify the science. It should reduce the size of each action.

The goal is:

- fewer simultaneous decisions,
- clearer prompts,
- smaller text areas,
- explicit next steps.

## 3.3 Partial completion is valid

Students may stop after:

- basic registration,
- Abstract-only reading,
- one figure,
- one section,
- careful reading,
- deep reading.

Each stopping point must feel complete rather than like failure.

## 3.4 Save only the student's intellectual work

Temporary support may include:

- pasted Abstract,
- temporary translation,
- topic sentences,
- bibliographic lookup results.

Saved content should prioritize:

- student-written summaries,
- titles,
- roles,
- notes,
- questions,
- recommendations,
- keywords.

Do not save:

- PDF files,
- full Abstract text,
- full body text,
- temporary translations,
- figure images.

## 3.5 Avoid “correct answer” pressure

Prefer:

- 「読み取れたところだけで大丈夫」
- 「短いメモでOK」
- 「全部埋めなくても大丈夫」
- 「小さな引っかかりを残してみよう」

Avoid:

- 「必ずすべて埋めてください」
- 「正しく要約してください」
- 「研究課題を完成させてください」

## 3.6 Reflection belongs after enough reading

The following should not appear in Quick reading:

- 気になった言葉
- 今日見つけた「あれ？」
- 今日の収穫
- おすすめ

They belong at the end of Careful and Deep reading, when the student has enough information to reflect.

---

# 4. Global information architecture

```text
Home
├── 論文を読んでみる
│   ├── Reading Preparation
│   ├── Quick Reading
│   ├── Careful Reading
│   └── Deep Reading
├── My Notebook
├── Lab Notebook
└── Dashboard
```

Later:

```text
Research Starter
└── questions and theme development
```

---

# 5. End-to-end reading journey

```text
論文登録
  ↓
STEP 1　論文の基本情報
  ↓
STEP 2　なぜこの論文を読む？
  ↓
STEP 3　どの検索ツール・経路で見つけた？
  ↓
🌱 準備完了
  ↓
さくっと読む
  ↓
さくっと読了
  ↓
じっくり読む
  ↓
じっくり読了
  ↓
深掘りする
  ↓
深掘り読了
  ↓
My Notebook / Lab Notebook / Dashboard
```

---

# 6. Reading Preparation

## 6.1 Purpose

Help the student begin without presenting one large form.

## 6.2 Progress model

```text
STEP 1 / 3　●○○
STEP 2 / 3　●●○
STEP 3 / 3　●●●
```

Each step is a separate card or page.

---

## STEP 1 / 3 — 論文の基本情報

### Student mindset

> 「まず、何を読むのか決めよう。」

### Inputs

- DOI
- OpenAlex lookup
- title
- authors
- journal
- publication year
- Japanese keywords
- English keywords
- PDF availability

### PDF status choices

- 入手済み
- Abstractのみ閲覧可能
- 探している途中
- 入手できなかった

### UX notes

- DOI lookup should reduce typing.
- Automatically filled fields remain editable.
- This step must not contain discovery-route fields.
- CTA: **次へ：読む理由を記録する**

---

## STEP 2 / 3 — なぜこの論文を読む？

### Student mindset

> 「何を知りたくて、この論文を開いたんだろう？」

### Inputs

Reasons:

- 検索で見つけた
- 別の論文で引用されていた
- 教員・先輩に勧められた
- 自分の研究に関係する
- 方法・解析が参考になりそう
- その他

Intended use:

- 背景を学ぶ
- 方法を学ぶ
- 結果を知る
- 図表を参考にする
- 解析を参考にする
- 書き方を学ぶ

Short free note:

- 具体的な理由

### UX notes

- “正しい理由はありません” should be visible.
- Text area should be compact.
- CTA: **次へ：見つけた経路を記録する**

---

## STEP 3 / 3 — この論文をどの検索ツール・経路で見つけた？

### Student mindset

> 「良い論文を見つける方法も、研究スキルの一つ。」

### Inputs

Discovery source:

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
- 別の論文の引用文献
- 授業・ゼミ・学会
- その他

Additional fields:

- 紹介してくれた人
- 実際に使った検索キーワード

### UX notes

- This is an independent card, not part of basic information.
- Tool use is recorded, not endorsed.
- Students must still confirm the original paper and bibliographic data.
- CTA: **準備を完了する**

---

## Preparation Complete

### Screen structure

1. completion icon
2. **準備完了！**
3. short transition copy
4. CTA

### Copy

> 読む論文と、読む理由が決まりました。  
> まずはAbstractから、全体をさくっと眺めてみましょう。

CTA:

> **Abstractを読んでみる**

---

# 7. Quick Reading

## 7.1 Purpose

Create a rough map of the paper from the Abstract.

## 7.2 Student mindset

> 「全部理解しなくていい。どんな研究かをつかもう。」

## 7.3 Temporary support

- Abstract original text
- temporary translation
- reading-support button

These are not saved.

## 7.4 Five-view scaffold

1. 背景  
   この研究分野では何が分かっている？

2. 課題  
   まだ何が分かっていない？

3. 目的  
   この研究では何を明らかにしたい？

4. 結果  
   一番大事な結果は？

5. 考察・意味  
   その結果から何が言えそう？

## 7.5 Final student summary

- one to three summary points
- student's own words only

## 7.6 Removed items

Do not ask here:

- この研究の対象は？
- この研究は何を知ろうとしている？

They duplicate the five-view scaffold.

Do not ask here:

- vocabulary,
- curiosity,
- harvest,
- recommendation.

## 7.7 Quick completion

### Screen structure

1. completion icon
2. **さくっと読了！**
3. core message
4. accomplishment copy
5. next actions

### Copy

> **小さな「気になる」が、研究のはじまり。**  
> *Small steps, big discoveries.*

> この論文の概要がつかめました。Abstractしか読めない論文は、ここで完了にして大丈夫です。

Actions:

- 内容を見直す
- この論文をじっくり読む
- My Notebookへ戻る

---

# 8. Careful Reading

## 8.1 Purpose

Understand the structure and logic of the full paper.

## 8.2 Student mindset

> 「どこから読んでもいい。まず全体像をつくろう。」

## 8.3 Recommended order

1. 結果
2. 背景
3. 考察
4. 方法

Students may begin anywhere.

---

## 8.4 Results

### Flow

1. register Figure/Table numbers,
2. display one figure at a time,
3. record:
   - number,
   - importance,
   - figure type,
   - analysis,
   - student's summary,
   - why it matters,
   - question.

### Copyright rule

Do not store figure images.

---

## 8.5 Background

### Flow

1. ask paragraph count,
2. enter all topic sentences,
3. show temporary translations,
4. read one paragraph at a time,
5. record:
   - paragraph title,
   - role,
   - one-sentence summary,
   - short note,
6. review paragraph flow,
7. identify interesting cited papers.

### Paragraph roles

- 一般背景
- 先行研究
- 研究対象の説明
- 既知の事実
- 未解明点
- 研究目的
- 仮説
- その他

---

## 8.6 Cited-paper trail

### Goal

Teach students how to follow references.

### Flow

1. 本文中に登場した文献の中で気になったものはありましたか？
2. 本文中の表記を書く  
   Example: Smith et al. 1975 / [15]
3. 引用文献リストを見る
4. bibliographic information:
   - authors,
   - year,
   - title,
   - journal,
   - volume,
   - issue,
   - pages,
   - DOI,
5. why it was interesting,
6. OpenAlex candidate lookup,
7. register as a new Quick-reading candidate.

---

## 8.7 Discussion

### Flow

1. paragraph count,
2. all topic sentences,
3. one paragraph at a time,
4. paragraph role,
5. interpretation,
6. new question.

### Roles

- 主要結果の解釈
- 先行研究との比較
- メカニズムの説明
- 予想外の結果
- 研究の意義
- 限界
- 今後の課題
- 結論
- その他

---

## 8.8 Methods

### Inputs

- research subject
- sample size
- design
- measurements
- analysis
- useful point for own research
- unclear point

---

## 8.9 Careful completion

### Screen structure

1. completion icon
2. **じっくり読了！**
3. core message
4. accomplishment copy
5. reflection
6. next actions

### Copy

> **小さな「気になる」が、研究のはじまり。**  
> *Small steps, big discoveries.*

> 結果・背景・考察・方法をたどり、この論文の全体像が見えてきました。

### Reflection fields

- 気になった言葉・新しく知った言葉
  - Japanese
  - English
  - short note
- 今日見つけた「あれ？」
- 今日の収穫
- この論文を研究室のみんなにおすすめする？
- recommendation reason

### Next actions

- 内容を見直す
- この論文を深掘りする
- My Notebookへ戻る

---

# 9. Deep Reading

## 9.1 Purpose

Connect the paper to actual research practice.

## 9.2 Student mindset

> 「この論文を、自分の研究にどう使えるだろう？」

## 9.3 Inputs

- methods or analyses to investigate further
- important citations
- limitations
- what I would study next
- relationship to my own research

## 9.4 Deep completion

### Screen structure

1. completion icon
2. **深掘り読了！**
3. core message
4. accomplishment copy
5. reflection
6. save/exit

### Copy

> **小さな「気になる」が、研究のはじまり。**  
> *Small steps, big discoveries.*

> 引用・解析・限界・自分の研究とのつながりまで整理できました。

### Reflection

Same categories as Careful, stored separately:

- vocabulary,
- curiosity,
- harvest,
- recommendation.

This preserves how the student's understanding changed between stages.

---

# 10. My Notebook

## 10.1 Purpose

Personal reading archive and continuation point.

## 10.2 Student questions answered

- What was I reading?
- Where did I stop?
- What did I write?
- Which paper used this keyword?
- Which paper did I want to continue?

## 10.3 Required features for first launch

- list of own papers,
- title search,
- DOI search,
- Japanese/English keyword search,
- reading level/status,
- last updated,
- continue button,
- recommendation marker,
- PDF status,
- intended-use filters.

## 10.4 Card contents

- title
- first author/year
- journal
- reading stage
- keywords
- last updated
- one short summary
- continue button

## 10.5 Empty state

> まだNotebookはありません。  
> 気になる論文を一本、さくっと読んでみましょう。

CTA:

> 論文を登録する

---

# 11. Lab Notebook

## 11.1 Purpose

Build shared laboratory knowledge.

## 11.2 Sharing principle

Only explicitly shared records appear.

## 11.3 Display

- display name / author,
- paper title,
- keywords,
- short student summary,
- useful point,
- recommendation reason,
- reading stage,
- updated date.

## 11.4 Do not display

- temporary original text,
- translation,
- full private notes,
- unshared questions,
- PDF/figure images.

## 11.5 Future recommendation modes

- recommend to all,
- recommend to a specific person,
- instructor recommendation,
- useful for a method,
- useful for a figure,
- beginner-friendly.

First launch may begin with lab-wide recommendation only.

---

# 12. Dashboard

## 12.1 Student dashboard

Purpose: show progress without turning reading into competition.

### Metrics

- papers started,
- Quick completed,
- Careful completed,
- Deep completed,
- recent reading trail,
- recent keywords,
- questions generated,
- recommendations made.

### Visual metaphor

Use footprints/trail rather than score ranking.

## 12.2 Instructor dashboard

### Useful views

- active students,
- papers started/completed,
- stalled records,
- common keywords,
- discovery tools used,
- recommended papers,
- recent shared notes,
- students with no recent activity.

### Tone

Supportive, not punitive.

Avoid public ranking by number of papers read.

---

# 13. Navigation rules

## Persistent navigation

- Home
- Read a Paper
- My Notebook
- Lab Notebook
- Dashboard
- Account

## Return behavior

Every page must offer a safe exit without data loss.

## Autosave

- local autosave while typing,
- server save after authenticated session,
- visible save status,
- no surprise data loss.

## Resume

Opening a saved paper should return to the last meaningful stage.

---

# 14. Writing and tone system

## Preferred language

- やさしい
- 具体的
- 命令的すぎない
- 詩的すぎない
- 学生が次に何をするか明確

## Examples

Good:

> まずはAbstractから、全体を眺めてみましょう。

> 全部埋めなくても大丈夫です。

> 今の段階で残せることだけを書きます。

Avoid:

> 知識の森へ旅立ちましょう。

Reason: overly poetic copy may be difficult for some students to interpret.

---

# 15. Visual and interaction system

## 15.1 Brand

- paper-like background,
- very light gray grid/report-paper lines,
- warm orange accent,
- iron-navy brand color,
- generous whitespace,
- rounded cards,
- quiet visual hierarchy.

## 15.2 Card density

- one purpose per card,
- compact textareas,
- examples under labels,
- advanced help inside `<details>`,
- avoid many large empty boxes at once.

## 15.3 Progress

Use:

- step number,
- stage indicator,
- completion state,
- clear CTA.

Avoid:

- gamified pressure,
- red warnings for optional fields,
- “incomplete” language for legitimate stopping points.

---

# 16. First-launch acceptance criteria

## Read a Paper

- STEP 1, STEP 2, STEP 3 are independent cards/pages.
- STEP 3 is not inside basic information.
- Preparation Complete exists.
- Quick/Careful/Deep completion pages follow the same message structure.
- Reflection appears only after Careful and Deep.

## My Notebook

- users can find and reopen their own papers,
- search by title/DOI/keyword,
- continue from saved progress.

## Lab Notebook

- only shared records appear,
- recommendation reason is visible,
- author/display name is visible.

## Dashboard

- student and instructor views exist,
- progress is visible,
- no public reading-count ranking is required.

## Data safety

- no PDFs,
- no Abstract/full text,
- no temporary translations,
- no figure images,
- no email addresses stored in the spreadsheet.

---

# 17. Deferred features

Not required for first launch:

- full Research Starter workflow,
- AI-generated summaries,
- automatic PDF ingestion,
- personal recommendation delivery,
- complex popularity ranking,
- comments/reactions beyond minimal form,
- advanced semantic search,
- public deployment beyond the university domain.

---

# 18. Future roadmap

## Phase 1 — First launch

- Read a Paper
- My Notebook
- Lab Notebook
- Dashboard

## Phase 2

- Research Starter
- stronger citation trail
- recommendation to specific people
- shared analysis/figure tags

## Phase 3

- PaperTrail AI over lab-created notes
- semantic retrieval
- growth timeline from first paper to thesis
- reusable common platform with My Lab and Trainers

---

# 19. Product decision test

Before adding a feature, ask:

1. Does this help a student begin?
2. Does this reduce intimidation?
3. Does this help the student make a better note?
4. Does this help a small question emerge?
5. Does this make prior learning easier to revisit?
6. Does this help the laboratory share useful knowledge?
7. Is the same goal achievable with a smaller interface?

If the answer is no, defer the feature.

---

# Reading Flow Update v1.1

## New principle

The reading modes are choices, not a compulsory ladder.

```text
さくっと読む
    ↓ 保存
    ├─ 今日はここまで
    ├─ じっくり読む
    └─ 気になるところを深掘りする

じっくり読む
    ↓ 保存
    ├─ 今日はここまで
    └─ 気になるところを深掘りする
```

Deep reading means exploring a selected part such as a figure, Discussion, Methods, cited paper, or Supplement. It does not require reading the entire paper.

Every stage is saved and can be resumed from My Notebook.
