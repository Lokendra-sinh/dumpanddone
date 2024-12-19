import { v4 as uuidv4 } from "uuid";
import type { WebSocket, WebSocketServer } from "ws";
import { startOutlineStreaming } from "../models/outine-streaming";
import { addChaos } from "../db/queries/addContent";
import { startBlogStreaming } from "../models/stream-blog";

export interface ModifiedWebSocketInstanceType extends WebSocket {
  blogId: string;
}

export interface RequestStateType {
  ws: ModifiedWebSocketInstanceType;
  blogId: string;
  userId: string;
  requestId: string;
  startTime: Date;
}

export class Socket {
  private wss: WebSocketServer;
  private requests: Map<string, unknown> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupConnectionListener();
  }

  private setupConnectionListener() {
    this.wss.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(ws: ModifiedWebSocketInstanceType) {
    this.setupMessageHandler(ws);
    this.setupCloseHandler(ws);
    this.setupErrorHandler(ws);
    this.sendConnectionConfirmation(ws);
  }

  private setupMessageHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("message", (message: string) => {
      try {
        // Move parsing inside try-catch
        const parsedMessage = JSON.parse(message.toString());
        const requestId = uuidv4();

        const requestState: RequestStateType = {
          ws,
          requestId,
          blogId: parsedMessage.blogId,
          userId: parsedMessage.userId,
          startTime: new Date(),
        };

        this.requests.set(requestId, requestState);
        const selectedModel = parsedMessage.selectedModel;

        switch (parsedMessage.type) {
          case "START_OUTLINE_STREAM":
            addChaos({
              chaos: parsedMessage.chaos,
              userId: parsedMessage.userId,
              blogId: parsedMessage.blogId,
            });
            startOutlineStreaming(
              parsedMessage.chaos,
              requestState,
              selectedModel
            );
            break;

          case "START_BLOG_STREAM":
            // Ensure we have necessary data
            if (
              !parsedMessage.outline ||
              !parsedMessage.userId ||
              !parsedMessage.blogId
            ) {
              throw new Error("Missing required data for blog generation");
            }

            startBlogStreaming({
              outline: parsedMessage.outline,
              userId: parsedMessage.userId,
              blogId: parsedMessage.blogId,
              requestState,
              selectedModel,
            });
            break;

          case "STOP_OUTLINE_STREAM":
          case "STOP_BLOG_STREAM":
            // Maybe add cleanup logic here later
            break;

          default:
            console.log("Unknown message type:", parsedMessage.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message:
              error instanceof SyntaxError ? "Invalid message format" : error,
          })
        );
      }
    });
  }

  private setupCloseHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("close", () => {
      console.log("Client disconnected");

      for (const [requestId, state] of this.requests.entries()) {
        const requestState = state as RequestStateType;

        if (requestState.ws === ws) {
          this.requests.delete(requestId);
          console.log(`Cleaned up request: ${requestId}`);
        }
      }
    });
  }

  private setupErrorHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  private sendConnectionConfirmation(ws: ModifiedWebSocketInstanceType) {
    ws.send(
      JSON.stringify({
        type: "CONNECTION_ESTABLISHED",
        message: "Connected to server",
      })
    );
  }
}
