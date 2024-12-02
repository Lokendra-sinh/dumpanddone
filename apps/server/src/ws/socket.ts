import { WebSocket, WebSocketServer } from "ws";
import { startOutlineStreaming } from "../models/outine-streaming";

export function setupWebSocketHandlers(wss: WebSocketServer) {
    console.log("Setting up WebSocket handlers...");

    wss.on('connection', (ws: WebSocket) => {
        console.log("Client connected to websocket");

        // Handle incoming messages
        ws.on('message', (content: string) => {
            try {
                console.log('Received:', content);
                // Parse the message (assuming JSON)
                const parsedMessage = JSON.parse(content.toString());
                
                // Handle different message types
                switch (parsedMessage.type) {
                    case 'START_STREAM':
                        startOutlineStreaming(parsedMessage.content, ws)
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