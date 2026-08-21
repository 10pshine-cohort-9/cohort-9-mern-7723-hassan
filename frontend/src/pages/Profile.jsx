import { useState, useEffect } from "react";
import axios from "axios";
import Heading from "../components/Heading";
import Sidebar from "../components/Sidebar";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [profile, setProfile] = useState(null);
    const [filesList, setFilesList] = useState([]);
    const navigate = useNavigate();

    const accessToken = localStorage.getItem("accessToken");

    const toggleSidebar = () => setIsOpen(!isOpen);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.data.success) {
                setProfile(res.data.user);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_URL}/note/files`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.data.success) {
                setFilesList(res.data.files || []);
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

  

    const username = profile?.username || "Loading...";
    const email = profile?.email || "";
    const initial = profile?.username?.charAt(0).toUpperCase() || "?";

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
                    onNew={() => navigate("/dashboard")}
                    onOpen={() => { }}
                    onSave={() => { }}
                    onExport={() => { }}
                    setContent={() => { }}
                    refreshTrigger={0}
                    currentFile={{ id: null, name: null }}
                    isProfile={true}
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
                <div className="min-h-[calc(100vh-4rem)] p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">

                        {/* Profile Header */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                                    {initial}
                                </div>

                                {/* User Information */}
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {username}
                                    </h1>

                                    <p className="mt-1 text-gray-500">
                                        {email}
                                    </p>

                                    <p className="mt-3 text-sm text-gray-400">
                                        Personal Profile
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Your Notes
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Notes saved in your account
                                    </p>
                                </div>

                                <div className="min-w-10 h-10 px-3 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-blue-600">
                                        {filesList.length}
                                    </span>
                                </div>
                            </div>

                            {/* Notes List */}
                            {filesList.length > 0 ? (
                                <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200">
                                    {filesList.map((file) => (
                                        <div
                                            key={file._id}
                                            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-gray-200 hover:bg-gray-50 transition"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />

                                            <p className="text-sm text-gray-700 truncate">
                                                {file.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 rounded-xl py-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        No notes saved yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Account Summary */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                    Account
                                </p>

                                <p className="mt-2 font-medium text-gray-700">
                                    Active
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                    Total Notes
                                </p>

                                <p className="mt-2 font-medium text-gray-700">
                                    {filesList.length}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
