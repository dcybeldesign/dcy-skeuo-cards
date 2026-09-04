# Changelog

## 1.0.3
- The camera card no longer crops the picture. Its monitor is 2.32:1 while a
  camera gives 16:9 or 4:3, and the image was filling the frame, so 23 % of
  the field of view was lost on a 16:9 camera and 43 % on a 4:3 one. The loss
  was taken off the top and the bottom, which is where a surveillance view
  usually carries what matters: the floor in front of a door, and the upper
  part of the field. The picture is now fitted inside the monitor, and the
  bands left on either side show the glass behind it, the way a real monitor
  does with a source that does not fill its panel.

## 1.0.2
- Card titles no longer start underneath the top-left screw. The screws were
  drawn at a fixed 16 px while everything else followed the scale factor, so
  on a 492 px card the title began 5 px inside the screw and on a 300 px card
  13 px inside it. Screws now scale like the rest of the plane, keeping the
  same relative size at every card width, and the title strip clears them on
  both sides.
- The engraved line on the horizontal fader cap now runs across the travel
  instead of along it, the way an index mark reads against a scale on a real
  desk. The vertical faders were already correct.
- Controls stay where you leave them. Setting a brightness, a blind position,
  a fan speed, a volume or a water heater setpoint no longer snaps back to the
  previous value and travels the same path again once the device confirms.
  The card holds the value you set until the entity actually moves, or until
  the command has clearly been lost.
- The warmth and colour faders on the light card hold their position too.
  They read the entity on every render and had no local value of their own, so
  the cap dropped back to where it was until the bulb answered. They are not
  smoothed: a fader the user has just placed should not glide on its own.
- The thermostat setpoint now reacts on press instead of on reply, and
  repeated presses accumulate. Three taps on plus used to compute the same
  single step three times while the thermostat had yet to answer, so the
  setpoint only advanced by one.
- The brightness knob no longer bottoms out at zero. It stops at 1 %, so
  turning it all the way down dims the light instead of switching it off.
  Switching off is what the toggle on the card is for, and a dimmer that cuts
  out at the end of its travel makes you lose the setting you had just found.
- Numeric readings follow the display precision Home Assistant holds for each
  entity, set by hand in its options or proposed by the integration, along
  with the decimal separator and the space before the unit. A sensor reporting
  58.333333 showed exactly that; it now reads 58 % like everywhere else in the
  dashboard. The percentages a card computes itself, brightness, blind
  position, fan speed and vacuum battery, take the same spacing, which is also
  what the frontend does with them. Compact forms keep their glued degree
  sign: the thermostat dial and the forecast strip.

## 1.0.1
- Fixed the card height in Masonry views. Size was declared through
  `getGridOptions()` alone, which Sections views honour and Masonry views
  ignore. The card fell back to the 96 px minimum height of its module and
  the reference plane ended up squeezed into a strip. The host now carries
  the aspect ratio of the plane, which Masonry applies and Sections
  overrides with its own cell height.
- Fixed the scale factor never reaching the DOM after the first render. The
  scale controller requested a render without naming a property, and the
  render filter reads the changed properties to decide, so the request was
  indistinguishable from a render with no cause and got dropped. Any resize
  after the first paint kept the previous factor: a card resized in place, a
  sidebar being collapsed, a tablet rotating.

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
