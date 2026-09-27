// ONE Store owns the outer WebView. The game only talks to its H5 SDK.
export function createOnestoreHost(sdk, root = document.documentElement) {
  let state = 'new';
  let paused = false;
  let silent = false;
  let hooks = {};
  let startPromise;

  const host = {
    get state() { return state; },
    get paused() { return paused; },
    get silent() { return silent; },
    get active() { return state === 'ready' || state === 'started'; },
    setHooks(next) {
      hooks = next;
      if (paused) hooks.pause?.();
      hooks.silent?.(silent);
    },
    async initialize() {
      if (!sdk) { state = 'unsupported'; return false; }
      if (state !== 'new') throw new Error('ONE Store SDK already initialized');
      // Register these before initializeAsync: the app may send an event immediately.
      sdk.on('pause', () => { paused = true; hooks.pause?.(); });
      sdk.on('resume', event => {
        if (typeof event?.ringerSilent === 'boolean') {
          silent = event.ringerSilent;
          hooks.silent?.(silent);
        }
        paused = false;
        hooks.resume?.();
      });
      sdk.on('exit', () => { hooks.exit?.(); });
      sdk.onBackPressed(() => hooks.back?.() === true);
      state = 'initializing';
      try {
        const info = await sdk.initializeAsync();
        if (info?.err) { state = 'unsupported'; return false; }
        silent = info.ringerSilent === true;
        const safe = info.safeArea || {};
        for (const side of ['top', 'right', 'bottom', 'left']) {
          const px = Number(safe[side]);
          root.style.setProperty(`--onestore-safe-${side}`, `${Number.isFinite(px) ? Math.max(0, px) : 0}px`);
        }
        state = 'ready';
        hooks.silent?.(silent);
        sdk.setLoadingProgress(0);
        return true;
      } catch (error) {
        state = 'error';
        throw error;
      }
    },
    progress(value) {
      if (state === 'ready') sdk.setLoadingProgress(Math.max(0, Math.min(100, value)));
    },
    start() {
      if (state === 'unsupported') return Promise.resolve(false);
      if (state === 'started') return Promise.resolve(true);
      if (state !== 'ready') return Promise.reject(new Error('ONE Store SDK is not ready'));
      startPromise ||= Promise.resolve().then(async () => {
        sdk.setLoadingProgress(100);
        await sdk.startGameAsync();
        state = 'started';
        return true;
      }).catch(error => { startPromise = undefined; throw error; });
      return startPromise;
    },
  };
  return host;
}
