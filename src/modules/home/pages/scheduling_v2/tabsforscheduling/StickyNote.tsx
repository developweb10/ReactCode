import React, { useState, useEffect } from "react";
import "../styles/StickyNote.scss";

interface StickyNoteProps {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export default function StickyNote({
  notes,
  setNotes,
}: StickyNoteProps) {
  const [open, setOpen] = useState(false);
  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem("rostering_notes", notes);
  }, [notes]);

  return (
    <div className={`sticky-note ${open ? "open" : "closed"}`}>
      {open ? (
        <>
          <div className="sticky-header">
            <span>📝 Rostering Notes</span>

            <button type="button" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <textarea
            placeholder="Type notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </>
      ) : (
        <button
          type="button"
          className="sticky-icon"
          onClick={() => setOpen(true)}
        >
          📝
        </button>
      )}
    </div>
  );
}