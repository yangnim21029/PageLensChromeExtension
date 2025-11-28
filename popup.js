// 點擊擴充功能時自動判斷是否可分析，能分析就直接開全螢幕
(function() {
  const supportedSites = [
    { name: 'Pretty', domain: 'pretty.presslogic.com' },
    { name: 'GirlStyle', domain: 'girlstyle.com' },
    { name: 'HolidaySmart', domain: 'holidaysmart.io' },
    { name: 'UrbanLife', domain: 'urbanlifehk.com' },
    { name: 'PopLady', domain: 'poplady-mag.com' },
    { name: 'TopBeauty', domain: 'topbeautyhk.com' },
    { name: 'TheKDaily', domain: 'thekdaily.com' },
    { name: 'BusinessFocus', domain: 'businessfocus.io' },
    { name: 'MamiDaily', domain: 'mamidaily.com' },
    { name: 'ThePetCity', domain: 'thepetcity.co' }
  ];

  const supportedHostnames = supportedSites.map(site => site.domain);
  let currentTab = null;
  let autoLaunchTriggered = false;
  let lastFallbackMessage = '';

  function renderSupportedSites(container) {
    if (!container) return;
    container.innerHTML = supportedSites
      .map(site => `<span class="site-pill">${site.name} (${site.domain})</span>`)
      .join('');
  }

  function renderNavButtons(container) {
    if (!container) return;
    container.innerHTML = supportedSites
      .map(site => `<button class="nav-button" data-url="https://${site.domain}">${site.name}</button>`)
      .join('');
  }

  function revealMainContent(initialLoading, mainContent) {
    if (initialLoading) initialLoading.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
  }

  function normalizeUrl(input) {
    if (!input) return '';
    const trimmed = input.trim();
    try {
      return new URL(trimmed).toString();
    } catch {
      try {
        return new URL(`https://${trimmed}`).toString();
      } catch {
        return '';
      }
    }
  }

  function setStatus(statusIcon, statusTitle, statusSubtitle, statusCard, icon, title, subtitle, tone = 'active') {
    if (statusIcon) statusIcon.textContent = icon;
    if (statusTitle) statusTitle.textContent = title;
    if (statusSubtitle) statusSubtitle.textContent = subtitle;
    if (statusCard) statusCard.dataset.tone = tone;
  }

  function showLoading(loadingEl, loadingTextEl, show = true, text = '正在開啟全螢幕分析...') {
    if (!loadingEl) return;
    loadingEl.style.display = show ? 'flex' : 'none';
    if (show && loadingTextEl && text) {
      loadingTextEl.textContent = text;
    }
  }

  function showFallback(ui, title, message) {
    const fullMessage = message || '請直接前往支援的文章頁（需包含 /article/）再啟動插件，或貼上文章網址開啟新分頁。';
    lastFallbackMessage = fullMessage;

    // 隱藏狀態卡片，專注呈現可行動選項
    if (ui.statusCard) {
      ui.statusCard.style.display = 'none';
    }
    showLoading(ui.loading, ui.loadingText, false);

    if (ui.pageInfo) {
      ui.pageInfo.style.display = 'none';
    }
    if (ui.fallbackCard) {
      ui.fallbackCard.style.display = 'block';
    }
    if (ui.fallbackTitle) ui.fallbackTitle.textContent = title;
    if (ui.fallbackMessage) ui.fallbackMessage.textContent = fullMessage;
  }

  function updateFallbackMessage(ui, message) {
    lastFallbackMessage = message;
    if (ui.fallbackMessage) {
      ui.fallbackMessage.textContent = message;
    }
  }

  async function openUrlInNewTab(ui, url) {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      updateFallbackMessage(ui, '請輸入有效的 http/https 網址');
      return;
    }

    try {
      const parsed = new URL(normalized);
      const isSupported = supportedHostnames.includes(parsed.hostname) && parsed.pathname.includes('/article/');
      if (!isSupported) {
        updateFallbackMessage(ui, '僅支援 PressLogic/WordPress 文章頁（需包含 /article/）');
        return;
      }

      showLoading(ui.loading, ui.loadingText, true, '正在開啟全螢幕分析...');
      await chrome.storage.local.set({
        analysisData: {
          url: parsed.href,
          title: parsed.href,
          timestamp: Date.now(),
          source: 'custom-url'
        }
      });

      const fullscreenUrl = chrome.runtime.getURL('fullscreen.html?action=url');
      await chrome.tabs.create({ url: fullscreenUrl, active: true });
      window.close();
    } catch (err) {
      console.warn('無效網址:', err);
      updateFallbackMessage(ui, err.message || '網址格式不正確，請重新確認');
    } finally {
      showLoading(ui.loading, ui.loadingText, false);
    }
  }

  function evaluatePage(url) {
    if (!url) {
      return { canAnalyze: false, title: '讀不到目前頁面', message: '請確認您位於要分析的分頁後再試。' };
    }

    try {
      const urlObj = new URL(url);

      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { canAnalyze: false, title: '無法分析這類頁面', message: '僅支援一般 http/https 網站內容。' };
      }

      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
        return { canAnalyze: false, title: '這個頁面屬於瀏覽器內建頁面', message: '請在一般網站頁面上再開啟一次擴充功能。' };
      }

      if (!supportedHostnames.includes(urlObj.hostname)) {
        return { canAnalyze: false, title: '請改到支援的文章頁', message: '點選下方支援站點或貼上文章網址（需包含 /article/），開啟新分頁後再點擊插件即可分析。' };
      }

      if (!urlObj.pathname.includes('/article/')) {
        return { canAnalyze: false, title: '請前往文章頁', message: '開啟含 /article/ 的文章連結或貼上文章網址，下方提供快速導向與輸入框。' };
      }

      return { canAnalyze: true };
    } catch {
      return { canAnalyze: false, title: '無法解析目前網址', message: '請確認網址有效或重新整理頁面後再試。' };
    }
  }

  async function getCurrentPageInfo(ui) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('無法取得目前的分頁資訊');
      }

      currentTab = tab;

      if (ui.pageTitle) ui.pageTitle.textContent = tab.title || '無標題';
      if (ui.pageUrl) ui.pageUrl.textContent = tab.url || '無 URL';

      revealMainContent(ui.initialLoading, ui.mainContent);
      return tab;
    } catch (err) {
      console.error('獲取當前頁面資訊失敗:', err);
      revealMainContent(ui.initialLoading, ui.mainContent);
      showFallback(ui, '無法取得目前頁面', '請重新整理或在可分析的頁面上重試。');
      return null;
    }
  }

  async function getPageContent() {
    if (!currentTab) {
      throw new Error('找不到可分析的分頁');
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => ({
        html: document.documentElement.outerHTML,
        title: document.title,
        url: window.location.href
      })
    });

    return result.result;
  }

  async function openFullscreenAnalysis(ui, action = 'all') {
    if (!currentTab) return;

    try {
      showLoading(ui.loading, ui.loadingText, true, '正在開啟全螢幕分析...');
      setStatus(ui.statusIcon, ui.statusTitle, ui.statusSubtitle, ui.statusCard,
        '🚀', '符合條件，正在開啟全螢幕分析', '會在新分頁載入完整結果', 'active');

      await chrome.storage.local.set({
        analysisData: {
          // 只存必要欄位，減少等待
          title: currentTab.title,
          url: currentTab.url,
          timestamp: Date.now()
        }
      });

      const fullscreenUrl = chrome.runtime.getURL(`fullscreen.html?action=${action}`);
      await chrome.tabs.create({
        url: fullscreenUrl,
        active: true
      });

      window.close();
    } catch (err) {
      console.error('分析失敗:', err);
      showFallback(ui, '分析失敗', err?.message || '請檢查網路連線或稍後再試。');
    } finally {
      showLoading(ui.loading, ui.loadingText, false);
    }
  }

  async function attemptAutoLaunch(ui) {
    if (autoLaunchTriggered) return;
    autoLaunchTriggered = true;

    await openFullscreenAnalysis(ui, 'all');
  }

  async function initialize() {
    const ui = {
      initialLoading: document.getElementById('initialLoading'),
      mainContent: document.getElementById('mainContent'),
      statusCard: document.getElementById('statusCard'),
      statusIcon: document.getElementById('statusIcon'),
      statusTitle: document.getElementById('statusTitle'),
      statusSubtitle: document.getElementById('statusSubtitle'),
      pageTitle: document.getElementById('pageTitle'),
      pageUrl: document.getElementById('pageUrl'),
      pageInfo: document.getElementById('pageInfo'),
      loading: document.getElementById('loading'),
      loadingText: document.getElementById('loadingText'),
      fallbackCard: document.getElementById('fallbackCard'),
      fallbackTitle: document.getElementById('fallbackTitle'),
      fallbackMessage: document.getElementById('fallbackMessage'),
      supportedSitesList: document.getElementById('supportedSitesList'),
      navButtons: document.getElementById('navButtons'),
      customUrlInput: document.getElementById('customUrlInput'),
      openUrlBtn: document.getElementById('openUrlBtn')
    };

    // 立即顯示主要內容，不等待背景檢查
    revealMainContent(ui.initialLoading, ui.mainContent);

    renderSupportedSites(ui.supportedSitesList);
    renderNavButtons(ui.navButtons);
    setStatus(ui.statusIcon, ui.statusTitle, ui.statusSubtitle, ui.statusCard,
      '🔍', '正在檢查這個頁面...', '符合條件時會自動開啟全螢幕分析', 'active');

    if (ui.navButtons) {
      ui.navButtons.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.nav-button') && target.dataset.url) {
          openUrlInNewTab(ui, target.dataset.url);
        }
      });
    }

    if (ui.openUrlBtn && ui.customUrlInput) {
      ui.openUrlBtn.addEventListener('click', () => {
        const url = ui.customUrlInput.value.trim();
        if (!url) {
          updateFallbackMessage(ui, '請先貼上支援的文章網址（需包含 /article/）');
          return;
        }
        openUrlInNewTab(ui, url);
      });

      ui.customUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          ui.openUrlBtn.click();
        }
      });
    }

    const tab = await getCurrentPageInfo(ui);
    if (!tab || !tab.url) {
      return;
    }

    const eligibility = evaluatePage(tab.url);
    if (!eligibility.canAnalyze) {
      showFallback(ui, eligibility.title, eligibility.message);
      return;
    }

    await attemptAutoLaunch(ui);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
