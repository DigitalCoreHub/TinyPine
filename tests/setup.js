/**
 * TinyPine Test Setup
 */

// Mock global objects
if (typeof global !== 'undefined') {
  global.window = global;
  global.document = {
    body: {
      innerHTML: '',
      querySelectorAll: () => [],
      querySelector: () => null,
      appendChild: () => {},
      removeChild: () => {},
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    readyState: 'complete',
    addEventListener: () => {},
    head: {
      appendChild: () => {},
    },
  };
  global.addEventListener = () => {};
  global.location = { hash: '' };

  // Load TinyPine global (ESM side-effects populate window.TinyPine)
  try {
    await import('../src/index.js');
  } catch (_) {
    // ignore if ESM not supported in test env
  }
}
