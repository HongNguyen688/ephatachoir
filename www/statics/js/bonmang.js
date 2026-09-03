/*==========================================================================
   Bổn Mạng / 20 Năm Thành Lập — special seasonal template
===========================================================================
   Loaded from <head> on every page, WITHOUT `defer`, so it runs before the
   first paint. That is deliberate: it stamps the festive theme onto <html>
   early enough that members never see the normal design flash first.

   ── TO TURN THIS OFF EARLY ────────────────────────────────────────────
   Set `enabled: false` below. Nothing else needs to change.

   ── TO REUSE IT NEXT YEAR ─────────────────────────────────────────────
   Move `start` / `end` to the new dates AND swap the banner artwork in
   www/statics/images/ — the current image reads "2006 – 2026", so it would
   be wrong on any later anniversary.
==========================================================================*/
(function () {
  'use strict';

  /* ===== The only block you normally need to edit ====================== */
  var CAMPAIGN = {
    enabled: true,
    theme: 'bonmang',
    start: '2026-09-01T00:00:00', // local time, inclusive
    end: '2026-10-01T00:00:00', // local time, exclusive — Oct 1st turns it off
    force: true // show to everyone, even if they saved another theme
  };
  /* ===================================================================== */

  var now = new Date();
  var active =
    CAMPAIGN.enabled &&
    now >= new Date(CAMPAIGN.start) &&
    now < new Date(CAMPAIGN.end);

  // index.js reads this to decide whether the campaign outranks the
  // member's saved theme and the weeks.json auto-theme.
  window.EPHATA_CAMPAIGN = {
    active: active,
    theme: CAMPAIGN.theme,
    force: CAMPAIGN.force
  };

  if (!active) return;

  var root = document.documentElement;
  root.classList.add('campaign-bonmang'); // CSS hook: swaps the homepage hero
  if (CAMPAIGN.force) root.setAttribute('data-theme', CAMPAIGN.theme);
})();
