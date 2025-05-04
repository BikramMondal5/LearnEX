"use client"

import { useEffect, useRef } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Component to render markdown content using Marked.js
 */
export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if marked is available (it should be loaded from the script in layout.tsx)
    if (typeof window !== 'undefined' && window.marked && containerRef.current) {
      // Configure marked options for security and features
      window.marked.setOptions({
        breaks: true,             // Add 'br' on single line breaks
        gfm: true,                // GitHub flavored markdown
        headerIds: true,          // Generate IDs for headings
        mangle: false,            // Disable mangling to avoid XSS
        sanitize: false,          // HTML sanitization is handled by DOMPurify
        smartLists: true,         // Use smarter list behavior
        smartypants: true,        // Use "smart" typographic punctuation
        xhtml: false              // Don't generate XHTML output
      });

      try {
        // Parse markdown to HTML using marked
        const html = window.marked.parse(content);
        
        // Set the HTML content
        containerRef.current.innerHTML = html;
        
        // Apply styling to elements
        applyMarkdownStyling(containerRef.current);
        
      } catch (error) {
        console.error("Error rendering markdown:", error);
        containerRef.current.textContent = content;
      }
    } else {
      // Fallback if marked is not available
      if (containerRef.current) {
        containerRef.current.textContent = content;
      }
    }
  }, [content]);

  // Function to apply styling to the rendered markdown
  const applyMarkdownStyling = (container: HTMLElement) => {
    // Style headings
    container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      el.classList.add('font-bold', 'mt-4', 'mb-2', 'text-white');
    });
    
    // Style specific heading levels
    container.querySelectorAll('h1').forEach(el => el.classList.add('text-2xl'));
    container.querySelectorAll('h2').forEach(el => el.classList.add('text-xl'));
    container.querySelectorAll('h3').forEach(el => el.classList.add('text-lg'));
    
    // Style paragraphs
    container.querySelectorAll('p').forEach(el => {
      el.classList.add('my-2', 'break-words');
    });
    
    // Style lists
    container.querySelectorAll('ul, ol').forEach(el => {
      el.classList.add('pl-6', 'my-2');
    });
    
    container.querySelectorAll('ul').forEach(el => {
      el.classList.add('list-disc');
    });
    
    container.querySelectorAll('ol').forEach(el => {
      el.classList.add('list-decimal');
    });
    
    // Style list items
    container.querySelectorAll('li').forEach(el => {
      el.classList.add('mb-1', 'break-words');
    });
    
    // Style links
    container.querySelectorAll('a').forEach(el => {
      el.classList.add('text-indigo-400', 'hover:text-indigo-300', 'underline', 'break-all');
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
    
    // Style code blocks
    container.querySelectorAll('pre').forEach(el => {
      el.classList.add('bg-slate-950', 'p-4', 'rounded-md', 'my-4', 'overflow-x-auto', 'max-w-full');
    });
    
    // Style inline code
    container.querySelectorAll('code').forEach(el => {
      if (el.parentElement?.tagName !== 'PRE') {
        // This is an inline code block
        el.classList.add('bg-slate-900', 'px-1.5', 'py-0.5', 'rounded', 'text-sm', 'font-mono', 'break-words');
      } else {
        // Inside a pre tag (code block)
        el.classList.add('font-mono', 'text-sm', 'whitespace-pre-wrap', 'break-words');
      }
    });
    
    // Style blockquotes
    container.querySelectorAll('blockquote').forEach(el => {
      el.classList.add('border-l-4', 'border-indigo-500', 'pl-4', 'italic', 'my-4', 'py-1', 'text-slate-300', 'break-words');
    });
    
    // Style tables
    container.querySelectorAll('table').forEach(el => {
      el.classList.add('min-w-full', 'border-collapse', 'my-4', 'text-sm', 'block', 'overflow-x-auto', 'max-w-full');
    });
    
    container.querySelectorAll('th').forEach(el => {
      el.classList.add('bg-slate-800', 'text-left', 'py-2', 'px-4', 'font-medium', 'border', 'border-slate-700', 'break-words');
    });
    
    container.querySelectorAll('td').forEach(el => {
      el.classList.add('py-2', 'px-4', 'border', 'border-slate-700', 'break-words');
    });
    
    // Add alternating row colors
    container.querySelectorAll('tr:nth-child(even)').forEach(el => {
      el.classList.add('bg-slate-900');
    });
  };

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content text-white/90 break-words overflow-wrap-anywhere ${className}`}
    >
      {/* Content will be inserted here by the useEffect */}
    </div>
  );
}

// Add the marked type definition to the window object
declare global {
  interface Window {
    marked: {
      parse: (text: string) => string;
      setOptions: (options: {
        breaks?: boolean;
        gfm?: boolean;
        headerIds?: boolean;
        mangle?: boolean;
        sanitize?: boolean;
        smartLists?: boolean;
        smartypants?: boolean;
        xhtml?: boolean;
      }) => void;
    };
  }
} 