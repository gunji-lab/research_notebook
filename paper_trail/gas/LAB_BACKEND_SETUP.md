# PaperTrail Lab Backend セットアップ

## 1. Spreadsheetを作成

空のGoogle Spreadsheetを1つ作成します。シートはGASが自動作成するため、空のままで構いません。

URL内のSpreadsheet IDを控えます。

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 2. GASプロジェクトを作成

`PaperTrailBackend.gs` を貼り付けます。

既存のOpenAlexプロキシを統合する場合は、同じGASプロジェクトに置けます。

## 3. スクリプトプロパティ

GASの「プロジェクトの設定」から、次を登録します。

```text
SPREADSHEET_ID = 作成したSpreadsheetのID
ALLOWED_DOMAIN = toyo.jp
ADMIN_EMAILS = 教員の大学メールアドレス
OPENALEX_API_KEY = OpenAlexのAPIキー（OpenAlexも同じGASへ統合する場合）
```

`ADMIN_EMAILS` はカンマ区切りで複数指定できます。

## 4. 初期セットアップ

GASエディタから `ensureSheets_` を一度実行し、権限を承認します。

次の5シートが作成されます。

- Students
- Notebooks
- Trails
- Activity
- PaperCache

## 5. ウェブアプリとしてデプロイ

大学Google Workspace内で `Session.getActiveUser().getEmail()` を取得するため、次を基本にします。

- 実行ユーザー：**ウェブアプリにアクセスしているユーザー**
- アクセスできるユーザー：**大学ドメイン内のユーザー**

発行された `/exec` URLをPaperTrailの右下「アカウント設定」に入力します。

## 保存する個人情報

Spreadsheetには原則として次だけを保存します。

- 学籍番号：大学メールアドレスの `@` より前
- 学生が自分で決めた表示名
- 大学ドメイン

メールアドレス全体や本名は保存しません。

## 表示名について

ラボ内画面では表示名を使います。本名よりも、学生自身が決めたニックネームまたはイニシャルを推奨します。

教員が学籍番号と氏名を照合する必要がある場合は、PaperTrailとは別に管理する名簿を使用します。

## シート構造

### Students

```text
student_id
nickname
domain
created_at
updated_at
is_active
```

### Notebooks

```text
notebook_id
student_id
nickname
doi
title
reading_level
schema_version
shared
created_at
updated_at
notebook_json
```

### Trails

```text
trail_id
student_id
from_notebook_id
from_doi
to_doi
to_title
reason
created_at
```

### Activity

保存・更新・Trail作成などの操作ログです。

### PaperCache

OpenAlex・Crossref等の書誌情報キャッシュ用です。v2.5.0ではシートだけ先に作成します。

## JSON保存方針

Notebookの可変部分は `notebook_json` 1セルへ保存します。

必ず次を含めます。

```json
{
  "schema_version": "2.5.0",
  "paper": {},
  "quick": {},
  "state": {}
}
```

検索・集計に使う主要項目（DOI、タイトル、読書レベル、更新日時）は独立した列にも保存します。

## v2.6.0への更新

既存の5シートを削除する必要はありません。新しい `PaperTrailBackend.gs` に差し替えたあと、公開関数 `setupPaperTrail` を実行してください。足りない列が右端に追加されます。

コード末尾に次がない場合は追加してください。

```javascript
function setupPaperTrail() {
  ensureSheets_();
}
```
