# PaperTrail v2.9.1 仕様書

> この文書は旧Research Notebook仕様を引き継ぎつつ、PaperTrailの現行実装を定義する。

## 現行読書フロー

- さくっと読了時点でNotebookへ保存する。
- 保存後は「今日はここまで」「じっくり読む」「気になるところを深掘りする」から選ぶ。
- じっくり読了時点でも保存し、「今日はここまで」または「深掘り」を選ぶ。
- 深掘りは論文全体ではなく、Figure、Discussion、Methods、引用文献など一部だけでもよい。
- My Notebookから保存済みの各段階を再開できる。

## 保存状態

`quick`, `quick-complete`, `careful`, `careful-complete`, `deep`, `deep-complete` を正式な状態として扱う。

---

## 1. コンセプト

> 論文を管理するのではなく、論文の中を迷わず歩けるようになるためのノート。

学生が英語論文を読む際に、全文を順番に翻訳するのではなく、まず全体構造をつかみ、必要な部分を選んで深掘りする習慣を身につけることを目的とする。

## 2. デザイン方針

- テーマカラー：オレンジ〜黄色
- 背景：クリーム
- カード：白、やわらかい角丸、薄い影
- トーン：励ます、怖がらせない、競争させすぎない
- 「未入力」「エラー」より「わかる範囲で大丈夫」
- 毎日触りたくなる、読書ノート・付箋の雰囲気

## 3. 学習設計

### 読む前

- なぜこの論文を選んだか
- 何を知りたいか
- どのくらい深く読むか

### 読みながら

- セクション
- 段落番号
- 段落の役割
- 段落タイトル
- 一文要約
- 重要度
- 図表の意味と重要度

### 読んだ後

- 目的
- 方法
- 結果
- 解釈
- 未解明点・限界
- 自分の研究との関係
- 次に読む論文
- 指導教員・先輩に聞きたいこと

## 4. 読書モード

### さくっと

Abstract、目的、図表を中心に、論文全体の地図をつくる。

### じっくり

各段落の役割を整理し、IntroductionからDiscussionまでの論理展開を見る。

### 深掘り

手法、統計、限界、引用論文まで追い、次の読書へつなげる。

## 5. 段落の役割

- 一般背景
- 先行研究
- 未解明点
- 研究目的
- 方法
- 結果
- 解釈
- 限界
- 今後の展望
- その他

役割タグを付けることで、複数論文から「未解明点だけ」「研究目的だけ」を抽出できる。

## 6. 共有とリアクション

本番版では、大学アカウント認証を前提として以下を実装する。

- Lab Notebook
- いいね！
- 気になる！
- 参考になった
- 短いコメント
- 教員おすすめ
- 教員確認済み

ランキング化は主目的とせず、知識の広がりと相互支援を重視する。

## 7. データ保存方針

### v1.0.0プロトタイプ

- 自分のカード：localStorage
- Lab Notebook：デモデータ
- JSONエクスポート／インポート
- 原文・翻訳文の一時メモは保存しない

### 本番版候補

- Google Apps Script
- Google Spreadsheet
- 大学Googleアカウント認証
- ラボメンバーごとの閲覧・編集権限
- 変更履歴
- 卒業者アカウントの自動失効

## 8. 著作権への配慮

共有DBへ保存するのは、学生自身が書いた以下の情報を基本とする。

- 段落タイトル
- 一文要約
- 図表の意味
- 自分の研究との関係
- 次に読む理由

論文本文、Abstract全文、各段落冒頭文、DeepL翻訳文は原則として恒久保存しない。

## 9. 将来拡張

### Research Starter

興味の発見、問いの生成、文献検索、読む論文の選択。

### Journal Club

目的、仮説、重要Figure、限界、次の研究を整理し、議論に備える。

### Research Trainer

論文執筆、構成、用語揺れ、引用形式、図表番号、論理チェック。

### Local AI

Mac Studio上でOllamaとローカルLLMを動かし、未公開原稿を外部へ送らず支援する。

## 10. v1.0.0で意図的に入れていないもの

- クラウド保存
- 大学アカウント認証
- DOI自動取得
- PDFアップロード
- 翻訳API連携
- AI要約
- 本文全文保存
- ランキング

まず、既存メンバーが「英語論文を読むのが少し怖くなくなるか」「毎日開きたくなるか」をテストする。


## 11. Research Starter

Research Notebookの前段として、研究テーマと問いを育てる段階式ワークを設ける。

### Step 1 興味の種

興味のあるテーマを複数挙げ、現在浮かんでいる疑問を自由に記録する。

### Step 2 自分との関係

- なぜ惹かれるか
- 自分とどんな関係があるか
- どの部分に疑問があるか
- 何が分かれば面白いか

### Step 3 気になる検索結果

検索結果を10件程度登録し、なぜ目に留まったか、どんな問いが浮かんだかを記録する。

### Step 4 退屈な検索結果

関係があるのに惹かれなかった検索結果を登録し、「それより何の方が面白いか」を言語化する。

### Step 5 小さな問い

最低20個の具体的な疑問を列挙する。

### Step 6 問いの診断

- 疑問形か
- 対象が具体的か
- 答えを誘導していないか
- 必要なデータを想像できるか

## 12. スプレッドシート保存

本番版では、NotebookCards、StarterRecords、Reactions、Commentsの4シートを基本構成とする。

原文・翻訳文はフロントエンドの一時状態にのみ保持し、GAS関数の引数およびスプレッドシート列に含めない。


## 13. ブランド統合

### タグライン

Read. Think. Connect.

### ブランドメッセージ

Research Notebook is not a paper manager.

We do not store papers. We store curiosity.

### ロゴ

キリンの網目模様と知識ネットワークを抽象化したSVGを使用する。

### ホーム構成

- Research Starter
- Research Notebook
- Journal Club

の3つをResearch Journeyとして提示する。

### Journal Club

v1.2.0ではComing Soon画面のみ。Notebookカードを発表・質問・議論へ接続する拡張を予定する。


## 14. Quiet Curiosity デザイン更新

- 背景：白
- 背景模様：なし
- カード：白、単色
- グラデーション：使用しない
- アクセントカラー：ボタン、見出し、タグ等の限定箇所のみ
- 正式ロゴ：ユーザー提供SVG
- 余白と可読性を優先し、装飾の主張を抑える


## 15. Home Design Sprint

ホーム画面は機能一覧ではなく、利用者が「今日は何をしよう」と考えられるロビーとして設計する。

### 構成

1. 大きなブランドロゴ
2. Research Notebook
3. Read. Think. Connect.
4. 挨拶と短い導入
5. DOI入力
6. Research Starter
7. New Notebook
8. Continue Reading
9. Lab Activity
10. Today's Question

Notebook内部、Starter内部、OpenAlex連携はこのスプリントでは変更しない。


## v1.6.0 ヘッダー仕様

左から以下の順に配置する。

1. ロゴ＋PaperTrail＋Read. Think. Connect.
2. 細いオレンジの区切り線
3. 「論文を読む最初の一歩を、もっとやさしく。」

Heroは、挨拶、具体的な行動喚起、安心感、PaperTrailの世界観、保存理念の順に表示する。


## v1.6.3 背景仕様
背景色は #fbfbfa、24px間隔の極薄グレー方眼を使用する。カードと入力欄は白を維持する。


## v1.8.0 段階的読書モデル
さくっと→じっくり→深掘りで同一カードを育てる。


v2.1変更:
- Topic sentence/翻訳欄は2〜3行程度のコンパクトUI
- 段落タイトル・役割・短い一文メモ中心
- Background最後は要約ではなく
  * 気になった論文
  * なぜ気になったか

## v2.2.0 引用文献から次のNotebookへ

背景のParagraph Reading完了後、気になった引用文献を登録できる。

保存項目:
- 著者
- 出版年
- 論文タイトル
- ジャーナル名
- 巻・号・ページ
- DOI
- 気になった理由

次フェーズでは、この情報をOpenAlexへ送って候補検索し、選択した論文を新しい「さくっと読む」Notebookへ登録する。

## v2.3.0 OpenAlex API

### DOI検索

`GET /works/doi:{DOI}` を利用して、論文の書誌情報を取得する。

### 引用文献検索

タイトル、著者、ジャーナル、出版年を検索文字列に使用し、`GET /works?search=...` で最大5件の候補を表示する。出版年が入力されている場合は `publication_year` フィルターを併用する。

### 自動取得項目

- OpenAlex ID
- DOI
- タイトル
- 著者
- 出版年
- ジャーナル
- 巻・号・ページ
- Open Access状況
- OA URL / PDF URL
- 被引用数
- Abstract（inverted indexから一時的に復元）
- Primary Topic

候補は自動確定せず、利用者が選択する。

## v2.5.0 認証と保存

### 認証

GASウェブアプリで大学Googleアカウントを確認する。`Session.getActiveUser().getEmail()` のローカル部を学籍番号として利用する。

保存しないもの:
- メールアドレス全体
- Googleアカウントの氏名
- 本名

保存するもの:
- 学籍番号
- 学生が設定した表示名
- ドメイン

### データモデル

- Students：利用者プロフィール
- Notebooks：Notebook概要＋JSON
- Trails：論文間の移動
- Activity：操作履歴
- PaperCache：外部書誌情報

Notebook JSONには必ず `schema_version` を含める。

## v2.6.0 Profile
Students列: student_id, real_name, nickname, display_name, display_mode, domain, created_at, updated_at, is_active。本名またはカスタム表示名を選択可能。

## v2.8.0 Authentication

GitHub PagesでGoogle Identity Servicesを使ってIDトークンを取得する。GASはtokeninfoでトークンを検証し、aud、iss、exp、email_verified、大学ドメインを確認する。

GitHubからGASへの通信は、GAS HTML Serviceで配信する親ページを経由する。GAS親ページがGitHub Pagesをiframe表示し、GitHub側からのpostMessageを受けてgoogle.script.runでバックエンドを呼び出す。

## v2.8.1 Authentication

Physics Trainerと同じリダイレクト型認証を使用する。GASはSession.getActiveUser()で大学アカウントを確認し、学籍番号・期限・nonceを含むトークンへHMAC-SHA256署名を付ける。

GitHub Pagesは`#auth=`からトークンを受け取りlocalStorageに保存する。以後のAPI呼び出しにトークンを添付し、GASは署名・期限・ドメインを毎回検証する。


## Core message (v2.8.2)

> 「論文を読む」から、「研究がおもしろい」へ。

PaperTrailは論文管理ソフトではなく、研究者の思考を育てるノート。

### 教育方針
- 小さな「気になる」が、研究のはじまり。
- 正しい感想ではなく、自分の「あれ？」を残す。
- 論文を読む目的は、次の問いを見つけること。

### 背景・考察の最後
「今日見つけた『あれ？』を一つ残してみよう。」

補助質問
- 一番気になったことは？
- 著者に質問するとしたら？
- 次に読んでみたい引用文献は？
- 自分なら次に何を調べる？

### 引用文献
自由記述ではなく、
1. 本文中で気になった引用を書く
2. 引用文献リストから情報を書く
3. なぜ読んでみたいかを書く

### 将来機能
- 後輩におすすめ
- 学年別おすすめ
- 研究室おすすめ論文


# v2.8.3 — Guided Note-taking & First Launch

## 1. First launch scope

The first public launch prioritizes four experiences:

1. **論文を読んでみる**
2. **My Notebook**
3. **Lab Notebook**
4. **Dashboard**

Research Starter is important, but it is not required for the first launch. Its role is to help students generate and refine research questions. The first launch instead focuses on helping students begin reading papers, leave useful notes, revisit their own learning, and learn from the laboratory community.

## 2. Why note-taking support is necessary

Some students already create thoughtful Notion records containing background, problem, purpose, results, discussion, keywords, and questions. Other students do not yet know:

- what to record,
- how short a note may be,
- how to separate a paper's claim from their own thought,
- how to turn unfamiliar words into future search terms,
- how to leave a small question without producing a polished research proposal.

PaperTrail must support both groups. It should not make capable students write less, and it should not leave beginning students in front of a blank textarea.

## 3. Two layers of a Notebook

Each Notebook keeps two complementary layers.

### Layer A: What the paper says

- bibliographic information,
- discovery source,
- search keywords,
- background,
- unresolved issue,
- objective,
- results,
- interpretation,
- paragraph and figure notes.

### Layer B: What changed in the reader

- unfamiliar or interesting words,
- what felt surprising,
- a small question,
- why the paper may be useful,
- today's harvest,
- whether and why it should be recommended.

PaperTrail becomes distinctive when these two layers sit side by side.

## 4. Abstract note scaffold

The Abstract page offers five compact prompts:

1. 背景 — What was already known?
2. 課題 — What remained unknown?
3. 目的 — What did the study aim to clarify?
4. 結果 — What was the main result?
5. 考察・意味 — What does the result suggest?

Students may leave fields blank. The scaffold is assistance, not a completeness test. After using it, students write a final one-to-three-point summary in their own words.

## 5. Discovery trail

Record:

- search engine or discovery route,
- person who introduced the paper,
- search keywords used.

This is not administrative metadata. It helps students learn where useful papers come from and allows a future Dashboard to show productive search routes.

## 6. Bilingual keyword notebook

Japanese and English keywords are stored separately.

- Japanese supports comprehension and recollection.
- English supports the next literature search.
- Newly learned vocabulary may include a short personal explanation.

The system should eventually allow a keyword to become a new OpenAlex search without retyping.

## 7. Curiosity prompt

The core prompt is:

> **今日見つけた「あれ？」を一つ残してみよう。**

Supporting prompts:

- What was most surprising?
- What would you ask the authors?
- Would the result be the same in another species or condition?
- What would you investigate next?

A small question is enough. PaperTrail does not require a polished research question at this stage.

## 8. Today's harvest

The completion experience does not score students. It asks them to notice one step forward:

- learned a new word,
- understood the outline,
- became interested in a figure,
- generated a question,
- found a connection to their own research.

The completion message is:

> **小さな「気になる」が、研究のはじまり。**
> *Small steps, big discoveries.*

## 9. Lightweight recommendation

The first-launch version records:

- recommend,
- recommend only a part,
- not decided yet,
- a short reason.

Later versions may support recommendations to the whole laboratory or a specific person. The system should emphasize useful context such as “Figure 2 is clear” or “good example of GLMM presentation,” rather than popularity rankings.


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
