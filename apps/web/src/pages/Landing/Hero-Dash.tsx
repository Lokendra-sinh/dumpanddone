import { forwardRef } from "react";
import DashImage from "../../assets/images/dashboard.png";

export const HeroDash = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="w-full relative flex flex-col items-center justify-center">
      <div className="w-3/4 rounded-md flex items-center justify-center bg-gradient-to-b from-purple-800 to-transparent shadow-[0_0_20px_5px] shadow-purple-500">
        <img src={DashImage} alt="dashboard image" className="rounded-[16px] p-1" />
      </div>

    </div>
  );
});
