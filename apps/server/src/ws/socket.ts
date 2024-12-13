import { v4 as uuidv4 } from 'uuid'
import { WebSocket, WebSocketServer } from "ws";
import { startOutlineStreaming } from "../models/outine-streaming";
import { addChaos } from "../db/queries/addContent";

export interface ModifiedWebSocketInstanceType extends WebSocket{
    blogId: string,
}

export function setupWebSocketHandlers(wss: WebSocketServer) {
    console.log("Setting up WebSocket handlers...");

    wss.on('connection', (ws: ModifiedWebSocketInstanceType) => {
        console.log("Client connected to websocket");

        // Handle incoming messages
        ws.on('message', (message: string) => {
            try {
                console.log('Received:', message);
                // Parse the message (assuming JSON)
                const parsedMessage = JSON.parse(message.toString());
                
                // Handle different message types
                switch (parsedMessage.type) {
                    case 'START_STREAM':
                        ws.blogId = parsedMessage.blogId
                        addChaos({chaos: parsedMessage.chaos, userId: parsedMessage.userId, blogId: parsedMessage.blogId})
                        startOutlineStreaming(parsedMessage.chaos, ws)

                        break;
                    case 'STOP_STREAM':
                        // Handle stream stop
                        break;
                    default:
                        console.log('Unknown message type:', parsedMessage.type);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Invalid message format' 
                }));
            }
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('Client disconnected');
            // Add any cleanup logic here
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Send initial connection confirmation
        ws.send(JSON.stringify({ 
            type: 'CONNECTION_ESTABLISHED',
            message: 'Connected to server'
        }));
    });
}