/**
 * UI 基礎功能模組
 * 處理載入狀態、錯誤訊息、Toast 通知等基礎 UI 功能
 */
export class UIBase {
  constructor() {
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.loadingMessage = document.getElementById('loadingMessage');
    this.loadingSubtext = document.getElementById('loadingSubtext');
    if (this.loadingSubtext) {
      this.loadingSubtext.dataset.defaultText = this.loadingSubtext.textContent || '';
    }
    this.errorMessage = document.getElementById('errorMessage');
    this.errorText = document.getElementById('errorText');
    this.toastContainer = document.getElementById('toastContainer');
  }

  /**
   * 顯示/隱藏載入中覆蓋層
   * @param {boolean} show
   */
  showLoading(show, message = null, progress = null) {
    if (message || typeof progress === 'number') {
      this.setLoadingStatus(message, progress);
    }
    this.loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  /**
   * 更新載入中文案與進度
   * @param {string|null} message
   * @param {number|null} progress 0-100
   */
  setLoadingStatus(message, progress = null) {
    if (message && this.loadingMessage) {
      this.loadingMessage.textContent = message;
    }
    const subtextText = this.loadingSubtext?.dataset?.defaultText || this.loadingSubtext?.textContent || '';
    if (this.loadingSubtext) {
      this.loadingSubtext.textContent = subtextText;
    }
  }

  /**
   * 顯示錯誤訊息
   * @param {string} message
   * @param {boolean} useToast - 是否使用 Toast 通知而非全螢幕錯誤
   */
  showError(message, useToast = false) {
    if (useToast) {
      this.showToast(message, 'error');
    } else {
      this.errorText.textContent = message;
      this.errorMessage.style.display = 'flex';
      
      setTimeout(() => {
        this.errorMessage.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message
   * @param {string} type - 'error', 'success', 'warning', 'info'
   */
  showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 根據類型設定圖示
    const icons = {
      'error': '❌',
      'success': '✅',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // 觸發動畫
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // 5秒後隱藏並移除
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}
