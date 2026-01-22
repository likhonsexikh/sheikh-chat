# sheikh-chat

sheikh-chat is a powerful, asynchronous, and agentic coding assistant AI. This tool is designed to help developers accelerate their workflow by delegating tasks to advanced cloud and local coding agents. This README provides a comprehensive overview of the project, its technology stack, and instructions for getting started.

## Project Overview

The project is a full-stack application composed of a React-based frontend and a Node.js backend. The frontend, built with Vite and Ant Design, offers a modern and responsive user interface. The backend, powered by Express and WebSockets, ensures real-time, bidirectional communication between the client and the server. The entire application is containerized using a multi-stage Docker build for efficient and consistent deployments.

## Tech Stack

- **Frontend**:
  - React
  - Vite
  - Ant Design
- **Backend**:
  - Node.js
  - Express
  - ws (WebSocket)
- **Containerization**:
  - Docker

## Getting Started

### Prerequisites

- Docker
- Node.js (for local development)

### Dockerized Setup (Production)

1. **Build the Docker image**:
   ```bash
   docker build -t sheikh-chat .
   ```

2. **Run the Docker container**:
   The application will start automatically.
   ```bash
   docker run -d -p 3000:3000 --name sheikh-chat-container sheikh-chat
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

### Local Development

#### Backend

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm start
   ```
   The backend server will be running on port 3000.

#### Frontend

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   The frontend development server will be running on a port specified by Vite (usually `http://localhost:5173`).
