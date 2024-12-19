import { ThemeProviderContext } from "@/providers/theme-provider";
import { useContext, useRef, useCallback } from "react";
import { Textarea } from "@dumpanddone/ui";

interface ScanningTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isScanning?: boolean;
}

export const ScanningTextArea: React.FC<ScanningTextAreaProps> = ({ 
  value, 
  onChange, 
  isScanning = false 
}) => {
  const { theme } = useContext(ThemeProviderContext);
  const gradientColor = theme === "dark" ? "255,255,255" : "0,0,0";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateText = useCallback((start: number, end: number, insertText: string) => {
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end) || '';
    const newText = beforeText + insertText + afterText;
    
    // Create and dispatch change event
    const newEvent = {
      target: {
        value: newText
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(newEvent);

    // Update cursor position asynchronously
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newPosition = start + insertText.length;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPosition;
        textareaRef.current.focus();
      }
    });
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key: insert four spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      updateText(start, end, '    ');
    }

    // Handle Newline on Shift+Enter or Ctrl+Shift+Enter or Cmd+Shift+Enter
    // Essentially, if Enter is pressed with Shift held down, insert newline
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      updateText(start, end, '\n');
    }
  }, [updateText]);

  return (
    <div className="relative w-full h-[400px]">
      <Textarea
        ref={textareaRef}
        placeholder="Paste your content here..."
        className={`h-[400px] relative w-full resize-none ${isScanning && "text-foreground/40"}`}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      {isScanning && (
        <svg
          className="absolute inset-0 pointer-events-none rounded-lg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="scanlineGradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2="150"
            >
              <stop offset="0%" stopColor={`rgba(${gradientColor}, 0)`} />
              <stop offset="50%" stopColor={`rgba(${gradientColor}, 0.2)`} />
              <stop offset="100%" stopColor={`rgba(${gradientColor}, 0)`} />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="0,-150; 0,400; 0,-150"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
              />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#scanlineGradient)"
          />
        </svg>
      )}
    </div>
  );
};
