import { ModelsType } from "@dumpanddone/types";
import { anthropic, deepseekAi, openai } from "..";
import { outlineGeneratorPrompt } from "../prompts/generate-outline-instructions";
import { ModifiedWebSocketInstanceType, RequestStateType } from "../ws/socket";

async function streamWithClaude(
    content: string, 
    ws: ModifiedWebSocketInstanceType,
    metadata: { userId: string; blogId: string; selectedModel: ModelsType }
) {

    return new Promise((resolve, reject) => {
        const stream =  anthropic.messages.stream({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: outlineGeneratorPrompt(content),
                }
            ],
        })

        stream.on('text', (text) => {
            ws.send(JSON.stringify({
                type: "OUTLINE_PROGRESS",
                content: text,
                ...metadata
            }));
        });

        // Stream is done
        stream.on('end', () => {
            resolve(undefined);
        });

        // Handle any errors
        stream.on('error', (error) => {
            console.error("Claude Stream error while streaming outline:", error);
            reject(error);
        });
    })
 
}

async function streamWithDeepseek(
    content: string, 
    ws: ModifiedWebSocketInstanceType,
    metadata: { userId: string; blogId: string; selectedModel: ModelsType }
) {
    const stream = await deepseekAi.chat.completions.create({
        messages: [{ 
            role: "user", 
            content: outlineGeneratorPrompt(content) 
        }],
        model: "deepseek-chat",
        temperature: 1.5,
        stream: true
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            ws.send(JSON.stringify({
                type: "OUTLINE_PROGRESS",
                content: content,
                ...metadata
            }));
        }
    }
}

async function streamWithGPT(
    content: string, 
    ws: ModifiedWebSocketInstanceType,
    metadata: { userId: string; blogId: string; selectedModel: ModelsType }
) {
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
            ws.send(JSON.stringify({
                type: "OUTLINE_PROGRESS",
                content: content,
                ...metadata
            }));
        }
    }
}

interface StartOutlineStreamingProps {
    chaos: string,
    selectedModel: ModelsType,
    requestState: RequestStateType
}

export async function startOutlineStreaming(props: StartOutlineStreamingProps) {
    const { chaos, requestState, selectedModel} = props
    const { blogId, ws, userId, requestId } = requestState

    // Create consistent metadata object
    const metadata = {
        userId,
        blogId,
        selectedModel: selectedModel,
        requestId: requestId
    }

    try {
        ws.send(JSON.stringify({
            type: "OUTLINE_START",
            ...metadata
        }))

        // Stream based on selected model
        switch (selectedModel) {
            case "claude":
                await streamWithClaude(chaos, ws, metadata);
                break;
            case "deepseek":
                await streamWithDeepseek(chaos, ws, metadata);
                break;
            case "gpt":
                await streamWithGPT(chaos, ws, metadata);
                break;
            default:
                throw new Error(`Unsupported model: ${selectedModel}`);
        }

        ws.send(JSON.stringify({
            type: "OUTLINE_END",
            ...metadata
        }))

    } catch (error) {
        console.error('Streaming error:', error);
        ws.send(JSON.stringify({
            type: 'OUTLINE_ERROR',
            error: error,
            ...metadata
        }));
    }
}