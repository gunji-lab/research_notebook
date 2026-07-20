# PaperTrail Design Book — Research Notebook v2.0.0

## Core principle

Show the map first. Walk one step at a time.

## Reading levels

### さくっと
Basic information and Abstract. Every paper begins here.

### じっくり
Results, Background, Discussion, Methods. Recommended order is shown, but students may begin anywhere.

### 深掘り
Citations, analysis, limitations, and connections to the student's own research.

## Paragraph Reading

1. Input all Topic sentences.
2. Show temporary translations.
3. Read one paragraph at a time.
4. Save only the student's title, role, summary, and notes.
5. Review the flow of paragraph roles.
6. Summarize the section in one sentence.

## Figure Reading

1. Register Figure/Table numbers.
2. Open one figure at a time.
3. Record importance, figure type, analysis method, interpretation, and questions.
4. Build a future Figure Library searchable by analysis method.


## v2.1.0 Reflection update

Backgroundの最後では要約を書かせるのではなく、

- 段落の役割（自動表示）
- 自分が付けた段落タイトル（自動表示）
- 次に歩いてみたい道（背景で気になった論文）
- なぜ気になったか

を記録する。

目的は「Backgroundを要約すること」ではなく、
「引用文献へ興味をつなげること」である。

## OpenAlex-ready trail design

Backgroundは要約で閉じず、引用文献への興味で終える。

現在のNotebookは、参考文献欄から分かる範囲の情報を手動入力して保存できる。次の開発段階ではOpenAlexで候補を検索し、確認後に新しい「さくっと読む」Notebookへ接続する。

PaperTrailのTrailは、読了数ではなく「ある論文から次の論文へ移った経路」として育てる。

## OpenAlex implementation principle

自動取得は「学生の代わりに読む」ためではなく、書誌情報の入力負担を減らすために使う。

引用文献検索では自動的に1件へ確定せず、複数候補を提示して学生自身が確認・選択する。OpenAlexから取得したAbstractは読むための一時的な足場とし、保存対象は学生自身の要約である。

## Identity without overexposure

PaperTrailは大学Googleアカウントを入口に使うが、ラボ内表示に本名を必要としない。

本人確認・所有権には学籍番号を使い、コミュニティ上の表示には学生自身が選んだニックネームまたはイニシャルを使う。メールアドレス全体は保存しない。

教員用ダッシュボードは学籍番号と表示名を示すが、学生向けLab Notebookでは表示名を中心にする。

## Authorship
Notebookは学生が作った知的成果として、末尾に `Notebook by 表示名` を表示する。初期値は本名。利用者はカスタム表示名へ切り替えられる。

## Frontend freedom, quiet backend

デザインと学習体験はGitHub Pagesで素早く育てる。認証、保存、OpenAlexはGASが静かに担当する。学生は接続先やAPIキーを意識しない。

## Familiar authentication

研究室で実績のあるPhysics Trainerと同じ認証体験を使う。学生は大学アカウントを選ぶだけで、APIや接続設定を意識しない。


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

---

# v2.9.1 — Flexible Reading Flow and My Notebook Restore

## Interaction model

The three reading modes are not a required sequence or a hierarchy. After quick reading is saved, the reader chooses whether to stop, read the whole paper carefully, or investigate only a selected part. After careful reading, the reader may stop or continue to a deep dive.

The completion screens must explicitly affirm that stopping is valid. The primary experience is choice, not progression pressure.

## My Notebook behavior

My Notebook is populated from the GAS backend after authentication is ready. Each card opens the saved Notebook ID and restores the student's inputs, completion state, and appropriate reading screen.
