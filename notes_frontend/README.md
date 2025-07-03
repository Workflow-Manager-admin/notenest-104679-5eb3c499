# Notes Frontend

A modern, minimalistic React UI for creating, viewing, editing, and deleting notes.

## Features

- **List all notes** in a sidebar
- **View, edit, and delete** notes in a main content panel
- **Create new notes** with the floating "+" button or in sidebar
- **Responsive design**: works on desktop, tablet, and mobile
- **Minimal and modern style** using your provided colors

## Quickstart

### Prerequisites

- Node.js and npm
- The notes backend server running (see below)

### Running the frontend

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm start
   ```

   The app runs on [http://localhost:3000](http://localhost:3000)

3. Make sure the backend is running and accessible (by default, it should run at `http://localhost:3001`). The frontend expects backend notes API at `/api/notes`.  
   If the backend is running elsewhere, update the `API_BASE` in `src/App.js` accordingly.

### Using the app

- See a list of notes on the left sidebar. Click a note to view.
- Click "+" (bottom right or in sidebar) to create a new note.
- When a note is selected, use "Edit" and "Delete" buttons in the top bar.
- All actions update via the backend REST API.
- Modals are used for editing/creating and deleting notes.

### Customizing

- Color scheme is defined directly in `src/App.js` and can be tweaked by changing the `COLORS` constant.
- Core UI style is in `src/App.css`.

### Notes

- The UI is light-themed, minimal, and built from scratch with pure React and CSS (no heavy frameworks).
- To change the backend address, edit the `API_BASE` (top of `src/App.js`).
- If you want to pre-populate notes, add via backend or connect DB.
- For advanced customization, edit/join components in `src/App.js`.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

