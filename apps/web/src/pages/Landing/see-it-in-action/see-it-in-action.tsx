import { useEffect, useRef, useState } from "react";
import { DumpCard } from "./dump-card";
import { Outline } from "./outline-card";
import { BlogCard } from "./blog-card";
import { CustomButton } from "@/components/custom-button";
import { WaitlistModal } from "../join-waitlist-modal";

type PathData = {
  path: string;
  color: string;
  darkColor: string;
  pathElement?: SVGPathElement | null;
};

interface BeamParticleProps {
  color: string;
  opacity: number;
  x: number;
  y: number;
}

const BeamParticle: React.FC<BeamParticleProps> = ({
  color,
  opacity,
  x,
  y,
}) => (
  <circle
    r="1"
    fill={color}
    opacity={opacity}
    transform={`translate(${x} ${y})`}
  />
);

export const SeeItInAction: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dumpCardRef = useRef<HTMLDivElement>(null);
  const outlineCardRef = useRef<HTMLDivElement>(null);
  const blogCardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const svgRef = useRef<SVGSVGElement>(null);

  // Two sets of beams:
  //  1) Dump → Outline
  //  2) Outline → Blog
  const [dumpToPaths, setDumpToPaths] = useState<PathData[]>([]);
  const [outlineToBlogPaths, setOutlineToBlogPaths] = useState<PathData[]>([]);

  // The array of active beam particles each frame
  const [particles, setParticles] = useState<
    {
      x: number;
      y: number;
      pathIndex: number;
      particleIndex: number;
      isOutlineToBlog?: boolean;
    }[]
  >([]);

  // requestAnimationFrame + time
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Timeline (9s total):
  //   0..2s => Dump->Outline beams
  //   2..4s => Outline bars
  //   4..6s => Outline->Blog beams
  //   6..8s => Blog skeleton sections
  //   8..9s => Pause
  const beamDurationDumpOutline = 2000; // 2s
  const barDuration = 2000; // 2s
  const beamDurationOutlineBlog = 2000; // 2s
  const blogSkeletonDuration = 2000; // 2s
  const pause = 1000; // 1s
  const totalCycle =
    beamDurationDumpOutline +
    barDuration +
    beamDurationOutlineBlog +
    blogSkeletonDuration +
    pause;
  // => 2 + 2 + 2 + 2 + 1 = 9s

  const particlesPerBeam = 12;

  // Colors
  const lightColors = [
    "rgba(255, 179, 179, 1)",
    "rgba(150, 206, 180, 1)",
    "rgba(255, 190, 11, 1)",
    "rgba(255, 135, 178, 1)",
    "rgba(136, 212, 235, 1)",
    "rgba(255, 212, 178, 1)",
  ];

  const darkColors = [
    "rgba(220, 60, 60, 1)",
    "rgba(67, 134, 112, 1)",
    "rgba(212, 145, 0, 1)",
    "rgba(198, 52, 115, 1)",
    "rgba(41, 128, 185, 1)",
    "rgba(215, 126, 57, 1)",
  ];

  // Control Outline bars (2..4s)
  const [shouldAnimateOutlineBars, setShouldAnimateOutlineBars] =
    useState(false);
  // Control Blog skeleton (6..8s)
  const [shouldAnimateBlogSkeleton, setShouldAnimateBlogSkeleton] =
    useState(false);

  // 1) Build paths for Dump->Outline & Outline->Blog
  useEffect(() => {
    if (
      !containerRef.current ||
      !dumpCardRef.current ||
      !outlineCardRef.current ||
      !blogCardRef.current
    ) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const dumpCardRect = dumpCardRef.current.getBoundingClientRect();
    const outlineCardRect = outlineCardRef.current.getBoundingClientRect();
    const blogCardRect = blogCardRef.current.getBoundingClientRect();

    // Dump->Outline
    const dumpEndX = dumpCardRect.right - containerRect.left;
    const dumpEndY =
      dumpCardRect.top - containerRect.top + dumpCardRect.height / 2;
    const outlineStartX = outlineCardRect.left - containerRect.left;
    const outlineStartY = outlineCardRect.top - containerRect.top;
    const outlineEndY = outlineCardRect.bottom - containerRect.top;

    const numberOfPaths = 6;
    const pathGap = (outlineEndY - outlineStartY) / (numberOfPaths + 1);

    const newDumpToPaths: PathData[] = [];
    for (let i = 1; i <= numberOfPaths; i++) {
      const targetY = outlineStartY + pathGap * i;
      const controlX = dumpEndX + (outlineStartX - dumpEndX) / 2;

      const path = `
        M ${dumpEndX} ${dumpEndY}
        C ${controlX} ${dumpEndY},
          ${controlX} ${targetY},
          ${outlineStartX} ${targetY}
      `;
      newDumpToPaths.push({
        path,
        color: lightColors[i - 1],
        darkColor: darkColors[i - 1],
      });
    }

    // Outline->Blog
    const outlineEndX = outlineCardRect.right - containerRect.left;
    const blogStartX = blogCardRect.left - containerRect.left;
    const blogStartY = blogCardRect.top - containerRect.top;
    const blogEndY = blogCardRect.bottom - containerRect.top;

    const newOutlineToBlogPaths: PathData[] = [];
    for (let i = 1; i <= numberOfPaths; i++) {
      const sourceY = outlineStartY + pathGap * i;
      const targetY =
        blogStartY + (blogEndY - blogStartY) * (i / (numberOfPaths + 1));
      const controlX = outlineEndX + (blogStartX - outlineEndX) / 2;

      const path = `
        M ${outlineEndX} ${sourceY}
        C ${controlX} ${sourceY},
          ${controlX} ${targetY},
          ${blogStartX} ${targetY}
      `;
      newOutlineToBlogPaths.push({
        path,
        color: lightColors[i - 1],
        darkColor: darkColors[i - 1],
      });
    }

    setDumpToPaths(newDumpToPaths);
    setOutlineToBlogPaths(newOutlineToBlogPaths);
  }, []);

  // 2) Animate everything in a 9-second cycle
  useEffect(() => {
    if (!svgRef.current || !dumpToPaths.length || !outlineToBlogPaths.length)
      return;

    // Grab the actual <path> references
    const pathElements = Array.from(svgRef.current.querySelectorAll("path"));
    dumpToPaths.forEach((p, idx) => {
      p.pathElement = pathElements[idx];
    });
    outlineToBlogPaths.forEach((p, idx) => {
      p.pathElement = pathElements[idx + dumpToPaths.length];
    });

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const cyclePos = elapsed % totalCycle; // 0..9000

      const newParticles: Array<{
        x: number;
        y: number;
        pathIndex: number;
        particleIndex: number;
        isOutlineToBlog?: boolean;
      }> = [];

      // 0..2s => Dump->Outline beams
      if (cyclePos < beamDurationDumpOutline) {
        const localTime = cyclePos; // 0..2000
        dumpToPaths.forEach((path, pathIndex) => {
          const pathEl = path.pathElement;
          if (!pathEl) return;

          const pathLen = pathEl.getTotalLength();

          for (let i = 0; i < particlesPerBeam; i++) {
            const delayMs = i * 20;
            const maxTime = delayMs + beamDurationDumpOutline;
            if (localTime >= delayMs && localTime <= maxTime) {
              const frac = (localTime - delayMs) / beamDurationDumpOutline;
              const point = pathEl.getPointAtLength(frac * pathLen);
              newParticles.push({
                x: point.x,
                y: point.y,
                pathIndex,
                particleIndex: i,
                isOutlineToBlog: false,
              });
            }
          }
        });
      }

      // 2..4s => Outline bars
      const inBarPhase =
        cyclePos >= beamDurationDumpOutline &&
        cyclePos < beamDurationDumpOutline + barDuration;
      setShouldAnimateOutlineBars(inBarPhase);

      // 4..6s => Outline->Blog beams
      if (
        cyclePos >= beamDurationDumpOutline + barDuration &&
        cyclePos <
          beamDurationDumpOutline + barDuration + beamDurationOutlineBlog
      ) {
        const localTime = cyclePos - (beamDurationDumpOutline + barDuration);
        outlineToBlogPaths.forEach((path, pathIndex) => {
          const pathEl = path.pathElement;
          if (!pathEl) return;

          const pathLen = pathEl.getTotalLength();

          for (let i = 0; i < particlesPerBeam; i++) {
            const delayMs = i * 20;
            const maxTime = delayMs + beamDurationOutlineBlog;
            if (localTime >= delayMs && localTime <= maxTime) {
              const frac = (localTime - delayMs) / beamDurationOutlineBlog;
              const point = pathEl.getPointAtLength(frac * pathLen);
              newParticles.push({
                x: point.x,
                y: point.y,
                pathIndex,
                particleIndex: i,
                isOutlineToBlog: true,
              });
            }
          }
        });
      }

      // 6..8s => Blog skeleton
      const inBlogSkeletonPhase =
        cyclePos >=
          beamDurationDumpOutline + barDuration + beamDurationOutlineBlog &&
        cyclePos <
          beamDurationDumpOutline +
            barDuration +
            beamDurationOutlineBlog +
            blogSkeletonDuration;
      setShouldAnimateBlogSkeleton(inBlogSkeletonPhase);

      // 8..9s => Pause (everything off)

      setParticles(newParticles);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dumpToPaths, outlineToBlogPaths]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center py-10 px-20 gap-20 relative"
    >
      <h1 className="text-4xl font-semibold text-primary">See It In Action</h1>
      <p className="text-base -mt-12 border border-muted-foreground rounded-md px-2 bg-white text-black shadow-[0_0_20px_1px] shadow-accent/40">
        From chaos to clarity in three steps
      </p>
      <div className="w-full h-full rounded-md bg-muted flex flex-col gap-10">
        {/* SVG for beams */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* 6 Dump->Outline paths */}
          {dumpToPaths.map(({ path, color }, pathIndex) => (
            <path
              key={`dump-${pathIndex}`}
              d={path}
              stroke={color}
              strokeWidth="2"
              fill="none"
              className="opacity-30"
            />
          ))}
          {/* 6 Outline->Blog paths */}
          {outlineToBlogPaths.map(({ path, color }, pathIndex) => (
            <path
              key={`blog-${pathIndex}`}
              d={path}
              stroke={color}
              strokeWidth="2"
              fill="none"
              className="opacity-30"
            />
          ))}

          {/* Beam particles */}
          {particles.map((p, i) => {
            const pathSet = p.isOutlineToBlog
              ? outlineToBlogPaths
              : dumpToPaths;
            const color = pathSet[p.pathIndex].darkColor;
            const opacity =
              (particlesPerBeam - p.particleIndex) / particlesPerBeam;

            return (
              <BeamParticle
                key={i}
                color={color}
                opacity={opacity}
                x={p.x}
                y={p.y}
              />
            );
          })}
        </svg>

        {/* Labels */}
        <div className="flex items-center justify-between px-40 mt-10 gap-4">
          <span className="text-medium text-base text-black border border-muted-foreground/20 px-2 rounded-md bg-white shadow-[0_0_20px_2px] shadow-amber-400">
            Dump
          </span>
          <span className="h-[1px] flex-1 bg-muted-foreground/20"></span>
          <span className="text-medium text-base text-black">Outline</span>
          <span className="h-[1px] flex-1 bg-muted-foreground/20"></span>
          <span className="text-medium text-base text-black">Blog</span>
        </div>

        {/* Cards */}
        <div className="w-full flex items-center justify-between px-20 gap-36">
          <div className="w-1/3 flex flex-col bg-background p-4 rounded-md gap-4">
            <p className="w-full text-primary/70 text-base">
              Just dump your scattered thoughts, notes, or conversations. No
              organization needed. No formatting required.
            </p>
            <DumpCard dumpCardRef={dumpCardRef} />
          </div>
          <div className="w-1/3 flex flex-col bg-background p-4 rounded-md gap-4">
            <p className="w-full text-primary/70 text-base">
              Watch as we organize your ideas into a clear, logical structure.
              Don't like something? Just tweak it.
            </p>
            <Outline
              outlineCardRef={outlineCardRef}
              shouldAnimate={shouldAnimateOutlineBars}
            />
          </div>
          <div className="w-1/3 flex flex-col bg-background p-4 rounded-md gap-4">
            <p className="w-full text-primary/70 text-base">
              Get a professionally structured blog post that sounds exactly like
              you. Your voice, just better organized.
            </p>
            <BlogCard
              blogCardRef={blogCardRef}
              shouldAnimate={shouldAnimateBlogSkeleton}
            />
          </div>
        </div>

        <div className="relative w-full flex flex-col items-center justify-center gap-6">
          <span className="text-black text-xl mt-10">
            Ready to transform your ideas?
          </span>
          <CustomButton
            onClick={() => setIsModalOpen(true)}
            baseColor="#2463eb"
            className="w-fit px-2 py-1 text-base text-white"
          >
            <p>Try now</p>
          </CustomButton>
        </div>
      </div>
      <WaitlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default SeeItInAction;
