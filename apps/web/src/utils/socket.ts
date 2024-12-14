
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";

interface SendMessageProps {
  type: "START_STREAM" | "STOP_STREAM";
  chaos: string;
  userId: string;
  blogId: string;
  selectedModel: ModelsType
}

// type WebSocketOutlineMessage =
//   | { type: "OUTLINE_START"; blogId: string }
//   | { type: "OUTLINE_COMPLETE"; blogId: string }
//   | { content: string }

type CurrentStateType = "BUILDING_TAG" | "CLOSING_TAG" | "COLLECTING";

type CollectStateType = "TITLE" | "DESCRIPTION";

type OutlineType = OutlineSectionType[];

class SocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  buffer: string = "";
  currentState: CurrentStateType = "BUILDING_TAG";
  collectState: CollectStateType = "TITLE";
  section: OutlineSectionType = {
    title: "",
    description: "",
    id: "",
    isEdited: false,
  };
  outline: OutlineType = [];
  private listeners: ((callback: OutlineSectionType) => void)[] = [];

  private emitSection(partialSection: { title: string; description: string }) {
    const completeSection: OutlineSectionType = {
      ...partialSection,
      id: crypto.randomUUID(), // Generate unique ID
      isEdited: false,
    };
    this.listeners.forEach((listener) => listener(completeSection));
  }

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
        console.log("EVENT is", event);
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "OUTLINE_START") {
            // const activeBlogId = useBlogsStore.getState().activeBlog?.id;
            // console.log("activeBlog id is", activeBlogId);
            // if(activeBlogId !== parsed.blogId){
            //   // should never happen. something doesn't feel right
            //   throw new Error("Blog Ids does not match")
            // }
            // this.emitSection({
            //   title: "OUTLINE_START",
            //   description: "OUTLINE_START",
            // });
            return;
          }

          if (parsed.type === "OUTLINE_COMPLETE") {
            this.emitSection({
              title: "OUTLINE_COMPLETE",
              description: "OUTLINE_COMPLETE",
            });
            return;
          }

        } catch(e) {
          console.log("error is", e);
          for (let i = 0; i < event.data.length; i++) {

            const ch = event.data[i];
            switch (this.currentState) {
              case "BUILDING_TAG":
                this.buffer += ch;
                if (this.buffer.includes("<t>")) {
                  this.collectState = "TITLE";
                  this.currentState = "COLLECTING";
                } else if (this.buffer.includes("<d>")) {
                  this.collectState = "DESCRIPTION";
                  this.currentState = "COLLECTING";
                }
                break;
              case "COLLECTING":
                if (ch === "<") {
                  this.buffer += ch;
                  this.currentState = "CLOSING_TAG";
                } else {
                  if (this.collectState === "TITLE") {
                    this.section.title += ch;
                  } else if (this.collectState === "DESCRIPTION") {
                    this.section.description += ch;
                  }
                }
                break;

              case "CLOSING_TAG":
                this.buffer += ch;
                if (this.buffer.includes("</t>")) {
                  this.buffer = "";
                  this.currentState = "BUILDING_TAG";
                } else if (this.buffer.includes("</d>")) {
                  this.buffer = "";
                  this.currentState = "BUILDING_TAG";
                  this.outline.push(this.section);
                  this.emitSection(this.section);
                  this.section = {
                    title: "",
                    description: "",
                    id: "",
                    isEdited: false,
                  };
                }
                break;
            }
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

  onSection(callback: (section: OutlineSectionType) => void) {
    this.listeners.push(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
