import {
  FileText,
  FileType,
  MessageSquare,
  StickyNote,
  Mic,
  LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, forwardRef } from "react";
import { LogoParticles } from "./particles-effect";
export type Arrow8Element = SVGSVGElement;
export type Arrow8Props = React.SVGAttributes<SVGSVGElement>;

interface FormatBadgeProps {
  icon: LucideIcon;
  label: string;
  classes: string;
}

interface Format {
  icon: LucideIcon;
  label: string;
  align: string;
  classes: string;
}

const FormatBadge = ({ icon: Icon, label, classes }: FormatBadgeProps) => (
  <div
    className={`w-fit flex items-center gap-2 text-black bg-white px-4 py-1 rounded-lg border border-muted-foreground`}
  >
    <Icon className={`w-4 h-4 ${classes}`} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

function getCustomPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  index: number
): string {
  const radius = 10;

  if (index === 2) {
    const verticalX = startX + (endX - startX) * 0.66;
    return `M ${startX} ${startY} L ${verticalX} ${startY} L ${verticalX} ${endY} L ${endX} ${endY}`;
  } else if (index < 2) {
    const verticalX = startX + (endX - startX) * 0.66;
    return `M ${startX} ${startY} L ${verticalX - radius} ${startY} A ${radius} ${radius} 0 0 1 ${verticalX} ${startY + radius} L ${verticalX} ${endY - radius} A ${radius} ${radius} 0 0 0 ${verticalX + radius} ${endY} L ${endX} ${endY}`;
  } else {
    const verticalX = startX + (endX - startX) * 0.66;
    return `M ${startX} ${startY} L ${verticalX - radius} ${startY} A ${radius} ${radius} 0 0 0 ${verticalX} ${startY - radius} L ${verticalX} ${endY + radius} A ${radius} ${radius} 0 0 1 ${verticalX + radius} ${endY} L ${endX} ${endY}`;
  }
}

interface AnimatedDotsProps {
  pathId: string;
  color: string;
}

const AnimatedDots = ({ pathId }: AnimatedDotsProps) => {
  return (
    <g>
      {[...Array(5)].map((_, i) => (
        <circle key={i} r="2">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            begin={`${i * 0.6}s`}
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.8;0"
            dur="3s"
            repeatCount="indefinite"
            begin={`${i * 0.6}s`}
          />
        </circle>
      ))}
    </g>
  );
};

export function TypewriterEffect() {
  // 1) Put all your text in one string (including line breaks).
  const fullText = `# Understanding AI and Machine Learning

Artificial Intelligence (AI) and Machine Learning (ML) are transforming the way we live and work.

## Key Concepts

Machine Learning is a subset of AI that enables systems to learn and improve from experience.

## Applications

1. Natural Language Processing
2. Computer Vision
3. Predictive Analytics

## Future Implications

The future of AI holds tremendous potential for solving complex problems and creating new opportunities.`;

  // The text that’s currently typed on screen
  const [typedText, setTypedText] = useState("");

  // A ref so we can track the current character index (and re-run the effect)
  const currentIndexRef = useRef(0);

  // We'll define a function that starts typing from the beginning
  const startTyping = () => {
    currentIndexRef.current = 0;    // reset the index
    setTypedText("");              // clear text
    typeNextChar();                // begin typing
  };

  // A function that types the next character, then schedules itself
  const typeNextChar = () => {
    const i = currentIndexRef.current;
    // Append one more character
    setTypedText(fullText.slice(0, i + 1));
    currentIndexRef.current = i + 1;

    if (i + 1 < fullText.length) {
      // If there are more characters, schedule the next one
      const nextDelay = 40 + Math.random() * 60; // ~40-100ms
      setTimeout(typeNextChar, nextDelay);
    } else {
      // We've reached the end of the text. Restart after a brief pause.
      setTimeout(() => {
        startTyping(); 
      }, 2000); // Wait 2 seconds, then restart
    }
  };

  useEffect(() => {
    // Start the typing effect once the component mounts
    startTyping();

    // Cleanup if unmounted
    return () => {
      // Cancel any pending timeouts if needed (this is optional, shown for completeness)
      currentIndexRef.current = fullText.length;
    };
  }, []);

  return (
    <div className="font-inter text-sm whitespace-pre-wrap">
      {typedText.split("\n").map((line, i) => {
        const trimmedLine = line.trimStart(); 
        let lineClass = "";

        if (trimmedLine.startsWith("# ")) {
          lineClass = "text-xl font-bold mt-2 mb-2";
        } else if (trimmedLine.startsWith("## ")) {
          lineClass = "text-lg font-bold mt-4";
        } else if (trimmedLine.match(/^\d+\./)) {
          lineClass = "ml-4"; // Just a simple style for list items
        }

        // Remove '#' from displayed text, keep the styling
        const displayLine = trimmedLine.replace(/^#+\s*/, "");

        return (
          <div key={i} className={lineClass}>
            {displayLine}
          </div>
        );
      })}
    </div>
  );
}


export const HowItWorks = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [blogContainerPath, setBlogContainerPath] = useState<string>("");
  const logoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blogContainerRef = useRef<HTMLDivElement>(null);
  const formatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const formats: Format[] = [
    {
      icon: FileText,
      label: "PDF Documents",
      align: "ml-20",
      classes: "text-red-700",
    },
    {
      icon: FileType,
      label: "Word Documents",
      align: "ml-10",
      classes: "text-blue-600",
    },
    {
      icon: MessageSquare,
      label: "Conversations",
      align: "ml-0",
      classes: "text-zinc-800",
    },
    {
      icon: StickyNote,
      label: "Notes & Drafts",
      align: "ml-10",
      classes: "text-amber-500",
    },
    {
      icon: Mic,
      label: "Podcast Transcripts",
      align: "ml-20",
      classes: "text-blue-500",
    },
  ];

  useEffect(() => {
    const calculatePaths = () => {
      if (
        !logoRef.current ||
        !containerRef.current ||
        !blogContainerRef.current
      )
        return;

      const newPaths: string[] = [];
      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const blogRect = blogContainerRef.current.getBoundingClientRect();

      formatRefs.current.forEach((formatEl, index) => {
        if (!formatEl) return;
        const formatRect = formatEl.getBoundingClientRect();

        const startX = formatRect.right - containerRect.left;
        const startY =
          formatRect.top - containerRect.top + formatRect.height / 2;
        const endX = logoRect.left - containerRect.left;
        const endY = logoRect.top - containerRect.top + logoRect.height / 2;

        const path = getCustomPath(startX, startY, endX, endY, index);
        newPaths.push(path);
      });

      const logoToBlogPath = (() => {
        const startX = logoRect.right - containerRect.left;
        const startY = logoRect.top - containerRect.top + logoRect.height / 2;
        const endX = blogRect.left - containerRect.left;
        const endY = blogRect.top - containerRect.top;
        const blogContainerHeight = blogRect.height;
        const blogMidX = endX + blogRect.width / 2;
        const radius = 30;
        const straightEndX = endX - 100;
        const upwardY = startY - blogContainerHeight / 2 - 30;

        return `M ${startX} ${startY} 
                L ${straightEndX - radius} ${startY}
                A ${radius} ${radius} 0 0 0 ${straightEndX} ${startY - radius}
                L ${straightEndX} ${upwardY + radius}
                A ${radius} ${radius} 0 0 1 ${straightEndX + radius} ${upwardY}
                L ${blogMidX - radius} ${upwardY}
                A ${radius} ${radius} 0 0 1 ${blogMidX} ${upwardY + radius}
                L ${blogMidX} ${endY}`;
      })();

      setPaths(newPaths);
      setBlogContainerPath(logoToBlogPath);
    };

    const timer = setTimeout(calculatePaths, 100);
    window.addEventListener("resize", calculatePaths);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePaths);
    };
  }, []);

  return (
    <div className="relative h-[600px] mt-10 px-20" ref={containerRef}>
<div className="absolute bottom-0 left-0 right-0  z-10 h-[100px] bg-gradient-to-t from-muted to-transparent" />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#384152" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#384152" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {paths.map((path, index) => (
          <g key={index}>
            <path
              id={`path-${index}`}
              d={path}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              fill="none"
              className="opacity-40"
            />
            <AnimatedDots pathId={`path-${index}`} color="#384152" />
          </g>
        ))}

        <g>
          <path
            id="blog-path"
            d={blogContainerPath}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            className="opacity-40"
          />
          <AnimatedDots pathId="blog-path" color="#384152" />
        </g>
      </svg>

      <div className="h-full flex justify-center items-center gap-[200px] p-8">
        <div className="flex flex-col gap-10">
          {formats.map((format, index) => (
            <div
              key={format.label}
              className={`${format.align} w-fit`}
              ref={(el) => {
                if (el) {
                  formatRefs.current[index] = el;
                }
              }}
            >
              <FormatBadge {...format} />
            </div>
          ))}
        </div>

        <div
          ref={logoRef}
          className="w-40 h-40 bg-white rounded-sm border border-muted-foreground"
        >
            <LogoParticles />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0"
                y1="0"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="hsl(221.2 83.2% 53.3%)"
                  stopOpacity="1"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(217.2 91.2% 59.8%)"
                  stopOpacity="1"
                />
              </linearGradient>
            </defs>
            <rect
              x="25"
              y="30"
              width="20"
              height="4"
              fill="384152"
              opacity="0.9"
              transform="rotate(-15, 35, 32)"
            />
            <rect
              x="55"
              y="35"
              width="15"
              height="4"
              fill="384152"
              opacity="0.9"
              transform="rotate(10, 62.5, 37)"
            />
            <rect
              x="30"
              y="45"
              width="25"
              height="4"
              fill="384152"
              opacity="0.9"
              transform="rotate(-5, 42.5, 47)"
            />
            <rect
              x="35"
              y="55"
              width="30"
              height="4"
              fill="384152"
              opacity="0.9"
            />
            <rect
              x="35"
              y="63"
              width="30"
              height="4"
              fill="384152"
              opacity="0.9"
            />
            <rect
              x="35"
              y="71"
              width="30"
              height="4"
              fill="384152"
              opacity="0.9"
            />
          </svg>
        </div>
        <div
  ref={blogContainerRef}
  className="relative w-[400px] h-[410px] border-[2px] border-muted-foreground/30 rounded-md bg-white p-4 bg-gradient-to-b from-muted-foreground/20 to-transparent shadow-lg animate-in fade-in duration-1000 delay-500"
>
  <div className="absolute -top-[70px] left-3/4 z-10">
    <Arrow8 className="w-16 h-16" />
  </div>
  <span className="absolute -top-[100px] -right-[100px] border border-muted-foreground px-2 py-1 rounded-lg text-black bg-white animate-in fade-in duration-700 delay-700">
    generated blog
  </span>
  <div className="animate-in fade-in duration-1000 delay-1000">
    <TypewriterEffect />
  </div>
</div>
      </div>
    </div>
  );
};

export default HowItWorks;


const Arrow8 = forwardRef<Arrow8Element, Arrow8Props>(
  (props, forwardedRef) => (
<svg width="144" height="141" viewBox="0 0 144 141" fill="none" xmlns="http://www.w3.org/2000/svg" ref={forwardedRef} {...props}>
<path fill-rule="evenodd" clip-rule="evenodd" d="M129.189 0.0490494C128.744 0.119441 126.422 0.377545 124.03 0.635648C114.719 1.6446 109.23 2.4893 108.058 3.09936C107.119 3.56864 106.674 4.34295 106.674 5.44576C106.674 6.71281 107.424 7.51058 109.043 7.97986C110.403 8.37875 110.825 8.42567 118.87 9.52847C121.778 9.92736 124.288 10.3028 124.475 10.3732C124.663 10.4436 122.951 11.1006 120.676 11.8749C110.028 15.4414 100.412 20.7677 91.7339 27.9242C88.38 30.7164 81.6957 37.4271 79.2096 40.5009C73.8387 47.2116 69.6874 54.8139 66.5681 63.7302C65.9348 65.4665 65.3484 66.8978 65.2546 66.8978C65.1374 66.8978 63.7771 66.7336 62.2291 66.5693C52.9649 65.5134 43.1847 68.1649 34.1316 74.2186C24.7735 80.46 18.5349 87.7338 10.5371 101.742C2.53943 115.726 -1.0959 127.482 0.287874 135.014C0.89767 138.463 2.0469 140.035 3.97011 140.082C5.28352 140.105 5.37733 139.659 4.20465 139.049C3.05541 138.463 2.6567 137.9 2.32835 136.281C0.616228 128.021 6.24512 113.028 17.4325 96.1104C23.2725 87.241 28.362 81.9147 35.5622 77.1046C43.8649 71.5437 52.7069 69.033 61.1737 69.8308C64.9967 70.1828 64.6917 69.9247 64.1992 72.4822C62.2525 82.5013 63.8005 92.6378 67.9753 97.354C73.1116 103.079 81.9771 102 85.0027 95.2657C86.3395 92.2858 86.3864 87.7103 85.1434 83.9796C83.1498 78.0901 80.007 73.8197 75.4335 70.8163C73.8152 69.7604 70.4848 68.1883 69.875 68.1883C69.359 68.1883 69.4294 67.6487 70.2268 65.3257C72.3377 59.2486 75.457 52.7021 78.4122 48.244C83.2436 40.9232 91.4524 32.5701 99.1687 27.103C105.806 22.4102 113.241 18.5386 120.512 16.0045C123.772 14.8548 129.87 13.1889 130.081 13.3766C130.128 13.447 129.541 14.362 128.791 15.4414C124.78 21.0258 122.716 26.0706 122.388 30.998C122.224 33.7198 122.341 34.588 122.88 34.2595C122.998 34.1891 123.678 32.969 124.405 31.5611C126.281 27.8069 131.722 20.6738 139.579 11.6402C141.127 9.85697 142.652 7.86254 143.027 7.08823C144.552 4.03792 143.52 1.48035 140.377 0.471397C139.439 0.166366 138.102 0.0490408 134.584 0.0255769C132.074 -0.021351 129.635 0.00212153 129.189 0.0490494ZM137.117 4.92955C137.187 5.0234 136.718 5.63346 136.061 6.29045L134.865 7.48712L131.042 6.73627C128.931 6.33739 126.727 5.9385 126.14 5.8681C124.827 5.68039 124.123 5.32843 124.968 5.28151C125.296 5.28151 126.868 5.11725 128.486 4.953C131.3 4.64797 136.812 4.62451 137.117 4.92955ZM71.5168 72.5292C76.2075 74.899 79.4441 78.8175 81.3204 84.355C83.6189 91.1361 81.2266 96.8378 76.0433 96.8847C73.3227 96.9082 70.9773 95.2188 69.5936 92.2389C68.2802 89.4232 67.6938 86.5606 67.5765 82.1259C67.4593 78.3248 67.6 76.4242 68.2333 72.7403L68.4912 71.2856L69.359 71.5906C69.8515 71.7548 70.8132 72.1772 71.5168 72.5292Z" fill="currentColor"/>
</svg>
 
));
Arrow8.displayName = "Arrow8";
