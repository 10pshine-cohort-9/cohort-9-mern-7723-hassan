import React from "react";
import { MdDeleteForever } from "react-icons/md";

const AvailableNotes = ({
  filesList,
  onOpenFile,
  onDeleteFile,
  currentFileId,
}) => {
  return (
    <div className="max-h-[25vh] overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200">
      {filesList.map((file) => (
        <div
          key={file._id}
          role="button"
          tabIndex={0}
          onClick={() => onOpenFile(file._id)}
          onKeyDown={(event) => event.key === "Enter" && onOpenFile(file._id)}
          className="flex items-center justify-between px-3 py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
        >
          <span className="flex-1 text-sm text-gray-700 truncate">
            {file.name}
          </span>

          <button
            type="button"
            aria-label={`Delete ${file.name}`}
            disabled={currentFileId === file._id}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(file._id);
            }}
            className={`ml-3 text-xl transition-colors ${
              currentFileId === file._id
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:text-red-700"
            }`}
            title={
              currentFileId === file._id
                ? "Cannot delete the currently open file"
                : "Delete file"
            }
          >
            <MdDeleteForever />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AvailableNotes;
