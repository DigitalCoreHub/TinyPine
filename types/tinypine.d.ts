/**
 * TinyPine.js Type Definitions
 * Minimal reactive micro-framework for building interactive UIs
 */

export interface TinyPineConfig {
  debug?: boolean;
}

export interface DevToolsConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light';
  enabled?: boolean;
}

export interface Store {
  [key: string]: any;
}

export interface RouterConfig {
  default?: string;
  onChange?: (route: string) => void;
}

export interface I18nConfig {
  [language: string]: {
    [key: string]: string;
  };
}

export interface I18nOptions {
  default?: string;
  cache?: boolean;
  onChange?: (lang: string) => void;
}

export interface TransitionConfig {
  enter?: string;
  leave?: string;
  active?: string;
  duration?: number;
}

export interface Plugin {
  install?: (TinyPine: typeof TinyPine) => void;
}

/**
 * Core TinyPine API
 */
declare class TinyPine {
  static debug: boolean;
  static version: string;

  /**
   * Initialize TinyPine and scan the DOM for t-* directives
   */
  static init(config?: TinyPineConfig): void;

  /**
   * Create a global reactive store
   * @example TinyPine.store('auth', { user: 'admin', loggedIn: true })
   */
  static store(name: string, data: any): any;

  /**
   * Get a global store by name
   * @example const auth = TinyPine.getStore('auth')
   */
  static getStore(name: string): any;

  /**
   * Get all global stores
   * @example const stores = TinyPine.getAllStores()
   */
  static getAllStores(): Record<string, any>;

  /**
   * Watch a reactive path for changes
   * @example TinyPine.watch('auth.user', (newVal, oldVal, path) => console.log(path, newVal))
   */
  static watch(path: string, callback: (newVal: any, oldVal: any, path: string) => void): () => void;

  /**
   * Enable DevTools overlay
   * @example TinyPine.devtools({ position: 'bottom-right', theme: 'dark' })
   */
  static devtools(options?: DevToolsConfig): void;

  /**
   * Register a custom directive
   * @example TinyPine.directive('t-focus', (el, expr, state) => el.focus())
   */
  static directive(name: string, handler: Function): void;

  /**
   * Register a plugin
   * @example TinyPine.use(myPlugin)
   */
  static use(plugin: Plugin | Function): void;

  /**
   * Create a transition preset
   * @example TinyPine.transition('fade', { enter: 'fade-enter', leave: 'fade-leave', duration: 300 })
   */
  static transition(name: string, config: TransitionConfig): void;

  /**
   * Initialize the router
   * @example TinyPine.router({ default: 'home', onChange: (route) => console.log(route) })
   */
  static router(config?: RouterConfig): {
    navigate: (route: string) => void;
    getCurrent: () => string;
  };

  /**
   * Initialize i18n system
   * @example TinyPine.i18n({ en: { hello: 'Hello' }, tr: { hello: 'Merhaba' } }, { default: 'en' })
   */
  static i18n(languages: I18nConfig, options?: I18nOptions): void;

  /**
   * Load locale data from a URL
   * @example TinyPine.loadLocale('tr', '/locales/tr.json')
   */
  static loadLocale(lang: string, url: string): Promise<void>;

  /**
   * Cache API responses
   * @example const cached = TinyPine.cache('users', () => fetch('/api/users'))
   */
  static cache(key: string, fetcher: () => Promise<any>, ttl?: number): Promise<any>;
}

/**
 * Global debug utilities
 */
declare namespace TinyPine {
  namespace debug {
    /**
     * Log a custom debug message
     * @example TinyPine.debug.log('Custom event triggered')
     */
    function log(message: string, data?: any): void;

    /**
     * Inspect an object in the console
     * @example TinyPine.debug.inspect($store.auth)
     */
    function inspect(obj: any): any;
  }
}

/**
 * Global reactive variable
 */
declare var $lang: string;

export default TinyPine;

