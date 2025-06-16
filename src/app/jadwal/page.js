"use client";

import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { getDatabase, ref, set } from "firebase/database";
import { app, auth } from "../database"; // Pastikan path sesuai
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function PengaturanJadwal() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    // State untuk waktu
    const [morningTime, setMorningTime] = useState("09:00");
    const [eveningTime, setEveningTime] = useState("21:00");

    const [schedule1, setSchedule1] = useState({ hour: 9, minute: 0 });
    const [schedule2, setSchedule2] = useState({ hour: 21, minute: 0 });

    const database = getDatabase(app);

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect ke halaman home setelah logout
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    const handleSave = async () => {
        const [morningHour, morningMinute] = morningTime.split(":").map(Number);
        const [eveningHour, eveningMinute] = eveningTime.split(":").map(Number);

        try {
            await set(ref(database, "devices/med_dispenser_01/schedules/schedule1"), {
                hour: morningHour,
                minute: morningMinute,
                enabled: true,
                name: "Morning",
            });

            await set(ref(database, "devices/med_dispenser_01/schedules/schedule2"), {
                hour: eveningHour,
                minute: eveningMinute,
                enabled: true,
                name: "Evening",
            });

            alert("Jadwal berhasil disimpan ke Firebase!");
        } catch (error) {
            console.error("Gagal menyimpan ke Firebase:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/home"); // Redirect jika tidak login
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
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
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 flex items-center justify-between text-white">
                    {/* Hamburger for mobile */}
                    <button
                        className="lg:hidden fixed top-4 left-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white shadow-lg focus:outline-none"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
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
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                        <span>Admin</span>
                        <div className="bg-white rounded-full p-1">
                            <span className="text-blue-600 text-lg">👤</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Pengaturan Jam Minum Obat
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Atur jadwal minum obat sesuai dengan kebutuhan
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Absensi Otomatis */}

                        {/* Waktu Masuk */}
                        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-blue-500">
                            <h2 className="font-semibold text-lg text-gray-800 mb-4">
                                🕒 jadwal pagi
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Masukan waktu yang ingin dijadwalkan
                            </p>
                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-700 w-16">Mulai</label>
                                    <input
                                        type="time"
                                        value={morningTime}
                                        onChange={(e) => setMorningTime(e.target.value)}
                                        className="border text-black rounded px-3 py-1 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded"
                                >
                                    Simpan
                                </button>
                                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-4 rounded">
                                    Batal
                                </button>
                            </div>
                        </div>

                        {/* Waktu Keluar */}
                        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-blue-500">
                            <h2 className="font-semibold text-lg text-gray-800 mb-4">
                                🕒 jadwal malam
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                masukan waktu yang ingin dijadwalkan
                            </p>
                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-700 w-16">Atur</label>
                                    <input
                                        type="time"
                                        value={eveningTime}
                                        onChange={(e) => setEveningTime(e.target.value)}
                                        className="border text-black rounded px-3 py-1 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded"
                                >
                                    Simpan
                                </button>
                                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-4 rounded">
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
