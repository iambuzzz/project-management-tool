# Project Management Tool (Trello Clone)

A full-stack, highly interactive project management application inspired by Trello. It features a dark-mode aesthetic, drag-and-drop capabilities, real-time optimistic UI updates, and file attachments.

## 🚀 Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS (Styling & Dark Mode)
- React Query (Data fetching, caching, and optimistic UI updates)
- React Beautiful DnD (Drag and drop interactions)
- React Router DOM (Navigation)

**Backend:**
- Node.js & Express (REST API)
- Prisma ORM (Database access)
- PostgreSQL (Relational Database)
- AWS S3 (File storage for attachments & covers)

## ✨ Key Features
- **Board Management:** Create, read, update, and delete boards with custom background colors and images.
- **Lists & Cards:** Fully functional drag-and-drop interfaces for both lists and cards (cross-list dragging supported).
- **Card Details:** Rich modals featuring:
  - Editable titles & descriptions.
  - Due dates with overdue/today badges.
  - Labels and Member assignment.
  - Checklists with interactive progress bars.
  - Commenting and activity logs.
  - File attachments (uploaded to AWS S3).
  - Card Covers (Solid colors or uploaded images).
- **Archiving & Deleting:** Safely archive cards to a drawer or permanently delete boards and lists.
- **Global Search:** Search through all cards seamlessly.
- **Optimistic UI:** Instant UI responses using React Query's `onMutate` eliminating network latency.

## 🛠️ Prerequisites
- Node.js (v18+)
- PostgreSQL database
- AWS S3 Bucket (with public read access for attachments)

## 💻 Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Project Management Tool"
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   - Create a `.env` file in the `server` directory and add your variables:
     ```env
     PORT=5000
     DATABASE_URL="postgresql://user:password@localhost:5432/trello_clone?schema=public"
     AWS_ACCESS_KEY_ID="your_aws_key"
     AWS_SECRET_ACCESS_KEY="your_aws_secret"
     AWS_REGION="your_aws_region" # e.g., ap-south-1
     AWS_BUCKET_NAME="your_bucket_name"
     ```
   - Run database migrations & seed:
     ```bash
     npx prisma migrate dev
     npx prisma db seed
     npm run dev
     ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   - Create a `.env` file in the `client` directory:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

## ☁️ Deployment Guide (Render)

Since this repository contains both the client and the server (Monorepo structure), you can deploy them as two separate services on Render connecting to the same repository.

### 1. Deploying the Backend (Web Service)
- Connect your GitHub repository to Render.
- Create a new **Web Service**.
- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start` (Ensure you have `"start": "node src/app.js"` in `server/package.json`)
- **Environment Variables**: Add `DATABASE_URL` (use Render's PostgreSQL or external), `PORT` (leave empty or set to 10000), and all `AWS_*` variables.

### 2. Deploying the Frontend (Static Site)
- Create a new **Static Site** on Render.
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `client/dist`
- **Environment Variables**: Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`).
- **Routing**: Under Advanced Settings, set up a Rewrite Rule for SPAs:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

## 🧠 Assumptions & Design Decisions
- **No User Auth:** For this iteration, user authentication is mocked. The application assumes a single default user (`iambuzzz`) or operates in an open environment to demonstrate core functionality.
- **Optimistic UI Over WebSockets:** To ensure immediate responsiveness without the complexity of managing WebSocket connections, React Query's Optimistic Updates (`onMutate`) were heavily utilized.
- **S3 for Storage:** Local storage was bypassed in favor of AWS S3 to ensure the app is fully cloud-native and deployable to ephemeral file systems (like Render's free tier).
- **Tailwind for Design System:** A highly customized `tailwind.config.js` was used to strictly enforce a specific dark-mode aesthetic mirroring the Trello UI.
