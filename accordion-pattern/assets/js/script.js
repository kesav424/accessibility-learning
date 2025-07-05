class Accordion {
    constructor(domNode) {
        this.rootEl = domNode;
        this.buttonElem = this.rootEl.querySelector('button[aria-expanded]');
        const controlsId = this.buttonElem.getAttribute('aria-controls');
        this.contentEl = document.getElementById(controlsId);
        this.open = this.buttonElem.getAttribute('aria-expanded') === 'true';

        // Add click listener for toggling the accordion
        this.buttonElem.addEventListener('click', this.onButtonClick.bind(this));
    }

    onButtonClick() {
        this.toggle(!this.open);
    }

    toggle(open) {
        // Don't do anything if the open state doesn't change
        if (open === this.open) {
            return;
        }

        this.open = open;
        // Handle DOM updates
        this.buttonElem.setAttribute('aria-expanded', `${open}`);

        if (open) {


            this.contentEl.removeAttribute('hidden');
            this.contentEl.style.setProperty('--acc-height', `${this.contentEl.scrollHeight}px`)
            this.contentEl.classList.add('open')


        } else {

            this.contentEl.classList.remove('open')
            this.contentEl.style.setProperty('--acc-height', `${this.contentEl.scrollHeight}px`)

            const transitionEndHandler = () => {
                this.contentEl.setAttribute('hidden', '');
            }
            this.contentEl.addEventListener('transitionend', transitionEndHandler, { once: true });
        }
    }

    // Add public open and close methods for convenience
    openAccordion() { // Renamed to avoid conflict with 'open' property
        this.toggle(true);
    }

    closeAccordion() { // Renamed to avoid conflict with 'open' property
        this.toggle(false);
    }
}

// --- Keyboard Navigation Management ---

// A class to manage the group of accordions for keyboard navigation
class AccordionGroup {
    constructor(groupDomNode) {
        this.groupEl = groupDomNode;
        this.accordions = []; // Stores instances of Accordion
        this.initAccordions();
        this.groupEl.addEventListener('keydown', this.onKeydown.bind(this));
    }

    initAccordions() {
        // Select all accordion h3 elements within this group
        const accordionHeaders = this.groupEl.querySelectorAll('.accordion h3');
        accordionHeaders.forEach((headerEl) => {
            const accordion = new Accordion(headerEl);
            this.accordions.push(accordion);
        });
    }

    onKeydown(event) {
        const targetButton = event.target.closest('button[aria-expanded]');

        // If the focused element is not an accordion button, do nothing
        if (!targetButton) {
            return;
        }

        const currentAccordionIndex = this.accordions.findIndex(
            (accordion) => accordion.buttonElem === targetButton
        );

        if (currentAccordionIndex === -1) {
            return; // Should not happen if targetButton is valid
        }

        let nextIndex = currentAccordionIndex;
        let handled = false;

        switch (event.key) {
            case 'ArrowDown':
                nextIndex = (currentAccordionIndex + 1) % this.accordions.length;
                handled = true;
                break;
            case 'ArrowUp':
                nextIndex = (currentAccordionIndex - 1 + this.accordions.length) % this.accordions.length;
                handled = true;
                break;
            case 'Home':
                nextIndex = 0;
                handled = true;
                break;
            case 'End':
                nextIndex = this.accordions.length - 1;
                handled = true;
                break;
            default:
                break;
        }

        if (handled) {
            event.preventDefault(); // Prevent default browser behavior (e.g., scrolling)
            this.accordions[nextIndex].buttonElem.focus();
        }
    }
}

// Initialize accordion groups
document.querySelectorAll('.accordionGroup').forEach((groupEl) => {
    new AccordionGroup(groupEl);
});