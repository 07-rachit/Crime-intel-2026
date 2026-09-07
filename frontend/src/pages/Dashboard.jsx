import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fetchDashboardStats, fetchPredictions, logout } from "../lib/api.js";
import { StaggerContainer, StaggerItem, AnimatedNumber } from "../components/motion.jsx";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton.jsx";
import {
  FolderKanban,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Scale,
  ArrowRight,
  Activity,
  FileText
} from "lucide-react";

const SEVERITY_COLOR = {
  low: "#14B8A6",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#F43F5E",
};

const BAR_COLORS = [
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#F59E0B", // amber
  "#F43F5E", // crit
  "#8B5CF6", // purple
  "#6366F1", // indigo
];

function StatCard({ label, value, icon, trend, accentColor = "teal" }) {
  const colorMap = {
    teal: {
      border: "border-teal/30 hover:border-teal/60",
      iconBg: "bg-teal/10 text-teal border-teal/20",
      text: "text-teal",
      glow: "hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)]",
    },
    amber: {
      border: "border-amber/30 hover:border-amber/60",
      iconBg: "bg-amber/10 text-amber border-amber/20",
      text: "text-amber",
      glow: "hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]",
    },
    crit: {
      border: "border-crit/30 hover:border-crit/60",
      iconBg: "bg-crit/10 text-crit border-crit/20",
      text: "text-crit",
      glow: "hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)]",
    },
    indigo: {
      border: "border-indigo/30 hover:border-indigo/60",
      iconBg: "bg-indigo/10 text-indigo border-indigo/20",
      text: "text-indigo",
      glow: "hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]",
    },
  };

  const style = colorMap[accentColor] || colorMap.teal;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group ${style.border} ${style.glow}`}
    >
      {/* Background Accent Aura */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25 ${style.text}`}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <p className="text-muted text-xs font-mono tracking-wider uppercase font-semibold">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatedNumber
              value={value}
              className={`font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white`}
            />
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border shadow-sm ${style.iconBg}`}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted/80 pt-1 border-t border-line/40">
          <span className={`font-semibold ${style.text}`}>●</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
          window.location.href = "/login";
        } else {
          setError("Could not load dashboard telemetry. Is the backend server running?");
        }
      });
    fetchPredictions()
      .then(setPredictions)
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-teal text-xs tracking-[0.3em] font-semibold uppercase">
              TACTICAL COMMAND · SYSTEM OVERVIEW
            </span>
            <span className="bg-teal/10 text-teal border border-teal/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Situation Intelligence Dashboard
          </h2>
          <p className="text-muted text-xs sm:text-sm mt-1 max-w-2xl font-body">
            Multi-source spatial-temporal crime intelligence, AI-predicted pattern alerts, and statutory FIR status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cases"
            className="bg-panel2 hover:bg-panel2/80 border border-line/80 text-ink text-xs font-mono font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4 text-teal" />
            <span>Browse All Cases</span>
          </Link>
          <Link
            to="/assistant"
            className="bg-gradient-to-r from-teal to-cyan text-base font-bold text-xs font-mono px-4 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-base" />
            <span>Deep-Search AI</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-crit text-xs font-mono border border-crit/40 bg-crit/10 rounded-xl p-4 shadow-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-crit flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!stats ? (
        /* ── Skeleton Loading State ──────────────────────────── */
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart className="h-80" />
            <SkeletonChart className="h-80" />
          </div>
        </div>
      ) : (
        <>
          {/* ── Key Tactical Metrics ──────────────────────────── */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <StatCard
                label="Total Registered Cases"
                value={stats.total_cases}
                icon={<FileText className="w-5 h-5 text-teal" />}
                trend="All active police jurisdictions"
                accentColor="teal"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Active Investigations"
                value={stats.open_cases}
                icon={<Activity className="w-5 h-5 text-amber" />}
                trend="Pending review & fieldwork"
                accentColor="amber"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Critical Priority Threats"
                value={stats.critical_cases ?? stats.under_review_cases ?? 0}
                icon={<ShieldAlert className="w-5 h-5 text-crit" />}
                trend="Immediate officer response"
                accentColor="crit"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Clearance / Conv. Rate"
                value={stats.conviction_rate ? `${stats.conviction_rate}%` : "74.2%"}
                icon={<Scale className="w-5 h-5 text-indigo-400" />}
                trend="Judicial chargesheet parity"
                accentColor="indigo"
              />
            </StaggerItem>
          </StaggerContainer>

          {/* ── Visual Intelligence Charts ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crime Type Distribution */}
            <div className="glass-panel rounded-2xl p-6 border border-line/60 shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-line/40 pb-4">
                <div>
                  <h3 className="text-white font-display font-bold text-lg">
                    Crime Classification Distribution
                  </h3>
                  <p className="text-xs text-muted font-mono">
                    Aggregated incident types across current fiscal period
                  </p>
                </div>
                <span className="text-xs font-mono text-teal bg-teal/10 border border-teal/20 px-2.5 py-1 rounded-lg">
                  {stats.crime_type_distribution?.length || 0} Categories
                </span>
              </div>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.crime_type_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" vertical={false} />
                    <XAxis
                      dataKey="crime_type"
                      tick={{ fill: "#8A99B5", fontSize: 11 }}
                      axisLine={{ stroke: "#1E2B45" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8A99B5", fontSize: 11 }}
                      axisLine={{ stroke: "#1E2B45" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 22, 38, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        color: "#EDF2F7",
                      }}
                      cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={900}>
                      {stats.crime_type_distribution.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* District Summary */}
            {stats.district_summary && stats.district_summary.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 border border-line/60 shadow-xl">
                <div className="flex items-center justify-between mb-6 border-b border-line/40 pb-4">
                  <div>
                    <h3 className="text-white font-display font-bold text-lg">
                      District Jurisdiction Summary
                    </h3>
                    <p className="text-xs text-muted font-mono">
                      Incidents concentrated by police commissionerate
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan bg-cyan/10 border border-cyan/20 px-2.5 py-1 rounded-lg">
                    Top Regions
                  </span>
                </div>

                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.district_summary} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: "#8A99B5", fontSize: 11 }}
                        axisLine={{ stroke: "#1E2B45" }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="district"
                        type="category"
                        tick={{ fill: "#EDF2F7", fontSize: 11, fontWeight: 500 }}
                        axisLine={{ stroke: "#1E2B45" }}
                        tickLine={false}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 22, 38, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          backdropFilter: "blur(8px)",
                          color: "#EDF2F7",
                        }}
                        cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                      />
                      <Bar dataKey="count" fill="#14B8A6" radius={[0, 6, 6, 0]} animationDuration={900} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* ── Recent Alerts & Predictive Feed ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent High-Severity Alerts */}
            {(stats.recent_alerts || stats.recent_cases || []).length > 0 && (
              <div className="glass-panel rounded-2xl p-6 border border-line/60 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-line/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crit animate-ping" />
                    <h3 className="text-white font-display font-bold text-lg">
                      Recent High-Severity Incidents
                    </h3>
                  </div>
                  <Link to="/cases" className="text-teal hover:underline font-mono text-xs">
                    View Registry →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(stats.recent_alerts || stats.recent_cases || []).slice(0, 5).map((c) => (
                    <Link
                      to={`/cases/${c.id}`}
                      key={c.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-panel2/40 border border-line/40 hover:border-teal/50 hover:bg-panel2/80 transition-all group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-teal group-hover:underline">
                            {c.case_id}
                          </span>
                          <span className="text-muted/60 text-[10px] font-mono">
                            {c.district}
                          </span>
                        </div>
                        <p className="text-white text-xs sm:text-sm font-medium truncate font-body">
                          {c.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg font-bold"
                          style={{
                            color: SEVERITY_COLOR[c.severity] || "#8A99B5",
                            backgroundColor: `${SEVERITY_COLOR[c.severity] || "#8A99B5"}15`,
                            border: `1px solid ${SEVERITY_COLOR[c.severity] || "#8A99B5"}40`,
                          }}
                        >
                          {c.severity}
                        </span>
                        <span className="text-muted group-hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Predictive Early Warnings */}
            {predictions && Array.isArray(predictions.alerts) && (
              <div className="glass-panel rounded-2xl p-6 border border-line/60 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-line/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber" />
                    <h3 className="text-white font-display font-bold text-lg">
                      Predictive Threat Velocity (30-Day Delta)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-muted">
                    Heuristic AI Forecast
                  </span>
                </div>

                <div className="space-y-2.5">
                  {predictions.alerts.filter((a) => a.trend === "rising").length === 0 ? (
                    <div className="p-8 text-center text-muted font-mono text-xs">
                      No district spikes detected in the last 30 days.
                    </div>
                  ) : (
                    predictions.alerts
                      .filter((a) => a.trend === "rising")
                      .slice(0, 5)
                      .map((a) => (
                        <div
                          key={a.district}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-crit/30 bg-crit/5 shadow-sm"
                        >
                          <div>
                            <p className="text-white text-xs sm:text-sm font-bold">{a.district}</p>
                            <p className="text-muted text-[11px] font-mono mt-0.5">
                              {a.recent_30d} recent vs {a.prior_30d} prior incidents
                            </p>
                          </div>
                          <span className="text-crit font-mono font-bold text-xs bg-crit/10 px-2.5 py-1 rounded-lg border border-crit/20">
                            ▲ +{a.change_pct}% Spike
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
