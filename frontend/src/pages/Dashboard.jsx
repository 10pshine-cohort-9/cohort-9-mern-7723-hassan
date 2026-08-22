import { useState, useEffect, useRef } from "react";
import Heading from "../components/Heading";
import Sidebar from "../components/Sidebar";
import Notepad from "../components/Notepad";
import { connectSocket, disconnectSocket } from "../socket";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const [content, setContent] = useState("");
  const [fileCreated, setFileCreated] = useState(0);
  const [currentFile, setCurrentFile] = useState({ id: null, name: null });
  const currentFileRef = useRef(currentFile);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    currentFileRef.current = currentFile;
  }, [currentFile]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    socket.on("note:created", () => {
      setFileCreated((prev) => prev + 1);
    });

    socket.on("note:updated", (updatedNote) => {
      setFileCreated((prev) => prev + 1);

      if (currentFileRef.current.id === updatedNote._id) {
        setContent(updatedNote.content);
      }
    });

    socket.on("note:deleted", ({ _id }) => {
      setFileCreated((prev) => prev + 1);

      if (currentFileRef.current.id === _id) {
        setContent("");
        setCurrentFile({ id: null, name: null });
      }
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleNew = () => {
    setContent("");
    setCurrentFile({ id: null, name: null });
  };

  const handleFileOpen = (file) => {
    setContent(file.content);
    setCurrentFile({ id: file._id, name: file.name });
  };

  const handleImport = (fileText, fileName) => {
    setContent(fileText);
    setCurrentFile({ id: null, name: null });
  };

  const handleExport = () => {
    if (!content) {
      alert("No content available to export");
      return;
    }

    if (!currentFile.name) {
      alert("Please open a file before exporting");
      return;
    }

    const fileName = currentFile.name.endsWith(".txt")
      ? currentFile.name
      : `${currentFile.name}.txt`;

    const exportedText = new DOMParser().parseFromString(
      content,
      "text/html"
    ).body.textContent;

    const blob = new Blob([exportedText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-16 z-50">
        <Heading
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed
          top-16
          left-0
          w-64
          h-[calc(100vh-4rem)]
          bg-gray-800
          transition-transform
          duration-300
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          onNew={handleNew}
          onOpen={handleFileOpen}
          onSave={() => setSaveTrigger((prev) => prev + 1)}
          onExport={handleExport}
          onImport={handleImport}
          setContent={setContent}
          refreshTrigger={fileCreated}
          currentFile={currentFile}
        />
      </div>

      {/* Main Content */}
      <main
        className={`
          pt-16
          transition-all
          duration-300
          ${isOpen ? "md:ml-64" : "md:ml-0"}
        `}
      >
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          <Notepad
            saveTrigger={saveTrigger}
            content={content}
            setContent={setContent}
            currentFileName={currentFile.name}
            onFileCreated={(savedNote) => {
              if (savedNote) {
                setCurrentFile((prev) => ({
                  ...prev,
                  id: savedNote._id ?? prev.id,
                  name: savedNote.name ?? prev.name,
                }));
              }

              setFileCreated((prev) => prev + 1);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;