import { anthropic, openai } from "..";
import { WebSocket } from "ws";
import { outlineGeneratorPrompt } from "../prompts/generate-outline-instructions";
import { ModifiedWebSocketInstanceType } from "../ws/socket";

// export async function startOutlineStreaming(content: string, ws: WebSocket) {
//     try {
//          const stream = anthropic.messages.stream({
//             model: "claude-3-5-sonnet-20241022",
//             max_tokens: 8192,
//             messages: [
//                 {
//                     role: "user",
//                     content: outlineGeneratorPrompt(content),
//                 },
//                 // {
//                 //     role: "assistant",
//                 //     content: "Here is the JSON requested:\n{"
//                 // }
//             ],
//             stream: true  // This is crucial for streaming!
//         })

//         stream.on('text', (text) => {
//             console.log(text)
//             ws.send(text)
//         })


//         stream.on('end', () => {
//             ws.send("OUTLINE_COMPLETE")
//         })

//     } catch (error) {
//         // Send error through WebSocket
//         // ws.send(JSON.stringify({
//         //     type: 'OUTLINE_ERROR',
//         //     requestId,
//         //     error: error.message
//         // }));
//         console.error('Streaming error:', error);
//     }
// }


export async function startOutlineStreaming(content: string, ws: ModifiedWebSocketInstanceType) {
    try {

        ws.send(JSON.stringify({
            type: "OUTLINE_START",
            blogId: ws.blogId
        }))

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: outlineGeneratorPrompt(content),
                }
            ],
            stream: true,
        });


        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            console.log("CONTENT: ", content);
            if (content) {
                console.log(content);
                ws.send(content);
            }
        }

        ws.send(JSON.stringify({
            type: "OUTLINE_COMPLETE",
            blogId: ws.blogId
        }))

    } catch (error) {
        console.error('Streaming error:', error);
        // Should probably send this to the client too!
        // ws.send(JSON.stringify({
        //     type: 'OUTLINE_ERROR',
        //     error: error.message
        // }));
    }
}