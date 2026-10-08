# lew

Your workspace for managing projects with Codex, recovering task context, and switching between branches and conversations on desktop and mobile.

## First version

- A macOS-inspired desktop: dark curved background, translucent widgets, menu bar, dock, and workspace window. Responsive interface with Cmd/Ctrl+K search.
- GitHub projects with editable instructions, branches, and open PRs.
- An isolated branch and worktree for each task.
- Conversations, events, and states persisted in Supabase Postgres.
- Codex App Server adapter: thread creation/resumption, messages, interruption, and approval requests.
- Codex account sign-in through a device code, compatible with a remote worker and a phone.
- Delivery: file selection, commits, pushes without force, draft PR creation, and CI tracking.

## On your Windows PC

From the repository directory, for example `D:\repos\lew`:

```bat
cd /d D:\repos\lew
npm install -g @openai/codex
npm ci
start-local.cmd
```

On first launch, the script creates `.env` and opens it in Notepad. Set `DATABASE_URL`, save, and run `start-local.cmd` again. Open http://localhost:3000 and connect Codex from the dock.

The launcher automatically switches to the lew directory. Windows npm installations of Codex are resolved to their official Node script, without relying on the server to execute a `.cmd` shim.

Your PC hosts the worker. Tasks continue after you close the browser as long as the server stays running and the PC stays awake. The database remains on Supabase, while worktrees and Codex history remain on your PC.

## Starting manually

Node 22.13+ and Git are required. Install Codex on the machine that will execute tasks:

```sh
npm install -g @openai/codex
npm ci
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to the **Session pooler** URL from Supabase's Connect panel. The URL and credentials remain server-side only. TLS verifies the certificate; set `SUPABASE_CA_FILE` to the Supabase certificate if your environment requires it.

```sh
node --env-file=.env server.mjs
```

Open http://localhost:3000, then select **Votre espace → Connecter Codex** (“Your workspace → Connect Codex” in the current French interface). Open the official page and enter the displayed code. Codex stores and refreshes credentials on the worker itself. If device-code sign-in is disabled for your account, enable it in ChatGPT's security settings or sign in using the Codex CLI on the worker.

Without `DATABASE_URL`, the interface displays the required configuration and does not store data locally. There is no SQLite fallback.

## Supabase

The private `lew` schema was applied to the existing `Linkedin-Prospection` project (`cxnjjgwiizummimxytsx`). It contains `projects`, `workspaces`, and `events`. Prospecting tables remain separate.

The schema is not exposed through the Data API, access for `anon` and `authenticated` is revoked, and RLS is enabled. Access happens from the server through the Postgres connection. The absence of policies is intentional for this private schema: direct client access is not intended.

`supabase/schema.sql` reproduces the initial DDL applied through the connector. For a new installation, apply it once to your own project.

## Access from a phone

Run lew on a persistent machine. Configure `LEW_HOST=0.0.0.0`, a long random `LEW_ACCESS_TOKEN`, and an HTTPS reverse proxy. The access code is requested for each new browser session. No Postgres, GitHub, or Codex credentials are sent to the browser.

This version uses one worker and one Codex account. Preserve `.lew/` and Codex's home directory: worktrees and native Codex history remain on that machine. Supabase stores metadata and events but does not replace these files. Closing the browser leaves the worker active; restarting the server marks active tasks as interrupted.

For private repositories, configure Git's credential helper on the worker. `GITHUB_TOKEN` is optional for viewing branches/PRs and does not automatically configure Git.

## Verification

```sh
npm run check
npm test
```

Tests verify the Codex protocol with a simulated process, API errors and access, selective commits, and retryable PR publication using real temporary Git repositories and a simulated GitHub transport. They do not replace a real execution on your worker or a connection test against your Postgres instance.

## GitHub delivery

Inside a task, open **Livraison** (“Delivery”) in the inspector. Review changes, select files, and create a commit. The review is invalidated if files have changed in the meantime. Untracked files are included in the selection; the current text diff covers tracked files.

**Créer une PR** (“Create a PR”) pushes commits to the task branch and opens a draft PR by default. An existing PR for that branch is reused. Uncommitted local changes remain on the worker. CI is refreshed using **Actualiser** (“Refresh”); incomplete access to checks is explicitly displayed. Merging currently happens on GitHub.

Configure a server-side GitHub token with repository access: write access to Pull requests, and read access to Checks and Commit statuses. Also configure Git's credential helper for pushes and the lew account's commit identity. The API token does not automatically configure Git credentials.

## Installing on a VPS

Files in `deploy/` prepare a Linux installation with systemd and HTTPS through Caddy. They do not provision a server.

1. Install Node 22+, npm, Git, and Caddy on the server.
2. From a lew checkout, run `sudo bash deploy/install.sh`. The script creates a lew user and installs Codex 0.159.2.
3. Configure `/etc/lew/lew.env`: Supabase connection, a long `LEW_ACCESS_TOKEN`, and optionally `GITHUB_TOKEN`.
4. Configure Git identity and credentials for the lew user.
5. Configure your domain in `deploy/Caddyfile`, point it to the server, and reload Caddy.
6. Run `sudo systemctl enable --now lew`, then inspect `sudo journalctl -u lew -f` if needed.
7. Open your domain, enter the lew access code, and connect Codex using a device code.

The service runs as the lew user. Worktrees and Codex data must remain on persistent storage. The script does not overwrite your existing configuration or start the service before you configure the connection.

## Next steps

Event pagination, idempotent command recovery, conversation summaries, and variations on a new branch. A complete real execution and the target worker's Postgres connection still need to be validated after installation.

See the documents in `docs/` for the target user journey and visual direction.

## If Supabase does not respond at startup

Lew starts its HTTP server immediately, displays the actual storage status, and retries automatically after an error. Projects can only be saved once the database is reachable. Interrupted-task recovery runs once per server startup.

For a “connection timeout” error, use **Connect → Session pooler** (port **5432**) in Supabase: direct connections generally require IPv6, while the pooler supports IPv4. Copy the exact hostname and username from the dashboard, replace the PostgreSQL password, and URL-encode special characters. Check that the project is active. In PowerShell:

```powershell
Test-NetConnection POOLER_HOST -Port 5432
```

If `TcpTestSucceeded` is false, check the network, VPN, and firewall. Run `start-local.cmd` again after any `.env` change. Do not disable TLS verification; use `SUPABASE_CA_FILE` if a certificate is required.
