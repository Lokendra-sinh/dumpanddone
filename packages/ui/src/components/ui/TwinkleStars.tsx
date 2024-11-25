import { Star, StarConfig } from "@/lib/canvas/twinkle-stars";
import { ReactNode, useEffect, useRef } from "react";

const STAR_RADIUS = 1.5;
const MAX_STARS = 50;

interface TwinkleStarsProps {
  children: ReactNode;
  className?: string;
}

export const TwinkleStars = ({ children, className }: TwinkleStarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx!.scale(dpr, dpr);

    const generateStar = () => {
      return new Star({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: STAR_RADIUS,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        },
        alpha: Math.random(),
      });
    };

    const generateStars = () => {
      const currentCount = starsRef.current.length;
      const neededStars = MAX_STARS - currentCount;

      for (let i = 0; i < neededStars; i++) {
        starsRef.current.push(generateStar());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw each star
      starsRef.current.forEach((star, index) => {
        star.update();

        // If star goes off screen, replace it!
        if (
          star.x < 0 ||
          star.x > canvas.width ||
          star.y < 0 ||
          star.y > canvas.height
        ) {
          starsRef.current[index] = generateStar();
        }

        star.draw(ctx);
      });

      // Keep the animation going!
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    generateStars();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  });
  return (
    <div className={`w-full flex rounded-md overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {children}
    </div>
  );
};
