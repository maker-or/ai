<<<<<<< HEAD
# I should have started early

This is the easy about my experince when building [T3 chat](https://t3.chat/) clone

## Why early

Even though i have seen the announcement post early , and started my intial development with [chef](https://chef.convex.dev/), I cloudn't continue for next few days, beacuse my collage project.

Even though i started it late, i enviroment was completely different , usually i used to work with [clerk](https://clerk.com/),[vercel AI sdk](https://ai-sdk.dev/) , [Neon](https://neon.com/)+[Drizzle](https://orm.drizzle.team/), but  this project was completely different , i have changed the DB and auth to [Convex](https://www.convex.dev/) and started using OpenAI SDK instead of vercel ai sdk


I know that i am not a great developer , and i cannot match the speed of t3.chat , but what i am is a good designer and i want to provide a good user experience. i have said is again and again the thinks i like about T3 chat is not their speed their colors across the  application , i want to take it open step a head by adding more color themes instead of one color theme


## Project structure

The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).

The backend code is in the `convex` directory.

`npm run dev` will start the frontend and backend servers.
=======
# RAG Demonstration
>>>>>>> origin/main

An open-source AI chat application with support for multiple Large Language Models. This project demonstrates **Retrieval-Augmented Generation (RAG)**, enabling file-based context injection for richer and more accurate conversations. It is built with [Vite](https://vite.dev/) and uses [Convex](https://convex.dev/) as its backend.

## Key Features

- **Multi-LLM Support**: Chat with multiple Large Language Models (LLMs).
- **RAG Demonstration**: Upload documents and have the context injected directly into your AI conversations.

## Retrieval-Augmented Generation (RAG) Flow

- We use **Docling** to extract information from uploaded files.
- The files are stored using the cloud storage provider [UploadThing](https://uploadthing.com/).
- File content is converted into embeddings using **Gemini Embedding**.
- These embeddings are stored and indexed with [Pinecone](https://www.pinecone.io/) for fast retrieval during chat.

<<<<<<< HEAD
User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## Contributing

This project is open source and contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
=======
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
>>>>>>> origin/main
