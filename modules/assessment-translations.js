// PageLens 評估項目翻譯映射
// 用於前端根據 API 返回的評估 ID 顯示對應語言的內容

const assessmentTranslations = {
  // ========== SEO 評估項目 (12個) ==========

  H1_MISSING: {
    'zh-TW': {
      name: 'H1 標題檢測',
      good: {
        title: '有 H1 標題',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '還沒有主標題',
        description: '頁面還沒有 H1 標題',
        recommendation: '加上一個清楚描述文章內容的 H1 標題，讓讀者和搜尋引擎一眼就知道這篇在講什麼！'
      }
    },
    en: {
      name: 'H1 Tag Check',
      good: {
        title: 'H1 Tag Present',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'H1 Tag Missing',
        description: 'Page is missing an H1 heading',
        recommendation:
          'Add exactly one H1 heading that describes the main topic of your page.'
      }
    }
  },

  MULTIPLE_H1: {
    'zh-TW': {
      name: '多重 H1 檢測',
      good: {
        title: 'H1 只有一個',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'H1 有好幾個',
        description: '頁面有多個 H1 標題，可能會混淆搜尋引擎',
        recommendation: '一頁只留一個 H1，其他的改成 H2 或 H3 就好！'
      }
    },
    en: {
      name: 'Multiple H1 Detection',
      good: {
        title: 'Single H1 Tag',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Multiple H1 Tags',
        description: 'Page has multiple H1 headings',
        recommendation:
          'Use only one H1 heading per page. Convert additional H1s to H2 or H3.'
      }
    }
  },

  H1_KEYWORD_MISSING: {
    'zh-TW': {
      name: 'H1 關鍵字檢測',
      good: {
        title: 'H1 有放關鍵字',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '沒有設定焦點關鍵字',
        description: '沒有提供焦點關鍵字，無法檢查',
        recommendation: '設定焦點關鍵字，我們才能幫你檢查 H1 是否有放對關鍵字。'
      },
      bad: {
        title: 'H1 沒有放關鍵字',
        description: 'H1 標題沒有包含焦點關鍵字',
        recommendation: '在 H1 標題加入焦點關鍵字，讓搜尋引擎更容易理解文章主題！'
      }
    },
    en: {
      name: 'H1 Keyword Check',
      good: {
        title: 'H1 Contains Keywords',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'H1 Missing Keywords',
        description: 'H1 heading is missing the focus keyword',
        recommendation:
          'Include the focus keyword and at least one related keyword in your H1.'
      }
    }
  },

  H2_SYNONYMS_MISSING: {
    'zh-TW': {
      name: 'H2 相關關鍵字',
      good: {
        title: 'H2 都有放相關關鍵字',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '部分相關關鍵字沒有放',
        description: '有些相關關鍵字還沒出現在小標題裡',
        recommendation: '試試在 H2 小標題加入更多相關關鍵字，讓文章結構更完整！'
      },
      bad: {
        title: '缺少很多相關關鍵字',
        description: 'H2 標題缺少大部分相關關鍵字',
        recommendation: '在 H2 小標題中加入相關關鍵字，讓文章內容更豐富！'
      }
    },
    en: {
      name: 'H2 Related Keywords Check',
      good: {
        title: 'All Related Keywords in H2',
        description: '',
        recommendation: ''
      },
      ok: {
        title: 'Some Related Keywords Missing',
        description: 'Some related keywords are missing from H2 headings',
        recommendation: 'Add the missing related keywords to your H2 headings.'
      },
      bad: {
        title: 'Most Related Keywords Missing',
        description: 'Most related keywords missing from H2',
        recommendation: 'Include related keywords in your H2 headings.'
      }
    }
  },

  IMAGES_MISSING_ALT: {
    'zh-TW': {
      name: '圖片 Alt 屬性',
      good: {
        title: '圖片都有說明文字',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '有圖片沒有說明文字',
        description: '有些圖片缺少描述文字',
        recommendation: '幫圖片加上說明文字，讓搜尋引擎和視障讀者都能理解圖片在說什麼！'
      }
    },
    en: {
      name: 'Image Alt Text Check',
      good: {
        title: 'All Images Have Alt Text',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Images Missing Alt Text',
        description: 'Some images are missing alt text',
        recommendation:
          'Add descriptive alt text to all images for better accessibility and SEO.'
      }
    }
  },



  META_DESCRIPTION_NEEDS_IMPROVEMENT: {
    'zh-TW': {
      name: '描述關鍵字檢測',
      good: {
        title: '描述有放關鍵字',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '沒有設定焦點關鍵字',
        description: '沒有提供焦點關鍵字，無法檢查',
        recommendation: '設定焦點關鍵字，我們才能檢查描述是否有放對關鍵字。'
      },
      bad: {
        title: '描述沒有放關鍵字',
        description: '描述還沒有加入焦點關鍵字',
        recommendation: '在描述中加入焦點關鍵字，讓搜尋引擎更容易理解這篇文章在講什麼！'
      }
    },
    en: {
      name: 'Meta Description Keyword Check',
      good: {
        title: 'Meta Description Contains Keyword',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Meta Description Needs Improvement',
        description: 'Meta description missing focus keyword',
        recommendation: 'Include your focus keyword in the meta description.'
      }
    }
  },


  META_DESCRIPTION_MISSING: {
    'zh-TW': {
      name: 'Meta Description 檢測',
      good: {
        title: '描述長度剛剛好',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '描述有點短',
        description: '描述再寫長一點會更好',
        recommendation: '多寫幾句話介紹文章內容，讓讀者更想點進來！'
      },
      bad: {
        title: '描述需要調整',
        description: '描述太長或沒有寫',
        recommendation: '寫一段 120-160 字的描述，讓讀者知道文章在講什麼！',
        missing: {
          title: '還沒寫描述',
          description: '這篇文章還沒有 Meta 描述',
          recommendation: '加上描述讓搜尋結果更吸引人點擊！'
        },
        tooLong: {
          title: '描述太長了',
          description: '描述太長會被搜尋引擎截斷',
          recommendation: '精簡一下描述，讓重點在前面就能看到。'
        }
      }
    },
    en: {
      name: 'Meta Description Length Check',
      good: {
        title: 'Meta Description Length Good',
        description: '',
        recommendation: ''
      },
      ok: {
        title: 'Meta Description Too Short',
        description: 'Meta description is too short',
        recommendation: 'Expand meta description. Optimal: >600px.'
      },
      bad: {
        title: 'Meta Description Issue',
        description: 'Meta description missing or too long',
        recommendation: 'Adjust meta description (optimal: 600-960px).',
        missing: {
          title: 'Meta Description Missing',
          description: 'Page is missing meta description',
          recommendation: 'Add a meta description (optimal: 600-960px).'
        },
        tooLong: {
          title: 'Meta Description Too Long',
          description: 'Meta description exceeds recommended length',
          recommendation: 'Shorten meta description to under 960px.'
        }
      }
    }
  },

  TITLE_NEEDS_IMPROVEMENT: {
    'zh-TW': {
      name: '標題長度檢測',
      good: {
        title: '標題長度剛剛好',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '標題長度可以調整',
        description: '標題有點太短或太長',
        recommendation: '標題長度建議在 25-60 個字之間，這樣搜尋結果才能完整顯示。'
      },
      bad: {
        title: '還沒有標題',
        description: '這篇文章還沒設定標題',
        recommendation: '加上一個清楚描述文章內容的標題！'
      }
    },
    en: {
      name: 'Title Length Check',
      good: {
        title: 'Title Length Good',
        description: '',
        recommendation: ''
      },
      ok: {
        title: 'Title Length Needs Improvement',
        description: 'Title too short or too long',
        recommendation: 'Adjust title length. Optimal: >150px, max 600px.'
      },
      bad: {
        title: 'Title Missing',
        description: 'Page is missing title',
        recommendation:
          'Add a descriptive title (optimal width: >150px, max 600px).'
      }
    }
  },

  TITLE_MISSING: {
    'zh-TW': {
      name: '標題關鍵字檢測',
      good: {
        title: '標題有放關鍵字',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '沒有設定焦點關鍵字',
        description: '沒有提供焦點關鍵字，無法檢查',
        recommendation: '設定焦點關鍵字，我們才能檢查標題是否有放對關鍵字。'
      },
      bad: {
        title: '標題沒有放關鍵字',
        description: '標題還沒有加入焦點關鍵字',
        recommendation: '在標題中加入焦點關鍵字，讓讀者和搜尋引擎更容易理解文章在講什麼！'
      }
    },
    en: {
      name: 'Title Keyword Check',
      good: {
        title: 'Title Contains Keywords',
        description: '',
        recommendation: ''
      },
      ok: {
        title: 'Title Contains Focus Keyword',
        description: 'Title contains the focus keyword',
        recommendation: 'Good! Title contains the focus keyword.'
      },
      bad: {
        title: 'Title Missing Keywords',
        description: 'Title missing focus keyword',
        recommendation:
          'Include your focus keyword and at least one related keyword in the title.'
      }
    }
  },

  CONTENT_LENGTH_SHORT: {
    'zh-TW': {
      name: '內容長度檢測',
      good: {
        title: '內容字數足夠',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '內容有點短',
        description: '文章字數偏少',
        recommendation: '建議再多寫一點，讓內容更豐富完整！建議至少 300 字以上。'
      }
    },
    en: {
      name: 'Content Length Check',
      good: {
        title: 'Content Length Good',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Content Too Short',
        description: 'Content has insufficient words',
        recommendation: 'Consider expanding your content to at least 300 words.'
      }
    }
  },

  INTERNAL_LINKS_LOW: {
    'zh-TW': {
      name: '站內連結檢測',
      good: {
        title: '站內連結數量充足',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '站內連結有點少',
        description: '文章的內部連結偏少',
        recommendation: '多放幾個相關文章的連結，讓讀者可以延伸閱讀更多好內容！'
      }
    },
    en: {
      name: 'Internal Links Check',
      good: {
        title: 'Sufficient Internal Links',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Few Internal Links',
        description: 'Article has limited internal links',
        recommendation: 'Add more internal links to improve site structure and user experience.'
      }
    }
  },

  // ========== 可讀性評估項目 (4個) ==========

  FLESCH_READING_EASE: {
    'zh-TW': {
      name: '可讀性評分',
      good: {
        title: '可讀性良好',
        description: '',
        recommendation: ''
      },
      ok: {
        title: '可讀性尚可',
        description: '文章可讀性一般',
        recommendation: '考慮簡化句子結構，使文章更易讀。'
      },
      bad: {
        title: '可讀性較差',
        description: '文章較難閱讀',
        recommendation: '使用更簡短的句子和常用詞彙來提升可讀性。'
      }
    },
    en: {
      name: 'Readability Score',
      good: {
        title: 'Good Readability',
        description: '',
        recommendation: ''
      },
      ok: {
        title: 'Fair Readability',
        description: 'Text readability is average',
        recommendation:
          'Consider simplifying sentence structure for better readability.'
      },
      bad: {
        title: 'Poor Readability',
        description: 'Text is difficult to read',
        recommendation:
          'Use shorter sentences and common words to improve readability.'
      }
    }
  },

  PARAGRAPH_LENGTH_LONG: {
    'zh-TW': {
      name: '段落長度檢測',
      good: {
        title: '段落長度適中',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '段落過長',
        description: '部分段落超過建議長度',
        recommendation: '將過長的段落分成較短的段落，每段建議不超過 150 字。'
      }
    },
    en: {
      name: 'Paragraph Length Check',
      good: {
        title: 'Good Paragraph Length',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Long Paragraphs',
        description: 'Some paragraphs exceed recommended length',
        recommendation:
          'Break long paragraphs into shorter ones. Aim for max 150 words per paragraph.'
      }
    }
  },

  SENTENCE_LENGTH_LONG: {
    'zh-TW': {
      name: '句子長度檢測',
      good: {
        title: '句子長度適中',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '句子過長',
        description: '過多句子超過建議長度',
        recommendation: '縮短過長的句子，每句建議不超過 20 個字。'
      }
    },
    en: {
      name: 'Sentence Length Check',
      good: {
        title: 'Good Sentence Length',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Long Sentences',
        description: 'Too many sentences exceed recommended length',
        recommendation:
          'Shorten long sentences. Aim for max 20 words per sentence.'
      }
    }
  },

  SUBHEADING_DISTRIBUTION_POOR: {
    'zh-TW': {
      name: '標題層級結構',
      good: {
        title: '標題層級很清楚',
        description: '',
        recommendation: ''
      },
      bad: {
        title: '需要多一點小標題',
        description: '有些段落太長，可以用小標題分段',
        recommendation: '每隔 2-3 段加個小標題，讓讀者更容易閱讀！'
      }
    },
    en: {
      name: 'Subheading Distribution Check',
      good: {
        title: 'Good Subheading Distribution',
        description: '',
        recommendation: ''
      },
      bad: {
        title: 'Poor Subheading Distribution',
        description: 'Text blocks too long without subheadings',
        recommendation:
          'Add subheadings to improve structure. Aim for at least one subheading per 300 words.'
      }
    }
  }
};

// 輔助函數：根據評估結果獲取對應的翻譯
function getAssessmentTranslation(
  assessmentId,
  status,
  language = 'zh-TW',
  details = {}
) {
  const assessment = assessmentTranslations[assessmentId];
  if (!assessment || !assessment[language]) {
    console.warn(`Translation not found for ${assessmentId} in ${language}`);
    return null;
  }

  const lang = assessment[language];
  const statusKey = status.toLowerCase(); // good, ok, bad

  // 特殊處理 META_DESCRIPTION_MISSING 的 bad 狀態
  if (assessmentId === 'META_DESCRIPTION_MISSING' && statusKey === 'bad') {
    // 根據 pixelWidth 判斷是缺失還是過長
    if (details.pixelWidth === 0) {
      return {
        name: lang.name,
        title: lang.bad.missing?.title || lang.bad.title,
        description: lang.bad.missing?.description || lang.bad.description,
        recommendation:
          lang.bad.missing?.recommendation || lang.bad.recommendation
      };
    } else if (details.pixelWidth > 960) {
      return {
        name: lang.name,
        title: lang.bad.tooLong?.title || lang.bad.title,
        description: lang.bad.tooLong?.description || lang.bad.description,
        recommendation:
          lang.bad.tooLong?.recommendation || lang.bad.recommendation
      };
    }
  }

  // 特殊處理 H2_SYNONYMS_MISSING，直接點出缺少的關鍵字與覆蓋率
  if (assessmentId === 'H2_SYNONYMS_MISSING') {
    const missingKeywords =
      details.missingRelatedKeywords || details.missingKeywords;
    const hasMissing =
      Array.isArray(missingKeywords) && missingKeywords.length > 0;
    const coverage = details.coveragePercentage;

    if (hasMissing || coverage !== undefined) {
      const keywordList = hasMissing
        ? missingKeywords.join(language === 'zh-TW' ? '、' : ', ')
        : '';
      const parts = [];

      if (coverage !== undefined) {
        parts.push(
          language === 'zh-TW'
            ? `H2 覆蓋率 ${coverage}%`
            : `H2 coverage ${coverage}%`
        );
      }
      if (hasMissing) {
        parts.push(
          language === 'zh-TW'
            ? `缺少：${keywordList}`
            : `Missing: ${keywordList}`
        );
      }

      return {
        name: lang.name,
        title: lang[statusKey]?.title || lang.bad.title,
        description: parts.join(language === 'zh-TW' ? '；' : '; '),
        recommendation: lang[statusKey]?.recommendation || lang.bad.recommendation
      };
    }
  }

  return {
    name: lang.name,
    title: lang[statusKey]?.title || lang.bad.title,
    description: lang[statusKey]?.description || lang.bad.description,
    recommendation: lang[statusKey]?.recommendation || lang.bad.recommendation
  };
}

// 評估影響級別翻譯
const impactTranslations = {
  high: { 'zh-TW': '高', en: 'High' },
  medium: { 'zh-TW': '中', en: 'Medium' },
  low: { 'zh-TW': '低', en: 'Low' }
};

// 評估類型翻譯
const typeTranslations = {
  SEO: { 'zh-TW': 'SEO', en: 'SEO' },
  READABILITY: { 'zh-TW': '可讀性', en: 'Readability' }
};

// 導出給前端使用
export {
  assessmentTranslations,
  getAssessmentTranslation,
  impactTranslations,
  typeTranslations
};
