

````markdown
# Project Url 

   https://roadmap.sh/projects/accordion


## Part 1: The `Accordion` Class - Managing a Single Accordion Item

```javascript
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
        } else {
            this.contentEl.setAttribute('hidden', '');
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
````

### What it Does

This class is responsible for the core functionality of *a single accordion item*: opening, closing, and updating its ARIA (Accessible Rich Internet Applications) attributes. It does not handle keyboard navigation *between* multiple accordions; it only manages the click behavior for one.

### Detailed Explanation

1.  **`class Accordion { ... }`**:

      * Defines a JavaScript class, serving as a blueprint for creating `Accordion` objects. Each `Accordion` object will represent one distinct accordion section in your HTML.

2.  **`constructor(domNode)`**:

      * This special method is automatically executed when you create a new `Accordion` object (e.g., `new Accordion(someHtmlElement)`).
      * `domNode`: This is the HTML element provided when creating an instance. Based on your HTML, this `domNode` would be the `<h3>` element that wraps the button, as it's what's selected by `querySelectorAll('.accordion h3')`.
      * `this.rootEl = domNode;`: Stores a reference to this root HTML element (`<h3>`) as a property of the `Accordion` instance.
      * `this.buttonElem = this.rootEl.querySelector('button[aria-expanded]');`: Finds the accordion's control button *specifically within its own `rootEl`*. This ensures that each `Accordion` instance interacts only with its associated button. The `aria-expanded` attribute is crucial for accessibility, signaling the button's role in controlling a collapsible region.
      * `const controlsId = this.buttonElem.getAttribute('aria-controls');`: Retrieves the `id` of the content panel that this button controls. This `id` is specified in the `aria-controls` attribute of the button (e.g., `"accordion-description1"`).
      * `this.contentEl = document.getElementById(controlsId);`: Uses the retrieved `id` to find the actual content panel element (e.g., `<div id="accordion-description1" class="accordion-panel">`).
      * `this.open = this.buttonElem.getAttribute('aria-expanded') === 'true';`: Initializes the internal `open` state (`true` or `false`) of the accordion based on the initial value of the `aria-expanded` attribute in your HTML.
      * `this.buttonElem.addEventListener('click', this.onButtonClick.bind(this));`:
          * Attaches an event listener to the accordion's button. When the button is clicked, the `onButtonClick` method will be invoked.
          * `this.onButtonClick.bind(this)`: This is crucial for maintaining the correct context. When `onButtonClick` is called by the event listener, `this` inside that method would by default refer to the `buttonElem` (the element that triggered the event). However, we need `this` to refer to the `Accordion` instance itself (to access properties like `this.open`, `this.contentEl`). The `.bind(this)` method creates a new function where `this` is permanently set to the `Accordion` instance.

3.  **`onButtonClick()`**:

      * This method is triggered when the accordion button is clicked.
      * `this.toggle(!this.open);`: It calls the `toggle` method, passing the *opposite* of the current `open` state. If the accordion is currently open (`this.open` is `true`), it will call `toggle(false)` to close it, and vice-versa.

4.  **`toggle(open)`**:

      * This is the central method for changing the visual and accessibility state of the accordion.
      * `if (open === this.open) { return; }`: This is a "guard clause." It prevents unnecessary updates if you try to open an already open accordion or close an already closed one.
      * `this.open = open;`: Updates the internal `open` state to match the new desired state.
      * ` this.buttonElem.setAttribute('aria-expanded',  `${open}`);`: Updates the `aria-expanded` attribute on the button. This is vital for accessibility, as screen readers use this attribute to inform users whether the associated content section is expanded or collapsed.
      * `if (open) { this.contentEl.removeAttribute('hidden'); } else { this.contentEl.setAttribute('hidden', ''); }`: This is where the actual visual hiding/showing occurs using the `hidden` HTML attribute.
          * If `open` is `true`, the `hidden` attribute is removed from the content panel, making it visible (as `[hidden]` typically sets `display: none;`).
          * If `open` is `false`, the `hidden` attribute is added back to the content panel, hiding it from view and accessibility trees.

5.  **`openAccordion()` and `closeAccordion()`**:

      * These are public methods provided for convenience, allowing you to programmatically open or close an accordion instance from other parts of your code (e.g., `myAccordionInstance.openAccordion();`).
      * They were renamed from `open()` and `close()` to `openAccordion()` and `closeAccordion()` to avoid naming conflicts with the `this.open` property, which could lead to confusion or errors.

-----

## Part 2: The `AccordionGroup` Class - Managing Keyboard Navigation Across Multiple Accordions

```javascript
// --- Keyboard Navigation Management ---

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
```

### What it Does

This class is responsible for managing a *group* of `Accordion` instances. Its primary role is to enable **keyboard navigation** (using arrow keys, Home, and End) *between* the accordions within that group. It achieves this efficiently using a technique called **event delegation**.

### Detailed Explanation

1.  **`class AccordionGroup { ... }`**:

      * Defines a class to manage a collection of `Accordion` instances as a cohesive unit.

2.  **`constructor(groupDomNode)`**:

      * `groupDomNode`: This is the main HTML element that acts as the container for all the accordions in a specific group (e.g., the `<div id="accordionGroup" class="accordionGroup">`).
      * `this.groupEl = groupDomNode;`: Stores a reference to this group container element.
      * `this.accordions = [];`: Initializes an empty array that will later hold all the `Accordion` instances that belong to this group.
      * `this.initAccordions();`: Calls a method to find and create `Accordion` objects for all individual accordion headers within this group.
      * `this.groupEl.addEventListener('keydown', this.onKeydown.bind(this));`: This is the cornerstone of **event delegation**. Instead of attaching a separate `keydown` listener to *every single accordion button* (which can be inefficient for many items), a single listener is attached to their common parent container (`this.groupEl`). When any key is pressed *while focus is inside this group*, this one listener will capture the event.

3.  **`initAccordions()`**:

      * `const accordionHeaders = this.groupEl.querySelectorAll('.accordion h3');`: Finds all the `<h3>` elements (which are the root elements for each `Accordion` instance) *specifically within the current `AccordionGroup`'s container*.
      * `accordionHeaders.forEach((headerEl) => { ... });`: Iterates through each `<h3>` element found.
      * `const accordion = new Accordion(headerEl);`: Creates a new `Accordion` instance for each `<h3>` element.
      * `this.accordions.push(accordion);`: Adds the newly created `Accordion` instance to the `this.accordions` array. This builds a collection of all individual accordions managed by this `AccordionGroup`.

4.  **`onKeydown(event)`**:

      * This method is executed whenever a key is pressed *while the keyboard focus is anywhere inside the `accordionGroup` container*.
      * `const targetButton = event.target.closest('button[aria-expanded]');`:
          * `event.target`: This property refers to the exact HTML element that currently has keyboard focus when the `keydown` event occurs.
          * `.closest('button[aria-expanded]')`: This is a powerful method that traverses up the DOM tree from `event.target` (the focused element) until it finds the first ancestor element (or `event.target` itself) that matches the provided CSS selector (`'button[aria-expanded]'`). This is crucial for event delegation: it efficiently determines *if the keydown event originated from one of our accordion buttons or an element contained within it*.
          * If `targetButton` is `null`, it means the keydown event happened on an element that is *not* an accordion button (or not inside one), so the function `return;`s immediately without further action.
      * `const currentAccordionIndex = this.accordions.findIndex((accordion) => accordion.buttonElem === targetButton);`: This line searches through the `this.accordions` array to find the `Accordion` object whose `buttonElem` property is the same as the `targetButton` that just received the key press. This gives us the array index of the currently focused accordion.
      * `if (currentAccordionIndex === -1) { return; }`: Another guard clause. If, for some reason, the `targetButton` isn't found among the buttons managed by this `AccordionGroup` (e.g., if a new accordion was added dynamically but not initialized), the function stops.
      * `let nextIndex = currentAccordionIndex; let handled = false;`: These variables are initialized to track the index of the accordion that should receive focus next and a flag to indicate if a navigation key was pressed and handled.
      * **`switch (event.key)`**: This statement checks which specific key was pressed. `event.key` provides the string name of the key (e.g., `"ArrowDown"`, `"Home"`).
          * **`case 'ArrowDown':`**:
              * `nextIndex = (currentAccordionIndex + 1) % this.accordions.length;`: This calculates the index of the *next* accordion. The modulo operator (`%`) is used here to create a "wrap-around" effect:
                  * If `currentAccordionIndex` is 0, `0 + 1 = 1`. `1 % length` will be `1`.
                  * If `currentAccordionIndex` is `length - 1` (the last accordion), `(length - 1) + 1 = length`. `length % length` results in `0`, which correctly brings focus back to the *first* accordion.
              * `handled = true;`: Sets the flag to `true`, indicating that this key press has been specifically handled by our logic.
          * **`case 'ArrowUp':`**:
              * `nextIndex = (currentAccordionIndex - 1 + this.accordions.length) % this.accordions.length;`: This calculates the index of the *previous* accordion, also with wrap-around.
                  * If `currentAccordionIndex` is 0, `0 - 1 = -1`. `(-1 + length) % length` will correctly resolve to `length - 1` (the last accordion). (For example, if `length` is 3, `-1 + 3 = 2`, and `2 % 3 = 2`).
              * `handled = true;`: The key press was handled.
          * **`case 'Home':`**:
              * `nextIndex = 0;`: Sets the focus to the very first accordion in the group.
              * `handled = true;`
          * **`case 'End':`**:
              * `nextIndex = this.accordions.length - 1;`: Sets the focus to the very last accordion in the group.
              * `handled = true;`
          * **`default:`**: If any other key is pressed (not an arrow key, Home, or End), no specific action is taken by this `switch` statement.
      * `if (handled) { event.preventDefault(); this.accordions[nextIndex].buttonElem.focus(); }`:
          * `event.preventDefault();`: This is critically important\! For keys like `ArrowDown` and `ArrowUp`, web browsers have default behaviors (e.g., scrolling the page). By calling `preventDefault()`, we stop the browser's default action, ensuring that our custom focus navigation takes precedence.
          * `this.accordions[nextIndex].buttonElem.focus();`: This is the core action of keyboard navigation: it programmatically moves the keyboard focus to the button element of the accordion at the calculated `nextIndex`.

-----

## Part 3: Initialization - Bringing It All to Life

```javascript
// Initialize accordion groups
document.querySelectorAll('.accordionGroup').forEach((groupEl) => {
    new AccordionGroup(groupEl);
});
```

### What it Does

This section is the "bootstrap" code. It's the part of your script that runs when the HTML document is loaded. Its purpose is to find all the accordion group containers on the page and then create an `AccordionGroup` instance for each.

### Detailed Explanation

1.  **`document.querySelectorAll('.accordionGroup')`**:

      * This line selects all HTML elements in your document that have the class `accordionGroup`. Based on your HTML structure, this would typically select your main `<div id="accordionGroup" class="accordionGroup">`.

2.  **`.forEach((groupEl) => { ... });`**:

      * This method iterates over each HTML element found by `querySelectorAll`. For each `accordionGroup` element, the provided callback function is executed, with `groupEl` representing the current HTML element in the loop.

3.  **`new AccordionGroup(groupEl);`**:

      * Inside the loop, for every `accordionGroup` HTML element found, a new `AccordionGroup` instance is created. The `groupEl` (the HTML container for the group) is passed to its constructor.
      * When the `AccordionGroup` constructor runs, it, in turn, initializes all the individual `Accordion` instances within its `groupEl` and sets up the centralized `keydown` event listener for keyboard navigation.

-----

## In Summary: A Modular and Accessible Approach

  * **`Accordion` Class**: Focuses solely on the behavior and state of a *single* accordion item (opening/closing and ARIA updates). It's a self-contained component.
  * **`AccordionGroup` Class**: Acts as a *manager* or *controller* for a collection of `Accordion` instances. Its key role is to provide **centralized keyboard navigation** across the group using **event delegation**, which is efficient for performance and cleaner code.
  * **Initialization Code**: This is the "start-up" logic that finds your HTML structures and instantiates these JavaScript classes, thereby "activating" your accordions and their advanced keyboard navigation features.

