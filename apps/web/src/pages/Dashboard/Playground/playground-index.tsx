import { PlaygroundProvider } from "@/providers/playground-provider";
import { PlaygroundTabs } from "./playground-tabs";


export const PlaygroundIndex = () => {
  return (
    <PlaygroundProvider>
      <PlaygroundTabs />
    </PlaygroundProvider>
  );
};


