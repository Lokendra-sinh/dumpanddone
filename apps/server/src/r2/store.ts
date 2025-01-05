import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { r2Client } from "..";



interface FetchChaosFromR2Props {
    chaosPath: string
}

export async function fetchChaosFromR2(props: FetchChaosFromR2Props): Promise<string> {
    const { chaosPath } = props;

    console.log("Environment Check:", {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID?.slice(0, 5) + "...",
        accessKey: process.env.R2_ACCESS_KEY_ID?.slice(0, 5) + "...",
        secretKey: process.env.R2_SECRET_ACCESS_KEY?.slice(0, 5) + "...",
        bucket: process.env.R2_BUCKET_NAME
    });

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: chaosPath
        });

        const response = await r2Client.send(command);
        
        const chaos = await response.Body?.transformToString();
        
        if (!chaos) {
            throw new Error('No content found');
        }

        return chaos;
    } catch (error) {
        console.error('R2 fetch failed:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch content from R2'
        });
    }
}

function generateChaosPath(userId: string, blogId: string): string{
    return `users/${userId}/blogs/${blogId}/raw-input/chaos.txt`;
}

interface uploadChaosToR2Props {
    blogId: string,
    userId: string,
    chaos: string
}

export async function uploadChaosToR2(props: uploadChaosToR2Props) {
    const { blogId, userId, chaos } = props;
    const path = generateChaosPath(userId, blogId);

    console.log('Attempting R2 upload:', {
        path,
        blogId,
        userId,
        bucketName: process.env.R2_BUCKET_NAME,
        chaosLength: chaos.length
    });

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: path,
        Body: chaos,
        ContentType: 'text/plain', // Add this
    });

    try {
        const result = await r2Client.send(command);
        console.log('R2 upload result:', result);
        return path;
    } catch (error) {
        console.error('R2 upload error details:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to store content in R2',
            cause: error
        });
    }
}