# PaperTrail Beta - Notebook Design Update

## 方針

- Codex版のMock Data / dataService構成を維持
- GAS、Spreadsheet、認証への接続は追加しない
- 従来版の温かいオレンジ・クリーム系の世界観を復元
- My Notebookは「論文データベース」ではなく「自分の読み跡が並ぶ本棚」として整理
- Notebook詳細は、上部を論文の表紙のように見せ、簡単な入力から知的で整った研究ノートができる体験を強化

## 主な変更

- ブランドヘッダーを `Read. Think. Connect.` に変更
- 配色、角丸、影、余白を従来版のDNAに合わせて調整
- My Notebookに導入カードと本棚見出しを追加
- Notebookカードを2列の大きめカードに変更
- Notebook詳細の論文カバーを温かく知的な表現に調整
- 入力欄を「フォーム感」より「研究ノート感」が出る見た目に変更
- モバイル表示を調整
- フッターにPaperTrailのブランドコピーを追加

## 維持したもの

- `js/dataService.js`
- `mock/` 以下のMock Data
- Hash routeによる画面遷移
- GAS非接続の状態
