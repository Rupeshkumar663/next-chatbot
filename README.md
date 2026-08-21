# AI Chatbot

A responsive AI chatbot application built with Next.js, TypeScript, Tailwind CSS, MongoDB, Prisma, Groq, and Tavily.

## Features

- Responsive design for desktop, tablet, and mobile devices
- AI-powered conversational chatbot
- Persistent chat history using MongoDB
- Prisma ORM for database operations
- Conversation context maintained across messages
- Markdown support for AI responses
- GitHub-flavored Markdown tables and formatting
- Optional web search for current information
- New Chat functionality
- Loading and error states

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- Prisma ORM
- Groq SDK
- Tavily Search API
- React Markdown

## Project Structure

```text
app/
  api/chats/[threadId]/route.ts
  llm/chat/route.ts
  page.tsx

components/
  Interface.tsx
  Message.tsx
  UserInput.tsx

lib/
  ai.ts
  prisma.ts

prisma/
  schema.prisma
