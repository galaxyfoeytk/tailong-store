// ══════════════════════════════════════════════════
// 瀧飲山丘｜總部系統設定
//
// 總部是獨立的一套系統，有自己的試算表與 Apps Script，
// 與門市系統分開。這個檔案只需要填一個網址。
// ══════════════════════════════════════════════════
(function (global) {
  var BRAND_NAME = '瀧飲山丘';

  // ── 總部 Apps Script 部署網址 ─────────────────────
  // 部署 → 新增部署作業 → 網頁應用程式 → 複製網址貼在這裡
  var HQ_API = 'https://script.google.com/macros/s/AKfycbzbJlSu0Uw28GuwZzk4fOnDxc6JNBGXWEU-VcyvdjNdkjQR8hphSWpfyKIpj7ngFf9y/exec';

  global.HQ = {
    brand: BRAND_NAME,
    apiUrl: HQ_API,
    ready: HQ_API.indexOf('script.google.com') > -1,

    // GET：讀取類
    get: function (params) {
      var qs = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&');
      return fetch(HQ_API + '?' + qs).then(function (r) { return r.json(); });
    },

    // POST：寫入類（資料量大時不會受網址長度限制）
    post: function (params) {
      var body = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k]));
      }).join('&');
      return fetch(HQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).then(function (r) { return r.json(); });
    }
  };
})(window);
