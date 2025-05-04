import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Function to remove fdprocessedid attributes
    const removeFdAttributes = () => {
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
        
        return () => observer.disconnect();
      } catch (error) {
        console.error('Error removing fdprocessedid attributes:', error);
      }
    };
    
    // Run the function
    removeFdAttributes();
    
    // Also run after a short delay to catch any late additions
    const timeout = setTimeout(removeFdAttributes, 100);
    return () => clearTimeout(timeout);
  }, []);
  
  return <Component {...pageProps} />
} 