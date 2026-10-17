# simrankisuno.xyz

The built site. `index.html` is the home page, every other page sits in its own folder. No build step: push this folder and any static host serves it.

- GitHub Pages: Settings → Pages → Deploy from branch → main, root. CNAME already points at simrankisuno.xyz.
- Vercel or Netlify: import the repo, no framework, no build command, output directory is the root.

The source (words in src/data.mjs, the build script) lives in the separate `the-room` folder. Edit there, run `node build.mjs`, and copy `public/` over this folder.

## Approving notes for the wall

Every note a visitor leaves arrives in your inbox with a line called `to_approve_paste_this_into_notes_json`. To pin it for everyone, open `notes.json` here on GitHub, click the pencil, paste that line on a new line inside the brackets, and commit. Vercel redeploys in about a minute. To remove a note, delete its line.
