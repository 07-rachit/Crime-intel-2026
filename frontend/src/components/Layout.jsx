import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout, fetchMyTasks } from "../lib/api.js";
import Header from "./Header.jsx";
import ChatWidget from "./ChatWidget.jsx";
import { PageTransition } from "./motion.jsx";
import {
  LayoutDashboard,
  Search,
  FileText,
  MapPin,
  Share2,
  Bot,
  Briefcase,
  Shield,
  History,
  Settings,
  Radio,
  GitBranch,
  GraduationCap,
  Download,
  UserCheck,
  TrendingUp,
  Users,
  LogOut,
  ChevronRight
} from "lucide-react";

export default function Layout({ children }) {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [openTasksCount, setOpenTasksCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMyTasks()
        .then((tasks) => setOpenTasksCount(tasks.length))
        .catch(() => setOpenTasksCount(0));
    }
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const role = user?.role || "viewer";

  // Build role-scoped navigation
  const navItems = [];

  // Core Common Modules
  navItems.push({
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  });

  if (role === "admin") {
    navItems.push(
      { to: "/cases", label: "All Cases & Dispatch", icon: Search },
      { to: "/citizen-reports", label: "Citizen Reports Dispatch", icon: FileText },
      { to: "/map", label: "Hotspot Map", icon: MapPin },
      { to: "/network", label: "Network Graph", icon: Share2 },
      { to: "/assistant", label: "AI Copilot", icon: Bot },
      { to: "/my-work", label: "Command Queue", icon: Briefcase, hasBadge: true },
      { to: "/offenders", label: "Offender Profiles", icon: UserCheck },
      { to: "/insights", label: "Socio Insights", icon: TrendingUp },
      { to: "/workflows", label: "Workflows & Approvals", icon: GitBranch },
      { to: "/audit", label: "Audit Trail", icon: Shield },
      { to: "/activity", label: "Activity History", icon: History },
      { to: "/jobs", label: "Job Center", icon: Settings },
      { to: "/observability", label: "Observability", icon: Radio },
      { to: "/admin", label: "User Management", icon: Users },
      { to: "/import", label: "Import Cases", icon: Download },
      { to: "/career-plans", label: "Career & Learning", icon: GraduationCap }
    );
  } else if (role === "investigator") {
    navItems.push(
      { to: "/cases", label: "My Assigned Cases", icon: Search },
      { to: "/citizen-reports", label: "Assigned Complaints", icon: FileText },
      { to: "/map", label: "Hotspot Map", icon: MapPin },
      { to: "/my-work", label: "My Case Tasks", icon: Briefcase, hasBadge: true },
      { to: "/offenders", label: "Offender Profiles", icon: UserCheck },
      { to: "/assistant", label: "AI Copilot", icon: Bot },
      { to: "/activity", label: "My Activity History", icon: History },
      { to: "/career-plans", label: "Career & Learning", icon: GraduationCap }
    );
  } else if (role === "analyst") {
    navItems.push(
      { to: "/cases", label: "Case Analytics", icon: Search },
      { to: "/map", label: "Hotspot Map", icon: MapPin },
      { to: "/network", label: "Network Graph", icon: Share2 },
      { to: "/insights", label: "Socio Insights", icon: TrendingUp },
      { to: "/offenders", label: "Offender Profiles", icon: UserCheck },
      { to: "/assistant", label: "AI Copilot", icon: Bot },
      { to: "/career-plans", label: "Career & Learning", icon: GraduationCap }
    );
  } else {
    // Viewer
    navItems.push(
      { to: "/map", label: "Hotspot Map", icon: MapPin },
      { to: "/career-plans", label: "Career & Learning", icon: GraduationCap }
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "OP";

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return { title: "DGP OFFICE / HQ COMMAND", badgeClass: "text-amber border-amber/40 bg-amber/10" };
      case "investigator":
        return { title: "INVESTIGATING OFFICER", badgeClass: "text-teal border-teal/40 bg-teal/10" };
      case "analyst":
        return { title: "INTEL ANALYST", badgeClass: "text-cyan border-cyan/40 bg-cyan/10" };
      default:
        return { title: "RESTRICTED OBSERVER", badgeClass: "text-muted border-line bg-panel2" };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="min-h-screen bg-base font-body flex text-ink selection:bg-teal/30">
      {/* ── Modern Cyber Intelligence Sidebar ─────────────────────────── */}
      <aside className="w-64 border-r border-line/80 bg-panel/95 backdrop-blur-xl flex flex-col flex-shrink-0 z-30 shadow-2xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-line/60 bg-panel2/30">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal/30 via-teal/20 to-cyan/10 border border-teal/40 flex items-center justify-center text-teal shadow-[0_0_15px_rgba(20,184,166,0.25)]">
              <Shield className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-wide text-white flex items-center gap-1 leading-none">
                CRIME<span className="bg-gradient-to-r from-teal to-cyan bg-clip-text text-transparent">INTEL</span>
              </h1>
              <p className="font-mono text-[9px] tracking-widest text-teal/80 uppercase font-semibold mt-0.5">
                TACTICAL OPS CORE
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono bg-bg/60 px-2.5 py-1 rounded-md border border-line/40 text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              SECURE LINK
            </span>
            <span className="text-teal font-semibold">RBAC ENFORCED</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1 custom-scrollbar">
          <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted/60 font-semibold">
            Operational Clearance
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-teal/20 via-teal/10 to-transparent text-white font-semibold border-l-[3px] border-teal shadow-[inset_0_0_15px_rgba(20,184,166,0.1)]"
                      : "text-muted hover:text-ink hover:bg-panel2/60 border-l-[3px] border-transparent"
                  }`
                }
              >
                <Icon className="w-4 h-4 text-teal/80 group-hover:text-teal group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {item.hasBadge && openTasksCount > 0 && (
                  <span className="bg-amber text-base font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {openTasksCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Role Card & Sign Out */}
        <div className="p-3.5 border-t border-line/60 bg-panel2/40">
          <div className="flex items-center gap-3 bg-panel2/80 p-2.5 rounded-xl border border-line/40">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal/30 to-cyan/20 border border-teal/40 text-teal font-bold flex items-center justify-center text-xs font-mono shadow-md">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal border-2 border-panel2 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name || "Officer"}
              </p>
              <p className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border inline-block mt-0.5 ${roleInfo.badgeClass}`}>
                {roleInfo.title}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Session"
              className="p-1.5 rounded-lg text-muted hover:text-crit hover:bg-crit/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className={`flex-1 flex flex-col min-h-0 ${["/assistant", "/map", "/network"].includes(location.pathname) ? "overflow-hidden" : "overflow-y-auto"} custom-scrollbar`}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
