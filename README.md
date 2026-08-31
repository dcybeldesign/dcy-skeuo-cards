# Skeuo Cards

A pack of skeuomorphic Lovelace cards for Home Assistant: carbon fibre fascia, machined metal knobs, recessed-rail faders, amber LCD screens.

![Preview of the fourteen cards](docs/apercu.png)

The fourteen cards of the project, built on a shared component library: light, climate, cover, sensor, smart plug, lock, fan, water heater, robot vacuum, alarm, weather, forecast, media player, camera.

**[Try the cards in your browser](https://dcybeldesign.github.io/dcy-skeuo-cards/demo/)**, nothing to install. Three of them run on simulated entities, with the material, the grain, the accent and the layout switchable.

*[Lire en français](README.fr.md)*

## What it does

Every card drives a real entity and calls the matching Home Assistant services. The controls are real controls: the knob takes pointer or keyboard input, the faders are rotated `input[type=range]` elements that keep native touch and ARIA semantics, the buttons are `<button>` elements.

Four choices shape the pack.

**Uniform scale factor.** The design is drawn at a fixed reference height of 310 px, then brought down to the real cell size by a `transform: scale()` computed from a `ResizeObserver`. Everything, text included, keeps exactly the same proportions at any size: nothing ever gets truncated. The width of the plane, on the other hand, stretches to fill wide sections instead of leaving two empty bands.

**No bitmap images.** Textures, knob, screws, screens and the sixteen weather icons are produced in CSS and SVG, all drawn for this pack, with no external icon set. The bundle is 240 kB (59 kB gzipped), and the rendering stays crisp at any display size, which a photograph could not do.

**Smoothed motion.** No value jumps from one point to another: cover position, thermostat and water heater setpoints, fan speed, player volume, knob brightness and VU meter needles reach their target by accelerating then decelerating. The value itself is interpolated frame by frame, which leaves the native controls in place and absorbs the steps an appliance reports while it is moving. A user gesture is never animated, and `prefers-reduced-motion` removes everything.

**Render filter.** `hass` is reassigned by Home Assistant on every state change of any entity in the system, several times per second. Each card only redraws if one of its own entities, the theme, the language or the connection has changed. Measured on the test bench: 20 unrelated entity changes give 0 renders, one tracked change gives 1.

## Installation

### HACS (custom repository)

1. HACS → ⋮ menu → **Custom repositories**
2. Repository URL, category **Dashboard**
3. Install **Skeuo Cards**, then reload the page

HACS registers the resource on its own and handles cache busting.

### Manual

Copy `dist/skeuo-cards.js` into `config/www/`, then declare the resource under **Settings → Dashboards → ⋮ → Resources**:

```
/local/skeuo-cards.js    (type: JavaScript Module)
```

## The cards

All of them are configurable with the mouse from the card editor. The YAML below is there for reference.

### Light

```yaml
type: custom:skeuo-light-card
entity: light.living_room
subtitle: Ceiling · Dimmer
```

The card adapts to what the bulb can do, read from `supported_color_modes`: a dimmer knob if it is dimmable, a warmth fader if it handles `color_temp`, a colour fader if it handles a colour. A plain on/off bulb only shows the screen and the switch.

| Option | Default | Purpose |
|---|---|---|
| `show_color_temp` | `true` | Hide the warmth fader even if the bulb supports it |
| `show_color` | `true` | Hide the colour fader |

The switch halo takes the real colour of the bulb when it exposes one.

The Warmth and Colour faders never drive the lamp at the same time: a bulb is either on a white temperature or on a colour. Whichever is not in charge fades to grey but stays usable, and touching it puts it back in charge. The active mode is read from `color_mode`, which Home Assistant switches on its own, so the card stays correct even when the light is driven from elsewhere: a scene, an automation, another tablet.

The glow and the symbol of the switch take the colour actually emitted, the one from the setting in charge: warm or cool white in white mode, the chosen hue in colour mode. It comes from `rgb_color` when the integration provides it, otherwise it is reconstructed from the colour temperature or from the hue.

The knob does not teleport to its new value: the marker and the screen reach it with the same acceleration and deceleration as the cover and the thermostat. Since the marker is not bound to steps, the motion is as smooth as the VU meter needle, one position per frame. A gesture on the knob is never animated, otherwise the marker would travel backwards on release.

### Climate

```yaml
type: custom:skeuo-climate-card
entity: climate.bedroom
subtitle: Analogue thermostat
```

The mode buttons follow the `hvac_modes` declared by the entity, four at most. The colour of the arc and the screens follows `hvac_action`: orange when heating, blue when cooling, amber at rest.

The setpoint does not jump when you press the buttons: the dial arc and the screen reach it with the same acceleration and deceleration as the cover, like a knob being turned. The duration is tuned on a scale in degrees rather than percent, otherwise a half-degree step would fall below the animation threshold.

| Option | Default | Purpose |
|---|---|---|
| `modes` | entity modes | Force the list of mode buttons |

### Cover

```yaml
type: custom:skeuo-cover-card
entity: cover.living_room
subtitle: Motorised blind
```

The fader only appears if the cover can position itself. Each button is disabled if `supported_features` does not declare the matching action, so a cover with no stop command does not show a dead button.

The slider does not jump from one position to another: it reaches the new one with an acceleration then a deceleration, over 300 to 820 ms depending on the distance, and the screen follows the same motion. The position of an `input[type=range]` derives from its value and not from a CSS property, so no transition can soften it: it is the value itself that is interpolated frame by frame, which preserves the native input and therefore touch, keyboard and ARIA semantics. The same mechanism absorbs the steps of a real cover, which reports its positions in jumps while it travels. A finger drag is never animated, otherwise the slider would travel backwards on release. Under `prefers-reduced-motion`, the motion is removed.

### Sensor

```yaml
type: custom:skeuo-sensor-card
entity: sensor.humidity
subtitle: Sensor · VU meter
```

The scale and the thresholds are derived from the `device_class` (humidity, temperature, pressure, battery, CO2, illuminance, power, PM2.5, VOC), and stay adjustable by hand.

| Option | Default | Purpose |
|---|---|---|
| `min` / `max` | from `device_class` | Scale bounds |
| `warn` | `0.6` | End of the green zone, as a fraction of the scale |
| `danger` | `0.85` | End of the amber zone |

The unit is always read from `unit_of_measurement` on the entity, never hard-coded.

The needle has the inertia of a galvanometer: it reaches its graduation by accelerating then decelerating, up to 760 ms for a full sweep. The digital display next to it changes at once. That contrast between the mechanical and the digital is what makes the instrument believable. The duration is computed from the fraction of the scale travelled, so a CO2 sensor graduated from 400 to 2000 and a humidity sensor graduated from 0 to 100 share the same needle speed.

### Smart plug

```yaml
type: custom:skeuo-switch-card
entity: switch.kitchen_plug
subtitle: Switched outlet
power_entity: sensor.kitchen_plug_power
energy_entity: sensor.kitchen_plug_energy
```

| Option | Default | Purpose |
|---|---|---|
| `power_entity` | empty | Instant power sensor to display |
| `energy_entity` | empty | Energy meter to display |

Both sensors are optional, and the card adapts to how many are declared: two screens, one, or a state screen when none is linked. Their unit is read from `unit_of_measurement`, so watts, kilowatts or amps are shown exactly as the entity publishes them. The sensors count in the render filter just like the plug, otherwise the power shown would stay frozen between two toggles.

Also works on `input_boolean`, `light` and `fan`, to drive on/off an appliance that has its own card elsewhere.

### Lock

```yaml
type: custom:skeuo-lock-card
entity: lock.front_door
subtitle: Smart lock
```

The large button locks and unlocks, the screen gives the state in green, amber or red depending on whether it is locked, open or jammed, and the line underneath recalls the time of the last change together with who did it when the integration reports it. The right-hand button drives the latch, and stays inert if `supported_features` does not declare that command.

A lock that announces a `code_format` expects a code on every operation: both buttons then open the entity dialog instead of calling a service that would fail.

### Fan

```yaml
type: custom:skeuo-fan-card
entity: fan.office
subtitle: Air circulation
```

The fader follows `percentage` and snaps to `percentage_step`, so a three-speed fan gives three notches rather than a percentage the appliance would round on its own. It disappears if the entity cannot set its speed, in which case the screen shows the state. The oscillation and direction buttons are disabled according to what `supported_features` declares.

When off, the fader fades to grey without locking: using it turns the appliance back on.

### Water heater

```yaml
type: custom:skeuo-water-heater-card
entity: water_heater.tank
subtitle: Heat pump tank
```

| Option | Default | Purpose |
|---|---|---|
| `modes` | entity modes | Force the list of mode buttons |

The fader bounds come from `min_temp` and `max_temp`, its step from `target_temp_step`. The screen shows the real tank temperature when the appliance publishes it, and the setpoint otherwise.

The right-hand column carries three modes at most, which is what the height allows: the first two heating modes declared by the entity, and off, which keeps its place whatever the length of `operation_list`. The `modes` option lets you pick others.

### Robot vacuum

```yaml
type: custom:skeuo-vacuum-card
entity: vacuum.living_room
subtitle: Cleaning robot
```

A single button starts and pauses, as on the appliance itself, which leaves room for the return to base without crowding the card with a third pushbutton. The screen gives the battery level while the robot still publishes it, and its state otherwise: recent integrations move the battery to a dedicated entity.

The screen turns blue while cleaning and returning, red on error.

### Alarm

```yaml
type: custom:skeuo-alarm-card
entity: alarm_control_panel.house
subtitle: Security system
```

The four modes are filtered on `supported_features`: a panel that does not know night arming does not show the matching button. Disarming is always offered. Green at rest, amber during arming and exit delays, red as soon as the system is armed or triggered.

As with the lock, a panel that declares a `code_format` sends you to the entity dialog, which presents the keypad.

### Weather

```yaml
type: custom:skeuo-weather-card
entity: weather.outside
subtitle: Local forecast
```

The icon covers the fifteen conditions of the `weather` domain and animates: clouds drift, drops fall, the sun turns, lightning flickers. Under `prefers-reduced-motion`, everything is frozen.

A sixteenth icon serves the night. Of the fifteen conditions, only one is nocturnal, `clear-night`: the others say nothing about the time, `rainy` is the same state at three in the morning as at noon. The only one that contains a sun and can happen after sunset is `partlycloudy`, which then takes a moon behind its cloud. The time of day is read from the `sun.sun` entity and not from the weather, exactly as Home Assistant does in its own card. Without that entity, the day icon is kept rather than guessed.

The temperature unit comes from `temperature_unit` on the entity and not from the unit system: a station that publishes in Fahrenheit keeps its scale, as the native weather card does.

### Forecast

```yaml
type: custom:skeuo-forecast-card
entity: weather.outside
subtitle: 5-day forecast
days: 5
```

| Option | Default | Purpose |
|---|---|---|
| `days` | `5` | Number of days shown, from 3 to 7 |

Since Home Assistant 2023.9, forecasts are no longer in an entity attribute: they go through a WebSocket subscription. The card subscribes to it, picks daily when the entity offers it and falls back to twice-daily then hourly otherwise. The subscription is dropped when the card leaves the screen and restored when it comes back, which matters on a dashboard with several views. Older integrations that still publish the `forecast` attribute are still read.

The column width is computed from the real width of the plane, which varies with the cell: a whole week fits in a standard cell by tightening the thumbnails and the temperatures, and spreads out in a wide section. If the station only returns three days while seven are requested, the card spreads over three.

Temperatures only show the degree sign, without the C or the F: two numbers per column across seven columns leave no room, and the full scale stays readable on the weather card.

The night variant does not apply to daily forecasts, which cover the whole day. On the twice-daily split it follows the `is_daytime` field of each item; on the hourly one it is derived from the next sunrise and sunset, taking the following days into account and not just the present moment. The `sun.sun` entity is only tracked in those two cases, so as not to redraw twice a day a card that the time does not concern.

### Media player

```yaml
type: custom:skeuo-media-card
entity: media_player.living_room
subtitle: MPD · Bluetooth
```

The record turns while playing and stops on pause right where it was, without restarting from zero. Its grooves are a radial gradient, so they stay crisp at any scale; the cover art is the image the entity publishes on `entity_picture`, and the amber label takes its place when there is none.

The title shown walks down `media_title`, then `media_series_title`, `app_name` and `source` until it finds something: integrations do not fill in the same fields, and a radio station often only has the first.

The fifteen-segment ladder follows the volume. The colour of a segment comes from its position and never from the current value, as on a real appliance where the top diode is red whether it is lit or not.

Each transport button is disabled according to what `supported_features` declares, and the fader disappears if the player cannot set its volume.

### Camera

```yaml
type: custom:skeuo-camera-card
entity: camera.front_door
subtitle: Video surveillance
refresh: 10
```

| Option | Default | Purpose |
|---|---|---|
| `refresh` | `10` | Seconds between two frames. `0` freezes the preview |
| `record_filename` | empty | Path passed to the `camera.record` service |
| `record_duration` | `30` | Recording length, in seconds |

**This is not a video stream.** The live feed goes through HLS or WebRTC, which the frontend handles with its own elements and which nothing lets an external card drive properly. The card shows the snapshot Home Assistant already publishes on `entity_picture`, requested again at the configured interval, and tapping the monitor opens the entity dialog, where the real stream plays. The badge tells you which of the two regimes is running, Live or Frozen.

Nothing is requested from the camera in the picker thumbnail or in the editor preview: the card is instantiated several times in a row there, and as many timers would hammer the camera for nothing. The timer also stops as soon as the card leaves the screen.

The Motion button calls `camera.enable_motion_detection` and its opposite, and stays inert on a camera that does not publish the `motion_detection` attribute. The Record button calls `camera.record`, which requires a destination path: without `record_filename` it stays inert too, having nowhere to write.

## States

![State comparison](docs/etats.png)

An appliance that is off turns to greyscale, fascia included: screens, indicators and colour bands desaturate, but nothing becomes translucent. A transparent card would let the dashboard background show through its own controls, which breaks the sense of material; a grey fascia is still a fascia.

An unreachable appliance gets the same desaturation plus a darkening, which pushes it behind the active cards and tells it apart from a simple off state. Here too it is a drop in brightness, not a translucent veil.

States that are not an off state are not greyed out: a closed cover or a sensor at its lowest are normal operating states.

## Common options

| Option | Default | Purpose |
|---|---|---|
| `entity` | required | Driven entity |
| `name` | `friendly_name` | Module title |
| `subtitle` | empty | Line under the title |
| `material` | `carbon` | `carbon`, `graphite` or `brushed` |
| `accent` | `#e2a659` | Colour of the screens and the arcs |
| `screws` | `true` | Corner screws |
| `texture` | `60` | Grain density of the material, from 0 to 150 % |
| `tap_action` | `more-info` | Action on the title bar |
| `hold_action` | `more-info` | Long press |
| `double_tap_action` | `more-info` | Double tap |

### Grain density

`texture` sets the fineness of the material, **from 0 to 150 % in steps of 10**. The default is **60 %**: a 6 px tow, enough for the checkerboard crossing to read without the weave taking over from the controls it carries. At 0 the pattern disappears completely and only the background colour is left, which is a valid look in itself.

Carbon is a plain weave: the weft crosses the card in continuous strands, the warp tows pass over it, and each tow carries the striations of its filaments. A clear coat on a separate layer sweeps the surface once, never repeated with the tile. The setting resizes the tile, from 2 to 30 px. At 100 % the tow is about 2 mm on a tablet panel, which is a 3K weave, the most common in real carbon.

| Range | Result |
|---|---|
| 0 % | bare background colour |
| 10 % | the tile averages out, the card lightens noticeably |
| 20 to 50 % | fine grain, the crossing no longer reads |
| 60 to 150 % | readable crossing, the material reads as carbon; **60 % is the default** |

On brushed metal, the setting tightens or widens the period of the scratches, from 0.3 to 4.5 px. Below 50 % the period approaches the pixel and produces a marked diagonal moiré, still noticeable up to around 70 %. The clean range starts around 80 %.

These degraded values stay available on purpose: it is a display choice, not a mistake to prevent.

Graphite has no grain, it is a single gradient spread over the card: the setting has no effect on it.

To apply the same density to every card at once rather than card by card, the CSS variable is enough:

```yaml
card_mod:
  style: |
    :host { --skeuo-texture: 1.5; }
```

## Actions

Actions accept the usual Home Assistant vocabulary: `more-info`, `toggle`, `navigate`, `url`, `perform-action`, `assist`, `fire-dom-event`, `none`, with `confirmation`.

## Customisation

The pack exposes CSS variables, redefinable through a theme or through `card-mod`:

```yaml
card_mod:
  style: |
    :host {
      --skeuo-accent: #6bdcff;
      --skeuo-font-display: "Oswald", sans-serif;
      --skeuo-font-lcd: "JetBrains Mono", monospace;
    }
```

No font is embedded in the bundle: that would be some thirty kB of WOFF2, or a network request to Google Fonts. The pack relies on a condensed stack available everywhere. The original rendering uses Oswald and JetBrains Mono; to get it back exactly, install those fonts and point the two variables above at them.

## Grid placement

Each card announces `getGridOptions()` with 12 columns and a row count computed from its ratio, which makes it land right in a section of standard width. The row count stays adjustable with the resize handle, or in YAML:

```yaml
grid_options:
  columns: 6
  rows: 3
```

In a cell too narrow for the nominal width, the scale factor switches to the width: an empty band remains at the top and bottom, but nothing is cropped.

## Known limits

- The camera card shows a refreshed snapshot, not a continuous stream. See the section devoted to it.
- Locks and alarm panels that require a code cannot be driven from the card: the button opens the entity dialog, which knows how to present the keypad. Putting the code in the dashboard configuration would mean writing it in clear text in a YAML file that gets backed up and synchronised.
- The pack imposes its own skin and does not follow the colours of the active theme, by design. It does respect `--ha-card-border-radius` and `prefers-reduced-motion`.
- The design is meant for a wall tablet and a desktop dashboard. Below roughly 300 px wide, the content stays readable but becomes small.

## Development

```bash
npm install
npm run build
```

```bash
npm run watch
```

`npm run serve` serves the bundle on port 4000 with CORS open: declare `http://<ip>:4000/skeuo-cards.js` as a resource on a test Home Assistant instance.

`dev/index.html` is a standalone test bench, with a simulated `hass`, both section widths, and deliberately broken entities (unavailable, not found, no dimmer) to check the degraded renderings. It serves the bundle from `dist/`, so run `npm run build` first.

## Disclaimer

This project is shared freely, put together on my own time. I'm not responsible for any problems its use might cause, hardware, software or otherwise. You use, install and adapt it entirely at your own risk. The files are free to use, share and modify. If you reuse or build on this work, a credit back to me is appreciated, but nothing here is provided with any guarantee.

## Support this project

If this pack has been useful to you, you can support its development:

- [GitHub Sponsors](https://github.com/sponsors/dcybeldesign)
- [Buy Me a Coffee](https://buymeacoffee.com/dcybeldesign)

## Author

[dcybeldesign](https://github.com/dcybeldesign)

## License

[MIT](LICENSE)

The code is under MIT. The **Skeuo Cards** name is not part of that grant: fork it, rebuild it, ship it, but under your own name.
