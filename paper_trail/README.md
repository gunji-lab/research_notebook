# Research Notebook v1.2.0 — Brand Prototype

英語論文を「最初から最後まで読む」のではなく、**論文全体の地図をつくり、気になる場所から深掘りする**ための学習支援プロトタイプです。

v1.2.0では、プロジェクト全体のブランドと世界観を統合しました。

> **Read. Think. Connect.**

> **We do not store papers. We store curiosity.**

抽象化したキリン模様と知識ネットワークを重ねたロゴ、Research Journeyの入口、Journal Clubの予告画面を追加しています。

## 起動

- `index.html`：Research Notebook
- `starter.html`：Research Starter

ブラウザで直接開けます。

## 保存ポリシー

### 保存対象

- DOI、書誌情報
- 読む理由、知りたいこと
- 学生自身が付けた段落タイトル
- 学生自身の一文要約
- 目的、方法、結果、解釈、未解明点
- 次に読みたい論文
- Research Starterで作った興味・問いの履歴

### 保存しないもの

- 論文PDF
- Abstract全文
- 本文
- 図表画像
- 原文の一時メモ
- DeepL等による翻訳文

原文・翻訳文の一時入力欄は、カード保存データに含めません。

## プロトタイプと本番版

このZIPのHTMLは、すぐ確認できるようlocalStorageを使っています。

本番版の想定：

```text
大学Googleアカウント
        ↓
Research Notebook / Starter
        ↓
Google Apps Script
        ↓
Google Spreadsheet
```

`gas/Code.gs` にスプレッドシート保存用のバックエンド雛形を同梱しています。

## Research Starter

以下の6ステップを収録しています。

1. 興味のあるテーマを複数挙げる
2. なぜ惹かれるか、自分とどう関係するか考える
3. 気になった検索結果を10件集める
4. 退屈だった検索結果を5件集める
5. 小さな問いを20個出す
6. 問いを診断し、次に必要なデータと検索語を考える

## ファイル構成

```text
research_notebook_v1.1.0/
├── index.html
├── app.js
├── starter.html
├── starter.js
├── styles.css
├── README.md
├── SPEC.md
└── gas/
    ├── Code.gs
    └── README_GAS.md
```


## ブランドファイル

`BRAND.md` に、ロゴの意味、配色、言葉遣い、UX原則をまとめています。

## v1.2.0の主な変更

- Read. Think. Connect. を正式タグラインとして採用
- 抽象的なキリン模様／知識ネットワークのSVGロゴ
- キリン模様を思わせる背景パターン
- Starter／Notebook／Journal Clubの入口をホームに統合
- Journal ClubのComing Soon画面
- 保存方針をブランドメッセージとして前面化
- BRAND.mdを追加
