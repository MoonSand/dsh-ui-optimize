/**
 * Host half of @moonsand/dsh-ui-optimize.
 *
 * Two responsibilities:
 *
 *   1. The theme gallery is entirely a browser-side feature (see `client.js`);
 *      this row exists so the bundle has a Host entry of its own.
 *   2. The desktop Reload/Restart endpoints, ported from
 *      `@moonsand/dsh-desktop-restart`. That code lives byte-identical in
 *      `./desktop-restart.host.js` — the Windows process-management rules in its
 *      header were measured on this machine and are not worth retyping.
 *
 * The ported routes deliberately keep the original `/desktop-restart` prefix, so
 * the standalone plugin must stay uninstalled: a second registration of the same
 * route path throws.
 */
import { apply as applyDesktopActions } from './desktop-restart.host.js'

/** The desktop endpoints need the web carrier. A profile without a web server has
 *  no web UI to theme either, so making it a hard dependency costs nothing real. */
export const inject = ['webServer']

export function apply(ctx) {
  applyDesktopActions(ctx)
}
