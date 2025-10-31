import { describe, it, expect } from 'vitest';

function createFakeElement(tData) {
  const attrs = [
    { name: 't-data', value: tData }
  ];
  return {
    // minimal DOM API used by core
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
  };
}

describe('v1.1.2 lifecycle - mounted()', () => {
  it('fires mounted(el, ctx) once and triggers global onMount + event', async () => {
    // Arrange
    const el = createFakeElement(`{ value: 1, mounted(el, ctx) { el._mountedCalled = true; } }`);

    let onMountCalled = 0;
    let emitted = 0;
    const off = window.TinyPine.on('component:mounted', () => { emitted++; });
    window.TinyPine.onMount(() => { onMountCalled++; });

    // Act
    window.TinyPine.initializeScope(el);

    await new Promise(r => setTimeout(r, 0));

    // Assert
    expect(el._mountedCalled).toBe(true);
    expect(onMountCalled).toBe(1);
    expect(emitted).toBe(1);

    off && off();
  });
});


