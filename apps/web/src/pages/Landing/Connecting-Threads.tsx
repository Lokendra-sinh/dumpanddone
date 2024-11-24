import { useEffect, useState } from 'react'

interface ConnectingThreadsProps {
  buttonRef: React.RefObject<HTMLDivElement>,
  dashboardRef: React.RefObject<HTMLDivElement>;
}

interface Point {
  x: number;
  y: number;
}

export const ConnectingThreads: React.FC<ConnectingThreadsProps> = ({ buttonRef, dashboardRef }) => {
    const [lines, setLines] = useState<{
      left: {start: Point, end: Point, control: Point},
      right: {start: Point, end: Point, control: Point}
    } | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
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
          height: height
        });

        const svgPoint = (x: number, y: number) => ({
          x: (x / window.innerWidth) * 1000,
          y: (y - minY)
        });
  
        // Left path
        const leftStart = svgPoint(
          buttonRect.left + (buttonRect.width / 2),
          buttonRect.bottom
        );
        const leftEnd = svgPoint(
          dashRect.left + 200,
          dashRect.top
        );
        const leftControl = {
          x: Math.max(leftStart.x, leftEnd.x),
          y: (leftStart.y + leftEnd.y) / 2
        };

        // Right path (mirrored)
        const rightStart = svgPoint(
          buttonRect.left + (buttonRect.width / 2),
          buttonRect.bottom
        );
        const rightEnd = svgPoint(
          dashRect.right - 200, // Adjust this value to control the right endpoint
          dashRect.top
        );
        const rightControl = {
          x: Math.min(rightStart.x, rightEnd.x),
          y: (rightStart.y + rightEnd.y) / 2
        };
  
        setLines({ 
          left: { start: leftStart, end: leftEnd, control: leftControl },
          right: { start: rightStart, end: rightEnd, control: rightControl }
        });
      };
  
      updateLines();
      const resizeObserver = new ResizeObserver(updateLines);
      resizeObserver.observe(document.documentElement);
  
      return () => resizeObserver.disconnect();
    }, [buttonRef, dashboardRef]);
  
    if (!lines) return null;
  
    return (
      <svg 
        className="absolute pointer-events-none"
        style={{
          top: `${buttonRef.current?.getBoundingClientRect().bottom}px`,
          left: 0,
          width: '100%',
          height: `${dimensions.height}px`
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
        {/* Left path */}
        <path
          d={`M ${lines.left.start.x},0 
              Q ${lines.left.control.x},${lines.left.control.y} 
              ${lines.left.end.x},${dimensions.height}`}
          stroke="url(#pathGradient1)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* Right path */}
        <path
          d={`M ${lines.right.start.x},0 
              Q ${lines.right.control.x},${lines.right.control.y} 
              ${lines.right.end.x},${dimensions.height}`}
          stroke="url(#pathGradient1)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };