import React, { useRef, useEffect } from "react";
import axios from "axios";

const Notepad = ({ saveTrigger, content, setContent }) => {
  const editorRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  // Keep editor synced when content is loaded from Sidebar
  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== (content || "")
    ) {
      editorRef.current.innerHTML = content || "";
    }
  }, [content]);

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
        `${import.meta.env.VITE_API_URL}/file/save`,
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
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        dir="ltr"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="h-full w-full p-4 overflow-y-auto border rounded-md outline-none whitespace-pre-wrap break-words text-left"
      />
    </div>
  );
};

export default Notepad;