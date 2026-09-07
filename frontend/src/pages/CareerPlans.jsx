import { useEffect, useState } from "react";
import {
  fetchCareerPlans,
  createCareerPlan,
  updateCareerPlan,
  deleteCareerPlan,
  getCurrentUser,
} from "../lib/api.js";
import {
  Plus,
  Search,
  X,
  RefreshCw,
  BookOpen,
  Target,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Eye,
  Layers,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const DEFAULT_TOPICS = [
  "Cyber Forensics",
  "Financial Intelligence",
  "OSINT & Digital Recon",
  "Criminal Law & Procedure",
  "Data Analytics",
  "Leadership & Management",
];

const DIFFICULTY_COLORS = {
  Beginner: "bg-teal/20 text-teal border-teal/40",
  Intermediate: "bg-amber/20 text-amber border-amber/40",
  Advanced: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  Expert: "bg-crit/20 text-crit border-crit/40",
};

export default function CareerPlans() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Filter & Search states
  const [scope, setScope] = useState("all"); // "all" | "mine"
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [goal, setGoal] = useState("");
  const [deadlineRange, setDeadlineRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({
    total: 0,
    page: 1,
    page_size: 12,
    total_pages: 1,
    results: [],
    available_topics: [],
    available_goals: [],
    available_difficulties: ["Beginner", "Intermediate", "Advanced", "Expert"],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Detail Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTopic, setNewTopic] = useState("Cyber Forensics");
  const [newDifficulty, setNewDifficulty] = useState("Intermediate");
  const [newGoal, setNewGoal] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newMilestones, setNewMilestones] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("Intermediate");
  const [editGoal, setEditGoal] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editMilestones, setEditMilestones] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editNotes, setEditNotes] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Confirmation State
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const params = { page, page_size: 12, sort_by: sortBy, scope };
      if (q.trim()) params.q = q.trim();
      if (topic) params.topic = topic;
      if (difficulty) params.difficulty = difficulty;
      if (goal) params.goal = goal;

      if (deadlineRange) {
        const now = new Date();
        if (deadlineRange === "next_30_days" || deadlineRange === "30_days") {
          const future = new Date();
          future.setDate(now.getDate() + 30);
          params.deadline_before = future.toISOString();
        } else if (deadlineRange === "next_90_days" || deadlineRange === "90_days") {
          const future = new Date();
          future.setDate(now.getDate() + 90);
          params.deadline_before = future.toISOString();
        }
      }

      const res = await fetchCareerPlans(params);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load career plans. Is the backend server online?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, topic, difficulty, goal, deadlineRange, sortBy, page, scope]);

  function handleResetFilters() {
    setQ("");
    setTopic("");
    setDifficulty("");
    setGoal("");
    setDeadlineRange("");
    setSortBy("newest");
    setPage(1);
  }

  const activeFilterCount =
    (q ? 1 : 0) + (topic ? 1 : 0) + (difficulty ? 1 : 0) + (goal ? 1 : 0) + (deadlineRange ? 1 : 0);

  const topicOptions =
    data.available_topics && data.available_topics.length > 0
      ? data.available_topics
      : DEFAULT_TOPICS;

  // Open Edit Modal
  function openEditModal(plan, e) {
    if (e) e.stopPropagation();
    setEditingPlan(plan);
    setEditTitle(plan.title || "");
    setEditDesc(plan.description || "");
    setEditTopic(plan.topic || "Cyber Forensics");
    setEditDifficulty(plan.difficulty_level || "Intermediate");
    setEditGoal(plan.target_goal || "");
    setEditDeadline(plan.deadline ? plan.deadline.slice(0, 10) : "");
    setEditTags(plan.tags || "");
    setEditMilestones(plan.milestones || "");
    setEditStatus(plan.status || "active");
    setEditNotes(plan.notes || "");
    setEditError("");
  }

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newTopic.trim() || !newGoal.trim()) {
      setCreateError("Title, Topic, and Target Goal are required.");
      return;
    }
    setCreateSubmitting(true);
    setCreateError("");
    try {
      await createCareerPlan({
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        topic: newTopic.trim(),
        difficulty_level: newDifficulty,
        target_goal: newGoal.trim(),
        deadline: newDeadline ? new Date(newDeadline).toISOString() : null,
        tags: newTags.trim() || null,
        milestones: newMilestones.trim() || null,
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewGoal("");
      setNewDeadline("");
      setNewTags("");
      setNewMilestones("");
      showToast("Career plan registered successfully.");
      loadData();
    } catch (err) {
      setCreateError(err.response?.data?.detail || "Failed to create career plan.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleUpdatePlan(e) {
    e.preventDefault();
    if (!editTitle.trim() || !editTopic.trim() || !editGoal.trim()) {
      setEditError("Title, Topic, and Target Goal are required.");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await updateCareerPlan(editingPlan.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        topic: editTopic.trim(),
        difficulty_level: editDifficulty,
        target_goal: editGoal.trim(),
        deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
        tags: editTags.trim() || null,
        milestones: editMilestones.trim() || null,
        status: editStatus,
        notes: editNotes.trim() || null,
      });

      if (selectedPlan && selectedPlan.id === editingPlan.id) {
        setSelectedPlan(updated);
      }

      setEditingPlan(null);
      showToast("Career plan updated successfully.");
      loadData();
    } catch (err) {
      setEditError(err.response?.data?.detail || "Failed to update career plan.");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeletePlan(planId, e) {
    if (e) e.stopPropagation();
    setDeleteSubmitting(true);
    try {
      await deleteCareerPlan(planId);
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(null);
      }
      setDeletingPlanId(null);
      showToast("Career plan removed.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete career plan.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal/90 text-panel font-mono text-xs font-bold px-4 py-3 rounded shadow-lg border border-teal flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-teal" />
            <p className="font-mono text-teal text-xs tracking-[0.3em] uppercase">
              Law Enforcement Capacity & Learning
            </p>
          </div>
          <h2 className="font-display text-3xl text-ink">Career Plans & Learning Search</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Scope switch: All vs My Plans */}
          <div className="bg-panel2 border border-line p-1 rounded flex items-center font-mono text-xs">
            <button
              onClick={() => { setScope("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded transition ${
                scope === "all" ? "bg-teal text-panel font-bold shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              Department Catalog
            </button>
            <button
              onClick={() => { setScope("mine"); setPage(1); }}
              className={`px-3 py-1.5 rounded transition ${
                scope === "mine" ? "bg-teal text-panel font-bold shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              My Plans
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            aria-label="Create New Career Plan"
            title="Define a new learning career plan"
            className="bg-amber hover:bg-amber/90 font-mono font-bold text-xs px-4 py-2.5 rounded text-base shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Career Plan</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-panel border border-line rounded-lg p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search plans by keyword, title, description, milestones, notes, or tags..."
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-10 py-2.5 text-ink text-sm font-body focus:outline-none focus:ring-1 focus:ring-teal transition"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-2.5 text-muted hover:text-ink text-sm font-mono p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Topic Dropdown */}
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase mb-1">Topic</label>
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="w-full bg-panel2 border border-line rounded p-2 text-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal font-mono"
            >
              <option value="">All Topics</option>
              {topicOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="w-full bg-panel2 border border-line rounded p-2 text-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal font-mono"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Target Goal Input */}
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase mb-1">Target Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => { setGoal(e.target.value); setPage(1); }}
              placeholder="e.g. CDFE, CISSP..."
              className="w-full bg-panel2 border border-line rounded p-2 text-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal font-mono"
            />
          </div>

          {/* Deadline Horizon */}
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase mb-1">Deadline Horizon</label>
            <select
              value={deadlineRange}
              onChange={(e) => { setDeadlineRange(e.target.value); setPage(1); }}
              className="w-full bg-panel2 border border-line rounded p-2 text-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal font-mono"
            >
              <option value="">Any Timeframe</option>
              <option value="next_30_days">Next 30 Days</option>
              <option value="next_90_days">Next 90 Days</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase mb-1">Sort Ordering</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full bg-panel2 border border-line rounded p-2 text-ink text-xs focus:outline-none focus:ring-1 focus:ring-teal font-mono"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline_asc">Deadline (Earliest)</option>
              <option value="deadline_desc">Deadline (Furthest)</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="pt-3 border-t border-line/50 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted">Active Filters ({activeFilterCount}):</span>

              {q && (
                <span className="bg-panel2 border border-teal/40 text-teal px-2.5 py-1 rounded flex items-center gap-1.5">
                  Keyword: "{q}"
                  <button onClick={() => setQ("")} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {topic && (
                <span className="bg-panel2 border border-teal/40 text-teal px-2.5 py-1 rounded flex items-center gap-1.5">
                  Topic: {topic}
                  <button onClick={() => setTopic("")} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {difficulty && (
                <span className="bg-panel2 border border-teal/40 text-teal px-2.5 py-1 rounded flex items-center gap-1.5">
                  Difficulty: {difficulty}
                  <button onClick={() => setDifficulty("")} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {goal && (
                <span className="bg-panel2 border border-teal/40 text-teal px-2.5 py-1 rounded flex items-center gap-1.5">
                  Goal: {goal}
                  <button onClick={() => setGoal("")} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {deadlineRange && (
                <span className="bg-panel2 border border-teal/40 text-teal px-2.5 py-1 rounded flex items-center gap-1.5">
                  Deadline: {deadlineRange.replace("_", " ")}
                  <button onClick={() => setDeadlineRange("")} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="bg-crit/10 hover:bg-crit/20 border border-crit/40 text-crit px-3 py-1 rounded font-semibold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-crit/10 border border-crit/40 text-crit text-xs font-mono p-4 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline hover:text-white ml-3">Retry</button>
        </div>
      )}

      {/* Grid of Plans */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-panel border border-line rounded-lg p-5 animate-pulse space-y-3">
              <div className="h-4 bg-panel2 rounded w-3/4" />
              <div className="h-3 bg-panel2 rounded w-1/2" />
              <div className="h-16 bg-panel2 rounded w-full" />
            </div>
          ))}
        </div>
      ) : data.results.length === 0 ? (
        <div className="bg-panel border border-line rounded-lg p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-muted mx-auto opacity-50" />
          <h3 className="font-display text-xl text-ink">No Career Plans Found</h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            {scope === "mine"
              ? "You have not registered any individual career plans yet. Click 'Create Career Plan' or browse the Department Catalog."
              : "No learning plans matched your current keyword search and filter criteria."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="bg-panel2 hover:bg-panel border border-line font-mono font-bold text-xs px-4 py-2 rounded text-ink transition inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber hover:bg-amber/90 font-mono font-bold text-xs px-5 py-2.5 rounded text-base transition inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Plan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.results.map((plan) => {
            const diffClass =
              DIFFICULTY_COLORS[plan.difficulty_level] ||
              "bg-slate-700/40 text-slate-400 border-slate-600";
            const canManage = isAdmin || currentUser?.id === plan.user_id;
            const milestoneList = plan.milestones
              ? plan.milestones.split("\n").filter((m) => m.trim().length > 0)
              : [];

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="bg-panel border border-line hover:border-teal rounded-lg p-5 flex flex-col justify-between transition shadow-sm space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  {/* Topic & Difficulty Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="bg-teal/10 text-teal border border-teal/30 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold">
                      {plan.topic}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`border px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold ${diffClass}`}
                      >
                        {plan.difficulty_level}
                      </span>
                      {plan.status === "completed" && (
                        <span className="bg-teal/20 text-teal border border-teal/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg text-ink font-semibold leading-snug group-hover:text-teal transition">
                    {plan.title}
                  </h3>

                  {/* Target Goal */}
                  <div className="bg-panel2 border border-line/60 rounded p-2.5">
                    <p className="text-muted text-[10px] font-mono uppercase">Target Qualification / Goal</p>
                    <p className="text-ink text-xs font-mono font-semibold mt-0.5 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-teal shrink-0" />
                      <span className="truncate">{plan.target_goal}</span>
                    </p>
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <p className="text-muted text-xs font-body line-clamp-2 leading-relaxed">
                      {plan.description}
                    </p>
                  )}

                  {/* Milestones Preview */}
                  {milestoneList.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-300 bg-panel2/60 border border-line/40 rounded p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-muted uppercase font-semibold">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-teal" /> Milestones
                        </span>
                        <span>{milestoneList.length} items</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {milestoneList.slice(0, 2).map((m, idx) => (
                          <li key={idx} className="truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                            <span className="truncate">{m.replace(/^[0-9]+[.\-)]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-line/60 space-y-2.5 text-xs font-mono">
                  {/* Deadline & Status */}
                  <div className="flex justify-between items-center text-muted text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal" />
                      {plan.deadline ? new Date(plan.deadline).toLocaleDateString() : "Open Schedule"}
                    </span>
                    <span className="capitalize font-semibold text-ink">
                      {plan.status || "active"}
                    </span>
                  </div>

                  {/* Owner & Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-muted font-mono truncate max-w-[150px]">
                      {plan.owner_name || "Department Staff"}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                        }}
                        title="View Full Curriculum"
                        className="text-muted hover:text-teal p-1.5 rounded bg-panel2 hover:bg-panel border border-line transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={(e) => openEditModal(plan, e)}
                            title="Edit Plan"
                            className="text-muted hover:text-amber p-1.5 rounded bg-panel2 hover:bg-panel border border-line transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPlanId(plan.id);
                            }}
                            title="Delete Plan"
                            className="text-muted hover:text-crit p-1.5 rounded bg-panel2 hover:bg-panel border border-line transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {data.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-line pt-4 font-mono text-xs">
          <p className="text-muted">
            Showing Page {data.page} of {data.total_pages} ({data.total} total plans)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="bg-panel border border-line hover:border-teal disabled:opacity-50 px-3 py-1.5 rounded transition cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-teal font-bold bg-panel2 rounded">
              {page}
            </span>
            <button
              disabled={page >= data.total_pages}
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              className="bg-panel border border-line hover:border-teal disabled:opacity-50 px-3 py-1.5 rounded transition cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-base/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-line rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-5 font-body relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-line pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-teal/10 text-teal border border-teal/30 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold">
                    {selectedPlan.topic}
                  </span>
                  <span
                    className={`border px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                      DIFFICULTY_COLORS[selectedPlan.difficulty_level] || ""
                    }`}
                  >
                    {selectedPlan.difficulty_level}
                  </span>
                  <span className="bg-panel2 text-muted border border-line px-2 py-0.5 rounded text-[11px] font-mono uppercase">
                    Status: {selectedPlan.status || "active"}
                  </span>
                </div>
                <h3 className="font-display text-xl text-ink font-semibold mt-1">
                  {selectedPlan.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-muted hover:text-ink font-mono text-sm p-1.5 bg-panel2 rounded border border-line"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Qualification */}
            <div className="bg-panel2 border border-line rounded-lg p-3.5 space-y-1">
              <p className="text-muted text-[10px] font-mono uppercase tracking-wider">
                Target Qualification & Certification
              </p>
              <p className="text-teal font-mono font-semibold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0" />
                <span>{selectedPlan.target_goal}</span>
              </p>
            </div>

            {/* Description */}
            {selectedPlan.description && (
              <div className="space-y-1">
                <p className="text-muted text-[10px] font-mono uppercase">Curriculum Overview</p>
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap bg-panel2/40 p-3 rounded border border-line/40">
                  {selectedPlan.description}
                </p>
              </div>
            )}

            {/* Milestones */}
            {selectedPlan.milestones && (
              <div className="space-y-2">
                <p className="text-muted text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal" />
                  Key Learning Milestones
                </p>
                <div className="bg-panel2/60 border border-line rounded-lg p-3.5 space-y-2">
                  {selectedPlan.milestones
                    .split("\n")
                    .filter((m) => m.trim().length > 0)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-mono text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPlan.notes && (
              <div className="space-y-1">
                <p className="text-muted text-[10px] font-mono uppercase">Operational Notes</p>
                <p className="text-muted text-xs bg-panel2/40 p-2.5 rounded border border-line/40 font-mono">
                  {selectedPlan.notes}
                </p>
              </div>
            )}

            {/* Tags & Metadata */}
            <div className="border-t border-line pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-muted text-[10px] uppercase">Schedule & Deadline</p>
                <p className="text-ink mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal" />
                  {selectedPlan.deadline
                    ? new Date(selectedPlan.deadline).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Flexible Self-Paced"}
                </p>
              </div>

              <div>
                <p className="text-muted text-[10px] uppercase">Plan Creator</p>
                <p className="text-ink mt-0.5">
                  {selectedPlan.owner_name || "Department"} ({selectedPlan.owner_email || "N/A"})
                </p>
              </div>

              {selectedPlan.tags && (
                <div className="md:col-span-2">
                  <p className="text-muted text-[10px] uppercase mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlan.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-panel2 text-teal border border-teal/20 px-2 py-0.5 rounded text-[11px]"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-line">
              <div>
                {(isAdmin || currentUser?.id === selectedPlan.user_id) && (
                  <button
                    onClick={() => {
                      const p = selectedPlan;
                      setSelectedPlan(null);
                      openEditModal(p);
                    }}
                    className="bg-panel2 hover:bg-panel border border-line font-mono text-xs text-amber px-3 py-2 rounded flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="bg-teal hover:bg-teal/90 text-panel font-mono font-bold text-xs px-4 py-2 rounded shadow transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-base/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlan}
            className="bg-panel border border-line rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4 font-body relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="font-display text-lg text-ink flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber" />
                <span>Create New Career Plan</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-ink font-mono text-sm p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="bg-crit/10 border border-crit/40 text-crit text-xs p-3 rounded font-mono">
                {createError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Plan Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Cyber Crime Incident Response & Memory Forensics"
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Topic *
                  </label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  >
                    {topicOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Target Goal / Qualification *
                </label>
                <input
                  type="text"
                  required
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Certified Digital Forensics Examiner (CDFE)"
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Comprehensive training objectives and target outcomes..."
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="forensics, memory, autopsy"
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Milestones (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newMilestones}
                  onChange={(e) => setNewMilestones(e.target.value)}
                  placeholder="1. Volatile Memory Dump Analysis&#10;2. Master File Table Reconstruction&#10;3. Judicial Evidence Presentation"
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-mono text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="bg-amber hover:bg-amber/90 font-mono font-bold text-xs px-5 py-2.5 rounded text-base shadow transition disabled:opacity-50 cursor-pointer"
              >
                {createSubmitting ? "Saving..." : "Save Career Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      {editingPlan && (
        <div className="fixed inset-0 bg-base/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdatePlan}
            className="bg-panel border border-line rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4 font-body relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="font-display text-lg text-ink flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal" />
                <span>Edit Career Plan</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-muted hover:text-ink font-mono text-sm p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="bg-crit/10 border border-crit/40 text-crit text-xs p-3 rounded font-mono">
                {editError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Plan Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Topic *
                  </label>
                  <select
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  >
                    {topicOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Target Goal / Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted uppercase mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Milestones (One per line)
                </label>
                <textarea
                  rows={3}
                  value={editMilestones}
                  onChange={(e) => setEditMilestones(e.target.value)}
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted uppercase mb-1">
                  Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-panel2 border border-line rounded p-2.5 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-teal font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 text-xs font-mono text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSubmitting}
                className="bg-teal hover:bg-teal/90 text-panel font-mono font-bold text-xs px-5 py-2.5 rounded shadow transition disabled:opacity-50 cursor-pointer"
              >
                {editSubmitting ? "Updating..." : "Update Career Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deletingPlanId && (
        <div className="fixed inset-0 bg-base/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-crit/40 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 font-body">
            <h3 className="font-display text-lg text-crit flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Deletion</span>
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Are you sure you want to permanently remove this career plan? This operation cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlanId(null)}
                className="px-4 py-2 text-xs font-mono text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => handleDeletePlan(deletingPlanId)}
                className="bg-crit hover:bg-crit/90 text-white font-mono font-bold text-xs px-5 py-2.5 rounded shadow transition disabled:opacity-50 cursor-pointer"
              >
                {deleteSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
