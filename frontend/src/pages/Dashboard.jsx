import { useState, useEffect } from "react";
import Heading from "../components/Heading";
import Sidebar from "../components/Sidebar";
import Notepad from "../components/Notepad";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const [content, setContent] = useState("");

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    // Set correct state on initial load
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNew = () => setContent("");

  const handleExport = () => {
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "note.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
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
          onSave={() => setSaveTrigger((prev) => prev + 1)}
          onExport={handleExport}
          onSettings={handleSettings}
          setContent={setContent}
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
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;