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
  type: 'OUTLINE' | 'WRITE_BLOG' | 'EDIT_BLOG'
  status: 'active' | 'completed' | 'aborted';
}

interface ConnectionInfo {
  socketId: string;
  userId: string;
  blogId: string;
  connectedAt: Date;
  lastActivityAt: Date;
  activeRequests: Map<string, RequestStateType>;
}

export class Socket {
  private wss: WebSocketServer;
  private userConnections: Map<string, ConnectionInfo> = new Map();
  private requests: Map<string, RequestStateType> = new Map();

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

  private createRequestState(
    ws: ModifiedWebSocketInstanceType, 
    userId: string, 
    blogId: string,
    type: 'OUTLINE' | 'WRITE_BLOG' | "EDIT_BLOG"
  ): RequestStateType {
    return {
      ws,
      requestId: uuidv4(),
      blogId,
      userId,
      startTime: new Date(),
      type,
      status: 'active'
    };
  }

  private updateConnectionInfo(userId: string, blogId: string, requestState: RequestStateType): ConnectionInfo {
    let connectionInfo = this.userConnections.get(userId);
    
    if (!connectionInfo) {
      connectionInfo = {
        socketId: uuidv4(),
        userId,
        blogId,
        connectedAt: new Date(),
        lastActivityAt: new Date(),
        activeRequests: new Map()
      };
      this.userConnections.set(userId, connectionInfo);
    }


    connectionInfo.lastActivityAt = new Date();
    
    connectionInfo.activeRequests.set(requestState.requestId, requestState);
    this.requests.set(requestState.requestId, requestState);

    return connectionInfo;
  }

  private validateMessage(message: any, requiredFields: string[]) {
    for (const field of requiredFields) {
      if (!message[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private handleOutlineStream(ws: ModifiedWebSocketInstanceType, message: any) {
    this.validateMessage(message, ['userId', 'blogId', 'chaos', 'selectedModel']);

    const requestState = this.createRequestState(ws, message.userId, message.blogId, 'OUTLINE');
    this.updateConnectionInfo(message.userId, message.blogId, requestState);

    addChaos({
      chaos: message.chaos,
      userId: message.userId,
      blogId: message.blogId,
    });

    startOutlineStreaming({
      chaos: message.chaos,
      requestState,
      selectedModel: message.selectedModel
  });

    return requestState;
  }

  private handleBlogStream(ws: ModifiedWebSocketInstanceType, message: any) {
    this.validateMessage(message, ['userId', 'blogId', 'outline', 'selectedModel']);

    const requestState = this.createRequestState(ws, message.userId, message.blogId, 'WRITE_BLOG');
    this.updateConnectionInfo(message.userId, message.blogId, requestState);

    startBlogStreaming({
      outline: message.outline,
      userId: message.userId,
      blogId: message.blogId,
      requestState,
      selectedModel: message.selectedModel,
    });

    return requestState;
  }

  private handleEditBlogStream(ws: ModifiedWebSocketInstanceType, message: any) {
    this.validateMessage(message, ['userId', 'blogId', 'outline', 'selectedModel']);

    const requestState = this.createRequestState(ws, message.userId, message.blogId, 'EDIT_BLOG');
    this.updateConnectionInfo(message.userId, message.blogId, requestState);

    startBlogStreaming({
      outline: message.outline,
      userId: message.userId,
      blogId: message.blogId,
      requestState,
      selectedModel: message.selectedModel,
    });

    return requestState;
  }

  private handleStreamAbort(ws: ModifiedWebSocketInstanceType, message: any) {
    this.validateMessage(message, ['userId', 'requestId']);

    const connectionInfo = this.userConnections.get(message.userId);
    if (!connectionInfo) {
      console.log("User not found");
      throw new Error('No active connection found for user');
    }

    const request = connectionInfo.activeRequests.get(message.requestId);
    if (!request) {
      console.log("No active Requests");
      throw new Error('No active request found');
    }

    // Update status
    request.status = 'aborted';
    
    // Clean up
    connectionInfo.activeRequests.delete(message.requestId);
    this.requests.delete(message.requestId);

    console.log("Stream aborted sending acknowledgemnt to server", message.requestId);

    // Notify client
    ws.send(JSON.stringify({
      type: "STREAM_ABORTED",
      requestId: message.requestId
    }));
  }

  private setupMessageHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("message", (message: string) => {
      try {
        const parsedMessage = JSON.parse(message.toString());

        switch (parsedMessage.type) {
          case "START_OUTLINE_STREAM":
            this.handleOutlineStream(ws, parsedMessage);
            break;

          case "START_BLOG_STREAM":
            this.handleBlogStream(ws, parsedMessage);
            break;

          case "START_EDIT_BLOG_STREAM":
            this.handleEditBlogStream(ws, parsedMessage)
            break;

          case "ABORT_STREAM":
            console.log("We need to abort the stream", parsedMessage.requestId);
            this.handleStreamAbort(ws, parsedMessage);
            break;

          default:
            throw new Error(`Unknown message type: ${parsedMessage.type}`);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: error instanceof SyntaxError ? "Invalid message format" : error,
          })
        );
      }
    });
  }

  private setupCloseHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("close", () => {
      console.log("Client disconnected");

      // Find and clean all associated requests
      for (const [userId, connectionInfo] of this.userConnections.entries()) {
        let hasMatchingSocket = false;

        for (const [requestId, request] of connectionInfo.activeRequests.entries()) {
          if (request.ws === ws) {
            connectionInfo.activeRequests.delete(requestId);
            this.requests.delete(requestId);
            hasMatchingSocket = true;
          }
        }

        // If this connection had no more active requests, remove it
        if (hasMatchingSocket && connectionInfo.activeRequests.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    });
  }

  private setupErrorHandler(ws: ModifiedWebSocketInstanceType) {
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      
      // Send error to client
      ws.send(JSON.stringify({
        type: "ERROR",
        message: "Internal server error"
      }));
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