# PaperTrail v3.0 Migration Notes

## 目的

PaperTrail v3.0では、v2系で密結合になっていたHome・Notebook入力・My Notebook・Lab Notebook・Dashboardをページ単位に分離しました。UIの見た目はできるだけ維持しつつ、認証、API取得、描画、ページ遷移の責務を分け、今後2〜3年の運用・改修に耐えやすい構造にしています。

## 新しい構成

| 画面 | ファイル | 主な責務 |
| --- | --- | --- |
| Home | `index.html`, `js/home.js` | 入口、最近の続き、ラボ最近の動き |
| Research Notebook | `notebook.html`, `notebook.js` | 論文を読む・入力・autosave・保存 |
| My Notebook | `my_notebook.html`, `js/my_notebook.js` | 自分のNotebook一覧、検索、フィルタ、続きを読む、「へぇ！」「なんで？」 |
| Lab Notebook | `lab_notebook.html`, `js/lab_notebook.js` | ラボ共有Notebook一覧、検索、フィルタ |
| Dashboard | `dashboard.html`, `js/dashboard.js` | 学習分析、読解レベル別集計 |
| 共通 | `js/common.js` | HTML escape、toast、カード変換、カード描画、検索・フィルタ共通処理 |
| CSS入口 | `css/style.css`, `css/components.css` | v3用CSS入口。現時点では既存 `styles.css` を維持して読み込む |

## 旧構造から新構造への対応表

| v2の構造 | v3の構造 |
| --- | --- |
| `index.html#home` / `?view=home` | `index.html` |
| `index.html#new` / `?view=new` | `notebook.html` |
| `index.html#mine` / `?view=mine` | `my_notebook.html` |
| `index.html#lab` / `?view=lab` | `lab_notebook.html` |
| `index.html#dashboard` / `?view=dashboard` | `dashboard.html` |
| `app.js` の `switchView()` | ページ遷移。`app.js` は旧URL互換用shimのみ |
| My Notebook描画 in `app.js` | `js/my_notebook.js` |
| Lab Notebook描画 in `app.js` | `js/lab_notebook.js` |
| Dashboard描画 in `app.js` | `js/dashboard.js` |
| 共通カード変換・描画 in `app.js` | `js/common.js` |

## GAS連携

GAS認証後の戻り先もv3構成に合わせました。

- GitHub Pages上の各ページからログインした場合は、そのページに戻ります。
- `view=app&route=mine` は `my_notebook.html` をiframe内で開きます。
- `view=app&route=lab` は `lab_notebook.html` を開きます。
- `view=app&route=dashboard` は `dashboard.html` を開きます。
- `route=page-careful-overview` のようなNotebook内ページ指定は、引き続き `#auth=...&route=...` としてNotebook側へ渡します。

## 運用メモ

- GASへ貼り替える対象は `gas/PaperTrailBackend.gs` と `gas/AppShell.html` です。
- `gas/Code.gs` は旧ローカル保存プロトタイプ用のscaffoldであり、v3運用の主系ではありません。
- 旧URL互換のため `app.js` は残していますが、新画面では読み込みません。
- 今後の新機能は、原則として該当ページのJSに閉じ込め、共通化が必要になった時だけ `js/common.js` へ移します。
