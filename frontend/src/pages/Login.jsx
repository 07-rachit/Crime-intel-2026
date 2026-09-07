import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api.js";
import { motion } from "../components/motion.jsx";
import {
  Shield,
  ShieldAlert,
  LineChart,
  BadgeCheck,
  Eye,
  FileText,
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";

const DEMO_ROLES = [
  { 
    role: "Admin", 
    label: "DGP Office", 
    email: "admin@crimeintel.local", 
    pass: "Admin@123", 
    icon: ShieldAlert 
  },
  { 
    role: "Investigator", 
    label: "Assigned Officer", 
    email: "investigator@crimeintel.local", 
    pass: "Investigator@123", 
    icon: BadgeCheck 
  },
  { 
    role: "Analyst", 
    label: "Intel Analyst", 
    email: "analyst@crimeintel.local", 
    pass: "Analyst@123", 
    icon: LineChart 
  },
  { 
    role: "Viewer", 
    label: "Observer", 
    email: "viewer@crimeintel.local", 
    pass: "Viewer@123", 
    icon: Eye 
  },
];

export default function Login() {
  const [email, setEmail] = useState("admin@crimeintel.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDemo(demo) {
    setEmail(demo.email);
    setPassword(demo.pass);
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center font-body relative overflow-hidden p-4 sm:p-6 selection:bg-teal/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg relative z-10 space-y-6"
      >
        {/* Main Title Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal/10 border border-teal/30 text-teal text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            DEPARTMENT OF POLICE &middot; SECURE CORE
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-none flex items-center justify-center gap-2">
            CRIME<span className="bg-gradient-to-r from-teal via-cyan to-amber bg-clip-text text-transparent">INTEL</span>
          </h1>
          <p className="text-muted text-xs sm:text-sm max-w-md mx-auto font-body">
            Tactical Spatial Intelligence & Role-Based Case Orchestration Platform
          </p>
        </div>

        {/* PUBLIC CITIZEN REPORTING CARD */}
        <div className="glass-panel rounded-2xl p-5 border border-teal/30 hover:border-teal/60 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-teal font-bold uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal" /> Public Citizen Incident Portal
            </span>
            <span className="text-[10px] font-mono text-teal bg-teal/10 px-2.5 py-0.5 rounded-full border border-teal/30 font-semibold">
              Public Clearance
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed mb-4">
            Citizens can securely file crime reports, upload forensic & CCTV evidence, and track verification status with an official Tracking ID.
          </p>

          <button
            onClick={() => navigate("/report-crime")}
            className="w-full bg-teal text-base hover:bg-teal/90 font-mono font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 tracking-wide active:scale-[0.98]"
          >
            <span>Report an Incident / Track Report Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OFFICER LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 sm:p-7 space-y-5 border border-white/10 shadow-2xl relative"
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h2 className="text-xs font-mono text-white font-bold uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal" /> Officer Command Login
            </h2>
            <span className="text-[10px] font-mono text-muted/80">RBAC Enforcement Active</span>
          </div>

          {/* Quick Demo Role Selector */}
          <div>
            <label className="block text-[11px] font-mono text-muted mb-2 tracking-wider uppercase font-semibold">
              Select Clearance Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_ROLES.map((d) => {
                const isSelected = email === d.email;
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleSelectDemo(d)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all flex flex-col items-center justify-center gap-1 text-center ${
                      isSelected
                        ? "bg-teal/20 border-teal text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                        : "bg-panel2/60 border-line/60 text-muted hover:border-teal/40 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal" />
                    <span className="text-[11px]">{d.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5 tracking-wide uppercase font-medium">
                Official Department Identifier
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panel2/80 border border-line rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/40 transition-all font-body"
                placeholder="officer@ksp.gov.in"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5 tracking-wide uppercase font-medium">
                Clearance Key / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panel2/80 border border-line rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/40 transition-all font-body"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-crit text-xs font-mono border border-crit/40 bg-crit/10 rounded-xl p-3 flex items-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal to-cyan hover:brightness-110 text-base font-mono text-xs font-extrabold rounded-xl py-3 tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(20,184,166,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating Clearance..." : "Access Command Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
