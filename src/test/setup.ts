import '@testing-library/jest-dom/vitest';

// --- Radix UI + jsdom shims ---------------------------------------------------
// Radix (Select, DropdownMenu, etc.) uses Pointer Events APIs that jsdom
// does not implement. Without these stubs, clicking a <SelectTrigger> throws
// `TypeError: target.hasPointerCapture is not a function`.
// See: https://github.com/radix-ui/primitives/issues/1822
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {
      /* no-op stub */
    };
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {
      /* no-op stub */
    };
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {
      /* no-op stub */
    };
  }
}
