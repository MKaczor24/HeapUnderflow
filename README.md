# HeapUnderflow

A community-driven Q&A platform for developers — inspired by Stack Overflow, built from scratch as a portfolio project.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Appwrite](https://img.shields.io/badge/Appwrite-BaaS-F02E65?logo=appwrite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## About

HeapUnderflow is a full-stack Q&A web application where users can ask technical questions, post answers, and vote on content. It features a modern dark-themed UI with smooth animations and a fully responsive layout.

This is a **non-commercial** project built for learning purposes and portfolio demonstration.

## Features

- **Ask & Answer** — Post questions with a rich Markdown editor; attach images
- **Voting System** — Upvote/downvote questions and answers with reputation tracking
- **Authentication** — Register, login, OAuth, email verification & password recovery
- **User Profiles** — Customizable avatars, bios, and activity history
- **Leaderboard** — Top contributors ranked by reputation
- **Search & Tags** — Filter questions by keywords and tags
- **Responsive Design** — Optimized for both desktop and mobile

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Framework  | Next.js 16 (App Router)          |
| Frontend   | React 19, Tailwind CSS 4, Motion |
| State      | Zustand                          |
| Backend    | Next.js API Routes, Appwrite     |
| Auth       | Appwrite Authentication          |
| Database   | Appwrite Databases               |
| Storage    | Appwrite Storage                 |
| Deployment | Vercel                           |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/MKaczor24/HeapUnderflow
cd HeapUnderflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Appwrite credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

| Variable                            | Description                  |
| ----------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key        |
| `CLERK_SECRET_KEY`                  | Clerk secret key             |
| `DATABASE_URL`                      | PostgreSQL connection string |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        |
| `CLOUDINARY_API_KEY`                | Cloudinary API key           |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret        |
| `CLOUDCONVERT_API_KEY`              | CloudConvert API key         |

## License

This project is open source and available for learning and reference purposes.
