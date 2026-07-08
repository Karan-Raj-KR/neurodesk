"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Location = {
  id: string;
  name: string;
  members: number;
  revenue_today_inr: number;
  status: "green" | "amber" | "red";
};

type Decision = {
  id: string;
  type: "critical" | "warning" | "opportunity" | "insight";
  headline: string;
  evidence: string;
  confidence_pct: number;
  revenue_at_risk_inr: number;
  recommended_action: string;
  sample_whatsapp_message: string;
};

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, decRes] = await Promise.all([
          fetch("http://localhost:8000/locations"),
          fetch("http://localhost:8000/decisions/feed"),
          new Promise(resolve => setTimeout(resolve, 400))
        ]);
        const locData = await locRes.json();
        const decData = await decRes.json();
        setLocations(locData);
        setDecisions(decData);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-[1440px] mx-auto">
      <header className="mb-12 md:mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-brand-primary">
            NeuroDesk 
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span className="text-brand-success uppercase tracking-widest text-[10px]">Live</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.05] mb-3">
            Command Center
          </h1>
          <p className="text-text-secondary text-base">Real-time overview of operations.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 text-sm">
          <span className="text-text-secondary font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/members" className="text-brand-primary hover:text-white transition-colors font-medium">
              Members
            </Link>
            <Link href="/input" className="text-brand-primary hover:text-white transition-colors font-medium">
              Daily Input &rarr;
            </Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="space-y-16 md:space-y-20">
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Location Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card p-5 md:p-6 flex flex-col justify-between h-auto min-h-[144px] animate-pulse">
                   <div className="flex justify-between items-start mb-6">
                     <div className="w-24 h-5 bg-surface-border rounded"></div>
                     <div className="w-12 h-4 bg-surface-border rounded-full"></div>
                   </div>
                   <div className="pt-4 border-t border-surface-border space-y-3">
                     <div className="flex justify-between">
                        <div className="w-16 h-4 bg-surface-border rounded"></div>
                        <div className="w-10 h-4 bg-surface-border rounded"></div>
                     </div>
                     <div className="flex justify-between">
                        <div className="w-24 h-4 bg-surface-border rounded"></div>
                        <div className="w-16 h-4 bg-surface-border rounded"></div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">AI Decision Feed</h2>
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card border-l-[6px] border-surface-border p-5 md:p-6 animate-pulse">
                   <div className="w-20 h-3 bg-surface-border rounded mb-3"></div>
                   <div className="w-3/4 h-6 bg-surface-border rounded mb-4"></div>
                   <div className="w-full h-4 bg-surface-border rounded mb-2"></div>
                   <div className="w-5/6 h-4 bg-surface-border rounded mb-6"></div>
                   <div className="flex items-center gap-8 pt-4 mb-6 border-t border-surface-border">
                     <div className="flex flex-col gap-1.5"><div className="w-16 h-2 bg-surface-border rounded"></div><div className="w-10 h-4 bg-surface-border rounded"></div></div>
                     <div className="flex flex-col gap-1.5"><div className="w-20 h-2 bg-surface-border rounded"></div><div className="w-16 h-4 bg-surface-border rounded"></div></div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-11">
                     <div className="w-full sm:w-32 h-11 bg-surface-border rounded-full"></div>
                     <div className="w-full sm:w-32 h-11 bg-surface-border rounded-full"></div>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-16 md:space-y-20">
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Location Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {locations.map((loc) => (
                <LocationCard key={loc.id} loc={loc} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">AI Decision Feed</h2>
            <motion.div 
              className="space-y-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {decisions.map((dec) => (
                <DecisionCard key={dec.id} dec={dec} />
              ))}
            </motion.div>
          </section>
        </div>
      )}
    </div>
  );
}

function LocationCard({ loc }: { loc: Location }) {
  const statusColors = {
    green: "text-brand-success bg-brand-success/10",
    amber: "text-brand-warning bg-brand-warning/10",
    red: "text-brand-danger bg-brand-danger/10",
  };

  return (
    <div className="glass-card p-5 md:p-6 flex flex-col justify-between h-auto min-h-[144px]">
      <div className="flex justify-between items-start mb-6">
        <span className="font-semibold tracking-tight">{loc.name}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusColors[loc.status]}`}>
          {loc.status}
        </span>
      </div>
      <div className="pt-4 border-t border-surface-border space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">Members</span>
          <span className="font-mono font-bold text-text-primary">{loc.members.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">Revenue Today</span>
          <span className="font-mono font-bold text-text-primary">₹{loc.revenue_today_inr.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ dec }: { dec: Decision }) {
  const [expanded, setExpanded] = useState(false);
  const [actionState, setActionState] = useState<"idle" | "loading" | "success">("idle");
  const [auditInfo, setAuditInfo] = useState<{ recipient_count: number } | null>(null);

  const typeStyles = {
    critical: "border-l-brand-danger",
    warning: "border-l-brand-warning",
    opportunity: "border-l-brand-success",
    insight: "border-l-brand-success",
  };

  const typeLabels = {
    critical: "CRITICAL",
    warning: "WARNING",
    opportunity: "OPPORTUNITY",
    insight: "INSIGHT",
  };

  const handleApprove = async () => {
    setActionState("loading");
    try {
      const res = await fetch(`http://localhost:8000/decisions/${dec.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      const auditRes = await fetch("http://localhost:8000/audit-log");
      const auditData = await auditRes.json();
      const myLog = auditData.reverse().find((a: any) => a.action === "decision_approved");
      
      setActionState("success");
      if (myLog) {
         setAuditInfo({ recipient_count: myLog.recipient_count || 1 });
      } else {
         setAuditInfo({ recipient_count: 1 });
      }
    } catch (err) {
      console.error(err);
      setActionState("idle");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.2 }}
      className={`glass-card border-l-[6px] ${typeStyles[dec.type]} overflow-hidden ${dec.type === 'critical' ? 'bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
    >
      <div className="p-5 md:p-6">
        <span className={`text-[11px] font-bold tracking-widest uppercase ${
          dec.type === 'critical' ? 'text-brand-danger' :
          dec.type === 'warning' ? 'text-brand-warning' : 'text-brand-success'
        }`}>
          {typeLabels[dec.type]}
        </span>

        <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-2 mb-3">{dec.headline}</h3>

        <p className="text-sm text-text-secondary mb-5 leading-relaxed">
          {dec.recommended_action}
        </p>

        <div className="flex items-center gap-8 pt-4 mb-6 border-t border-surface-border">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-text-secondary uppercase tracking-wider">Confidence</span>
            <span className="font-mono font-bold text-text-primary">{dec.confidence_pct}%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-text-secondary uppercase tracking-wider">Revenue at Risk</span>
            <span className="font-mono font-bold text-text-primary">₹{dec.revenue_at_risk_inr.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-11">
          <AnimatePresence mode="wait">
            {dec.type !== 'insight' && actionState === "idle" && (
              <motion.button 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleApprove} 
                className="btn-primary flex-1 sm:flex-none h-11"
              >
                Approve Action
              </motion.button>
            )}
            {dec.type === 'insight' && (
              <motion.button 
                key="insight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="btn-secondary rounded-full flex-1 sm:flex-none cursor-default h-11"
              >
                Use This Insight
              </motion.button>
            )}
            {actionState === "loading" && (
              <motion.button 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                disabled 
                className="btn-primary opacity-80 cursor-wait flex items-center justify-center gap-2 flex-1 sm:flex-none h-11"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </motion.button>
            )}
            {actionState === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-full px-6 py-2.5 flex items-center justify-center gap-2 font-semibold flex-1 sm:flex-none h-11"
              >
                <Check className="w-4 h-4" />
                Approved
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none h-11"
          >
            <Info className="w-4 h-4" />
            {expanded ? "Hide Details" : "Explain More"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-surface-border bg-surface-base/50 text-sm overflow-hidden"
          >
            <div className="p-5 md:p-6">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Evidence & Reasoning</h4>
                <p className="leading-relaxed text-text-primary/90">{dec.evidence}</p>
              </div>

              {actionState === "success" && auditInfo && (
                <div className="mt-6 p-4 rounded-xl bg-surface-base border border-surface-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-success uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> Message Sent Successfully
                    </span>
                    <span className="text-xs text-text-secondary font-mono">To {auditInfo.recipient_count} recipient(s)</span>
                  </div>
                  <p className="italic text-text-secondary border-l-2 border-surface-border pl-3 py-1">
                    "{dec.sample_whatsapp_message}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
