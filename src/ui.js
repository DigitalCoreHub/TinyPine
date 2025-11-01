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

    // Field Wrapper Component (v1.3.0)
    window.TinyPine.component('tp-field', {
        mounted(el) {
            const label = el.getAttribute('label') || '';
            const helper = el.getAttribute('helper') || '';
            const error = el.getAttribute('error') || '';
            const required = el.hasAttribute('required');
            const userClass = el.getAttribute('class') || '';

            const baseClasses = [
                'tp-field',
                'mb-4'
            ].filter(Boolean).join(' ');

            el.setAttribute('class', `${baseClasses} ${userClass}`);

            // Create field structure
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'w-full';

            // Label
            if (label) {
                const labelEl = document.createElement('label');
                labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
                labelEl.textContent = label;
                if (required) {
                    const asterisk = document.createElement('span');
                    asterisk.className = 'text-red-500 ml-1';
                    asterisk.textContent = '*';
                    labelEl.appendChild(asterisk);
                }
                fieldWrapper.appendChild(labelEl);
            }

            // Input container
            const inputContainer = document.createElement('div');
            inputContainer.className = 'relative';
            while (el.firstChild) {
                inputContainer.appendChild(el.firstChild);
            }
            fieldWrapper.appendChild(inputContainer);

            // Helper text
            if (helper && !error) {
                const helperEl = document.createElement('p');
                helperEl.className = 'mt-1 text-xs text-gray-500 dark:text-gray-400';
                helperEl.textContent = helper;
                fieldWrapper.appendChild(helperEl);
            }

            // Error message
            if (error) {
                const errorEl = document.createElement('p');
                errorEl.className = 'mt-1 text-xs text-red-600 dark:text-red-400';
                errorEl.textContent = error;
                fieldWrapper.appendChild(errorEl);
            }

            el.innerHTML = '';
            el.appendChild(fieldWrapper);
        }
    });

    // Input Component (v1.3.0)
    window.TinyPine.component('tp-input', {
        mounted(el) {
            const size = el.getAttribute('size') || 'md';
            const icon = el.getAttribute('icon');
            const placeholder = el.getAttribute('placeholder') || '';
            const state = el.getAttribute('state'); // "error" or "valid"
            const type = el.getAttribute('type') || 'text';
            const userClass = el.getAttribute('class') || '';

            const baseClasses = [
                'tp-input',
                'w-full rounded-lg border outline-none',
                'transition duration-200 ease-in-out',
                'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
                'border-gray-300 dark:border-gray-700',
                'focus:ring-2 focus:ring-green-500 focus:border-green-500',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500'
            ].filter(Boolean);

            const sizeClasses = {
                sm: 'text-sm px-3 py-2',
                md: 'text-base px-4 py-2.5',
                lg: 'text-lg px-5 py-3'
            };

            const stateClasses = {
                error: 'border-red-500 focus:ring-red-400 focus:border-red-500',
                valid: 'border-green-500 focus:ring-green-400 focus:border-green-500'
            };

            // Build final class list
            const finalClasses = [
                ...baseClasses,
                sizeClasses[size] || sizeClasses.md,
                state ? stateClasses[state] : ''
            ].filter(Boolean).join(' ');

            // Create input element
            const input = document.createElement('input');
            input.type = type;
            input.placeholder = placeholder;
            input.className = `${finalClasses} ${userClass}`;

            // Copy all attributes except processed ones
            Array.from(el.attributes).forEach(attr => {
                if (!['size', 'icon', 'state', 'class'].includes(attr.name)) {
                    input.setAttribute(attr.name, attr.value);
                }
            });

            // Icon support
            if (icon) {
                const wrapper = document.createElement('div');
                wrapper.className = 'relative w-full';

                const iconEl = document.createElement('span');
                iconEl.className = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500';

                // Icon map
                const iconMap = {
                    mail: '📧',
                    user: '👤',
                    lock: '🔒',
                    search: '🔍',
                    phone: '📞',
                    calendar: '📅',
                    location: '📍',
                    link: '🔗'
                };
                iconEl.textContent = iconMap[icon] || '';

                wrapper.appendChild(iconEl);
                wrapper.appendChild(input);
                input.classList.add('pl-10');

                el.replaceWith(wrapper);
            } else {
                el.replaceWith(input);
            }

            // Store reference for t-model
            if (el._context) {
                input._context = el._context;
            }
        }
    });

    // Checkbox Component (v1.3.0)
    window.TinyPine.component('tp-checkbox', {
        mounted(el) {
            const label = el.getAttribute('label') || '';
            const userClass = el.getAttribute('class') || '';
            const disabled = el.hasAttribute('disabled');

            const wrapper = document.createElement('label');
            wrapper.className = `tp-checkbox-wrapper flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} select-none ${userClass}`;

            // Create checkbox input
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'tp-checkbox w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 dark:bg-gray-800 dark:border-gray-600';

            if (disabled) {
                input.disabled = true;
            }

            // Copy t-model and other attributes
            Array.from(el.attributes).forEach(attr => {
                if (!['label', 'class', 'disabled'].includes(attr.name)) {
                    input.setAttribute(attr.name, attr.value);
                }
            });

            // Label text
            if (label) {
                const span = document.createElement('span');
                span.className = 'text-sm text-gray-800 dark:text-gray-200';
                span.textContent = label;
                wrapper.appendChild(input);
                wrapper.appendChild(span);
            } else {
                wrapper.appendChild(input);
            }

            el.replaceWith(wrapper);

            // Store reference for t-model
            if (el._context) {
                input._context = el._context;
            }
        }
    });

    // File Upload Component (v1.3.0)
    window.TinyPine.component('tp-file-upload', {
        mounted(el) {
            const accept = el.getAttribute('accept') || '*';
            const multiple = el.hasAttribute('multiple');
            const maxSize = el.getAttribute('max-size'); // in MB
            const userClass = el.getAttribute('class') || '';

            const wrapper = document.createElement('div');
            wrapper.className = `tp-file-upload border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${userClass}`;

            const content = document.createElement('div');
            content.className = 'flex flex-col items-center justify-center';

            const icon = document.createElement('div');
            icon.className = 'text-4xl mb-2';
            icon.textContent = '📁';
            content.appendChild(icon);

            const label = document.createElement('p');
            label.className = 'text-sm text-gray-600 dark:text-gray-300 mb-1';
            label.innerHTML = '<span class="font-medium text-green-600 dark:text-green-400">Click to upload</span> or drag and drop';
            content.appendChild(label);

            const hint = document.createElement('p');
            hint.className = 'text-xs text-gray-500 dark:text-gray-400';
            hint.textContent = accept === 'image/*' ? 'PNG, JPG, GIF up to 10MB' : 'Any file type';
            content.appendChild(hint);

            wrapper.appendChild(content);

            // Hidden input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.className = 'hidden';
            if (multiple) {
                input.multiple = true;
            }

            // Copy t-model and other attributes
            Array.from(el.attributes).forEach(attr => {
                if (!['accept', 'multiple', 'max-size', 'class'].includes(attr.name)) {
                    input.setAttribute(attr.name, attr.value);
                }
            });

            wrapper.appendChild(input);

            // Preview container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'mt-4 hidden';
            wrapper.appendChild(previewContainer);

            // Click to upload
            wrapper.addEventListener('click', (e) => {
                if (e.target !== input) {
                    input.click();
                }
            });

            // Drag & drop
            wrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                wrapper.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
            });

            wrapper.addEventListener('dragleave', () => {
                wrapper.classList.remove('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
            });

            wrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                wrapper.classList.remove('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    handleFiles(files);
                }
            });

            // File change handler
            input.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    handleFiles(files);
                }
            });

            function handleFiles(files) {
                previewContainer.innerHTML = '';
                previewContainer.classList.remove('hidden');

                Array.from(files).forEach(file => {
                    // Check file size
                    if (maxSize && file.size > maxSize * 1024 * 1024) {
                        alert(`File ${file.name} is too large. Max size: ${maxSize}MB`);
                        return;
                    }

                    const fileItem = document.createElement('div');
                    fileItem.className = 'flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded mt-2';

                    // Image preview
                    if (file.type.startsWith('image/')) {
                        const preview = document.createElement('img');
                        preview.className = 'w-16 h-16 object-cover rounded';
                        preview.src = URL.createObjectURL(file);
                        fileItem.appendChild(preview);
                    } else {
                        const fileIcon = document.createElement('div');
                        fileIcon.className = 'w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-2xl';
                        fileIcon.textContent = '📄';
                        fileItem.appendChild(fileIcon);
                    }

                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'flex-1 text-left';
                    const fileName = document.createElement('p');
                    fileName.className = 'text-sm font-medium text-gray-800 dark:text-gray-200 truncate';
                    fileName.textContent = file.name;
                    const fileSize = document.createElement('p');
                    fileSize.className = 'text-xs text-gray-500 dark:text-gray-400';
                    fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
                    fileInfo.appendChild(fileName);
                    fileInfo.appendChild(fileSize);
                    fileItem.appendChild(fileInfo);

                    previewContainer.appendChild(fileItem);
                });
            }

            el.replaceWith(wrapper);

            // Store reference for t-model
            if (el._context) {
                input._context = el._context;
            }
        }
    });
}

