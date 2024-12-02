import React, { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface Dot {
  x: number;
  y: number;
  opacity: number;
}

interface PathData {
  id: string;
  d: string;
}

interface ConnectingThreadsProps {
  buttonRef: React.RefObject<HTMLDivElement>;
  dashboardRef: React.RefObject<HTMLDivElement>;
  onAnimationComplete: () => void;
}

export const ConnectingThreads: React.FC<ConnectingThreadsProps> = ({
  buttonRef,
  dashboardRef,
  onAnimationComplete,
}) => {
  const [lines, setLines] = useState<{
    left: { start: Point; end: Point; control: Point };
    right: { start: Point; end: Point; control: Point };
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const leftPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const [pathDots, setPathDots] = useState<Record<string, Dot[]>>({});
  const animationCompleteRef = useRef(false);

  const numDots = 20;
  const dotSpacing = 3;
  const ANIMATION_DURATION = 3000;
  const DOT_SPEED = 0.5; // Controls the speed of dots

  // Create dynamic paths based on lines state
  const getPaths = (): PathData[] => {
    if (!lines) return [];

    return [
      {
        id: "leftPath",
        d: `M ${lines.left.start.x},0 Q ${lines.left.control.x},${lines.left.control.y} ${lines.left.end.x},${dimensions.height}`,
      },
      {
        id: "rightPath",
        d: `M ${lines.right.start.x},0 Q ${lines.right.control.x},${lines.right.control.y} ${lines.right.end.x},${dimensions.height}`,
      },
    ];
  };

  // Map path IDs to refs
  const getPathRef = (pathId: string): SVGPathElement | null => {
    switch (pathId) {
      case "leftPath":
        return leftPathRef.current;
      case "rightPath":
        return rightPathRef.current;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!buttonRef.current || !dashboardRef.current) return;

    const updateLines = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const dashRect = dashboardRef.current?.getBoundingClientRect();

      if (!buttonRect || !dashRect) return;

      const minY = Math.min(buttonRect.bottom, dashRect.top);
      const maxY = Math.max(buttonRect.bottom, dashRect.top);
      const height = maxY - minY;

      setDimensions({
        width: window.innerWidth,
        height: height,
      });

      const svgPoint = (x: number, y: number) => ({
        x: (x / window.innerWidth) * 1000,
        y: y - minY,
      });

      // Left path
      const leftStart = svgPoint(
        buttonRect.left + buttonRect.width / 2,
        buttonRect.bottom,
      );
      const leftEnd = svgPoint(dashRect.left + 200, dashRect.top);
      const leftControl = {
        x: Math.max(leftStart.x, leftEnd.x),
        y: (leftStart.y + leftEnd.y) / 2,
      };

      // Right path (mirrored)
      const rightStart = svgPoint(
        buttonRect.left + buttonRect.width / 2,
        buttonRect.bottom,
      );
      const rightEnd = svgPoint(dashRect.right - 200, dashRect.top);
      const rightControl = {
        x: Math.min(rightStart.x, rightEnd.x),
        y: (rightStart.y + rightEnd.y) / 2,
      };

      setLines({
        left: { start: leftStart, end: leftEnd, control: leftControl },
        right: { start: rightStart, end: rightEnd, control: rightControl },
      });
    };

    updateLines();
    const resizeObserver = new ResizeObserver(updateLines);
    resizeObserver.observe(document.documentElement);

    return () => resizeObserver.disconnect();
  }, [buttonRef, dashboardRef]);

  // Animation effect
  useEffect(() => {
    if (!lines) return;

    let animationId: number;
    const startTime = performance.now();
    const paths = getPaths();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newPathDots: Record<string, Dot[]> = {};

      // Check for animation completion
      if (elapsed >= ANIMATION_DURATION && !animationCompleteRef.current) {
        onAnimationComplete();
        animationCompleteRef.current = true;
      }

      // Animate dots for each path
      paths.forEach((path) => {
        const pathElement = getPathRef(path.id);
        if (!pathElement) return;

        const pathLength = pathElement.getTotalLength();
        const progress = (elapsed * DOT_SPEED) % pathLength;

        const dots = Array.from({ length: numDots }, (_, index) => {
          // Calculate dot position with wrapping
          let dotPosition = (progress - index * dotSpacing) % pathLength;
          if (dotPosition < 0) {
            dotPosition += pathLength;
          }

          const point = pathElement.getPointAtLength(dotPosition);

          // Calculate opacity with smooth fade
          const distanceFromHead = index * dotSpacing;
          const maxDistance = numDots * dotSpacing;
          const opacity = Math.pow(1 - distanceFromHead / maxDistance, 1.5);

          return {
            x: point.x,
            y: point.y,
            opacity: Math.max(0.1, opacity), // Ensure minimum opacity
          };
        });

        newPathDots[path.id] = dots;
      });

      setPathDots(newPathDots);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [lines, onAnimationComplete]);

  if (!lines) return null;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top: `${buttonRef.current?.getBoundingClientRect().bottom}px`,
        left: 0,
        width: "100%",
        height: `${dimensions.height}px`,
      }}
      viewBox={`0 0 1000 ${dimensions.height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="pathGradient1"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Paths */}
      <path
        ref={leftPathRef}
        d={getPaths()[0].d}
        stroke="url(#pathGradient1)"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <path
        ref={rightPathRef}
        d={getPaths()[1].d}
        stroke="url(#pathGradient1)"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />

      {/* Animated dots */}
      {Object.entries(pathDots).map(([pathId, dots]) =>
        dots.map((dot, index) => (
          <circle
            key={`${pathId}-${index}`}
            cx={dot.x}
            cy={dot.y}
            r="1.5"
            className="fill-purple-800"
            style={{
              opacity: dot.opacity,
              filter: "blur(0.2px)",
            }}
          />
        )),
      )}
    </svg>
  );
};
