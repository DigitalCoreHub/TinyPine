/**
 * TinyPine UI Components
 * Tailwind CSS-based prop-driven UI components for TinyPine.js
 */

if (typeof window !== 'undefined' && window.TinyPine) {
    // Button Component
    window.TinyPine.component('tp-button', {
        mounted(el) {
            const color = el.getAttribute('color') || 'primary';
            const size = el.getAttribute('size') || 'md';
            const icon = el.getAttribute('icon');
            const type = el.getAttribute('type') || 'button';
            const userClass = el.getAttribute('class') || '';
            const userStyle = el.getAttribute('style') || '';

            const colorClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                outline: 'border border-gray-400 text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            };

            const sizeClasses = {
                sm: 'text-sm px-3 py-1.5',
                md: 'text-base px-4 py-2',
                lg: 'text-lg px-5 py-3'
            };

            const baseClasses = [
                'tp-button',
                'inline-flex items-center justify-center rounded-lg font-medium',
                'transition duration-200 ease-in-out',
                'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size] || sizeClasses.md,
                colorClasses[color] || colorClasses.primary
            ].filter(Boolean).join(' ');

            // Merge classes: base + user classes
            const finalClasses = userClass ? `${baseClasses} ${userClass}` : baseClasses;
            el.setAttribute('class', finalClasses);
            el.setAttribute('type', type);

            // Apply inline styles if provided
            if (userStyle) {
                el.setAttribute('style', userStyle);
            }

            // Icon support
            if (icon) {
                const iconEl = document.createElement('span');
                iconEl.className = `tp-icon tp-icon-${icon} mr-2`;
                // Simple icon support - can be extended with SVG/iconset
                const iconMap = {
                    check: '✓',
                    plus: '+',
                    minus: '−',
                    close: '×',
                    arrow: '→',
                    star: '★'
                };
                iconEl.textContent = iconMap[icon] || '';
                if (el.firstChild) {
                    el.insertBefore(iconEl, el.firstChild);
                } else {
                    el.appendChild(iconEl);
                }
            }

            // Theme adaptation
            if (window.TinyPine.theme === 'dark') {
                el.classList.add('dark:bg-gray-800', 'dark:text-white', 'dark:hover:bg-gray-700', 'dark:border-gray-600');
            }
        }
    });

    // Modal Component
    window.TinyPine.component('tp-modal', {
        mounted(el) {
            const title = el.getAttribute('title') || '';
            const userClass = el.getAttribute('class') || '';

            const baseClasses = [
                'tp-modal',
                'fixed inset-0 z-50 flex items-center justify-center',
                'bg-black bg-opacity-50 transition-opacity',
                'p-4'
            ].filter(Boolean).join(' ');

            el.setAttribute('class', `${baseClasses} ${userClass}`);

            // Create modal structure
            const modalContent = document.createElement('div');
            modalContent.className = 'tp-modal-content bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative transform transition-all';

            if (title) {
                const titleEl = document.createElement('h3');
                titleEl.className = 'text-xl font-semibold mb-4';
                titleEl.textContent = title;
                modalContent.appendChild(titleEl);
            }

            // Move existing content to modal body
            const modalBody = document.createElement('div');
            modalBody.className = 'tp-modal-body';
            while (el.firstChild && el.firstChild !== modalContent) {
                const child = el.firstChild;
                if (child.tagName !== 'SCRIPT') {
                    modalBody.appendChild(child);
                } else {
                    el.removeChild(child);
                }
            }
            modalContent.appendChild(modalBody);

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => {
                el.style.display = 'none';
            };
            modalContent.appendChild(closeBtn);

            el.innerHTML = '';
            el.appendChild(modalContent);

            // Close on backdrop click
            el.onclick = (e) => {
                if (e.target === el) {
                    el.style.display = 'none';
                }
            };
        }
    });

    // Card Component
    window.TinyPine.component('tp-card', {
        mounted(el) {
            const title = el.getAttribute('title') || '';
            const userClass = el.getAttribute('class') || '';

            const baseClasses = [
                'tp-card',
                'bg-white rounded-lg shadow-md p-6',
                'border border-gray-200'
            ].filter(Boolean).join(' ');

            el.setAttribute('class', `${baseClasses} ${userClass}`);

            // Create card structure
            const cardContent = document.createElement('div');

            if (title) {
                const titleEl = document.createElement('h3');
                titleEl.className = 'text-lg font-semibold mb-4';
                titleEl.textContent = title;
                cardContent.appendChild(titleEl);
            }

            // Move existing content to card body
            const cardBody = document.createElement('div');
            cardBody.className = 'tp-card-body';
            while (el.firstChild) {
                const child = el.firstChild;
                if (child.tagName !== 'SCRIPT') {
                    cardBody.appendChild(child);
                } else {
                    el.removeChild(child);
                }
            }
            cardContent.appendChild(cardBody);

            el.innerHTML = '';
            el.appendChild(cardContent);

            // Theme adaptation
            if (window.TinyPine.theme === 'dark') {
                el.classList.add('dark:bg-gray-800', 'dark:text-white', 'dark:border-gray-700');
            }
        }
    });
}

