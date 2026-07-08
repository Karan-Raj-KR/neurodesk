"use client";

import { useState } from "react";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    location: "Koramangala",
    attendance: "",
    revenue: "",
    flag: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/daily-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: formData.location,
          attendance: parseInt(formData.attendance) || 0,
          revenue: parseInt(formData.revenue) || 0,
          flag: formData.flag,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ location: "Koramangala", attendance: "", revenue: "", flag: "" });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-[1440px] mx-auto flex flex-col">
      <header className="mb-12 flex justify-between items-center">
        <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
          NeuroDesk 
          <span className="flex h-2 w-2 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
          </span>
          <span className="text-brand-success uppercase tracking-widest text-[10px]">Live</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md glass-card p-6 md:p-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Daily Input</h1>
          <p className="text-sm text-text-secondary mb-8">Log end-of-day metrics for your location.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Location</label>
              <select 
                className="bg-surface-input border border-surface-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-brand-primary"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                <option>Koramangala</option>
                <option>HSR Layout</option>
                <option>Whitefield</option>
                <option>JP Nagar</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Today's Attendance</label>
              <input 
                type="number" 
                required
                className="bg-surface-input border border-surface-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-brand-primary"
                value={formData.attendance}
                onChange={e => setFormData({...formData, attendance: e.target.value})}
                placeholder="e.g. 142"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Today's Revenue (₹)</label>
              <input 
                type="number" 
                required
                className="bg-surface-input border border-surface-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-brand-primary"
                value={formData.revenue}
                onChange={e => setFormData({...formData, revenue: e.target.value})}
                placeholder="e.g. 24000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Maintenance Flag (Optional)</label>
              <input 
                type="text" 
                className="bg-surface-input border border-surface-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-brand-primary"
                value={formData.flag}
                onChange={e => setFormData({...formData, flag: e.target.value})}
                placeholder="e.g. AC unit 2 down"
              />
            </div>

            <div className="pt-4 h-14">
              <AnimatePresence mode="wait">
                {!loading && !success && (
                  <motion.button
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="submit"
                    className="w-full btn-primary h-full flex items-center justify-center"
                  >
                    Submit Entry
                  </motion.button>
                )}
                {loading && (
                  <motion.button
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    disabled
                    className="w-full btn-primary opacity-80 cursor-wait h-full flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </motion.button>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-full flex items-center justify-center gap-2 font-semibold"
                  >
                    <Check className="w-5 h-5" />
                    Entry Saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
