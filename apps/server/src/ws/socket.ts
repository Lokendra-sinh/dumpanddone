import { v4 as uuidv4 } from 'uuid'
import type { WebSocket, WebSocketServer } from "ws";
import { startOutlineStreaming } from "../models/outine-streaming";
import { addChaos } from "../db/queries/addContent";

export interface ModifiedWebSocketInstanceType extends WebSocket{
    blogId: string,
}


export interface RequestStateType {
    ws: ModifiedWebSocketInstanceType,
    blogId: string,
    userId: string,
    requestId: string,
    startTime: Date,
}

export class Socket {
    private wss: WebSocketServer;
    private requests: Map<string, unknown> = new Map()
 
    constructor(wss: WebSocketServer) {
        this.wss = wss
        this.setupConnectionListener()
        console.log("Setting up WebSocket handlers...")
    }
 
    private setupConnectionListener() {
        this.wss.on('connection', this.handleConnection.bind(this))
    }
 
    private handleConnection(ws: ModifiedWebSocketInstanceType) {
        console.log("Client connected to websocket")
        
        this.setupMessageHandler(ws)
        this.setupCloseHandler(ws)
        this.setupErrorHandler(ws)
        this.sendConnectionConfirmation(ws)
    }
 
    private setupMessageHandler(ws: ModifiedWebSocketInstanceType) {
        ws.on('message', (message: string) => {
            const requestId = uuidv4()
            const parsedMessage = JSON.parse(message.toString())
            const requestState: RequestStateType = {
                ws,
                requestId,
                blogId: parsedMessage.blogId,
                userId: parsedMessage.userId,
                startTime: new Date()
            }
            this.requests.set(requestId, requestState)
            const selectedModel = parsedMessage.selectedModel
            try {
                switch (parsedMessage.type) {
                    case 'START_STREAM':
                        addChaos({
                            chaos: parsedMessage.chaos, 
                            userId: parsedMessage.userId, 
                            blogId: parsedMessage.blogId
                        })
                        startOutlineStreaming(parsedMessage.chaos, requestState, selectedModel)
                        break
                        
                    case 'STOP_STREAM':
                        // Handle stream stop
                        break
                        
                    default:
                        console.log('Unknown message type:', parsedMessage.type)
                }
            } catch (error) {
                console.error('Error handling message:', error)
                ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Invalid message format' 
                }))
            }
        })
    }
 
    private setupCloseHandler(ws: ModifiedWebSocketInstanceType) {
        ws.on('close', () => {
            console.log('Client disconnected')

            for (const [requestId, state] of this.requests.entries()) {
                const requestState = state as RequestStateType
                
                if (requestState.ws === ws) {
                    this.requests.delete(requestId)
                    console.log(`Cleaned up request: ${requestId}`)
                }
            }
        })
    }
 
    private setupErrorHandler(ws: ModifiedWebSocketInstanceType) {
        ws.on('error', (error) => {
            console.error('WebSocket error:', error)
        })
    }
 
    private sendConnectionConfirmation(ws: ModifiedWebSocketInstanceType) {
        ws.send(JSON.stringify({ 
            type: 'CONNECTION_ESTABLISHED',
            message: 'Connected to server'
        }))
    }
 }

