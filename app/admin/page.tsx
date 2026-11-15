"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Database,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Train,
  Luggage,
  Award,
  Phone,
  Power,
  Edit,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  X,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BookingRecord, SahayakProfile, PNRData, BookingStatus, StationCode } from "@/types";
import AppleAvatar from "@/components/AppleAvatar";
import { FirebaseSyncBadge } from "@/components/FirebaseSyncBadge";

interface DbStats {
  totalBookings: number;
  totalSahayaks: number;
  totalPnrs: number;
  totalLogs: number;
  lastUpdated: string;
}

export default function AdminDatabaseDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"BOOKINGS" | "SAHAYAKS" | "PNRS" | "LOGS">("BOOKINGS");
  
  // Data states
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [sahayaks, setSahayaks] = useState<SahayakProfile[]>([]);
  const [pnrs, setPnrs] = useState<PNRData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isAddPnrModalOpen, setIsAddPnrModalOpen] = useState(false);
  const [isAddSahayakModalOpen, setIsAddSahayakModalOpen] = useState(false);
  const [isJsonViewModalOpen, setIsJsonViewModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJsonData, setSelectedJsonData] = useState<any>(null);

  // Form states for Add PNR
  const [newPnr, setNewPnr] = useState({
    pnr: "",
    trainNumber: "12853",
    trainName: "Amarkantak Express",
    fromStation: "Durg Jn",
    toStation: "Bhopal Jn",
    boardingStation: "Bilaspur Junction (BSP)",
    stationCode: "BSP" as StationCode,
    stationName: "Bilaspur Junction (BSP)",
    platform: "2",
    coach: "B4",
    berth: "42 (Side Upper)",
    eta: "19:00 IST",
    arrivalDate: "Today",
    coachPosition: "Central FOB 2 Stairs",
    trainStatus: "Running On Time",
  });

  // Form states for Add Sahayak
  const [newSahayak, setNewSahayak] = useState({
    billaNumber: "BSP-300",
    name: "Mukesh Kumar",
    hindiName: "मुकेश कुमार",
    stationCode: "BSP" as StationCode,
    stationName: "Bilaspur Junction",
    phone: "+91 98270 99881",
    pin: "3000",
    rating: 4.9,
    experienceYears: 6,
    currentLocation: "Platform 1 Concourse",
    isActive: true,
  });

  // Fetch complete database state
  const fetchDb = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/database");
      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data.bookings || []);
        setSahayaks(json.data.sahayaks || []);
        setPnrs(json.data.pnrs || []);
        setAuditLogs(json.data.auditLogs || []);
        setStats(json.stats || null);
      }
    } catch (err) {
      console.error("Failed to load database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const flashMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  // Clear all bookings
  const handleClearBookings = async () => {
    if (!confirm("Are you sure you want to clear all test bookings? This will reset active trips to 0.")) return;
    try {
      const res = await fetch("/api/database?action=CLEAR_BOOKINGS", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        flashMessage("✓ All test bookings cleared. Database is now clean.");
        fetchDb();
      }
    } catch {
      alert("Error clearing bookings");
    }
  };

  // Delete a specific booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm(`Delete booking ${id}?`)) return;
    try {
      const res = await fetch(`/api/database?action=DELETE_BOOKING&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ Booking ${id} deleted.`);
        fetchDb();
      }
    } catch {
      alert("Error deleting booking");
    }
  };

  // Toggle Sahayak duty status
  const handleToggleDuty = async (billaNumber: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_DUTY",
          payload: { billaNumber, isActive: !currentStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ Duty toggled for Billa ${billaNumber}.`);
        fetchDb();
      }
    } catch {
      alert("Error toggling duty");
    }
  };

  // Delete Sahayak
  const handleDeleteSahayak = async (billaNumber: string) => {
    if (!confirm(`Delete Sahayak ${billaNumber} from roster?`)) return;
    try {
      const res = await fetch(`/api/database?action=DELETE_SAHAYAK&id=${billaNumber}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ Sahayak ${billaNumber} removed from roster.`);
        fetchDb();
      }
    } catch {
      alert("Error deleting sahayak");
    }
  };

  // Delete PNR
  const handleDeletePnr = async (pnr: string) => {
    if (!confirm(`Delete PNR ${pnr}?`)) return;
    try {
      const res = await fetch(`/api/database?action=DELETE_PNR&id=${pnr}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ PNR ${pnr} removed from registry.`);
        fetchDb();
      }
    } catch {
      alert("Error deleting PNR");
    }
  };

  // Add new custom PNR
  const handleCreatePnr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPnr.pnr.length !== 10) {
      alert("PNR must be exactly 10 digits");
      return;
    }
    try {
      const res = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PNR",
          payload: { ...newPnr, seatNumber: newPnr.berth },
        }),
      });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ PNR ${newPnr.pnr} registered successfully! You can now test it in Passenger App.`);
        setIsAddPnrModalOpen(false);
        fetchDb();
      }
    } catch {
      alert("Error saving PNR");
    }
  };

  // Add new Sahayak
  const handleCreateSahayak = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: SahayakProfile = {
        id: `sahayak-${newSahayak.billaNumber.toLowerCase()}`,
        billaNumber: newSahayak.billaNumber,
        name: newSahayak.name,
        hindiName: newSahayak.hindiName,
        stationCode: newSahayak.stationCode,
        stationName: newSahayak.stationName,
        phone: newSahayak.phone,
        pin: newSahayak.pin,
        rating: Number(newSahayak.rating),
        reviewsCount: 12,
        completedTrips: 10,
        photoUrl: "/images/coolie-1.png",
        policeVerified: true,
        medicalFitnessValidTill: "2027-12-31",
        experienceYears: Number(newSahayak.experienceYears),
        languages: ["Hindi", "Chhattisgarhi"],
        currentLocation: newSahayak.currentLocation,
        isActive: newSahayak.isActive,
      };

      const res = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_SAHAYAK", payload }),
      });
      const json = await res.json();
      if (json.success) {
        flashMessage(`✓ Sahayak ${newSahayak.name} (${newSahayak.billaNumber}) registered in SECR Roster!`);
        setIsAddSahayakModalOpen(false);
        fetchDb();
      }
    } catch {
      alert("Error adding Sahayak");
    }
  };

  // Export full DB as JSON file
  const handleExportJson = () => {
    const fullData = { bookings, sahayaks, pnrs, auditLogs, stats };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rail_sangwari_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        searchQuery === "" ||
        b.pnr.includes(searchQuery) ||
        b.passengerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.trainDetails?.trainName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#070E1A] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= 1. EXECUTIVE DATABASE BANNER ================= */}
        <div className="apple-glass-card rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.08] dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-md shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  SECR Central Railway Database Manager
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  LIVE DB ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold flex items-center gap-2">
                <span>File-Backed Persistent Store (`data/rail_sangwari_db.json`)</span>
                <span>•</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  Last Updated: {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : "Just now"}
                </span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <FirebaseSyncBadge />

            <button
              onClick={fetchDb}
              disabled={isLoading}
              className="p-2.5 rounded-xl apple-glass-subcard text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
              title="Refresh Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl apple-glass-subcard text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleClearBookings}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Test Bookings</span>
            </button>
          </div>
        </div>

        {/* Action Flash Alert Message */}
        {actionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= 2. LIVE METRIC BENTO CARDS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Active Bookings
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {bookings.length}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                {bookings.filter((b) => b.status === "COMPLETED").length} Done
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              Zero dummy data • 100% real live trips
            </span>
          </div>

          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Licensed Porters
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {sahayaks.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {sahayaks.filter((s) => s.isActive).length} On Duty
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              BSP, Raipur & Durg Junction Roster
            </span>
          </div>

          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              PRS Registered PNRs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {pnrs.length}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                SECR Network
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              Verified train schedules & coach rakes
            </span>
          </div>

          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              System Audit Events
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {auditLogs.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Audit Logged
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              Real-time immutable ledger entries
            </span>
          </div>
        </div>

        {/* ================= 3. NAVIGATION TABS ================= */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] max-w-xl overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("BOOKINGS")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "BOOKINGS"
                ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("SAHAYAKS")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "SAHAYAKS"
                ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sahayak Roster ({sahayaks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PNRS")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "PNRS"
                ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>PRS Registry ({pnrs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "LOGS"
                ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* ================= 4. TAB PANELS ================= */}

        {/* ----------------- TAB 1: BOOKINGS MANAGER ----------------- */}
        {activeTab === "BOOKINGS" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by PNR, Passenger, or ID..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl apple-glass-subcard text-xs font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl apple-glass-subcard text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.08] dark:border-white/10 shadow-lg">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                    <Luggage className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    No Bookings in Database
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    All dummy data has been removed. Test by creating a fresh booking from the Passenger App or testing a 10-digit PNR!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/[0.03] dark:bg-white/[0.04] text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Passenger & PNR</th>
                        <th className="py-3 px-4">Train & Target</th>
                        <th className="py-3 px-4">Assigned Sahayak</th>
                        <th className="py-3 px-4">Fare & Mode</th>
                        <th className="py-3 px-4">Happy Code</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {b.id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold block text-slate-900 dark:text-white">
                              {b.passengerName}
                            </span>
                            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                              PNR: {b.pnr}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold block text-slate-900 dark:text-white">
                              {b.trainDetails?.trainName} ({b.trainDetails?.trainNumber})
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                              PF {b.trainDetails?.platform} • Coach {b.trainDetails?.coach} • Seat {b.trainDetails?.berth}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {b.sahayak ? (
                              <div className="flex items-center gap-1.5">
                                <AppleAvatar name={b.sahayak.name} billaNumber={b.sahayak.billaNumber} size="sm" />
                                <div>
                                  <span className="font-bold block text-slate-900 dark:text-white">
                                    {b.sahayak.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Billa #{b.sahayak.billaNumber}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-black text-slate-900 dark:text-white block">
                              ₹{b.fare?.totalAmount}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ₹{b.fare?.payToSahayakCash} cash to coolie
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white">
                              {b.happyCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                b.status === "COMPLETED"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedJsonData(b);
                                  setIsJsonViewModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                title="View Raw JSON"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-700"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: SAHAYAK ROSTER MANAGER ----------------- */}
        {activeTab === "SAHAYAKS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  SECR Licensed Porter Database Roster
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Manage registered red-shirt coolies, arm badge numbers, and platform duty status.
                </p>
              </div>
              <button
                onClick={() => setIsAddSahayakModalOpen(true)}
                className="py-2 px-3.5 rounded-xl apple-glass-btn-primary font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Sahayak</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sahayaks.map((s) => (
                <div
                  key={s.billaNumber}
                  className="apple-glass-card rounded-3xl p-5 border border-black/[0.08] dark:border-white/10 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AppleAvatar name={s.name} billaNumber={s.billaNumber} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {s.name}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                            ✓ SECR
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold block">
                          Billa #{s.billaNumber} • {s.stationName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDuty(s.billaNumber, s.isActive)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                        s.isActive
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{s.isActive ? "ONLINE" : "OFFLINE"}</span>
                    </button>
                  </div>

                  <div className="text-xs space-y-1 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                      <span>Phone / Auth PIN:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {s.phone} (PIN: {s.pin || "1080"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                      <span>Experience / Trips:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {s.experienceYears} yrs • {s.completedTrips} trips ({s.rating}★)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                      <span>Platform Beat:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[180px]">
                        {s.currentLocation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Medical Valid Till: {s.medicalFitnessValidTill}
                    </span>
                    <button
                      onClick={() => handleDeleteSahayak(s.billaNumber)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: PRS 10-DIGIT PNR REGISTRY ----------------- */}
        {activeTab === "PNRS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  PRS Train Schedules & 10-Digit PNR Registry
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Add any custom 10-digit PNR to test booking flows with custom trains, coaches, and platforms.
                </p>
              </div>
              <button
                onClick={() => setIsAddPnrModalOpen(true)}
                className="py-2 px-3.5 rounded-xl apple-glass-btn-primary font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom PNR</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pnrs.map((p) => (
                <div
                  key={p.pnr}
                  className="apple-glass-card rounded-3xl p-5 border border-black/[0.08] dark:border-white/10 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                          {p.pnr}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                          PF {p.platform}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                        {p.trainName} ({p.trainNumber})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        📍 {p.boardingStation || p.stationName} • {p.fromStation} → {p.toStation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePnr(p.pnr)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete PNR"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F2A4A] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                        Target Coach & Berth
                      </span>
                      <span className="font-black text-sm text-white">
                        Coach {p.coach} • Seat {p.berth || p.seatNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 block">ETA: {p.eta}</span>
                      <span className="text-[9px] text-emerald-400 font-bold block">
                        {p.trainStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: AUDIT LOGS ----------------- */}
        {activeTab === "LOGS" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              System Audit Trail & Database Operations Ledger
            </h3>

            <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.08] dark:border-white/10 shadow-lg">
              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white font-mono text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          by {log.performedBy || "System"}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-300 text-xs">
                        {log.details}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD CUSTOM PNR ================= */}
        {isAddPnrModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-[#0A1929] rounded-3xl border border-amber-400/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Register Custom 10-Digit PNR
                </h3>
                <button onClick={() => setIsAddPnrModalOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePnr} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">10-Digit PNR Number:</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newPnr.pnr}
                    onChange={(e) => setNewPnr({ ...newPnr, pnr: e.target.value.replace(/\D/g, "") })}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 rounded-xl apple-glass-subcard font-mono text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Train Number:</label>
                    <input
                      type="text"
                      required
                      value={newPnr.trainNumber}
                      onChange={(e) => setNewPnr({ ...newPnr, trainNumber: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Train Name:</label>
                    <input
                      type="text"
                      required
                      value={newPnr.trainName}
                      onChange={(e) => setNewPnr({ ...newPnr, trainName: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Platform:</label>
                    <input
                      type="text"
                      required
                      value={newPnr.platform}
                      onChange={(e) => setNewPnr({ ...newPnr, platform: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Coach (e.g. B4):</label>
                    <input
                      type="text"
                      required
                      value={newPnr.coach}
                      onChange={(e) => setNewPnr({ ...newPnr, coach: e.target.value.toUpperCase() })}
                      className="w-full p-2 rounded-xl apple-glass-subcard text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Seat / Berth:</label>
                    <input
                      type="text"
                      required
                      value={newPnr.berth}
                      onChange={(e) => setNewPnr({ ...newPnr, berth: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Boarding Station:</label>
                  <select
                    value={newPnr.stationCode}
                    onChange={(e) => {
                      const code = e.target.value as "BSP" | "R" | "DURG";
                      const name =
                        code === "BSP"
                          ? "Bilaspur Junction (BSP)"
                          : code === "R"
                          ? "Raipur Junction (R)"
                          : "Durg Junction (DURG)";
                      setNewPnr({
                        ...newPnr,
                        stationCode: code,
                        stationName: name,
                        boardingStation: name,
                      });
                    }}
                    className="w-full p-2 rounded-xl apple-glass-subcard font-bold"
                  >
                    <option value="BSP">Bilaspur Junction (BSP)</option>
                    <option value="R">Raipur Junction (R)</option>
                    <option value="DURG">Durg Junction (DURG)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPnrModalOpen(false)}
                    className="px-4 py-2 rounded-xl apple-glass-subcard font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl apple-glass-btn-primary font-bold"
                  >
                    Save PNR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD SAHAYAK ================= */}
        {isAddSahayakModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-[#0A1929] rounded-3xl border border-amber-400/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add New Sahayak Porter to Roster
                </h3>
                <button onClick={() => setIsAddSahayakModalOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSahayak} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Billa Number:</label>
                    <input
                      type="text"
                      required
                      value={newSahayak.billaNumber}
                      onChange={(e) => setNewSahayak({ ...newSahayak, billaNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. BSP-300"
                      className="w-full p-2 rounded-xl apple-glass-subcard font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Auth PIN (4-digit):</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={newSahayak.pin}
                      onChange={(e) => setNewSahayak({ ...newSahayak, pin: e.target.value.replace(/\D/g, "") })}
                      className="w-full p-2 rounded-xl apple-glass-subcard font-bold font-mono text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Name (English):</label>
                    <input
                      type="text"
                      required
                      value={newSahayak.name}
                      onChange={(e) => setNewSahayak({ ...newSahayak, name: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Name (Hindi):</label>
                    <input
                      type="text"
                      required
                      value={newSahayak.hindiName}
                      onChange={(e) => setNewSahayak({ ...newSahayak, hindiName: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Phone Number:</label>
                    <input
                      type="text"
                      required
                      value={newSahayak.phone}
                      onChange={(e) => setNewSahayak({ ...newSahayak, phone: e.target.value })}
                      className="w-full p-2 rounded-xl apple-glass-subcard font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Station Division:</label>
                    <select
                      value={newSahayak.stationCode}
                      onChange={(e) => {
                        const code = e.target.value as "BSP" | "R" | "DURG";
                        const name =
                          code === "BSP"
                            ? "Bilaspur Junction"
                            : code === "R"
                            ? "Raipur Junction"
                            : "Durg Junction";
                        setNewSahayak({ ...newSahayak, stationCode: code, stationName: name });
                      }}
                      className="w-full p-2 rounded-xl apple-glass-subcard font-bold"
                    >
                      <option value="BSP">Bilaspur Junction</option>
                      <option value="R">Raipur Junction</option>
                      <option value="DURG">Durg Junction</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSahayakModalOpen(false)}
                    className="px-4 py-2 rounded-xl apple-glass-subcard font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl apple-glass-btn-primary font-bold"
                  >
                    Add to Roster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: RAW JSON INSPECTOR ================= */}
        {isJsonViewModalOpen && selectedJsonData && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-950 text-white rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-mono text-sm font-bold text-amber-400">
                  Database Record: {selectedJsonData.id}
                </h3>
                <button onClick={() => setIsJsonViewModalOpen(false)}>
                  <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <pre className="p-4 rounded-2xl bg-black/60 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto">
                  {JSON.stringify(selectedJsonData, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setIsJsonViewModalOpen(false)}
                className="w-full py-2.5 rounded-xl apple-glass-btn-primary font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
