import { TipTapNodeType } from "@dumpanddone/types";

type BlogParserState =
 | "WAITING_FOR_START"
 | "BUILDING_STATE"
 | "BUILDING_NODE"
 | "IN_JSON";

type BlogParserListener = {
 onState: (state: string) => void;
 onNode: (node: TipTapNodeType) => void;
};

type BlogState = "WAITING" | "BUILDING"

class BlogParser {
 private buffer: string = "";
 private currentState: BlogParserState = "WAITING_FOR_START";
 private bracketCount: number = 0
 private currentToken: string = "";
 private isStarted: boolean = false;
 private listeners: BlogParserListener[] = [];
 public blogState: BlogState = "WAITING"

 receiveEvents(listener: BlogParserListener) {
   this.listeners.push(listener);
 }

 removeListener(listener: BlogParserListener) {
   this.listeners = this.listeners.filter(l => l !== listener);
 }

 private emitState(state: string) {
   console.log("🔄 State built:", state);
   this.listeners.forEach((listener) => listener.onState(state));
 }

 private emitNode(node: TipTapNodeType) {
   console.log("📦 Node built:", node);
   this.listeners.forEach((listener) => listener.onNode(node));
 }

 parse(event: any) {
   try {
     const parsed = JSON.parse(event.data);

     if (parsed.type === "BLOG_COMPLETE") {
       this.emitState("BLOG_COMPLETE");
       this.blogState = "WAITING"
       return;
     }

     if (parsed.type === "BLOG_CHUNK") {
       this.buffer += parsed.content;
       this.processBuffer();
     }
   } catch (e) {
     console.error("Error in parse:", e);
   }
 }

 private extractCompleteNode(startIndex: number): { node: TipTapNodeType | null, endIndex: number } {
   let bracketCount = 1;
   let currentIndex = startIndex + 1;
   
   while (currentIndex < this.buffer.length && bracketCount > 0) {
     if (this.buffer[currentIndex] === "{") bracketCount++;
     if (this.buffer[currentIndex] === "}") bracketCount--;
     currentIndex++;
   }

   if (bracketCount === 0) {
     try {
       const jsonStr = this.buffer.slice(startIndex, currentIndex);
       const parsedNode = JSON.parse(jsonStr);
       return { node: parsedNode, endIndex: currentIndex };
     } catch (e) {
       console.error("Failed to parse NODE object:", e);
     }
   }
   
   return { node: null, endIndex: startIndex };
 }

 private processBuffer() {
   while (this.buffer.length > 0) {
     if (!this.isStarted && this.buffer.includes("START_STREAM")) {
       this.isStarted = true;
       this.buffer = this.buffer.slice(
         this.buffer.indexOf("START_STREAM") + "START_STREAM".length
       );
       continue;
     }

     if (this.buffer.includes("END_STREAM")) {
       this.isStarted = false;
       this.buffer = "";
       this.currentState = "WAITING_FOR_START";
       break;
     }

     if (this.buffer.includes("STATE:")) {
       const stateStart = this.buffer.indexOf("STATE:");
       const stateEnd = this.buffer.indexOf("\n", stateStart);
       if (stateEnd === -1) break;

       const state = this.buffer.slice(stateStart + 6, stateEnd).trim();
       this.emitState(state);
       this.buffer = this.buffer.slice(stateEnd + 1);
       continue;
     }

     if (this.buffer.includes("NODE:")) {
       const nodeStart = this.buffer.indexOf("NODE:") + 5;
       const jsonStartIndex = this.buffer.indexOf("{", nodeStart);
       
       if (jsonStartIndex === -1) break;
       
       const { node, endIndex } = this.extractCompleteNode(jsonStartIndex);
       if (!node) break;

       this.emitNode(node);
       this.buffer = this.buffer.slice(endIndex);
       continue;
     }

     break;
   }
 }

 reset() {
   this.buffer = "";
   this.currentState = "WAITING_FOR_START";
   this.bracketCount = 0;
   this.currentToken = "";
   this.isStarted = false;
   this.listeners = [];
 }
}

export const blogParser = new BlogParser();