# PaperTrail v2.9.1 Implementation Notes

## Fixed

1. My Notebook could appear empty when the first list request ran before authentication finished. The list is now retried on `papertrail:user-ready`.
2. Existing Notebook URLs now call `getNotebook(notebookId)` and restore saved fields and reading status.
3. `quick-complete`, `careful-complete`, and `deep-complete` are recognized in labels and dashboard counts.
4. Server saves are serialized to prevent duplicate rows when autosave requests overlap before the first Notebook ID is returned.
5. Student ID matching in GAS is normalized with trim and lowercase.

## Reading flow

- Quick reading saves before the user chooses the next action.
- From quick completion, the user may stop, read carefully, or deep-dive into a selected part.
- From careful completion, the user may stop or deep-dive.
- Deep reading is optional and partial by design.

## Deployment

Upload the frontend files to GitHub Pages. Replace the GAS project files with the versions in `gas/`, save, and deploy a new web-app version. Keep the existing Script Properties.
