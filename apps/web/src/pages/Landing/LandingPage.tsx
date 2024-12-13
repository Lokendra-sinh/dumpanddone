import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { HeroDash } from "./Hero-Dash";
import { ConnectingThreads } from "./Connecting-Threads";
import { What } from "./what";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@dumpanddone/ui";

const LandingPage = () => {
  const { toast } = useToast();
  const isLoggedIn = useUserStore((state) => state.user !== null);
  const clearUser = useUserStore((state) => state.clearUser);
  const pathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [position, setPosition] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const path = pathRef.current;
    const circle = circleRef.current;

    if (!path || !circle) return;

    const pathLength = path.getTotalLength();

    const animate = () => {
      const point = path.getPointAtLength(position % pathLength);
      circle.setAttribute("cx", point.x.toString());
      circle.setAttribute("cy", point.y.toString());
      setPosition((prev) => (prev + 5) % pathLength);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [position]);

  const onAnimationComplete = useCallback(() => {
    // Clear any existing timeout
    if (glowTimeoutRef.current) {
      clearTimeout(glowTimeoutRef.current);
    }

    // Set glowing state
    setIsGlowing(true);

    // Set new timeout for resetting glow
    glowTimeoutRef.current = setTimeout(() => {
      setIsGlowing(false);
    }, 3000); // Duration matches CSS animation
  }, []);

  useEffect(() => {
    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-950/50 to-black" />
      <div className="absolute top-0 left-0 w-20 h-[400px] bg-gradient-to-b from-black-950/20 to-transparent" />
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 h-1 bg-transparent shadow-[20px_80px_300px_150px] shadow-purple-800" />

      {/* vertical strokes */}
      <div className="mx-10">
        <PathAnimation />
      </div>

      <nav className="relative z-10 container w-[1200px] px-6 py-2 flex items-center justify-between backdrop-blur-lg shadow-[inset_0px_0px_1px_1px_#0000] shadow-white/10 rounded-lg my-2">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 60"
            className="w-8 h-8"
          >
            <defs>
              <linearGradient
                id="purpleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>
            </defs>

            <path
              d="M 15,30
                 C 15,22 22,15 30,15
                 L 45,15
                 C 40,15 35,20 35,25
                 C 35,35 45,35 45,45
                 C 45,50 40,45 30,45
                 L 15,45
                 Z"
              fill="url(#purpleGradient)"
            />
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            dumpanddone
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="rounded-lg font-medium hover:bg-none text-sm"
            onClick={() => {
              if (isLoggedIn) {
                clearUser();
                toast({
                  title: "You logged out!",
                });
              } else {
                navigate({
                  to: "/login",
                });
              }
            }}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
          <button className="px-2 py-1 rounded-md text-sm border bg-transparent text-white border-purple-800 shadow-[inset_0_-4px_12px_0] shadow-purple-950 hover:bg-purple-800 transition-background duration-100 ease-in-out">
            Join waitlist
          </button>
        </div>
        {/* <TwinkleStars className="absolute top-0 left-0 w-full">
        <div className="w-screen h-10">
        </div>
        </TwinkleStars> */}
      </nav>

      <main className="w-full relative z-10 container pt-32 pb-24 text-center">
        <h1 className="text-6xl font-inter font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-white ">
            Turn your scattered ideas
          </span>
          <br />
          <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-white/5 via-purple-700 to-white">
            into powerful blog{" "}
            <span className="relative z-10 text-white px-2">
              <div className="absolute top-0 left-0 w-full bottom-0 right-0 -z-10 bg-purple-400 rounded-lg" />
              posts
            </span>
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Turn your messy notes, scattered conversations, and raw knowledge into
          <span className="text-purple-400">
            {" "}
            polished, professional blog posts{" "}
          </span>
          ready to captivate your audience.
        </p>

        <div
          ref={buttonRef}
          onClick={() =>
            navigate({
              to: "/dashboard/blogs",
            })
          }
          className="w-full flex items-center justify-center mb-32"
        >
          <div className="inline-block p-[2px] bg-gradient-to-t from-purple-900 to-purple-600 rounded-[6px] shadow-inner">
            {/* <TwinkleStars className="relative"> */}
            <span className="hover:none outline-none border-none inline-flex items-center shadow-[0px_0px_10px_1px_#a855f7] px-3 py-1 text-sm font-medium rounded-md bg-purple-950 text-white bg-gradient-to-t from-purple-950 to-purple-500">
              Create your first blog
            </span>
            {/* </TwinkleStars> */}
          </div>
        </div>

        <HeroDash ref={dashboardRef} isGlowing={isGlowing} />
        <div className="absolute bottom-0 left-0 right-0 w-full h-[600px] bg-gradient-to-t from-black to-transparent"></div>
      </main>

      <ConnectingThreads
        buttonRef={buttonRef}
        dashboardRef={dashboardRef}
        onAnimationComplete={onAnimationComplete}
      />

      <svg
        width="100%"
        height="500"
        viewBox="0 0 1000 200"
        style={{ position: "absolute", top: 0, left: 0 }}
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d="M 0,200 C 200,200 400,100 1000,200"
          fill="url(#curveGradient)"
        />
      </svg>
      <What />
    </div>
  );
};

export default LandingPage;

export interface Dot {
  x: number;
  y: number;
  opacity: number;
}

interface PathData {
  id: string;
  d: string;
}

const PathAnimation = () => {
  // Store dots for each path
  const [pathDots, setPathDots] = useState<Record<string, Dot[]>>({});
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const numDots = 20;
  const dotSpacing = 3;

  // Define your paths
  const paths: PathData[] = [
    {
      id: "path1",
      d: `M 100 200 L 200 200 L 300 250 L 350 250`,
    },
    {
      id: "path2",
      d: `M 100 400 L 150 400 L 250 300 L 340 300`,
    },
  ];

  useEffect(() => {
    let animationId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newPathDots: Record<string, Dot[]> = {};

      // Animate dots for each path
      paths.forEach((path) => {
        const pathElement = pathRefs.current.get(path.id);
        if (!pathElement) return;

        const pathLength = pathElement.getTotalLength();
        const progress = (elapsed * 0.1) % pathLength;

        const dots = Array.from({ length: numDots }, (_, index) => {
          const dotProgress = (progress - index * dotSpacing) % pathLength;
          const distance = Math.max(0, Math.min(dotProgress, pathLength));

          const point = pathElement.getPointAtLength(distance);
          const opacity = Math.pow(1 - index / (numDots - 1), 1.2);

          return {
            x: point.x,
            y: point.y,
            opacity,
          };
        });

        newPathDots[path.id] = dots;
      });

      setPathDots(newPathDots);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Function to store path refs
  const setPathRef = (element: SVGPathElement | null, id: string) => {
    if (element) {
      pathRefs.current.set(id, element);
    }
  };

  return (
    <svg className="px-6 absolute top-0 left-0 w-full h-full">
      <defs>
        <linearGradient
          id="pathGradient1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#170326" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.1" />
        </linearGradient>

        {/* Gradient for second path */}
        <linearGradient
          id="pathGradient2"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Render all paths */}
      {paths.map((path) => (
        <path
          key={path.id}
          ref={(el) => setPathRef(el, path.id)}
          d={path.d}
          stroke="url(#pathGradient1)"
          fill="none"
          strokeWidth="1"
        />
      ))}

      {/* Render dots for all paths */}
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
