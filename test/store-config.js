// ══════════════════════════════════════════════════
// 瀧飲山潮系統｜多店設定檔
// 用途：讓同一份前端程式碼可以透過網址參數 ?store=xxx
//       自動切換要連接哪一店的 Apps Script 後端
//
// 開新店時，只需要在下面 STORES 裡新增一筆設定，
// 不需要修改任何其他 html 檔案。
// ══════════════════════════════════════════════════
(function (global) {
  // 品牌名稱（全系統共用，改這裡所有店、所有頁面同步生效）
  var BRAND_NAME = '瀧飲山丘';
  // 舊的品牌字樣，載入時會自動替換成上面的 BRAND_NAME
  var BRAND_LEGACY = ['瀧飲山潮'];
  // 舊的店名字樣，載入時會自動替換成當前店別名稱
  var STORE_LEGACY = ['學士店'];

  var STORES = {
    xueshi: {
      name: '學士店',
      hq: true,                 // 納入總部統計
      // 2026/09 搬遷至公司帳號後的新部署網址
      apiUrl: 'https://script.google.com/macros/s/AKfycbx3Aa4hVPPVYP8MwEEXVXTHLHHY2pQQ4f9A9BsMCymwKPGuxS7AsZ-AdQsBSX9gnBg/exec'
    },

    changping: {
      name: '昌平店',
      hq: true,                 // 納入總部統計
      apiUrl: 'https://script.google.com/macros/s/AKfycbzgmuhiiw8eZS2mcX8HZjrZZ0YdAWYEb9NPkSg6QNLv4xN45PvFrQJ70yXZ-HiNLMYG/exec'
    },

    // ── 緊急回退用 ────────────────────────────────────────────
    // 若新後端出問題，把書籤網址加上 ?store=xueshi_old
    // 即可暫時切回舊帳號的後端（資料寫入舊試算表）
    // hq:false — 不納入總部統計，否則學士店會被重複計算
    xueshi_old: {
      name: '學士店（舊帳號備援）',
      hq: false,
      apiUrl: 'https://script.google.com/macros/s/AKfycbxCl8Kk2rj083r4CEbaf4eB3uSPmDE5aNv-92KD-NTfbARMXTjjgxC9uVWcZfNQ54GG/exec'
    }
  };

  // 沒有帶 ?store= 參數、也沒有本機記錄時，預設用哪一店
  // （避免舊的書籤/QR code 沒有帶參數就打不開）
  var DEFAULT_STORE = 'xueshi';
  var STORAGE_KEY = 'tailong_store_code';

  function resolveStoreCode() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get('store');

    if (fromUrl && STORES[fromUrl]) {
      try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch (e) {}
      return fromUrl;
    }
    if (fromUrl && !STORES[fromUrl]) {
      console.warn('[StoreConfig] 網址參數 store=' + fromUrl + ' 不存在於設定中，改用預設店別');
    }

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && STORES[saved]) return saved;
    } catch (e) {}

    return DEFAULT_STORE;
  }

  var code = resolveStoreCode();
  var store = STORES[code] || STORES[DEFAULT_STORE];

  global.StoreConfig = {
    code: code,
    name: store.name,
    brand: BRAND_NAME,
    apiUrl: store.apiUrl,
    getApiUrl: function () { return store.apiUrl; },
    getStoreName: function () { return store.name; },
    getStoreCode: function () { return code; },
    getBrandName: function () { return BRAND_NAME; },
    allStores: STORES,
    // 總部統計用：回傳所有納入統計的店（排除備援項目）
    hqStores: function () {
      return Object.keys(STORES)
        .filter(function (k) { return STORES[k].hq === true; })
        .map(function (k) {
          return { code: k, name: STORES[k].name, apiUrl: STORES[k].apiUrl };
        });
    },
    applyBranding: applyBranding
  };

  // ══════════════════════════════════════════════════
  // 自動把頁面上的品牌與店名換成目前設定
  // 只處理標題列等固定元素，不碰資料區塊
  // ══════════════════════════════════════════════════
  var BRAND_SELECTORS = [
    '.brand-sub', '.logo-badge', '.top-sub', '.top-brand',
    '.login-logo-name', '.login-logo-sub', '.brand',
    '.logo', '.sub', '.topbar-left', '.brand-name'
  ];

  function swapText(text) {
    var out = String(text);
    BRAND_LEGACY.forEach(function (old) {
      out = out.split(old).join(BRAND_NAME);
    });
    STORE_LEGACY.forEach(function (old) {
      out = out.split(old).join(store.name);
    });
    return out;
  }

  function swapTextNodes(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var replaced = swapText(node.nodeValue);
      if (replaced !== node.nodeValue) node.nodeValue = replaced;
    });
  }

  function applyBranding() {
    try {
      // 網頁標題
      if (document.title) document.title = swapText(document.title);

      // 手機加入主畫面時顯示的名稱
      var metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (metaTitle && metaTitle.content) metaTitle.content = swapText(metaTitle.content);

      // 頁面上的標題列元素
      BRAND_SELECTORS.forEach(function (sel) {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) swapTextNodes(els[i]);
      });
    } catch (e) {
      console.warn('[StoreConfig] 套用品牌名稱時發生問題：', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBranding);
  } else {
    applyBranding();
  }
})(window);
