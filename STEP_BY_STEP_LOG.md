# 🛠️ Project Management Tool (Trello Clone) — Step-by-Step Build Log

> **This file logs EVERY command and action taken to build this project from scratch.**  
> Follow this file sequentially to recreate the entire project on any machine.

---

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** v22+ installed (`node --version`)
- **npm** v11+ installed (`npm --version`)
- A **Neon** PostgreSQL database (free tier → [neon.tech](https://neon.tech))
- **AWS S3** bucket + credentials (for file attachments)

---

## 🗂️ Project Structure Overview

```
Project Management Tool/
├── client/          → React 19 (Vite) + Tailwind CSS v4 frontend
├── server/          → Node.js + Express + Prisma backend
├── README.md        → Project documentation
└── STEP_BY_STEP_LOG.md  → This file
```

---

## Phase 1: Backend Setup & Infrastructure

### Step 1.1 — Initialize the Backend (`server/`)

```bash
# Create server directory and initialize npm
mkdir -p server
cd server
npm init -y
```

### Step 1.2 — Install Dependencies

```bash
# Production dependencies
npm install express cors dotenv @prisma/client @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer uuid

# Dev dependencies
npm install --save-dev prisma nodemon
```

**What each package does:**
| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variables from `.env` file |
| `@prisma/client` | Prisma ORM client for PostgreSQL |
| `@aws-sdk/client-s3` | AWS S3 file upload |
| `@aws-sdk/s3-request-presigner` | S3 presigned URLs |
| `multer` | File upload middleware |
| `uuid` | Unique ID generation for S3 keys |
| `prisma` | Prisma CLI (schema, migrations) |
| `nodemon` | Auto-restart server on file changes |

### Step 1.3 — Create Directory Structure

```bash
# Inside server/
mkdir -p src/routes src/middlewares src/utils src/config prisma
```

**Final folder structure:**
```
server/
├── prisma/
│   ├── schema.prisma      # Database models
│   └── seed.js             # Sample data
├── src/
│   ├── config/
│   │   └── dbConnect.js    # Prisma client singleton
│   ├── middlewares/
│   │   └── errorHandler.js # 404 + 500 handlers
│   ├── routes/
│   │   ├── boardRouter.js
│   │   ├── listRouter.js
│   │   ├── cardRouter.js
│   │   ├── labelRouter.js
│   │   ├── memberRouter.js
│   │   ├── checklistRouter.js
│   │   ├── commentRouter.js
│   │   ├── attachmentRouter.js
│   │   └── searchRouter.js
│   ├── utils/
│   │   └── validate.js     # Input validation helpers
│   └── app.js              # Express entry point
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Template for .env
├── .gitignore
└── package.json
```

### Step 1.4 — Configure Environment Variables

Create `.env` in `server/`:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
PORT=3000
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-south-1"
AWS_BUCKET_NAME="your-bucket-name"
CLIENT_URL="http://localhost:5173"
```

> ⚠️ Replace the DATABASE_URL with your Neon connection string.
> ⚠️ Replace AWS values with your S3 credentials.

### Step 1.5 — Update `package.json`

Update `package.json` scripts:
```json
{
  "name": "trello-clone-server",
  "version": "1.0.0",
  "description": "Trello Clone backend - Project Management Tool (Scaler Assignment)",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "seed": "node prisma/seed.js"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "author": "iambuzzz"
}
```

### Step 1.6 — Files Created

The following files were created (see source code in the repo):

1. **`prisma/schema.prisma`** — 11 models: Member, Board, List, Card, Label, CardLabel, CardMember, Checklist, ChecklistItem, Comment, Attachment, Activity
2. **`prisma/seed.js`** — Seeds 5 members, 9 labels, 3 boards, lists, 17 cards with checklists, comments, activities
3. **`src/config/dbConnect.js`** — Prisma client singleton
4. **`src/middlewares/errorHandler.js`** — 404 + 500 global error handlers
5. **`src/utils/validate.js`** — Input validation (boards, lists, cards, comments, checklists)
6. **`src/routes/boardRouter.js`** — Board CRUD (GET, POST, PUT, DELETE)
7. **`src/routes/listRouter.js`** — List CRUD + batch reorder
8. **`src/routes/cardRouter.js`** — Card CRUD + move + reorder + archive
9. **`src/routes/labelRouter.js`** — Label listing + card-label assignment
10. **`src/routes/memberRouter.js`** — Member listing + card-member assignment
11. **`src/routes/checklistRouter.js`** — Checklist + ChecklistItem CRUD
12. **`src/routes/commentRouter.js`** — Comment CRUD + activity log
13. **`src/routes/attachmentRouter.js`** — File upload to S3
14. **`src/routes/searchRouter.js`** — Search & filter cards
15. **`src/app.js`** — Express entry point (all routers mounted)

### Step 1.7 — Run Prisma Migration (REQUIRES DATABASE_URL)

```bash
# Generate Prisma client and run migration
npx prisma migrate dev --name init
```

### Step 1.8 — Seed the Database

```bash
npm run seed
```

### Step 1.9 — Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

---

## Phase 2: Frontend Setup

### Step 2.1 — Initialize the Frontend (`client/`)

```bash
# Create client directory and initialize React via Vite
npx -y create-vite@latest client --template react --no-interactive
cd client
npm install
```

### Step 2.2 — Install Frontend Dependencies

```bash
npm install react-router-dom @tanstack/react-query axios @hello-pangea/dnd date-fns react-icons @tailwindcss/vite tailwindcss
```

**What each package does:**
| Package | Purpose |
|---------|---------|
| `react-router-dom` | Page routing |
| `@tanstack/react-query` | Server state management and API caching |
| `axios` | Making API requests to the backend |
| `@hello-pangea/dnd` | Drag-and-drop functionality for Kanban boards |
| `date-fns` | Date formatting |
| `react-icons` | SVG icons |
| `tailwindcss` + `@tailwindcss/vite` | Utility-first CSS framework (v4) |

### Step 2.3 — Configure Tailwind CSS v4

1. Add plugin to `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

2. Replace `src/index.css` with:
```css
@import "tailwindcss";

@theme {
  --color-trello-blue: #026AA7;
  --color-trello-blue-dark: #005A8D;
  --color-trello-blue-light: #0079BF;
  --color-trello-bg: #F4F5F7;
  --color-trello-text: #172B4D;
  --color-trello-text-light: #5E6C84;
  --color-list-bg: #F1F2F4;
  --color-card-bg: #FFFFFF;
  --color-card-shadow: rgba(9, 30, 66, 0.25);
  --color-hover-bg: rgba(9, 30, 66, 0.08);
}

/* Custom scrollbars */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 4px; }
::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--color-trello-text);
  background-color: var(--color-trello-blue-light);
  overflow-y: hidden;
}

*:focus { outline: none; }
*:focus-visible { outline: 2px solid var(--color-trello-blue); outline-offset: 2px; }
```

3. Remove `src/App.css`

### Step 2.4 — Set up React Query and Router

1. Update `src/main.jsx` with QueryClientProvider:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

2. Update `src/App.jsx` with routing structure:
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const BoardList = () => <div className="p-4 text-white">Board List Page</div>;
const Board = () => <div className="p-4 text-white">Board Detail Page</div>;
const NotFound = () => <div className="p-4 text-white">404 - Page Not Found</div>;

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="h-12 bg-trello-blue-dark flex items-center px-4 text-white font-semibold shadow-sm sticky top-0 z-50">
        Trello Clone
      </header>
      <main className="flex-1 relative flex">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/boards" element={<BoardList />} />
          <Route path="/b/:id" element={<Board />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
```

### Step 2.5 — Create Component Architecture

```bash
mkdir -p src/components src/pages src/layouts src/contexts src/hooks src/services src/utils
```

---

## Phase 3: Frontend API & State Setup

### Step 3.1 — Setup Axios API Client
Created `src/utils/constants.js` and `src/services/api.js` for our global API client.
- Used `axios.interceptors.response` to globally handle errors from the backend.

### Step 3.2 — Create Board Service
Created `src/services/boardService.js` to handle CRUD operations for boards.

### Step 3.3 — Setup React Query Hooks
Created `src/hooks/useBoards.js` to handle caching and server-state using `@tanstack/react-query`. This makes fetching boards and creating boards highly optimized.

### Step 3.4 — Create Global Layout
Created `src/components/Header.jsx` mimicking Trello's sticky header, and integrated it into `src/App.jsx`.

---

## Phase 4: Home Page & Board Creation

### Step 4.1 — Board List Page
Created `src/pages/BoardList.jsx` to match Trello's workspace view:
- Sidebar with navigation links
- Main grid displaying board cards with hover effects
- Cards pull their custom `backgroundColor` and `backgroundImage` from the database.

### Step 4.2 — Create Board Modal
Created `src/components/CreateBoardModal.jsx`:
- Pop-up modal overlay for creating new boards.
- Features a color picker with Trello's standard 9 colors.
- Input validation and visual live preview.
- Hooks into `useCreateBoard` to mutate the database.
- Uses `useNavigate` to immediately redirect the user to the newly created board.

---

## Phase 5: Board View & Drag-and-Drop

### Step 5.1 — Drag-and-Drop Architecture
Installed `@hello-pangea/dnd` and set up the global `DragDropContext` inside `src/pages/Board.jsx`.
- Created `<Droppable>` area for horizontal list dragging.
- Handled the complex `onDragEnd` logic for reordering lists, reordering cards within the same list, and moving cards between different lists.
- Integrated optimistic UI state updates (`setLists`) for instant visual feedback before the API responds.

### Step 5.2 — List and Card API Services
Created `src/services/listService.js` and `src/services/cardService.js`.
Created React Query hooks with `onMutate` optimistic updates in `useLists.js` and `useCards.js`.

### Step 5.3 — List Component
Created `src/components/List.jsx`.
- Wraps the entire column in a `<Draggable>`.
- Contains a vertical `<Droppable>` area for cards to be dropped into.

### Step 5.4 — Card Component
Created `src/components/Card.jsx`.
- Draggable item that visually responds with a tilt and shadow when lifted (`snapshot.isDragging`).
- Computes and renders badges for descriptions, comments, attachments, due dates (with overdue logic), and checklists.
- Maps over assigned members to display avatars.

### Step 5.5 — Inline Add Forms
Created `src/components/InlineForms.jsx`.
- Reusable inline form components for "Add List" and "Add Card".
- Auto-focuses the input on open.
- Disables submit while the API request is pending.

### Step 5.6 — Bug Fixes (Route Collision & Cache Unwrapping)
Fixed a critical bug where `PUT /cards/reorder` was being intercepted by `PUT /cards/:id` due to Express top-to-bottom routing. Moved the `reorder` routes above the `:id` routes in `listRouter.js` and `cardRouter.js`.
Also added safe cache-unwrapping to `BoardList.jsx` and `Board.jsx` to prevent React Query from crashing when the `api.js` interceptor was modified.
Suppressed the harmless `@hello-pangea/dnd` nested scroll container warning in `main.jsx`.

---

## Phase 6: Card Detail Modal

### Step 6.1 — Card API Hooks
Added `getCard` to `cardService.js` to fetch full card details (including labels, checklists, members, and comments).
Added `useCard` query hook to `useCards.js`.

### Step 6.2 — Card Detail Modal Component
Created `src/components/CardDetailModal.jsx`.
- Added a full overlay modal mimicking Trello's card view.
- Implemented an editable title that auto-saves on blur or enter key.
- Implemented an editable markdown/text description area that toggles between view and edit modes.
- Built the layout for the Sidebar (Members, Labels, Dates, Attachment, Cover) and Activity log.

### Step 6.3 — Wiring the Modal to the Board
Updated `src/pages/Board.jsx`:
- Added `selectedCardId` local state.
- Rendered `<CardDetailModal>` at the bottom of the board view.
- Passed `onCardClick` down through `List.jsx` to `Card.jsx` so clicking a card opens the modal.

### Step 6.4 — Cache Invalidation Bug Fix
Fixed a UI bug where the card description would appear to revert to its old value immediately after saving. 
- In `src/hooks/useCards.js`, updated `useUpdateCard` to invalidate BOTH the `boardKeys` and the specific `cardKeys.detail` so the modal instantly re-fetches the new data.
- In `src/components/CardDetailModal.jsx`, switched `mutate` to `mutateAsync` so the UI explicitly waits for the database update and cache invalidation to complete before closing the edit mode.

---

## Phase 7: Advanced Features (Batch 2)

### Step 7.1 — Comments & Activity Log
Created `src/hooks/useComments.js` for fetching and mutating comments.
Created `src/components/CommentSection.jsx` to display a chronologically sorted feed of `comments` and `activities`.
Integrated the `CommentSection` into `CardDetailModal.jsx` at the bottom of the main column.

### Step 7.2 — AWS S3 File Attachments
Created `src/hooks/useAttachments.js` to handle `multipart/form-data` uploads to the backend.
Created `src/components/AttachmentSection.jsx` to allow users to select a file, upload it, and display the resulting image/file preview in the modal.
Integrated the `AttachmentSection` into `CardDetailModal.jsx` right above the checklists.

---
## Phase 8: Final Features & Polish

### Step 8.1 — Member Assignment
Created `src/components/MemberPopover.jsx` for assigning and removing members from cards.
Wired the **Members** sidebar button in `CardDetailModal.jsx` to open the popover.
Added member avatars display in the card detail badges section (alongside Labels and Due Date).

### Step 8.2 — Board Filter Bar
Created `src/components/BoardFilterBar.jsx` with a filter modal.
Supports filtering by:
- **Labels** (checkbox multi-select)
- **Members** (checkbox multi-select)
- **Due Date** (overdue / today / this week / no due date)

Integrated into `Board.jsx` with client-side card filtering logic.
When filters are active, a badge count appears on the Filter button.

### Step 8.3 — Attachment Upload (Sidebar)
Wired the **Attachment** sidebar button in `CardDetailModal.jsx` to trigger a hidden file input.
On file selection, it calls `useAttachmentMutations.uploadAttachment` which POSTs to AWS S3 via the backend.

### Step 8.4 — Archive Card
Wired the **Archive** sidebar button in `CardDetailModal.jsx` to call `PUT /cards/:id` with `{ isArchived: true }`.
Archived cards are automatically hidden from the board (backend filter).

---

## Phase 9: UI Overhaul & Performance Polish

### Step 9.1 — Trello Dark Theme UI
- Updated `index.css` and all components (`Card`, `List`, `Board`, `CardDetailModal`, etc.) to use a premium Trello-style Dark Theme.
- Used authentic hex codes (e.g., `#1D2125` for background, `#22272B` for cards/lists).
- Migrated hardcoded light theme colors to CSS variables for dynamic support.

### Step 9.2 — "Mark as Complete" Feature
- Added an `isComplete` boolean to the `Card` model in `schema.prisma`.
- Built a green toggle checkbox inside `Card.jsx` (next to the title) and `CardDetailModal.jsx` (next to the due date).
- Applying a strikethrough effect to the card title when marked as complete.

### Step 9.3 — Optimistic Updates (Zero-Latency UI)
- Rewrote mutations in `useCards.js` and `useChecklists.js` using React Query's `onMutate`.
- The UI now immediately updates locally when clicking a checklist item or toggling "Mark as complete", eliminating wait times from network latency.
- Set `staleTime` to 30 seconds to keep data fresh but avoid excessive refetching.

### Step 9.4 — AWS S3 Upload Fixes & Cover Colors
- Corrected the `.env` `AWS_REGION` to match the actual bucket location (`us-east-1` -> `ap-south-1`).
- Implemented the "Cover" popover inside `CardDetailModal.jsx` (10 solid colors).
- Implemented "Make Cover" logic inside `AttachmentSection.jsx` to use uploaded images as card covers.

### Step 9.5 — Final UI & Bug Fixes
- Fixed Card Detail Modal responsiveness on mobile to ensure proper outer padding (`px-4 sm:px-8 md:px-12`) so it doesn't touch the screen edges.
- Added optimistic updates to label mutations to eliminate the network delay when toggling labels.
- Added names (`Frontend`, `Research`, `Production`) to the 3 previously empty default labels in `prisma/seed.js` and updated the live DB.
- Added missing right padding to the horizontal scroll container in `Board.jsx` using an `after` pseudo-element.
- Connected the global "Create" button in the `Header.jsx` to open the `CreateBoardModal`.
- Implemented full `deleteBoard` functionality. Users can now securely delete boards from the `BoardList` screen (via a hover-state trash icon) and from the `Board` screen's menu panel.
- Removed non-functional placeholder buttons (the "template" icon next to "Add a card", and "Sort by card name").
- Added proper `cursor-pointer` utility classes to interactive hover elements.

---

## ✅ Project Complete!

All core features have been implemented:
- Board CRUD with custom colors
- List CRUD with drag-and-drop reorder
- Card CRUD with drag-and-drop (same-list and cross-list)
- Card Detail Modal with:
  - Editable title and description
  - Label assignment
  - Member assignment
  - Due dates with overdue badges
  - Checklists with progress bar
  - Comments with activity log
  - File attachments (AWS S3)
  - Card Covers (Colors & Images)
  - Archive action
- Global search across all boards
- Board-level filter by label, member, and due date
- **Trello Dark Mode Aesthetic**
- **Optimistic UI Updates for instant interactions**
