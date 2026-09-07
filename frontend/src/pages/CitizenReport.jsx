import { useState, useRef } from "react";
import { submitCitizenReport, trackCitizenReport } from "../lib/api.js";
import { 
  FileText, 
  Paperclip, 
  Upload, 
  Trash2, 
  Search, 
  Send, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  RefreshCw, 
  File, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  ShieldCheck,
  Building2,
  XCircle,
  Clock
} from "lucide-react";

export default function CitizenReport() {
  const [activeTab, setActiveTab] = useState("report"); // "report" or "track"
  const fileInputRef = useRef(null);

  // Report Form State
  const [crimeType, setCrimeType] = useState("Cyber Fraud / Phishing");
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  
  // Evidence upload state
  const [evidenceList, setEvidenceList] = useState([]);
  const [evidenceName, setEvidenceName] = useState("");
  const [evidenceType, setEvidenceType] = useState("image");
  const [evidenceSuccessMsg, setEvidenceSuccessMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Tracking State
  const [trackingIdInput, setTrackingIdInput] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedReport, setTrackedReport] = useState(null);
  const [trackingError, setTrackingError] = useState(null);

  function detectFileType(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) return "audio";
    if (["cctv", "dav", "h264"].includes(ext) || fileName.toLowerCase().includes("cctv")) return "cctv";
    return "document";
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map(file => {
      const detected = detectFileType(file.name);
      return {
        file_name: file.name,
        file_type: detected,
        file_path: `/uploads/evidence/${file.name}`,
        file_size: (file.size / 1024).toFixed(1) + " KB",
      };
    });

    setEvidenceList(prev => [...prev, ...newItems]);
    setEvidenceSuccessMsg(`Attached ${files.length} file(s) successfully`);
    setTimeout(() => setEvidenceSuccessMsg(""), 3500);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleAddEvidence() {
    if (!evidenceName.trim()) {
      // If user clicks without typing a name, open the file picker directly
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }
    const cleanName = evidenceName.trim();
    setEvidenceList([
      ...evidenceList,
      {
        file_name: cleanName,
        file_type: evidenceType,
        file_path: `/uploads/evidence/${cleanName}`,
        file_size: "Uploaded File",
      }
    ]);
    setEvidenceName("");
    setEvidenceSuccessMsg(`Attached '${cleanName}' successfully`);
    setTimeout(() => setEvidenceSuccessMsg(""), 3500);
  }

  function handleRemoveEvidence(index) {
    setEvidenceList(evidenceList.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!location.trim() || !description.trim() || !reporterName.trim() || !reporterPhone.trim()) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        crime_type: crimeType,
        incident_date: new Date(incidentDate).toISOString(),
        location: location.trim(),
        latitude: 12.9716,
        longitude: 77.5946,
        description: description.trim(),
        reporter_name: reporterName.trim(),
        reporter_phone: reporterPhone.trim(),
        reporter_email: reporterEmail.trim() || null,
        evidence: evidenceList.map(item => ({
          file_name: item.file_name,
          file_type: item.file_type,
          file_path: item.file_path,
        })),
      };

      const result = await submitCitizenReport(payload);
      setSubmissionResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report. Please check server connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrackSearch(e) {
    if (e) e.preventDefault();
    if (!trackingIdInput.trim()) return;
    setTrackingError(null);
    setTrackingLoading(true);
    setTrackedReport(null);

    try {
      const res = await trackCitizenReport(trackingIdInput.trim());
      setTrackedReport(res);
    } catch (err) {
      setTrackingError(err.response?.data?.detail || "No report found with that Tracking ID.");
    } finally {
      setTrackingLoading(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  const getEvidenceIcon = (type) => {
    switch (type) {
      case "image": return <ImageIcon className="w-3.5 h-3.5 text-cyan" />;
      case "video": return <VideoIcon className="w-3.5 h-3.5 text-amber" />;
      case "audio": return <Music className="w-3.5 h-3.5 text-teal" />;
      case "cctv": return <VideoIcon className="w-3.5 h-3.5 text-crit" />;
      default: return <FileText className="w-3.5 h-3.5 text-muted" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl relative overflow-hidden border border-line/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-teal px-2 py-0.5 bg-teal/10 border border-teal/30 rounded uppercase tracking-wider">
                TRACE Module
              </span>
              <span className="text-muted text-xs font-mono">• Citizen Portal</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-wide">
              CITIZEN <span className="text-teal">CRIME REPORTING</span>
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">
              Securely submit crime reports directly to the TRACE Investigation Engine. Track verification status in real time and generate official submission receipts.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-panel2 p-1 rounded-xl border border-line/60">
            <button
              onClick={() => { setActiveTab("report"); setSubmissionResult(null); }}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition ${
                activeTab === "report"
                  ? "bg-teal text-base font-bold shadow"
                  : "text-muted hover:text-ink"
              }`}
            >
              FILE CRIME REPORT
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "track"
                  ? "bg-teal text-base font-bold shadow"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Search className="w-3 h-3" /> TRACK STATUS
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: REPORT FORM ────────────────────────────────────────────── */}
      {activeTab === "report" && !submissionResult && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-6 shadow-xl border border-line/60">
          {error && (
            <div className="p-4 bg-crit/10 border border-crit/30 rounded-xl text-crit text-sm font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Incident Details */}
          <div>
            <h2 className="text-sm font-mono text-teal uppercase tracking-wider mb-4 border-b border-line/60 pb-2 flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4 text-teal" /> Incident Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  CRIME TYPE <span className="text-crit">*</span>
                </label>
                <select
                  value={crimeType}
                  onChange={(e) => setCrimeType(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                >
                  <option value="Cyber Fraud / Phishing">Cyber Fraud / Phishing</option>
                  <option value="Burglary">Burglary / Break-in</option>
                  <option value="Vehicle Theft">Vehicle Theft</option>
                  <option value="Robbery / Extortion">Robbery / Extortion</option>
                  <option value="Assault">Physical Assault</option>
                  <option value="Narcotics Incident">Narcotics Incident</option>
                  <option value="CCTV Suspicious Activity">CCTV Suspicious Activity</option>
                  <option value="Other Crime">Other Crime</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  DATE & TIME OF INCIDENT <span className="text-crit">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted mb-1">
                  INCIDENT LOCATION / ADDRESS <span className="text-crit">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Commercial Street Kiosk #4, Indiranagar, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted mb-1">
                  CRIME DESCRIPTION & EVIDENCE SUMMARY <span className="text-crit">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the incident in detail: what happened, persons involved, vehicle numbers, money lost, or suspicious observations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Evidence */}
          <div>
            <h2 className="text-sm font-mono text-teal uppercase tracking-wider mb-3 border-b border-line/60 pb-2 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-teal" /> Evidence Attachments (Optional)
              </span>
              <span className="text-xs text-muted font-normal">Images, Video, Audio, CCTV clips, PDFs</span>
            </h2>

            {evidenceSuccessMsg && (
              <div className="mb-3 p-2.5 bg-teal/15 border border-teal/40 rounded-lg text-teal text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                <span>{evidenceSuccessMsg}</span>
              </div>
            )}

            <div className="bg-panel2/60 p-4 rounded-xl border border-line/60 space-y-3">
              {/* Hidden Native File Input for real file selection */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="bg-base border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-teal focus:outline-none font-mono"
                >
                  <option value="image">Image / Photo</option>
                  <option value="video">Video Recording</option>
                  <option value="audio">Audio Clip</option>
                  <option value="cctv">CCTV Footage</option>
                  <option value="document">PDF / Document</option>
                </select>

                <input
                  type="text"
                  placeholder="Type file label or select from disk..."
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="flex-1 bg-base border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-teal focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="bg-panel border border-line hover:border-teal/60 text-ink text-xs font-mono px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-teal" />
                  <span>Browse File</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="bg-teal text-base hover:bg-teal/90 font-mono text-xs font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center justify-center gap-1"
                >
                  + Add Evidence File
                </button>
              </div>

              {/* Drag & Drop Prompt / Info */}
              <div 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="border border-dashed border-line/80 hover:border-teal/60 rounded-xl p-3 text-center cursor-pointer transition bg-base/40 hover:bg-base/70"
              >
                <p className="text-xs text-muted font-mono flex items-center justify-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-teal/80" />
                  <span>Click to select and upload evidence files directly from your computer</span>
                </p>
              </div>

              {evidenceList.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t border-line/60">
                  <p className="text-xs font-mono text-muted uppercase">Attached Evidence Items ({evidenceList.length}):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {evidenceList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-base px-3 py-2 rounded-lg border border-line/60 text-xs font-mono">
                        <div className="flex items-center gap-2 truncate text-ink">
                          {getEvidenceIcon(item.file_type)}
                          <span className="text-teal font-semibold">[{item.file_type.toUpperCase()}]</span>
                          <span className="truncate">{item.file_name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(idx)}
                          className="text-crit/80 hover:text-crit hover:bg-crit/10 p-1 rounded transition ml-2"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Reporter Details */}
          <div>
            <h2 className="text-sm font-mono text-teal uppercase tracking-wider mb-2 border-b border-line/60 pb-2 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal" /> Reporter Contact Details
              </span>
              <span className="text-[10px] text-teal font-mono bg-teal/10 px-2.5 py-0.5 rounded-full border border-teal/30 flex items-center gap-1 font-semibold">
                <Lock className="w-2.5 h-2.5" /> RBAC PROTECTED
              </span>
            </h2>
            <p className="text-xs text-muted mb-4">
              Your contact details are encrypted and protected under RBAC. Only assigned investigating officers can view your contact information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  FULL NAME <span className="text-crit">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohan Mehta"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  MOBILE NUMBER <span className="text-crit">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91-9876543210"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  EMAIL ADDRESS (OPTIONAL)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rohan.m@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line/60 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal hover:bg-teal/90 text-base font-mono font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Submitting & AI Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT CRIME REPORT</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── SUCCESS STATE & RECEIPT VIEW ──────────────────────────────────── */}
      {submissionResult && (
        <div className="glass-card border border-teal/40 rounded-2xl p-6 space-y-6 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between border-b border-line/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal" />
                <h2 className="text-xl font-display font-bold text-white">REPORT SUBMITTED SUCCESSFULLY</h2>
              </div>
              <p className="text-xs font-mono text-muted mt-1">
                Every report is securely logged and processed through the TRACE Investigation Engine.
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="bg-panel2 hover:bg-line border border-line text-ink text-xs font-mono px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-teal" />
                <span>Print / Download Receipt</span>
              </button>
              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setLocation("");
                  setDescription("");
                  setReporterName("");
                  setReporterPhone("");
                  setReporterEmail("");
                  setEvidenceList([]);
                }}
                className="bg-teal text-base text-xs font-mono font-bold px-3.5 py-2 rounded-lg transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>

          {/* Official Receipt Card */}
          <div className="bg-base border-2 border-dashed border-line/80 rounded-xl p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-start border-b border-line/60 pb-3">
              <div>
                <span className="text-teal font-bold text-base tracking-wider">STATE POLICE CRIME INTELLIGENCE SYSTEM</span>
                <p className="text-muted text-[10px] mt-0.5">Official Digital Acknowledgement Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-muted text-[10px]">ISSUED AT:</span>
                <p className="text-ink font-semibold">{new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-panel2/50 p-4 rounded-lg">
              <div>
                <span className="text-muted uppercase text-[10px]">Tracking Reference ID</span>
                <p className="text-teal font-bold text-base">{submissionResult.tracking_id}</p>
              </div>
              <div>
                <span className="text-muted uppercase text-[10px]">Crime Category</span>
                <p className="text-ink font-bold">{submissionResult.crime_type}</p>
              </div>
              <div>
                <span className="text-muted uppercase text-[10px]">Verification Status</span>
                <p className="text-amber font-bold uppercase">{submissionResult.status}</p>
              </div>
              <div>
                <span className="text-muted uppercase text-[10px]">AI Priority</span>
                <p className="text-crit font-bold uppercase">{submissionResult.ai_priority}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted uppercase text-[10px]">Incident Location</span>
              <p className="text-ink font-semibold">{submissionResult.location}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted uppercase text-[10px]">Statement Recorded</span>
              <p className="text-ink bg-panel2 p-3 rounded border border-line/60 text-xs font-body leading-relaxed">
                {submissionResult.description}
              </p>
            </div>

            {submissionResult.evidence_items && submissionResult.evidence_items.length > 0 && (
              <div className="space-y-1">
                <span className="text-muted uppercase text-[10px]">Attached Evidence Files ({submissionResult.evidence_items.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {submissionResult.evidence_items.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 bg-panel2 px-3 py-1.5 rounded border border-line/40 text-[11px]">
                      {getEvidenceIcon(ev.file_type)}
                      <span className="text-teal font-semibold">[{ev.file_type.toUpperCase()}]</span>
                      <span className="truncate">{ev.file_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: TRACK STATUS ───────────────────────────────────────────── */}
      {activeTab === "track" && (
        <div className="glass-card p-6 rounded-2xl space-y-6 shadow-xl border border-line/60">
          <div>
            <h2 className="text-sm font-mono text-teal uppercase tracking-wider mb-2 border-b border-line/60 pb-2 flex items-center gap-2 font-semibold">
              <Search className="w-4 h-4 text-teal" /> Track Incident Verification Status
            </h2>
            <p className="text-xs text-muted mb-4">
              Enter the unique Tracking ID generated upon report submission to inspect verification status and officer assignments.
            </p>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. TRK-2026-00010)"
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                className="flex-1 bg-base border border-line rounded-lg px-4 py-2.5 font-mono text-sm text-ink focus:border-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="bg-teal hover:bg-teal/90 text-base font-mono font-bold text-xs px-6 py-2.5 rounded-lg transition shadow flex items-center justify-center gap-1.5"
              >
                {trackingLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>LOOKUP TRACKING ID</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-muted">
              <span>Quick Demo IDs:</span>
              <button
                type="button"
                onClick={() => { setTrackingIdInput("TRK-2026-00010"); }}
                className="text-teal hover:underline"
              >
                TRK-2026-00010
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setTrackingIdInput("TRK-2026-00011"); }}
                className="text-teal hover:underline"
              >
                TRK-2026-00011
              </button>
            </div>
          </div>

          {trackingError && (
            <div className="p-4 bg-crit/10 border border-crit/30 rounded-xl text-crit text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedReport && (
            <div className="space-y-6 pt-4 border-t border-line/60 animate-slide-up">
              {/* Report Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel2/60 p-4 rounded-xl border border-line/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-teal">{trackedReport.tracking_id}</span>
                    <span className="text-xs font-mono text-muted">• {trackedReport.crime_type}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Location: {trackedReport.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase tracking-wider ${
                    trackedReport.status === "verified" || trackedReport.status === "approved"
                      ? "bg-teal/20 text-teal border border-teal/40"
                      : trackedReport.status === "rejected"
                      ? "bg-crit/20 text-crit border border-crit/40"
                      : "bg-amber/20 text-amber border border-amber/40"
                  }`}>
                    Status: {trackedReport.status}
                  </span>
                </div>
              </div>

              {/* Case Integration Notice if Verified */}
              {trackedReport.created_case_id && (
                <div className="p-4 bg-teal/10 border border-teal/30 rounded-xl text-xs font-mono space-y-1">
                  <p className="text-teal font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal" />
                    <span>OFFICIAL CASE GENERATED & INTEGRATED</span>
                  </p>
                  <p className="text-ink">
                    This citizen report was reviewed and approved. Official Case ID:{" "}
                    <span className="text-teal font-bold underline">{trackedReport.created_case_id}</span> has been created in TRACE Engine, Cases Dashboard, and Hotspot Map.
                  </p>
                </div>
              )}

              {/* Rejection Notice if Rejected */}
              {trackedReport.status === "rejected" && (
                <div className="p-4 bg-crit/10 border border-crit/30 rounded-xl text-xs font-mono space-y-1">
                  <p className="text-crit font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-crit" />
                    <span>REPORT REJECTED AFTER OFFICER REVIEW</span>
                  </p>
                  <p className="text-ink">Reason: {trackedReport.rejection_reason || "Report could not be verified."}</p>
                </div>
              )}

              {/* Description & AI Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-panel2/60 p-4 rounded-xl border border-line/60 space-y-2">
                  <p className="text-xs font-mono text-teal uppercase font-semibold">Report Details</p>
                  <p className="text-xs text-ink leading-relaxed">{trackedReport.description}</p>
                  <div className="pt-2 text-[10px] font-mono text-muted border-t border-line/60">
                    Reporter: {trackedReport.reporter_name} ({trackedReport.reporter_phone})
                  </div>
                </div>

                <div className="bg-panel2/60 p-4 rounded-xl border border-line/60 space-y-2">
                  <p className="text-xs font-mono text-cyan uppercase font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
                    <span>AI Priority & Investigation Findings</span>
                  </p>
                  <p className="text-xs text-ink leading-relaxed">
                    {trackedReport.ai_summary || "AI processing in progress."}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-muted border-t border-line/60 flex justify-between">
                    <span>Priority: {trackedReport.ai_priority?.toUpperCase() || "MEDIUM"}</span>
                    <span>Category: {trackedReport.ai_classification || "Unclassified"}</span>
                  </div>
                </div>
              </div>

              {/* Attached Evidence Items */}
              {trackedReport.evidence_items && trackedReport.evidence_items.length > 0 && (
                <div className="bg-panel2/60 p-4 rounded-xl border border-line/60 space-y-2">
                  <p className="text-xs font-mono text-teal uppercase font-semibold">Attached Evidence Files ({trackedReport.evidence_items.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trackedReport.evidence_items.map((ev, idx) => (
                      <div key={idx} className="bg-base p-2.5 rounded-lg border border-line/60 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 truncate text-ink">
                          {getEvidenceIcon(ev.file_type)}
                          <span className="text-teal font-semibold">[{ev.file_type?.toUpperCase()}]</span>
                          <span className="truncate">{ev.file_name}</span>
                        </div>
                        <span className="text-[10px] text-muted">{new Date(ev.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
