(function () {
  'use strict';

  var STORAGE_KEY = 'bst_cookie_preferences_v1';
  var currentFocus = null;

  function loadPreferences() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.version === 1 ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function applyPreferences(preferences) {
    var gpc = navigator.globalPrivacyControl === true;
    document.documentElement.dataset.analyticsConsent = (preferences.analytics && !gpc) ? 'granted' : 'denied';
    document.documentElement.dataset.marketingConsent = (preferences.marketing && !gpc) ? 'granted' : 'denied';
    document.documentElement.dataset.gpc = gpc ? 'on' : 'off';
    window.dispatchEvent(new CustomEvent('bst:consent-updated', { detail: preferences }));
  }

  function savePreferences(analytics, marketing) {
    var preferences = {
      version: 1,
      necessary: true,
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch (error) {}
    applyPreferences(preferences);
    hideBanner();
    closeModal();
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.remove('is-visible');
  }

  function openModal() {
    var modal = document.getElementById('cookie-modal');
    if (!modal) return;
    currentFocus = document.activeElement;
    var saved = loadPreferences();
    document.getElementById('cookie-analytics').checked = Boolean(saved && saved.analytics);
    document.getElementById('cookie-marketing').checked = Boolean(saved && saved.marketing);
    modal.hidden = false;
    document.body.classList.add('cookie-modal-open');
    document.getElementById('cookie-dialog-title').focus();
  }

  function closeModal() {
    var modal = document.getElementById('cookie-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('cookie-modal-open');
    if (currentFocus && typeof currentFocus.focus === 'function') currentFocus.focus();
  }

  function addFooterLinks() {
    var footerInner = document.querySelector('.site-footer .footer-inner');
    if (!footerInner || footerInner.querySelector('.footer-legal-nav')) return;
    var legalNav = document.createElement('nav');
    legalNav.className = 'footer-legal-nav';
    legalNav.setAttribute('aria-label', 'Legal');
    legalNav.innerHTML = '<a href="privacy-policy.html">Privacy Policy</a>' +
      '<a href="terms-of-use.html">Terms of Use</a>' +
      '<button type="button" id="cookie-preferences-link">Cookie Preferences</button>';
    var copyright = footerInner.querySelector('.footer-copyright');
    footerInner.insertBefore(legalNav, copyright || null);
    legalNav.querySelector('#cookie-preferences-link').addEventListener('click', openModal);
  }

  function addCookieUi() {
    if (document.getElementById('cookie-banner')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<section class="cookie-banner" id="cookie-banner" role="region" aria-label="Cookie notice">' +
        '<h2>Your privacy choices</h2>' +
        '<p>We use necessary browser storage to remember your choices. Optional analytics and marketing technologies remain off unless you allow them. See our <a href="privacy-policy.html#cookies">Privacy Policy</a>.</p>' +
        '<div class="cookie-actions">' +
          '<button class="cookie-button primary" type="button" id="cookie-accept">Accept all</button>' +
          '<button class="cookie-button" type="button" id="cookie-reject">Reject non-essential</button>' +
          '<button class="cookie-button" type="button" id="cookie-manage">Manage preferences</button>' +
        '</div>' +
      '</section>' +
      '<div class="cookie-modal" id="cookie-modal" hidden>' +
        '<section class="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-dialog-title">' +
          '<h2 id="cookie-dialog-title" tabindex="-1">Cookie preferences</h2>' +
          '<p>Choose which optional technologies this site may use. You can change these settings at any time from the footer.</p>' +
          '<div class="cookie-category"><div><strong>Necessary</strong><span>Required for security and to remember your privacy choice.</span></div><div class="cookie-lock">Always on</div></div>' +
          '<label class="cookie-category"><div><strong>Analytics</strong><span>Would help us understand site usage if analytics are added in the future.</span></div><input id="cookie-analytics" type="checkbox"></label>' +
          '<label class="cookie-category"><div><strong>Marketing</strong><span>Would support advertising or campaign measurement if these tools are added in the future.</span></div><input id="cookie-marketing" type="checkbox"></label>' +
          '<div class="cookie-actions">' +
            '<button class="cookie-button primary" type="button" id="cookie-save">Save preferences</button>' +
            '<button class="cookie-button" type="button" id="cookie-cancel">Cancel</button>' +
          '</div>' +
        '</section>' +
      '</div>');

    document.getElementById('cookie-accept').addEventListener('click', function () { savePreferences(true, true); });
    document.getElementById('cookie-reject').addEventListener('click', function () { savePreferences(false, false); });
    document.getElementById('cookie-manage').addEventListener('click', openModal);
    document.getElementById('cookie-save').addEventListener('click', function () {
      savePreferences(document.getElementById('cookie-analytics').checked, document.getElementById('cookie-marketing').checked);
    });
    document.getElementById('cookie-cancel').addEventListener('click', closeModal);
    document.getElementById('cookie-modal').addEventListener('click', function (event) {
      if (event.target.id === 'cookie-modal') closeModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });

    var saved = loadPreferences();
    if (saved) applyPreferences(saved);
    else document.getElementById('cookie-banner').classList.add('is-visible');
  }

  function init() {
    addFooterLinks();
    addCookieUi();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* Third-party video embeds (YouTube via youtube-nocookie.com) load only after an explicit click. */
(function () {
  'use strict';
  function setup() {
    var frames = document.querySelectorAll('iframe[data-src]');
    Array.prototype.forEach.call(frames, function (frame) {
      var holder = frame.parentNode;
      if (!holder || holder.querySelector('.bst-embed-consent')) return;
      var box = document.createElement('div');
      box.className = 'bst-embed-consent';
      box.innerHTML = '<div><p>This video is hosted by YouTube (Google). Loading it sends your IP address and browser details to Google and may set cookies. It stays off until you choose to load it. See our <a href="privacy-policy.html">Privacy Policy</a>.</p>' +
        '<button type="button" class="cookie-button primary">Load video</button></div>';
      holder.appendChild(box);
      box.querySelector('button').addEventListener('click', function () {
        var src = frame.getAttribute('data-src');
        src += (src.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
        frame.setAttribute('src', src);
        box.parentNode.removeChild(box);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
