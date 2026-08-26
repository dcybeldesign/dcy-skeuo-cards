# Changelog

## 1.0.0
- First complete release. The fourteen cards of the project are ported to
  real installable code: light, climate, cover, sensor, smart plug, lock,
  fan, water heater, robot vacuum, alarm, weather, forecast, media
  player, camera.
- Everything is drawn in CSS and SVG, with no bitmap and no embedded
  font: textures, machined knob, corner screws, LCD screens, VU meter,
  vinyl record, LED ladder, and the sixteen weather icons. The bundle is
  240 kB, 59 kB gzipped.
- Fixed 310 px reference plane with an elastic width, scaled by a uniform
  `transform: scale()` computed from a `ResizeObserver`. Text included,
  nothing is ever truncated, and wide sections are filled instead of
  leaving two empty bands.
- Render filter on entity state references: 20 unrelated entity changes
  give 0 renders, one tracked change gives 1. Measured on the test bench
  over the 42 card instances it mounts.
- Smoothed motion with acceleration and deceleration on every value that
  moves, interpolated frame by frame so the native controls stay in
  place. User gestures are never animated and `prefers-reduced-motion`
  removes everything.
- Forecasts go through the `weather/subscribe_forecast` WebSocket
  subscription, dropped when the card leaves the screen and restored when
  it comes back. The legacy `forecast` attribute is still read for older
  integrations.
- Full French and English coverage of everything the user sees: card
  picker entries, editor labels and helpers, material menu, and
  configuration error messages. The language comes from Home Assistant
  when it is available, from the browser otherwise.
- Locks and alarm panels that declare a `code_format` open the entity
  dialog instead of calling a service that would fail. The code is never
  stored in the dashboard configuration.
- The camera card shows a refreshed snapshot rather than a continuous
  stream, and hands the live feed over to the entity dialog. This is a
  deliberate limit, documented in the README.
