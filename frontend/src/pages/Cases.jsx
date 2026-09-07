import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCases, getCurrentUser, fetchOfficers, createCaseAssignment } from "../lib/api.js";
import { StaggerContainer, StaggerItem, AnimatedNumber, motion } from "../components/motion.jsx";
import { SkeletonTableRow } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Search,
  Shield,
  ShieldAlert,
  FileCheck,
  Building2,
  Activity,
  UserCheck,
  UserPlus,
  ChevronRight,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";

const STATUS_OPTIONS = ["", "open", "closed", "under_review"];
const SEVERITY_OPTIONS = ["", "low", "medium", "high", "critical"];
const LABEL_OPTIONS = ["", "Suspected", "Verified", "Needs Review", "Unreviewed"];

const ROLE_SCOPES = [
  { id: "all", label: "Admin Overview", icon: ShieldAlert, desc: "All security case records" },
  { id: "investigator", label: "Investigator View", icon: UserCheck, desc: "Active & assigned cases" },
  { id: "reviewer", label: "Reviewer View", icon: FileCheck, desc: "Pending review decisions" },
  { id: "authority", label: "Authority HQ", icon: Building2, desc: "High-severity & FIR cases" },
  { id: "hospital", label: "Hospital / Medico", icon: Activity, desc: "Medico-legal incidents" },
];

export default function Cases() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isInvestigator = currentUser?.role === "investigator";

  const [roleScope, setRoleScope] = useState(isInvestigator ? "investigator" : "all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [investigationLabel, setInvestigationLabel] = useState("");

  const [data, setData] = useState({ total: 0, page: 1, page_size: 20, active_role_scope: "all", results: [] });
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Assign Officer Modal State
  const [assignModalCase, setAssignModalCase] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function runSearch(scopeToUse) {
    const scope = scopeToUse !== undefined ? scopeToUse : roleScope;
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (q) params.q = q;
      if (status) params.status = status;
      if (severity) params.severity = severity;
      if (investigationLabel) params.investigation_label = investigationLabel;
      if (scope && scope !== "all") params.role_scope = scope;

      const res = await fetchCases(params);
      setData(res);
    } catch (err) {
      setError("Could not load security cases. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(roleScope);
    if (isAdmin) {
      fetchOfficers().then(setOfficers).catch(() => setOfficers([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleScope, status, severity, investigationLabel]);

  function handleClearFilters() {
    setQ("");
    setStatus("");
    setSeverity("");
    setInvestigationLabel("");
    setRoleScope(isInvestigator ? "investigator" : "all");
    runSearch(isInvestigator ? "investigator" : "all");
  }

  async function handleAssignOfficerSubmit(e) {
    if (e) e.preventDefault();
    if (!assignModalCase || !selectedOfficerId) return;

    try {
      setAssigning(true);
      await createCaseAssignment(assignModalCase.id, {
        assigned_to_user_id: selectedOfficerId,
        role_on_case: "Lead Investigator",
      });
      const off = officers.find(o => o.id === selectedOfficerId);
      setToastMessage(`Case ${assignModalCase.case_id} assigned to ${off?.name || "Officer"}.`);
      setTimeout(() => setToastMessage(""), 4000);
      setAssignModalCase(null);
      setSelectedOfficerId("");
      runSearch(roleScope);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to assign officer. Admin clearance required.");
    } finally {
      setAssigning(false);
    }
  }

  const renderLabelBadge = (label) => {
    const l = label || "Unreviewed";
    if (l === "Suspected") {
      return <span className="bg-amber/20 text-amber border border-amber/40 px-2.5 py-1 rounded text-xs font-mono font-semibold">SUSPECTED</span>;
    }
    if (l === "Verified") {
      return <span className="bg-teal/20 text-teal border border-teal/40 px-2.5 py-1 rounded text-xs font-mono font-semibold">VERIFIED</span>;
    }
    if (l === "Needs Review") {
      return <span className="bg-cyan/20 text-cyan border border-cyan/40 px-2.5 py-1 rounded text-xs font-mono font-semibold">NEEDS REVIEW</span>;
    }
    return <span className="bg-panel2 text-muted border border-line px-2.5 py-1 rounded text-xs font-mono">UNREVIEWED</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-teal/20 border border-teal/40 rounded-xl text-teal text-sm font-mono flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage("")} className="text-teal font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Header & Role Clearance Banner */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl relative overflow-hidden border border-line/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-teal px-2.5 py-0.5 bg-teal/10 border border-teal/30 rounded uppercase tracking-wider font-semibold">
                {isAdmin ? "DGP COMMAND REGISTRY" : "ASSIGNED DOSSIERS"}
              </span>
              <span className="text-muted text-xs font-mono">
                {isAdmin ? "• Unrestricted Clearance" : "• Officer Scoped"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-wide">
              SECURITY <span className="text-teal">CASE REGISTRY</span>
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">
              {isAdmin 
                ? "Jurisdiction-wide intelligence registry. Supervise investigations, dispatch officers, verify forensic audit labels, and review active FIR records."
                : "Displaying security case dossiers officially assigned to your badge by the DGP Office. Clearance is strictly limited to authorized active files."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-base border border-line/60 px-4 py-2.5 rounded-xl text-center font-mono shadow-sm">
              <p className="text-[10px] text-muted uppercase">Authorized Cases</p>
              <p className="text-2xl font-bold text-teal">
                <AnimatedNumber value={data.total} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Scoping Tabs (for Admin / Multi-view) */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ROLE_SCOPES.map((scope) => {
            const isCurrent = roleScope === scope.id;
            const Icon = scope.icon;
            return (
              <button
                key={scope.id}
                onClick={() => setRoleScope(scope.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isCurrent
                    ? "bg-teal/15 border-teal text-white shadow-[0_0_20px_rgba(20,184,166,0.25)]"
                    : "glass-card border-line/60 text-muted hover:text-ink hover:border-teal/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-teal" />
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />}
                </div>
                <p className="font-display text-xs font-bold text-white truncate">{scope.label}</p>
                <p className="text-[10px] text-muted/70 font-mono mt-0.5 truncate">{scope.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-line/60 space-y-3 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-[10px] text-muted uppercase mb-1 font-semibold">Free-Text Query</label>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Case ID, title, station, or MO..."
                className="w-full bg-panel2/80 border border-line rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-muted/60 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all font-body"
              />
              {q && (
                <button
                  onClick={() => { setQ(""); runSearch(); }}
                  className="absolute right-3 top-2.5 text-muted hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-muted uppercase mb-1 font-semibold">Investigation Label</label>
            <select
              value={investigationLabel}
              onChange={(e) => setInvestigationLabel(e.target.value)}
              className="w-full bg-panel2/80 border border-line rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all"
            >
              {LABEL_OPTIONS.map((l) => (
                <option key={l} value={l}>{l || "All Labels"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-muted uppercase mb-1 font-semibold">FIR Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-panel2/80 border border-line rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s ? s.replace("_", " ").toUpperCase() : "All Statuses"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-muted uppercase mb-1 font-semibold">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-panel2/80 border border-line rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s ? s.toUpperCase() : "All Severities"}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-crit/10 border border-crit/40 text-crit text-xs font-mono p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-line/60 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line/60 bg-panel2/80 text-[10px] font-mono text-muted uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Case Identifier</th>
              <th className="py-3.5 px-4 font-semibold">Title & Crime Classification</th>
              <th className="py-3.5 px-4 font-semibold">Assigned Officer</th>
              <th className="py-3.5 px-4 font-semibold">Police Station & District</th>
              <th className="py-3.5 px-4 font-semibold">Investigation Review</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Severity</th>
              <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40 text-xs font-body">
            {loading ? (
              <>
                <SkeletonTableRow columns={8} />
                <SkeletonTableRow columns={8} />
                <SkeletonTableRow columns={8} />
                <SkeletonTableRow columns={8} />
                <SkeletonTableRow columns={8} />
              </>
            ) : data.results.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="p-12 text-center text-muted font-mono text-sm space-y-3">
                    <Shield className="w-10 h-10 text-teal/40 mx-auto" />
                    <p className="text-ink font-semibold">No Matching Security Cases Found</p>
                    <p className="text-xs text-muted max-w-md mx-auto">
                      {isInvestigator 
                        ? "No cases currently assigned to your badge under the active filter."
                        : "No security records match this role scope and filter criteria."}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-panel2 hover:bg-line border border-line text-ink text-xs font-mono px-4 py-2 rounded-xl transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              data.results.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  className="hover:bg-panel2/60 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-teal group-hover:underline cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
                    {c.case_id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-white leading-snug group-hover:text-teal transition-colors">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-muted font-mono mt-0.5">{c.crime_type}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                      <span className="text-ink font-semibold">{c.assigned_officer_name || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted">
                    <p className="text-ink font-medium">{c.station_name}</p>
                    <p className="text-[10px] text-muted/70">{c.district}</p>
                  </td>
                  <td className="py-3.5 px-4">{renderLabelBadge(c.investigation_label)}</td>
                  <td className="py-3.5 px-4 font-mono uppercase text-[11px]">
                    <span className="bg-panel2 px-2 py-0.5 rounded border border-line/40 text-muted">
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono uppercase text-[11px]">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-lg border ${
                        c.severity === "critical"
                          ? "bg-crit/15 text-crit border-crit/30"
                          : c.severity === "high"
                          ? "bg-amber/15 text-amber border-amber/30"
                          : c.severity === "medium"
                          ? "bg-teal/15 text-teal border-teal/30"
                          : "bg-cyan/15 text-cyan border-cyan/30"
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setAssignModalCase(c);
                            setSelectedOfficerId("");
                          }}
                          className="bg-panel2 hover:bg-teal hover:text-base border border-line/60 hover:border-teal text-teal font-mono text-[11px] px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 font-semibold"
                          title="Assign Officer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="bg-teal/15 hover:bg-teal text-teal hover:text-base border border-teal/40 font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-sm active:scale-95"
                      >
                        Inspect Dossier
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Officer Modal for Admin */}
      {assignModalCase && (
        <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignOfficerSubmit} className="bg-panel border border-teal/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-display text-white font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal" /> Assign Investigating Officer
            </h3>
            <p className="text-xs text-muted">
              Select the investigating officer to assign to Case{" "}
              <span className="font-mono font-bold text-teal">{assignModalCase.case_id}</span> ({assignModalCase.title}).
              Under RBAC rules, only the assigned officer will be permitted to access and update this case dossier.
            </p>

            <div>
              <label className="block text-xs font-mono text-muted mb-1.5 uppercase">
                Officer Roster
              </label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                required
                className="w-full bg-base border border-line rounded-lg p-2.5 text-xs text-ink focus:border-teal focus:outline-none font-mono"
              >
                <option value="">-- Choose Officer from Roster --</option>
                {officers.map(off => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.role.toUpperCase()}) - {off.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssignModalCase(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-muted hover:text-ink bg-panel2 border border-line"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning || !selectedOfficerId}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-teal text-base font-bold hover:bg-teal/90 shadow disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Confirm Case Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
