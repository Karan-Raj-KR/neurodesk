"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Info } from "lucide-react";

type Location = {
  id: string;
  name: string;
  members: number;
  revenue_today_inr: number;
  status: "green" | "amber" | "red";
};

type Decision = {
  id: string;
  type: "critical" | "warning" | "opportunity";
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
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.05] mb-3">
          Command Center
        </h1>
        <p className="text-text-secondary text-base">Real-time overview of NeuroDesk operations.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-brand-primary w-8 h-8" />
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
            <div className="space-y-5">
              {decisions.map((dec) => (
                <DecisionCard key={dec.id} dec={dec} />
              ))}
            </div>
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
    <div className="glass-card p-5 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start mb-4">
        <span className="font-semibold tracking-tight">{loc.name}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusColors[loc.status]}`}>
          {loc.status}
        </span>
      </div>
      <div className="pt-3 border-t border-surface-border space-y-2.5">
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
  };

  const typeLabels = {
    critical: "CRITICAL",
    warning: "WARNING",
    opportunity: "OPPORTUNITY",
  };

  const handleApprove = async () => {
    setActionState("loading");
    try {
      const res = await fetch(`http://localhost:8000/decisions/${dec.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      // Normally we'd fetch audit log or have it returned in the response
      // We hardcoded the mock recipients in the backend, but we can just pretend here or fetch it.
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

  return (
    <div className={`glass-card border-l-[6px] ${typeStyles[dec.type]} overflow-hidden ${dec.type === 'critical' ? 'bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}>
      <div className={`p-5 md:p-6 ${dec.type === 'critical' ? 'md:p-7' : ''}`}>
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

        <div className="flex flex-col sm:flex-row gap-3">
          {actionState === "idle" && (
            <button onClick={handleApprove} className="btn-primary flex-1 sm:flex-none">
              Approve Action
            </button>
          )}
          {actionState === "loading" && (
            <button disabled className="btn-primary opacity-80 cursor-wait flex items-center justify-center gap-2 flex-1 sm:flex-none">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending via WhatsApp...
            </button>
          )}
          {actionState === "success" && (
            <div className="bg-brand-success/10 border border-brand-success/30 text-brand-success rounded-full px-6 py-2.5 flex items-center justify-center gap-2 font-semibold flex-1 sm:flex-none">
              <Check className="w-4 h-4" />
              Action Approved
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <Info className="w-4 h-4" />
            {expanded ? "Hide Details" : "Explain More"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-surface-border bg-surface-base/50 p-5 md:p-6 text-sm">
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
      )}
    </div>
  );
}
