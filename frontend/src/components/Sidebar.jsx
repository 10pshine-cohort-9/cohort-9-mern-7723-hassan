import axios from "axios";
import { useEffect, useState } from "react";
import AvailableNotes from "./AvailableNotes";
const Sidebar = ({
  onNew,
  onSave,
  onOpen,
  onExport,
  onSettings,
  setContent,
}) => {
  
  const accessToken = localStorage.getItem("accessToken");
  const [profile, setProfile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [avl, setAvl] = useState(false)
  const handleOpen = () => {
    setAvl(!avl)
  };

  const handleOpenFile = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.data.success) {
        setContent(res.data.file.content);
        setAvl(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to open file");
    }
  };
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.data.success) {
        setProfile(res.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/files`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.data.success) {
        setFilesList(res.data.files);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    fetchProfile();
    fetchFiles();
  }, [accessToken]);

  return (
    <div className="h-full flex flex-col justify-between bg-slate-800 text-gray-200 p-4 mt-6">


      {/* Action Buttons */}
      <div className="space-y-2.5 flex-1">
        <button
          onClick={onNew}
          className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          Create New
        </button>
        <div className="relative w-full">
          <button
            onClick={handleOpen}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white font-normal rounded-lg transition duration-200 flex items-center justify-center gap-2 border border-gray-300"
          >
            Open
          </button>
          {avl && (
            <div className="absolute left-full top-0 ml-2 z-50 min-w-[180px] w-max">
              <AvailableNotes
                filesList={filesList}
                onOpenFile={handleOpenFile}
              />
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          Save
        </button>

        {/* NEW: Export Button */}
        <button
          onClick={onExport}
          className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          Export
        </button>

        {/* Divider */}
        <div className="border-t border-slate-700 my-3"></div>

        {/* NEW: Settings Button */}
        <button
          onClick={onSettings}
          className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
        >
          Settings
        </button>
      </div>

      {/* Profile */}
      <div className="border-t border-slate-700 pt-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {profile?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.username || "Loading..."}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {profile?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;