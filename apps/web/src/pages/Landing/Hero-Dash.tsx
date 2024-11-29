import { forwardRef } from "react";
import DashImage from "../../assets/images/dashboard.png";

interface HeroDashProps {
  isGlowing: boolean
}

export const HeroDash = forwardRef<HTMLDivElement, HeroDashProps>((props, ref) => {
  const { isGlowing } = props;
  
  
  return (
    <div
      ref={ref}
      className="w-full relative flex flex-col items-center justify-center"
    >
      <div 
        className={`
          w-3/4 rounded-md flex items-center justify-center 
          bg-gradient-to-b from-purple-800 to-transparent 
          shadow-[0_0_5px_5px] shadow-purple-500/50
          transition-all duration-300
          ${isGlowing ? 'animate-shadow-pulse' : ''}
        `}
      >
        <img
          src={DashImage}
          alt="dashboard image"
          className="rounded-[16px] p-1"
        />
      </div>
    </div>
  );
});

HeroDash.displayName = 'HeroDash';
