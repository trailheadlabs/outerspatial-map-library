When working on accessibility for OuterSpatial.js, Trailhead Labs keeps three specifications in mind:

- [Section 508](http://www.section508.gov)
- [Web Content Accessibility Guidelindes (WCAG) 2.0](http://www.w3.org/TR/WCAG20/)
- [Accessible Rich Internet Applications (WAI-ARIA 1.0)](http://www.w3.org/TR/wai-aria/)

All maps built with OuterSpatial.js, including maps built with OuterSpatial Builder, contain the accessibility features described on this page. Note: This document is a work-in-progress.

## Keyboard navigation

Maps built with OuterSpatial.js can be navigated with the keyboard. OuterSpatial.js gives all non-native "focusable" elements (`<div>`, etc.) a `tabindex` of `0`. The `tabindex` for native "focusable" elements (`<a>`, `<button>`, etc.) is not specified. This means that the overall `tabindex` order is left to the web browser, ensuring consistent behavior no matter which browser is being used.

In addition, all OuterSpatial.js controls ("smallzoom", "home", "locate", "overview", "print", "share", "fullscreen", etc.) and modules ("route", etc.) utilize focusable elements so they can be tabbed to using a keyboard.

If the map itself has focus, it can be navigated by using the `+`, `-`, `↑`, `↓`, `←`, and `→` keys.

Note: We are considering adding a keyboard shortcut that, if pressed, switches browser focus to the map. This would make it easy to quickly focus a map that is embedded in a larger web page.

## Focus and focus indicators

When the map itself is focused, a visual indicator (currently a 1 pixel wide colored border) is added to it, giving a clear indication that the map is ready to be navigated with using the supported keyboard shortcuts.

All other focusable elements (`<button>`, `<a>`, etc.) are also given a focus indicator (either on the outside or inside of the element) when focused.

OuterSpatial.js does manipulate the default display of focus indicators to match the OuterSpatial graphic identity and to ensure that good indicators display in all scenarios. This manipulation is done in a way that should not negatively impact accessibility.

In certain scenarios, OuterSpatial.js does "smart" refocusing to introduce a more intuitive user experience. For example, if the fullscreen control's maximize button is focused and the enter key is used to enter fullscreen mode, OuterSpatial.js moves focus to the minimize button. Again, this type of manipulation is only done in targeted situations where switching focus improves the accessibility and usability of the map.

## Markup

- All OuterSpatial.js controls and modules use HTML `<button>` elements over `<a>` elements or non-standard focusable elements. This is because `<button>` elements are, generally speaking, the most accessible - especially on older browsers and devices.
- All HTML `<table>` elements have row headers that are appropriately identified using `<th>` elements, even if these header elements are hidden with CSS.

## `alt` tags

The HTML element (`div`, etc.) that OuterSpatial.js renders the map into is always given an appropriate `alt` tag (if an `alt` tag doesn't already exist). This is useful for those who are using screen readers. If the OuterSpatial.js config object has a `description` property, this property is used for the `alt` tag. If it does not, a default `alt` tag is added.

All HTML elements used by OuterSpatial.js' controls and modules are also given clear and concise `alt` tags so their purpose can be quickly identified by those using screen readers.

## Forms

If forms are used by an OuterSpatial.js control or module, OuterSpatial.js uses standard HTML `<form>`, `<input>`, `<select>`, `<button>`, etc. elements, as these elements can be focused natively by the web browser.

## Vector shapes

Trailhead Labs is actively working on making all vector shapes tabbable. There is a development version of OuterSpatial.js that includes tabbable vectors, and it's working fairly well. However, additional testing is needed before this feature is ready to be rolled out to production.

## Alternate formats

Sometimes no matter how much work is put in to making a web map accessible, it isn't as accessible as it should be. In this scenario, it may be appropriate to make the content that's served via the map available in an alternate format.

Trailhead Labs is working on a "download" control for OuterSpatial.js. This control will be used to make datasets served via a web map available in formats that may be more accessible for users with disabilities (CSV, etc.).

The team is also investigating the feasibility of a "table" control for OuterSpatial.js. This control would make it possible to view the content displayed visually on a map in a tabular format, which would make it easier for users with disabilities to navigate.

## WAI-ARIA 1.0

Trailhead Labs is actively working on implementing the WAI-ARIA 1.0 specification for OuterSpatial.js. A few controls ("geocoder", etc.) are currently WAI-ARIA compliant, but there's still a lot of work to be done on this specification.
