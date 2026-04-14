---
name: deploy
description: Build HTML, commit output, and push for GitHub Pages deployment. Usage: /deploy
---

# Deploy

Build the current presentation and push it for GitHub Pages deployment.

## Workflow

1. Detect the current presentation directory (look for `sections/` in cwd or parent).
2. Determine the presentation name from the directory structure.
3. Run `/build html` to compile slides.
4. Stage the built output with force (it is gitignored): `git add -f output/slides.html`
5. Commit: `git commit -m "deploy: {presentation-name}"`
6. Push the branch: `git push -u origin {branch-name}`
7. Report success and the expected Pages URL.

## Notes

- The `output/` directory is gitignored by default. The `git add -f` bypasses this for deployment.
- The GitHub Actions workflow on push copies the HTML to the `gh-pages` branch.
- If there is no remote configured yet, report that and suggest the user set one up.
