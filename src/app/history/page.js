"use client";
import { useState, useEffect, useRef } from 'react';
import { get, getDatabase, ref } from "firebase/database";
import { app, auth } from "../database"; // Pastikan path sesuai
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function JadwalPengambilan() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [alarmStoppedTimes, setAlarmStoppedTimes] = useState([]);

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect ke halaman home setelah logout
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    // Close sidebar when clicking outside (mobile only)
    useEffect(() => {
        if (!sidebarOpen) return;
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarOpen]);

    useEffect(() => {
        const db = getDatabase(app);
        const fetchAlarmStoppedTimes = async () => {
            const dbRef = ref(db, 'devices/med_dispenser_01/history/alarms');
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const result = [];

                Object.entries(data).forEach(([date, entries]) => {
                    if (typeof entries === 'object') {
                        Object.entries(entries).forEach(([time, details]) => {
                            if (typeof details === 'object' && details.action === 'alarm_stopped') {
                                result.push({ tanggal: date, jam: time });
                            }
                        });
                    }
                });

                setAlarmStoppedTimes(result);
            }
        };

        fetchAlarmStoppedTimes();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/home"); // Redirect jika tidak login
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col bg-[#e6efff] w-64 min-h-screen px-8 py-10 items-start gap-8">
                <h1 className="text-black text-2xl font-bold mb-8">Medicine Box</h1>
                <nav className="flex flex-col gap-4 text-gray-700 text-base font-medium w-full">
                    <a
                        href="/dasbord"
                        className="flex items-center gap-3 bg-[#d9e6ff] rounded-lg px-4 py-3 text-black font-semibold"
                    >
                        <i className="fas fa-home text-blue-500"></i>
                        Beranda
                    </a>
                    <a
                        href="/jadwal"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#d9e6ff] rounded-lg"
                    >
                        <i className="far fa-calendar-alt"></i>
                        Jadwal Obat
                    </a>
                    <a
                        href="/history"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#d9e6ff] rounded-lg"
                    >
                        <i className="fas fa-history"></i>
                        Riwayat
                    </a>
                </nav>
                {/* Logout Button */}
                <button
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                    onClick={logout}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </aside>

            {/* Sidebar - Mobile Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    {/* Sidebar */}
                    <aside
                        ref={sidebarRef}
                        className="relative w-64 bg-[#e6efff] h-full flex flex-col px-8 py-10 gap-8 shadow-xl transform transition-transform duration-300 translate-x-0"
                        style={{ minWidth: "16rem" }}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 text-gray-600 hover:text-black focus:outline-none"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <h1 className="text-black text-2xl font-bold mb-8">Medicine Box</h1>
                        <nav className="flex flex-col gap-4 text-gray-700 text-base font-medium w-full">
                            <a
                                href="/dasbord"
                                className="flex items-center gap-3 bg-[#d9e6ff] rounded-lg px-4 py-3 text-black font-semibold"
                            >
                                <i className="fas fa-home text-blue-500"></i>
                                Beranda
                            </a>
                            <a
                                href="/jadwal"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#d9e6ff] rounded-lg"
                            >
                                <i className="far fa-calendar-alt"></i>
                                Jadwal Obat
                            </a>
                            <a
                                href="/history"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#d9e6ff] rounded-lg"
                            >
                                <i className="fas fa-history"></i>
                                Riwayat
                            </a>
                        </nav>
                        {/* Logout Button */}
                        <button
                            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                            onClick={logout}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
                {/* Up Bar */}
                <div className="w-full py-4 bg-blue-500 text-white text-2xl font-bold flex items-center justify-between px-8">
                    <span></span>
                    <div className="flex items-center">
                        <span className="text-base md:text-lg font-semibold mr-2">Admin</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e6efff]">
                            <span className="text-blue-600 text-lg">👤</span>
                        </span>
                    </div>
                </div>

                <div className="mt-30 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-semibold text-black mb-4 text-center md:text-left">
                        Jadwal Pengambilan
                    </h1>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-4 py-2 border border-black text-center">No</th>
                                    <th className="px-4 py-2 border border-black text-center">Jam pengambilan </th>
                                    <th className="px-4 py-2 border border-black text-center">Tanggal Pengambilan</th>
                                </tr>
                            </thead>
                            <tbody className="text-black">
                                {alarmStoppedTimes.length > 0 ? (
                                    alarmStoppedTimes.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
                                        >
                                            <td className="px-4 py-2 border border-black text-center">{index + 1}</td>
                                            <td className="px-4 py-2 border border-black text-center">{item.jam}</td>
                                            <td className="px-4 py-2 border border-black text-center">{item.tanggal}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-2 border border-black text-center" colSpan="3">
                                            Tidak ada data pengambilan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
