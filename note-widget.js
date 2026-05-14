/* Blue Bee Ink — note 新着記事ウィジェット v3 */
(function () {
  var widget = document.getElementById('note-widget');
  if (!widget) return;

  var style = document.createElement('style');
  style.textContent = `
    #note-widget { width: 100%; }
    .note-loading { font-size: 13px; color: #7a8a9a; padding: 10px 0; }
    .note-error { font-size: 13px; color: #b04040; padding: 8px 0; }
    .note-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .note-item { border-bottom: 1px solid rgba(46, 96, 144, 0.10); }
    .note-item:last-child { border-bottom: none; }
    .note-item a {
      display: flex; flex-direction: column; gap: 4px;
      padding: 13px 0; text-decoration: none; color: inherit;
      transition: opacity 0.18s;
    }
    .note-item a:hover { opacity: 0.68; }
    .note-date { font-size: 11px; color: #a0aab4; letter-spacing: 0.03em; }
    .note-title {
      font-size: 14px; font-weight: 700; color: #2E6090;
      line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .note-excerpt {
      font-size: 12px; color: #7a8a9a; line-height: 1.7;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .note-more {
      display: inline-flex; align-items: center; gap: 4px;
      margin-top: 12px; font-size: 12px; font-weight: 600;
      color: #4a8bbf; text-decoration: none;
      transition: gap 0.18s, opacity 0.18s;
    }
    .note-more:hover { gap: 7px; opacity: 0.75; }
  `;
  document.head.appendChild(style);

  var NOTE_USER = 'kannapple';
  var RSS_URL   = 'https://note.com/' + NOTE_USER + '/rss';
  var PROXIES = [
    'https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL),
    'https://corsproxy.io/?' + encodeURIComponent(RSS_URL),
  ];

  function tryProxy(index) {
    if (index >= PROXIES.length) {
      widget.innerHTML =
        '<p class="note-error">記事を取得できませんでした。<br>' +
        '<a href="https://note.com/' + NOTE_USER + '" target="_blank" rel="noopener" style="color:#4a8bbf;">note で確認する →</a></p>';
      return;
    }
    fetch(PROXIES[index])
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
      .then(function (raw) {
        var xmlStr = raw;
        try { var json = JSON.parse(raw); if (json && json.contents) xmlStr = json.contents; } catch (e) {}
        if (!xmlStr || xmlStr.length < 50) throw new Error('empty');
        var doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
        var items = Array.from(doc.querySelectorAll('item')).slice(0, 4);
        if (!items.length) throw new Error('no items');
        render(items);
      })
      .catch(function () { tryProxy(index + 1); });
  }

  function render(items) {
    var html = '<ul class="note-list">';
    items.forEach(function (item) {
      var title = getText(item, 'title');
      var link  = getLink(item);
      var date  = formatDate(getText(item, 'pubDate'));
      var desc  = getText(item, 'description');
      var tmp = document.createElement('div');
      tmp.innerHTML = desc;
      var excerpt = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 75);
      if (excerpt.length === 75) excerpt += '…';
      html +=
        '<li class="note-item">' +
          '<a href="' + e(link) + '" target="_blank" rel="noopener">' +
            (date ? '<span class="note-date">' + date + '</span>' : '') +
            '<span class="note-title">' + e(title) + '</span>' +
            (excerpt ? '<span class="note-excerpt">' + e(excerpt) + '</span>' : '') +
          '</a>' +
        '</li>';
    });
    html += '</ul>';
    html += '<a class="note-more" href="https://note.com/' + NOTE_USER + '" target="_blank" rel="noopener">note をもっと見る →</a>';
    widget.innerHTML = html;
  }

  function getText(item, tag) {
    var el = item.querySelector(tag);
    return el ? (el.textContent || '').trim() : '';
  }
  function getLink(item) {
    var els = item.getElementsByTagName('link');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t.startsWith('http')) return t;
      var sib = els[i].nextSibling;
      if (sib && sib.nodeType === 3) {
        t = sib.textContent.trim();
        if (t.startsWith('http')) return t;
      }
    }
    return '#';
  }
  function formatDate(str) {
    if (!str) return '';
    var d = new Date(str);
    if (isNaN(d)) return '';
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }
  function e(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  tryProxy(0);
})();
