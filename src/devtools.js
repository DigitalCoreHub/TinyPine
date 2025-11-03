/**
 * TinyPine DevTools & Inspector
 * Live debugging, store inspection, timeline, and performance tracking
 */

/**
 * DevTools API for live debugging and inspection
 */
if (typeof window !== "undefined") {
    window.TinyPine.devtools = function (options = {}) {
        const config = {
            position: options.position || "bottom-right",
            theme: options.theme || "dark",
            enabled: true,
        };

        // Initialize DevTools panel
        if (!window.TinyPine.devtoolsInstance) {
            window.TinyPine.devtoolsInstance = {
                config,
                panel: null,
                events: [],
                stores: {},
                contexts: [],
                performance: {
                    renders: [],
                    diffs: [],
                },
            };
        }

        // Create panel HTML
        const panel = createDevToolsPanel(config);
        document.body.appendChild(panel);
        window.TinyPine.devtoolsInstance.panel = panel;

        // Start tracking stores and contexts
        setTimeout(() => {
            updateDevToolsStores();
            updateDevToolsContexts();
            startDevToolsTimeline();
        }, 100);

        // Update panels periodically
        setInterval(() => {
            updateDevToolsStores();
            updateDevToolsContexts();
        }, 1000);

        if (debugMode) {
            console.log(
                "[TinyPine][DevTools] Initialized (" + config.position + ")"
            );
        }
    };

    // Initialize debug utilities object if not exists
    if (!window.TinyPine.debug || typeof window.TinyPine.debug !== "object") {
        window.TinyPine.debug = {};
    }

    // Extended debug utilities
    window.TinyPine.debug.log = function (message, data) {
        console.log("[TinyPine][Debug]", message, data || "");
        if (window.TinyPine.devtoolsInstance) {
            addDevToolsEvent("[Debug]", message);
        }
    };

    window.TinyPine.debug.inspect = function (obj) {
        console.log("[TinyPine][Inspect]", obj);
        return obj;
    };
}

/**
 * Create DevTools panel overlay
 */
function createDevToolsPanel(config) {
    const panel = document.createElement("div");
    panel.id = "tinypine-devtools";
    panel.innerHTML = `
        <div class="devtools-header">
            <span class="devtools-title">🌲 TinyPine DevTools</span>
            <button class="devtools-close">&times;</button>
        </div>
        <div class="devtools-content">
            <div class="devtools-tabs">
                <button class="devtools-tab active" data-tab="stores">Stores</button>
                <button class="devtools-tab" data-tab="contexts">Contexts</button>
                <button class="devtools-tab" data-tab="timeline">Timeline</button>
                <button class="devtools-tab" data-tab="performance">Performance</button>
            </div>
            <div class="devtools-body">
                <div class="devtools-panel active" data-panel="stores">
                    <div class="devtools-stores" id="devtools-stores-list"></div>
                </div>
                <div class="devtools-panel" data-panel="contexts">
                    <div class="devtools-contexts" id="devtools-contexts-list"></div>
                </div>
                <div class="devtools-panel" data-panel="timeline">
                    <div class="devtools-timeline" id="devtools-timeline-list"></div>
                </div>
                <div class="devtools-panel" data-panel="performance">
                    <div class="devtools-performance" id="devtools-performance-list"></div>
                </div>
            </div>
        </div>
    `;

    // Apply theme
    panel.className = `devtools-panel-${config.theme}`;
    panel.style.position = "fixed";

    // Position handling
    const positions = {
        "bottom-right": { bottom: "20px", right: "20px" },
        "bottom-left": { bottom: "20px", left: "20px" },
        "top-right": { top: "20px", right: "20px" },
        "top-left": { top: "20px", left: "20px" },
    };

    Object.assign(
        panel.style,
        positions[config.position] || positions["bottom-right"]
    );
    panel.style.zIndex = "99999";
    panel.style.width = "400px";
    panel.style.maxHeight = "500px";
    panel.style.border = "1px solid #666";
    panel.style.borderRadius = "8px";
    panel.style.overflow = "hidden";
    panel.style.backgroundColor =
        config.theme === "dark" ? "#1e1e1e" : "#ffffff";
    panel.style.color = config.theme === "dark" ? "#e0e0e0" : "#000";
    panel.style.fontFamily = "monospace";
    panel.style.fontSize = "12px";

    // Tab switching
    panel.querySelectorAll(".devtools-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const tabName = tab.dataset.tab;
            panel
                .querySelectorAll(".devtools-tab")
                .forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            panel
                .querySelectorAll(".devtools-panel")
                .forEach((p) => p.classList.remove("active"));
            panel
                .querySelector(`[data-panel="${tabName}"]`)
                .classList.add("active");
        });
    });

    // Close button
    panel.querySelector(".devtools-close").addEventListener("click", () => {
        panel.style.display = "none";
    });

    // Add inline styles
    const style = document.createElement("style");
    style.textContent = `
        #tinypine-devtools .devtools-header {
            background: ${config.theme === "dark" ? "#2d2d2d" : "#f5f5f5"};
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        #tinypine-devtools .devtools-title {
            font-weight: bold;
        }
        #tinypine-devtools .devtools-close {
            background: none;
            border: none;
            color: ${config.theme === "dark" ? "#e0e0e0" : "#000"};
            cursor: pointer;
            font-size: 20px;
            padding: 0;
            width: 24px;
            height: 24px;
        }
        #tinypine-devtools .devtools-tabs {
            display: flex;
            border-bottom: 1px solid ${
                config.theme === "dark" ? "#444" : "#ddd"
            };
        }
        #tinypine-devtools .devtools-tab {
            flex: 1;
            padding: 8px;
            border: none;
            background: ${config.theme === "dark" ? "#2d2d2d" : "#f5f5f5"};
            color: ${config.theme === "dark" ? "#e0e0e0" : "#000"};
            cursor: pointer;
            font-size: 11px;
        }
        #tinypine-devtools .devtools-tab.active {
            background: ${config.theme === "dark" ? "#3d3d3d" : "#fff"};
            border-bottom: 2px solid ${
                config.theme === "dark" ? "#007acc" : "#007acc"
            };
        }
        #tinypine-devtools .devtools-body {
            max-height: 350px;
            overflow-y: auto;
        }
        #tinypine-devtools .devtools-panel {
            display: none;
            padding: 12px;
        }
        #tinypine-devtools .devtools-panel.active {
            display: block;
        }
        #tinypine-devtools .devtools-item {
            padding: 4px 0;
            border-bottom: 1px solid ${
                config.theme === "dark" ? "#333" : "#eee"
            };
        }
        #tinypine-devtools .devtools-key {
            color: ${config.theme === "dark" ? "#9cdcfe" : "#0451a5"};
        }
        #tinypine-devtools .devtools-value {
            color: ${config.theme === "dark" ? "#ce9178" : "#0000ff"};
        }
    `;
    document.head.appendChild(style);

    return panel;
}

/**
 * Update DevTools stores panel
 */
function updateDevToolsStores() {
    if (!window.TinyPine.devtoolsInstance) return;
    const list = document.getElementById("devtools-stores-list");
    if (!list) return;

    const stores = window.TinyPine.getAllStores?.() || {};
    const html = Object.keys(stores)
        .map((storeName) => {
            const store = stores[storeName];
            const data = JSON.stringify(store, null, 2);
            return `<div class="devtools-item">
            <div class="devtools-key">${storeName}</div>
            <pre class="devtools-value" style="font-size: 10px; margin-top: 4px;">${data}</pre>
        </div>`;
        })
        .join("");

    list.innerHTML =
        html || '<div style="padding: 12px; color: #888;">No stores</div>';
}

/**
 * Update DevTools contexts panel
 */
function updateDevToolsContexts() {
    if (!window.TinyPine.devtoolsInstance) return;
    const list = document.getElementById("devtools-contexts-list");
    if (!list) return;

    const contexts = document.querySelectorAll("[t-data]");
    const html = Array.from(contexts)
        .map((ctx, index) => {
            try {
                const state = ctx._tinypineState || {};
                // Remove internal properties to avoid circular reference
                const cleanState = Object.keys(state).reduce((acc, key) => {
                    if (!key.startsWith("_tinypine")) {
                        acc[key] = state[key];
                    }
                    return acc;
                }, {});
                const data = JSON.stringify(cleanState, null, 2);
                return `<div class="devtools-item">
                <div class="devtools-key">Context #${index + 1}</div>
                <pre class="devtools-value" style="font-size: 10px; margin-top: 4px;">${data}</pre>
            </div>`;
            } catch (e) {
                return `<div class="devtools-item">
                <div class="devtools-key">Context #${index + 1}</div>
                <div class="devtools-value">Error: ${e.message}</div>
            </div>`;
            }
        })
        .join("");

    list.innerHTML =
        html || '<div style="padding: 12px; color: #888;">No contexts</div>';
}

/**
 * Start DevTools timeline tracking
 */
function startDevToolsTimeline() {
    if (!window.TinyPine.devtoolsInstance) return;

    // Track all TinyPine console logs
    const originalLog = console.log;
    console.log = function (...args) {
        originalLog.apply(console, args);
        if (
            args[0] &&
            typeof args[0] === "string" &&
            args[0].includes("[TinyPine]")
        ) {
            const timestamp = new Date().toLocaleTimeString();
            window.TinyPine.devtoolsInstance.events.push({
                text: `<small style="color: #888;">${timestamp}</small> ${args.join(
                    " "
                )}`,
                timestamp,
            });
        }
    };

    // Update timeline UI periodically
    setInterval(() => {
        const list = document.getElementById("devtools-timeline-list");
        if (!list) return;

        const events = window.TinyPine.devtoolsInstance.events.slice(-10);
        const html = events
            .map((event) => `<div class="devtools-item">${event.text}</div>`)
            .join("");

        list.innerHTML =
            html || '<div style="padding: 12px; color: #888;">No events</div>';
    }, 500);

    // Update performance panel periodically
    setInterval(() => {
        const list = document.getElementById("devtools-performance-list");
        if (!list) return;

        const perf = window.TinyPine.devtoolsInstance.performance;
        const avgRender =
            perf.renders.length > 0
                ? (
                      perf.renders.reduce((a, b) => a + b, 0) /
                      perf.renders.length
                  ).toFixed(2)
                : "0";
        const avgDiff =
            perf.diffs.length > 0
                ? (
                      perf.diffs.reduce((a, b) => a + b, 0) / perf.diffs.length
                  ).toFixed(2)
                : "0";

        const html = `
            <div class="devtools-item">
                <strong>Renders:</strong> ${perf.renders.length} (avg: ${avgRender}ms)
            </div>
            <div class="devtools-item">
                <strong>Diffs:</strong> ${perf.diffs.length} (avg: ${avgDiff}ms)
            </div>
        `;

        list.innerHTML = html;
    }, 1000);
}

/**
 * Add event to DevTools timeline
 */
function addDevToolsEvent(category, data) {
    if (!window.TinyPine.devtoolsInstance) return;

    const timestamp = new Date().toLocaleTimeString();
    const text = `<small style="color: #888;">${timestamp}</small> ${category}`;

    window.TinyPine.devtoolsInstance.events.push({ text, data, timestamp });
}
