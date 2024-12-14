import { ModelsType } from "@dumpanddone/types";
import { anthropic, deepseekAi, openai } from "..";
import { outlineGeneratorPrompt } from "../prompts/generate-outline-instructions";
import { ModifiedWebSocketInstanceType, RequestStateType } from "../ws/socket";



async function streamWithClaude(content: string, ws: ModifiedWebSocketInstanceType) {
     anthropic.messages.stream({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
            {
                role: "user",
                content: outlineGeneratorPrompt(content),
            }
        ],
    }).on('text', (text) => {
        ws.send(text)
    })
}

async function streamWithDeepseek(content: string, ws: ModifiedWebSocketInstanceType) {
    const stream = await deepseekAi.chat.completions.create({
        messages: [
            { 
                role: "user", 
                content: outlineGeneratorPrompt(content) 
            }
        ],
        model: "deepseek-chat",
        stream: true
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            ws.send(content);
        }
    }
}

async function streamWithGPT(content: string, ws: ModifiedWebSocketInstanceType) {
    const stream = await openai.chat.completions.create({
        model: "gpt-4o",
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
        if (content) {
            ws.send(content);
        }
    }
}

export async function startOutlineStreaming(
    content: string, 
    requestState: RequestStateType,
    model: ModelsType = "gpt"
) {
    const { blogId, ws, userId } = requestState
    try {
        ws.send(JSON.stringify({
            type: "OUTLINE_START",
            blogId: blogId
        }))

        // Stream based on selected model
        switch (model) {
            case "claude":
                await streamWithClaude(content, ws);
                break;
            case "deepseek":
                await streamWithDeepseek(content, ws);
                break;
            case "gpt":
                await streamWithGPT(content, ws);
                break;
            default:
                throw new Error(`Unsupported model: ${model}`);
        }

        ws.send(JSON.stringify({
            type: "OUTLINE_COMPLETE",
            blogId: blogId
        }))

    } catch (error) {
        console.error('Streaming error:', error);
        ws.send(JSON.stringify({
            type: 'OUTLINE_ERROR',
            error: error,
            blogId: blogId
        }));
    }
}