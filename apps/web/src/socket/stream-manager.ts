import { socketClient } from './socket-client';
import { blogParser } from "./blog-parser";
import { outlineParser } from "./outline-parser";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";

type StreamType = "BLOG" | "OUTLINE" | "EDIT_BLOG";
type StreamState = "WAITING" | "BUILDING" | "ERROR" | "CANCELLED";
type EventType = "BLOG_PROGRESS" | "OUTLINE_PROGRESS" | "EDIT_BLOG_PROGRESS";

// Type for the metadata that comes with stream events
interface StreamEventMetadata {
  requestId: string;
  userId: string;
  blogId: string;
  selectedModel: ModelsType;
  outline?: OutlineSectionType[];
  chaos?: string;
}

interface StreamMetadata {
  stream: StreamType;
  eventType: EventType;
  state: StreamState;
  requestId: string;
  started_at: Date;
  completed_at: Date | null;
  error?: string;
  progress?: number;
}

class StreamManager {
  private userId: string | null = null
  private currentStream: StreamMetadata | null = null;
  private abortCallbacks: Map<string, () => void> = new Map()
  private readonly parsers: Record<StreamType, any> = {
    OUTLINE: outlineParser,
    BLOG: blogParser,
    EDIT_BLOG: blogParser
  };

  initialize(userId: string){
    if(this.userId){
     return
    }

    this.userId = userId
  }

  private handleStreamStart(type: StreamType, metadata: StreamEventMetadata) {
    if (this.isCurrentlyStreaming()) {
      throw new Error(`Cannot start ${type} stream while ${this.currentStream?.stream} is in progress`);
    }

    socketClient.setDisconnectHandler(() => this.handleDisconnection())


    this.currentStream = {
      stream: type,
      eventType: `${type}_PROGRESS` as EventType,
      state: "BUILDING",
      requestId: metadata.requestId,
      started_at: new Date(),
      completed_at: null,
      progress: 0
    };

    const parser = this.parsers[type];
    if (parser === blogParser) {
      const streamType = type === 'BLOG' ? 'WRITE_BLOG' : 'EDIT_BLOG';
      parser.setStreamType(streamType);
  }
  parser.reset();
  }

  private handleStreamProgress(event: MessageEvent) {
    if (!this.currentStream) return;

    const parser = this.parsers[this.currentStream.stream];
    console.log("Parser is", parser);
    try {
      parser.parse(event);
      // this.currentStream.progress = parser.getProgress();
    } catch (error) {
      this.handleStreamError(error);
    }
  }

  private handleStreamEnd() {
    if (!this.currentStream) return;
    
    // First cleanup parser
    const parser = this.parsers[this.currentStream.stream];
    if(this.currentStream.stream === "OUTLINE"){
      parser.finalize();
    }
    
    // Then update stream state
    this.currentStream.completed_at = new Date();
    this.currentStream.state = "WAITING";
    
    // Finally remove handler and reset stream
    socketClient.removeDisconnectHandler();
    this.currentStream = null;
  }

  private handleStreamError(error: any) {
    if (!this.currentStream) return;

    this.currentStream.state = "ERROR";
    this.currentStream.error = error.message;

    // this.abortStream();
  }

  private handleDisconnection() {
    if (!this.currentStream) return;
 
    this.currentStream.state = "CANCELLED";
    socketClient.disconnect();
    socketClient.removeDisconnectHandler();
    this.currentStream = null;
  }

  receiver(event: MessageEvent) {
    console.log("event received in MANAGER", JSON.parse(event.data));
    try {
      const parsedEvent = JSON.parse(event.data);
      const { type, ...metadata } = parsedEvent;

      switch (type) {
        case "OUTLINE_START":
          this.handleStreamStart("OUTLINE", metadata);
          break;
        case "BLOG_START":
          this.handleStreamStart("BLOG", metadata);
          break;
        case "EDIT_BLOG_START":
          this.handleStreamStart("EDIT_BLOG", metadata);
          break;
        case "OUTLINE_PROGRESS":
        case "BLOG_PROGRESS":
        case "EDIT_BLOG_PROGRESS":
          this.handleStreamProgress(event);
          break;

        case "OUTLINE_END":
        case "BLOG_END":
        case "EDIT_BLOG_END":
          this.handleStreamEnd();
          break;
        
        case "STREAM_ABORTED":
          this.abortedStream(metadata)
          break;
        default:
          console.warn(`Unknown event type received: ${type}`);
      }
    } catch (error) {
      console.error("Failed to parse or process event:", error);
      if (this.currentStream) {
        this.handleStreamError(error);
      }
    }
  }

  isCurrentlyStreaming(): boolean {
    return this.currentStream?.state === "BUILDING";
  }

  abortedStream(metadata: StreamMetadata){
    const resolveAbort = this.abortCallbacks.get(metadata.requestId)
    if(resolveAbort){
      resolveAbort()
      this.abortCallbacks.delete(metadata.requestId)
      socketClient.removeDisconnectHandler()
      this.currentStream = null
    }
  }

  abortStream(): Promise<void> {
    if (!this.currentStream) return Promise.resolve();

    return new Promise((resolve) => {
      // Store the resolve function using requestId as key
      this.abortCallbacks.set(this.currentStream!.requestId, resolve);
      
      console.log("Sending abort signal to server for ", this.currentStream?.requestId);
      // Send abort request
      socketClient.sendMessage({
        type: "ABORT_STREAM",
        userId: this.userId!,
        requestId: this.currentStream!.requestId
      });
    });
  }

  getStreamStatus() {
    if (!this.currentStream) return null;
    
    return {
      type: this.currentStream.stream,
      state: this.currentStream.state,
      progress: this.currentStream.progress,
      duration: this.currentStream?.completed_at 
        ? this.currentStream.completed_at.getTime() - this.currentStream.started_at.getTime()
        : Date.now() - this.currentStream.started_at.getTime()
    };
  }
}

export const streamManager = new StreamManager();