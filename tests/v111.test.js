import { describe, it, expect, beforeEach } from 'vitest';

describe('TinyPine v1.1.1 - Sprout Support', () => {
  beforeEach(() => {
    // reset DOM
    if (global.document && document.body) {
      document.body.innerHTML = '';
    }
  });

  it('exposes start(), mode, onMount, on/off/emit', () => {
    expect(typeof window.TinyPine.start).toBe('function');
    expect(typeof window.TinyPine.on).toBe('function');
    expect(typeof window.TinyPine.off).toBe('function');
    expect(typeof window.TinyPine.emit).toBe('function');
    expect(['default','lite']).toContain(window.TinyPine.mode);
  });

  it('onMount() fires after start()', () => {
    const calls = [];
    window.TinyPine.onMount(() => calls.push('mounted'));
    window.TinyPine.start();
    expect(calls.includes('mounted')).toBe(true);
  });

  it('event bus: on("directive:click") receives emitted events', () => {
    let received = 0;
    const off = window.TinyPine.on('directive:click', () => { received++; });
    window.TinyPine.emit('directive:click', null, {});
    off && off();
    expect(received).toBe(1);
  });

  it('lite mode disables heavy modules (no-ops)', () => {
    window.TinyPine.mode = 'lite';
    window.TinyPine.start();
    // store APIs become no-ops/undefined
    expect(typeof window.TinyPine.store).toBe('function');
    expect(window.TinyPine.getStore('any')).toBeUndefined();
    const unwatch = window.TinyPine.watch('a.b', () => {});
    expect(typeof unwatch).toBe('function');
  });

  it('safe mode flag is enabled with start({ safe: true })', () => {
    window.TinyPine.mode = 'default';
    window.TinyPine.start(undefined, { safe: true });
    expect(!!window.TinyPine._safeMode).toBe(true);
  });

  it('debugOptions.silent flag exists (log suppression toggle)', () => {
    // In core, debug is a boolean accessor; silent lives separately
    expect(typeof window.TinyPine.debugOptions).toBe('object');
    expect(typeof window.TinyPine.debugOptions.silent).toBe('boolean');
  });
});


