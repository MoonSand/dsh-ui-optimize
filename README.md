# dsh-ui-optimize

English | [中文](README.zh.md)

Two independent features for the DeepSeek Harness web interface: a **theme gallery** of eight minimalist themes (each defining one palette for light and one for dark), and the **desktop Reload/Restart buttons** at the sidebar foot — every feature has its own switch.

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

## Relationship to dsh-desktop-restart

The desktop actions are ported from [`@moonsand/dsh-desktop-restart`](https://github.com/MoonSand/dsh-desktop-restart) and use their own route prefix, `/ui-optimize/desktop`.

Both plugins can be installed at the same time without crashing, but you would get two sets of buttons. When the old plugin is detected, a notice appears at the top of the settings page suggesting you uninstall it.

## Known limitations

- The theme choice lives in browser `localStorage`; it is lost with the browser profile or site data
- Restart works only in the desktop app; a browser session can only reload
- Restart logs still go to `%TEMP%\dsh-desktop-restart.log`, inherited from the ported source
- The restart action is a process-level operation that cannot be verified automatically

## Development

```
node scripts/smoke.mjs
```

The smoke test covers the assembly contract only: the three runtime files parse, the theme table is complete (8 themes × 10 tokens × 2 schemes), and the published identity plus `engines.dsh` are intact. It does **not** check whether the palettes look right or whether restart actually restarts.

## License

MIT
