/**
 * TinyPine Test Setup
 */

// Mock global objects
if (typeof global !== 'undefined') {
  global.window = global;
  global.document = {
    body: {
      innerHTML: '',
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
}
