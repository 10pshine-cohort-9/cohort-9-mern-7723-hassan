import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import {API_URL} from "../config";

const Notepad = ({ saveTrigger, content, setContent, onFileCreated, currentFileName }) => {
  const editorRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");
  const [isEditing, setIsEditing] = useState(!currentFileName);

  // Keep editor synced when content is loaded from Sidebar
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

  useEffect(() => {
  if (saveTrigger === 0) return;

  if (currentFileName) {
    triggerSave(currentFileName, content, "overwrite");
    return;
  }

  const name = prompt("Enter file name");

  if (!name) return;

  triggerSave(name, content);
}, [saveTrigger]);
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

      alert(response.data.message);
      onFileCreated?.(currentFileName || name);
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
    <div className="h-full w-full overflow-hidden">
      <div className="mb-3 flex justify-end">
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
        className={`h-full w-full p-4 overflow-y-auto border rounded-md outline-none whitespace-pre-wrap break-words text-left ${
          isEditing ? "bg-white" : "bg-slate-100"
        }`}
      />
    </div>
  );
};

export default Notepad;
