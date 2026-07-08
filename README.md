# 東京夏物語 — 2026/7/30–8/4 行前計畫書網站

三人東京六日遊的行前計畫網站（多頁架構）：

- `index.html` — 主頁：六日行程表
- `map.html` — 路線地圖（Leaflet + OpenStreetMap）
- `budget.html` — 預算規劃
- `ledger.html` — 旅費記帳（三機即時同步，後端 textdb.online）
- `tips.html` — 貼心小提醒
- `style.css` / `theme.js`（深淺色主題）/ `ledger.js`（記帳同步邏輯）

## 線上網址

https://jordanliu1225.github.io/tokyo-trip-2026/

## 更新方式

改完檔案後 `git add -A && git commit -m "..." && git push`，約 1 分鐘後 GitHub Pages 自動生效。
