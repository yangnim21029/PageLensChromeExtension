# PageLens Chrome Extension
概覽：PressLogic 文章頁的 SEO/可讀性分析工具，能自動抓取當前頁面並在全螢幕面板呈現結果，並提供快速導向支援站點的 fallback。

## 使用者：啟動插件
1. 解釋：在支援的 PressLogic 文章頁（網址需含 `/article/`）點擊插件，會自動判斷並開啟全螢幕分析。
2. 遇到狀況會是：沒有自動開啟、出現導向提示。
3. 對應的處理方式：確認網址包含 `/article/` 且屬支援站點，若被導向 fallback，點支援站點按鈕或貼上文章網址開新分頁後再點插件。

## 使用者：自動開啟全螢幕分析
1. 解釋：符合條件時，插件會抓取 HTML 存入 storage 並在新分頁載入 `fullscreen.html`。
2. 遇到狀況會是：內容較大導致等待較久，或因網路/權限失敗。
3. 對應的處理方式：耐心等待大頁面載入；若失敗重新整理頁面再點插件，或改用 fallback 導向。

## 使用者：fallback 導航與輸入框
1. 解釋：當前頁面不支援時，顯示支援站點按鈕與網址輸入框以快速前往可分析的文章頁。
2. 遇到狀況會是：貼上的網址格式不正確或未含 `/article/`。
3. 對應的處理方式：使用按鈕跳到支援站點首頁，再點入文章；或貼上正確的文章連結後按前往並重新點插件。

## 開發者：安裝與載入
1. 解釋：以未封裝模式載入此 Manifest V3 專案。
2. 遇到狀況會是：Chrome 未開啟開發者模式、載入後資源未更新。
3. 對應的處理方式：`chrome://extensions/` 開啟「開發人員模式」，點「載入未封裝項目」選本目錄；修改後於同頁點「重新載入」。

## 開發者：架構與檔案
1. 解釋：ES6 modules，`popup` 控流程、`fullscreen` 呈現結果，`modules` 內分 API/UI/WordPress。
2. 遇到狀況會是：不清楚模組關係或資源位置。
3. 對應的處理方式：參考結構  
```
PageLensBowserPanel/
├── modules/ (api.js, ui.js, wordpress.js, fullscreen.js)
├── styles/
├── popup.html/js
├── fullscreen.html
├── manifest.json
└── CLAUDE.md
```

## 開發者：支援網站設定
1. 解釋：支援站點與 `/article/` 路徑判斷在 `modules/wordpress.js` 的 `supportedSites`。
2. 遇到狀況會是：新站未被辨識或 fallback 出現。
3. 對應的處理方式：在 `supportedSites` 加入 domain，確保網址含 `/article/`；重載擴充功能後重試。

## 開發者：API 與儲存
1. 解釋：Primary API `https://page-lens-zeta.vercel.app`，fallback `http://localhost:3000`，WordPress SEO `https://article-api.presslogic.com/v1/articles/getArticleSEO`。分析資料存 `chrome.storage.local` 的 `analysisData`。
2. 遇到狀況會是：API 失敗、無法取回檢測項目、storage 未帶入。
3. 對應的處理方式：確認網路與 API 健康狀態；使用預設檢測項目；在 popup 重新取頁面以刷新 `analysisData`。

## 開發者：調試與像素寬度計算
1. 解釋：Popup/Fullscreen 可用 DevTools 偵錯；UI 模組含像素寬度與字串截斷的計算邏輯以保持版面。
2. 遇到狀況會是：樣式走位、測量結果異常。
3. 對應的處理方式：Inspect popup 或 fullscreen，檢查 UI 相關函式（如長度截斷/寬度計算）並調整樣式；重新載入擴充功能驗證。
