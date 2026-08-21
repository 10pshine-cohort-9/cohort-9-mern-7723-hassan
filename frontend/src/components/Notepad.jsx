import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { API_URL } from "../config";

const Notepad = ({
  saveTrigger,
  content,
  setContent,
  onFileCreated,
  currentFileName,
}) => {
  const editorRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  const [isEditing, setIsEditing] = useState(!currentFileName);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

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
          applyFormat("bold");
          break;

        case "u":
          e.preventDefault();
          applyFormat("underline");
          break;

        case "i":
          e.preventDefault();
          applyFormat("italic");
          break;

        default:
          break;
      }
    }
  };

  const updateToolbarState = () => {
    if (typeof document.queryCommandState !== "function") {
      return;
    }

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
      if (typeof document.execCommand === "function") {
        document.execCommand(command, false, value);
      }

      setContent(editorRef.current.innerHTML);
      updateToolbarState();
    }, 0);
  };

  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const currentFileNameRef = useRef(currentFileName);

  useEffect(() => {
    currentFileNameRef.current = currentFileName;
  }, [currentFileName]);

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
          ? {
              _id: savedNote._id,
              name: savedNote.name,
            }
          : {
              _id: null,
              name: currentFileName || name,
            }
      );
    } catch (err) {
      if (
        err.response?.status === 409 &&
        err.response?.data?.requiresAction
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

      alert(
        err.response?.data?.message || "Failed to save"
      );
    }
  };

  useEffect(() => {
    if (saveTrigger === 0) return;

    if (currentFileNameRef.current) {
      triggerSave(
        currentFileNameRef.current,
        contentRef.current,
        "overwrite"
      );

      return;
    }

    const name = prompt("Enter file name");

    if (!name) return;

    triggerSave(
      name,
      contentRef.current
    );
  }, [saveTrigger]);

  const handleInput = () => {
    if (!editorRef.current) return;

    setContent(editorRef.current.innerHTML);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyFormat("bold")}
            disabled={!isEditing}
            aria-pressed={activeFormats.bold}
            className={`px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 ${
              activeFormats.bold ? "bg-gray-300" : ""
            }`}
          >
            <strong>Bold</strong>
          </button>

          <button
            type="button"
            onClick={() => applyFormat("italic")}
            disabled={!isEditing}
            aria-pressed={activeFormats.italic}
            className={`px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 ${
              activeFormats.italic ? "bg-gray-300" : ""
            }`}
          >
            <em>Italic</em>
          </button>

          <button
            type="button"
            onClick={() => applyFormat("underline")}
            disabled={!isEditing}
            aria-pressed={activeFormats.underline}
            className={`px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 ${
              activeFormats.underline ? "bg-gray-300" : ""
            }`}
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
        role="textbox"
        aria-readonly={!isEditing}
        aria-multiline="true"
        aria-label="Note content"
        suppressContentEditableWarning
        spellCheck={false}
        dir="ltr"
        onKeyDown={handleKeyDown}
        onInput={isEditing ? handleInput : undefined}
        onMouseUp={updateToolbarState}
        onKeyUp={updateToolbarState}
        className={`min-h-0 flex-1 w-full p-4 overflow-y-auto border rounded-md outline-none whitespace-pre-wrap break-words text-left ${
          isEditing ? "bg-white" : "bg-slate-100"
        }`}
      />
    </div>
  );
};

export default Notepad;