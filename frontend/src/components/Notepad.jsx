import React, { useRef, useState } from "react";

const Notepad = () => {
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

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

  const handleInput = () => {
    setContent(editorRef.current.innerHTML);
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="h-full w-full p-4 overflow-y-auto border rounded-md outline-none whitespace-pre-wrap break-words"
      />

      {/* Optional: Check stored content */}
      {/* <pre>{content}</pre> */}
    </div>
  );
};

export default Notepad;