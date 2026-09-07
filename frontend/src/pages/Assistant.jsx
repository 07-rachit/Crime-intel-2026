import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  listChatSessions,
  createChatSession,
  getChatMessages,
  sendChatMessage,
  confirmAgentAction,
  cancelAgentAction,
  downloadChatTranscript,
  getCurrentUser,
} from "../lib/api.js";
import {
  Search,
  Volume2,
  AlertTriangle,
  Check,
  X,
  Mic,
  ArrowRight,
  Activity,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
} from "lucide-react";

const SUGGESTED_QUERIES = [
  "Analyze suspect Ramesh Rao alias Black Hat",
  "Show unresolved robbery cases in Bangalore",
  "Check phone +91 98450 23456 records",
  "Summarize key forensic evidence for CR-2026-0001",
];

export default function Assistant() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const activeSessionKey = currentUser?.id ? `ci_chat_session_${currentUser.id}` : "ci_chat_session_guest";

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(() => localStorage.getItem(activeSessionKey));
  const [messages, setMessages] = useState([]);
  const [focusedMessage, setFocusedMessage] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en"); // "en" | "kn"
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  const [pendingAction, setPendingAction] = useState(null);
  const [actionExecuting, setActionExecuting] = useState(false);

  const chatContainerRef = useRef(null);
  const isSendingRef = useRef(false);
  const recognitionRef = useRef(null);

  const speechSupported =
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  // Load session list on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Sync messages whenever activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    // Prevent race condition if message sending is actively creating or updating this session
    if (isSendingRef.current) {
      return;
    }

    localStorage.setItem(activeSessionKey, activeSessionId);
    let isCancelled = false;

    getChatMessages(activeSessionId)
      .then((msgs) => {
        if (isCancelled) return;
        const mapped = (msgs || []).map((m) => ({
          ...m,
          _key: m.id || `msg-${m.created_at}-${Math.random()}`,
        }));
        setMessages(mapped);

        // Auto-focus latest assistant message for inspector panel
        const asstMsgs = mapped.filter((m) => m.role === "assistant");
        if (asstMsgs.length > 0) {
          setFocusedMessage(asstMsgs[asstMsgs.length - 1]);
        }
      })
      .catch(() => {
        if (isCancelled) return;
        localStorage.removeItem(activeSessionKey);
        setActiveSessionId(null);
        setMessages([]);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSessionId]);

  // Smooth scroll within the chat container ONLY (no viewport jump)
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, sending, pendingAction]);

  async function loadSessions() {
    try {
      const list = await listChatSessions();
      setSessions(list || []);
      const storedSession = localStorage.getItem(activeSessionKey);
      if (list && list.length > 0) {
        if (!storedSession || !list.some((s) => s.id === storedSession)) {
          setActiveSessionId(list[0].id);
        } else {
          setActiveSessionId(storedSession);
        }
      } else {
        localStorage.removeItem(activeSessionKey);
        setActiveSessionId(null);
      }
    } catch {
      setSessions([]);
    }
  }

  async function handleCreateSession() {
    try {
      const s = await createChatSession();
      setSessions((prev) => [s, ...prev.filter((item) => item.id !== s.id)]);
      setActiveSessionId(s.id);
      localStorage.setItem(activeSessionKey, s.id);
      setMessages([]);
      setFocusedMessage(null);
      setError("");
    } catch {
      setError("Could not create a new chat session.");
    }
  }

  async function handleSend(customText = null) {
    const text = (customText ?? input).trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    isSendingRef.current = true;
    setInput("");

    const turnKey = `turn-${Date.now()}`;
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      _key: turnKey,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let sid = activeSessionId;
      if (!sid || (sessions.length > 0 && !sessions.some((s) => s.id === sid))) {
        const newS = await createChatSession();
        sid = newS.id;
        setActiveSessionId(sid);
        localStorage.setItem(activeSessionKey, sid);
        setSessions((prev) => [newS, ...prev.filter((x) => x.id !== newS.id)]);
      }

      let answer;
      try {
        answer = await sendChatMessage(sid, text, language);
      } catch (sendErr) {
        if (sendErr.response && sendErr.response.status === 404) {
          const newS = await createChatSession();
          sid = newS.id;
          setActiveSessionId(sid);
          localStorage.setItem(activeSessionKey, sid);
          setSessions((prev) => [newS, ...prev.filter((x) => x.id !== newS.id)]);
          answer = await sendChatMessage(sid, text, language);
        } else {
          throw sendErr;
        }
      }

      const stableUserMsg = {
        ...answer.user_message,
        _key: turnKey,
      };

      const asstMsg = {
        ...answer.assistant_message,
        _key: `asst-${answer.assistant_message.id || Date.now()}`,
        reasoning_steps: answer.reasoning_steps || answer.assistant_message.reasoning_steps || [],
      };

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m._key === turnKey || String(m.id).startsWith("temp-"));
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = stableUserMsg;
          return [...next, asstMsg];
        }
        return [...prev, stableUserMsg, asstMsg];
      });

      setFocusedMessage(asstMsg);
      setPendingAction(answer.pending_action || null);

      // Refresh session list without resetting activeSessionId
      listChatSessions()
        .then((fresh) => {
          if (fresh) setSessions(fresh);
        })
        .catch(() => {});
    } catch (err) {
      setError("Could not complete query. Please check that backend services are active.");
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction || actionExecuting) return;
    setActionExecuting(true);
    try {
      const res = await confirmAgentAction(pendingAction.id);
      setPendingAction(null);

      const confirmMsg = {
        id: `confirm-${Date.now()}`,
        _key: `confirm-${Date.now()}`,
        role: "assistant",
        content: `**Action Confirmed & Executed**\n\n${res.message}`,
        created_at: new Date().toISOString(),
        reasoning_steps: [`Confirmed & Executed tool '${pendingAction.tool_name}'`],
      };
      setMessages((prev) => [...prev, confirmMsg]);
      setFocusedMessage(confirmMsg);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to confirm action.");
    } finally {
      setActionExecuting(false);
    }
  }

  async function handleCancelAction() {
    if (!pendingAction || actionExecuting) return;
    setActionExecuting(true);
    try {
      await cancelAgentAction(pendingAction.id);
      setPendingAction(null);

      const cancelMsg = {
        id: `cancel-${Date.now()}`,
        _key: `cancel-${Date.now()}`,
        role: "assistant",
        content: "Write action cancelled by officer.",
        created_at: new Date().toISOString(),
        reasoning_steps: [`Cancelled write tool '${pendingAction.tool_name}'`],
      };
      setMessages((prev) => [...prev, cancelMsg]);
    } catch {
      setError("Failed to cancel action.");
    } finally {
      setActionExecuting(false);
    }
  }

  function handleVoiceToggle() {
    if (!speechSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === "kn" ? "kn-IN" : "en-US";

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setListening(false);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function handleSpeak(msg) {
    if (speakingId === msg.id) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const uttr = new SpeechSynthesisUtterance(msg.content);
      uttr.lang = language === "kn" ? "kn-IN" : "en-US";
      uttr.onend = () => setSpeakingId(null);
      uttr.onerror = () => setSpeakingId(null);
      setSpeakingId(msg.id);
      window.speechSynthesis.speak(uttr);
    }
  }

  async function handleExportPDF() {
    if (!activeSessionId) return;
    setExporting(true);
    try {
      await downloadChatTranscript(activeSessionId, "investigation_ai");
    } catch {
      setError("Failed to download PDF transcript.");
    } finally {
      setExporting(false);
    }
  }

  // Parse sources for focused message safely
  let focusedSources = [];
  if (focusedMessage?.sources) {
    if (typeof focusedMessage.sources === "string") {
      try {
        focusedSources = JSON.parse(focusedMessage.sources);
      } catch {
        focusedSources = [];
      }
    } else if (Array.isArray(focusedMessage.sources)) {
      focusedSources = focusedMessage.sources;
    }
  }

  // Parse reasoning steps safely
  let reasoningSteps = [];
  if (focusedMessage?.reasoning_steps) {
    if (Array.isArray(focusedMessage.reasoning_steps)) {
      reasoningSteps = focusedMessage.reasoning_steps;
    } else if (typeof focusedMessage.reasoning_steps === "string") {
      try {
        const parsed = JSON.parse(focusedMessage.reasoning_steps);
        reasoningSteps = Array.isArray(parsed) ? parsed : [focusedMessage.reasoning_steps];
      } catch {
        reasoningSteps = [focusedMessage.reasoning_steps];
      }
    }
  }

  return (
    <div className="flex flex-1 h-full min-h-0 bg-base text-ink overflow-hidden select-none">
      {/* ── 1. Left Sessions Column ─────────────────────────────────── */}
      {showSessions && (
        <div className="w-64 shrink-0 border-r border-line bg-panel flex flex-col min-h-0">
          <div className="p-3.5 border-b border-line flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal" />
              <p className="font-mono text-xs text-muted uppercase tracking-wider font-semibold">Threads</p>
              <span className="text-[10px] font-mono bg-panel2 border border-line px-1.5 py-0.2 rounded text-muted">
                {sessions.length}
              </span>
            </div>
            <button
              onClick={handleCreateSession}
              className="text-xs font-mono bg-teal text-bg px-2.5 py-1 rounded font-semibold hover:brightness-110 active:scale-95 transition"
              title="Start a new investigation session"
            >
              + New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-muted text-xs font-mono">
                <p>No saved threads.</p>
                <p className="text-[11px] text-muted/60 mt-1">Start chatting to begin.</p>
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = activeSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (activeSessionId !== s.id) {
                        setActiveSessionId(s.id);
                        setFocusedMessage(null);
                      }
                    }}
                    className={`p-3 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                      isActive
                        ? "bg-panel2 border-teal text-teal font-semibold shadow-sm"
                        : "border-transparent text-muted hover:text-ink hover:bg-panel2/50"
                    }`}
                  >
                    <p className="truncate leading-tight">{s.title || "Untitled Session"}</p>
                    <p className="text-[10px] text-muted/60 mt-1">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── 2. Center Column: Main Conversation Area ────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-bg border-r border-line min-h-0 relative">
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-line bg-panel flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowSessions((prev) => !prev)}
              className="p-1.5 rounded-lg border border-line bg-panel2 text-muted hover:text-ink hover:border-teal transition"
              title={showSessions ? "Hide Sessions" : "Show Sessions"}
            >
              {showSessions ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base md:text-lg text-ink truncate">AI Case Assistant</h2>
                <span className="font-mono text-[9px] uppercase bg-teal/10 border border-teal/40 text-teal px-2 py-0.5 rounded shrink-0">
                  RAG Deep Search
                </span>
              </div>
              <p className="text-muted text-[11px] font-mono truncate hidden sm:block">
                Autonomous investigative copilot with real-time RAG context & reasoning citations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Toggle */}
            <div className="bg-panel2 border border-line rounded-lg p-0.5 flex text-xs font-mono">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded transition text-xs ${
                  language === "en" ? "bg-amber text-base font-bold shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("kn")}
                className={`px-2 py-1 rounded transition text-xs ${
                  language === "kn" ? "bg-amber text-base font-bold shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={exporting || !activeSessionId}
              className="bg-panel2 border border-line text-ink hover:border-amber text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 transition disabled:opacity-40"
              title="Download PDF Case Transcript"
            >
              {exporting ? "Exporting..." : "⬇ PDF Report"}
            </button>

            {/* Context Inspector Toggle */}
            <button
              onClick={() => setShowInspector((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition ${
                showInspector
                  ? "bg-teal/10 border-teal text-teal"
                  : "bg-panel2 border-line text-muted hover:text-ink hover:border-teal"
              }`}
              title={showInspector ? "Hide Inspector Panel" : "Show Inspector Panel"}
            >
              {showInspector ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Message Scroll Container */}
        <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
          {error && (
            <div className="border border-crit/40 bg-crit/10 text-crit text-xs font-mono p-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-crit hover:underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted font-mono">
              <div className="w-12 h-12 rounded-2xl bg-teal/10 border border-teal/30 flex items-center justify-center text-teal text-2xl mb-3 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                <Search className="w-6 h-6 text-teal" />
              </div>
              <p className="text-ink font-display text-base md:text-lg mb-1 tracking-wide">
                Deep-Search AI Case Assistant
              </p>
              <p className="text-xs max-w-md leading-relaxed text-muted mb-6">
                Query across case records, suspect profiles, phone logs, modus operandi, and automated investigative
                actions with source-backed citations.
              </p>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left">
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="p-2.5 rounded-lg border border-line bg-panel hover:bg-panel2 hover:border-teal/50 transition text-xs text-ink/90 flex items-start gap-2 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5 group-hover:scale-110 transition" />
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                const isFocused = focusedMessage?.id === m.id;

                return (
                  <div
                    key={m._key || m.id || idx}
                    onClick={() => !isUser && setFocusedMessage(m)}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[78%] rounded-xl p-4 transition-all duration-150 border shadow-md ${
                        isUser
                          ? "bg-amber text-base font-medium border-transparent shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
                          : isFocused
                          ? "bg-panel2 border-teal ring-2 ring-teal/30 shadow-[0_4px_20px_rgba(20,184,166,0.15)] cursor-pointer"
                          : "bg-panel border-line hover:border-teal/40 hover:bg-panel2/60 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-line/40 pb-1.5 gap-4">
                        <span
                          className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] md:text-[11px] ${
                            isUser ? "text-base" : "text-teal"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-base" : "bg-teal animate-pulse"}`}
                          />
                          {isUser ? "Investigator Query" : "AI Assistant Response"}
                        </span>
                        <span className={`text-[10px] font-mono ${isUser ? "text-base/70" : "text-muted"}`}>
                          {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-body break-words select-text ${
                          isUser ? "text-base" : "text-ink"
                        }`}
                      >
                        {m.content}
                      </div>

                      {!isUser && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-line/40 text-xs font-mono">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(m);
                            }}
                            className="text-muted hover:text-teal transition-colors flex items-center gap-1.5"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{speakingId === m.id ? "Stop Reading" : "Read Aloud"}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedMessage(m);
                              setShowInspector(true);
                            }}
                            className="text-[11px] text-teal hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Inspect Reasoning</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Tactical Typing / Thinking Indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-panel border border-line rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
                    <span className="text-xs font-mono text-muted">
                      Synthesizing intelligence & querying database...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Confirmation Request Drawer (Human In The Loop) */}
          <AnimatePresence>
            {pendingAction && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-panel2 border-2 border-amber/80 rounded-xl p-4 space-y-3 font-mono text-xs shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-amber font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber" />
                  <span>WRITE ACTION CONFIRMATION REQUIRED</span>
                </div>
                <p className="text-ink text-xs leading-relaxed font-body">{pendingAction.description}</p>
                <div className="bg-bg/80 p-3 rounded-lg border border-line text-[11px] text-muted space-y-1">
                  <p>
                    <span className="text-teal font-semibold">Tool:</span> {pendingAction.tool_name}
                  </p>
                  <p>
                    <span className="text-teal font-semibold">Target Parameters:</span>{" "}
                    {JSON.stringify(pendingAction.arguments)}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleConfirmAction}
                    disabled={actionExecuting}
                    className="bg-amber text-base font-bold px-4 py-2 rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{actionExecuting ? "Executing..." : "Confirm & Execute Action"}</span>
                  </button>
                  <button
                    onClick={handleCancelAction}
                    disabled={actionExecuting}
                    className="border border-line text-muted hover:text-crit hover:border-crit/40 px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Action</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Multi-line Input Box */}
        <div className="p-3 md:p-4 border-t border-line bg-panel shrink-0">
          <div className="flex items-end gap-2 md:gap-3 bg-panel2 border border-line rounded-xl p-2.5 focus-within:border-teal transition shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask an investigative question, search case ID, phone number, or crime pattern..."
              rows={2}
              className="flex-1 bg-transparent text-ink text-sm outline-none resize-none font-body px-2"
            />

            {speechSupported && (
              <button
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg text-sm transition ${
                  listening ? "bg-crit text-ink animate-pulse" : "text-muted hover:text-ink hover:bg-panel"
                }`}
                title="Voice input mic"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="bg-amber text-base font-semibold px-4 py-2.5 rounded-lg text-xs font-mono hover:brightness-110 active:scale-95 transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              <span>{sending ? "Analyzing..." : "Send"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Right Inspector Column: Context & Reasoning ──────────── */}
      {showInspector && (
        <div className="w-80 shrink-0 border-l border-line bg-panel p-4 md:p-5 flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-line shrink-0">
            <div>
              <h3 className="font-display text-base text-ink font-semibold">Context Inspector</h3>
              <p className="text-muted text-[11px] font-mono">Reasoning path & case citations</p>
            </div>
            <button
              onClick={() => setShowInspector(false)}
              className="p-1 rounded text-muted hover:text-ink"
              title="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!focusedMessage ? (
            <div className="border border-line rounded-lg p-4 text-center text-muted text-xs font-mono bg-panel2">
              Select an AI response in the conversation thread to view verified citations and reasoning steps.
            </div>
          ) : (
            <>
              {/* AI Reasoning Pipeline */}
              <div className="space-y-2">
                <p className="font-mono text-xs text-teal uppercase font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Execution Steps ({reasoningSteps.length})</span>
                </p>
                {reasoningSteps.length === 0 ? (
                  <p className="text-muted text-xs font-mono bg-panel2 p-3 rounded-lg border border-line">
                    No recorded intermediate steps.
                  </p>
                ) : (
                  <div className="space-y-1.5 bg-panel2 border border-line rounded-lg p-3 text-xs font-mono">
                    {reasoningSteps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-amber shrink-0">›</span>
                        <span className="text-ink text-[11px] leading-tight break-words">{st}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Retrieved Source Case Citations */}
              <div className="space-y-2">
                <p className="font-mono text-xs text-amber uppercase font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Source Citations ({focusedSources.length})</span>
                </p>

                {focusedSources.length === 0 ? (
                  <p className="text-muted text-xs font-mono bg-panel2 p-3 rounded-lg border border-line">
                    No direct sources cited for this response.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {focusedSources.map((src, i) => (
                      <div key={i} className="bg-panel2 border border-line rounded-lg p-3 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-teal font-bold">{src.case_code}</span>
                          <span className="text-amber text-[10px]">
                            {src.score ? `${(src.score * 100).toFixed(0)}% match` : "Direct Match"}
                          </span>
                        </div>

                        {src.match_type && (
                          <span className="inline-block text-[10px] uppercase px-1.5 py-0.5 rounded bg-panel border border-line text-muted">
                            Match: {src.match_type}
                          </span>
                        )}

                        {src.snippet && (
                          <p className="text-muted text-[11px] leading-normal line-clamp-3 bg-bg/50 p-2 rounded border border-line/40">
                            "{src.snippet}"
                          </p>
                        )}

                        {src.case_id && (
                          <Link
                            to={`/cases/${src.case_id}`}
                            className="text-teal hover:underline text-[11px] block text-right pt-1 font-semibold"
                          >
                            <span>Open Case File</span> &rarr;
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
