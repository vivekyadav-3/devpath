<div align="center">
  <img src="hero.png" alt="DevPath Hero" width="800"/>

  <h1>DevPath</h1>
  <p><strong>AI-Powered Career & Skill Analyzer for Developers</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

<br/>

DevPath is an intelligent career assistant that analyzes a developer's GitHub profile to synthesize a personalized, actionable career roadmap. Built for engineers targeting top-tier tech companies, it leverages real-time coding metrics and NVIDIA NIM (LLaMA 3.1) to identify skill gaps and generate project-based learning milestones.

## 🚀 Features

- **GitHub Metric Extraction:** Automatically pulls commit history, language distribution, and repository complexity via the GitHub GraphQL API.
- **Smart Logic Engine:** Evaluates frontend, backend, systems, and consistency metrics to assign professional scores.
- **AI Roadmap Synthesis:** Uses LLaMA 3.1 8B (via NVIDIA NIM) to generate brutal, highly specific technical milestones tailored to fix individual skill gaps.
- **Cinematic UI/UX:** Built with React, Framer Motion, and Tailwind CSS v4, featuring premium glassmorphism and modern gradient typography.

## 🧠 Architecture

1. **Client:** React application handling state transitions and animated data visualization.
2. **Server:** Node.js Express backend acting as the orchestration layer.
3. **Data Layer:** SQLite persistent database powered by Prisma ORM and the libSQL adapter.
4. **AI Layer:** Secure integration with NVIDIA's inference API for real-time LLM roadmap generation.

## 💻 Tech Stack

### Frontend
- React 19 (Vite)
- Tailwind CSS v4
- Framer Motion
- Lucide React Icons

### Backend
- Node.js & Express
- Prisma ORM 7 (libSQL Adapter)
- SQLite
- NVIDIA NIM API

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- GitHub Personal Access Token
- NVIDIA NIM API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vivekyadav-3/devpath.git
   cd devpath
   ```

2. Setup Backend:
   ```bash
   cd server
   npm install
   # Create a .env file based on the provided keys
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. Setup Frontend (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
