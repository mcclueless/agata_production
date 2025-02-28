
# Simple Agentic RAG application

This is a [LlamaIndex](https://www.llamaindex.ai/) project using [Next.js](https://nextjs.org/) bootstrapped with [`create-llama`](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/create-llama).

## Description
This web app is a pilot for a conversational interface using a vectore store (Pinecone) and a agentic RAG setup to chat with information about Maastricht Universities Bachelor and Master programs. 

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

# The provider for the AI models to use.
MODEL_PROVIDER=OpenAI

# The name of LLM model to use.
MODEL=gpt-4o-mini

# Name of the embedding model to use.
EMBEDDING_MODEL=text-embedding-3-large

# Dimension of the embedding model to use.
EMBEDDING_DIM=512

# The OpenAI API key to use.
OPENAI_API_KEY= 

# The number of similar embeddings to return when retrieving documents.
TOP_K=10

# Configuration for Pinecone vector store
# The Pinecone API key.
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=

## Documents 
The data used in this pilot was scraped from the curriculum.maastrichtuniversity.nl website. In particular the 25 Bachelor and 55 Master programme pages are indexed. An overview can be found here: https://docs.google.com/spreadsheets/d/1XUPV_ehYWoOFcCiGzUvK4ZKMdITq7mChdyFkI-3PXJ4/edit?usp=sharing

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex (Python features).
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) - learn about LlamaIndex (Typescript features).