import { anthropic } from "..";
import { WebSocket } from "ws";
import { outlineGeneratorPrompt } from "../prompts/generate-outline-instructions";

export async function startOutlineStreaming(content: string, ws: WebSocket) {
    try {
         anthropic.messages.stream({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            messages: [
                {
                    role: "user",
                    content: outlineGeneratorPrompt(content),
                },
                // {
                //     role: "assistant",
                //     content: "Here is the JSON requested:\n{"
                // }
            ],
            stream: true  // This is crucial for streaming!
        }).on('text', (text) => {
            console.log(text)
            ws.send(text)
        })

        // Send completion message
        // ws.send(JSON.stringify({
        //     type: 'OUTLINE_COMPLETE',
        //     requestId
        // }));

    } catch (error) {
        // Send error through WebSocket
        // ws.send(JSON.stringify({
        //     type: 'OUTLINE_ERROR',
        //     requestId,
        //     error: error.message
        // }));
        console.error('Streaming error:', error);
    }
}