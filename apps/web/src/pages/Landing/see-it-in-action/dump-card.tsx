import { RefObject, useMemo } from "react";

type Position = {
    x: number;
    y: number;
  };
  
  type Bounds = {
    width: number;
    height: number;
  };
  
  type ShapeType = "circle" | "rectangle" | "triangle" | "star";
  
  type ShapeProps = {
    color: string;
    x: number;
    y: number;
    size?: number;
  };
  
  type Shape = Position & {
    color: string;
    type: ShapeType;
    size: number;
  };
  
  // Components with proper types
  const Circle = ({ color, x, y, size = 20 }: ShapeProps) => (
    <circle cx={x} cy={y} r={size / 2} fill={color} fillOpacity={0.7} />
  );
  
  const Rectangle = ({ color, x, y, size = 20 }: ShapeProps) => (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill={color}
      fillOpacity={0.7}
      transform={`rotate(${Math.random() * 360} ${x} ${y})`}
    />
  );
  
  const Triangle = ({ color, x, y, size = 20 }: ShapeProps) => {
    const points = [
      `${x},${y - size / 2}`,
      `${x + size / 2},${y + size / 2}`,
      `${x - size / 2},${y + size / 2}`,
    ].join(" ");
    return <polygon points={points} fill={color} fillOpacity={0.7} />;
  };
  
  const Star = ({ color, x, y, size = 20 }: ShapeProps) => {
    const points: number[] = [];
    const outerRadius = size / 2;
    const innerRadius = size / 4;
  
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 5;
      points.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    }
  
    return <polygon points={points.join(",")} fill={color} fillOpacity={0.7} />;
  };
  
  const generateNonOverlappingPosition = (
      existingPositions: Position[], 
      size: number, 
      bounds: Bounds
    ): Position | null => {
      const padding = size * 1.1; // Reduced padding even more
      let attempts = 0;
      const maxAttempts = 100;
      
      const gridSize = size * 1.2; // Smaller grid cells
      const cols = Math.floor(bounds.width / gridSize);
      const rows = Math.floor(bounds.height / gridSize);
      
      while (attempts < maxAttempts) {
        const gridCol = Math.floor(Math.random() * cols);
        const gridRow = Math.floor(Math.random() * rows);
        
        const offsetX = Math.random() * gridSize;
        const offsetY = Math.random() * gridSize;
        
        const x = (gridCol * gridSize) + offsetX;
        const y = (gridRow * gridSize) + offsetY;
        
        // More lenient bounds checking
        if (x > bounds.width - size/2 || y > bounds.height - size/2) {
          attempts++;
          continue;
        }
        
        const overlaps = existingPositions.some(pos => 
          Math.hypot(pos.x - x, pos.y - y) < padding
        );
        
        if (!overlaps) {
          return { x, y };
        }
        attempts++;
      }
      
      return null;
    };

  interface DumpCardProps {
    dumpCardRef: RefObject<HTMLDivElement>
  }
  
  export const DumpCard = ({dumpCardRef} : DumpCardProps) => {
      const shapes = useMemo<Shape[]>(() => {
        const colors = [
          'rgba(255, 179, 179, 0.9)', // Light Coral
          'rgba(150, 206, 180, 0.9)', // Sage
          'rgba(255, 190, 11, 0.9)',  // Yellow
          'rgba(255, 135, 178, 1)', // Pink
          'rgba(136, 212, 235, 1)', // Light Blue
          'rgba(255, 212, 178, 1)', // Peach
          'rgba(166, 227, 233, 1)', // Cyan
        ];
    
        const shapeTypes: ShapeType[] = ['circle', 'rectangle', 'triangle', 'star'];
        const positions: Position[] = [];
        const shapes: Shape[] = [];
        const size = 19; // Made shapes smaller
        const bounds: Bounds = { width: 400, height: 400 };
    
        // Increased number of shapes significantly
        for (let i = 0; i < 80; i++) {
          const position = generateNonOverlappingPosition(positions, size, bounds);
          if (position) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            
            positions.push(position);
            shapes.push({ 
              ...position, 
              color, 
              type, 
              size: size * (0.8 + Math.random() * 0.4)
            });
          }
        }
    
        return shapes;
      }, []);
    
      // Rest of the component remains the same
      return (
          <div ref={dumpCardRef} className="w-full h-[250px] rounded-lg bg-white relative bg-gradient-to-b from-transparent to-white">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {shapes.map((shape, i) => {
                const props: ShapeProps & { key: number } = {
                  key: i,
                  color: shape.color,
                  x: shape.x,
                  y: shape.y,
                  size: shape.size,
                };
      
                switch (shape.type) {
                  case "circle":
                    return <Circle {...props} />;
                  case "rectangle":
                    return <Rectangle {...props} />;
                  case "triangle":
                    return <Triangle {...props} />;
                  case "star":
                    return <Star {...props} />;
                  default:
                    return null;
                }
              })}
            </svg>
            <div className="absolute inset-0 pointer-events-none">
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white via-white/40 to-transparent" />
      
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/40 to-transparent" />
      
      {/* Left gradient */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/40 to-transparent" />
      
      {/* Right gradient */}
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/40 to-transparent" />
      
      {/* Corner overlays for smoother blending */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white via-white/90 to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white via-white/90 to-transparent" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white via-white/90 to-transparent" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white via-white/90 to-transparent" />
    </div>
          </div>
        );
    };