import { RefObject, useEffect, useState, useRef } from "react";

interface BlogCardProps {
  blogCardRef: RefObject<HTMLDivElement>;
  shouldAnimate?: boolean;
}

type SkeletonLine = {
  color: string;
  width: string;
  isParagraph: boolean;
};

export const BlogCard = ({ blogCardRef, shouldAnimate = false }: BlogCardProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const animationTimeoutsRef = useRef<number[]>([]);
  const lastAnimationStartRef = useRef<number>(0);

  const skeletonLines: SkeletonLine[] = [
    // Introduction (Red)
    { color: "bg-red-500", width: "90%", isParagraph: false },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    { color: "bg-gray-200", width: "75%", isParagraph: true },
    
    // Methodology (Green)
    { color: "bg-emerald-600", width: "85%", isParagraph: false },
    { color: "bg-gray-200", width: "80%", isParagraph: true },
    { color: "bg-gray-200", width: "88%", isParagraph: true },
    { color: "bg-gray-200", width: "70%", isParagraph: true },
    
    // Results (Orange)
    { color: "bg-amber-500", width: "82%", isParagraph: false },
    { color: "bg-gray-200", width: "95%", isParagraph: true },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    { color: "bg-gray-200", width: "78%", isParagraph: true },
    
    // Analysis (Pink)
    { color: "bg-pink-500", width: "88%", isParagraph: false },
    { color: "bg-gray-200", width: "92%", isParagraph: true },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    
    // Technical Implementation (Blue)
    { color: "bg-blue-500", width: "95%", isParagraph: false },
    { color: "bg-gray-200", width: "88%", isParagraph: true },
    { color: "bg-gray-200", width: "82%", isParagraph: true },
    { color: "bg-gray-200", width: "75%", isParagraph: true },
    
    // Future Work (Orange)
    { color: "bg-orange-500", width: "80%", isParagraph: false },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    { color: "bg-gray-200", width: "78%", isParagraph: true },
    
    // Limitations (Red)
    { color: "bg-red-500", width: "75%", isParagraph: false },
    { color: "bg-gray-200", width: "88%", isParagraph: true },
    { color: "bg-gray-200", width: "82%", isParagraph: true },
    
    // Related Work (Green)
    { color: "bg-emerald-600", width: "85%", isParagraph: false },
    { color: "bg-gray-200", width: "92%", isParagraph: true },
    { color: "bg-gray-200", width: "86%", isParagraph: true },
    { color: "bg-gray-200", width: "78%", isParagraph: true },
    
    // Conclusion (Blue)
    { color: "bg-blue-500", width: "92%", isParagraph: false },
    { color: "bg-gray-200", width: "88%", isParagraph: true },
    { color: "bg-gray-200", width: "95%", isParagraph: true },
    { color: "bg-gray-200", width: "75%", isParagraph: true },

    { color: "bg-amber-500", width: "82%", isParagraph: false },
    { color: "bg-gray-200", width: "95%", isParagraph: true },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    { color: "bg-gray-200", width: "78%", isParagraph: true },
    { color: "bg-gray-200", width: "95%", isParagraph: true },
    { color: "bg-gray-200", width: "85%", isParagraph: true },
    { color: "bg-gray-200", width: "78%", isParagraph: true },
  ];

  useEffect(() => {
    if (shouldAnimate) {
      const now = Date.now();
      if (now - lastAnimationStartRef.current < 1000) {
        return;
      }
      
      lastAnimationStartRef.current = now;
      animationTimeoutsRef.current.forEach(clearTimeout);
      animationTimeoutsRef.current = [];
      setActiveIndex(-1);

      const newTimeouts = skeletonLines.map((_, i) => {
        return window.setTimeout(() => {
          setActiveIndex((prev) => Math.max(prev, i));
        }, i * 100);
      });
      
      animationTimeoutsRef.current = newTimeouts;
    }

    return () => {
      animationTimeoutsRef.current.forEach(clearTimeout);
    };
  }, [shouldAnimate, skeletonLines.length]);

  return (
    <div
      ref={blogCardRef}
      className="relative w-full h-[250px] rounded-[20px] bg-white p-3 
                 gap-[6px] overflow-y-auto"
    >
      <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-muted via-white/40 to-transparent" />
      
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-muted via-white/40 to-transparent" />
      
      {/* Left gradient */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-muted via-white/40 to-transparent" />
      
      {/* Right gradient */}
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-muted via-white/40 to-transparent" />
      
      {/* Corner overlays for smoother blending */}
      {/* <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white via-white/90 to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white via-white/90 to-transparent" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white via-white/90 to-transparent" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white via-white/90 to-transparent" /> */}
    </div>
      {skeletonLines.map((line, i) => (
        <div
          key={i}
          className={`
            rounded transition-all duration-500 ease-out
            ${line.color}
            ${line.isParagraph ? "opacity-60" : "opacity-90"}
            ${line.isParagraph ? "mt-1" : "mt-4"}
          `}
          style={{
            height: line.isParagraph ? "8px" : "14px",
            width: i <= activeIndex ? line.width : "0",
          }}
        />
      ))}
    </div>
  );
};