# PaperTrail v2.8.1 セットアップ
## Physics Trainerと同じ認証方針

この版ではGoogle CloudのWebクライアントIDを使いません。

```text
GitHub Pages
  ↓ 未ログインならGAS ?view=authへ移動
GAS
  ↓ 大学Googleアカウントを確認
署名付き・有効期限付きトークンを発行
  ↓ #auth=... を付けてGitHubへ戻る
GitHub Pages
  ↓ トークンを保存してAPI通信時に添付
GAS
  ↓ 毎回署名と有効期限を検証
Spreadsheet / OpenAlex
```

## 1. GitHub側

`papertrail_config.js`を開き、GAS URLだけ設定します。

```javascript
window.PAPERTRAIL_CONFIG = Object.freeze({
  APP_VERSION: "2.8.1",
  GAS_WEB_APP_URL: "PaperTrailBackendの /exec URL",
  TOKEN_STORAGE_KEY: "paperTrailAuthV1"
});
```

学生が設定する必要はありません。

## 2. GAS側のスクリプトプロパティ

既存の項目：

```text
SPREADSHEET_ID
ALLOWED_DOMAIN
ADMIN_EMAILS
OPENALEX_API_KEY
```

`OPENALEX_API_KEY` は、OpenAlex検索をGAS経由にする場合だけ任意で使います。通常の画面上のOpenAlex検索はブラウザから直接行うため、初期設定では不要です。

追加する項目：

```text
FRONTEND_ORIGIN = GitHub Pagesのオリジン
FRONTEND_URL = GitHub PagesのPaperTrail URL
AUTH_TOKEN_HOURS = 12
```

例：

```text
FRONTEND_ORIGIN = https://gunji-lab.github.io
FRONTEND_URL = https://gunji-lab.github.io/research_notebook/paper_trail
AUTH_TOKEN_HOURS = 12
```

`AUTH_TOKEN_SECRET`は初回利用時にGASが自動生成します。手入力不要です。

## 3. GASコードを更新

1. `gas/PaperTrailBackend.gs`の内容で現在のバックエンドを上書き
2. `setupPaperTrail`を実行
3. 新しいバージョンとして再デプロイ

## 4. GASのデプロイ

Physics Trainerと同じく、大学Googleアカウントを確認できる設定を使います。

- 種類：ウェブアプリ
- 実行ユーザー：ウェブアプリにアクセスしているユーザー
- アクセスできるユーザー：大学ドメイン内のユーザー

## 5. GitHubへpush

ZIPのルート一式をGitHubへpushします。

画面の修正は、以後GitHubへpushするだけで反映できます。GASを更新するのは、認証・保存形式・OpenAlex処理を変える場合だけです。

## 6. 動作確認

1. GASのWebアプリURLに`?view=app`を付けて開く
2. GASで大学アカウントを確認
3. GAS画面内にPaperTrailが表示される
5. 氏名と表示方法を保存
6. DOI検索を試す
7. Notebookを保存
8. SpreadsheetのStudents / Notebooks / Activityを確認

## 学生に渡すURL

保存まで使う場合は、GASのWebアプリURLに`?view=app`を付けたURLです。

```text
https://script.google.com/a/macros/toyo.jp/s/XXXX/exec?view=app
```

この入口はPhysics Trainerと同じ方式で、GAS画面の中にGitHub Pages版PaperTrailを表示し、
保存リクエストは親のGASページが`google.script.run`で処理します。

学生は以下を入力しません。

- GAS URL
- OpenAlex APIキー
- Spreadsheet ID
- 学籍番号
- メールアドレス

## セキュリティ

- 学籍番号はGASが大学Googleアカウントから取得
- ブラウザ自己申告は不採用
- トークンはHMAC-SHA256で署名
- 有効期限は初期値12時間
- API呼び出しごとにGASが署名と期限を検証
- メールアドレス全体はSpreadsheetへ保存しない
- 戻り先URLはFRONTEND_ORIGIN配下だけ許可


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
