/*
 * ハムチーズのゲームセンター 共通バナー
 *
 * 使い方（各ゲームのタイトル画面・メニュー画面に）：
 *   <div class="hc-banner"></div>
 *   <script src="/ads-banner.js" defer></script>
 *
 * - 下の SLOT（AdSense の「広告ユニット」の番号）が空のあいだは、
 *   「ハムチーズのゲームセンター」への自前のバナーを出す（ゲームセンター自身のページには出さない）
 * - SLOT に番号を入れると、AdSense の広告に切り替わる（画面に見えたときに読み込む）
 * - 遊んでいる最中の画面には置かないこと（タイトル・メニュー・ステージ選択など）
 * - URL に ?noads をつけると何も出さない（自分で確認するとき用）
 */
(function () {
  var CLIENT = 'ca-pub-7660505651126592';
  var SLOT = '3264432823'; // ← 審査に通ったら「広告 → 広告ユニットごと → ディスプレイ広告」で作った番号（数字だけ）を入れる

  var CENTER = 'https://hamcheese-jp.github.io/';
  var off = /[?&]noads\b/.test(location.search);
  var ads = !off && /^\d+$/.test(SLOT);
  var isCenter = location.hostname === 'hamcheese-jp.github.io' && (location.pathname === '/' || location.pathname === '/index.html');
  var promo = !off && !ads && !isCenter;
  // ready：AdSense の広告が出せるか（ゲームセンターのページはこれを見て枠を作る）
  window.hcBanner = { ready: ads, scan: function () {} };
  if (!ads && !promo) return;

  var style = document.createElement('style');
  style.textContent =
    // 中身が入る前の空の枠でも幅を持たせる（中央ぞろえの画面だと、空の枠は幅0になって「見えていない」扱いになるため）
    '.hc-banner{display:block;width:100%;max-width:728px;margin-left:auto;margin-right:auto;min-height:1px;box-sizing:border-box}' +
    '.hc-banner-on{display:block;width:100%;max-width:728px;margin:14px auto;text-align:center;overflow:hidden;box-sizing:border-box}' +
    '.hc-banner-on .hc-banner-label{font-size:11px;opacity:.6;margin:0 0 4px;text-align:left}' +
    '.hc-promo{display:flex;align-items:center;gap:12px;padding:8px;border-radius:14px;text-decoration:none;text-align:left;' +
    'background:linear-gradient(90deg,#fff3e2,#ffe6f1);color:#3b2f2a;box-shadow:0 3px 10px rgba(150,100,60,.18);font-family:inherit}' +
    '.hc-promo img{width:128px;height:67px;object-fit:cover;border-radius:9px;flex:0 0 auto;display:block}' +
    '.hc-promo b{display:block;font-size:15px;line-height:1.35}' +
    '.hc-promo span{display:block;font-size:12px;opacity:.8;margin-top:2px}' +
    '.hc-promo i{margin-left:auto;font-style:normal;font-size:13px;font-weight:700;color:#fff;background:#ff8a5c;border-radius:99px;padding:6px 12px;white-space:nowrap}' +
    '@media (max-width:420px){.hc-promo img{width:96px;height:50px}.hc-promo b{font-size:14px}.hc-promo i{padding:5px 9px}}';
  document.head.appendChild(style);

  function loadLib() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
  }

  // ゲームセンターへの自前バナー（どのゲームから来たかを集計で見られるように from= をつける）
  function promoBanner(el) {
    var from = (location.pathname.split('/')[1] || 'game');
    var a = document.createElement('a');
    a.className = 'hc-promo';
    a.href = CENTER + '?from=' + encodeURIComponent(from);
    a.innerHTML = '<img src="/og.png" alt="ハムチーズのゲームセンター" loading="lazy">' +
      '<div><b>🎮 ハムチーズのゲームセンター</b><span>ほかの無料ゲームもあそべるよ！</span></div><i>ひらく ›</i>';
    el.appendChild(a);
  }

  // 見えている（幅がある）ときだけ中身を入れる。隠れた画面で入れると広告が出ないため
  function fill(el) {
    if (el.getAttribute('data-hc-done') || el.offsetWidth < 50) return;
    el.setAttribute('data-hc-done', '1');
    el.classList.add('hc-banner-on');
    if (!ads) { promoBanner(el); return; }
    var label = document.createElement('div');
    label.className = 'hc-banner-label';
    label.textContent = '広告';
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', SLOT);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    el.appendChild(label);
    el.appendChild(ins);
    loadLib();
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) fill(e.target); });
  }) : null;
  var watched = typeof WeakSet === 'function' ? new WeakSet() : null;

  function scan() {
    var list = document.querySelectorAll('.hc-banner');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.getAttribute('data-hc-done')) continue;
      if (io && watched && !watched.has(el)) { watched.add(el); io.observe(el); }
      else if (!io) fill(el);
    }
  }
  window.hcBanner.scan = scan;

  function start() {
    scan();
    // あとから画面に足されたバナーの置き場所も見つける
    if ('MutationObserver' in window) new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
