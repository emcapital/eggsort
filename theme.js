// Eggsorter – shared light/dark theme (load as a normal <script> in <head> on every page)
(function () {
  var KEY = 'eggsorter-theme', root = document.documentElement;
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var calm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;

  // styles for the "spreading" switch (View Transitions API) – the new theme grows out of the clicked button
  var st = document.createElement('style');
  st.textContent =
    '::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}' +
    '::view-transition-old(root){z-index:1}::view-transition-new(root){z-index:2}' +
    '.theme-switching *,.theme-switching *::before,.theme-switching *::after{transition:none!important}';
  (document.head || root).appendChild(st);

  var meta = document.createElement('meta');
  meta.name = 'theme-color';
  (document.head || root).appendChild(meta);

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function system() { return mq && mq.matches ? 'dark' : 'light'; }
  function apply(t) {
    root.setAttribute('data-theme', t);
    root.style.colorScheme = t;
    meta.content = t === 'dark' ? '#0c1514' : '#f6f7f4';
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  var first = saved();
  apply(first === 'dark' || first === 'light' ? first : system());

  window.EggTheme = {
    get: function () { return root.getAttribute('data-theme'); },
    set: function (t) { try { localStorage.setItem(KEY, t); } catch (e) { } apply(t); },
    // pass the click event so the new theme spreads out from the button
    toggle: function (ev) {
      var self = this, next = this.get() === 'dark' ? 'light' : 'dark';
      if (!document.startViewTransition || (calm && calm.matches)) { self.set(next); return; }
      var x = innerWidth / 2, y = innerHeight / 2, el = ev && ev.currentTarget;
      if (el && el.getBoundingClientRect) {
        var r = el.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top + r.height / 2;
      }
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('theme-switching');
      var vt = document.startViewTransition(function () { self.set(next); });
      vt.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () { });
      vt.finished.then(function () { root.classList.remove('theme-switching'); }, function () { root.classList.remove('theme-switching'); });
    }
  };

  // follow the device setting until the person picks one themselves
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (!saved()) apply(system()); });
  // keep other open tabs/pages in sync
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) apply(e.newValue);
  });
})();