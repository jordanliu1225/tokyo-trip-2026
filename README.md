# 東京夏物語 — 2026/7/30–8/4 行前計畫書網站

三人東京六日遊的行前計畫網站：每日行程表、路線地圖（含 Google Maps 一鍵導航）、預算規劃、貼心小提醒。

- `index.html` — 完整獨立網頁（GitHub Pages 用，雙擊也能直接在瀏覽器開啟）
- `tokyo-trip-2026.html` — Claude Artifact 發布用的內容版

## 目前線上網址（已可直接使用）

https://jordanliu1225.github.io/tokyo-trip-2026

## 部署到 GitHub Pages（三步驟）

1. 到 https://github.com/new 建立新 repo（例如 `tokyo-trip-2026`，Public）
2. 在本資料夾執行：
   ```
   git init
   git add .
   git commit -m "Tokyo trip plan site"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/tokyo-trip-2026.git
   git push -u origin main
   ```
3. Repo → Settings → Pages → Source 選 `main` branch / root → Save。
   幾分鐘後網站就在 `https://<你的帳號>.github.io/tokyo-trip-2026/`

> 提示：若尚未設定 git 認證，最快的方式是安裝 GitHub CLI（`winget install GitHub.cli`）後 `gh auth login`，再 `gh repo create tokyo-trip-2026 --public --source . --push`，一行完成。
