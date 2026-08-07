import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { API_URL } from "../config";

const Notepad = ({ saveTrigger, content, setContent, onFileCreated, currentFileName }) => {
  const editorRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");
  const [isEditing, setIsEditing] = useState(!currentFileName); const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Keep editor synced when content is loaded from Sidebara
  useEffect(() => {
    const sanitizedContent = DOMPurify.sanitize(content || "");

    if (
      editorRef.current &&
      editorRef.current.innerHTML !== sanitizedContent
    ) {
      editorRef.current.innerHTML = sanitizedContent;
    }
  }, [content]);

  useEffect(() => {
    setIsEditing(!currentFileName);
  }, [currentFileName]);

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          document.execCommand("bold");
          break;

        case "u":
          e.preventDefault();
          document.execCommand("underline");
          break;

        case "i":
          e.preventDefault();
          document.execCommand("italic");
          break;

        default:
          break;
      }
    }
  };
  const updateToolbarState = () => {
  setActiveFormats({
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
  });
};
  const applyFormat = (command, value = null) => {
  if (!isEditing || !editorRef.current) return;

  editorRef.current.focus();

  setTimeout(() => {
    document.execCommand(command, false, value);

    setContent(editorRef.current.innerHTML);

    updateToolbarState();
  }, 0);
};
  useEffect(() => {
    if (saveTrigger === 0) return;

    if (currentFileName) {
      triggerSave(currentFileName, content, "overwrite");
      return;
    }

    const name = prompt("Enter file name");

    if (!name) return;

    triggerSave(name, content);
  }, [saveTrigger, currentFileName, content]);
  const triggerSave = async (
    name,
    text,
    action = null,
    newName = null
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/note/save`,
        {
          name,
          text,
          action,
          newName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const savedNote = response.data?.note;

      alert(response.data.message);
      onFileCreated?.(
        savedNote
          ? { _id: savedNote._id, name: savedNote.name }
          : { _id: null, name: currentFileName || name }
      );
    } catch (err) {
      if (
        err.response &&
        err.response.status === 409 &&
        err.response.data.requiresAction
      ) {
        const overwrite = window.confirm(
          "A file with this name already exists.\n\nPress OK to overwrite.\nPress Cancel to rename."
        );

        if (overwrite) {
          return triggerSave(name, text, "overwrite");
        }

        const renamed = prompt("Enter a new file name");

        if (!renamed) return;

        return triggerSave(name, text, "rename", renamed);
      }

      console.error(err);
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;

    setContent(editorRef.current.innerHTML);
  };

  return (
    <div className="h-full w-full overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyFormat("bold")}
            disabled={!isEditing}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <strong>Bold</strong>
          </button>

          <button
            type="button"
            onClick={() => applyFormat("italic")}
            disabled={!isEditing}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <em>Italic</em>
          </button>

          <button
            type="button"
            onClick={() => applyFormat("underline")}
            disabled={!isEditing}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <u>Underline</u>
          </button>

        </div>

        {currentFileName && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Edit
          </button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        spellCheck={false}
        dir="ltr"
        onKeyDown={handleKeyDown}
        onInput={isEditing ? handleInput : undefined}
        className={`h-full w-full p-4 overflow-y-auto border rounded-md outline-none whitespace-pre-wrap break-words text-left ${isEditing ? "bg-white" : "bg-slate-100"
          }`}
      />
    </div>
  );
};

export default Notepad;
