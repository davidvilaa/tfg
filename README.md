<!-- foto banner collage de la app-->

# 🏆 TrophyD: The Completionist Social Network

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

---

This repository contains the source code and development environment for **TrophyD**. Developed as a Final Degree Project (TFG) in Software Engineering at UPV, this web platform validates the technical feasibility of creating a modern, gamified social ecosystem for the completionist gaming community.

## What is TrophyD?

**TrophyD** is a web platform that merges activity tracking concepts (similar to *Letterboxd*) with guide and completionist mechanics (like *Steam* or *PSNProfiles*). Built on a Serverless architecture and powered by the Next.js App Router, it provides a seamless and immersive experience.

The core of TrophyD is not just tracking what you play, but **building the ultimate collaborative library** for the completionist community through an immersive user experience (UX)[cite: 2].

### Key Features

<!-- gif cuando buscas un juego, lo rotas un poco y lo abres para loguear -->

*   **Immersive 3D Experience:** Interactive visual representation through 3D cards rendered directly in the browser via WebGL, simulating original game hardware (PS5, N64, GameBoy, Switch, etc.)[cite: 2].
*   **Social Interaction:** Log your 100% completed games, rate titles, and build a network of followers and following[cite: 2].
*   **Collaboration:** Write and share detailed guides and checklists to help other *trophy hunters* in their playthroughs[cite: 2].

---

## Core Pillars & Architecture

The primary goal is to deliver an ultra-fast, scalable, and visually stunning platform[cite: 2]. The system is evaluated and built upon:

| Pillar | Key Technology | Purpose |
| :--- | :--- | :--- |
| **Scalability** | `Supabase` & `PostgreSQL` | Ensure robust, real-time user management and relational databases[cite: 2]. |
| **Web Immersion** | `Three.js` & `React Three Fiber` | Render `.glb` models of classic and modern consoles without performance penalties[cite: 2]. |
| **Data Accuracy** | `IGDB API (Twitch)` | Ensure reliable metadata, cover art, and technical details for any video game[cite: 2]. |

### Tech Stack
*   **Frontend:** Next.js (App Router), React, Tailwind CSS[cite: 2].
*   **Backend & Auth:** Supabase (BaaS)[cite: 2].
*   **3D Graphics:** React Three Fiber, Drei[cite: 2].
*   **UI Components:** shadcn/ui (Radix Primitives)[cite: 2].
*   **Integrations:** IGDB API[cite: 2].

## Project Structure

<!-- gif creando una guía -->

*   `/app`: Main application routing. Contains auth modules (`/login`, `/register`), user profiles (`/profile/[nickname]`), search, and API integration (`/api/igdb`)[cite: 2].
*   `/components`: Reusable UI components (based on shadcn) and complex frontend logic, highlighting the 3D model viewer (`gameCard3D.tsx`)[cite: 2].
*   `/lib`: Supabase client initialization logic and app utilities[cite: 2].
*   `/public/models`: Static directory storing 3D models (`.glb`) and textures for over 15 different platforms and consoles used in the platform[cite: 2].

---

## Environment Setup

The project is ready to run in local Node.js environments. Active Supabase and IGDB credentials are required.

```bash
# Clone the repository
git clone [https://github.com/davidvilaa/trophyd.git](https://github.com/davidvilaa/trophyd.git)
cd trophyd

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

```

Make sure to fill the `.env.local` file with the following keys:
* `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`

## Running the Development Server

The system features a development server powered by Turbo (Next.js) that compiles routes and 3D models on demand.

```bash
# Start the development server on localhost:3000
npm run dev
```

---

## Project Structure

* `/app`: Main application routing. Contains auth modules (`/login`, `/register`), user profiles (`/profile/[nickname]`), search, and API integration (`/api/igdb`).
* `/components`: Reusable UI components (based on shadcn) and complex frontend logic, highlighting the 3D model viewer (`gameCard3D.tsx`).
* `/lib`: Supabase client initialization logic and app utilities.
* `/public/models`: Static directory storing 3D models (`.glb`) and textures for over 15 different platforms and consoles used in the platform.

---
<p align="center">
  Developed as part of the Software Engineering TFG. <br> UPV (Valencia, Spain)
</p>