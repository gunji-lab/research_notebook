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
