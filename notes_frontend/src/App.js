import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Accent and main colors as per requirements.
 */
const COLORS = {
  accent: "#ffeb3b",
  primary: "#1976d2",
  secondary: "#757575"
};

// Backend API base
const API_BASE = "http://localhost:3001/api/notes"; // Change if backend runs elsewhere

// PUBLIC_INTERFACE
/**
 * NotesApp main component for fullstack notes app.
 *
 * Left sidebar: list of note titles. 
 * Main area: view/edit selected note.
 * Floating button: add new note.
 * Modal dialogs for edit/delete.
 */
function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingNote, setEditingNote] = useState(null); // {id, title, content}
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Fetch notes initially
  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch all notes
  // PUBLIC_INTERFACE
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data);
      if (data.length && (selectedId === null || !data.some(n=>n.id===selectedId))) {
        setSelectedId(data[0].id);
      } else if (data.length === 0) {
        setSelectedId(null);
      }
    } catch (error) {
      setErrorMsg(error.message || "Could not fetch notes");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  // Select a note
  const selectNote = (id) => {
    setSelectedId(id);
    setIsCreating(false);
  };

  // PUBLIC_INTERFACE
  // Open modal for editing/creating a note
  const openEditModal = (note) => {
    setEditingNote(note || { title: "", content: "" });
    setShowEditModal(true);
    setIsCreating(!note || !note.id);
  };

  // PUBLIC_INTERFACE
  // Open modal for delete confirmation
  const openDeleteModal = (note) => {
    setEditingNote(note);
    setShowDeleteModal(true);
  };

  // PUBLIC_INTERFACE
  // Create a new note
  const createNote = async (note) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
      if (!res.ok) throw new Error("Failed to create note");
      setShowEditModal(false);
      fetchNotes();
    } catch (error) {
      setErrorMsg(error.message || "Could not create note");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  // Update an existing note
  const updateNote = async (note) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
      if (!res.ok) throw new Error("Failed to update note");
      setShowEditModal(false);
      fetchNotes();
    } catch (error) {
      setErrorMsg(error.message || "Update failed");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  // Delete a note
  const deleteNote = async (note) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${note.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      setShowDeleteModal(false);
      fetchNotes();
    } catch (error) {
      setErrorMsg(error.message || "Delete failed");
    }
    setLoading(false);
  };

  // UI rendering
  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#fff", color: "#222", fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    }}>
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={selectNote}
        onAdd={() => openEditModal(null)}
        accentColor={COLORS.accent}
        primaryColor={COLORS.primary}
        loading={loading}
      />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        background: "#fafbfc",
        borderLeft: `1px solid ${COLORS.secondary}22`,
        position: "relative"
      }}>
        <div style={{
          padding: "2.2rem 2.5rem 1.5rem 2.5rem",
          borderBottom: `1px solid ${COLORS.secondary}22`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <h1 style={{
            color: COLORS.primary, fontSize: 26, fontWeight: 700, margin: 0
          }}>My Notes</h1>
          {!!selectedNote &&
            <>
              <button className="btn outline"
                title="Edit note"
                style={{ color: COLORS.primary, marginRight: 8 }}
                onClick={() => openEditModal(selectedNote)}
              >Edit</button>
              <button className="btn outline"
                title="Delete note"
                style={{ color: COLORS.secondary }}
                onClick={() => openDeleteModal(selectedNote)}
              >Delete</button>
            </>
          }
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
          {errorMsg && <div style={{ color: "red", marginBottom: 8 }}>{errorMsg}</div>}
          {
            notes.length === 0 && !isCreating ? (
              <div>
                <p>No notes found. Click the <span style={{ color: COLORS.accent }}>+</span> button to add your first note.</p>
              </div>
            ) : isCreating || !selectedNote ? (
              <EmptyState />
            ) : (
              <NoteDisplay note={selectedNote} />
            )
          }
        </div>

        {/* Floating Action Button */}
        <button
          title="Add note"
          aria-label="Add new note"
          onClick={() => openEditModal(null)}
          style={{
            position: "fixed",
            right: 42, bottom: 42,
            zIndex: 1000,
            background: COLORS.accent,
            color: "#222",
            border: "none",
            boxShadow: "0 2px 12px #0003",
            width: 60, height: 60,
            borderRadius: "50%",
            fontSize: "2.3rem",
            fontWeight: 600,
            transition: "transform .12s",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >+</button>
      </main>

      {/* Edit/Create Modal */}
      {showEditModal &&
        <NoteModal
          note={editingNote}
          onSave={isCreating ? createNote : updateNote}
          onCancel={() => { setShowEditModal(false); setIsCreating(false); }}
          isCreating={isCreating}
          accentColor={COLORS.accent}
          primaryColor={COLORS.primary}
        />
      }

      {/* Delete Modal */}
      {showDeleteModal &&
        <DeleteModal
          note={editingNote}
          onConfirm={() => deleteNote(editingNote)}
          onCancel={() => setShowDeleteModal(false)}
          accentColor={COLORS.accent}
        />
      }

      {/* Instructions Modal (for first run/help) */}
      <Instructions primaryColor={COLORS.primary} accentColor={COLORS.accent} />
    </div>
  );
}

// Sidebar for notes list
function Sidebar({ notes, selectedId, onSelect, onAdd, accentColor, primaryColor, loading }) {
  return (
    <aside style={{
      width: 280, background: "#fff",
      borderRight: "1px solid #eee",
      padding: "0",
      display: "flex", flexDirection: "column", height: "100vh"
    }}>
      <div style={{
        padding: ".8rem 1.2rem",
        borderBottom: "1px solid #eee",
        fontWeight: 700, fontSize: 15, letterSpacing: ".1em",
        color: "#222"
      }}>
        Notes
        <button onClick={onAdd}
          title="Add new note"
          style={{
            float: "right", fontSize: 19, background: accentColor, color: "#222",
            border: "none", borderRadius: "50%", width: 34, height: 34, fontWeight: 700,
            marginRight: 0, cursor: "pointer"
          }}>+</button>
      </div>
      <div style={{
        flex: 1, overflowY: "auto", padding: "1.3rem 0", background: "#fafbfc"
      }}>
        {loading && <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>Loading...</div>}
        {notes.map(note => (
          <div key={note.id}
            onClick={() => onSelect(note.id)}
            style={{
              background: note.id === selectedId ? primaryColor : "transparent",
              color: note.id === selectedId ? "#fff" : "#222",
              borderRadius: 7,
              margin: "0 1.3rem 0.5rem",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              fontWeight: note.id === selectedId ? 600 : 400,
              border: "none",
              transition: ".12s"
            }}>
            <div style={{
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
            }}>{note.title || <em style={{ opacity: 0.5 }}>Untitled Note</em>}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// The display of the selected note content
function NoteDisplay({ note }) {
  return (
    <article>
      <h2 style={{ fontWeight: 700, marginTop: 0, fontSize: 22 }}>{note.title}</h2>
      <div style={{
        fontSize: 16, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap", marginTop: 22
      }}>{note.content}</div>
    </article>
  );
}

// Modal for editing or creating notes
function NoteModal({ note, onSave, onCancel, isCreating, accentColor, primaryColor }) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...note, title, content });
    setSaving(false);
  };
  return (
    <div style={modalOverlayStyle()}>
      <form style={modalPanelStyle()} onSubmit={handleSubmit}>
        <h2 style={{ color: primaryColor }}>{isCreating ? "Create Note" : "Edit Note"}</h2>
        <input
          required
          type="text"
          value={title}
          autoFocus
          placeholder="Title"
          onChange={e => setTitle(e.target.value)}
          style={{
            fontSize: 18, fontWeight: 600, width: "100%", margin: "16px 0 14px 0",
            padding: "10px", border: `1px solid ${accentColor}55`, borderRadius: 7
          }}
        />
        <textarea
          required
          placeholder="Start typing your note..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          style={{
            resize: "vertical", fontSize: 15, width: "100%", padding: "10px",
            border: `1px solid #ccc`, borderRadius: 8, minHeight: 120, marginBottom: 20
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button type="button" className="btn outline"
            style={{ color: "#555" }} onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn"
            style={{
              background: accentColor,
              color: "#222",
              border: "none",
              fontWeight: 700,
              minWidth: 90
            }}>{saving ? "Saving..." : isCreating ? "Create" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

// Modal for delete confirmation
function DeleteModal({ note, onConfirm, onCancel, accentColor }) {
  return (
    <div style={modalOverlayStyle()}>
      <div style={modalPanelStyle()}>
        <h2 style={{ color: accentColor }}>Delete Note?</h2>
        <div style={{ margin: "16px 0 22px 0" }}>
          Are you sure you want to delete <strong>{note.title || "Untitled note"}</strong>?
        </div>
        <div style={{ display: "flex", gap: 18, justifyContent: "flex-end" }}>
          <button className="btn outline" style={{ color: "#555" }} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background: accentColor, color: "#222", fontWeight: 700 }}
            onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div style={{ opacity: 0.52, textAlign: "center", marginTop: 80 }}>
      <p style={{ fontSize: 18, color: "#666" }}>Start by clicking <span style={{ color: "#ffeb3b", fontWeight: 700, fontSize: 22 }}>+</span> to add a new note.</p>
    </div>
  );
}

// Brief instructions modal (appears as dismissible floating help)
function Instructions({ primaryColor, accentColor }) {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 26, left: 36, zIndex: 1050,
      background: "#fff", color: "#232323", border: `1px solid ${primaryColor}33`,
      borderRadius: 15, boxShadow: "0 1px 10px rgba(0,0,0,0.11)",
      maxWidth: 340, padding: "1.25rem 1.5rem 1rem 1.5rem", fontSize: 16
    }}>
      <div style={{ fontWeight: 700, color: primaryColor, fontSize: 18, marginBottom: 2 }}>
        How to Use
      </div>
      <ul style={{ margin: "0 0 12px 0", paddingLeft: 22, fontSize: 15 }}>
        <li>Click <span style={{ color: accentColor, fontWeight: 700 }}>+</span> to add a new note</li>
        <li>Click a note title to view it</li>
        <li>Click "Edit" to change note, or "Delete" to remove it</li>
      </ul>
      <button onClick={() => setShow(false)}
        style={{
          fontSize: 13, border: "none", background: accentColor,
          borderRadius: 7, color: "#222", padding: "4px 14px",
          fontWeight: 600, cursor: "pointer", float: "right", marginTop: 2
        }}>Got it</button>
      <div style={{ clear: "both" }} />
    </div>
  );
}

/**
 * Helpers for modal styles
 */
function modalOverlayStyle() {
  return {
    position: "fixed",
    left: 0, top: 0, width: "100vw", height: "100vh",
    background: "#2228",
    zIndex: 9999,
    display: "flex",
    alignItems: "center", justifyContent: "center"
  };
}
function modalPanelStyle() {
  return {
    background: "#fff",
    borderRadius: "15px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
    padding: "32px 28px 22px 28px",
    minWidth: 320,
    maxWidth: 440,
    minHeight: 120
  };
}

export default App;
