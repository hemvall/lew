#!/usr/bin/env bash
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then echo 'Run with sudo on the target server.' >&2; exit 1; fi
for lew_command in node npm git; do command -v "$lew_command" >/dev/null || { echo "Install $lew_command first." >&2; exit 1; }; done
node -e 'if(Number(process.versions.node.split(".")[0])<22)process.exit(1)'
getent passwd lew >/dev/null || useradd --system --create-home --home-dir /var/lib/lew --shell /bin/bash lew
install -d -o lew -g lew -m 700 /var/lib/lew /opt/lew-tools
install -d -o root -g lew -m 750 /etc/lew
if [ ! -d /opt/lew/.git ]; then git clone https://github.com/hemvall/lew.git /opt/lew; fi
chown -R lew:lew /opt/lew
runuser -u lew -- npm --prefix /opt/lew ci
runuser -u lew -- npm install --prefix /opt/lew-tools --save-exact @openai/codex@0.159.2
if [ ! -f /etc/lew/lew.env ]; then
  install -o lew -g lew -m 600 /opt/lew/.env.example /etc/lew/lew.env
  sed -i 's|LEW_DATA_DIR=.lew|LEW_DATA_DIR=/var/lib/lew/workspaces|' /etc/lew/lew.env
fi
install -m 644 /opt/lew/deploy/lew.service /etc/systemd/system/lew.service
systemctl daemon-reload
printf '%s\n' 'Configure /etc/lew/lew.env (DATABASE_URL and LEW_ACCESS_TOKEN), then run: sudo systemctl enable --now lew' 'Configure Caddy with deploy/Caddyfile and your domain for HTTPS.'
