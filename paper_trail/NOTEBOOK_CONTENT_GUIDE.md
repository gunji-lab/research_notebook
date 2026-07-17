# Notebook Content Guide

## What students naturally record

Observed student practices include:

- search engine,
- person who introduced the paper,
- search keywords,
- Abstract summary,
- background,
- problem,
- purpose,
- results,
- discussion,
- interesting/new keywords,
- questions.

PaperTrail preserves these useful practices and adds scaffolding for students who do not yet know how to make such notes.

## Recommended first screen

### Paper information

- DOI
- title
- authors
- journal
- year
- Japanese keywords
- English keywords
- PDF availability

### Discovery

- where the paper was found
- who introduced it
- search keywords

### Reading intention

- why it was selected
- what part may be useful

## Recommended quick-reading screen

### Temporary reading support

- original Abstract
- temporary translation

Neither is saved.

### Student-created note

- background
- unresolved issue
- objective
- result
- interpretation
- final 1–3 point summary
- subject and purpose

### Reader's learning

- Japanese/English vocabulary
- one small question
- today's harvest
- recommendation and useful point

## Tone rules

Avoid:

- “必ずすべて埋めてください”
- “正しい答えを書いてください”
- “研究課題を完成させてください”

Prefer:

- “読み取れたところだけで大丈夫”
- “短いメモでOK”
- “小さな引っかかりを残してみよう”
- “全部読まなくても大丈夫”

## Data model additions

```json
{
  "paper": {
    "keywordsJa": "",
    "keywordsEn": "",
    "discoverySource": "",
    "introducedBy": "",
    "searchKeywords": "",
    "usePurposes": []
  },
  "quick": {
    "abstractMap": {
      "background": "",
      "gap": "",
      "objective": "",
      "result": "",
      "interpretation": ""
    },
    "vocabulary": [
      {
        "japanese": "",
        "english": "",
        "note": ""
      }
    ],
    "question": "",
    "harvest": [],
    "recommendation": {
      "level": "",
      "reason": ""
    }
  }
}
```


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
