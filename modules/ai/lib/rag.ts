import { embed} from "ai"
import { google } from "@ai-sdk/google"
import { pineconeIndex } from "@/lib/pinecone";

export async function generateEmbeddings(text: string) {
    const {embedding} = await embed({
        model: google.embeddingModel("text-embedding-004"),
        value: text
    })

    return embedding;
}

export async function indexCodebase(repoId: string, files: {path: string; content: string}[]): Promise<{ indexed: number; failed: number }> {
    if (!files || files.length === 0) {
        console.warn(`No files to index for repository: ${repoId}`);
        return { indexed: 0, failed: 0 };
    }

    const vectors = [];
    let failedCount = 0;

    for(const file of files) {
        const content = `File: ${file.path}\n\n${file.content}`;
        const truncatedContent = content.slice(0, 8000);

        try {
            const embedding = await generateEmbeddings(truncatedContent);
            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, "_")}`,
                values: embedding,
                metadata: {
                    path: file.path,
                    repoId,
                    content: truncatedContent,
                }
            });
        } catch (error) {
            console.error(`Error generating embeddings for ${file.path}:`, error);
            failedCount++;
        }
    }

    if(vectors.length > 0) {
        try {
            const batchSize = 100;
            for(let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await pineconeIndex.upsert(batch);
            }
            console.log(`Indexing complete for repository: ${repoId}. Indexed ${vectors.length} files, ${failedCount} failed`);
        } catch (error) {
            console.error(`Error upserting vectors to Pinecone for repository ${repoId}:`, error);
            throw error;
        }
    } else {
        console.warn(`No vectors generated for repository: ${repoId}`);
    }

    return { indexed: vectors.length, failed: failedCount };
}


export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const embedding = await generateEmbeddings(query);
    const results = await pineconeIndex.query({
        vector: embedding,
        filter: {repoId},
        topK: topK,
        includeMetadata: true,
    });

    return results.matches?.map((match) => match.metadata?.content as string).filter(Boolean);
}