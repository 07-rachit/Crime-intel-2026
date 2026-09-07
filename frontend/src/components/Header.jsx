import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext.jsx";
import { AnimatePresence, motion } from "./motion.jsx";
import { 
  Bell, 
  AlertTriangle, 
  FileText, 
  CheckSquare, 
  Pin, 
  TrendingUp, 
  ShieldCheck, 
  Search,
  Check
} from "lucide-react";

const PATH_TITLES = {
  "/": "TACTICAL OPERATIONS DASHBOARD",
  "/cases": "CASE REGISTRY & DOSSIERS",
  "/map": "GEOSPATIAL HOTSPOT RADAR",
  "/network": "CRIMINAL SYNDICATE GRAPH",
  "/assistant": "AI COPILOT RESEARCH DESK",
  "/my-work": "INVESTIGATOR WORKBENCH",
  "/audit": "IMMUTABLE AUDIT TRAIL",
  "/import": "BULK CASE INGESTION",
  "/offenders": "OFFENDER BEHAVIOR PROFILES",
  "/insights": "SOCIO-DEMOGRAPHIC INTELLIGENCE",
  "/citizen-reports": "CITIZEN INCIDENT DISPATCH",
  "/admin": "DEPARTMENT USER ADMINISTRATION",
  "/activity": "SYSTEM AUDIT & ACTIVITY TIMELINE",
  "/jobs": "ASYNC TASK RUNNER & LOGS",
  "/observability": "AGENT TELEMETRY & RUN TRACES",
  "/workflows": "MULTI-STEP WORKFLOW ORCHESTRATION",
  "/career-plans": "OFFICER TRAINING & CAPACITY",
};

export default function Header() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) +
        " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title = PATH_TITLES[location.pathname] || "COMMAND INTELLIGENCE";

  function handleNotificationClick(n) {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.related_case_id) {
      navigate(`/cases/${n.related_case_id}`);
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "high_severity_case":
        return <AlertTriangle className="w-4 h-4 text-crit" />;
      case "case_assigned":
        return <FileText className="w-4 h-4 text-teal" />;
      case "task_assigned":
        return <CheckSquare className="w-4 h-4 text-amber" />;
      case "district_trend_alert":
        return <TrendingUp className="w-4 h-4 text-cyan" />;
      default:
        return <Bell className="w-4 h-4 text-teal" />;
    }
  };

  return (
    <header className="h-16 border-b border-line/70 bg-panel/80 backdrop-blur-xl px-6 flex items-center justify-between font-mono text-xs z-20 shadow-lg">
      {/* Screen Title Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-teal/10 border border-teal/30 text-teal text-[11px] font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
          <span>OPS LIVE</span>
        </div>
        <div className="h-4 w-px bg-line/80" />
        <span className="font-display font-bold text-sm tracking-wide text-white truncate">
          {title}
        </span>
      </div>

      {/* Middle: Tactical Search / Command Bar */}
      <div className="hidden lg:flex items-center w-72 bg-panel2/60 border border-line/60 rounded-xl px-3 py-1.5 text-muted focus-within:border-teal/60 focus-within:ring-1 focus-within:ring-teal/30 transition-all">
        <Search className="w-3.5 h-3.5 mr-2 text-teal/70 flex-shrink-0" />
        <input
          type="text"
          placeholder="Quick search cases, suspects..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              navigate(`/cases?q=${encodeURIComponent(e.target.value.trim())}`);
            }
          }}
          className="bg-transparent text-xs text-ink outline-none w-full font-body placeholder:text-muted/60"
        />
        <span className="text-[10px] font-mono text-muted/50 border border-line/60 px-1.5 py-0.5 rounded">
          ↵
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Digital Clock */}
        <div className="hidden md:flex items-center gap-2 bg-bg/60 border border-line/60 px-3 py-1.5 rounded-xl font-mono text-[11px] text-muted shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-ink font-semibold tracking-wider">{currentTime || "00:00:00 IST"}</span>
        </div>

        {/* In-App Alerts Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-xl border transition-all flex items-center gap-1.5 focus:outline-none ${
              isOpen
                ? "bg-panel2 border-teal text-teal shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                : "bg-panel2/60 border-line/60 hover:border-teal/40 text-ink hover:bg-panel2"
            }`}
            title="In-App Intelligence Alerts"
          >
            <Bell className="w-4 h-4 text-teal" />
            {unreadCount > 0 && (
              <span className="bg-amber text-base font-bold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-panel/95 backdrop-blur-2xl border border-line/80 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3.5 border-b border-line/60 bg-panel2/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">
                      Priority Alerts ({unreadCount})
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-teal hover:underline text-[10px] transition font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-line/40 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted text-xs font-mono flex flex-col items-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-teal/40" />
                      <p>No pending critical alerts.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 transition cursor-pointer flex items-start gap-3 hover:bg-panel2/70 ${
                          !n.is_read
                            ? "bg-teal/5 border-l-[3px] border-teal shadow-sm"
                            : "opacity-75 border-l-[3px] border-transparent"
                        }`}
                      >
                        <span className="mt-0.5 p-1.5 bg-panel2 rounded-lg border border-line/40 flex-shrink-0">
                          {getNotificationIcon(n.type)}
                        </span>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white text-xs leading-snug font-display truncate">{n.title}</p>
                            <span className="text-[9px] text-muted/70 whitespace-nowrap ml-2 font-mono">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-muted text-[11px] font-body leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
