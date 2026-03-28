(function () {
  "use strict";

  var OVERRIDE_KEY = "imgrunner.telemetry.override.v1";
  var SESSION_KEY = "imgrunner.admin.telemetry.session.v1";
  var LOCKOUT_KEY = "imgrunner.admin.telemetry.lockout.v1";

  var PASSWORD_HASH = "7d9b3c8ae80be1ad80d9fc58dd4cc6738723dfcde7c1c9d7ee210d40fb95ee39";
  var PASSWORD_SALT = "IMGRUNNER_ADMIN_v1";

  var MAX_ATTEMPTS = 5;
  var LOCKOUT_MINUTES = 10;
  var SESSION_MINUTES = 20;

  var adsenseRegex = /^ca-pub-\d{10,20}$/;
  var ga4Regex = /^G-[A-Z0-9]{6,16}$/;

  var loginCard = document.getElementById("login-card");
  var panelCard = document.getElementById("panel-card");

  var passwordInput = document.getElementById("admin-password");
  var loginBtn = document.getElementById("login-btn");
  var loginMessage = document.getElementById("login-message");

  var adsenseInput = document.getElementById("adsense-client");
  var ga4Input = document.getElementById("ga4-id");
  var saveBtn = document.getElementById("save-btn");
  var clearBtn = document.getElementById("clear-btn");
  var logoutBtn = document.getElementById("logout-btn");
  var panelMessage = document.getElementById("panel-message");
  var savedMeta = document.getElementById("saved-meta");

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = "";
    for (var i = 0; i < bytes.length; i += 1) {
      var part = bytes[i].toString(16);
      hex += part.length === 1 ? "0" + part : part;
    }
    return hex;
  }

  function sha256(text) {
    var enc = new TextEncoder();
    var input = enc.encode(text);
    return window.crypto.subtle.digest("SHA-256", input).then(toHex);
  }

  function getLockout() {
    try {
      var raw = localStorage.getItem(LOCKOUT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return {
        attempts: Number(data.attempts || 0),
        blockedUntil: Number(data.blockedUntil || 0)
      };
    } catch (_error) {
      return null;
    }
  }

  function setLockout(attempts, blockedUntil) {
    localStorage.setItem(
      LOCKOUT_KEY,
      JSON.stringify({ attempts: attempts, blockedUntil: blockedUntil || 0 })
    );
  }

  function clearLockout() {
    localStorage.removeItem(LOCKOUT_KEY);
  }

  function isBlocked() {
    var lock = getLockout();
    if (!lock) return false;
    if (!lock.blockedUntil) return false;
    if (Date.now() > lock.blockedUntil) {
      clearLockout();
      return false;
    }
    return true;
  }

  function blockedText() {
    var lock = getLockout();
    if (!lock || !lock.blockedUntil) return "";
    var ms = Math.max(0, lock.blockedUntil - Date.now());
    var minutes = Math.ceil(ms / 60000);
    return "Too many attempts. Try again in " + minutes + " minute(s).";
  }

  function saveSession() {
    var expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt: expiresAt }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function hasValidSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return false;
      return Number(parsed.expiresAt || 0) > Date.now();
    } catch (_error) {
      return false;
    }
  }

  function touchSession() {
    if (hasValidSession()) saveSession();
  }

  function setLoginMessage(msg, kind) {
    loginMessage.textContent = msg || "";
    loginMessage.className = "message " + (kind || "");
  }

  function setPanelMessage(msg, kind) {
    panelMessage.textContent = msg || "";
    panelMessage.className = "message " + (kind || "");
  }

  function readOverrides() {
    try {
      var raw = localStorage.getItem(OVERRIDE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        adsenseClient: String(parsed.adsenseClient || "").trim(),
        ga4MeasurementId: String(parsed.ga4MeasurementId || "").trim(),
        updatedAt: String(parsed.updatedAt || "")
      };
    } catch (_error) {
      return null;
    }
  }

  function renderSavedMeta(data) {
    if (!data) {
      savedMeta.textContent = "Using default ids from site config.";
      return;
    }

    var parts = [];
    parts.push(data.adsenseClient ? "AdSense: " + data.adsenseClient : "AdSense: default");
    parts.push(data.ga4MeasurementId ? "GA4: " + data.ga4MeasurementId : "GA4: default");
    if (data.updatedAt) parts.push("Updated: " + data.updatedAt);
    savedMeta.textContent = parts.join(" | ");
  }

  function loadForm() {
    var data = readOverrides();
    adsenseInput.value = data && data.adsenseClient ? data.adsenseClient : "";
    ga4Input.value = data && data.ga4MeasurementId ? data.ga4MeasurementId : "";
    renderSavedMeta(data);
  }

  function showLogin() {
    loginCard.hidden = false;
    panelCard.hidden = true;
    passwordInput.value = "";
    setPanelMessage("", "");

    if (isBlocked()) {
      setLoginMessage(blockedText(), "error");
      loginBtn.disabled = true;
    } else {
      setLoginMessage("", "");
      loginBtn.disabled = false;
    }
  }

  function showPanel() {
    loginCard.hidden = true;
    panelCard.hidden = false;
    loadForm();
    setLoginMessage("", "");
    setPanelMessage("", "");
  }

  function validateInputs(adsense, ga4) {
    if (adsense && !adsenseRegex.test(adsense)) {
      return "AdSense id invalid. Example: ca-pub-1234567890123456";
    }

    if (ga4 && !ga4Regex.test(ga4)) {
      return "GA4 id invalid. Example: G-ABC1234567";
    }

    return "";
  }

  function saveOverrides() {
    var adsense = adsenseInput.value.trim();
    var ga4 = ga4Input.value.trim().toUpperCase();

    var error = validateInputs(adsense, ga4);
    if (error) {
      setPanelMessage(error, "error");
      return;
    }

    var payload = {
      adsenseClient: adsense,
      ga4MeasurementId: ga4,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(payload));
    renderSavedMeta(payload);
    setPanelMessage("Saved. New ids will apply on next page load.", "ok");
    touchSession();
  }

  function clearOverrides() {
    localStorage.removeItem(OVERRIDE_KEY);
    adsenseInput.value = "";
    ga4Input.value = "";
    renderSavedMeta(null);
    setPanelMessage("Custom ids cleared. Default site config will be used.", "ok");
    touchSession();
  }

  async function handleLogin() {
    if (isBlocked()) {
      setLoginMessage(blockedText(), "error");
      return;
    }

    var pass = passwordInput.value;
    if (!pass) {
      setLoginMessage("Password is required.", "error");
      return;
    }

    loginBtn.disabled = true;
    setLoginMessage("Checking...", "");

    try {
      var hash = await sha256(pass + "|" + PASSWORD_SALT);
      if (hash === PASSWORD_HASH) {
        clearLockout();
        saveSession();
        showPanel();
        return;
      }

      var lock = getLockout() || { attempts: 0, blockedUntil: 0 };
      var attempts = lock.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        var blockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        setLockout(attempts, blockedUntil);
        setLoginMessage(blockedText(), "error");
      } else {
        setLockout(attempts, 0);
        setLoginMessage("Wrong password. Attempts left: " + (MAX_ATTEMPTS - attempts), "error");
      }
    } catch (_error) {
      setLoginMessage("Login failed. Browser crypto unavailable.", "error");
    } finally {
      if (!isBlocked()) loginBtn.disabled = false;
    }
  }

  function logout() {
    clearSession();
    showLogin();
  }

  function init() {
    if (!window.crypto || !window.crypto.subtle) {
      setLoginMessage("Secure login requires modern browser crypto.", "error");
      loginBtn.disabled = true;
      return;
    }

    loginBtn.addEventListener("click", handleLogin);
    passwordInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") handleLogin();
    });

    saveBtn.addEventListener("click", saveOverrides);
    clearBtn.addEventListener("click", clearOverrides);
    logoutBtn.addEventListener("click", logout);

    ["click", "keydown", "mousemove", "touchstart"].forEach(function (evt) {
      document.addEventListener(evt, touchSession, { passive: true });
    });

    if (hasValidSession()) showPanel();
    else showLogin();
  }

  init();
})();
