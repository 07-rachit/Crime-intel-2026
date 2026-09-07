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
  FileText
} from "lucide-react";


const ACTIVE_SESSION_KEY = "crime_intel_active_chat_session";

export default function Assistant() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(() => localStorage.getItem(ACTIVE_SESSION_KEY));
  const [messages, setMessages] = useState([]);
  const [focusedMessage, setFocusedMessage] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en"); // "en" | "kn"
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const speechSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  // Load session list & initial active session
  useEffect(() => {
    loadSessions();
  }, []);

  // Sync messages whenever activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      getChatMessages(activeSessionId)
        .then((msgs) => {
          setMessages(msgs);
          // Auto-focus latest assistant message for inspector panel
          const asstMsgs = msgs.filter((m) => m.role === "assistant");
          if (asstMsgs.length > 0) {
            setFocusedMessage(asstMsgs[asstMsgs.length - 1]);
          }
        })
        .catch(() => {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
          setActiveSessionId(null);
          setMessages([]);
        });
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadSessions() {
    try {
      const list = await listChatSessions();
      setSessions(list);
      const storedSession = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (list.length > 0) {
        if (!storedSession || !list.some((s) => s.id === storedSession)) {
          setActiveSessionId(list[0].id);
        } else {
          setActiveSessionId(storedSession);
        }
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setActiveSessionId(null);
      }
    } catch {
      setSessions([]);
    }
  }

  async function handleCreateSession() {
    try {
      const s = await createChatSession();
      setSessions((prev) => [s, ...prev]);
      setActiveSessionId(s.id);
      setMessages([]);
      setFocusedMessage(null);
    } catch (err) {
      setError("Could not create a new chat session.");
    }
  }

  const [pendingAction, setPendingAction] = useState(null);
  const [actionExecuting, setActionExecuting] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");

    // Temporary optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
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
        setSessions((prev) => (prev.some((x) => x.id === newS.id) ? prev : [newS, ...prev]));
      }

      let answer;
      try {
        answer = await sendChatMessage(sid, text, language);
      } catch (sendErr) {
        if (sendErr.response && sendErr.response.status === 404) {
          const newS = await createChatSession();
          sid = newS.id;
          setActiveSessionId(sid);
          setSessions((prev) => (prev.some((x) => x.id === newS.id) ? prev : [newS, ...prev]));
          answer = await sendChatMessage(sid, text, language);
        } else {
          throw sendErr;
        }
      }

      const asstMsg = {
        ...answer.assistant_message,
        reasoning_steps: answer.reasoning_steps || answer.assistant_message.reasoning_steps || [],
      };

      setMessages((prev) => [
        ...prev.filter((m) => !String(m.id).startsWith("temp-")),
        answer.user_message,
        asstMsg,
      ]);
      setFocusedMessage(asstMsg);
      setPendingAction(answer.pending_action || null);

      // Refresh session list to show updated titles
      loadSessions();
    } catch (err) {
      setError("Could not send message. Is the backend server online?");
    } finally {
      setSending(false);
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction || actionExecuting) return;
    setActionExecuting(true);
    try {
      const res = await confirmAgentAction(pendingAction.id);
      setPendingAction(null);

      // Append AI execution confirmation message
      const confirmMsg = {
        id: `confirm-${Date.now()}`,
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
        role: "assistant",
        content: "Write action cancelled by officer.",
        created_at: new Date().toISOString(),
        reasoning_steps: [`Cancelled write tool '${pendingAction.tool_name}'`],
      };
      setMessages((prev) => [...prev, cancelMsg]);
    } catch (err) {
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

  // Parse sources for focused message
  let focusedSources = [];
  if (focusedMessage?.sources) {
    try {
      focusedSources = JSON.parse(focusedMessage.sources);
    } catch {
      focusedSources = [];
    }
  }

  return (
    <div className="flex flex-1 h-full min-h-0 bg-base text-ink overflow-hidden">
      {/* ── 1. Left Sessions Column (260px) ────────────────────────────────── */}
      <div className="w-64 border-r border-line bg-panel flex flex-col">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <p className="font-mono text-xs text-muted uppercase tracking-wider">Investigative Threads</p>
          <button
            onClick={handleCreateSession}
            className="text-xs font-mono bg-teal text-bg px-2.5 py-1 rounded font-semibold hover:brightness-110 transition"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-muted text-xs font-mono p-3">No saved sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`p-3 rounded text-xs font-mono cursor-pointer transition truncate border ${
                  activeSessionId === s.id
                    ? "bg-panel2 border-teal text-teal font-semibold"
                    : "border-transparent text-muted hover:text-ink hover:bg-panel2/50"
                }`}
              >
                <p className="truncate">{s.title || "Untitled Session"}</p>
                <p className="text-[10px] text-muted/60 mt-1">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 2. Center Column: Main Conversation Area (Flex-1) ────────────── */}
      <div className="flex-1 flex flex-col bg-bg border-r border-line relative">
        {/* Header Bar */}
        <div className="p-4 border-b border-line bg-panel flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl text-ink">AI Case Assistant</h2>
                <span className="font-mono text-[10px] uppercase bg-teal/10 border border-teal/40 text-teal px-2 py-0.5 rounded">
                  Deep Search &middot; Investigator Mode
                </span>
              </div>
              <p className="text-muted text-xs font-mono mt-0.5">
                Full-page investigative research desk with real-time RAG context & reasoning steps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="bg-panel2 border border-line rounded p-0.5 flex text-xs font-mono">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded transition ${language === "en" ? "bg-amber text-base font-bold" : "text-muted"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("kn")}
                className={`px-2.5 py-1 rounded transition ${language === "kn" ? "bg-amber text-base font-bold" : "text-muted"}`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={exporting || !activeSessionId}
              className="bg-amber text-base text-xs font-mono font-semibold rounded px-3 py-1.5 hover:brightness-110 transition disabled:opacity-50"
            >
              {exporting ? "Generating..." : "⬇ Export PDF Report"}
            </button>
          </div>
        </div>

        {/* Message Scroll Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="border border-crit/40 bg-crit/10 text-crit text-xs font-mono p-3 rounded">
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted font-mono">
              <div className="w-14 h-14 rounded-2xl bg-teal/10 border border-teal/30 flex items-center justify-center text-teal text-2xl mb-4 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                <Search className="w-6 h-6 text-teal" />
              </div>
              <p className="text-ink font-display text-lg mb-1 tracking-wide">Deep-Search AI Case Assistant</p>
              <p className="text-xs max-w-md leading-relaxed text-muted">
                Ask about specific case IDs (e.g. <code className="text-teal font-semibold">CR-2026-0016</code>), suspect phone numbers, crime trends, or request investigative next steps.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                const isFocused = focusedMessage?.id === m.id;

                return (
                  <motion.div
                    key={m.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => !isUser && setFocusedMessage(m)}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 cursor-pointer transition-all duration-200 border shadow-md ${
                        isUser
                          ? "bg-amber text-base font-medium border-transparent shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
                          : isFocused
                          ? "bg-panel2 border-teal ring-2 ring-teal/30 shadow-[0_4px_20px_rgba(20,184,166,0.15)]"
                          : "bg-panel border-line hover:border-teal/40 hover:bg-panel2/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-line/40 pb-1.5 gap-4">
                        <span className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] ${isUser ? "text-base" : "text-teal"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-base" : "bg-teal animate-pulse"}`} />
                          {isUser ? "Investigator Query" : "AI Assistant Response"}
                        </span>
                        <span className={`text-[10px] font-mono ${isUser ? "text-base/70" : "text-muted"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed whitespace-pre-wrap font-body ${isUser ? "text-base" : "text-ink"}`}>{m.content}</p>

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
                            <span>{speakingId === m.id ? "Stop Reading" : "Read Aloud"}</span>
                          </button>

                          <span className="text-[11px] text-teal hover:underline flex items-center gap-1">
                            Inspect Reasoning & Sources →
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Tactical Typing / Thinking Indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-panel border border-line rounded-xl p-3.5 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
                    <span className="text-xs font-mono text-muted">
                      Synthesizing intelligence & querying database...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Confirmation Request Drawer (HITL) */}
          <AnimatePresence>
            {pendingAction && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                className="bg-panel2 border-2 border-amber/80 rounded-xl p-4 space-y-3 font-mono text-xs shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-amber font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber" />
                  <span>WRITE ACTION CONFIRMATION REQUIRED</span>
                </div>
                <p className="text-ink text-xs leading-relaxed font-body">
                  {pendingAction.description}
                </p>
                <div className="bg-bg/80 p-3 rounded-lg border border-line text-[11px] text-muted space-y-1">
                  <p><span className="text-teal font-semibold">Tool:</span> {pendingAction.tool_name}</p>
                  <p><span className="text-teal font-semibold">Target Parameters:</span> {JSON.stringify(pendingAction.arguments)}</p>
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

          <div ref={bottomRef} />

        </div>

        {/* Multi-line Input Box */}
        <div className="p-4 border-t border-line bg-panel">
          <div className="flex items-end gap-3 bg-panel2 border border-line rounded-lg p-2 focus-within:border-teal transition">
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
                className={`p-2 rounded text-sm transition ${listening ? "bg-crit text-ink animate-pulse" : "text-muted hover:text-ink"}`}
                title="Voice input mic"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-amber text-base font-semibold px-4 py-2 rounded text-xs font-mono hover:brightness-110 transition disabled:opacity-40 flex items-center gap-1"
            >
              <span>{sending ? "Analyzing..." : "Send Query"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Right Inspector Column: Context & Reasoning (320px) ───────── */}
      <div className="w-80 border-l border-line bg-panel p-5 flex flex-col overflow-y-auto space-y-6">
        <div>
          <h3 className="font-display text-lg text-ink mb-1">Context Inspector</h3>
          <p className="text-muted text-xs font-mono">
            Click any AI response in the main thread to view its exact reasoning path and source citations.
          </p>
        </div>

        {!focusedMessage ? (
          <div className="border border-line rounded p-4 text-center text-muted text-xs font-mono bg-panel2">
            No response selected. Click an AI response to inspect citations.
          </div>
        ) : (
          <>
            {/* AI Reasoning Pipeline */}
            <div>
              <p className="font-mono text-xs text-teal uppercase font-semibold mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Execution Reasoning Steps</span>
              </p>
              {!focusedMessage.reasoning_steps || focusedMessage.reasoning_steps.length === 0 ? (
                <p className="text-muted text-xs font-mono">No recorded reasoning steps.</p>
              ) : (
                <div className="space-y-2 bg-panel2 border border-line rounded p-3 text-xs font-mono">
                  {focusedMessage.reasoning_steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber">›</span>
                      <span className="text-ink text-[11px] leading-tight">{st}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Retrieved Source Case Citations */}
            <div>
              <p className="font-mono text-xs text-amber uppercase font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Source Case Citations ({focusedSources.length})</span>
              </p>

              {focusedSources.length === 0 ? (
                <p className="text-muted text-xs font-mono">No direct sources cited for this reply.</p>
              ) : (
                <div className="space-y-3">
                  {focusedSources.map((src, i) => (
                    <div key={i} className="bg-panel2 border border-line rounded p-3 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-teal font-bold">{src.case_code}</span>
                        <span className="text-amber text-[10px]">{(src.score * 100).toFixed(0)}% match</span>
                      </div>

                      <span className="inline-block text-[10px] uppercase px-1.5 py-0.5 rounded bg-panel border border-line text-muted">
                        Match: {src.match_type}
                      </span>

                      <p className="text-muted text-[11px] leading-normal line-clamp-3 bg-bg/50 p-2 rounded border border-line/40">
                        "{src.snippet}"
                      </p>

                      <Link
                        to={`/cases/${src.case_id}`}
                        target="_blank"
                        className="text-teal hover:underline text-[11px] block text-right pt-1 font-semibold"
                      >
                        <span>Open Case File</span> &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
