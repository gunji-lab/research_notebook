# GAS接続メモ

このフォルダは、Research Notebook／Research Starterの入力内容をGoogleスプレッドシートへ保存するためのバックエンド雛形です。

## 方針

保存するもの：

- 学生自身が書いた要約、問い、段落タイトル
- DOI・書誌情報
- 図表についての自分の説明
- 次に読む論文
- Starterで作った興味・問いの履歴

保存しないもの：

- 論文PDF
- Abstract全文
- 論文本文
- 図表画像
- 原文の一時メモ
- DeepL等の翻訳文

## 導入手順

1. 新しいGoogleスプレッドシートを作成
2. 拡張機能 → Apps Script
3. `Code.gs` の内容を貼り付ける
4. `CONFIG.allowedDomain` を確認する
5. `setupSheets()` を一度実行する
6. 必要な権限を承認する
7. GASホスト版HTMLから `google.script.run.saveNotebookCard(data)` または `saveStarterRecord(data)` を呼ぶ

## 大学アカウント

`Session.getActiveUser().getEmail()` を使い、設定した大学ドメイン以外は拒否します。

Google Workspaceの設定やWebアプリの実行ユーザー設定によって、メールアドレスを取得できる条件が異なります。実際の大学環境で小規模テストを行ってから本運用してください。

## 次の実装

現状のHTMLは、すぐに画面を確認できるlocalStorage版です。次版では、同じUIをApps ScriptのHtmlServiceから配信し、`google.script.run`でスプレッドシートへ保存する版を統合します。
