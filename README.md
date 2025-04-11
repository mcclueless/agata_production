
# Chat with UM's Bachelor and Master programmes

This is a [LlamaIndex](https://www.llamaindex.ai/) project using [Next.js](https://nextjs.org/) bootstrapped with [`create-llama`](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/create-llama).

## Description
This Simple agentic Rag web app is a pilot for a conversational interface using a vectore store (Pinecone) as index and the llama index retriever to chat with information about Maastricht Universities Bachelor and Master programs. 

An example of it can be found here: https://agata-production.vercel.app 

This repository does not contain environmental variables nor the data stored in the vectore store.


## Getting Started


1. Clone the repository

2. Then install the dependencies:

  $npm install

3. Setup environmental variables: (see below)

4. Run the development server:

 $npm run dev

Optional: (Do not do this if you don't know what you do :)

5. Generate the embeddings of the documents in the `./data` directory:

  $npm run generate

## Environmental variables
There are a number of environmental that you need to setup. After cloning the repository and installing the dependencies make a copy of the .env.template file and rename it to .env.

For it to work you need to set the following environmental variables:

1. The provider for the AI models to use.
  MODEL_PROVIDER=OpenAI

2. The name of LLM model to use.
  MODEL=gpt-4o-mini

3. Name of the embedding model to use.
  EMBEDDING_MODEL=text-embedding-3-large

4. Dimension of the embedding model to use.
  EMBEDDING_DIM=512

5. The OpenAI API key to use.
  OPENAI_API_KEY= 

6. The number of similar embeddings to return when retrieving documents.
  TOP_K=10

7. Configuration for Pinecone vector store. The Pinecone API key.
  PINECONE_API_KEY=
  PINECONE_ENVIRONMENT=
  PINECONE_INDEX_NAME=

## Documents 
The data used in this pilot was scraped from the curriculum.maastrichtuniversity.nl website. In particular the 25 Bachelor and 55 Master programme pages are indexed. An overview can be found here: https://docs.google.com/spreadsheets/d/1XUPV_ehYWoOFcCiGzUvK4ZKMdITq7mChdyFkI-3PXJ4/edit?usp=sharing


## What to do
There are a number of improvement tasks that needed. Here are some that are currently going on:

1. Prompt engineering: Getting the system prompt in the .env right. So run it locally and play around with the system prompt.  
2. Cleaning the source data: While the data scraped is already in a markdown LLM friendly language there is some manual cleaning of data necessary related to tables, video embedd codes, social media feeds, etc.
3. Adjustment to the frontend for mobile view.
4. Implementation of analytics. 
5. Implement filtering strategy by either doc_id, document_id containing both the programme name or based on score filtering.
6. Adjusting style of the suggested questions
7. Add official UM font
8. Incorporate general sources proper
9. Fixing problems with programmes who are dutch only


## What was done: Update 11 April

1. Updated System prompt and suggested questions prompt
2. Updated Source data to 17 march 2025
5. Adding Filtering on filename id taking keywords from query as filter keywords




## Some technical notes

The Chunksize is 512
Overlap: 20

The embedd model in retriever and the generator needs to be the same but the dimensionality can be set flexibly with Open AI's text-embedding-3-large model currently used. 

The retrieval strategy currently is TOP K based
The metric is cosin
The Type is Dense


## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex (Python features).
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) - learn about LlamaIndex (Typescript features).