/**
 * TinyPine.js v0.1.0
 * Minimal, comfortable & intuitive reactive micro-framework
 */

// Initialize TinyPine when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.TinyPine.init();
        });
    } else {
        window.TinyPine.init();
    }
}

export default window.TinyPine;
