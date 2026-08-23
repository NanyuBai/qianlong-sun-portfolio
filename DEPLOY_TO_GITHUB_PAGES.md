# Deploy To GitHub Pages

This folder is the GitHub Pages-ready version of the portfolio site.

## Steps

1. Create an empty public GitHub repository, for example `qianlong-sun-portfolio`.
2. Open a terminal in this folder.
3. Run these commands, replacing `<username>` and `<repo>`:

```powershell
git init
git add .
git commit -m "Deploy portfolio homepage"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

4. On GitHub, open the repository.
5. Go to `Settings` -> `Pages`.
6. Under `Build and deployment`, choose `Deploy from a branch`.
7. Select branch `main` and folder `/ (root)`, then save.
8. Wait for GitHub Pages to publish the site.

The final URL is usually:

```text
https://<username>.github.io/<repo>/
```

## Notes

- Upload the contents of this folder as the repository root. Do not upload the parent project folder.
- The large source PDFs have been compressed for GitHub Pages compatibility.
- Re-run `tools/prepare_github_pages.py` from the parent project after future site edits.
