/**
 * UI 分析結果渲染模組
 * 處理 SEO 分析結果的顯示和渲染
 */
import { getAssessmentTranslation } from './assessment-translations.js';

export class UIResults {
  constructor() {
    this.currentLanguage = 'zh-TW';
  }

  showSkeleton() {
    const container = document.getElementById('resultsContainer');
    if (container) container.classList.add('show');
    const emptyState = document.getElementById('resultsEmptyState');
    if (emptyState) emptyState.style.display = 'none';
    const issuesList = document.getElementById('issuesList');
    if (!issuesList) return;
    issuesList.innerHTML = `
      <div style="display:grid; gap:10px; padding:0.5rem 0;">
        <div class="skeleton-line" style="height:16px; width:60%;"></div>
        <div class="skeleton-line" style="height:14px; width:90%;"></div>
        <div class="skeleton-line" style="height:14px; width:85%;"></div>
        <div class="skeleton-line" style="height:14px; width:80%;"></div>
      </div>
    `;
  }

  /**
   * 設定當前語言
   * @param {string} language - 語言代碼 ('zh-TW' 或 'en')
   */
  setLanguage(language) {
    this.currentLanguage = language;
  }

  /**
   * 渲染分析結果
   * @param {Object} analysisResult
   */
  renderAnalysisResults(analysisResult) {
    // 顯示結果容器
    document.getElementById('resultsContainer').classList.add('show');
    const emptyState = document.getElementById('resultsEmptyState');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    const issuesList = document.getElementById('issuesList');
    const issues = analysisResult.detailedIssues || [];

    // 將問題按評級分組
    const goodIssues = issues.filter(issue => issue.rating === 'good');
    const okIssues = issues.filter(issue => issue.rating === 'ok');
    const badIssues = issues.filter(issue => issue.rating === 'bad');

    // 計算分數
    const scores = this.calculateScores(analysisResult, issues);

    // 渲染分數卡片（已隱藏）
    // const scoresHtml = this.renderScores(scores);

    // 渲染摘要資訊
    const summaryHtml = this.renderSummary(goodIssues, okIssues, badIssues, issues);

    // 如果只有良好的項目
    if (goodIssues.length > 0 && okIssues.length === 0 && badIssues.length === 0) {
      issuesList.innerHTML = summaryHtml + this.renderCelebration() + this.renderGoodIssues(goodIssues);
      return;
    }

    // 渲染過濾器標籤
    const filterTabsHtml = this.renderFilterTabs(goodIssues.length, okIssues.length, badIssues.length);

    // 渲染所有問題（分階段：先畫摘要與過濾器，再畫詳情）
    let allIssuesHtml = '';
    if (badIssues.length > 0) {
      allIssuesHtml += this.renderBadIssues(badIssues);
    }
    if (okIssues.length > 0) {
      allIssuesHtml += this.renderOkIssues(okIssues);
    }
    if (goodIssues.length > 0) {
      allIssuesHtml += this.renderGoodIssues(goodIssues);
    }

    // 首屏先顯示摘要 + 過濾器 + 簡易骨架
    issuesList.innerHTML = summaryHtml + filterTabsHtml + `
      <div id="issuesSkeletonBlock" style="padding:0.5rem 0;">
        <div class="skeleton-line" style="height:14px; width:80%; margin-bottom:8px;"></div>
        <div class="skeleton-line" style="height:14px; width:75%; margin-bottom:8px;"></div>
        <div class="skeleton-line" style="height:14px; width:70%;"></div>
      </div>
    `;

    // 在下一幀再插入詳細清單，減少首屏阻塞
    requestAnimationFrame(() => {
      const skeletonBlock = document.getElementById('issuesSkeletonBlock');
      if (skeletonBlock) skeletonBlock.remove();
      issuesList.innerHTML = summaryHtml + filterTabsHtml + allIssuesHtml;
      this.bindFilterEvents();
      this.animateScores(scores);
    });
  }

  /**
   * 觸發分數動畫
   */
  animateScores(scores) {
    const overallEl = document.getElementById('scoreOverall');
    const seoEl = document.getElementById('scoreSeo');
    const readabilityEl = document.getElementById('scoreReadability');

    if (overallEl) this.animateValue(overallEl, 0, scores.overallScore || 0, 1500);
    if (seoEl) this.animateValue(seoEl, 0, scores.seoScore || 0, 1500);
    if (readabilityEl) this.animateValue(readabilityEl, 0, scores.readabilityScore || 0, 1500);
  }

  /**
   * 數字動畫效果 (從 UI 類別借用或獨立實作)
   * 這裡簡單實作一個版本，或者假設 UI 類別會處理
   */
  animateValue(element, start, end, duration) {
    if (start === end) {
      element.textContent = end;
      return;
    }
    const range = end - start;
    const maxSteps = 60;
    const actualSteps = Math.min(Math.abs(range), maxSteps);
    const stepValue = range / actualSteps;
    const stepTime = duration / actualSteps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const current = Math.round(start + (stepValue * step));
      element.textContent = current;
      if (step >= actualSteps) {
        element.textContent = end;
        clearInterval(timer);
      }
    }, stepTime);
  }

  /**
   * 渲染過濾器標籤
   */
  renderFilterTabs(goodCount, okCount, badCount) {
    return `
      <div class="filter-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <button class="filter-tab active" data-filter="all" style="padding: 5px 10px; border: none; background: none; cursor: pointer; font-weight: 600; color: var(--color-primary); border-bottom: 2px solid var(--color-primary);">全部</button>
        <button class="filter-tab" data-filter="critical" style="padding: 5px 10px; border: none; background: none; cursor: pointer; color: #666;">
          ❌ 嚴重 (${badCount})
        </button>
        <button class="filter-tab" data-filter="warning" style="padding: 5px 10px; border: none; background: none; cursor: pointer; color: #666;">
          ⚠️ 警告 (${okCount})
        </button>
        <button class="filter-tab" data-filter="good" style="padding: 5px 10px; border: none; background: none; cursor: pointer; color: #666;">
          ✅ 良好 (${goodCount})
        </button>
      </div>
    `;
  }

  /**
   * 綁定過濾器事件
   */
  bindFilterEvents() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // 更新標籤樣式
        tabs.forEach(t => {
          t.style.color = '#666';
          t.style.borderBottom = 'none';
          t.classList.remove('active');
        });
        tab.style.color = 'var(--color-primary)';
        tab.style.borderBottom = '2px solid var(--color-primary)';
        tab.classList.add('active');

        // 執行過濾
        this.filterResults(tab.dataset.filter);
      });
    });
  }

  /**
   * 執行結果過濾
   */
  filterResults(filterType) {
    const sections = document.querySelectorAll('.issue-section');
    const cards = document.querySelectorAll('.issue-card');
    const typeFilters = ['seo', 'keywords', 'readability', 'suggestions'];

    // 針對特定類型的篩選（來自 Popup 的深連結）
    if (typeFilters.includes(filterType)) {
      const targetAssessment = filterType === 'keywords' ? 'seo' : filterType;
      cards.forEach(card => {
        const matchesAssessment = filterType === 'suggestions' ? true : card.dataset.assessment === targetAssessment;
        const matchesSeverity = filterType === 'suggestions' ? card.dataset.severity !== 'good' : true;
        card.style.display = (matchesAssessment && matchesSeverity) ? 'flex' : 'none';
      });

      sections.forEach(section => {
        const visibleCard = section.querySelector('.issue-card:not([style*="display: none"])');
        section.style.display = visibleCard ? 'block' : 'none';
      });
      return;
    }

    // 依嚴重程度篩選（預設行為）
    cards.forEach(card => {
      const matches = filterType === 'all' || card.dataset.severity === filterType;
      card.style.display = matches ? 'flex' : 'none';
    });

    sections.forEach(section => {
      const visibleCard = section.querySelector('.issue-card:not([style*="display: none"])');
      section.style.display = visibleCard ? 'block' : 'none';
    });
  }

  /**
   * 計算分數
   */
  calculateScores(analysisResult, issues) {
    const scores = analysisResult.overallScores || {};

    // 如果沒有分數但有詳細問題，計算分數
    if ((!scores.overallScore || scores.overallScore === 0) && issues.length > 0) {
      const totalScore = issues.reduce((sum, issue) => sum + (issue.score || 0), 0);
      const avgScore = Math.round(totalScore / issues.length);

      scores.overallScore = avgScore;
      scores.seoScore = Math.round(
        issues.filter(i => i.assessmentType === 'seo')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) /
        Math.max(1, issues.filter(i => i.assessmentType === 'seo').length)
      );
      scores.readabilityScore = Math.round(
        issues.filter(i => i.assessmentType === 'readability')
          .reduce((sum, issue) => sum + (issue.score || 0), 0) /
        Math.max(1, issues.filter(i => i.assessmentType === 'readability').length)
      );
    }

    return scores;
  }

  /**
   * 渲染分數卡片
   */
  renderScores(scores) {
    const getScoreColor = (score) => {
      if (score >= 80) return 'var(--color-success)';
      if (score >= 60) return 'var(--color-warning)';
      return 'var(--color-error)';
    };

    const getScoreEmoji = (score) => {
      if (score >= 80) return '😊';
      if (score >= 60) return '😐';
      return '😟';
    };

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">整體分數</h4>
          <div id="scoreOverall" style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.overallScore)}; line-height: 1;">
            0
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.overallScore)}</div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">SEO 分數</h4>
          <div id="scoreSeo" style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.seoScore)}; line-height: 1;">
            0
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.seoScore)}</div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">可讀性分數</h4>
          <div id="scoreReadability" style="font-size: 2.5rem; font-weight: bold; color: ${getScoreColor(scores.readabilityScore)}; line-height: 1;">
            0
          </div>
          <div style="font-size: 1.5rem; margin-top: 0.25rem;">${getScoreEmoji(scores.readabilityScore)}</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染摘要資訊
   */
  renderSummary(goodIssues, okIssues, badIssues, issues) {
    const actualTotal = issues.length;

    return `
      <div style="background: var(--color-gray-light); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">檢測項目統計 ${actualTotal === 16 ? '(API v2.0 完整檢測)' : ''}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
          <div>總檢測項目: ${actualTotal}</div>
          <div style="color: var(--color-success);">✅ 良好: ${goodIssues.length}</div>
          <div style="color: var(--color-warning);">⚠️ 可優化: ${okIssues.length}</div>
          <div style="color: var(--color-error);">❌ 問題: ${badIssues.length}</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染慶祝訊息
   */
  renderCelebration() {
    return `
      <div style="background: rgba(72, 142, 128, 0.05); border-left: 4px solid var(--color-success); 
                  border-radius: 4px; padding: 1rem; margin-bottom: 1.5rem;">
        <p style="color: var(--color-success); font-weight: 600; margin: 0;">
          🎉 太棒了！您的網頁通過了所有檢測項目，沒有發現任何需要改進的地方。
        </p>
      </div>
    `;
  }

  /**
   * 渲染良好的項目
   */
  renderGoodIssues(goodIssues) {
    return `
      <div class="issue-section" data-type="good" style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-success);">✅ 通過的檢測項目 (${goodIssues.length})</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${goodIssues.map(issue => {
      const translated = this.getTranslatedAssessment(issue);
      return `
            <div class="issue-card" data-severity="good" data-assessment="${(issue.assessmentType || 'seo').toLowerCase()}"
                        style="background: rgba(72, 142, 128, 0.05); border: 1px solid rgba(72, 142, 128, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-success); font-size: 1.2rem;">✓</span>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <strong style="color: var(--text-primary);">${translated.name}</strong>
                  ${this.renderContextualHelp(translated)}
                </div>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-success);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染情境式幫助圖標
   */
  renderContextualHelp(translated) {
    if (!translated.description && !translated.recommendation) return '';

    const helpText = translated.recommendation || translated.description;
    return `
      <span class="help-icon" title="${helpText.replace(/"/g, '&quot;')}" style="cursor: help; opacity: 0.6; font-size: 14px;">ℹ️</span>
    `;
  }

  /**
   * 渲染需要改進的項目
   */
  renderOkIssues(okIssues) {
    return `
      <div class="issue-section" data-type="warning" style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-warning);">⚠️ 可優化項目 (${okIssues.length})</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${okIssues.map(issue => {
      const translated = this.getTranslatedAssessment(issue);
      return `
            <div class="issue-card" data-severity="warning" data-assessment="${(issue.assessmentType || 'seo').toLowerCase()}"
                        style="background: rgba(255, 193, 7, 0.05); border: 1px solid rgba(255, 193, 7, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-warning); font-size: 1.2rem;">⚠</span>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <strong style="color: var(--text-primary);">${translated.name}</strong>
                  ${this.renderContextualHelp(translated)}
                </div>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-warning);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染問題項目
   */
  renderBadIssues(badIssues) {
    return `
      <div class="issue-section" data-type="critical" style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-error);">❌ 存在問題 (${badIssues.length}) - 重要性高</h4>
        <div style="display: grid; gap: 0.5rem;">
          ${badIssues.map(issue => {
      const translated = this.getTranslatedAssessment(issue);
      return `
            <div class="issue-card" data-severity="critical" data-assessment="${(issue.assessmentType || 'seo').toLowerCase()}"
                        style="background: rgba(255, 0, 0, 0.05); border: 1px solid rgba(255, 0, 0, 0.2); 
                        border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--color-error); font-size: 1.2rem;">✗</span>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <strong style="color: var(--text-primary);">${translated.name}</strong>
                  ${this.renderContextualHelp(translated)}
                </div>
                ${translated.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${translated.description}</div>` : ''}
              </div>
              <span style="font-size: 0.85rem; color: var(--color-error);">${this.getIssueData(issue)}</span>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 獲取翻譯後的評估內容
   */
  getTranslatedAssessment(issue) {
    const assessmentId = issue.assessmentId || issue.id;

    if (!assessmentId) {
      console.warn('評估項目缺少 ID，使用原始名稱:', issue.name);
      return {
        name: issue.name || '未知評估',
        title: issue.title || issue.name || '未知標題',
        description: issue.description || '',
        recommendation: issue.recommendation || ''
      };
    }

    const translation = getAssessmentTranslation(
      assessmentId,
      issue.rating,
      this.currentLanguage,
      issue.details || {}
    );

    if (translation) {
      let description = translation.description;

      // 如果 API 返回了 standards，優先使用 API 的標準值
      if (issue.standards && issue.standards.description) {
        description = issue.standards.description;
      } else if (issue.standards && issue.standards.optimal) {
        const optimal = issue.standards.optimal;
        const unit = issue.standards.unit || '';
        if (optimal.min !== undefined && optimal.max !== undefined) {
          description += ` (建議: ${optimal.min}-${optimal.max}${unit})`;
        } else if (optimal.min !== undefined) {
          description += ` (建議: >${optimal.min}${unit})`;
        } else if (optimal.max !== undefined) {
          description += ` (建議: <${optimal.max}${unit})`;
        }
      }

      return {
        name: translation.name,
        title: translation.title,
        description: description,
        recommendation: translation.recommendation
      };
    }

    return {
      name: issue.name || assessmentId,
      title: issue.title || issue.name,
      description: issue.description || '',
      recommendation: issue.recommendation || ''
    };
  }

  /**
   * 獲取問題的實際數據
   */
  getIssueData(issue) {
    let dataStr = '';
    const details = issue.details || {};

    // 根據不同的評估 ID 返回相應的數據
    switch (issue.id || issue.assessmentId) {
      case 'H1_MISSING':
        dataStr = `H1: ${details.count || details.h1Count || 0} 個`;
        break;
      case 'MULTIPLE_H1':
        dataStr = `H1: ${details.count || details.h1Count || 2} 個`;
        break;
      case 'H1_KEYWORD_MISSING':
        dataStr = details.h1Text ? `"${details.h1Text.substring(0, 30)}..."` : '無 H1';
        break;
      case 'IMAGES_MISSING_ALT':
        const total = details.totalImages || details.imageCount || 0;
        const missing = details.missingAltCount || details.imagesWithoutAlt || 0;
        dataStr = `${missing}/${total} 張缺少`;
        break;
      case 'KEYWORD_MISSING_FIRST_PARAGRAPH':
        dataStr = details.firstParagraph ?
          `"${details.firstParagraph.substring(0, 50)}..."` :
          `關鍵字: ${details.keywordCount || 0} 次`;
        break;
      case 'KEYWORD_DENSITY_LOW': {
        const densityValue = parseFloat(details.density || details.keywordDensity || '0');
        const density = densityValue.toFixed(2);
        const keywordWordLength = details.keywordWordLength ??
          ((details.keywordOccurrences ?? details.keywordCount ?? 0) *
            (details.keywordLength ?? details.focusKeywordLength ?? 0));
        const totalWords = details.totalWords ?? details.wordCount ?? 0;
        dataStr = `${density}% (${keywordWordLength}/${totalWords} 字)`;
        break;
      }
      case 'META_DESCRIPTION_MISSING':
      case 'META_DESCRIPTION_NEEDS_IMPROVEMENT':
        const metaDesc = details.metaDescription || details.description || '';
        if (details.pixelWidth !== undefined) {
          dataStr = `${details.pixelWidth}px (約${details.charEquivalent || 0}字)`;
        } else {
          const metaLength = details.length || metaDesc.length || 0;
          dataStr = `${metaLength} 字`;
        }
        if (metaDesc && metaDesc.length > 0) {
          dataStr += `: "${metaDesc.substring(0, 30)}..."`;
        }
        break;
      case 'TITLE_MISSING':
      case 'TITLE_NEEDS_IMPROVEMENT':
        const title = details.title || '';
        if (details.pixelWidth !== undefined) {
          dataStr = `${details.pixelWidth}px (約${details.charEquivalent || 0}字)`;
        } else {
          const titleLength = details.length || title.length || 0;
          dataStr = `${titleLength} 字`;
        }
        if (title) {
          dataStr += `: "${title.substring(0, 30)}..."`;
        }
        break;
      case 'CONTENT_LENGTH_SHORT':
        dataStr = `${details.wordCount || 0} 字`;
        break;
      case 'FLESCH_READING_EASE':
        dataStr = `分數: ${details.score || 0}`;
        break;
      case 'PARAGRAPH_LENGTH_LONG':
        dataStr = `${details.longParagraphs || 0} 個過長`;
        break;
      case 'SENTENCE_LENGTH_LONG':
        dataStr = `${details.percentage || 0}% 過長`;
        break;
      case 'SUBHEADING_DISTRIBUTION_POOR':
        dataStr = `${details.longTextBlocks || 0} 區塊過長`;
        break;
      default:
        if (details.count !== undefined) {
          dataStr = `數量: ${details.count}`;
        }
    }

    return dataStr;
  }

}
