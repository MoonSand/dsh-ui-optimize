# dsh-ui-optimize

English | [中文](README.zh.md)

Three independent features for the DeepSeek Harness web interface, each with its own switch: a **theme gallery** of eight minimalist themes (each defining one palette for light and one for dark), the **desktop Reload/Restart buttons** at the sidebar foot, and **sidebar panel folding** — the panel rows collapse into a single **Panels** entry that opens a two-column launcher.

Colours travel only through `ctx.theme.overrideTokens`, as a single layer of theme variables. No structural CSS is injected and no other plugin's DOM is read, so an upstream redesign can at worst make the colours inert — it cannot break the layout.

## Install

Install `@moonsand/dsh-ui-optimize` from the GUI plugin manager. Requires `engines.dsh >= 0.2.1-rc.3`.

## Use

Open **Settings → UI Optimize**.

### Themes

Celadon, Linen, Cream, Graphite, Indigo, Slate, Sage, Rose. Picking a card recolours the whole interface; **Default** restores the stock look. Every theme defines one palette for light and one for dark — switching Appearance between them carries the theme along, so there is no separate version to pick.

### Desktop actions

Two switches control the sidebar-foot buttons:

- **Reload UI** — reloads the page and client plugins only; the Host and running tasks keep going
- **Restart app** — restarts the whole app including its Host; interrupts the current conversation. **Desktop app only** — in a browser it degrades to reloading the page

### Sidebar

A switch folds the panel rows in the left rail into a single **Panels** entry. Clicking it opens a two-column launcher with the panel icons, a title and count, a search box once there are more than seven panels, and keyboard control (↑ ↓ to move, Enter to open, Esc to close). Panels that register later — including ones added by other plugins — are picked up on the next open, so nothing silently disappears from the list.

The entry calls the shell's own panel-selection API instead of synthesising clicks. A watchdog measures the folded row after mount and on every resize: if it cannot be measured, the switch turns itself off and the native sidebar comes back rather than leaving an empty rail.

The **More** row keeps its own line. Folding it in was tried and dropped: the shell's overflow menu only opens from a trusted click, which a plugin cannot produce, and the synthetic pointer events that came close also closed the launcher through the shell's click-outside handler.

## Relationship to dsh-desktop-restart

The desktop actions are ported from [`@moonsand/dsh-desktop-restart`](https://github.com/MoonSand/dsh-desktop-restart) and use their own route prefix, `/ui-optimize/desktop`.

Both plugins can be installed at the same time without crashing, but you would get two sets of buttons. When the old plugin is detected, a notice appears at the top of the settings page suggesting you uninstall it.

## Known limitations

- The theme choice lives in browser `localStorage`; it is lost with the browser profile or site data
- Restart works only in the desktop app; a browser session can only reload
- Restart logs still go to `%TEMP%\dsh-desktop-restart.log`, inherited from the ported source
- The restart action is a process-level operation that cannot be verified automatically
- The **More** row is not folded; it stays in the native rail
- The launcher keeps the shell's own panel order — it does not sort, pin or reorder
- Sidebar folding and `dsh-sidebar-shelf` rewrite the same rail; enable one of them, not both

## Development

```
node scripts/smoke.mjs
```

The smoke test covers the assembly contract only: the three runtime files parse, the theme table is complete (8 themes × 10 tokens × 2 schemes), and the published identity plus `engines.dsh` are intact. It does **not** check whether the palettes look right or whether restart actually restarts.

## License

MIT
