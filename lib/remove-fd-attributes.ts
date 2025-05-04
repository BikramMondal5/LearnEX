/**
 * This script removes fdprocessedid attributes from DOM elements
 * These attributes are added by some browser extensions and cause hydration errors in React
 */

export function removeFdAttributes() {
  if (typeof window === 'undefined') return;
  
  // Run after the DOM is fully loaded
  setTimeout(() => {
    try {
      // Find all elements with fdprocessedid attributes
      const elements = document.querySelectorAll('[fdprocessedid]');
      
      // Remove the attribute from each element
      elements.forEach(el => {
        el.removeAttribute('fdprocessedid');
      });
      
      // Set up a mutation observer to catch any new elements with fdprocessedid
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'fdprocessedid') {
            const target = mutation.target as Element;
            target.removeAttribute('fdprocessedid');
          }
        });
      });
      
      // Start observing the document
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['fdprocessedid']
      });
    } catch (error) {
      console.error('Error removing fdprocessedid attributes:', error);
    }
  }, 0);
} 