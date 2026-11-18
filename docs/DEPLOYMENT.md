# Deployment & Production Operations — GuardMCP

**Target:** Security Linter & Risk Auditor for Model Context Protocol  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))

---

## 1. Container Deployment (Docker)

```bash
docker build -t guardmcp:latest .
docker run -d -p 7070:7070 --name guardmcp guardmcp:latest
```

## 2. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start dist/bin.js --name "guardmcp" -- studio --port 7070
```

## 3. Systemd Service Unit

```ini
[Unit]
Description=GuardMCP Background Service
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/guardmcp
ExecStart=/usr/bin/node dist/bin.js studio --port 7070
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
