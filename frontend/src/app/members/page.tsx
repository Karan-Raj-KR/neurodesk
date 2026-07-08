"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Member = {
  id: string;
  name: string;
  location: string;
  join_date: string;
  membership_tier: string;
  trainer_assigned: string;
  attendance_count: number;
  last_visit_date: string;
  notes: string;
  last_session_rating?: number;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMembers = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${API_URL}/members`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 md:px-12 md:py-16 max-w-7xl mx-auto flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-border pb-8 mb-12">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary uppercase tracking-widest">
            NeuroDesk 
            <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span className="text-brand-success text-[10px]">Live System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Members Directory</h1>
          <p className="text-sm text-text-secondary">Manage members, attendance, and retention actions.</p>
        </div>
        <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto justify-start md:justify-end">
          <Link href="/" className="text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Command Center
          </Link>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showAddForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Member</>}
          </button>
        </nav>
      </header>

      <main className="flex-1">

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <AddMemberForm onAdded={() => { fetchMembers(); setShowAddForm(false); }} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-brand-primary w-8 h-8" />
          </div>
        ) : (
          <div className="space-y-4">
            {members.map(member => (
              <MemberRow key={member.id} member={member} onUpdate={fetchMembers} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AddMemberForm({ onAdded }: { onAdded: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "Whitefield",
    membership_tier: "Elite",
    trainer_assigned: "Coach Anand"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      await fetch(`${API_URL}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Name</label>
        <input required type="text" className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none" 
               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
      </div>
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Location</label>
        <select className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
          <option>Koramangala</option>
          <option>HSR Layout</option>
          <option>Whitefield</option>
          <option>JP Nagar</option>
        </select>
      </div>
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Tier</label>
        <select className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none"
                value={formData.membership_tier} onChange={e => setFormData({...formData, membership_tier: e.target.value})}>
          <option>Basic</option>
          <option>Pro</option>
          <option>Elite</option>
        </select>
      </div>
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Trainer</label>
        <input required type="text" className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none" 
               value={formData.trainer_assigned} onChange={e => setFormData({...formData, trainer_assigned: e.target.value})} placeholder="e.g. Coach Anand" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto h-[42px] flex items-center justify-center min-w-[120px]">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
      </button>
    </form>
  );
}

function MemberRow({ member, onUpdate }: { member: Member, onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInState, setCheckInState] = useState<"idle" | "loading" | "success">("idle");
  const [editData, setEditData] = useState({
    attendance_count: member.attendance_count,
    last_visit_date: member.last_visit_date,
    notes: member.notes,
    last_session_rating: member.last_session_rating || 0
  });

  const isAtRisk = () => {
    const lastVisit = new Date(member.last_visit_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 14;
  };

  const atRisk = isAtRisk();

  const handleSave = async () => {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      await fetch(`${API_URL}/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          attendance_count: parseInt(editData.attendance_count.toString()) || 0,
          last_session_rating: parseInt(editData.last_session_rating.toString()) || 0
        }),
      });
      onUpdate();
      setExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    setCheckInState("loading");
    setTimeout(() => {
      setCheckInState("success");
    }, 1500);
  };

  return (
    <motion.div layout className="glass-card overflow-hidden">
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-[250px]">
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
            {member.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold">{member.name}</h3>
            <span className="text-xs text-text-secondary">{member.location} • {member.membership_tier}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider">Trainer</div>
            <div>{member.trainer_assigned}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider">Joined</div>
            <div>{member.join_date}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider">Last Visit</div>
            <div className="font-mono">{member.last_visit_date}</div>
          </div>
          <div className="flex items-center">
            {atRisk ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-brand-danger bg-brand-danger/10 border border-brand-danger/20">
                At-Risk (&gt;14d)
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-brand-success bg-brand-success/10 border border-brand-success/20">
                Active
              </span>
            )}
          </div>
        </div>
        
        <div className="hidden md:block text-text-secondary">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-surface-border bg-surface-base/50 p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Attendance Count</label>
                  <input type="number" className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none max-w-[200px]"
                         value={editData.attendance_count} onChange={e => setEditData({...editData, attendance_count: e.target.value as any})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Last Visit Date (YYYY-MM-DD)</label>
                  <input type="date" className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none max-w-[200px]"
                         value={editData.last_visit_date} onChange={e => setEditData({...editData, last_visit_date: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Last Session Rating</label>
                  <select className="bg-surface-input border border-surface-border rounded-lg p-2.5 text-sm focus:border-brand-primary outline-none max-w-[200px]"
                          value={editData.last_session_rating} onChange={e => setEditData({...editData, last_session_rating: parseInt(e.target.value)})}>
                    <option value={0}>Not Rated</option>
                    <option value={1}>⭐ 1 Star</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Member Notes</label>
                  <textarea className="bg-surface-input border border-surface-border rounded-lg p-3 text-sm focus:border-brand-primary outline-none flex-1 min-h-[100px] resize-none"
                            value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} placeholder="Add notes here..." />
                </div>
                
                <div className="bg-surface-input/50 p-4 rounded-xl border border-surface-border mt-auto">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Retention Actions</h4>
                  <AnimatePresence mode="wait">
                    {checkInState === "idle" && (
                      <motion.button 
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCheckIn}
                        className="btn-primary w-full h-[42px] flex items-center justify-center text-sm"
                      >
                        Send Check-In Reminder
                      </motion.button>
                    )}
                    {checkInState === "loading" && (
                      <motion.button 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        disabled 
                        className="btn-primary opacity-80 cursor-wait w-full h-[42px] flex items-center justify-center gap-2 text-sm"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending via WhatsApp...
                      </motion.button>
                    )}
                    {checkInState === "success" && (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <div className="bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-full px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold w-full">
                          <Check className="w-4 h-4" /> Reminder Sent
                        </div>
                        <p className="text-xs italic text-text-secondary border-l-2 border-surface-border pl-2 py-0.5">
                          "Hi {member.name}, it's been a while — {member.trainer_assigned} wanted to check in and see how things are going!"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-surface-border">
              <button onClick={() => setExpanded(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary min-w-[120px] flex items-center justify-center text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
