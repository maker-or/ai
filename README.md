# AI Chat App with Multi-LLM Support

An open-source AI chat application with support for multiple Large Language Models. This project demonstrates **Retrieval-Augmented Generation (RAG)**, enabling file-based context injection for richer and more accurate conversations. It is built with [Vite](https://vite.dev/) and uses [Convex](https://convex.dev/) as its backend.

## Key Features

- **Multi-LLM Support**: Chat with multiple Large Language Models (LLMs).
- **RAG Demonstration**: Upload documents and have the context injected directly into your AI conversations.

## Retrieval-Augmented Generation (RAG) Flow

- We use **Docling** to extract information from uploaded files.
- The files are stored using the cloud storage provider [UploadThing](https://uploadthing.com/).
- File content is converted into embeddings using **Gemini Embedding**.
- These embeddings are stored and indexed with [Pinecone](https://www.pinecone.io/) for fast retrieval during chat.

## App Authentication

- Authentication is provided by [Convex Auth](https://auth.convex.dev/) with GitHub.
- **You must sign in with your GitHub account to use the app.**

## Setup & Development

1. **Clone** this repository.
2. **Install dependencies** and configure environment variables as needed.
3. **Add your own [OpenRouter](https://openrouter.ai/) API key** for LLM access.
4. **Run the development server** or deploy as described in the project documentation.

## Usage Notes

- Sign in with your GitHub account.
- Obtain and enter your OpenRouter API key.
- Upload files for AI chat context.
- Interact with the chat – powered by multiple LLMs and RAG for enriched responses.

---
