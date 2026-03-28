(function () {
  "use strict";

  var OVERRIDE_KEY = "imgrunner.telemetry.override.v1";
  var cfg = window.IMGRUNNER_SITE_CONFIG || {};

  function readLocalOverride() {
    try {
      if (!window.localStorage) return {};
      var raw = window.localStorage.getItem(OVERRIDE_KEY);
      if (!raw) return {};

      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};

      return {
        adsenseClient: String(parsed.adsenseClient || "").trim(),
        ga4MeasurementId: String(parsed.ga4MeasurementId || "").trim()
      };
    } catch (_error) {
      return {};
    }
  }

  var localOverride = readLocalOverride();
  var adsenseClient = (localOverride.adsenseClient || cfg.adsenseClient || "").trim();
  var ga4MeasurementId = (localOverride.ga4MeasurementId || cfg.ga4MeasurementId || "").trim();

  function loadScript(src, attrs) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) return existing;

    var s = document.createElement("script");
    s.src = src;
    s.async = true;

    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        s.setAttribute(key, attrs[key]);
      });
    }

    document.head.appendChild(s);
    return s;
  }

  function setupAdsense(client) {
    if (!/^ca-pub-\d{10,20}$/.test(client)) return;

    loadScript(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client),
      {
        crossorigin: "anonymous",
        "data-ad-client": client
      }
    );

    window.adsbygoogle = window.adsbygoogle || [];
  }

  function setupGA4(measurementId) {
    if (!/^G-[A-Z0-9]{6,16}$/.test(measurementId)) return;

    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId));

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = window.gtag || gtag;
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: true });
  }

  setupAdsense(adsenseClient);
  setupGA4(ga4MeasurementId);
})();
