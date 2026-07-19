# PaperTrail frontend-only版

元のHTML・CSS・画面構成・コンセプトは変更していません。

削除したもの：
- Google Apps Script（GAS）本体と接続設定
- Googleアカウント認証とトークン処理
- Spreadsheet/API経由の読み書き
- localStorageによるNotebook／Starterの永続保存
- 保存済みデータを前提とする読み込み処理

維持したもの：
- 全ページのHTML構造とCSS
- ロゴ、配色、タイポグラフィ、ナビゲーション、画面遷移
- Research Starter / Research Notebookの入力・ステップ操作
- OpenAlexによる論文情報取得処理

この版では入力内容は画面を閉じると失われます。
