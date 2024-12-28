import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";

const r2Client = new S3Client({
   region: "auto",
   endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
   credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
   }
})


function generateChaosPath(userId: string, blogId: string): string{
    return `users/${userId}/blogs/${blogId}/raw-input/chaos.txt`;
}

interface uploadChaosToR2Props {
    blogId: string,
    userId: string,
    chaos: string
}

async function uploadChaosToR2(props: uploadChaosToR2Props){
    const { blogId, userId, chaos} = props

    const path = generateChaosPath(userId, blogId)

    try{
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: path,
            Body: chaos,
            Metadata: {
                'blog-id': blogId,
                'user-id': userId,
                'upload-date': new Date().toISOString()
            }
        })

        await r2Client.send(command)

        return path
    } catch (error) {
        console.error('R2 upload failed:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to store content in R2'
        });
    }
}