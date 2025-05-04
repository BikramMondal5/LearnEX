import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Remove fdprocessedid attributes that cause hydration errors
              function removeFdAttributes() {
                try {
                  // Find all elements with fdprocessedid attributes
                  const elements = document.querySelectorAll('[fdprocessedid]');
                  
                  // Remove the attribute from each element
                  elements.forEach(el => {
                    el.removeAttribute('fdprocessedid');
                  });
                } catch (error) {
                  console.error('Error removing fdprocessedid attributes:', error);
                }
              }
              
              // Run immediately and after DOM content loaded
              removeFdAttributes();
              document.addEventListener('DOMContentLoaded', removeFdAttributes);
              
              // Also run after a short delay to catch any late additions
              setTimeout(removeFdAttributes, 100);
              setTimeout(removeFdAttributes, 500);
              setTimeout(removeFdAttributes, 2000);
            })();
          `
        }} />
      </body>
    </Html>
  )
} 