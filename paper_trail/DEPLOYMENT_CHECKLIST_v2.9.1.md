# PaperTrail v2.9.1 Deployment Checklist

## GitHub Pages

Upload the complete contents of the `paper_trail` folder, including:

- `index.html`
- `notebook.html`
- `app.js`
- `notebook.js`
- `papertrail_api.js`
- `papertrail_auth.js`
- `styles.css`
- assets and Markdown documents

Do not upload only the changed JavaScript files; the HTML cache-busting query strings were also updated.

## Google Apps Script

Replace `PaperTrailBackend.gs` with `gas/PaperTrailBackend.gs`. Also keep the included `AppShell.html` synchronized with the project.

Save the GAS project and deploy a **new web-app version**. Updating the source without creating a new deployment version will leave the old backend active.

## Script Properties

Keep the existing values:

- `SPREADSHEET_ID`
- `ALLOWED_DOMAIN`
- `AUTH_TOKEN_SECRET`
- `FRONTEND_URL`
- `FRONTEND_ORIGIN`
- optional `ADMIN_EMAILS` and `OPENALEX_API_KEY`

Recommended values:

```text
FRONTEND_URL=https://gunji-lab.github.io/research_notebook/paper_trail
FRONTEND_ORIGIN=https://gunji-lab.github.io
```

## Acceptance test

1. Log in through the GAS app URL.
2. Complete one quick reading and choose “Notebookに保存して終わる”.
3. Confirm that My Notebook displays the saved paper.
4. Click “続きを読む”.
5. Confirm that the title, Abstract notes, and quick-complete screen are restored.
6. Continue to careful or deep reading, save, return to My Notebook, and reopen it.
7. Confirm that no duplicate Notebook row is created for a single reading session.
