"use client";
import React, { useState, useRef, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app, auth } from "../database"; // Pastikan path sesuai
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dasbord() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const sidebarRef = useRef(null);
    const [schedules, setSchedules] = useState({});
    const [history, setHistory] = useState({});
    const [minutesAgo, setMinutesAgo] = useState(null);

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect ke halaman home setelah logout
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

   // State untuk menyimpan jumlah pil
const MAX_PIL = 14;
const [pil, setPil] = useState(MAX_PIL);

useEffect(() => {
    const db = getDatabase(app);

    const schedulesRef = ref(db, "devices/med_dispenser_01/schedules");
    onValue(schedulesRef, (snapshot) => {
        const data = snapshot.val();
        setSchedules(data || {});
    });

    const alarmsRef = ref(db, "devices/med_dispenser_01/history/alarms");
    const manualRef = ref(db, "devices/med_dispenser_01/history/manual");

    onValue(alarmsRef, (snapshot) => {
        const alarmsData = snapshot.val();
        let totalPengurangan = 0;

        if (alarmsData) {
            Object.values(alarmsData).forEach((dayObj) => {
                Object.values(dayObj).forEach((event) => {
                    if (event?.action === "alarm_stopped") {
                        totalPengurangan += 1;
                    }
                });
            });
        }

        // Ambil manual dispense setelah alarm selesai dihitung
        onValue(manualRef, (manualSnapshot) => {
            const manualData = manualSnapshot.val();
            let totalPenambahan = 0;

            if (manualData) {
                Object.values(manualData).forEach((dayObj) => {
                    Object.values(dayObj).forEach((event) => {
                        if (event?.action === "manual_dispense") {
                            totalPenambahan += 1;
                        }
                    });
                });
            }

            let hasil = MAX_PIL - totalPengurangan + totalPenambahan;
            if (hasil > MAX_PIL) hasil = MAX_PIL;
            if (hasil < 0) hasil = 0;
            setPil(hasil);
        });
    });

        onValue(alarmsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const dateKeys = Object.keys(data).filter(key => /\d{4}-\d{2}-\d{2}/.test(key));
            if (dateKeys.length === 0) return;

            // Ambil tanggal terbaru
            const latestDate = dateKeys.sort().reverse()[0];
            const timeEntries = data[latestDate];

            if (!timeEntries) return;

            const times = Object.keys(timeEntries).filter(t => /\d{2}:\d{2}:\d{2}/.test(t));
            if (times.length === 0) return;

            // Ambil waktu terbaru
            const latestTime = times.sort().reverse()[0];

            // Gabungkan tanggal dan waktu → Date object
            const latestDateTime = new Date(`${latestDate}T${latestTime}`);
            const now = new Date();

            // Hitung selisih menit
            const diffMs = now.getTime() - latestDateTime.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);

            setMinutesAgo(diffMinutes);
        });

    }, []);

    // Handle sidebar visibility for animation
    useEffect(() => {
        if (sidebarOpen) {
            setSidebarVisible(true);
        } else {
            // Delay unmount for animation
            const timeout = setTimeout(() => setSidebarVisible(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [sidebarOpen]);

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

    function formatMinutesToHours(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        let result = '';
        if (hours > 0) {
            result += `${hours} jam`;
        }
        if (remainingMinutes > 0) {
            result += hours > 0 ? ` ${remainingMinutes} menit` : `${remainingMinutes} menit`;
        }

        return result || '0 menit';
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/home"); // Redirect jika tidak login
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-[#f0f4fa] min-h-screen w-screen flex">
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

            {/* Sidebar - Mobile Overlay with animation */}
            {sidebarVisible && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    {/* Sidebar */}
                    <aside
                        ref={sidebarRef}
                        className={`relative w-64 bg-[#e6efff] h-full flex flex-col px-8 py-10 gap-8 shadow-xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-80"
                            }`}
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
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="w-full py-4 bg-blue-500 text-white text-2xl font-bold flex items-center justify-between px-8">
                    <span></span>
                    <div className="flex items-center">
                        <span className="text-base md:text-lg font-semibold mr-2">
                            Admin
                        </span>
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e6efff]">
                            <span className="text-blue-600 text-lg">👤</span>
                        </span>
                    </div>
                </div>

                <main className="flex-1 flex flex-col px-8 py-10 max-h-screen overflow-y-auto">
                    {/* Jadwal Obat */}
                    <section className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 text-left">
                            Dasboard Jadwal
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Pagi */}
                            <div className="flex flex-col justify-center items-center  bg-white shadow-lg rounded-xl h-80 p-10">
                                <p className="text-2xl font-bold text-black mb-4">Pagi</p>
                                <p className="text-lg text-gray-700 mb-2">
                                    {schedules.schedule1 ? schedules.schedule1.hour : ''}:
                                    {schedules.schedule1 ?
                                        schedules.schedule1.minute == 0 ? "00" : schedules.schedule1.minute : ''
                                    }
                                </p>
                                <p className="text-lg text-gray-700">Lisinopril</p>
                            </div>
                            {/* Malam */}
                            <div className="flex flex-col justify-center items-center  bg-white shadow-lg rounded-xl h-80 p-10">
                                <p className="text-2xl font-bold text-black mb-4">Malam</p>
                                <p className="text-lg text-gray-700 mb-2">
                                    {schedules.schedule2 ? schedules.schedule2.hour : ''}:
                                    {schedules.schedule2 ?
                                        schedules.schedule2.minute == 0 ? "00" : schedules.schedule2.minute : ''
                                    }
                                </p>
                                <p className="text-lg text-gray-700">Metformin</p>
                            </div>
                            {/* Slot Obat */}
                            <div className="bg-[#d9e6ff] rounded-2xl flex flex-col justify-center items-center p-12 h-60 shadow">
                                <p className="text-7xl font-extrabold text-[#2f3e56] leading-none">
                                    {pil}
                                </p>
                                <p className="text-gray-600 text-xl mt-2">pil tersisa</p>
                            </div>
                        </div>
                    </section>

                    {/* History */}
                    <section>
                        <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow max-w-lg">
                            <h3 className="text-xl font-semibold text-black mb-4 text-left">
                                Pengambilan Terakhir
                            </h3>
                            <div className="bg-[#d9e6ff] rounded-md p-4 text-[#2f3e56] text-lg font-medium max-w-xs text-left">
                                {formatMinutesToHours(minutesAgo)} ago
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}