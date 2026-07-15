/* Image Runner - global telemetry stub (local dev, no-op) */
(function () {
  window.telemetry = window.telemetry || {
    track: function () { /* no-op in local dev */ },
    page: function () { /* no-op in local dev */ }
  };
})();
