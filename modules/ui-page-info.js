/**
 * UI 頁面資訊顯示模組
 * 處理頁面基本資訊和 HTML 元素分析的顯示
 */
export class UIPageInfo {
  constructor() {
    this.originalHtmlElementsContent = '';
    this.lastExtractedHeadings = [];
    // 暫停使用從頁面直接抓取的 HTML，等待抓取策略調整
    this.disablePageHtml = true;
  }

  /**
   * 格式化關鍵字列表
   * @param {string} focusKeyword - 焦點關鍵字
   * @param {Array|string} keywords - 其他關鍵字
   * @param {Array} relatedKeywords - 相關關鍵字（從焦點關鍵字分割出來的）
   * @returns {string}
   */
  formatKeywords(focusKeyword, keywords, relatedKeywords) {
    let keywordList = [];

    // 如果有焦點關鍵字，放在第一個
    if (focusKeyword) {
      keywordList.push(focusKeyword + ' (焦點)');
    }

    // 如果有相關關鍵字（從焦點關鍵字分割出來的）
    if (relatedKeywords && relatedKeywords.length > 0) {
      relatedKeywords.forEach(kw => {
        keywordList.push(kw + ' (相關)');
      });
    }

    // 處理其他關鍵字
    if (keywords) {
      if (typeof keywords === 'string') {
        // 如果是字串，按逗號分割
        const additionalKeywords = keywords.split(',').map(k => k.trim()).filter(k => k && k !== focusKeyword);
        keywordList.push(...additionalKeywords);
      } else if (Array.isArray(keywords)) {
        // 如果是陣列，過濾掉焦點關鍵字和相關關鍵字
        const additionalKeywords = keywords.filter(k => {
          return k && k !== focusKeyword && (!relatedKeywords || !relatedKeywords.includes(k));
        });
        keywordList.push(...additionalKeywords);
      }
    }

    // 如果沒有任何關鍵字
    if (keywordList.length === 0) {
      return '無';
    }

    // 使用 - 分行顯示
    return keywordList.map((keyword, index) => {
      return `${index === 0 ? '' : '- '}${keyword}`;
    }).join('<br>');
  }

  /**
   * 安全解碼 URL 供顯示使用
   */
  safeDecodeUrl(url) {
    if (!url) return '';
    try {
      return decodeURIComponent(url);
    } catch (e) {
      try {
        return decodeURI(url);
      } catch {
        return url;
      }
    }
  }

  /**
   * 渲染頁面資訊
   * @param {Object} pageData
   */
  renderPageInfo(pageData) {
    const container = document.getElementById('pageInfoContainer');
    const displayUrl = pageData.url ? this.safeDecodeUrl(pageData.url) : '無 URL';
    // Meta image 已暫停顯示

    container.innerHTML = `
      <div class="info-item">
        <h4>Meta Title</h4>
        <div class="value">${pageData.title || '無標題'}</div>
      </div>
      ${pageData.description ? `
      <div class="info-item">
        <h4>Meta Description</h4>
        <div class="value">${pageData.description}</div>
      </div>
      ` : ''}
      ${pageData.focusKeyword || pageData.keywords ? `
      <div class="info-item">
        <h4>關鍵字清單</h4>
        <div class="value">${this.formatKeywords(pageData.focusKeyword, pageData.keywords, pageData.relatedKeywords)}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <h4>分析時間</h4>
        <div class="value">${new Date().toLocaleString('zh-TW')}</div>
      </div>
    `;

    // 同步結果卡片上的頁面 URL
    const resultsUrlEl = document.getElementById('resultsPageUrl');
    if (resultsUrlEl) {
      resultsUrlEl.textContent = displayUrl;
      resultsUrlEl.href = displayUrl;
      resultsUrlEl.setAttribute('title', displayUrl);
    }


  }

  /**
   * 渲染 WordPress URL 分析的簡化信息
   * @param {Object} wordpressData
   * @param {Object} pageUnderstanding - API v2.0 新增的頁面理解資訊
   */
  renderWordPressHtmlInfo(wordpressData, pageUnderstanding) {
    const container = document.getElementById('htmlElementsContainer');
    const useBaseContent = !this.disablePageHtml;
    const baseContent = useBaseContent
      ? (this.originalHtmlElementsContent || container.innerHTML || '')
      : (wordpressData || pageUnderstanding ? '' : (this.originalHtmlElementsContent || container.innerHTML || ''));

    if (!wordpressData && !pageUnderstanding) {
      container.innerHTML = baseContent || `
        <div class="info-item">
          <p style="text-align: center; color: var(--text-secondary);">
            WordPress URL 分析模式<br>
            <small>HTML 結構信息由 API 自動處理</small>
          </p>
        </div>
      `;
      return;
    }

    // 準備顯示內容
    let htmlContent = '';

    // 頁面理解資訊 (API v2.0 新功能)
    if (pageUnderstanding) {
      htmlContent += this.renderPageUnderstanding(pageUnderstanding);
    }

    // WordPress 特定資訊
    if (wordpressData) {
      htmlContent += this.renderWordPressInfo(wordpressData);
    }

    // 提示訊息
    htmlContent += `
      <div class="info-item" style="background: var(--color-background); border: 1px dashed var(--border-light);">
        <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          💡 提示：WordPress 文章標題會自動作為 H1 進行分析<br>
          🆕 新功能：API v2.0 使用像素寬度計算，更準確評估中文內容
        </p>
      </div>
    `;

    // 將 WordPress 資訊附加在原有 HTML 元素分析之後，不覆蓋 (若暫停 HTML 抓取則不附加 base)
    container.innerHTML = `${baseContent}${htmlContent}`;
  }

  /**
   * 渲染頁面理解資訊
   */
  renderPageUnderstanding(pageUnderstanding) {
    const headingStructure = pageUnderstanding?.headingStructure || {};

    // H1 文字
    const h1Text = (headingStructure.h1Text || '').toString().trim();

    // H2 清單：優先使用 h2Headings (含 tag/text/order)，其次 h2Texts
    const h2List = (() => {
      if (Array.isArray(headingStructure.h2Headings)) {
        return headingStructure.h2Headings
          .map(h => (typeof h === 'string' ? { text: h } : h))
          .map(h => ({
            tag: 'H2',
            text: (h.text || h.content || h.title || h.heading || h.headingText || '').toString().trim(),
            order: h.order
          }))
          .filter(h => h.text);
      }
      if (Array.isArray(headingStructure.h2Texts)) {
        return headingStructure.h2Texts
          .map(text => ({ tag: 'H2', text: (text || '').toString().trim() }))
          .filter(h => h.text);
      }
      return [];
    })();

    // 全部標題 (含層級與順序) — 若 API 已提供完整列表，優先使用避免重複
    const normalizedHeadings = Array.isArray(headingStructure.headings)
      ? headingStructure.headings.map(h => ({
        tag: (h.tag || h.tagName || h.type || '').toString().toUpperCase() || (h.level ? `H${h.level}` : 'H?'),
        text: (h.text || h.content || h.title || h.heading || '').toString().trim(),
        level: h.level,
        order: h.order
      })).filter(h => h.text)
      : [];

    const headingList = normalizedHeadings.length
      ? normalizedHeadings
      : [
          ...(h1Text ? [{ tag: 'H1', text: h1Text, order: 0 }] : []),
          ...h2List
        ];

    const h1Count = typeof headingStructure.h1Count === 'number'
      ? headingStructure.h1Count
      : (h1Text ? 1 : headingList.filter(h => (h.tag || '').toUpperCase() === 'H1').length);

    const h2Count = typeof headingStructure.h2Count === 'number'
      ? headingStructure.h2Count
      : headingList.filter(h => (h.tag || '').toUpperCase() === 'H2').length;

    const totalHeadings = typeof headingStructure.totalHeadings === 'number'
      ? headingStructure.totalHeadings
      : headingList.length;

    // Alt 文字
    const mediaInfo = pageUnderstanding?.mediaInfo || {};
    const linkInfo = pageUnderstanding?.linkInfo || {};
    const altTexts = Array.isArray(mediaInfo.altTexts)
      ? mediaInfo.altTexts
      : Array.isArray(mediaInfo.imagesWithAlt)
        ? mediaInfo.imagesWithAlt.map(img => img.alt).filter(Boolean)
        : [];

    // 內部連結列表
    const allLinks = Array.isArray(linkInfo.allLinks)
      ? linkInfo.allLinks.map(link => ({
        href: link.href || link.url || '',
        text: (link.text || link.title || '').toString().trim(),
        isExternal: !!link.isExternal,
        isNoFollow: !!link.isNoFollow,
        isUGC: !!link.isUGC,
        isSponsored: !!link.isSponsored,
        rel: link.rel,
        target: link.target
      })).filter(l => l.href)
      : [];

    const internalLinks = allLinks.length
      ? allLinks.filter(link => !link.isExternal)
      : (Array.isArray(linkInfo.internalLinkList) ? linkInfo.internalLinkList : []);

    return `
      <div class="info-item">
        <h4>📖 頁面結構分析</h4>
        <div style="margin-bottom: 1rem;">
          <strong>標題結構:</strong>
          <div style="margin-top: 0.5rem; padding-left: 1rem;">
            <p>H1: ${h1Count || 0} 個</p>
            <p>H2: ${h2Count || 0} 個</p>
            <p>總標題數: ${totalHeadings || 0} 個</p>
          </div>
        </div>
        ${headingList && headingList.length ? `
          <div style="margin-bottom: 1rem;">
            <strong>標題清單:</strong>
            <ul style="margin-top: 0.5rem; padding-left: 1.25rem; line-height: 1.6;">
              ${headingList.map(h => `
                <li><strong>${(h.tag || '').toString().toUpperCase() || 'H?'}</strong> ${h.text || h}</li>
              `).join('')}
            </ul>
          </div>
        ` : `
          <p style="margin: 0 0 1rem;">暫無標題清單資料，僅顯示統計數字。</p>
        `}
        
        ${mediaInfo ? `
          <details open style="margin-bottom: 1rem;">
            <summary style="cursor: pointer;"><strong>媒體資訊</strong></summary>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>圖片總數: ${mediaInfo.imageCount || 0} 張</p>
              ${mediaInfo.imagesWithoutAlt ? `
                <p style="color: var(--color-warning);">缺少 Alt 文字: ${mediaInfo.imagesWithoutAlt} 張</p>
              ` : ''}
              ${mediaInfo.videoCount !== undefined ? `
                <p>影片數量: ${mediaInfo.videoCount} 個</p>
              ` : ''}
              ${altTexts.length ? `
                <p style="margin-top: 0.5rem;">Alt 文字清單：</p>
                <ul style="padding-left: 1.25rem; line-height: 1.6; margin-top: 0.25rem;">
                  ${altTexts.map((alt, idx) => `
                    <li><strong>ALT ${idx + 1}</strong> ${alt}</li>
                  `).join('')}
                </ul>
              ` : ``}
            </div>
          </details>
        ` : ''}
        
        ${linkInfo ? `
          <details open>
            <summary style="cursor: pointer;"><strong>連結統計</strong></summary>
            <div style="margin-top: 0.5rem; padding-left: 1rem;">
              <p>總連結數: ${linkInfo.totalLinks || allLinks.length || 0} 個</p>
              <p>內部連結: ${linkInfo.internalLinks || internalLinks.length || 0} 個</p>
              <p>外部連結: ${linkInfo.externalLinks || (allLinks.length ? allLinks.length - internalLinks.length : 0)} 個</p>
              ${internalLinks.length ? `
                <p style="margin-top: 0.5rem;">內部連結清單：</p>
                <ul style="padding-left: 1.25rem; line-height: 1.6; margin-top: 0.25rem;">
                  ${internalLinks.map(link => `
                    <li>${
                      link.text && link.text !== (link.href || link.url || '')
                        ? `${link.text} — `
                        : ''
                    }${link.href || link.url || ''}</li>
                  `).join('')}
                </ul>
              ` : ``}
              ${allLinks.length ? `
                <p style="margin-top: 0.75rem;">全部連結清單：</p>
                <ul style="padding-left: 1.25rem; line-height: 1.6; margin-top: 0.25rem;">
                  ${allLinks.map(link => `
                    <li>
                      ${
                        link.text && link.text !== link.href
                          ? `${link.text} — `
                          : ''
                      }${link.href}
                      ${link.isExternal ? '<span style="color: var(--color-error);"> [外部]</span>' : '<span style="color: var(--color-success);"> [內部]</span>'}
                      ${link.isNoFollow ? '<span style="color: var(--color-warning);"> nofollow</span>' : ''}
                      ${link.isUGC ? '<span style="color: var(--color-warning);"> ugc</span>' : ''}
                      ${link.isSponsored ? '<span style="color: var(--color-warning);"> sponsored</span>' : ''}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
            </div>
          </details>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染 WordPress 資訊
   */
  renderWordPressInfo(wordpressData) {
    return `
      <div class="info-item">
        <h4>WordPress 文章信息</h4>
        ${wordpressData.postId ? `
          <p>文章 ID: <span class="value">${wordpressData.postId}</span></p>
        ` : ''}
        ${wordpressData.site ? `
          <p>站點: <span class="value">${wordpressData.site}</span></p>
        ` : ''}
        ${wordpressData.extractedKeywords && wordpressData.extractedKeywords.length > 0 ? `
          <p>提取的關鍵字:</p>
          <div class="element-list">
            ${wordpressData.extractedKeywords.map((keyword, index) => `
              <div class="element-item">
                <span class="tag">${index === 0 ? '關鍵字' : '相關關鍵字'}</span>
                <span class="text">${keyword}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染 HTML 元素分析
   * @param {string} html
   */
  renderHtmlElements(html) {
    const container = document.getElementById('htmlElementsContainer');
    if (this.disablePageHtml) {
      container.innerHTML = `
        <div class="info-item">
          <p class="value" style="margin: 0;">
            目前暫停顯示從頁面直接抓取的 HTML 結果，待抓取策略調整後再開啟。
          </p>
        </div>
      `;
      this.originalHtmlElementsContent = container.innerHTML;
      this.lastExtractedHeadings = [];
      return;
    }

    if (!html) {
      container.innerHTML = `
        <div class="info-item">
          <p class="value" style="margin: 0;">暫無可用的 HTML 內容。</p>
        </div>
      `;
      this.originalHtmlElementsContent = container.innerHTML;
      this.lastExtractedHeadings = [];
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 僅保留標題結構統計，圖片/連結列表不再顯示以避免與頁面基本資訊重複
    const elements = {
      headings: this.extractHeadings(doc)
    };

    container.innerHTML = `
      <div class="info-item">
        <p class="value" style="margin: 0;">
          HTML 元素詳細列表已整合至「📖 頁面結構分析」，圖片與連結明細不再重複顯示。
        </p>
      </div>
    `;

    // 保存原始 HTML 元素分析，供後續 WordPress 資訊附加時使用
    this.originalHtmlElementsContent = container.innerHTML;
    this.lastExtractedHeadings = elements.headings;
  }

  /**
   * 提取標題元素
   */
  extractHeadings(doc) {
    const headings = [];
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      doc.querySelectorAll(tag).forEach(heading => {
        headings.push({
          tag: tag.toUpperCase(),
          text: heading.textContent.trim().substring(0, 50) + (heading.textContent.trim().length > 50 ? '...' : '')
        });
      });
    });
    return headings;
  }

  /**
   * 提取圖片元素
   */
  extractImages(doc) {
    return Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      hasAlt: !!img.alt
    }));
  }

  /**
   * 提取連結元素
   */
  extractLinks(doc) {
    return Array.from(doc.querySelectorAll('a[href]')).map(link => {
      const href = link.href;
      let type = '內部';
      try {
        const linkUrl = new URL(href);
        const pageUrl = new URL(doc.location?.href || window.location.href);
        if (linkUrl.hostname !== pageUrl.hostname) {
          type = '外部';
        }
      } catch (e) {
        // 相對連結
      }
      return {
        href: href,
        text: link.textContent.trim().substring(0, 30),
        type: type
      };
    });
  }

}
