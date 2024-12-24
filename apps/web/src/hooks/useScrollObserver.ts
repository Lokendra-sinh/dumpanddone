import { Editor } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";

export const useScrollObserver = (editor: Editor | null) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const lastNodeRef = useRef<HTMLElement | null>(null);
  
    useEffect(() => {
      if (!editor) return;
  
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsOverflowing(!entry.isIntersecting);
          });
        },
        {
          root: editor.view.dom.parentElement,
          threshold: 0,
          rootMargin: "-100px 0px" // Buffer zone
        }
      );
  
      // Function to update the observed element
      const updateObservedElement = () => {
        // Get the last content node
        const nodes = editor.view.dom.querySelectorAll('[data-node-type]');
        const lastNode = nodes[nodes.length - 1] as HTMLElement;
  
        if (lastNode !== lastNodeRef.current) {
          if (lastNodeRef.current) {
            observer.unobserve(lastNodeRef.current);
          }
          if (lastNode) {
            observer.observe(lastNode);
            lastNodeRef.current = lastNode;
          }
        }
      };
  
      // Update initially
      updateObservedElement();
  
      // Update when content changes
      const contentChangeHandler = () => {
        updateObservedElement();
      };
  
      editor.on('update', contentChangeHandler);
  
      return () => {
        if (lastNodeRef.current) {
          observer.unobserve(lastNodeRef.current);
        }
        editor.off('update', contentChangeHandler);
        observer.disconnect();
      };
    }, [editor]);
  
    return isOverflowing;
  };