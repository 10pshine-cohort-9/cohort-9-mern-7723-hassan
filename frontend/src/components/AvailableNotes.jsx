import React from "react";

const AvailableNotes = ({ filesList, onOpenFile }) => {
  return (
    <div className="max-h-[25vh] overflow-y-auto rounded-lg">
      {filesList.map((file) => (
        <div
          key={file._id}
          onClick={() => onOpenFile(file._id)}
          className="h-10 flex items-center justify-center w-full bg-white hover:bg-gray-100 text-gray-700 text-xs border-b border-gray-200 cursor-pointer transition-colors"
        >
          {file.name}
        </div>
      ))}
    </div>
  );
};

export default AvailableNotes;