import { RefObject } from "react";

interface OutlineCardProps {
  outlineCardRef: RefObject<HTMLDivElement>;
  shouldAnimate?: boolean; // Controls when to trigger bar animations
}

const Star = ({ color }: { color: string }) => (
  <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0">
    <path
      fill={color}
      d="M8 0l2.5 5 5.5 0.8-4 3.9 1 5.3-5-2.6-5 2.6 1-5.3-4-3.9 5.5-0.8z"
    />
  </svg>
);

const Triangle = ({ color }: { color: string }) => (
  <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0">
    <path fill={color} d="M8 2l6 12H2z" />
  </svg>
);

/**
 * AnimatedBar: Expands from 0% to 100% width over 2 seconds
 * when `shouldAnimate` is true; hides otherwise.
 */
const AnimatedBar = ({
  color,
  shouldAnimate,
}: {
  color: string;
  shouldAnimate: boolean;
}) => {
  return (
    <div className="h-3 rounded-lg overflow-hidden w-full bg-gray-50">
      <div
        className={`
          h-full rounded-lg transition-all 
          duration-[2000ms] ease-out 
          ${shouldAnimate ? "w-full opacity-100" : "w-0 opacity-0"}
        `}
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} 60%, transparent 100%)`,
          transitionProperty: "width, opacity",
        }}
      ></div>
    </div>
  );
};

export const Outline = ({
  outlineCardRef,
  shouldAnimate = false,
}: OutlineCardProps) => {
  const lightColors = [
    "rgba(255, 179, 179, 1)", // Light Coral
    "rgba(150, 206, 180, 1)", // Sage
    "rgba(255, 190, 11, 1)",  // Yellow
    "rgba(255, 135, 178, 1)", // Pink
    "rgba(136, 212, 235, 1)", // Light Blue
    "rgba(255, 212, 178, 1)", // Peach
  ];

  const darkColors = [
    "rgba(220, 60, 60, 1)",   // Dark Coral
    "rgba(67, 134, 112, 1)",  // Dark Sage
    "rgba(212, 145, 0, 1)",   // Dark Gold
    "rgba(198, 52, 115, 1)",  // Dark Pink
    "rgba(41, 128, 185, 1)",  // Dark Blue
    "rgba(215, 126, 57, 1)",  // Dark Peach
  ];

  return (
    <div ref={outlineCardRef} className="w-full h-[250px] rounded-md bg-white p-2">
      <div className="flex flex-col gap-7">
        {/* Circle */}
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: darkColors[0] }}
          ></div>
          <AnimatedBar color={lightColors[0]} shouldAnimate={shouldAnimate} />
        </div>

        {/* Rectangle */}
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-sm shrink-0"
            style={{ backgroundColor: darkColors[1] }}
          ></div>
          <AnimatedBar color={lightColors[1]} shouldAnimate={shouldAnimate} />
        </div>

        {/* Star */}
        <div className="flex items-center gap-3">
          <Star color={darkColors[2]} />
          <AnimatedBar color={lightColors[2]} shouldAnimate={shouldAnimate} />
        </div>

        {/* Triangle */}
        <div className="flex items-center gap-3">
          <Triangle color={darkColors[3]} />
          <AnimatedBar color={lightColors[3]} shouldAnimate={shouldAnimate} />
        </div>

        {/* Circle (repeated) */}
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: darkColors[4] }}
          ></div>
          <AnimatedBar color={lightColors[4]} shouldAnimate={shouldAnimate} />
        </div>

        {/* Rectangle (repeated) */}
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-sm shrink-0"
            style={{ backgroundColor: darkColors[5] }}
          ></div>
          <AnimatedBar color={lightColors[5]} shouldAnimate={shouldAnimate} />
        </div>
      </div>
    </div>
  );
};

export default Outline;
