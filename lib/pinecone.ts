import { Pinecone } from '@pinecone-database/pinecone';
import { envConfig } from './env-config';

export const pinecone = new Pinecone({
  apiKey: envConfig.PINECONE_DB_API_KEY
});

export const pineconeIndex = pinecone.index("codexy");