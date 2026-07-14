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
