import { Editor } from "@tiptap/core";
import { useCallback, useEffect, useRef } from "react";

export const useSmartScroll = (editor: Editor | null) => {
    const lastScrollRef = useRef(0);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef<NodeJS.Timeout>();
  
    const scrollWithContext = useCallback(() => {
      if (!editor || isUserScrolling.current) return;
  
      const editorElement = editor.view.dom;
      const parentContainer = editorElement.parentElement;
      if (!parentContainer) return;
  
      const totalHeight = editorElement.scrollHeight;
      const containerHeight = parentContainer.clientHeight;
      const currentScroll = parentContainer.scrollTop;
      const maxScroll = totalHeight - containerHeight;
  
      // Check if we're near the bottom
      const isNearBottom = maxScroll - currentScroll < 200;
      
      // Calculate ideal scroll position
      const targetScroll = Math.min(
        maxScroll,
        // If near bottom, stay at bottom
        isNearBottom ? maxScroll : 
        // Otherwise, try to keep last few paragraphs visible
        Math.max(
          currentScroll,
          maxScroll - containerHeight * 0.4
        )
      );
  
      if (Math.abs(targetScroll - currentScroll) > 50) {
        parentContainer.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
        lastScrollRef.current = targetScroll;
      }
    }, [editor]);
  
    useEffect(() => {
      if (!editor) return;
  
      const parentContainer = editor.view.dom.parentElement;
      if (!parentContainer) return;
  
      // Track user scrolling
      const handleScroll = () => {
        isUserScrolling.current = true;
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          isUserScrolling.current = false;
        }, 150);
      };
  
      parentContainer.addEventListener('scroll', handleScroll);
  
      return () => {
        parentContainer.removeEventListener('scroll', handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }, [editor]);
  
    return scrollWithContext;
  };