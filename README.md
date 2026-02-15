# Smart Meeting Assistant

A production-ready React application for tracking meeting action items. Features AI-powered extraction, local/cloud persistence, and a system health dashboard.

## Features
-   **AI Extraction**: Automatically parses transcripts to find Tasks, Owners, and Due Dates.
-   **Dual Persistence**: Supports **Supabase** (Cloud) and **LocalStorage** (Offline/Guest) modes.
-   **History**: Retains the last 5 transcripts for quick reload.
-   **System Health**: Dashboard (`/status`) to monitor backend, database, and LLM connectivity.
-   **Export**: Copy action items to clipboard with one click.

## Tech Stack
-   **Frontend**: React, TypeScript, Tailwind CSS, Vite
-   **State Management**: React Context + Hooks
-   **Routing**: React Router Dom
-   **Icons**: Lucide React

## Setup & How to Run

### Prerequisites
-   Node.js (v18+)
-   npm

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/uasr208/Smart_Meeting_Assistant.git
    cd Smart_Meeting_Assistant
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration
Create a `.env` file in the root directory (optional for Guest mode):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: For actual LLM integration (if implemented server-side or via proxy)
# VITE_LLM_API_KEY=your_key
```
*Note: If Supabase keys are missing, the app automatically falls back to LocalStorage.*

### Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure
-   `src/components`: UI components (ActionList, History, etc.)
-   `src/lib`: Core logic (Parser, Storage Service, Supabase Client)
-   `src/context`: Global state (Auth)
-   `src/pages`: Route pages (Home, Status)

## License
MIT
