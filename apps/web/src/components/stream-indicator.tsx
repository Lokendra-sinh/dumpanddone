import { cn } from "@dumpanddone/ui"

interface StreamIndicatorProps {
  isStreaming: boolean;
}

export const StreamIndicator = ({ isStreaming }: StreamIndicatorProps) => {
  if (!isStreaming) return null;
  
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-300",
        isStreaming ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Pulsating border overlay */}
      <div className="absolute inset-0 animate-pulse">
        <div className="absolute inset-0 border-2 border-violet-600" />
        <div className="absolute inset-0 border-2 border-violet-200 animate-ping" />
      </div>
    </div>
  );
};