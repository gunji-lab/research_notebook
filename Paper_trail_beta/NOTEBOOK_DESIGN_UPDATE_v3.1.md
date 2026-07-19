# PaperTrail Notebook Design Update v3.1

## Scope

Notebook関連ページの見た目と情報の見せ方だけを更新しました。

- `notebook.html`
- `my_notebook.html`
- `lab_notebook.html`
- `css/notebook_theme.css`（新規）

## Design concept

- 静かな研究室
- 長時間読んでも疲れにくい
- 派手な装飾や強い影を避ける
- 温かみのあるオフホワイトと落ち着いた文字色
- PaperTrailのオレンジは控えめなアクセントとして使用
- Notebookは研究ノートとして、My Notebookは本棚として扱う

## Main changes

### Research Notebook

- 研究ノートを開く感覚のヒーロー領域
- セクションの余白と章立てを明確化
- カードの影を廃止し、罫線中心の静かな表現へ変更
- 長文入力欄の可読性とフォーカス表示を改善
- 読書段階マップを落ち着いたナビゲーションへ変更
- 完了画面や補助パネルの装飾を簡素化

### My Notebook

- 一覧性を優先した1列の本棚形式へ変更
- タイトル、著者・雑誌・年、タグ、短い記録、更新日を中心に表示
- 詳細な「へぇ！」「なんで？」表示は一覧カード上では非表示
- 詳細は各Notebookで確認する構造へ整理
- 最近開いたNotebookと全Notebookを見通しやすく整理

### Lab Notebook

- My Notebookと同じ静かな一覧デザインへ統一
- 所有者名を控えめなバッジとして表示
- 共有Notebookをざっと見渡せる1列構成

## Not changed

以下には変更を加えていません。

- Google Apps Script
- API
- 認証
- 保存処理
- Spreadsheet構造
- ホーム画面
- Dashboard
- 既存の入力ID・イベント処理

## Trailについて

今回の更新はデザイン中心です。追記履歴（Trail）の保存機能にはまだ手を入れていません。
将来のTrail追加時にも馴染むよう、罫線・章立て・余白を中心としたデザイン基盤にしています。
