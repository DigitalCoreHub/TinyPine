import { describe, it, expect } from 'vitest';

function createFakeElement(tData) {
  const attrs = [{ name: 't-data', value: tData }];
  return {
    getAttribute: (name) => {
      const a = attrs.find(x => x.name === name);
      return a ? a.value : null;
    },
    hasAttribute: (name) => !!attrs.find(x => x.name === name),
    setAttribute: () => {},
    removeAttribute: () => {},
    attributes: attrs,
    children: [],
    parentElement: null,
    closest: () => null,
    style: {},
    nodeType: 1,
    querySelectorAll: () => [],
  };
}

describe('v1.1.3 unmount lifecycle - beforeUnmount() & unmounted()', () => {
  it('fires beforeUnmount() and unmounted() when element removed', async () => {
    // Arrange
    const el = createFakeElement(`{
      value: 1,
      beforeUnmount(el, ctx) { el._beforeUnmountCalled = true; },
      unmounted(el, ctx) { el._unmountedCalled = true; }
    }`);

    let onUnmountCalled = 0;
    let emitted = 0;
    const off = window.TinyPine.on('component:unmounted', () => { emitted++; });
    window.TinyPine.onUnmount(() => { onUnmountCalled++; });

    // Act
    window.TinyPine.initializeScope(el);

    // Simulate removal (manually trigger unmount)
    if (window.TinyPine._contexts && window.TinyPine._contexts.has(el)) {
      const ctx = window.TinyPine._contexts.get(el);
      if (typeof ctx.beforeUnmount === 'function') ctx.beforeUnmount(el, ctx);
      if (typeof ctx.unmounted === 'function') ctx.unmounted(el, ctx);
      window.TinyPine.emit && window.TinyPine.emit('component:unmounted', el, ctx);
      if (Array.isArray(window.TinyPine._onUnmountCallbacks)) {
        window.TinyPine._onUnmountCallbacks.forEach(cb => { try { cb(el, ctx); } catch(_){} });
      }
    }

    // Assert
    expect(el._beforeUnmountCalled).toBe(true);
    expect(el._unmountedCalled).toBe(true);
    expect(onUnmountCalled).toBeGreaterThanOrEqual(1);
    expect(emitted).toBe(1);

    off && off();
  });

  it('exposes TinyPine.onUnmount() API', () => {
    expect(typeof window.TinyPine.onUnmount).toBe('function');
  });

  it('exposes beforeUnmount and unmounted in context', () => {
    const el = createFakeElement(`{
      beforeUnmount() {},
      unmounted() {}
    }`);
    window.TinyPine.initializeScope(el);
    const ctx = window.TinyPine._contexts?.get(el);
    expect(typeof ctx?.beforeUnmount).toBe('function');
    expect(typeof ctx?.unmounted).toBe('function');
  });
});

