// ══════════════════════════════════════════════════
// 瀧飲山潮系統｜多店設定檔
// 用途：讓同一份前端程式碼可以透過網址參數 ?store=xxx
//       自動切換要連接哪一店的 Apps Script 後端
//
// 開新店時，只需要在下面 STORES 裡新增一筆設定，
// 不需要修改任何其他 html 檔案。
// ══════════════════════════════════════════════════
(function (global) {
  var STORES = {
    xueshi: {
      name: '學士店',
      // 2026/09 搬遷至公司帳號後的新部署網址
      apiUrl: 'https://script.google.com/macros/s/AKfycbx3Aa4hVPPVYP8MwEEXVXTHLHHY2pQQ4f9A9BsMCymwKPGuxS7AsZ-AdQsBSX9gnBg/exec'
    },

    // ── 緊急回退用 ────────────────────────────────────────────
    // 若新後端出問題，把書籤網址加上 ?store=xueshi_old
    // 即可暫時切回舊帳號的後端（資料寫入舊試算表）
    xueshi_old: {
      name: '學士店（舊帳號備援）',
      apiUrl: 'https://script.google.com/macros/s/AKfycbxCl8Kk2rj083r4CEbaf4eB3uSPmDE5aNv-92KD-NTfbARMXTjjgxC9uVWcZfNQ54GG/exec'
    }
    // 開二店時範例（把下面這段取消註解、填入二店的部署網址）：
    // store2: {
    //   name: '二店',
    //   apiUrl: 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec'
    // }
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
    apiUrl: store.apiUrl,
    getApiUrl: function () { return store.apiUrl; },
    getStoreName: function () { return store.name; },
    getStoreCode: function () { return code; },
    allStores: STORES
  };
})(window);
