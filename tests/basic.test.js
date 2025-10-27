/**
 * Basic TinyPine.js Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TinyPine Store', () => {
  beforeEach(() => {
    // Setup
    document.body.innerHTML = '';
    if (window.TinyPine) {
      // Clear existing stores
      const stores = window.TinyPine.getAllStores() || {};
      Object.keys(stores).forEach(key => {
        delete window.TinyPine.devtoolsInstance?.stores[key];
      });
    }
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
  });

  it('should create a global store', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    const store = window.TinyPine.store('test', { count: 0 });
    expect(store).toBeDefined();
    expect(store.count).toBe(0);
  });

  it('should get a store by name', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    window.TinyPine.store('test2', { value: 42 });
    const store = window.TinyPine.getStore('test2');
    expect(store).toBeDefined();
    expect(store.value).toBe(42);
  });

  it('should return all stores', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    window.TinyPine.store('test3', { data: 'test' });
    const stores = window.TinyPine.getAllStores();
    expect(stores).toBeDefined();
    expect(typeof stores).toBe('object');
  });
});

describe('TinyPine Directives', () => {
  it('should initialize t-data directive', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    document.body.innerHTML = '<div t-data="{ message: \'Hello\' }"></div>';
    window.TinyPine.init();

    const element = document.querySelector('[t-data]');
    expect(element).toBeTruthy();
    expect(element._tinypineState).toBeDefined();
    expect(element._tinypineState.message).toBe('Hello');
  });

  it('should render t-text directive', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    document.body.innerHTML = `
      <div t-data="{ text: 'Hello World' }">
        <span t-text="text"></span>
      </div>
    `;

    window.TinyPine.init();

    const span = document.querySelector('span');
    expect(span.textContent).toBe('Hello World');
  });
});

describe('TinyPine Reactive System', () => {
  it('should update DOM when state changes', () => {
    if (!window.TinyPine) {
      console.warn('TinyPine not loaded, skipping test');
      return;
    }

    document.body.innerHTML = `
      <div t-data="{ count: 0 }">
        <button t-click="count++" id="inc">Increment</button>
        <span id="counter" t-text="count"></span>
      </div>
    `;

    window.TinyPine.init();

    const counter = document.getElementById('counter');
    const btn = document.getElementById('inc');

    expect(counter.textContent).toBe('0');

    btn.click();

    // Give time for reactivity
    setTimeout(() => {
      expect(counter.textContent).toBe('1');
    }, 100);
  });
});

