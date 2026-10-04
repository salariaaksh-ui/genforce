# Genforce — new developer onboarding (Claude-guided)

## For the human

1. Install the **Claude desktop app** and sign in.
2. Install **Git for Windows** from https://git-scm.com (all defaults). Claude Code needs it.
3. Make a free **GitHub account** and send your username to the project owner, who
   will invite you to `salariaaksh-ui/genforce`. Accept the invite email.
4. In the Claude app, open **Code**, pick any folder (e.g. `Documents`), and paste:

> Clone https://github.com/salariaaksh-ui/genforce.git into this folder, then read
> `genforce/docs/ONBOARDING.md` and guide me through the setup step by step.

Claude will do the rest and ask you whenever it needs something.

---

## For Claude — the setup playbook

You are onboarding a new developer onto Genforce. They share the owner's Claude
account but work on their own Windows PC. They may be new to coding: explain
each step in one or two plain sentences, run the commands yourself, and
**confirm each checkpoint before moving on**. Ask before installing software.
Never ask them to paste passwords, API keys or tokens into the chat.

### Step 1 — Tools
- Check `git --version` and `node -v`.
- If Node is missing or older than 20.9, ask permission, then install it:
  `winget install OpenJS.NodeJS.LTS`. Tell them to fully close and reopen the
  Claude app afterwards so the new PATH is picked up, then continue from Step 1.
- ✅ Checkpoint: git works and `node -v` is ≥ 20.9.

### Step 2 — Git identity
- Ask for their name and the email on their GitHub account (offer GitHub's
  private `…@users.noreply.github.com` address as an option).
- Run `git config --global user.name "<name>"` and
  `git config --global user.email "<email>"`.
- ✅ Checkpoint: `git config --global user.name` prints their name.

### Step 3 — Code
- If not already done, clone `https://github.com/salariaaksh-ui/genforce.git`.
- Read `genforce/CLAUDE.md`, `genforce/README.md` and `genforce/docs/memory/MEMORY.md`
  now — they hold the project rules and shared team memory.
- In the `genforce` folder run `npm install`. Warnings about "allow-scripts" are
  expected and harmless.
- ✅ Checkpoint: `npm install` finished without errors.

### Step 4 — Offline environment (no secrets needed)
- Copy `.env.example` to `.env`, then set exactly these lines (add any that are
  commented out or missing):
  ```env
  DATABASE_URL=pglite://.pglite
  AUTH_SECRET=<generate a random 40+ character string>
  RAZORPAY_KEY_ID=
  RAZORPAY_KEY_SECRET=
  RAZORPAY_MOCK=1
  ADMIN_EMAILS=dev-owner@example.com
  ```
  The Razorpay keys must be **empty** — any value disables the mock checkout.
- Run `npm run db:local` (seeds the offline database in `.pglite/`).
- ✅ Checkpoint: output ends with `seeded .pglite: exams + AFCAT demo + dev sessions`.

### Step 5 — Verify
- Run `npm test` (expect all tests to pass), `npm run lint` (0 errors) and
  `npm run build` (succeeds).
- Start `npm run dev` (port **3007**) using your preview/dev-server tool if you
  have one, otherwise in the background.
- Open http://localhost:3007. Show them how to sign in without Google: in the
  browser console run
  `document.cookie = "authjs.session-token=dev-session-owner; path=/"` and reload.
  That account owns a paid course and can open `/admin`. Other test accounts are
  listed in the README.
- ✅ Checkpoint: they can see the dashboard and `/admin` in their browser.

### Step 6 — GitHub push access
- Confirm they accepted the collaborator invite (the owner must send it first).
- Create a throwaway branch, push it with `git push -u origin <branch>`. Windows
  will open a browser window to sign in to GitHub — they do that themselves.
  Then delete the branch locally and remotely.
- ✅ Checkpoint: the push succeeded.
- If it fails with 403 / "permission denied": the invite isn't accepted yet —
  stop and tell them to ask the owner.

### Step 7 — Switch to the project folder
- Tell them to start a **new Code session with the `genforce` folder selected**,
  so `CLAUDE.md` and the shared memory load automatically every time.

### Step 8 — Teach the daily workflow
Explain, briefly:
1. **Start of day:** "pull latest" (`git pull` on `master`), then make a branch
   for the task: `git checkout -b feat/<short-name>`.
2. **Work** by asking Claude for changes. Offline mode never touches live data.
3. **End:** run `npm run lint && npm test && npm run build`, commit, push the
   branch, and open a pull request on GitHub. The owner reviews and merges.
4. **Never push to `master`** — it deploys to the live website immediately.
5. **Shared memory:** anything worth remembering about the project goes in
   `docs/memory/` (rules in `CLAUDE.md`) and is committed with the work, so the
   owner's Claude learns it too after the merge.
6. Don't use `pull-all.bat` / `push-all.bat` — those are the owner's scripts.

### If something breaks
- `npm run db:local` errors, or the app shows `RuntimeError: Aborted()` → stop
  the dev server, delete the `.pglite` folder, run `npm run db:local` again.
- Port 3007 busy → another dev server is running; stop it.
- Anything about real Google login, payments, R2 uploads or the live database →
  that needs the owner's keys; offline mode doesn't. Ask the owner rather than
  guessing. See `docs/memory/gotchas.md` before debugging anything else.

Finish by summarising what was set up and the daily workflow in 5 short lines.
