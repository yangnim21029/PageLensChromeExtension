/**
 * SEO Writing Helper Module
 * 提供標題、描述、Alt 文字的引導式寫作教學
 */

export class SEOWritingHelper {
  constructor() {
    this.currentHelper = null;
    this.modalElement = null;
  }

  /**
   * 初始化寫作小幫手
   */
  init() {
    this.createModal();
    this.bindEvents();
  }

  /**
   * 建立 Modal 容器
   */
  createModal() {
    // 如果已存在就不重複建立
    if (document.getElementById('writingHelperModal')) {
      this.modalElement = document.getElementById('writingHelperModal');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'writingHelperModal';
    modal.className = 'helper-modal-overlay';
    modal.innerHTML = `
      <div class="helper-modal">
        <header class="helper-modal-header">
          <h3 class="helper-modal-title">
            <span class="helper-icon">📝</span>
            <span id="helperTitle">寫作小幫手</span>
          </h3>
          <button class="helper-modal-close" id="closeHelperModal">✕</button>
        </header>
        <div class="helper-modal-body" id="helperContent">
          <!-- 內容將動態載入 -->
        </div>
        <footer class="helper-modal-footer">
          <button class="helper-btn helper-btn-secondary" id="prevHelperStep" style="display: none;">上一步</button>
          <div class="helper-step-indicator" id="helperStepIndicator"></div>
          <button class="helper-btn helper-btn-primary" id="nextHelperStep">下一步</button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 關閉按鈕
    document.getElementById('closeHelperModal')?.addEventListener('click', () => {
      this.close();
    });

    // 點擊背景關閉
    this.modalElement?.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.close();
      }
    });

    // 上一步 / 下一步
    document.getElementById('prevHelperStep')?.addEventListener('click', () => {
      this.prevStep();
    });

    document.getElementById('nextHelperStep')?.addEventListener('click', () => {
      this.nextStep();
    });

    // ESC 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalElement?.classList.contains('show')) {
        this.close();
      }
    });
  }

  /**
   * 開啟寫作小幫手
   * @param {string} type - 類型：title, description, alt
   * @param {Object} context - 當前項目的上下文資料
   */
  open(type, context = {}) {
    this.currentHelper = {
      type,
      context,
      currentStep: 0,
      steps: this.getSteps(type, context)
    };

    this.updateTitle(type);
    this.renderStep();
    this.modalElement?.classList.add('show');
  }

  /**
   * 關閉小幫手
   */
  close() {
    this.modalElement?.classList.remove('show');
    this.currentHelper = null;
  }

  /**
   * 更新標題
   */
  updateTitle(type) {
    const titleEl = document.getElementById('helperTitle');
    const titles = {
      title: '標題寫作小幫手',
      description: '描述寫作小幫手',
      alt: 'Alt 文字寫作小幫手'
    };
    if (titleEl) {
      titleEl.textContent = titles[type] || '寫作小幫手';
    }
  }

  /**
   * 取得步驟內容
   */
  getSteps(type, context) {
    const steps = {
      title: this.getTitleSteps(context),
      description: this.getDescriptionSteps(context),
      alt: this.getAltSteps(context)
    };
    return steps[type] || [];
  }

  /**
   * 標題寫作步驟
   */
  getTitleSteps(context) {
    const currentTitle = context.title || '';
    const currentLength = currentTitle.length;
    const pixelWidth = context.pixelWidth || 0;

    return [
      {
        title: '📏 先來看看最佳長度',
        content: `
          <div class="helper-card">
            <div class="helper-highlight">
              <span class="helper-number">25-60</span>
              <span class="helper-unit">個字</span>
            </div>
            <p class="helper-desc">這是搜尋結果中能完整顯示的最佳長度。</p>
            ${currentTitle ? `
              <div class="helper-current">
                <strong>你目前的標題：</strong>
                <p class="helper-preview">${currentTitle}</p>
                <p class="helper-stat ${currentLength >= 25 && currentLength <= 60 ? 'good' : 'warning'}">
                  目前 ${currentLength} 個字 ${currentLength >= 25 && currentLength <= 60 ? '✓ 剛剛好！' : currentLength < 25 ? '→ 可以再長一點' : '→ 建議精簡一下'}
                </p>
              </div>
            ` : ''}
          </div>
        `
      },
      {
        title: '🎯 關鍵字放在前面',
        content: `
          <div class="helper-card">
            <div class="helper-tip">
              <span class="helper-tip-icon">💡</span>
              <p>把最重要的關鍵字放在標題的<strong>前半部分</strong>，讓讀者和搜尋引擎第一眼就看到重點。</p>
            </div>
            <div class="helper-examples">
              <div class="helper-example bad">
                <span class="helper-label">❌ 比較不好</span>
                <p>2024年最新最完整的攻略：台北10大必吃美食</p>
              </div>
              <div class="helper-example good">
                <span class="helper-label">✓ 比較好</span>
                <p>台北10大必吃美食｜2024最新完整攻略</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: '✨ 讓標題更吸引人',
        content: `
          <div class="helper-card">
            <p class="helper-desc">試試這些技巧讓標題更有吸引力：</p>
            <ul class="helper-list">
              <li><strong>加入數字</strong> → 「5 個方法」比「幾個方法」更具體</li>
              <li><strong>創造好奇心</strong> → 「你可能不知道的...」</li>
              <li><strong>突顯價值</strong> → 「完整攻略」「懶人包」「一次看懂」</li>
              <li><strong>使用分隔符</strong> → 用「｜」「-」「:」讓結構更清楚</li>
            </ul>
          </div>
        `
      },
      {
        title: '🤖 AI 幫你改寫看看',
        content: `
          <div class="helper-card">
            <p class="helper-desc">讓 AI 示範如何優化你的標題：</p>
            ${currentTitle ? `
              <div class="helper-ai-demo">
                <div class="helper-before-after">
                  <div class="helper-before">
                    <span class="helper-label">📝 原本的標題</span>
                    <p class="helper-preview">${currentTitle}</p>
                  </div>
                  <div class="helper-arrow">→</div>
                  <div class="helper-after">
                    <span class="helper-label">✨ AI 建議改成</span>
                    <div class="helper-ai-loading" id="aiTitleSuggestion">
                      <button class="helper-btn helper-btn-ai" onclick="writingHelper.requestAISuggestion('title')">
                        🤖 請 AI 幫我改寫
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <div class="helper-alert info">
                <span>ℹ️</span> 目前沒有標題，無法示範 AI 改寫
              </div>
            `}
            <div class="helper-tip" style="margin-top: 1rem;">
              <span class="helper-tip-icon">💡</span>
              <p>AI 建議僅供參考，你可以根據自己的風格調整！</p>
            </div>
          </div>
        `
      },
      {
        title: '✅ 總結與練習',
        content: `
          <div class="helper-card">
            <p class="helper-desc">寫好標題的重點：</p>
            <ul class="helper-list success">
              <li>✓ 長度在 25-60 字之間</li>
              <li>✓ 關鍵字放在前半部分</li>
              <li>✓ 加入數字或價值詞彙</li>
              <li>✓ 使用分隔符讓結構清楚</li>
            </ul>
            <div class="helper-tip success">
              <span class="helper-tip-icon">🎉</span>
              <p>恭喜！你已經學會寫出好標題了！</p>
            </div>
          </div>
        `
      }
    ];
  }


  /**
   * 描述寫作步驟
   */
  getDescriptionSteps(context) {
    const currentDesc = context.metaDescription || context.description || '';
    const currentLength = currentDesc.length;

    return [
      {
        title: '📏 描述的最佳長度',
        content: `
          <div class="helper-card">
            <div class="helper-highlight">
              <span class="helper-number">120-160</span>
              <span class="helper-unit">個字</span>
            </div>
            <p class="helper-desc">太短沒說清楚，太長會被截斷。這個範圍剛剛好！</p>
            ${currentDesc ? `
              <div class="helper-current">
                <strong>你目前的描述：</strong>
                <p class="helper-preview">${currentDesc}</p>
                <p class="helper-stat ${currentLength >= 120 && currentLength <= 160 ? 'good' : 'warning'}">
                  目前 ${currentLength} 個字 ${currentLength >= 120 && currentLength <= 160 ? '✓ 完美！' : currentLength < 120 ? '→ 可以再詳細一點' : '→ 可能會被截斷'}
                </p>
              </div>
            ` : ''}
          </div>
        `
      },
      {
        title: '🎯 描述要包含什麼？',
        content: `
          <div class="helper-card">
            <p class="helper-desc">好的描述應該回答讀者的問題：「這篇文章對我有什麼用？」</p>
            <ul class="helper-list">
              <li><strong>文章的核心價值</strong> → 讀完能學到什麼</li>
              <li><strong>目標關鍵字</strong> → 自然地放入，不要硬塞</li>
              <li><strong>吸引點擊的理由</strong> → 為什麼要讀這篇</li>
            </ul>
          </div>
        `
      },
      {
        title: '📢 加入行動呼籲',
        content: `
          <div class="helper-card">
            <div class="helper-tip">
              <span class="helper-tip-icon">💡</span>
              <p>在描述結尾加入行動呼籲，讓讀者更想點擊！</p>
            </div>
            <div class="helper-examples">
              <div class="helper-example good">
                <span class="helper-label">✓ 好的行動呼籲</span>
                <p>「立即了解」「馬上收藏」「點擊查看完整清單」</p>
              </div>
            </div>
            <div class="helper-example-block">
              <p class="helper-example-title">完整範例：</p>
              <p class="helper-preview">想知道台北有哪些好吃的甜點店嗎？這篇整理了 10 家在地人激推的隱藏版甜點，從日式抹茶到法式千層都有。立即收藏，下次約會就知道去哪！</p>
            </div>
          </div>
        `
      },
      {
        title: '🤖 AI 幫你改寫看看',
        content: `
          <div class="helper-card">
            <p class="helper-desc">讓 AI 示範如何優化你的描述：</p>
            ${currentDesc ? `
              <div class="helper-ai-demo">
                <div class="helper-before-after vertical">
                  <div class="helper-before">
                    <span class="helper-label">📝 原本的描述</span>
                    <p class="helper-preview">${currentDesc}</p>
                  </div>
                  <div class="helper-arrow">↓</div>
                  <div class="helper-after">
                    <span class="helper-label">✨ AI 建議改成</span>
                    <div class="helper-ai-loading" id="aiDescSuggestion">
                      <button class="helper-btn helper-btn-ai" onclick="writingHelper.requestAISuggestion('description')">
                        🤖 請 AI 幫我改寫
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <div class="helper-alert info">
                <span>ℹ️</span> 目前沒有描述，無法示範 AI 改寫
              </div>
            `}
            <div class="helper-tip" style="margin-top: 1rem;">
              <span class="helper-tip-icon">💡</span>
              <p>AI 建議僅供參考，你可以根據自己的風格調整！</p>
            </div>
          </div>
        `
      },
      {
        title: '✅ 總結與練習',
        content: `
          <div class="helper-card">
            <p class="helper-desc">寫好描述的重點：</p>
            <ul class="helper-list success">
              <li>✓ 長度在 120-160 字之間</li>
              <li>✓ 說明文章核心價值</li>
              <li>✓ 自然放入關鍵字</li>
              <li>✓ 結尾加入行動呼籲</li>
            </ul>
            <div class="helper-tip success">
              <span class="helper-tip-icon">🎉</span>
              <p>你已經掌握寫出吸引人的描述的技巧了！</p>
            </div>
          </div>
        `
      }
    ];
  }


  /**
   * Alt 文字寫作步驟
   */
  getAltSteps(context) {
    const missingCount = context.missingAltCount || context.imagesWithoutAlt || 0;

    return [
      {
        title: '🖼️ 什麼是 Alt 文字？',
        content: `
          <div class="helper-card">
            <p class="helper-desc">Alt 文字（替代文字）是用來<strong>描述圖片內容</strong>的文字。</p>
            <div class="helper-highlight small">
              <span class="helper-emoji">👁️</span>
              <p>雖然你看不到它，但它非常重要！</p>
            </div>
            <ul class="helper-list">
              <li><strong>幫助視障者</strong> → 螢幕閱讀器會唸出 Alt 文字</li>
              <li><strong>圖片載入失敗時</strong> → 顯示替代文字讓讀者知道圖片內容</li>
              <li><strong>幫助 SEO</strong> → 搜尋引擎靠 Alt 文字理解圖片</li>
            </ul>
            ${missingCount > 0 ? `
              <div class="helper-alert warning">
                <span>⚠️</span> 你有 ${missingCount} 張圖片還沒有 Alt 文字
              </div>
            ` : ''}
          </div>
        `
      },
      {
        title: '✍️ 怎麼寫好的 Alt 文字？',
        content: `
          <div class="helper-card">
            <p class="helper-desc">想像你在跟看不到圖片的人描述這張圖：</p>
            <div class="helper-examples">
              <div class="helper-example bad">
                <span class="helper-label">❌ 太籠統</span>
                <p>alt="圖片" / alt="photo" / alt="image1"</p>
              </div>
              <div class="helper-example good">
                <span class="helper-label">✓ 具體描述</span>
                <p>alt="一隻橘色的貓咪躺在陽光下的沙發上"</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: '📝 Alt 文字寫作技巧',
        content: `
          <div class="helper-card">
            <ul class="helper-list">
              <li><strong>簡潔明瞭</strong> → 通常 5-15 個字就夠了</li>
              <li><strong>描述重點</strong> → 圖片想傳達什麼訊息</li>
              <li><strong>適度加入關鍵字</strong> → 但不要硬塞</li>
              <li><strong>不要以「圖片」開頭</strong> → 螢幕閱讀器會自動說這是圖片</li>
            </ul>
            <div class="helper-example-block">
              <p class="helper-example-title">範例比較：</p>
              <table class="helper-table">
                <tr><th>圖片類型</th><th>好的 Alt 文字</th></tr>
                <tr><td>產品圖</td><td>NIKE Air Max 90 白色運動鞋側面照</td></tr>
                <tr><td>資訊圖</td><td>2024年台灣電商市場成長趨勢圖表</td></tr>
                <tr><td>人物照</td><td>創辦人王小明在辦公室微笑的照片</td></tr>
              </table>
            </div>
          </div>
        `
      },
      {
        title: '⚠️ 特殊情況處理',
        content: `
          <div class="helper-card">
            <ul class="helper-list">
              <li><strong>裝飾性圖片</strong> → 如果純粹是裝飾，可以用空的 alt=""</li>
              <li><strong>圖片中的文字</strong> → Alt 要包含圖片裡的重要文字</li>
              <li><strong>複雜的圖表</strong> → 簡述重點，詳情放在文章內文</li>
            </ul>
            <div class="helper-tip success">
              <span class="helper-tip-icon">🎉</span>
              <p>太棒了！現在你知道怎麼寫好 Alt 文字了！</p>
            </div>
          </div>
        `
      }
    ];
  }

  /**
   * 渲染當前步驟
   */
  renderStep() {
    if (!this.currentHelper) return;

    const { currentStep, steps } = this.currentHelper;
    const step = steps[currentStep];

    // 更新內容
    const contentEl = document.getElementById('helperContent');
    if (contentEl && step) {
      contentEl.innerHTML = `
        <h4 class="helper-step-title">${step.title}</h4>
        ${step.content}
      `;
    }

    // 更新步驟指示器
    const indicatorEl = document.getElementById('helperStepIndicator');
    if (indicatorEl) {
      indicatorEl.innerHTML = steps.map((_, i) => `
        <span class="helper-step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}"></span>
      `).join('');
    }

    // 更新按鈕狀態
    const prevBtn = document.getElementById('prevHelperStep');
    const nextBtn = document.getElementById('nextHelperStep');

    if (prevBtn) {
      prevBtn.style.display = currentStep > 0 ? 'block' : 'none';
    }

    if (nextBtn) {
      nextBtn.textContent = currentStep >= steps.length - 1 ? '完成' : '下一步';
    }
  }

  /**
   * 上一步
   */
  prevStep() {
    if (!this.currentHelper || this.currentHelper.currentStep <= 0) return;
    this.currentHelper.currentStep--;
    this.renderStep();
  }

  /**
   * 下一步
   */
  nextStep() {
    if (!this.currentHelper) return;

    if (this.currentHelper.currentStep >= this.currentHelper.steps.length - 1) {
      this.close();
      return;
    }

    this.currentHelper.currentStep++;
    this.renderStep();
  }

  /**
   * 請求 AI 建議
   * @param {string} type - 類型：title, description
   */
  async requestAISuggestion(type) {
    if (!this.currentHelper) return;

    const context = this.currentHelper.context;
    const elementId = type === 'title' ? 'aiTitleSuggestion' : 'aiDescSuggestion';
    const container = document.getElementById(elementId);

    if (!container) return;

    // 顯示載入中
    container.innerHTML = `
      <div class="helper-ai-loading-spinner">
        <span class="spinner"></span>
        <span>AI 正在思考中...</span>
      </div>
    `;

    try {
      const suggestion = await this.callAISuggestionAPI(type, context);

      // 顯示 AI 建議結果
      container.innerHTML = `
        <p class="helper-preview ai-result">${suggestion}</p>
        <div class="helper-ai-actions">
          <button class="helper-btn helper-btn-small" id="copySuggestionBtn">
            📋 複製
          </button>
          <button class="helper-btn helper-btn-small helper-btn-secondary" id="retrySuggestionBtn">
            🔄 再試一次
          </button>
        </div>
      `;

      // 綁定事件監聽器以符合 CSP
      const copyBtn = container.querySelector('#copySuggestionBtn');
      const retryBtn = container.querySelector('#retrySuggestionBtn');

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(suggestion);
          copyBtn.textContent = '已複製！';
          setTimeout(() => { copyBtn.textContent = '📋 複製'; }, 2000);
        });
      }

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.requestAISuggestion(type);
        });
      }

    } catch (error) {
      console.error('AI suggestion error:', error);
      container.innerHTML = `
        <div class="helper-alert warning">
          <span>⚠️</span> 無法取得 AI 建議：${error.message || '請稍後再試'}
        </div>
        <button class="helper-btn helper-btn-ai" id="errorRetryBtn">
          🔄 重試
        </button>
      `;

      const errorRetryBtn = container.querySelector('#errorRetryBtn');
      if (errorRetryBtn) {
        errorRetryBtn.addEventListener('click', () => {
          this.requestAISuggestion(type);
        });
      }
    }
  }

  /**
   * 呼叫 AI 建議 API
   * @param {string} type - 類型
   * @param {Object} context - 上下文
   */
  async callAISuggestionAPI(type, context) {
    const currentContent = type === 'title'
      ? (context.title || '')
      : (context.metaDescription || context.description || '');

    if (!currentContent) {
      throw new Error('請先輸入內容');
    }

    try {
      const response = await this.api.callWritingAssistant({
        task: 'rewrite',
        text: currentContent,
        context: JSON.stringify(context),
        language: 'zh-TW'
      });

      if (response.success && response.processedText) {
        return response.processedText;
      } else {
        throw new Error(response.error || 'AI 建議生成失敗');
      }
    } catch (error) {
      console.error('API call failed in Writing Helper:', error);
      throw error;
    }
  }
}

// 創建全域實例
export const writingHelper = new SEOWritingHelper();

// 也暴露到 window 供 onclick 使用
if (typeof window !== 'undefined') {
  window.writingHelper = writingHelper;
}
