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
        subtitle: 'Making the DSH interface pleasant to live in, one switch at a time.',
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
        'section.sidebar': 'Sidebar',
        'sidebar.shelf': 'Panels',
        'sidebar.shelfEmpty': 'No matching panels',
        'sidebar.count': 'panels',
        'sidebar.search': 'Search panels…',
        'sidebar.hint': '↑↓ move · ↵ open · Esc close',
        'sidebar.more': 'More',
        'sidebar.switch': 'Fold the sidebar menu into one Panels entry',
        'sidebar.switchHint': 'The menu rows collapse into a single launcher that lists every panel; panels a future plugin registers show up on their own. Also makes the New Session button shorter',
        'sidebar.unavailable': 'This build does not expose the slot API the launcher needs, so folding stays off.',
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
        'desktop.reloadNotDesktop': 'This is a browser session, so the reload button is not offered — this shell already has its own refresh entry. The switch works only inside the desktop app.',
        'legacy.title': '@moonsand/dsh-desktop-restart is still installed',
        'legacy.body': 'Both plugins draw reload/restart buttons, so the sidebar foot will show two sets. Uninstall dsh-desktop-restart under Settings → Plugins and keep only this one.',
        storageNote: 'Storage unavailable — the choice lasts until this page reloads.',
      },
      zh: {
        title: '界面优化',
        subtitle: '把 DSH 界面调得顺眼顺手，一个开关一件事。',
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
        'section.sidebar': '侧栏',
        'sidebar.shelf': '面板',
        'sidebar.shelfEmpty': '没有匹配的面板',
        'sidebar.count': '个面板',
        'sidebar.search': '搜索面板…',
        'sidebar.hint': '↑↓ 选择 · ↵ 打开 · Esc 关闭',
        'sidebar.more': '更多',
        'sidebar.switch': '把侧栏菜单收进「面板」',
        'sidebar.switchHint': '菜单行合并成一个入口，点开列出全部面板；新插件注册的面板会自动出现。同时把「新会话」按钮压低一点',
        'sidebar.unavailable': '当前版本取不到槽位接口，收纳功能用不了，所以保持关闭。',
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
        'desktop.reloadNotDesktop': '当前是网页端，刷新按钮不提供——这个外壳已经自带刷新入口。此开关仅在桌面应用里可开。',
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
      return { version: 4, theme: null, reload: true, restart: true, sidebar: false }
    }

    function normalize(stored) {
      const out = defaultState()
      if (!stored || typeof stored !== 'object') return out
      if (typeof stored.theme === 'string' && THEME_BY_KEY[stored.theme]) {
        out.theme = stored.theme
      }
      if (typeof stored.reload === 'boolean') out.reload = stored.reload
      if (typeof stored.restart === 'boolean') out.restart = stored.restart
      if (typeof stored.sidebar === 'boolean') out.sidebar = stored.sidebar
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

    /* Which shell this page is running in, and therefore what it can actually do.
     *
     * A feature is only offered when the current environment can honour it: the
     * desktop app can restart its own process, a browser session cannot. The rule
     * lives in one table so a new feature declares its requirement instead of
     * each switch inventing its own check. */
    const FEATURES = {
      theme: { envs: ['desktop', 'web'] },
      /* The fnOS shell has its own reload and restart entries, so these two stay
       * desktop-only: in a browser session they would duplicate what the shell
       * already offers, and the switch must not be turnable on there. */
      reload: { envs: ['desktop'], reason: 'desktop.reloadNotDesktop' },
      restart: { envs: ['desktop'], reason: 'desktop.restartNotDesktop' },
      sidebar: { envs: ['desktop', 'web'], reason: 'sidebar.unavailable' },
    }

    /* The single answer to "can this shell run this feature". Callers render the
     * switch greyed out and print `reason` when `available` is false.
     *
     * `unknown` means the probe has not answered yet (or its route is missing);
     * features stay usable then, because a transient network failure must not
     * disable a working feature. */
    function featureGate(name, env) {
      const spec = FEATURES[name]
      if (!spec) return { available: true, reason: '' }
      if (env !== 'desktop' && env !== 'web') return { available: true, reason: '' }
      if (spec.envs.indexOf(env) === -1) {
        return { available: false, reason: translate(spec.reason) }
      }
      return { available: true, reason: '' }
    }

    const store = {
      state: normalize(readStored()),
      /* Describes the running process, not a preference — never persisted. */
      env: 'unknown',
      listeners: new Set(),
      subscribe(listener) {
        store.listeners.add(listener)
        return function () {
          store.listeners.delete(listener)
        }
      },
      notify() {
        /* Fresh identity so subscribers that store the state object re-render. */
        store.state = Object.assign({}, store.state)
        const snapshot = Array.from(store.listeners)
        for (let i = 0; i < snapshot.length; i += 1) {
          try {
            snapshot[i]()
          } catch (err) {
            /* a broken subscriber must not block the others */
          }
        }
      },
      setEnv(value) {
        if (value !== 'desktop' && value !== 'web') return
        if (store.env === value) return
        store.env = value
        /* Anything this shell cannot run is forced off the moment the probe
         * answers: a `true` stored by a desktop session must not survive into a
         * browser session, where `setFlag` refuses to turn the switch back on
         * and the stored value would otherwise keep the button visible. */
        const next = Object.assign({}, store.state, { version: 3 })
        let dirty = false
        const names = Object.keys(FEATURES)
        for (let i = 0; i < names.length; i += 1) {
          const name = names[i]
          if (next[name] === true && !featureGate(name, value).available) {
            next[name] = false
            dirty = true
          }
        }
        if (dirty) publish(next)
        else store.notify()
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
        /* Hard gate: a feature this shell cannot run never turns on, even when
         * something other than the switch calls this directly. */
        if (value === true && !featureGate(name, store.env).available) return
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
          'aria-disabled': disabled ? 'true' : 'false',
          title: disabled && props.title ? props.title : props.hint || props.label,
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
      const [legacyPresent, setLegacyPresent] = React.useState(false)
      const env = store.env
      const reloadGate = featureGate('reload', env)
      const restartGate = featureGate('restart', env)
      /* The shelf also needs the slot API: without it the switch stays off and
       * says why, instead of offering something that cannot work. */
      const sidebarGate = slotsCoreApi
        ? featureGate('sidebar', env)
        : { available: false, reason: translate('sidebar.unavailable') }

      React.useEffect(function () {
        return store.subscribe(function () {
          setState(store.state)
        })
      }, [])

      /* The probe runs at plugin start; if it failed there (a transient network
       * error), retry once when the settings page opens — but never override a
       * known answer. */
      React.useEffect(function () {
        if (env !== 'unknown') return undefined
        let alive = true
        void readStatus().then(function (status) {
          if (!alive) return
          store.setEnv(shellEnv(status))
        })
        return function () {
          alive = false
        }
      }, [env])

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
              h(
                'span',
                { className: 'dsuik-rowhint' + (reloadGate.available ? '' : ' is-warn') },
                reloadGate.available
                  ? translate('desktop.reloadSwitchHint')
                  : reloadGate.reason,
              ),
            ),
            h(Switch, {
              checked: state.reload === true,
              disabled: !reloadGate.available,
              title: reloadGate.reason,
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
                { className: 'dsuik-rowhint' + (restartGate.available ? '' : ' is-warn') },
                restartGate.available
                  ? translate('desktop.restartSwitchHint')
                  : restartGate.reason,
              ),
            ),
            h(Switch, {
              checked: state.restart === true,
              disabled: !restartGate.available,
              title: restartGate.reason,
              label: translate('desktop.restartSwitch'),
              onChange: function (next) {
                store.setFlag('restart', next)
              },
            }),
          ),
        ),
        h(
          'div',
          { className: 'dsuik-section' },
          h('p', { className: 'dsuik-sectiontitle' }, translate('section.sidebar')),
          h(
            'div',
            { className: 'dsuik-row' },
            h(
              'div',
              { className: 'dsuik-rowtext' },
              h('span', { className: 'dsuik-rowname' }, translate('sidebar.switch')),
              h(
                'span',
                { className: 'dsuik-rowhint' + (sidebarGate.available ? '' : ' is-warn') },
                sidebarGate.available
                  ? translate('sidebar.switchHint')
                  : sidebarGate.reason,
              ),
            ),
            h(Switch, {
              checked: state.sidebar === true,
              disabled: !sidebarGate.available,
              title: sidebarGate.reason,
              label: translate('sidebar.switch'),
              onChange: function (next) {
                store.setFlag('sidebar', next)
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

    /* The Host route lives on the DSH web server, but a shell may serve the page
     * under a path prefix and answer every other path with a text body (fnOS
     * answers `invalid token` with HTTP 200) — so a successful status still has
     * to be JSON carrying `desktop` before it counts. Try the page-relative URL
     * first, then the root. */
    async function readStatus() {
      const candidates = []
      try {
        candidates.push(new URL('ui-optimize/desktop/status', document.baseURI).href)
      } catch (err) {
        /* malformed baseURI: fall through to the root-relative URL */
      }
      candidates.push('/ui-optimize/desktop/status')
      for (let i = 0; i < candidates.length; i += 1) {
        try {
          const response = await fetch(candidates[i], {
            method: 'GET',
            headers: { accept: 'application/json' },
            credentials: 'same-origin',
            cache: 'no-store',
            signal: AbortSignal.timeout(6000),
          })
          if (!response.ok) continue
          const data = await response.json()
          if (data && typeof data.desktop === 'boolean') return data
        } catch (err) {
          /* try the next candidate */
        }
      }
      return undefined
    }

    /* Which shell this is. The Host probe is authoritative. When it cannot be
     * read at all, the user agent still separates the Electron desktop app from
     * any browser, and anything unrecognised counts as web: a browser session
     * must never be offered a button it cannot honour. */
    function shellEnv(status) {
      if (status && typeof status.desktop === 'boolean') {
        return status.desktop === true ? 'desktop' : 'web'
      }
      try {
        if (/electron/i.test(navigator.userAgent || '')) return 'desktop'
      } catch (err) {
        /* no navigator: treat as web */
      }
      return 'web'
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
        if (props.unavailable === true) return
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
          disabled: phase === 'restarting' || props.unavailable === true,
          'aria-label': translate('desktop.label'),
          title:
            props.unavailable === true
              ? props.reason || translate('desktop.restartNotDesktop')
              : note === ''
                ? translate('desktop.hint')
                : note,
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
      const reloadGate = featureGate('reload', store.env)
      const restartGate = featureGate('restart', store.env)
      /* The stored preference and the shell's ability are two different things:
       * a browser session must not draw a button it cannot honour, whatever the
       * preference says. */
      const showReload = state.reload === true && reloadGate.available
      const showRestart = state.restart === true && restartGate.available
      if (!showReload && !showRestart) return null
      return h(
        'div',
        { className: 'dsuik-dsr-group' },
        showReload ? h(RefreshButton, { wide: wide }) : null,
        showRestart ? h(RestartButton, { wide: wide }) : null,
      )
    }

    /* ------------------------------------------------------------------ *
     * Sidebar panel shelf (feature 3)
     *
     * Modelled on dsh-sidebar-shelf: one native row registered into
     * `sidebar.panellist` becomes the launcher, one scoped rule hides the other
     * rows, and the popover lists every registered panel read live from
     * `entriesOfSlot` — so a panel a future plugin registers shows up on its own.
     *
     * Opening a panel goes through the official `ctx.layout.selectPanel(id)`;
     * no synthetic clicks on the shell's DOM.
     *
     * Degradation: the slots helper package is required lazily. If it is not
     * available, this feature stays off and every other feature is unaffected.
     * ------------------------------------------------------------------ */

    const SHELF_ID = 'muik-panels'
    const SHELF_ATTR = 'data-muik-shelf'
    const SHELF_ROW_ATTR = 'data-muik-shelf-row'

    let slotsCoreApi = null
    try {
      slotsCoreApi = require('@deepseek-ai/dsh-client-ui-slots')
    } catch (err) {
      slotsCoreApi = null
    }

    let reactDomApi = null
    try {
      reactDomApi = require('react-dom')
    } catch (err) {
      reactDomApi = null
    }

    const SHELF_CSS = `
[${SHELF_ATTR}="on"] > nav > *:not([${SHELF_ROW_ATTR}]):not([data-muik-keep]){display:none!important}
button.muik-shelf-row{display:flex;align-items:center;gap:10px;box-sizing:border-box;width:100%;height:36px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:13px;text-align:left;cursor:pointer}
button.muik-shelf-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
button.muik-shelf-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:-2px}
.muik-shelf-glyph{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px}
.muik-shelf-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muik-shelf-pop{position:fixed;z-index:2147483000;box-sizing:border-box;min-width:190px;max-height:min(60vh,420px);overflow:auto;padding:6px;border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12));box-shadow:0 10px 28px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary,inherit)}
.muik-shelf-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;max-height:min(58vh,420px);overflow:auto;padding:2px;overscroll-behavior:contain}
.muik-shelf-tile{display:flex;align-items:center;gap:8px;min-width:0;height:38px;padding:0 10px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.muik-shelf-tile:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.muik-shelf-tile:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:-2px}
.muik-shelf-tileglyph{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px}
.muik-shelf-tile--wide{grid-column:1 / -1;margin-top:2px;border-top:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.1));border-radius:0 0 7px 7px}
.muik-shelf-tilelabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muik-shelf-fallback{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.16));font-size:11px;font-weight:600}
.muik-shelf-head{display:flex;align-items:baseline;gap:8px;padding:6px 8px 7px}
.muik-shelf-title{flex:1;min-width:0;font-size:13px;font-weight:600;letter-spacing:.01em}
.muik-shelf-meta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,inherit);font-variant-numeric:tabular-nums}
.muik-shelf-search{padding:0 4px 6px}
.muik-shelf-search input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.14));background:var(--dsw-alias-bg-layer-2,transparent);color:inherit;font:inherit;font-size:13px;outline:none}
.muik-shelf-search input::placeholder{color:var(--dsw-alias-label-tertiary,#888)}
.muik-shelf-hint{padding:6px 8px 4px;font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.muik-shelf-tile--focus{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:-2px}
.muik-shelf-empty{padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-secondary,inherit)}
[${SHELF_ATTR}="on"] > button[class*="_newSession"]{height:30px!important;min-height:30px!important;max-height:30px!important}
`

    function readPanelEntries(slotsApi) {
      if (!slotsApi || typeof slotsApi.entriesOfSlot !== 'function') return []
      let registered = []
      try {
        registered = slotsApi.entriesOfSlot('sidebar.panellist') || []
      } catch (err) {
        return []
      }
      const out = []
      const seen = new Set()
      for (let i = 0; i < registered.length; i += 1) {
        const entry = registered[i]
        const options = entry && entry.options
        const id = options && options.id
        if (typeof id !== 'string' || id === SHELF_ID || seen.has(id)) continue
        seen.add(id)
        let label = id
        try {
          if (slotsCoreApi && typeof slotsCoreApi.resolveSlotLabel === 'function') {
            const resolved = slotsCoreApi.resolveSlotLabel(options.label)
            if (typeof resolved === 'string' && resolved.length > 0) label = resolved
          } else if (typeof options.label === 'function') {
            const resolved = options.label()
            if (typeof resolved === 'string' && resolved.length > 0) label = resolved
          } else if (typeof options.label === 'string') {
            label = options.label
          }
        } catch (err) {
          /* a malformed label must never hide a panel */
        }
        out.push({
          id: id,
          order: typeof options.order === 'number' ? options.order : 0,
          label: label,
          icon: entry.component,
        })
      }
      out.sort(function (a, b) {
        return a.order - b.order
      })
      return out
    }

    /** One glyph from the panel's own slot component, with a safe fallback. */
    class GlyphBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }
      static getDerivedStateFromError() {
        return { failed: true }
      }
      componentDidCatch(error) {
        console.warn('[dsh-ui-optimize] panel icon failed, using fallback', error)
      }
      render() {
        return this.state.failed === true ? this.props.fallback : this.props.children
      }
    }

    function PanelGlyph(props) {
      const panel = props.panel || {}
      const label = typeof panel.label === 'string' ? panel.label : ''
      const initial = label.length > 0 ? label.trim().slice(0, 1).toUpperCase() : '?'
      const fallback = h('span', { className: 'muik-shelf-fallback', 'aria-hidden': 'true' }, initial)
      const icon = panel.icon
      if (typeof icon !== 'function' && (typeof icon !== 'object' || icon === null)) return fallback
      return h(GlyphBoundary, { fallback: fallback }, h(icon, { size: 18, active: false }))
    }

    function PanelsShelf(props) {
      const [state, setState] = React.useState(store.state)
      const [open, setOpen] = React.useState(false)
      const [panels, setPanels] = React.useState(function () {
        return readPanelEntries(props.slotsApi)
      })
      const [pos, setPos] = React.useState(null)
      const [query, setQuery] = React.useState('')
      const [focusIndex, setFocusIndex] = React.useState(-1)
      const inputRef = React.useRef(null)
      const tileRefs = React.useRef([])
      const glyphRef = React.useRef(null)
      const rowRef = React.useRef(null)
      const popRef = React.useRef(null)
      const toggleRef = React.useRef(null)
      const moreRef = React.useRef(null)
      const [hasMore, setHasMore] = React.useState(false)
      const enabled = state.sidebar === true

      const needle = query.trim().toLowerCase()
      const filtered =
        needle.length === 0
          ? panels
          : panels.filter(function (panel) {
              return (
                String(panel.label).toLowerCase().indexOf(needle) !== -1 ||
                String(panel.id).toLowerCase().indexOf(needle) !== -1
              )
            })

      React.useEffect(function () {
        return store.subscribe(function () {
          setState(store.state)
        })
      }, [])

      React.useEffect(
        function () {
          const glyph = glyphRef.current
          // The shell wraps every panellist entry in its own <button> and draws the
          // label itself, so the row to mark is that wrapper — not our glyph.
          const row = glyph && typeof glyph.closest === 'function' ? glyph.closest('button') : null
          if (!row) return undefined
          const nav = row.parentElement
          const root = nav ? nav.parentElement : null
          if (!root) return undefined
          rowRef.current = row
          row.setAttribute(SHELF_ROW_ATTR, '')
          row.style.display = enabled ? '' : 'none'
          root.setAttribute(SHELF_ATTR, enabled ? 'on' : 'off')

          // The shell appends its own "More" row after the registered rows, and its
          // menu holds content that is not a panellist entry. Hiding that row would
          // strand it, so it is kept visible whenever the actions list has entries.
          let keepRow = null
          try {
            const actions = props.slotsApi.entriesOfSlot('sidebar.panellist.actions') || []
            if (actions.length > 0) {
              const kids = nav.children
              for (let i = kids.length - 1; i >= 0; i -= 1) {
                if (kids[i] !== row) {
                  keepRow = kids[i]
                  // Kept visible on purpose. The shell's More menu only opens from a
                  // trusted click: synthetic click(), full pointer sequences and a
                  // re-shown row were each tried (0.9.13 / 0.9.23 / 0.9.24 / 0.9.25)
                  // and none opened it, so the row keeps its own place instead of
                  // being folded into the popover.
                  keepRow.setAttribute('data-muik-keep', '')
                  break
                }
              }
            }
          } catch (err) {
            keepRow = null
          }
          moreRef.current = null
          setHasMore(false)

          // The row node is ours to keep only while React does not replace it, and a
          // replaced node silently loses its listener — the shell's own handler then
          // wins and selects a panel. Hold the latest toggle in a ref so the listener
          // itself never needs to be re-attached, and swallow the event completely.
          toggleRef.current = toggle

          function onClick(event) {
            if (!enabled) return
            event.preventDefault()
            event.stopPropagation()
            if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation()
            if (typeof toggleRef.current === 'function') toggleRef.current(row)
          }
          row.addEventListener('click', onClick, true)

          /**
           * Safety net. Hiding rows is the only destructive thing this feature does,
           * and a bad measurement once left the whole column blank. If the column or
           * our own row has no measurable box shortly after mounting, put everything
           * back and leave the native sidebar alone — a degraded feature beats a
           * missing sidebar, and it recovers without the user touching anything.
           */
          function verify() {
            if (!enabled) return
            let healthy = true
            try {
              const rootRect = root.getBoundingClientRect()
              const rowRect = row.getBoundingClientRect()
              healthy = rootRect.width > 0 && rootRect.height > 0 && rowRect.height > 0
            } catch (err) {
              healthy = false
            }
            if (!healthy) {
              root.setAttribute(SHELF_ATTR, 'off')
              row.removeAttribute(SHELF_ROW_ATTR)
              row.style.display = ''
            }
          }
          const verifyTimer = window.setTimeout(verify, 400)
          window.addEventListener('resize', verify)

          return function () {
            row.removeEventListener('click', onClick, true)
            window.clearTimeout(verifyTimer)
            window.removeEventListener('resize', verify)
            row.removeAttribute(SHELF_ROW_ATTR)
            row.style.display = ''
            if (keepRow) keepRow.removeAttribute('data-muik-keep')
            moreRef.current = null
            if (root.getAttribute(SHELF_ATTR) === 'on') root.setAttribute(SHELF_ATTR, 'off')
            rowRef.current = null
          }
        },
        [enabled],
      )

      React.useEffect(
        function () {
          if (!open) return undefined
          function onPointerDown(event) {
            const inPop = popRef.current && popRef.current.contains(event.target)
            const inRow = rowRef.current && rowRef.current.contains(event.target)
            if (!inPop && !inRow) setOpen(false)
          }
          function onKeyDown(event) {
            if (event.key === 'Escape') {
              setOpen(false)
              return
            }
            if (filtered.length === 0) return
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              const step = event.key === 'ArrowDown' ? 1 : -1
              setFocusIndex(function (prev) {
                const next = prev + step
                if (next < 0) return filtered.length - 1
                if (next >= filtered.length) return 0
                return next
              })
              return
            }
            if (event.key === 'Enter') {
              const target = filtered[focusIndex >= 0 ? focusIndex : 0]
              if (target) {
                event.preventDefault()
                pick(target.id)
              }
            }
          }
          document.addEventListener('mousedown', onPointerDown, true)
          document.addEventListener('keydown', onKeyDown, true)
          return function () {
            document.removeEventListener('mousedown', onPointerDown, true)
            document.removeEventListener('keydown', onKeyDown, true)
          }
        },
        [open, filtered, focusIndex],
      )

      function toggle(row) {
        const next = !open
        if (next) {
          setPanels(readPanelEntries(props.slotsApi))
          setQuery('')
          setFocusIndex(-1)
          if (row) {
            // Drop the card right under the row; alongside the rail when collapsed.
            const rect = row.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const width = Math.min(300, viewportWidth - 24)
            const rail = rect.width < 80
            const preferredLeft = rail ? rect.right + 10 : rect.left
            const left = Math.min(Math.max(preferredLeft, 12), viewportWidth - width - 12)
            const top = Math.min(rect.bottom + 6, viewportHeight - 92)
            setPos({
              left: Math.round(left),
              top: Math.round(top),
              width: Math.round(width),
            })
          }
        }
        setOpen(next)
      }

      function pick(id) {
        setOpen(false)
        try {
          props.selectPanel(id)
        } catch (err) {
          /* a panel that cannot be selected must not break the row */
        }
      }

      /**
       * Hand a "More" click to the shell's own row button.
       *
       * The row is parked by a static stylesheet rule at --muik-more-x/y, so it keeps
       * a real (tiny) rect to anchor the shell's menu against while taking no space
       * in the column. Only two custom properties on <html> are written here, then
       * the button is clicked. No `display`, `position`, size or opacity is touched
       * at click time: mutating layout properties on a host node the shell is about
       * to re-render is exactly what collapsed the sidebar before.
       */
      function openMore() {
        const button = moreRef.current
        if (!button) return
        const x = pos ? pos.left : 12
        const y = pos ? pos.top : 120
        try {
          const style = document.documentElement.style
          style.setProperty('--muik-more-x', x + 'px')
          style.setProperty('--muik-more-y', y + 'px')
        } catch (err) {
          /* a missing coordinate only misplaces the menu, it never breaks the row */
        }
        // Click only. Replaying pointerdown/mousedown first made the shell open its
        // menu and immediately dismiss it again (its outside-press handler fires on
        // the bubbled mousedown). The menu itself is no longer clipped because the
        // parked row keeps `overflow: visible`.
        try {
          button.click()
        } catch (err) {
          /* the shell refusing to open its menu must not break the popover */
        }
        setOpen(false)
      }

      const glyph = h(
        'span',
        { ref: glyphRef, className: 'muik-shelf-glyph', 'aria-hidden': 'true' },
        h(
          'svg',
          { viewBox: '0 0 16 16', width: 18, height: 18, fill: 'currentColor' },
          h('rect', { x: 1.5, y: 2.5, width: 5, height: 5, rx: 1.2 }),
          h('rect', { x: 9.5, y: 2.5, width: 5, height: 5, rx: 1.2 }),
          h('rect', { x: 1.5, y: 9.5, width: 5, height: 5, rx: 1.2 }),
          h('rect', { x: 9.5, y: 9.5, width: 5, height: 5, rx: 1.2 }),
        ),
      )

      if (!open || !pos) return glyph

      const popover = h(
        'div',
        {
          ref: popRef,
          className: 'muik-shelf-pop',
          style: {
            left: pos.left + 'px',
            top: pos.top + 'px',
            width: pos.width ? pos.width + 'px' : undefined,
          },
        },
        h(
          'div',
          { className: 'muik-shelf-head' },
          h('span', { className: 'muik-shelf-title' }, translate('sidebar.shelf')),
          h('span', { className: 'muik-shelf-meta' }, filtered.length + ' ' + translate('sidebar.count')),
        ),
        panels.length > 7
          ? h(
              'div',
              { className: 'muik-shelf-search' },
              h('input', {
                ref: inputRef,
                type: 'text',
                value: query,
                placeholder: translate('sidebar.search'),
                autoFocus: true,
                onChange: function (event) {
                  setQuery(event.target.value)
                  setFocusIndex(-1)
                },
              }),
            )
          : null,
        filtered.length === 0
          ? h('div', { className: 'muik-shelf-empty' }, translate('sidebar.shelfEmpty'))
          : h(
              'div',
              { className: 'muik-shelf-grid' },
              filtered.map(function (panel, index) {
                return h(
                  'button',
                  {
                    key: panel.id,
                    ref: function (node) {
                      tileRefs.current[index] = node
                    },
                    type: 'button',
                    className:
                      'muik-shelf-tile' + (index === focusIndex ? ' muik-shelf-tile--focus' : ''),
                    title: panel.label,
                    onMouseEnter: function () {
                      setFocusIndex(index)
                    },
                    onClick: function () {
                      pick(panel.id)
                    },
                  },
                  h('span', { className: 'muik-shelf-tileglyph' }, h(PanelGlyph, { panel: panel })),
                  h('span', { className: 'muik-shelf-tilelabel' }, panel.label),
                )
              }),
              hasMore
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'muik-shelf-tile muik-shelf-tile--wide',
                      title: translate('sidebar.more'),
                      onClick: function () {
                        openMore()
                      },
                    },
                    h('span', { className: 'muik-shelf-tilelabel' }, translate('sidebar.more')),
                  )
                : null,
            ),
        h('div', { className: 'muik-shelf-hint' }, translate('sidebar.hint')),
      )

      const portal =
        reactDomApi && typeof reactDomApi.createPortal === 'function'
          ? reactDomApi.createPortal(popover, document.body)
          : popover

      return h(React.Fragment, null, glyph, portal)
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

        /* Detect the shell once, before anything is drawn: a desktop app can
         * restart its own process, a browser session cannot. Switches read this
         * from the store, so the first render already greys out what this
         * environment cannot do and prints the reason next to it. */
        ctx.effect(function () {
          let alive = true
          void readStatus().then(function (status) {
            if (!alive) return
            store.setEnv(shellEnv(status))
          })
          return function () {
            alive = false
          }
        })

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

        /* Feature 3. Skipped entirely when the slots helper package is unavailable,
         * so a missing optional dependency can never take the whole plugin down. */
        if (slotsCoreApi) {
          ctx.effect(function () {
            const style = document.createElement('style')
            style.setAttribute('data-dsh-ui-optimize', 'sidebar-shelf')
            style.textContent = SHELF_CSS
            document.head.appendChild(style)
            return function () {
              style.remove()
            }
          }, 'dsh-ui-optimize: sidebar shelf styles')

          ctx.slots.inject('sidebar.panellist', function () {
            return ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: SHELF_ID,
                order: -1000,
                label: function () {
                  return translate('sidebar.shelf')
                },
                inject: function () {
                  return {
                    slotsApi: ctx.slots,
                    selectPanel: function (id) {
                      const layout = typeof ctx.get === 'function' ? ctx.get('layout') : undefined
                      if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(id)
                    },
                  }
                },
              },
              PanelsShelf,
            )
          })
        }

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
