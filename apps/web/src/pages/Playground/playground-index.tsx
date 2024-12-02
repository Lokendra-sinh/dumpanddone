import { PlaygroundProvider } from "@/providers/playground-provider";
import Playground from "./Playground";

export const PlaygroundIndex = () => {
  return (
    <PlaygroundProvider>
      <Playground />
    </PlaygroundProvider>
  );
};
