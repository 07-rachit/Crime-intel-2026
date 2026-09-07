import { useState, useEffect } from "react";
import { 
  fetchCitizenReports, 
  verifyCitizenReport, 
  analyzeReportAI, 
  fetchOfficers, 
  assignCitizenReport, 
  getCurrentUser 
} from "../lib/api.js";
import {
  FileText,
  Shield,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  Calendar,
  Lock,
  Paperclip,
  Bot,
  AlertTriangle,
  User,
  Check
} from "lucide-react";

export default function CitizenReportsAdmin() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isInvestigator = currentUser?.role === "investigator";

  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: "approve" | "reject", report: obj }
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Assign Officer Modal State
  const [assignModalReport, setAssignModalReport] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadReports();
    if (isAdmin) {
      fetchOfficers()
        .then(setOfficers)
        .catch(() => setOfficers([]));
    }
  }, [statusFilter]);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await fetchCitizenReports(statusFilter);
      setReports(data || []);
    } catch (err) {
      console.error("Failed to fetch citizen reports", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(report, action) {
    try {
      setProcessingId(report.id);
      const res = await verifyCitizenReport(
        report.id,
        action,
        action === "reject" ? rejectionReason : ""
      );

      if (action === "approve") {
        setToastMessage(`Report ${report.tracking_id} approved. Case ${res.created_case_id || "ID"} generated and integrated into TRACE Engine.`);
      } else {
        setToastMessage(`Report ${report.tracking_id} marked as rejected.`);
      }

      setActionModal(null);
      setRejectionReason("");
      loadReports();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed. Please check permissions.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReAnalyzeAI(reportId) {
    try {
      setProcessingId(reportId);
      await analyzeReportAI(reportId);
      setToastMessage("AI analysis re-executed successfully.");
      loadReports();
    } catch (err) {
      alert("AI re-analysis failed.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAssignOfficerSubmit(e) {
    if (e) e.preventDefault();
    if (!assignModalReport || !selectedOfficerId) return;

    try {
      setAssigning(true);
      const updated = await assignCitizenReport(assignModalReport.id, selectedOfficerId);
      const assignedOff = officers.find(o => o.id === selectedOfficerId);
      setToastMessage(`Complaint ${assignModalReport.tracking_id} assigned to ${assignedOff?.name || "Officer"}.`);
      setAssignModalReport(null);
      setSelectedOfficerId("");
      loadReports();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to assign officer. Admin clearance required.");
    } finally {
      setAssigning(false);
    }
  }

  // Metrics calculation
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const criticalCount = reports.filter((r) => r.ai_priority === "critical" || r.ai_priority === "high").length;
  const verifiedCount = reports.filter((r) => r.status === "verified" || r.status === "approved").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-teal/20 border border-teal/40 rounded-xl text-teal text-sm font-mono flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-teal font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner with Role Clearance */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl relative overflow-hidden border border-line/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-teal px-2.5 py-0.5 bg-teal/10 border border-teal/30 rounded uppercase tracking-wider font-semibold">
                {isAdmin ? "DGP DISPATCH & COMPLAINTS DESK" : "OFFICER ASSIGNED DESK"}
              </span>
              <span className="text-muted text-xs font-mono">
                {isAdmin ? "• Jurisdiction-Wide Access" : "• Assigned Files Only"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-wide">
              CITIZEN REPORTS <span className="text-teal">{isAdmin ? "DISPATCH & VERIFICATION" : "INVESTIGATION QUEUE"}</span>
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">
              {isAdmin 
                ? "Review public crime reports, assign investigating officers, trigger AI priority classification, and authorize official case generation."
                : "View and investigate citizen complaints officially assigned to your badge by DGP Office. Verify evidence and update status."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3">
            <div className="bg-base border border-line/60 px-4 py-2.5 rounded-xl text-center font-mono shadow-sm">
              <p className="text-[10px] text-muted uppercase">Pending Review</p>
              <p className="text-xl font-bold text-amber">{pendingCount}</p>
            </div>
            <div className="bg-base border border-line/60 px-4 py-2.5 rounded-xl text-center font-mono shadow-sm">
              <p className="text-[10px] text-muted uppercase">High/Critical</p>
              <p className="text-xl font-bold text-crit">{criticalCount}</p>
            </div>
            <div className="bg-base border border-line/60 px-4 py-2.5 rounded-xl text-center font-mono shadow-sm">
              <p className="text-[10px] text-muted uppercase">Cases Created</p>
              <p className="text-xl font-bold text-teal">{verifiedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between glass-panel p-2 rounded-xl border border-line/60">
        <div className="flex gap-2">
          {[
            { key: "pending", label: "PENDING VERIFICATION", icon: Clock },
            { key: "verified", label: "APPROVED / CASE CREATED", icon: CheckCircle2 },
            { key: "rejected", label: "REJECTED", icon: XCircle },
            { key: "", label: "ALL COMPLAINTS", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-2 text-xs font-mono rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? "bg-teal text-base font-bold shadow"
                    : "text-muted hover:text-ink hover:bg-panel2"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={loadReports}
          className="text-xs font-mono text-muted hover:text-ink px-3 py-1.5 rounded-lg border border-line bg-panel2 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Report List */}
      {loading ? (
        <div className="p-12 text-center text-muted font-mono text-sm glass-panel border border-line/60 rounded-2xl">
          Loading complaints...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-muted font-mono text-sm glass-panel border border-line/60 rounded-2xl space-y-2">
          <p className="text-ink font-semibold">No reports found matching the selected filter.</p>
          <p className="text-xs text-muted">
            {isInvestigator ? "No complaints currently assigned to your badge under this filter." : "No records present in this queue."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="glass-card border border-line/60 hover:border-teal/50 rounded-2xl p-5 transition space-y-4 shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line/60 pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-lg font-bold text-teal">{report.tracking_id}</span>
                  <span className="text-xs font-mono bg-panel2 border border-line/60 px-2.5 py-1 rounded text-ink font-semibold">
                    {report.crime_type}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    report.ai_priority === "critical"
                      ? "bg-crit/20 text-crit border border-crit/40"
                      : report.ai_priority === "high"
                      ? "bg-amber/20 text-amber border border-amber/40"
                      : "bg-teal/20 text-teal border border-teal/40"
                  }`}>
                    Priority: {report.ai_priority?.toUpperCase()}
                  </span>

                  {/* Assigned Officer Pill */}
                  <div className="flex items-center gap-1.5 text-xs font-mono bg-base/80 px-2.5 py-1 rounded-lg border border-line/60">
                    <UserCheck className="w-3.5 h-3.5 text-teal" />
                    <span className="text-muted">Assigned:</span>
                    <span className="text-ink font-semibold">
                      {report.assigned_officer_name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Admin can assign officer */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setAssignModalReport(report);
                        setSelectedOfficerId(report.assigned_officer_id || "");
                      }}
                      className="text-xs font-mono bg-teal/15 hover:bg-teal text-teal hover:text-base border border-teal/40 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{report.assigned_officer_id ? "Reassign Officer" : "Assign Officer"}</span>
                    </button>
                  )}

                  <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase ${
                    report.status === "verified" || report.status === "approved"
                      ? "bg-teal/20 text-teal border border-teal/40"
                      : report.status === "rejected"
                      ? "bg-crit/20 text-crit border border-crit/40"
                      : "bg-amber/20 text-amber border border-amber/40"
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Report Description & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <p className="text-xs font-mono text-muted uppercase font-semibold">Incident Details</p>
                  <p className="text-sm text-ink leading-relaxed">{report.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-muted pt-2 border-t border-line/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal" /> {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal" /> {new Date(report.incident_date).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* AI Summary Box */}
                <div className="bg-panel2/60 p-3.5 rounded-xl border border-line/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-teal font-bold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-teal" /> TRACE AI Summary
                    </span>
                    <button
                      onClick={() => handleReAnalyzeAI(report.id)}
                      disabled={processingId === report.id}
                      className="text-[10px] font-mono text-muted hover:text-teal underline"
                    >
                      Re-Analyze
                    </button>
                  </div>
                  <p className="text-xs text-ink leading-relaxed font-body">
                    {report.ai_summary || "AI analysis available."}
                  </p>
                </div>
              </div>

              {/* Reporter Contact & Evidence items bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-line/60 text-xs font-mono">
                <div className="text-muted flex items-center gap-2">
                  <span className="text-teal font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Protected Contact:
                  </span>
                  <span className="text-ink font-semibold">{report.reporter_name}</span>
                  <span>({report.reporter_phone})</span>
                  {report.reporter_email && <span>• {report.reporter_email}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    className="bg-panel2 hover:bg-line border border-line text-ink text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-teal" />
                    <span>Evidence Files ({report.evidence_items?.length || 0})</span>
                  </button>

                  {/* Verification Actions: Allowed for Admin or Assigned Officer */}
                  {(isAdmin || isInvestigator) && report.status === "pending" && (
                    <>
                      <button
                        onClick={() => setActionModal({ type: "reject", report })}
                        disabled={processingId === report.id}
                        className="bg-crit/20 hover:bg-crit text-crit hover:text-base border border-crit/40 font-mono text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleVerify(report, "approve")}
                        disabled={processingId === report.id}
                        className="bg-teal hover:bg-teal/90 text-base font-bold font-mono text-xs px-3.5 py-1.5 rounded-lg transition shadow flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Create Case</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Evidence Expanded Section */}
              {selectedReport?.id === report.id && (
                <div className="bg-base p-4 rounded-xl border border-line/60 space-y-3 animate-fade-in">
                  <p className="text-xs font-mono text-teal uppercase font-semibold">Attached Evidence Files</p>
                  {report.evidence_items && report.evidence_items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {report.evidence_items.map((ev, idx) => (
                        <div key={idx} className="bg-panel2 p-2.5 rounded-lg border border-line/60 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2 truncate text-ink">
                            <Paperclip className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                            <span className="truncate">{ev.file_name}</span>
                          </div>
                          <span className="text-[10px] text-teal font-semibold uppercase ml-2">
                            {ev.file_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-mono">No evidence files attached to this report.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {actionModal?.type === "reject" && (
        <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-crit/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-display text-crit font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-crit" /> Reject Citizen Report
            </h3>
            <p className="text-xs text-muted">
              Specify the reason for rejecting Tracking ID{" "}
              <span className="font-mono font-bold text-ink">{actionModal.report.tracking_id}</span>.
              This will be visible to the citizen on the tracking portal.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Specify rationale: e.g. Duplicate submission, invalid evidence, jurisdiction outside patrol sector..."
              className="w-full bg-base border border-line rounded-lg p-3 text-xs text-ink focus:border-crit focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-muted hover:text-ink bg-panel2 border border-line"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(actionModal.report, "reject")}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-crit text-base font-bold hover:bg-crit/90 shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal for Admin */}
      {assignModalReport && (
        <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignOfficerSubmit} className="bg-panel border border-teal/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-display text-white font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal" /> Assign Officer to Complaint
            </h3>
            <p className="text-xs text-muted">
              Select the investigating officer to assign to Tracking ID{" "}
              <span className="font-mono font-bold text-teal">{assignModalReport.tracking_id}</span> ({assignModalReport.crime_type}).
              Only the assigned officer will be cleared to inspect and process this case.
            </p>

            <div>
              <label className="block text-xs font-mono text-muted mb-1.5 uppercase">
                Select Investigating Officer
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
                onClick={() => setAssignModalReport(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-muted hover:text-ink bg-panel2 border border-line"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning || !selectedOfficerId}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-teal text-base font-bold hover:bg-teal/90 shadow disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Confirm Officer Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
