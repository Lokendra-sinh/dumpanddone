import { useBlogsStore } from "@/store/useBlogsStore";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { outlineParser } from "./outline-parser";
import { blogParser } from "./blog-parser";

interface SendMessageProps {
  type: "START_OUTLINE_STREAM" | "STOP_OUTLINE_STREAM" | "START_BLOG_STREAM" | "STOP_BLOG_STREAM"
  chaos?: string;
  userId: string;
  blogId: string;
  selectedModel: ModelsType
  outline?: OutlineSectionType[]
}

class SocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private currentlyparsing: "blog" | "outline" = "outline"
  


  constructor() {
    this.url = "ws://localhost:4000";
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("connected to websocket server");
      };

      this.socket.onmessage = (event) => {
        // console.log("event is", event);
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "OUTLINE_START") {
            const activeBlogId = useBlogsStore.getState().activeBlog;
            if(activeBlogId !== parsed.blogId){
              throw new Error("Blog Ids does not match")
            }
            this.currentlyparsing = "outline"
            return;
          }


          if (parsed.type === "BLOG_START") {
            // const activeBlogId = useBlogsStore.getState().activeBlog;
            // if(activeBlogId !== parsed.blogId){
            //   throw new Error("Blog Ids does not match")
            // }
            this.currentlyparsing = "blog"
            blogParser.blogState = "BUILDING"
            return;
          }

          if (parsed.type === "OUTLINE_COMPLETE") {
             outlineParser.parse(event)
             return;
          }

          if(parsed.type === "BLOG_COMPLETE"){
            blogParser.parse(event)
            return
          }

          if(parsed.type === "BLOG_CHUNK"){
            blogParser.parse(event)
          }

        } catch {
          // console.log("error is", e);
          switch(this.currentlyparsing){
            case "outline":
                outlineParser.parse(event)
                break;
            case "blog":
                blogParser.parse(event)
                break;
                
          }
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.socket.onclose = (event) => {
        console.log(
          "Disconnected from WebSocket server:",
          event.code,
          event.reason
        );
        // You might want to implement reconnection logic here
      };
    } catch (e) {
      console.error("Failed to connect to WebSocket server:", e);
    }
  }

  sendMessage(message: SendMessageProps) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();