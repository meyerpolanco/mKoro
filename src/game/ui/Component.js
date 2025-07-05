/**
 * Base class for UI components
 */
export class Component {
    constructor(gameClient) {
        this.gameClient = gameClient;
        this.element = null;
    }

    /**
     * Create the component's DOM element
     * @returns {HTMLElement} The created element
     */
    createElement() {
        throw new Error('createElement must be implemented by subclass');
    }

    /**
     * Mount the component to a parent element
     * @param {HTMLElement} parent - Parent element to mount to
     */
    mount(parent) {
        if (!this.element) {
            this.element = this.createElement();
        }
        parent.appendChild(this.element);
        this.onMount();
    }

    /**
     * Called after the component is mounted
     */
    onMount() {
        // Override in subclass if needed
    }

    /**
     * Update the component's display
     * @param {Object} gameState - Current game state
     */
    update(gameState) {
        // Override in subclass
    }

    /**
     * Remove the component from the DOM
     */
    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    /**
     * Create an element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Element attributes
     * @param {Array} children - Child elements or text
     * @returns {HTMLElement} The created element
     */
    createElement(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (child !== null && child !== undefined) {
                element.appendChild(document.createTextNode(child.toString()));
            }
        });
        
        return element;
    }

    /**
     * Create a button element
     * @param {string} text - Button text
     * @param {Function} onClick - Click handler
     * @param {Object} attrs - Additional attributes
     * @returns {HTMLElement} The created button
     */
    createButton(text, onClick, attrs = {}) {
        return this.createElement('button', {
            ...attrs,
            onClick: (e) => {
                e.preventDefault();
                onClick();
            }
        }, [text]);
    }

    /**
     * Create a div element
     * @param {Array} children - Child elements
     * @param {Object} attrs - Element attributes
     * @returns {HTMLElement} The created div
     */
    createDiv(children = [], attrs = {}) {
        return this.createElement('div', attrs, children);
    }

    /**
     * Show an element
     * @param {HTMLElement} element - Element to show
     */
    show(element) {
        if (element) {
            element.style.display = '';
        }
    }

    /**
     * Hide an element
     * @param {HTMLElement} element - Element to hide
     */
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Enable an element
     * @param {HTMLElement} element - Element to enable
     */
    enable(element) {
        if (element) {
            element.disabled = false;
        }
    }

    /**
     * Disable an element
     * @param {HTMLElement} element - Element to disable
     */
    disable(element) {
        if (element) {
            element.disabled = true;
        }
    }
} 