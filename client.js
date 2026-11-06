/**
 * Browser half of @moonsand/dsh-ui-optimize.
 *
 * Model: a small gallery of minimalist themes. Picking a theme stacks ONE
 * `theme.overrideTokens()` layer carrying that theme's complete palette, so
 * switching themes replaces the layer wholesale and picking "Default" removes
 * exactly one layer to restore the untouched look.
 *
 * Every theme defines one palette for light and one for dark, and the token layer
 * supplies both, so a theme follows the light/dark preference by itself.
 *
 * Nothing here reads another plugin's DOM, stylesheet, or component source:
 * colours travel exclusively through the theme token layer.
 */
window.__ModuleLoader__.load({
  id: '@moonsand/dsh-ui-optimize',
  factory(require) {
    'use strict'

    const React = require('react')
    const h = React.createElement

    const NS = 'dsh-ui-optimize'
    const STORAGE_KEY = 'dsh-ui-optimize:v2'
    const LAYER_SOURCE = 'dsh-ui-optimize:theme'
    /* Shared with the settings page so it can report why the theme is not applied. */
    const surface = { controller: null }
    const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

    /* ------------------------------------------------------------------ *
     * Text
     * ------------------------------------------------------------------ */

    const DICT = {
      en: {
        title: 'UI Optimize',
        subtitle:
          'Pick one theme and the whole interface follows. Each theme defines one palette for light and one for dark; switching Appearance between them carries the theme along — no separate version to pick.',
        defaultName: 'Default',
        defaultHint: 'Keep the current look',
        'section.theme': 'Theme',
        'theme.teal': 'Celadon',
        'theme.teal.hint': 'Cool celadon — quiet and restrained',
        'theme.brown': 'Linen',
        'theme.brown.hint': 'Warm brown — like unbleached cloth',
        'theme.yellow': 'Cream',
        'theme.yellow.hint': 'Pale yellow — soft and easy on the eyes',
        'theme.graphite': 'Graphite',
        'theme.graphite.hint': 'Near-monochrome neutrals — quiet, Linear-like calm',
        'theme.indigo': 'Indigo',
        'theme.indigo.hint': 'Cool indigo accent on a near-white canvas',
        'theme.slate': 'Slate',
        'theme.slate.hint': 'Blue-grey neutrals — the modern dashboard default',
        'theme.sage': 'Sage',
        'theme.sage.hint': 'Muted green — a calmer neighbour of Celadon',
        'theme.rose': 'Rose',
        'theme.rose.hint': 'Dusty rose — warm without being loud',
        applyFailed: 'The theme is not reaching the interface.',
        'section.desktop': 'Desktop actions',
        'desktop.label': 'Restart app',
        'desktop.hint': 'Restart DeepSeek Harness (app and Host)',
        'desktop.refresh': 'Reload UI',
        'desktop.refreshHint': 'Reloads the interface and client plugins only; the Host keeps running',
        'desktop.refreshBlocked': 'Restarting — hold on…',
        'desktop.reloading': 'Reloading…',
        'desktop.confirm': 'Restart now?',
        'desktop.confirmBusy': 'Restart now? Tasks are running',
        'desktop.restarting': 'Restarting…',
        'desktop.failed': 'Restart failed',
        'desktop.stillAlive': 'The app did not restart — restart it manually, or click again',
        'desktop.notDesktop': 'Not the desktop app — reloading the page instead',
        'desktop.unreachable': 'The Host did not answer — reloading the page instead',
        'desktop.installing': 'Installing…',
        'desktop.reloadSwitch': 'Show the Reload UI button',
        'desktop.reloadSwitchHint': 'Sidebar foot. Reloads the page and client plugins; the Host and running tasks keep going',
        'desktop.restartSwitch': 'Show the Restart app button',
        'desktop.restartSwitchHint': 'Sidebar foot. Restarts the whole app including its Host; the current conversation is interrupted. Desktop app only',
        'desktop.restartNotDesktop': 'This is a browser session, so restart is unavailable — clicking it would only reload the page. The feature works only inside the desktop app.',
        'legacy.title': '@moonsand/dsh-desktop-restart is still installed',
        'legacy.body': 'Both plugins draw reload/restart buttons, so the sidebar foot will show two sets. Uninstall dsh-desktop-restart under Settings → Plugins and keep only this one.',
        storageNote: 'Storage unavailable — the choice lasts until this page reloads.',
      },
      zh: {
        title: '界面优化',
        subtitle:
          '选一个主题，整个界面跟着换。每套主题为浅色与深色各定义一组配色，切换「外观」时自动跟随，不需要为两种模式各选一次。',
        defaultName: '默认',
        defaultHint: '保持当前外观',
        'section.theme': '主题',
        'theme.teal': '青瓷',
        'theme.teal.hint': '冷调青绿，克制安静',
        'theme.brown': '亚麻',
        'theme.brown.hint': '暖调棕褐，像未漂白的布',
        'theme.yellow': '奶油',
        'theme.yellow.hint': '淡黄暖白，柔和护眼',
        'theme.graphite': '石墨',
        'theme.graphite.hint': '近单色中性，冷静克制',
        'theme.indigo': '靛蓝',
        'theme.indigo.hint': '近白画布配冷靛强调',
        'theme.slate': '雾蓝',
        'theme.slate.hint': '蓝灰中性，现代后台的默认脸',
        'theme.sage': '苔绿',
        'theme.sage.hint': '低饱和绿，比青瓷更松弛',
        'theme.rose': '玫瑰',
        'theme.rose.hint': '灰调玫瑰，暖而不吵',
        applyFailed: '主题未作用到界面。',
        'section.desktop': '桌面操作',
        'desktop.label': '重启应用',
        'desktop.hint': '重启 DeepSeek Harness（应用与 Host）',
        'desktop.refresh': '刷新界面',
        'desktop.refreshHint': '只重新加载界面与客户端插件，Host 继续运行，任务不中断',
        'desktop.refreshBlocked': '正在重启，稍等…',
        'desktop.reloading': '刷新中…',
        'desktop.confirm': '确认重启？',
        'desktop.confirmBusy': '确认重启？有任务在跑',
        'desktop.restarting': '重启中…',
        'desktop.failed': '重启失败',
        'desktop.stillAlive': '应用没有重启，请手动重启，或再点一次',
        'desktop.notDesktop': '当前不是桌面端，改为刷新界面',
        'desktop.unreachable': '联系不到 Host，改为刷新界面',
        'desktop.installing': '安装插件中',
        'desktop.reloadSwitch': '显示「刷新界面」按钮',
        'desktop.reloadSwitchHint': '侧栏底部。重载页面与客户端插件，Host 与正在跑的任务都不受影响',
        'desktop.restartSwitch': '显示「重启应用」按钮',
        'desktop.restartSwitchHint': '侧栏底部。重启整个应用（含 Host），当前对话会中断；仅桌面端可用',
        'desktop.restartNotDesktop': '当前是网页端，重启不可用——点了只会刷新页面。此功能仅在桌面应用里有效。',
        'legacy.title': '检测到 @moonsand/dsh-desktop-restart 仍在安装',
        'legacy.body': '两个插件都会提供刷新/重启按钮，侧栏底部会出现两套。请到「设置 → 插件」卸载 dsh-desktop-restart，只保留本插件。',
        storageNote: '浏览器存储不可用——选择的主题只在本次页面加载内有效。',
      },
    }

    function detectLanguage() {
      try {
        const langs = typeof navigator !== 'undefined' && navigator.languages
        const first =
          (langs && langs.length > 0 ? langs[0] : '') ||
          (typeof navigator !== 'undefined' ? navigator.language : '') ||
          ''
        return String(first).toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en'
      } catch (err) {
        return 'en'
      }
    }

    let translate = function (key) {
      const table = DICT[detectLanguage()] || DICT.en
      return table[key] || DICT.en[key] || key
    }

    /* ------------------------------------------------------------------ *
     * Themes
     *
     * One theme is one decision. Every alias token the interface colours itself
     * with lives here per scheme, so the user picks a mood instead of tuning
     * twenty colour values.
     * ------------------------------------------------------------------ */

    const THEMES = [
      {
        key: 'teal',
        light: {
          '--dsw-alias-bg-base': '#E6F0F0',
          '--dsw-alias-bg-layer-1': '#F8FCFC',
          '--dsw-alias-bg-layer-2': '#DCE8E8',
          '--dsw-alias-bg-overlay': '#F8FCFC',
          '--dsw-specific-sidebar-fill': '#E2EEEE',
          '--dsw-alias-border-l1': '#C9DBDB',
          '--dsw-alias-border-l2': '#AFC7C7',
          '--dsw-alias-brand-primary': '#0B7F7F',
          '--dsw-alias-label-primary': '#12333A',
          '--dsw-alias-label-secondary': '#4E6A6E',
        },
        dark: {
          '--dsw-alias-bg-base': '#0F1719',
          '--dsw-alias-bg-layer-1': '#162124',
          '--dsw-alias-bg-layer-2': '#1D2A2E',
          '--dsw-alias-bg-overlay': '#1F2D31',
          '--dsw-specific-sidebar-fill': '#121B1D',
          '--dsw-alias-border-l1': '#24363B',
          '--dsw-alias-border-l2': '#30474D',
          '--dsw-alias-brand-primary': '#3FBFBF',
          '--dsw-alias-label-primary': '#E3EDEE',
          '--dsw-alias-label-secondary': '#93A9AC',
        },
      },
      {
        key: 'brown',
        light: {
          '--dsw-alias-bg-base': '#FAF7F3',
          '--dsw-alias-bg-layer-1': '#FFFFFF',
          '--dsw-alias-bg-layer-2': '#F3EDE6',
          '--dsw-alias-bg-overlay': '#FFFFFF',
          '--dsw-specific-sidebar-fill': '#F5EFE8',
          '--dsw-alias-border-l1': '#E7DDD1',
          '--dsw-alias-border-l2': '#D5C6B4',
          '--dsw-alias-brand-primary': '#8A5F3C',
          '--dsw-alias-label-primary': '#2E241C',
          '--dsw-alias-label-secondary': '#6E5B4A',
        },
        dark: {
          '--dsw-alias-bg-base': '#17120F',
          '--dsw-alias-bg-layer-1': '#201A16',
          '--dsw-alias-bg-layer-2': '#2A221C',
          '--dsw-alias-bg-overlay': '#2E251F',
          '--dsw-specific-sidebar-fill': '#1B1512',
          '--dsw-alias-border-l1': '#382C24',
          '--dsw-alias-border-l2': '#4A3A2F',
          '--dsw-alias-brand-primary': '#C79A6B',
          '--dsw-alias-label-primary': '#EFE6DD',
          '--dsw-alias-label-secondary': '#AD9B8B',
        },
      },
      {
        key: 'yellow',
        light: {
          '--dsw-alias-bg-base': '#FDFBF3',
          '--dsw-alias-bg-layer-1': '#FFFFFF',
          '--dsw-alias-bg-layer-2': '#F7F1E0',
          '--dsw-alias-bg-overlay': '#FFFFFF',
          '--dsw-specific-sidebar-fill': '#F9F5E8',
          '--dsw-alias-border-l1': '#EDE5CF',
          '--dsw-alias-border-l2': '#DED2B4',
          '--dsw-alias-brand-primary': '#9C7C16',
          '--dsw-alias-label-primary': '#2F2A1C',
          '--dsw-alias-label-secondary': '#6B6248',
        },
        dark: {
          '--dsw-alias-bg-base': '#16140F',
          '--dsw-alias-bg-layer-1': '#1F1C15',
          '--dsw-alias-bg-layer-2': '#282419',
          '--dsw-alias-bg-overlay': '#2C2718',
          '--dsw-specific-sidebar-fill': '#1A1711',
          '--dsw-alias-border-l1': '#352F22',
          '--dsw-alias-border-l2': '#47402D',
          '--dsw-alias-brand-primary': '#D9BC63',
          '--dsw-alias-label-primary': '#F0EADA',
          '--dsw-alias-label-secondary': '#ADA48C',
        },
      },
      {
        key: 'graphite',
        light: {
          '--dsw-alias-bg-base': '#EDEDEF',
          '--dsw-alias-bg-layer-1': '#F7F7F8',
          '--dsw-alias-bg-layer-2': '#E2E2E5',
          '--dsw-alias-bg-overlay': '#F7F7F8',
          '--dsw-specific-sidebar-fill': '#E9E9EC',
          '--dsw-alias-border-l1': '#D2D2D6',
          '--dsw-alias-border-l2': '#BABAC0',
          '--dsw-alias-brand-primary': '#2E3238',
          '--dsw-alias-label-primary': '#141417',
          '--dsw-alias-label-secondary': '#5A5A62',
        },
        dark: {
          '--dsw-alias-bg-base': '#131316',
          '--dsw-alias-bg-layer-1': '#1A1A1E',
          '--dsw-alias-bg-layer-2': '#222227',
          '--dsw-alias-bg-overlay': '#242429',
          '--dsw-specific-sidebar-fill': '#17171A',
          '--dsw-alias-border-l1': '#2C2C32',
          '--dsw-alias-border-l2': '#3D3D45',
          '--dsw-alias-brand-primary': '#B4B8C1',
          '--dsw-alias-label-primary': '#EDEDF0',
          '--dsw-alias-label-secondary': '#9B9BA4',
        },
      },
      {
        key: 'indigo',
        light: {
          '--dsw-alias-bg-base': '#E9EDF8',
          '--dsw-alias-bg-layer-1': '#F8FAFD',
          '--dsw-alias-bg-layer-2': '#DEE5F4',
          '--dsw-alias-bg-overlay': '#F8FAFD',
          '--dsw-specific-sidebar-fill': '#E4EAF7',
          '--dsw-alias-border-l1': '#CBD5EC',
          '--dsw-alias-border-l2': '#B0BFE0',
          '--dsw-alias-brand-primary': '#4338CA',
          '--dsw-alias-label-primary': '#161A24',
          '--dsw-alias-label-secondary': '#4A5266',
        },
        dark: {
          '--dsw-alias-bg-base': '#0E1017',
          '--dsw-alias-bg-layer-1': '#151824',
          '--dsw-alias-bg-layer-2': '#1C2030',
          '--dsw-alias-bg-overlay': '#1F2436',
          '--dsw-specific-sidebar-fill': '#11141C',
          '--dsw-alias-border-l1': '#242A3C',
          '--dsw-alias-border-l2': '#333A52',
          '--dsw-alias-brand-primary': '#8A8CF7',
          '--dsw-alias-label-primary': '#E7E9F5',
          '--dsw-alias-label-secondary': '#9BA3B8',
        },
      },
      {
        key: 'slate',
        light: {
          '--dsw-alias-bg-base': '#E8EFF7',
          '--dsw-alias-bg-layer-1': '#F8FAFD',
          '--dsw-alias-bg-layer-2': '#DDE7F3',
          '--dsw-alias-bg-overlay': '#F8FAFD',
          '--dsw-specific-sidebar-fill': '#E3ECF6',
          '--dsw-alias-border-l1': '#C9D8E9',
          '--dsw-alias-border-l2': '#AEC4DC',
          '--dsw-alias-brand-primary': '#1D4ED8',
          '--dsw-alias-label-primary': '#16202E',
          '--dsw-alias-label-secondary': '#4D5F73',
        },
        dark: {
          '--dsw-alias-bg-base': '#0E1626',
          '--dsw-alias-bg-layer-1': '#16202F',
          '--dsw-alias-bg-layer-2': '#1D2838',
          '--dsw-alias-bg-overlay': '#212D3F',
          '--dsw-specific-sidebar-fill': '#101A29',
          '--dsw-alias-border-l1': '#273549',
          '--dsw-alias-border-l2': '#364A63',
          '--dsw-alias-brand-primary': '#5B9DF9',
          '--dsw-alias-label-primary': '#E2E8F0',
          '--dsw-alias-label-secondary': '#94A3B8',
        },
      },
      {
        key: 'sage',
        light: {
          '--dsw-alias-bg-base': '#EAF0E3',
          '--dsw-alias-bg-layer-1': '#F8FBF4',
          '--dsw-alias-bg-layer-2': '#DFE8D6',
          '--dsw-alias-bg-overlay': '#F8FBF4',
          '--dsw-specific-sidebar-fill': '#E5EDDD',
          '--dsw-alias-border-l1': '#CBD8BE',
          '--dsw-alias-border-l2': '#B2C3A3',
          '--dsw-alias-brand-primary': '#3F6B43',
          '--dsw-alias-label-primary': '#1B2318',
          '--dsw-alias-label-secondary': '#4F5C48',
        },
        dark: {
          '--dsw-alias-bg-base': '#12160F',
          '--dsw-alias-bg-layer-1': '#1A2016',
          '--dsw-alias-bg-layer-2': '#222A1C',
          '--dsw-alias-bg-overlay': '#262F20',
          '--dsw-specific-sidebar-fill': '#151A11',
          '--dsw-alias-border-l1': '#2C3626',
          '--dsw-alias-border-l2': '#3C4A33',
          '--dsw-alias-brand-primary': '#8FB57E',
          '--dsw-alias-label-primary': '#E6EBDF',
          '--dsw-alias-label-secondary': '#A3AE99',
        },
      },
      {
        key: 'rose',
        light: {
          '--dsw-alias-bg-base': '#F7E9EC',
          '--dsw-alias-bg-layer-1': '#FDF8F9',
          '--dsw-alias-bg-layer-2': '#F1DFE3',
          '--dsw-alias-bg-overlay': '#FDF8F9',
          '--dsw-specific-sidebar-fill': '#F4E3E7',
          '--dsw-alias-border-l1': '#E2C8CE',
          '--dsw-alias-border-l2': '#CFAEB6',
          '--dsw-alias-brand-primary': '#A02E56',
          '--dsw-alias-label-primary': '#2A1D21',
          '--dsw-alias-label-secondary': '#624E55',
        },
        dark: {
          '--dsw-alias-bg-base': '#171014',
          '--dsw-alias-bg-layer-1': '#20161B',
          '--dsw-alias-bg-layer-2': '#2A1D23',
          '--dsw-alias-bg-overlay': '#2E2028',
          '--dsw-specific-sidebar-fill': '#1A1216',
          '--dsw-alias-border-l1': '#382730',
          '--dsw-alias-border-l2': '#4A3440',
          '--dsw-alias-brand-primary': '#E58AA8',
          '--dsw-alias-label-primary': '#F1E6EA',
          '--dsw-alias-label-secondary': '#B09AA3',
        },
      },
    ]

    const THEME_BY_KEY = {}
    for (let i = 0; i < THEMES.length; i += 1) THEME_BY_KEY[THEMES[i].key] = THEMES[i]

    /* ------------------------------------------------------------------ *
     * State
     * ------------------------------------------------------------------ */

    function defaultState() {
      return { version: 3, theme: null, reload: true, restart: true }
    }

    function normalize(stored) {
      const out = defaultState()
      if (!stored || typeof stored !== 'object') return out
      if (typeof stored.theme === 'string' && THEME_BY_KEY[stored.theme]) {
        out.theme = stored.theme
      }
      if (typeof stored.reload === 'boolean') out.reload = stored.reload
      if (typeof stored.restart === 'boolean') out.restart = stored.restart
      return out
    }

    function readStored() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
      } catch (err) {
        return null
      }
    }

    let storageBroken = false

    function writeStored(state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        storageBroken = false
      } catch (err) {
        storageBroken = true
      }
    }

    function publish(next) {
      store.state = next
      writeStored(next)
      const snapshot = Array.from(store.listeners)
      for (let i = 0; i < snapshot.length; i += 1) {
        try {
          snapshot[i]()
        } catch (err) {
          /* a broken subscriber must not block the others */
        }
      }
    }

    const store = {
      state: normalize(readStored()),
      listeners: new Set(),
      subscribe(listener) {
        store.listeners.add(listener)
        return function () {
          store.listeners.delete(listener)
        }
      },
      setTheme(key) {
        publish(
          Object.assign({}, store.state, {
            version: 3,
            theme: THEME_BY_KEY[key] ? key : null,
          }),
        )
      },
      setFlag(name, value) {
        const next = Object.assign({}, store.state, { version: 3 })
        next[name] = value === true
        publish(next)
      },
    }

    /* ------------------------------------------------------------------ *
     * Layer
     * ------------------------------------------------------------------ */

    function themeLayer(state) {
      const theme = state.theme ? THEME_BY_KEY[state.theme] : null
      if (!theme) return null
      const tokens = {}
      let count = 0
      const names = Object.keys(theme.light)
      for (let i = 0; i < names.length; i += 1) {
        const name = names[i]
        const light = theme.light[name]
        const dark = theme.dark[name]
        if (!HEX_PATTERN.test(light) || !HEX_PATTERN.test(dark)) continue
        tokens[name] = { light: light, dark: dark }
        count += 1
      }
      return count > 0 ? tokens : null
    }

    function createController(resolveTheme) {
      let disposeLayer = null
      let lastError = null

      function release() {
        const dispose = disposeLayer
        disposeLayer = null
        if (typeof dispose !== 'function') return
        try {
          dispose()
        } catch (err) {
          /* the layer may already be covered by a newer override */
        }
      }

      return {
        active() {
          return disposeLayer !== null
        },
        error() {
          return lastError
        },
        /** Returns true once the wanted state is settled, false while retrying. */
        sync(state) {
          const theme = typeof resolveTheme === 'function' ? resolveTheme() : resolveTheme
          if (!theme || typeof theme.overrideTokens !== 'function') {
            // The theme service is not reachable yet; the caller retries.
            return false
          }
          const tokens = themeLayer(state)
          if (!tokens) {
            release()
            lastError = null
            return true
          }
          const previous = disposeLayer
          let dispose
          try {
            dispose = theme.overrideTokens(LAYER_SOURCE, tokens)
          } catch (err) {
            lastError = err && err.message ? String(err.message) : String(err)
            return false
          }
          if (typeof dispose !== 'function') {
            lastError = 'overrideTokens returned no disposer'
            return false
          }
          disposeLayer = dispose
          lastError = null
          // Re-overriding the same source already replaced the older layer.
          if (previous && previous !== dispose) {
            try {
              previous()
            } catch (err) {
              /* already replaced */
            }
          }
          return true
        },
        dispose() {
          release()
        },
      }
    }

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */

    const STYLES = `
.dsuik-page{display:flex;flex-direction:column;gap:16px;padding:2px 0 28px;font-size:14px;color:var(--dsw-alias-label-primary);}
.dsuik-header{display:flex;flex-direction:column;gap:6px;}
.dsuik-title{font-size:16px;font-weight:600;line-height:1.4;}
.dsuik-sub{margin:0;font-size:13px;line-height:1.65;color:var(--dsw-alias-label-secondary);}
.dsuik-section{display:flex;flex-direction:column;gap:10px;}
.dsuik-sectiontitle{margin:0;font-size:12.5px;font-weight:600;letter-spacing:.03em;color:var(--dsw-alias-label-secondary);}
.dsuik-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:10px;}
.dsuik-tile{display:flex;flex-direction:column;padding:0;overflow:hidden;text-align:left;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;cursor:pointer;transition:border-color .16s ease;}
.dsuik-tile:hover{border-color:var(--dsw-alias-border-l2);}
.dsuik-tile:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}
.dsuik-tile.is-active{border-color:var(--dsw-alias-brand-primary);}
.dsuik-mc{display:flex;}
.dsuik-mc > i{display:block;flex:1 1 auto;min-width:0;}
body[data-ds-dark-theme] .dsuik-mc > .dsuik-mc-a{display:none;}
body:not([data-ds-dark-theme]) .dsuik-mc > .dsuik-mc-b{display:none;}
.dsuik-bar{height:14px;flex:none;}
.dsuik-dot{flex:none;width:8px;height:8px;border-radius:2px;}
.dsuik-tilebody{display:flex;flex-direction:column;gap:2px;padding:7px 10px 9px;}
.dsuik-tilename{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;line-height:1.4;}
.dsuik-tilehint{font-size:11px;line-height:1.45;color:var(--dsw-alias-label-secondary);}
.dsuik-check{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary);}
.dsuik-warn{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary);}
.dsuik-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);}
.dsuik-rowtext{display:flex;flex-direction:column;gap:2px;min-width:0;}
.dsuik-rowname{font-size:13px;font-weight:600;line-height:1.4;}
.dsuik-rowhint{font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
.dsuik-switch{position:relative;flex:none;width:38px;height:22px;padding:0;border:none;border-radius:999px;background:var(--dsw-alias-state-idle-primary);cursor:pointer;transition:background .16s ease;}
.dsuik-switch.is-on{background:var(--dsw-alias-brand-primary);}
.dsuik-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}
.dsuik-knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-bg-base);transition:transform .16s ease;}
.dsuik-switch.is-on .dsuik-knob{transform:translateX(16px);}
.dsuik-switch.is-disabled{opacity:.45;cursor:not-allowed;}
.dsuik-rowhint.is-warn{color:var(--dsw-alias-state-warn-primary);}
.dsuik-alert{display:flex;flex-direction:column;gap:3px;padding:10px 12px;border:1px solid var(--dsw-alias-state-warn-primary);border-radius:10px;}
.dsuik-alert-title{font-size:12.5px;font-weight:600;line-height:1.4;color:var(--dsw-alias-state-warn-primary);}
.dsuik-alert-body{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
`

    /* ------------------------------------------------------------------ *
     * View
     * ------------------------------------------------------------------ */

    /* One colour strip, but correct in both modes: both values are rendered and
     * CSS shows the one matching the active scheme, so no JS has to guess. */
    function ModeColor(props) {
      return h(
        'span',
        { className: 'dsuik-mc ' + (props.className || '') },
        h('i', { className: 'dsuik-mc-a', style: { background: props.light } }),
        h('i', { className: 'dsuik-mc-b', style: { background: props.dark } }),
      )
    }

    function Switch(props) {
      const disabled = props.disabled === true
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.checked ? 'true' : 'false',
          'aria-label': props.label,
          disabled: disabled,
          className:
            'dsuik-switch' + (props.checked ? ' is-on' : '') + (disabled ? ' is-disabled' : ''),
          onClick: function () {
            if (disabled) return
            props.onChange(!props.checked)
          },
        },
        h('span', { className: 'dsuik-knob', 'aria-hidden': 'true' }),
      )
    }

    function ThemeTile(props) {
      return h(
        'button',
        {
          type: 'button',
          className: 'dsuik-tile' + (props.active ? ' is-active' : ''),
          'aria-pressed': props.active ? 'true' : 'false',
          onClick: props.onPick,
        },
        h(ModeColor, { className: 'dsuik-bar', light: props.barLight, dark: props.barDark }),
        h(
          'div',
          { className: 'dsuik-tilebody' },
          h(
            'span',
            { className: 'dsuik-tilename' },
            h(ModeColor, { className: 'dsuik-dot', light: props.dotLight, dark: props.dotDark }),
            props.name,
            props.active ? h('span', { className: 'dsuik-check', 'aria-hidden': 'true' }) : null,
          ),
          h('span', { className: 'dsuik-tilehint' }, props.hint),
        ),
      )
    }

    function SettingsPage() {
      const [state, setState] = React.useState(store.state)
      const [restartUnavailable, setRestartUnavailable] = React.useState(false)
      const [legacyPresent, setLegacyPresent] = React.useState(false)

      React.useEffect(function () {
        return store.subscribe(function () {
          setState(store.state)
        })
      }, [])

      /* Ask the Host once whether this page is the desktop shell. A browser session
       * cannot restart anything, so the switch should say so up front instead of
       * leaving the user to discover it on the first click. */
      React.useEffect(function () {
        let alive = true
        void readStatus().then(function (status) {
          if (!alive) return
          if (status && typeof status.desktop === 'boolean') {
            setRestartUnavailable(status.desktop !== true)
          }
        })
        return function () {
          alive = false
        }
      }, [])

      /* The standalone plugin owns the original route prefix. If it is still
       * loaded, both plugins draw footer buttons — say so instead of leaving the
       * user to wonder why there are two sets. */
      React.useEffect(function () {
        let alive = true
        void detectStandalone().then(function (present) {
          if (alive) setLegacyPresent(present)
        })
        return function () {
          alive = false
        }
      }, [])

      const tiles = [
        h(ThemeTile, {
          key: 'default',
          active: state.theme === null,
          name: translate('defaultName'),
          hint: translate('defaultHint'),
          barLight: 'var(--dsw-alias-bg-base)',
          barDark: 'var(--dsw-alias-bg-base)',
          dotLight: 'var(--dsw-alias-brand-primary)',
          dotDark: 'var(--dsw-alias-brand-primary)',
          onPick: function () {
            store.setTheme(null)
          },
        }),
      ]

      for (let i = 0; i < THEMES.length; i += 1) {
        const theme = THEMES[i]
        tiles.push(
          h(ThemeTile, {
            key: theme.key,
            active: state.theme === theme.key,
            name: translate('theme.' + theme.key),
            hint: translate('theme.' + theme.key + '.hint'),
            barLight: theme.light['--dsw-alias-bg-base'],
            barDark: theme.dark['--dsw-alias-bg-base'],
            dotLight: theme.light['--dsw-alias-brand-primary'],
            dotDark: theme.dark['--dsw-alias-brand-primary'],
            onPick: function () {
              store.setTheme(theme.key)
            },
          }),
        )
      }

      return h(
        'div',
        { className: 'dsuik-page' },
        h('style', null, STYLES),
        h(
          'div',
          { className: 'dsuik-header' },
          h('div', { className: 'dsuik-title' }, translate('title')),
          h('p', { className: 'dsuik-sub' }, translate('subtitle')),
        ),
        legacyPresent
          ? h(
              'div',
              { className: 'dsuik-alert' },
              h('span', { className: 'dsuik-alert-title' }, translate('legacy.title')),
              h('span', { className: 'dsuik-alert-body' }, translate('legacy.body')),
            )
          : null,
        h(
          'div',
          { className: 'dsuik-section' },
          h('p', { className: 'dsuik-sectiontitle' }, translate('section.theme')),
          h('div', { className: 'dsuik-grid' }, tiles),
        ),
        h(
          'div',
          { className: 'dsuik-section' },
          h('p', { className: 'dsuik-sectiontitle' }, translate('section.desktop')),
          h(
            'div',
            { className: 'dsuik-row' },
            h(
              'div',
              { className: 'dsuik-rowtext' },
              h('span', { className: 'dsuik-rowname' }, translate('desktop.reloadSwitch')),
              h('span', { className: 'dsuik-rowhint' }, translate('desktop.reloadSwitchHint')),
            ),
            h(Switch, {
              checked: state.reload === true,
              label: translate('desktop.reloadSwitch'),
              onChange: function (next) {
                store.setFlag('reload', next)
              },
            }),
          ),
          h(
            'div',
            { className: 'dsuik-row' },
            h(
              'div',
              { className: 'dsuik-rowtext' },
              h('span', { className: 'dsuik-rowname' }, translate('desktop.restartSwitch')),
              h(
                'span',
                { className: 'dsuik-rowhint' + (restartUnavailable ? ' is-warn' : '') },
                restartUnavailable
                  ? translate('desktop.restartNotDesktop')
                  : translate('desktop.restartSwitchHint'),
              ),
            ),
            h(Switch, {
              checked: state.restart === true,
              disabled: restartUnavailable,
              label: translate('desktop.restartSwitch'),
              onChange: function (next) {
                store.setFlag('restart', next)
              },
            }),
          ),
        ),
        surface.controller && !surface.controller.active()
          ? h(
              'p',
              { className: 'dsuik-warn' },
              translate('applyFailed') +
                (surface.controller.error() ? ' ' + surface.controller.error() : ''),
            )
          : null,
        storageBroken ? h('p', { className: 'dsuik-sub' }, translate('storageNote')) : null,
      )
    }

    /* ------------------------------------------------------------------ *
     * Desktop actions — ported from @moonsand/dsh-desktop-restart
     *
     * One footer registration holds both buttons: the host renders one flex item
     * per registration and its footer does not wrap, so two registrations would
     * count as two items and push a neighbour onto a second line.
     * ------------------------------------------------------------------ */

    /** How long the second click stays armed before the button reverts to idle. */
    const ARM_TIMEOUT_MS = 6000
    /** How long a restart may take before the button reports that nothing happened. */
    const WATCHDOG_MS = 20000
    /** How long the button stays greyed out after a refused restart. */
    const BLOCKED_MS = 3000

    /**
     * Restart phase shared by both buttons.
     *
     * While a restart is in flight the reload button must be disabled: reloading
     * mid-kill would race the watchdog and could leave the window blank.
     */
    const restartPhase = { value: 'idle', since: 0, listeners: new Set() }

    function currentPhase() {
      const spent = Date.now() - restartPhase.since
      if (restartPhase.value === 'restarting' && spent > WATCHDOG_MS + 5000) {
        restartPhase.value = 'idle'
      } else if (restartPhase.value === 'blocked' && spent > BLOCKED_MS) {
        restartPhase.value = 'idle'
      } else if (
        restartPhase.value !== 'idle' &&
        restartPhase.value !== 'restarting' &&
        restartPhase.value !== 'blocked' &&
        spent > ARM_TIMEOUT_MS + 2000
      ) {
        restartPhase.value = 'idle'
      }
      return restartPhase.value
    }

    function publishPhase(next) {
      restartPhase.value = next
      restartPhase.since = Date.now()
      restartPhase.listeners.forEach(function (listener) {
        listener(next)
      })
    }

    function useRestartPhase() {
      const [phase, setLocal] = React.useState(currentPhase)
      React.useEffect(function () {
        const listener = function (next) {
          setLocal(next)
        }
        restartPhase.listeners.add(listener)
        setLocal(currentPhase())
        return function () {
          restartPhase.listeners.delete(listener)
        }
      }, [])
      return phase
    }

    const DESKTOP_CSS = `
.dsuik-dsr-group{display:flex;align-items:center;gap:4px;min-width:0;max-width:100%}
.dsuik-dsr-btn{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;height:26px;max-width:100%;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:12px;line-height:1;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsuik-dsr-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dsuik-dsr-btn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,currentColor);outline-offset:2px}
.dsuik-dsr-btn[data-phase="confirm"]{color:var(--dsw-alias-state-error-primary,#d1453b);font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dsuik-dsr-btn[data-phase="restarting"]{cursor:progress;opacity:.75}
.dsuik-dsr-btn[data-phase="blocked"]{color:var(--dsw-alias-state-error-primary,#d1453b);font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14));cursor:not-allowed}
.dsuik-dsr-btn[data-phase="failed"]{color:var(--dsw-alias-state-error-primary,#d1453b);font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dsuik-dsr-icon{flex:none;display:block}
.dsuik-dsr-btn[data-phase="restarting"] .dsuik-dsr-icon{animation:dsuik-dsr-spin 1s linear infinite}
@keyframes dsuik-dsr-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.dsuik-alert{display:flex;flex-direction:column;gap:3px;padding:10px 12px;border:1px solid var(--dsw-alias-state-warn-primary);border-radius:10px;}
.dsuik-alert-title{font-size:12.5px;font-weight:600;line-height:1.4;color:var(--dsw-alias-state-warn-primary);}
.dsuik-alert-body{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
`

    function RestartIcon() {
      return h(
        'svg',
        {
          className: 'dsuik-dsr-icon',
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          'aria-hidden': true,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        h('path', { d: 'M13.2 8a5.2 5.2 0 1 1-1.8-3.95' }),
        h('path', { d: 'M13.2 2.4v3.2h-3.2' }),
      )
    }

    function RefreshIcon() {
      return h(
        'svg',
        {
          className: 'dsuik-dsr-icon',
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          'aria-hidden': true,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        h('path', { d: 'M2.6 8a5.4 5.4 0 0 1 9.2-3.8' }),
        h('path', { d: 'M12.1 1.9v2.9H9.2' }),
        h('path', { d: 'M13.4 8a5.4 5.4 0 0 1-9.2 3.8' }),
        h('path', { d: 'M3.9 14.1v-2.9h2.9' }),
      )
    }

    async function readStatus() {
      try {
        const response = await fetch('/ui-optimize/desktop/status', {
          method: 'GET',
          headers: { accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        })
        if (!response.ok) return undefined
        return await response.json()
      } catch (err) {
        return undefined
      }
    }

    /**
     * Detect the standalone `@moonsand/dsh-desktop-restart` plugin.
     *
     * Its own status route is the cheapest proof that it is still loaded, and this
     * plugin deliberately owns a different prefix — so a 200 here can only come
     * from that other installation, never from ourselves.
     */
    async function detectStandalone() {
      try {
        const response = await fetch('/desktop-restart/status', {
          method: 'GET',
          headers: { accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: AbortSignal.timeout(4000),
        })
        return response.ok
      } catch (err) {
        return false
      }
    }

    async function requestRestart() {
      try {
        const response = await fetch('/ui-optimize/desktop/restart', {
          method: 'POST',
          headers: { accept: 'application/json', 'x-dsh-desktop-restart': '1' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: AbortSignal.timeout(15000),
        })
        let body
        try {
          body = await response.json()
        } catch (err) {
          body = undefined
        }
        return { status: response.status, body: body }
      } catch (err) {
        return undefined
      }
    }

    function RefreshButton(props) {
      const wide = props.wide !== false
      const [busy, setBusy] = React.useState(false)
      const restart = useRestartPhase()
      const blocked = restart === 'restarting'
      const timer = React.useRef(0)
      React.useEffect(function () {
        return function () {
          clearTimeout(timer.current)
        }
      }, [])

      function onClick() {
        if (busy || blocked) return
        setBusy(true)
        timer.current = window.setTimeout(function () {
          window.location.reload()
        }, 120)
      }

      const label = blocked
        ? translate('desktop.refreshBlocked')
        : busy
          ? translate('desktop.reloading')
          : translate('desktop.refresh')

      return h(
        'button',
        {
          type: 'button',
          className: 'dsuik-dsr-btn',
          'data-phase': blocked ? 'blocked' : busy ? 'restarting' : 'idle',
          disabled: busy || blocked,
          'aria-label': translate('desktop.refresh'),
          title: blocked ? translate('desktop.refreshBlocked') : translate('desktop.refreshHint'),
          onClick: onClick,
        },
        h(RefreshIcon),
        wide ? h('span', null, label) : null,
      )
    }

    function RestartButton(props) {
      const wide = props.wide !== false
      const phase = useRestartPhase()
      const [note, setNote] = React.useState('')
      const [busyTasks, setBusyTasks] = React.useState(0)
      const armTimer = React.useRef(0)
      const watchdog = React.useRef(0)

      React.useEffect(function () {
        return function () {
          clearTimeout(armTimer.current)
          clearTimeout(watchdog.current)
        }
      }, [])

      function settle() {
        clearTimeout(armTimer.current)
        publishPhase('idle')
        setNote('')
        setBusyTasks(0)
      }

      function reloadInsteadOfRestart(message) {
        clearTimeout(armTimer.current)
        publishPhase('failed')
        setNote(message)
        window.setTimeout(function () {
          window.location.reload()
        }, 1200)
      }

      async function arm() {
        clearTimeout(armTimer.current)
        publishPhase('confirm')
        setNote(translate('desktop.confirm'))
        armTimer.current = window.setTimeout(settle, ARM_TIMEOUT_MS)
        const status = await readStatus()
        if (status === undefined) return
        if (status.desktop !== true) {
          reloadInsteadOfRestart(translate('desktop.notDesktop'))
          return
        }
        if (typeof status.activeAgents === 'number' && status.activeAgents > 0) {
          setBusyTasks(status.activeAgents)
          setNote(translate('desktop.confirmBusy'))
        }
      }

      async function restart() {
        clearTimeout(armTimer.current)
        publishPhase('restarting')
        setNote(translate('desktop.restarting'))
        const answer = await requestRestart()
        if (answer === undefined) {
          reloadInsteadOfRestart(translate('desktop.unreachable'))
          return
        }
        const reason = answer.body && answer.body.reason
        if (reason === 'installing') {
          publishPhase('blocked')
          setNote(translate('desktop.installing'))
          window.setTimeout(function () {
            if (restartPhase.value === 'blocked') publishPhase('idle')
          }, BLOCKED_MS)
          return
        }
        if (answer.status === 409 || reason === 'not-desktop') {
          reloadInsteadOfRestart(translate('desktop.notDesktop'))
          return
        }
        if (!answer.body || answer.body.ok !== true) {
          publishPhase('failed')
          setNote(
            answer.body && typeof answer.body.message === 'string'
              ? answer.body.message
              : translate('desktop.failed'),
          )
          return
        }
        watchdog.current = window.setTimeout(function () {
          publishPhase('failed')
          setNote(translate('desktop.stillAlive'))
        }, WATCHDOG_MS)
      }

      function onClick() {
        if (phase === 'restarting') return
        if (phase === 'confirm') {
          void restart()
          return
        }
        void arm()
      }

      function onKeyDown(event) {
        if (event.key === 'Escape' && phase === 'confirm') {
          event.preventDefault()
          settle()
        }
      }

      let label = translate('desktop.label')
      if (phase === 'confirm') {
        label = busyTasks > 0 ? translate('desktop.confirmBusy') : translate('desktop.confirm')
      } else if (phase === 'restarting') {
        label = translate('desktop.restarting')
      } else if (phase === 'blocked') {
        label = translate('desktop.installing')
      } else if (phase === 'failed') {
        label = translate('desktop.failed')
      }

      return h(
        'button',
        {
          type: 'button',
          className: 'dsuik-dsr-btn',
          'data-phase': phase,
          disabled: phase === 'restarting',
          'aria-label': translate('desktop.label'),
          title: note === '' ? translate('desktop.hint') : note,
          onClick: onClick,
          onKeyDown: onKeyDown,
        },
        h(RestartIcon),
        wide || phase !== 'idle' ? h('span', null, label) : null,
      )
    }

    /**
     * Shown right after this bundle is enabled. A plugin cannot intercept its own
     * installation — the plugin manager performs that — but this slot appears at the
     * moment the user is looking, so the standalone-plugin conflict is raised there
     * as well as on the settings page.
     */
    function ActivationNote() {
      const [legacy, setLegacy] = React.useState(false)
      React.useEffect(function () {
        let alive = true
        void detectStandalone().then(function (present) {
          if (alive) setLegacy(present)
        })
        return function () {
          alive = false
        }
      }, [])
      if (!legacy) return null
      return h(
        'div',
        { className: 'dsuik-alert' },
        h('span', { className: 'dsuik-alert-title' }, translate('legacy.title')),
        h('span', { className: 'dsuik-alert-body' }, translate('legacy.body')),
      )
    }

    function DesktopActions(props) {
      const [state, setState] = React.useState(store.state)
      React.useEffect(function () {
        return store.subscribe(function () {
          setState(store.state)
        })
      }, [])
      const wide = props.wide !== false
      const showReload = state.reload === true
      const showRestart = state.restart === true
      if (!showReload && !showRestart) return null
      return h(
        'div',
        { className: 'dsuik-dsr-group' },
        showReload ? h(RefreshButton, { wide: wide }) : null,
        showRestart ? h(RestartButton, { wide: wide }) : null,
      )
    }

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots'],
      apply(ctx) {
        try {
          const locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined
          if (locale && typeof locale.register === 'function' && typeof locale.bind === 'function') {
            locale.register(NS, { en: DICT.en, zh: DICT.zh })
            const bound = locale.bind(NS)
            translate = function (key) {
              try {
                const value = bound(key)
                if (typeof value === 'string' && value.length > 0) return value
              } catch (err) {
                /* fall through to the built-in dictionary */
              }
              const table = DICT[detectLanguage()] || DICT.en
              return table[key] || DICT.en[key] || key
            }
          }
        } catch (err) {
          /* keep the built-in dictionary */
        }

        /* The client tree may still be composing when this plugin mounts, so the
         * theme service can be unreachable on the first attempt. Retry briefly
         * instead of staying silently unapplied for the whole page session, and
         * re-apply whenever the platform republishes its own theme. */
        ctx.effect(function () {
          const controller = createController(function () {
            return typeof ctx.get === 'function' ? ctx.get('theme') : undefined
          })
          surface.controller = controller

          /* Re-entrancy guards. `overrideTokens` emits `theme/change` itself, so an
           * ungated listener re-applies on our own emission and loops forever —
           * one full restack and re-render per turn, which reads as stutter. */
          let applied = null
          let busy = false

          function sync() {
            if (busy) return
            const key = store.state.theme
            if (key === applied && controller.active()) return
            busy = true
            let settled = false
            try {
              settled = controller.sync(store.state)
            } finally {
              busy = false
            }
            applied = settled ? key : null
          }

          let attempts = 0
          let timer = null
          function tick() {
            timer = null
            sync()
            if (controller.active()) return
            attempts += 1
            if (attempts >= 20) return
            timer = setTimeout(tick, 250)
          }
          tick()

          /* Only repair the layer when the platform has actually dropped it. */
          const offChange =
            typeof ctx.on === 'function'
              ? ctx.on('theme/change', function () {
                  if (controller.active()) return
                  applied = null
                  sync()
                })
              : function () {}

          const unsubscribe = store.subscribe(sync)

          return function () {
            if (timer) clearTimeout(timer)
            offChange()
            unsubscribe()
            controller.dispose()
            surface.controller = null
          }
        }, 'dsh-ui-optimize: theme layer')

        ctx.slots.inject('settings.section', function () {
          return ctx.slots.register(
            {
              name: 'settings.section',
              id: 'ui-optimize',
              order: 120,
              label: function () {
                return translate('title')
              },
            },
            SettingsPage,
          )
        })

        /* Footer buttons live outside the settings page, so their styles cannot ride
         * on the page's <style> element and must be registered with the run itself. */
        ctx.effect(function () {
          const style = document.createElement('style')
          style.setAttribute('data-dsh-ui-optimize', 'desktop-actions')
          style.textContent = DESKTOP_CSS
          document.head.appendChild(style)
          return function () {
            style.remove()
          }
        }, 'dsh-ui-optimize: desktop action styles')

        ctx.slots.inject('sidebar.footer.action', function () {
          return ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'ui-optimize-desktop-actions',
              order: -110,
              label: function () {
                return translate('desktop.refresh')
              },
              inject: function () {
                return {}
              },
            },
            DesktopActions,
          )
        })

        /* Guidance shown on the bundle row right after it is enabled, keyed by our
         * own package name. This is the closest thing to an install-time reminder a
         * plugin can own. */
        ctx.slots.inject('plugins.bundle.activation', function () {
          return ctx.slots.register(
            { name: 'plugins.bundle.activation', key: '@moonsand/dsh-ui-optimize' },
            ActivationNote,
          )
        })
      },
    }
  },
})
