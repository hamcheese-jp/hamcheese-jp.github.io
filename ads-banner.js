/*
 * ハムチーズのゲームセンター 共通バナー広告
 *
 * 使い方（各ゲームのタイトル画面・メニュー画面に）：
 *   <div class="hc-banner"></div>
 *   <script src="/ads-banner.js" defer></script>
 *
 * - 下の SLOT（AdSense の「広告ユニット」の番号）が空のあいだは、何も表示しない（空の枠も出さない）
 * - 番号を入れると、.hc-banner がある全部のページに、画面に見えたときにバナーが出る
 * - 遊んでいる最中の画面には置かないこと（タイトル・メニュー・ステージ選択など）
 * - URL に ?noads をつけると表示しない（自分で確認するとき用）
 */
(function () {
  var CLIENT = 'ca-pub-7660505651126592';
  var SLOT = ''; // ← 審査に通ったら「広告 → 広告ユニットごと → ディスプレイ広告」で作った番号（数字だけ）を入れる

  var ready = /^\d+$/.test(SLOT) && !/[?&]noads\b/.test(location.search);
  window.hcBanner = { ready: ready, scan: function () {} };
  if (!ready) return;

  var style = document.createElement('style');
  style.textContent =
    '.hc-banner-on{display:block;width:100%;max-width:728px;margin:14px auto;text-align:center;overflow:hidden}' +
    '.hc-banner-on .hc-banner-label{font-size:11px;opacity:.6;margin:0 0 4px;text-align:left}';
  document.head.appendChild(style);

  function loadLib() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
  }

  // 見えている（幅がある）ときだけ広告を入れる。隠れた画面で入れると広告が出ないため
  function fill(el) {
    if (el.getAttribute('data-hc-done') || el.offsetWidth < 50) return;
    el.setAttribute('data-hc-done', '1');
    el.classList.add('hc-banner-on');
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
