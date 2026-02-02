/**
 * PageLens SEO 分析器主模組
 * 整合所有子模組並管理分析流程
 */
import { PageLensAPI } from './api.js';
import { UI } from './ui.js';
import { WordPress } from './wordpress.js';
import { writingHelper } from './seo-writing-helper.js';

class PageLensAnalyzer {
  constructor() {
    // 初始化模組
    this.api = new PageLensAPI();
    this.ui = new UI();
    this.wordpress = new WordPress();

    // 初始化狀態
    this.pageData = null;
    this.analysisResult = null;
    this.pendingDeepLinkAction = null;

    this.init();
  }

  async init() {
    try {
      // 初始化 header 滾動效果
      this.initHeaderScrollEffect();

      // 從 Chrome storage 載入頁面資料
      const result = await chrome.storage.local.get(['analysisData']);
      if (result.analysisData) {
        this.pageData = result.analysisData;
        console.log('載入頁面資料:', this.pageData);

        // 顯示頁面資訊
        this.ui.renderPageInfo(this.pageData);

        // 顯示 HTML 元素分析
        if (this.pageData.html) {
          this.ui.renderHtmlElements(this.pageData.html);
        }

        // 檢查是否為 WordPress 站點，如果是則自動分析
        if (this.pageData.url && this.wordpress.isSupportedSite(this.pageData.url)) {
          console.log('檢測到 WordPress 站點，自動開始分析...');
          // 預填 URL 到輸入框
          const customUrlInput = document.getElementById('customUrlInput');
          if (customUrlInput) {
            customUrlInput.value = this.pageData.url;
          }

          // 顯示自動分析提示
          this.ui.showToast('檢測到 WordPress 文章，正在自動分析...', 'info');

          // 延遲一下讓 UI 渲染完成後再開始分析
          setTimeout(() => {
            this.analyzeCustomUrl();
          }, 1000);
        } else if (this.pageData.url) {
          // 非 WordPress 站點，顯示提示
          this.ui.showToast('目前僅支援 WordPress/PressLogic 站點分析，請在下方輸入 WordPress 文章網址', 'warning');
        }
      } else {
        // 沒有頁面資料，顯示提示
        console.warn('沒有找到分析資料');
        this.ui.renderPageInfo({
          title: '請從擴充功能彈窗開啟',
          url: '請在要分析的網頁上點擊擴充功能圖示',
          description: '然後點擊「開啟全螢幕分析」按鈕'
        });
        this.ui.renderHtmlElements('<p>無內容</p>');
      }

      // 初始化標籤頁
      this.initTabs();

      // 綁定事件監聽器
      this.bindEventListeners();

      // 處理 Deep Linking (來自 Popup 的快速操作)
      this.handleDeepLinking();

    } catch (error) {
      console.error('初始化失敗:', error);
      this.ui.showError('初始化失敗: ' + error.message);
    }
  }

  /**
   * 初始化 header 滾動效果
   */
  initHeaderScrollEffect() {
    const header = document.querySelector('header');
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    // 添加點擊標題回到頂部功能
    const headerTitle = header.querySelector('h1');
    if (headerTitle) {
      headerTitle.style.cursor = 'pointer';
      headerTitle.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * 初始化標籤頁
   */
  initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contentWrapper = document.getElementById('contentWrapper');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });
  }

  /**
   * 切換標籤頁
   */
  switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contentWrapper = document.getElementById('contentWrapper');

    // 更新按鈕狀態
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 更新內容顯示
    if (tabId === 'url') {
      contentWrapper.classList.add('tab-url-mode');
      this.switchPanelSection('settings');
    } else {
      contentWrapper.classList.remove('tab-url-mode');
      this.switchPanelSection('results');
    }
  }

  /**
   * 切換右側面板分頁
   */
  switchPanelSection(panelId) {
    // 簡化設計後僅保留單一面板，函數保持兼容
    return panelId;
  }

  /**
   * 處理 Deep Linking
   */
  handleDeepLinking() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (!action || action === 'all') return;

    this.pendingDeepLinkAction = action;

    // 預先切換到結果分頁，待分析完成後再進行篩選
    this.switchPanelSection('results');

    // 如果結果已經存在，立即應用篩選；否則在分析完成後應用
    this.applyDeepLinkActionIfNeeded();
  }

  /**
   * 套用來自 Popup 的 Deep Link 動作
   */
  applyDeepLinkActionIfNeeded(actionOverride = null) {
    const action = actionOverride || this.pendingDeepLinkAction;
    if (!action) return;

    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer || !resultsContainer.classList.contains('show')) {
      return;
    }

    const filterMap = {
      keywords: 'keywords',
      readability: 'readability',
      suggestions: 'suggestions',
      seo: 'all'
    };

    const messages = {
      keywords: '已聚焦關鍵字相關問題',
      readability: '已聚焦可讀性改善',
      suggestions: '只顯示需要改進的項目',
      seo: '已跳至分析結果'
    };

    this.switchPanelSection('results');
    resultsContainer.scrollIntoView({ behavior: 'smooth' });

    const filterType = filterMap[action] || 'all';
    if (this.ui.filterResults) {
      this.ui.filterResults(filterType);
    }

    if (messages[action]) {
      this.ui.showToast(messages[action], 'info');
    }

    this.pendingDeepLinkAction = null;
  }

  /**
   * 切換至結果分頁並隱藏空狀態
   */
  revealResultsPanel() {
    const emptyState = document.getElementById('resultsEmptyState');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    this.switchPanelSection('results');
  }

  populateForm() {
    if (!this.pageData) return;

    const urlInput = document.getElementById('urlInput');
    urlInput.value = this.pageData.url || '';

    // 設定關鍵字
    const focusKeyword = document.getElementById('focusKeyword');
    if (this.pageData.focusKeyword) {
      focusKeyword.value = this.pageData.focusKeyword;
    } else if (this.pageData.title) {
      focusKeyword.placeholder = `例如: ${this.pageData.title.split(' ')[0]}`;
    }
  }

  async loadAssessments() {
    try {
      // 檢查 API 健康狀態
      const isHealthy = await this.api.healthCheck();
      if (!isHealthy) {
        console.warn('API 服務不可用，使用預設檢測項目');
        this.ui.renderDefaultAssessments();
        return;
      }

      // 由於新 API 沒有 assessments 端點，直接使用預設檢測項目
      this.ui.renderDefaultAssessments();

    } catch (error) {
      console.error('載入檢測項目失敗:', error);
      this.ui.showError('無法連接到 PageLens API 服務，請檢查網路連接');
      this.ui.renderDefaultAssessments();
    }
  }

  async tryFetchWordPressKeywords() {
    if (!this.pageData || !this.pageData.url) return;

    // 如果不是支援的站點，直接跳過
    if (!this.wordpress.isSupportedSite(this.pageData.url)) {
      console.log('非 WordPress 站點，跳過關鍵字獲取');
      return;
    }

    try {
      // 設定超時時間為 3 秒
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('獲取關鍵字超時')), 3000)
      );

      const fetchPromise = this.wordpress.fetchKeywordsFromWordPress(this.pageData.url);

      // 使用 Promise.race 實現超時控制
      const result = await Promise.race([fetchPromise, timeoutPromise]);

      // 處理新的返回格式
      if (result && result.keywords && result.keywords.length > 0) {
        const focusKeyword = document.getElementById('focusKeyword');
        if (!focusKeyword.value) {
          // 如果有完整的焦點關鍵字，顯示完整版本
          if (result.fullFocusKeyword) {
            focusKeyword.value = result.fullFocusKeyword;
            this.ui.showToast(`自動填入關鍵字: ${result.keywords[0]} (焦點關鍵字)`, 'success');
          } else {
            focusKeyword.value = result.keywords[0];
            this.ui.showToast(`自動填入關鍵字: ${result.keywords[0]}`, 'success');
          }
        }
      }
    } catch (error) {
      console.warn('獲取 WordPress 關鍵字失敗或超時:', error.message);
      // 不顯示錯誤給用戶，因為這是可選功能
    }
  }

  bindEventListeners() {
    // WordPress URL 分析按鈕
    const analyzeUrlBtn = document.getElementById('analyzeUrlBtn');
    if (analyzeUrlBtn) {
      analyzeUrlBtn.addEventListener('click', () => this.analyzeCustomUrl());
    }

    // Enter 鍵提交 URL
    const customUrlInput = document.getElementById('customUrlInput');
    if (customUrlInput) {
      customUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.analyzeCustomUrl();
        }
      });

      // 即時驗證網址格式
      ['input', 'blur'].forEach(eventName => {
        customUrlInput.addEventListener(eventName, () => this.validateCustomUrlInput());
      });
    }

    // 使用說明按鈕
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.showHelpModal());
    }

    // 語言選擇器
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
      languageSelector.addEventListener('change', (e) => {
        this.ui.setLanguage(e.target.value);
        // 如果已有分析結果，重新渲染
        if (this.analysisResult) {
          this.ui.renderAnalysisResults(this.analysisResult);
        }
      });
    }

    const refreshBtn = document.getElementById('refreshPageBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshPage());
    }

    // AI 建議按鈕 (事件委派)
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.ai-suggest-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const type = btn.dataset.type;
        const contextStr = btn.dataset.context;
        try {
          const context = JSON.parse(contextStr);
          await this.handleAISuggest(type, context, btn);
        } catch (err) {
          console.error("Context parse error", err);
          this.ui.showError("無法解析上下文資料", true);
        }
      }
    });

    // 寫作小幫手按鈕 (事件委派)
    document.addEventListener('click', (e) => {
      const helperBtn = e.target.closest('.writing-helper-btn');
      if (helperBtn) {
        e.preventDefault();
        e.stopPropagation();
        const helperType = helperBtn.dataset.helperType;
        const contextStr = helperBtn.dataset.context;
        try {
          const context = JSON.parse(contextStr || '{}');
          // 添加頁面資料到 context
          if (this.pageData) {
            context.title = context.title || this.pageData.title;
            context.metaDescription = context.metaDescription || this.pageData.description;
          }
          writingHelper.open(helperType, context);
        } catch (err) {
          console.error("Writing helper context parse error", err);
          this.ui.showError("無法開啟寫作小幫手", true);
        }
      }
    });

    // AI 圖片選擇 (事件委派)
    document.addEventListener('click', (e) => {
      const option = e.target.closest('.ai-image-option');
      if (option) {
        e.preventDefault();
        e.stopPropagation();

        // 切換選取狀態
        const container = option.closest('.ai-review-container');
        container.querySelectorAll('.ai-image-option').forEach(el => el.classList.remove('selected'));
        option.classList.add('selected');

        // 更新輸入框
        const input = container.querySelector('.ai-review-input');
        if (input) {
          input.value = option.dataset.src;
          input.dataset.selectedImg = option.dataset.src;
        }
      }
    });

    // AI Review 按鈕 (事件委派)
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.ai-review-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        await this.handleAIReview(btn);
      }
    });

    // 初始化寫作小幫手
    writingHelper.api = this.api;
    writingHelper.init();
  }

  /**
   * 處理 AI Review 請求
   */
  async handleAIReview(btnElement) {
    if (btnElement.disabled) return;

    const container = btnElement.closest('.ai-review-container');
    const input = container.querySelector('.ai-review-input');
    const resultArea = container.querySelector('.ai-review-result');
    const text = input.value.trim();

    if (!text) {
      this.ui.showToast('請輸入要 review 的內容', 'warning');
      return;
    }

    const type = btnElement.dataset.assessmentId;
    const contextStr = btnElement.dataset.context;

    let task = 'rewrite';
    let apiText = text;

    if (type === 'IMAGES_MISSING_ALT') {
      task = 'alt';
      // If text looks like a URL (which it will if selected from list), use it as src
      // Otherwise, the backend will treat it as text
    } else if (type.includes('TITLE')) task = 'rewrite';
    else if (type.includes('META')) task = 'rewrite';
    else if (type.includes('ALT')) task = 'alt';
    else task = 'rewrite';

    // UI Loading state
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span>⏳</span>...';
    btnElement.disabled = true;
    btnElement.style.opacity = '0.7';

    resultArea.style.display = 'block';
    resultArea.innerHTML = '<span>✨</span> AI 正在分析建議中...';

    try {
      const response = await this.api.callWritingAssistant({
        task: task,
        text: text,
        context: contextStr,
        language: 'zh-TW'
      });

      if (response.success) {
        let resultHtml = `<strong>✨ AI 建議：</strong><br>${response.processedText}`;
        if (response.explanation) {
          resultHtml += `<br><br><small style="color: #666; font-style: italic;">💡 ${response.explanation}</small>`;
        }
        if (response.alternatives && response.alternatives.length > 0) {
          resultHtml += `<div style="margin-top: 8px; border-top: 1px dashed #ddd; padding-top: 8px;">`;
          resultHtml += `<strong>💡 其他方案：</strong><ul style="margin: 4px 0; padding-left: 20px;">`;
          response.alternatives.forEach(alt => {
            const altText = typeof alt === 'object' ? (alt.text || alt.content || JSON.stringify(alt)) : alt;
            resultHtml += `<li>${altText}</li>`;
          });
          resultHtml += `</ul></div>`;
        }
        resultArea.innerHTML = resultHtml;
      } else {
        throw new Error(response.error || 'AI 處理失敗');
      }
    } catch (error) {
      console.error('AI Review Error:', error);
      resultArea.innerHTML = `<span style="color: var(--color-error);">❌ 抱歉，AI 暫時無法提供建議 (${error.message})</span>`;
    } finally {
      btnElement.innerHTML = originalText;
      btnElement.disabled = false;
      btnElement.style.opacity = '1';
    }
  }

  /**
   * 刷新分析結果
   */
  refreshPage() {
    const refreshBtn = document.getElementById('refreshPageBtn');
    const contentWrapper = document.getElementById('contentWrapper');
    const customUrlInput = document.getElementById('customUrlInput');
    const customUrl = customUrlInput ? customUrlInput.value.trim() : '';
    const isUrlMode = contentWrapper?.classList.contains('tab-url-mode');

    if (refreshBtn) {
      refreshBtn.classList.add('refreshing');
      refreshBtn.disabled = true;
    }

    const finish = () => {
      if (refreshBtn) {
        refreshBtn.classList.remove('refreshing');
        refreshBtn.disabled = false;
      }
    };

    // 依模式觸發對應分析，避免重整後資料消失
    const runRefresh = async () => {
      // 若使用者正在輸入或查看 WordPress URL，優先重跑 URL 分析
      if (isUrlMode && customUrl) {
        await this.analyzeCustomUrl();
        return;
      }

      // 若有自訂 URL 且屬於支援站點，也直接重跑 URL 分析
      if (customUrl && this.wordpress.isSupportedSite(customUrl)) {
        await this.analyzeCustomUrl();
        return;
      }

      // 否則重跑當前頁面的分析
      await this.performAnalysis();
    };

    runRefresh()
      .catch((error) => {
        console.error('重新整理分析失敗:', error);
        this.ui.showError('重新整理失敗: ' + error.message, true);
      })
      .finally(finish);
  }

  async performAnalysis() {
    if (!this.pageData) {
      this.ui.showError('沒有頁面資料可供分析', true);
      return;
    }

    try {
      this.ui.results.showSkeleton?.();
      this.ui.showLoading(true, '正在整理頁面內容...', 20);

      // 準備分析請求
      const analysisRequest = this.prepareAnalysisRequest();
      this.ui.setLoadingStatus('驗證檢測配置...', 35);

      // 設定 UI 語言（從選擇器獲取，預設中文）
      const languageSelector = document.getElementById('languageSelector');
      const language = languageSelector ? languageSelector.value : 'zh-TW';
      this.ui.setLanguage(language);

      // 調試：查看請求內容
      console.log('=== 分析請求詳情 ===');
      console.log('頁面 URL:', analysisRequest.pageDetails.url);
      console.log('頁面標題:', analysisRequest.pageDetails.title);
      console.log('HTML 內容長度:', analysisRequest.htmlContent?.length || 0);
      console.log('HTML 內容是否存在:', !!analysisRequest.htmlContent);
      console.log('HTML 內容開頭:', analysisRequest.htmlContent?.substring(0, 200) || '無');

      // 顯示 HTML 大小信息
      if (analysisRequest.htmlContent) {
        const htmlSize = new Blob([analysisRequest.htmlContent]).size;
        const sizeInMB = (htmlSize / (1024 * 1024)).toFixed(2);
        console.log(`HTML 內容大小: ${sizeInMB} MB`);

        if (htmlSize > 5 * 1024 * 1024) {
          console.warn('HTML 內容較大，API 處理可能需要更多時間');
        }
      } else {
        console.error('❌ HTML 內容為空！');
      }

      console.log('焦點關鍵字:', analysisRequest.focusKeyword || '無');
      console.log('相關關鍵字:', analysisRequest.relatedKeywords || '無');
      console.log('語言設定:', analysisRequest.pageDetails.language);
      console.log('檢測配置:', analysisRequest.options.assessmentConfig);

      const isWordPressSite = this.wordpress.isSupportedSite(this.pageData.url);
      if (isWordPressSite) {
        console.log('WordPress 站點模式 (extractMainContent: true) - 使用內容萃取');
      } else {
        console.log('外站模式 - 使用指定的 contentSelectors');
        console.log('內容選擇器:', analysisRequest.options.contentSelectors);
        console.log('排除選擇器:', analysisRequest.options.excludeSelectors);
      }

      // 調試：檢查完整的請求物件
      console.log('完整請求物件:', JSON.stringify({
        htmlContent: analysisRequest.htmlContent ? `[${analysisRequest.htmlContent.length} chars]` : null,
        pageDetails: analysisRequest.pageDetails,
        focusKeyword: analysisRequest.focusKeyword,
        relatedKeywords: analysisRequest.relatedKeywords,
        options: analysisRequest.options
      }, null, 2));

      this.ui.setLoadingStatus('正在分析中，請稍候...', 55);

      // 發送分析請求
      const result = await this.api.analyzePage(analysisRequest);

      // 調試：查看回應
      console.log('=== API 回應詳情 ===');
      console.log('API 回應狀態:', result.success);
      console.log('整體分數:', result.report?.overallScores);
      console.log('詳細問題數量:', result.report?.detailedIssues?.length || 0);
      if (result.report?.detailedIssues?.length > 0) {
        console.log('前 3 個檢測項目:', result.report.detailedIssues.slice(0, 3));
      }

      // API v2.0 新增的回應信息
      if (result.processingTime) {
        console.log('處理時間:', result.processingTime, 'ms');
      }
      if (result.apiVersion) {
        console.log('API 版本:', result.apiVersion);
      }

      if (result.success) {
        this.ui.setLoadingStatus('整理分析結果...', 85);
        this.analysisResult = result.report;
        this.ui.renderAnalysisResults(this.analysisResult);
        this.revealResultsPanel();
        this.applyDeepLinkActionIfNeeded();
      } else {
        throw new Error(result.error || '分析失敗');
      }

    } catch (error) {
      console.error('分析失敗:', error);
      this.ui.showError('分析失敗: ' + error.message, true);
    } finally {
      this.ui.showLoading(false);
    }
  }

  /**
   * 即時驗證自訂網址並顯示提示
   */
  validateCustomUrlInput(showToast = false) {
    const customUrlInput = document.getElementById('customUrlInput');
    const feedback = document.getElementById('urlFeedback');

    if (!customUrlInput || !feedback) {
      return { isValid: false, url: '' };
    }

    const url = customUrlInput.value.trim();
    if (!url) {
      feedback.className = 'inline-feedback error';
      feedback.textContent = '請輸入要分析的網址';
      if (showToast) {
        this.ui.showError('請輸入要分析的網址', true);
      }
      customUrlInput.classList.remove('invalid');
      return { isValid: false, url: '' };
    }

    const validation = this.wordpress.validateUrl(url);
    if (!validation.isValid) {
      feedback.className = 'inline-feedback error';
      feedback.textContent = validation.error;
      customUrlInput.classList.add('invalid');
      if (showToast) {
        this.ui.showError(validation.error, true);
      }
      return { isValid: false, url };
    }

    // 進一步檢查支援的站點與路徑
    try {
      const supportedSites = this.wordpress.getSupportedSites();
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;

      // 支援的主機但不是文章頁
      if (supportedSites.includes(hostname) && !pathname.includes('/article/')) {
        const message = '請輸入文章頁面網址（需包含 /article/）';
        feedback.className = 'inline-feedback error';
        feedback.innerHTML = `❌ ${message}`;
        customUrlInput.classList.add('invalid');
        if (showToast) {
          this.ui.showError(message, true);
        }
        return { isValid: false, url };
      }

      // 不支援的主機
      if (!supportedSites.includes(hostname)) {
        const message = `目前僅支援 PressLogic/WordPress 網域，偵測到 ${hostname}`;
        feedback.className = 'inline-feedback error';
        feedback.innerHTML = `❌ ${message}`;
        customUrlInput.classList.add('invalid');
        if (showToast) {
          this.ui.showError(message, true);
        }
        return { isValid: false, url };
      }

      // 皆符合
      feedback.className = 'inline-feedback success';
      feedback.innerHTML = `
        <span class="pill">✔ 格式正確</span>
        <span>${hostname} /article/</span>
      `;
      customUrlInput.classList.remove('invalid');

      return { isValid: true, url };
    } catch (error) {
      console.warn('URL 解析失敗:', error);
      return { isValid: false, url };
    }
  }

  async analyzeCustomUrl() {
    const { isValid, url } = this.validateCustomUrlInput(true);
    if (!isValid) return;

    try {
      this.ui.results.showSkeleton?.();
      this.ui.showLoading(true, '正在驗證網址格式...', 20);

      // 設定 UI 語言（從選擇器獲取，預設中文）
      const languageSelector = document.getElementById('languageSelector');
      const language = languageSelector ? languageSelector.value : 'zh-TW';
      this.ui.setLanguage(language);

      // 檢查是否為支持的 WordPress 站點
      if (!this.wordpress.isSupportedSite(url)) {
        const supportedSites = this.wordpress.getSupportedSites();

        // 檢查是否為支援的網域但不是文章頁
        const hostname = new URL(url).hostname;
        if (supportedSites.includes(hostname)) {
          throw new Error('請輸入文章頁面網址（需包含 /article/）。標籤頁、分類頁等其他頁面暫不支援。');
        } else {
          throw new Error(`目前僅支援 WordPress/PressLogic 站點的文章頁面分析。支援的站點包括：${supportedSites.join(', ')}`);
        }
      }

      this.ui.setLoadingStatus('組裝分析請求...', 45);

      // 準備分析請求
      const analysisRequest = this.wordpress.prepareAnalysisRequest(url);

      this.ui.setLoadingStatus('正在分析中，請稍候...', 65);

      // 發送到新的 WordPress URL 分析端點
      const result = await this.api.analyzeWordPressUrl(analysisRequest);

      if (result.success) {
        this.ui.setLoadingStatus('整理分析結果...', 85);
        this.analysisResult = result.report;

        // 調試：查看 API 返回的數據結構
        console.log('API 返回數據:', result);
        console.log('WordPress 數據:', result.wordpressData);
        console.log('頁面理解資訊:', result.pageUnderstanding);

        // 更新左側面板顯示 WordPress 數據
        const wordpressData = this.wordpress.formatWordPressData(url, result.wordpressData);
        this.ui.renderPageInfo(wordpressData);

        // 對於 WordPress URL 分析，顯示簡化的 HTML 結構信息
        // 傳遞 pageUnderstanding 資料（如果有的話）
        this.ui.renderWordPressHtmlInfo(result.wordpressData, result.pageUnderstanding);

        // 更新右側面板顯示分析結果
        this.ui.renderAnalysisResults(this.analysisResult);
        this.revealResultsPanel();
        this.applyDeepLinkActionIfNeeded();

        // 保留輸入框中的網址，方便用戶重新分析或修改
        // customUrlInput.value = '';  // 移除清空輸入框的程式碼

        this.ui.showToast('URL 分析完成', 'success');

      } else {
        throw new Error(result.error || '分析失敗');
      }

    } catch (error) {
      console.error('自定義 URL 分析失敗:', error);
      this.ui.showError('分析失敗: ' + error.message, true);
    } finally {
      this.ui.showLoading(false);
    }
  }

  prepareAnalysisRequest() {
    let focusKeyword = document.getElementById('focusKeyword').value.trim();
    let relatedKeywords = [];

    // 特殊規則：如果關鍵字是 xxx-xxx2-xxx3 格式，分割成焦點和相關關鍵字
    if (focusKeyword && focusKeyword.includes('-')) {
      const parts = focusKeyword.split('-').map(k => k.trim());
      focusKeyword = parts[0];
      relatedKeywords = parts.slice(1);
    }

    const language = 'zh'; // 目前固定為中文
    const selectedAssessments = this.getSelectedAssessments();

    // 判斷是否為支援的 WordPress 站點
    const isWordPressSite = this.wordpress.isSupportedSite(this.pageData.url);

    const options = {
      assessmentConfig: selectedAssessments
    };

    if (isWordPressSite) {
      // WordPress 站點使用內容萃取
      options.extractMainContent = true;
    } else {
      // 外站需要指定 contentSelectors (根據 API v2.0 文檔要求)
      options.contentSelectors = ['article', 'main', '.content'];
      options.excludeSelectors = ['.ad', '.sidebar'];
    }

    return {
      htmlContent: this.pageData.html,
      pageDetails: {
        url: this.pageData.url,
        title: this.pageData.title,
        description: this.pageData.description || undefined,
        language: language
      },
      focusKeyword: focusKeyword || undefined,
      relatedKeywords: relatedKeywords.length > 0 ? relatedKeywords : undefined,
      options: options
    };
  }

  getSelectedAssessments() {
    // 使用 UI 模組的方法來獲取選中的項目（支援新舊兩種方式）
    const assessments = this.ui.getSelectedAssessments();

    // 如果有選擇特定檢測項目，使用選擇的項目
    if (assessments.length > 0) {
      return { enabledAssessments: assessments };
    }

    // 如果沒有選擇任何項目，啟用所有檢測 (根據 API 文檔)
    return {
      enableAllSEO: true,
      enableAllReadability: true
    };
  }


  showHelpModal() {
    // 直接以新分頁開啟說明（外部連結或 README）
    chrome.tabs.create({
      url: 'https://docs.google.com/presentation/d/19W7ib6VGXHYqBHgyYbIXQbtUGGvcrBlC4OGdTKJHNc8/edit?usp=sharing',
      active: true
    });
  }

  /**
   * 處理 AI 建議請求
   */
  async handleAISuggest(type, context, btnElement) {
    if (btnElement.disabled) return;

    // UI Loading state
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span>⏳</span> 思考中...';
    btnElement.disabled = true;
    btnElement.style.opacity = '0.7';

    try {
      let adviceData;

      if (type === 'IMAGES_MISSING_ALT') {
        const images = context.missingImages || [];
        if (images.length === 0) {
          throw new Error("沒有找到缺少的圖片來源");
        }

        // 分析第一張圖片
        const imageSrc = images[0];
        // 截斷過長的 URL 顯示
        const displayUrl = imageSrc.length > 30 ? imageSrc.substring(0, 30) + '...' : imageSrc;

        adviceData = await this.api.analyzeAIAlt({
          imageSrc,
          context: "Context unavailable"
        });

        // 標記這是針對哪張圖片的
        if (adviceData && adviceData.advice) {
          adviceData.advice.critique = `(針對圖片: ${displayUrl}) ` + adviceData.advice.critique;
        }

      } else {
        // Meta/Title
        const pageTitle = this.pageData.title || "";
        const pageDesc = this.pageData.description || "";
        const content = this.pageData.html || "";
        const keyword = document.getElementById('focusKeyword') ? document.getElementById('focusKeyword').value.trim() : "";

        adviceData = await this.api.analyzeAIMeta({
          title: pageTitle,
          description: pageDesc,
          content,
          keyword
        });
      }

      if (adviceData && adviceData.advice) {
        const { critique, suggestions, educationalContext } = adviceData.advice;
        const html = `
           <div class="ai-advice-box" style="
             margin-top: 10px; padding: 12px; background: #f0f7ff; 
             border-radius: 6px; border-left: 4px solid #6366f1;
             font-size: 0.9rem; color: #333; width: 100%;
             animation: fadeIn 0.3s ease-in-out;
           ">
             <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div style="font-weight:bold; color:#4f46e5;">🤖 AI 分析報告</div>
                <div style="font-size:0.8em; color:#888;">Powered by PageLens AI</div>
             </div>
             
             <div style="margin-bottom:12px; line-height:1.5;">${critique}</div>
             
             <div style="font-weight:bold; color:#4f46e5; margin-bottom:6px;">💡 建議改善</div>
             <ul style="margin:0 0 12px 1.2em; padding:0; line-height:1.5;">
               ${suggestions.map(s => `<li>${s}</li>`).join('')}
             </ul>
             
             <div style="font-size: 0.85em; color: #555; background: rgba(99, 102, 241, 0.1); padding: 8px; border-radius: 4px;">
               📚 <strong>知識小補帖:</strong> ${educationalContext}
             </div>
           </div>
           <style>
             @keyframes fadeIn {
               from { opacity: 0; transform: translateY(-5px); }
               to { opacity: 1; transform: translateY(0); }
             }
           </style>
         `;

        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.width = '100%';

        // 插入到按鈕所在的父容器中 (issue-card 的右側列)
        // 按鈕在 <div style="display:flex; flex-direction:column...">
        btnElement.parentNode.appendChild(container);

        // 移除按鈕
        btnElement.remove();
      } else {
        throw new Error("AI 無法提供建議");
      }

    } catch (e) {
      console.error("AI Error", e);
      this.ui.showToast("AI 分析失敗: " + e.message, 'error');
      // 恢復按鈕狀態
      btnElement.innerHTML = originalText;
      btnElement.disabled = false;
      btnElement.style.opacity = '1';
    }
  }

}

// 初始化分析器
document.addEventListener('DOMContentLoaded', () => {
  new PageLensAnalyzer();
});
