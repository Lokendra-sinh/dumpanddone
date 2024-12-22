import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { streamManager } from "./stream-manager";

interface SendMessageProps {
  type:
    | "START_OUTLINE_STREAM"
    | "STOP_OUTLINE_STREAM"
    | "START_BLOG_STREAM"
    | "STOP_BLOG_STREAM"
    | "START_EDIT_STREAM"
    | "STOP_EDIT_STREAM"
    | "ABORT_STREAM"
  chaos?: string;
  requestId?: string
  userId: string;
  blogId?: string;
  selectedModel?: ModelsType;
  outline?: OutlineSectionType[];
}

// WebSocket ready states
enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

export class SocketClient {
  private url: string
  private socket: WebSocket | null = null
  private messageHandler?: (event: MessageEvent) => void
  private disconnectHandler?: (code: number, reason: string) => void
  private errorHandler?: (error: Event) => void
  private reconnectAttempts = 0
  private readonly MAX_RECONNECT_ATTEMPTS = 3
  
  constructor(url: string) {
    this.url = url
  }

  connect() {
    if (this.socket?.readyState === WebSocketState.OPEN) {
      console.warn('Socket is already connected')
      return
    }

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        console.log("Socket connection established successfully!")
        this.reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      }

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          // Parse to validate it's JSON but use original event
          JSON.parse(event.data)
          console.log("Event recieved from backend is", event);
          this.messageHandler?.(event)
        } catch (error) {
          console.error("Failed to parse incoming message:", error)
          this.errorHandler?.(new Event('parse_error'))
        }
      }

      this.socket.onerror = (error: Event) => {
        console.error("WebSocket error:", error)
        this.errorHandler?.(error)
        this.handleReconnection()
      }

      this.socket.onclose = (event: CloseEvent) => {
        console.warn(
          `Socket connection closed: [${event.code}] ${event.reason || 'No reason provided'}`
        )
        
        // Only try to reconnect if it wasn't a clean close
        if (!event.wasClean) {
          this.handleReconnection()
        }
        
        this.disconnectHandler?.(event.code, event.reason)
      }
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error)
      this.errorHandler?.(new Event('connection_error'))
      this.handleReconnection()
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++
      const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
      
      console.log(
        `Attempting reconnection ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} ` +
        `in ${backoffTime}ms...`
      )
      
      setTimeout(() => this.connect(), backoffTime)
    } else {
      console.error('Max reconnection attempts reached')
      this.errorHandler?.(new Event('max_reconnect_attempts_reached'))
    }
  }

  sendMessage(message: SendMessageProps) {
    if (!this.isConnected()) {
      throw new Error("Cannot send message: WebSocket is not connected")
    }

    try {
      this.socket!.send(JSON.stringify(message))
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    }
  }

  disconnect(code: number = 1000, reason: string = "Client disconnecting") {
    if (this.socket) {
      try {
        this.socket.close(code, reason)
      } catch (error) {
        console.error("Error during disconnect:", error)
      } finally {
        this.socket = null
        this.reconnectAttempts = 0 // Reset reconnect attempts
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocketState.OPEN
  }

  // Handler setters with type safety
  setMessageHandler(handler: (event: MessageEvent) => void) {
    this.messageHandler = handler
  }

  setErrorHandler(handler: (error: Event) => void) {
    this.errorHandler = handler
  }

  setDisconnectHandler(handler: (code: number, reason: string) => void) {
    this.disconnectHandler = handler
  }

  // Handler removers
  removeMessageHandler() {
    this.messageHandler = undefined
  }

  removeErrorHandler() {
    this.errorHandler = undefined
  }

  removeDisconnectHandler() {
    this.disconnectHandler = undefined
  }

  // Get current socket state
  getState(): WebSocketState {
    return this.socket?.readyState ?? WebSocketState.CLOSED
  }
}

export const socketClient = new SocketClient(import.meta.env.VITE_WEBSOCKET_URL_LOCAL)

// Set up default handlers
socketClient.setErrorHandler((error) => console.error("Socket Error:", error))
socketClient.setMessageHandler((event: MessageEvent) => streamManager.receiver(event))