# Research Notebook v1.4.0 — Home Design Sprint

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


## v1.3.0の変更

- 背景パターンを削除し、白背景へ変更
- ユーザー提供の `PaperTrail_read_think_connect.svg` を正式ロゴとして採用
- Starter／Notebook／Journal Clubカードのグラデーションを廃止
- カードを白の単一色へ統一
- オレンジは主にボタンと小さなアクセントに限定
- Notion／Appleのような静かな情報設計へ調整


## v1.4.0 — Home Design Sprint

このバージョンでは、ホーム画面だけを重点的に設計した。

- ロゴ、タイトル、タグラインを上下に配置
- ロゴを大きく表示
- ホームを機能一覧ではなく「研究のロビー」として再構成
- DOIから始める入口
- Research Starter
- 新しいNotebook
- Continue Reading
- Lab Activity
- Today's Question
- Prototypeバージョン表示

OpenAlex連携はまだ実装せず、ホーム上に将来の入口のみ配置している。


## v1.5.0
- Header branding redesigned around PaperTrail.
- Hero copy refined.


## v1.6.0 — Home Header Finalization

- ヘッダーを「ロゴ＋PaperTrailブランド」／アクセントライン／キャッチコピーの順に再構成
- ロゴとブランド名を一つのブランドユニットとして表示
- キャッチコピーを独立して大きく表示
- Heroコピーを最終案へ統一
- タブレット・スマートフォン表示も調整


## v1.6.3 — Subtle Paper Grid
- 背景をごく薄いグレーへ変更
- 方眼紙／レポート用紙を思わせる極薄グリッドを追加
- カードと入力欄は白を維持


## v1.6.4
- 全ページ共通フッターを追加（© Megu GUNJI [ Toyo University ]）


## v1.7.0 — Research Notebook Prototype

- 読み方に沿った10ステップ構成
- Abstract原文・翻訳の一時入力欄
- 学生自身の1〜3点要約のみを保存
- 図表番号、重要度、図の種類、解析手法、要約、疑問
- GLMM、PCA、Cox等を記録できるFigureメモ
- 結果→背景→未解明点・目的→考察・手法の読書導線
- 次に読みたい引用文献
- 原文、翻訳文、図表画像は保存しない


## v1.8.0 — Staged Reading Prototype
- さくっと→じっくり→深掘りの段階制
- PDF入手状況
- Abstractのみでも保存可能
- 背景・考察のParagraph Reading


## v2.0.0 — Research Notebook Full Rewrite

- Notebook全体を段階的読書モデルで全面再構築
- さくっと：基本情報 → Abstract → 静かな達成画面
- じっくり：結果・背景・考察・方法を自由に選択
- 結果：図表番号一覧 → 1図ずつ読む
- 背景・考察：Topic sentence一覧 → 1段落ずつ読む → セクション全体をまとめる
- 方法：対象・測定・解析を整理
- 深掘り：引用・解析・限界・自分の研究へ接続
- 原文・翻訳文・図表画像は保存対象外

## v2.2.0 — OpenAlex-ready checkpoint

- Topic sentence・翻訳・段落メモ欄をコンパクト化
- 背景の振り返り画面に、段落の役割と自分で付けた段落タイトルを表示
- 背景で気になった引用文献を複数登録可能
- 著者、年、タイトル、ジャーナル、巻、号、ページ、DOIを手動入力
- 「なぜ気になったか」を保存
- OpenAlex検索ボタンの実装予定位置を追加
- 新しい「さくっと」Notebook候補をブラウザ内に保存可能

## v2.3.0 — OpenAlex implementation

- OpenAlex APIキーをブラウザ内に保存・削除できる設定UI
- DOIからタイトル、著者、雑誌、出版年を自動入力
- OpenAlexにAbstractがある場合は、一時入力欄へ復元
- Open Access状況、論文ページ、OA PDFを表示
- 背景で気になった引用文献をOpenAlexで検索
- 年を指定した候補検索
- 最大5件の候補から学生が論文を選択
- 選択した書誌情報で入力欄を補完
- OpenAlex情報を新しい「さくっと」Notebook候補へ保存

APIキーはNotebookデータには含めず、ブラウザのlocalStorageにのみ保存する。

## v2.5.0 — University login and Lab backend

- 大学GoogleアカウントをGASで確認
- メールアドレスの `@` より前を学籍番号として使用
- メールアドレス全体・本名は保存しない
- 初回に学生自身が表示名を設定
- Students / Notebooks / Trails / Activity / PaperCache の5シート
- Notebook本文はschema_version付きJSONで保存
- DOI・タイトル・読書レベルなどは集計用に独立列でも保存
- My Notebook、Lab Notebook、教員DashboardをGASデータへ接続
- GAS未設定時に使えるローカル試用モード
- 右下のアカウント設定UI
- Spreadsheet用CSVヘッダーテンプレートを同梱

## v2.6.0
- 氏名・カスタム表示名・表示モードを追加
- 初期表示は本名、任意でカスタム表示名へ切替
- Notebook末尾に Notebook by 表示
- GASへOpenAlex DOI検索・書誌検索・PaperCacheを統合
- 既存シートへ列を追加できる移行対応setup

## v2.8.0 — GitHub Frontend + Signed GAS Bridge

- UIをGitHub Pagesへ戻し、pushだけで更新可能
- Google Identity Servicesによる大学アカウントログイン
- Google署名付きIDトークンをGASで検証
- GitHubとGASの通信はGAS iframe bridge + postMessage
- 認証付きGASへの直接fetchを廃止
- 学生のGAS URL入力・OpenAlex APIキー入力を廃止
- GAS URLとGoogle Client IDは管理者がconfigへ一度設定

## v2.8.1 — Physics Trainer認証方式

- Google Cloud Client IDを廃止
- GASの`?view=auth`で大学アカウントを確認
- 署名付き・有効期限付きトークンをGitHub Pagesへ返却
- API呼び出しごとにGASでトークンを検証
- GitHub側の更新はpushだけ
- 学生はGAS URLやAPIキーを入力しない
