# My Notebook UX Blueprint v1.1

## Purpose

My Notebook is the student's reading home, not merely a paper list. It must make saved work easy to find, resume, and revisit.

## Emotional goals

- 安心：「前回の続きから始められる」
- 気軽：「Abstractだけでも保存していい」
- 自由：「じっくり読むか、一部を深掘りするか選べる」
- 達成：「少しずつ知識が増えている」
- 好奇心：「今日はどの論文を開こうかな」

## Home

### 今日は、どの論文を開いてみますか？

- 続きを読む
- 新しい論文を読む

前回は「○○」の「さくっと／じっくり／深掘り」まで読みました。

## Saved stages

My Notebook must display records saved at every meaningful stage:

- quick / quick-complete
- careful / careful-complete
- deep / deep-complete

`-complete` is a valid saved state and must never be filtered out.

## Card

Each card shows:

- Title
- Journal / year / DOI
- Current reading mode
- Last updated
- 「へぇ！」
- 「なんで？」
- 続きを読む

「続きを読む」は `notebook.html?notebook=<notebookId>` を開き、GASの `getNotebook` で保存内容を復元する。

## Search

Search title, DOI, author, Japanese keyword, English keyword, 「へぇ！」, and 「なんで？」.

## Reliability requirements

- Authentication completion後に一覧を再取得する。
- 一覧取得失敗時は空一覧と誤認させず、エラーと再試行ボタンを表示する。
- 新規作成時の並列自動保存でNotebookを重複作成しない。
- GASの `student_id` 比較は前後空白と大文字小文字を正規化する。

## Never

- ランキングを作らない
- ストリークを作らない
- 未完了を責めない
- プレッシャー通知を出さない
- 学生を競わせない

## Future

草木・足あと等の演出は初回ローンチ後に検討する。
