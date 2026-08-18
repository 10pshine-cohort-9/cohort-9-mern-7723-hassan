import React, { useState, useMemo } from "react";
import { MdDeleteForever, MdSearch, MdClose } from "react-icons/md";

const AvailableNotes = ({
  filesList,
  onOpenFile,
  onDeleteFile,
  currentFileId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return filesList;

    return filesList.filter((file) =>
      file.name?.toLowerCase().includes(term)
    );
  }, [filesList, searchTerm]);

  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <div className="rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden">
      <div className="relative border-b border-gray-200 p-2">
        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
          className="w-full pl-8 pr-7 py-1.5 text-sm text-gray-700 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {searchTerm && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <MdClose />
          </button>
        )}
      </div>

      <div className="max-h-[25vh] overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <p className="px-3 py-4 text-sm text-gray-400 text-center">
            {hasSearchTerm ? `No notes match "${searchTerm}"` : "No notes available"}
          </p>
        ) : (
          filteredFiles.map((file) => (
  <div key={file._id} className="relative border-b border-gray-200">
    <button
      type="button"
      onClick={() => onOpenFile(file._id)}
      className="flex w-full items-center justify-between px-3 py-2 pr-10 hover:bg-gray-100 text-left"
    >
      <span className="flex-1 text-sm text-gray-700 truncate">
        {file.name}
      </span>
    </button>

    <button
      type="button"
      aria-label={`Delete ${file.name}`}
      disabled={currentFileId === file._id}
      onClick={(e) => {
        e.stopPropagation();
        onDeleteFile(file._id);
      }}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl transition-colors ${
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
))
        )}
      </div>
    </div>
  );
};

export default AvailableNotes;