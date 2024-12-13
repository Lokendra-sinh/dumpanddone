import { ThemeProviderContext } from "@/providers/theme-provider";
import { useContext } from "react";
import { Textarea } from "@dumpanddone/ui"



export const ScanningTextArea = ({ value, onChange, isScanning = false }) => {
    const { theme } = useContext(ThemeProviderContext);
    const gradientColor = theme === "dark" ? "255,255,255" : "0,0,0";
    return (
      <div className="relative w-full h-[400px]">
        <Textarea
          placeholder="Paste your content here..."
          className={`h-[400px] relative w-full ${isScanning && "text-foreground/40"}`}
          value={value}
          onChange={onChange}
        />
        {isScanning && (
          <svg
            className="absolute inset-0 pointer-events-none rounded-lg"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="scanlineGradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2="150"
              >
                <stop offset="0%" stopColor={`rgba(${gradientColor}, 0)`} />
                <stop offset="50%" stopColor={`rgba(${gradientColor}, 0.2)`} />
                <stop offset="100%" stopColor={`rgba(${gradientColor}, 0)`} />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="0,-150; 0,400; 0,-150"
                  dur="2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#scanlineGradient)"
            />
          </svg>
        )}
      </div>
    );
  };