import { useMemo, useState, useEffect } from "react";
import {
  Activity, Archive, ArrowLeft, Bell, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Inbox, Mail,
  MailCheck, Menu, Moon, MoreHorizontal, Plus, Search, Send,
  Settings2, Sparkles, Star, Sun, Trash2, Users, WandSparkles,
  X, RefreshCw, Edit3, LayoutDashboard
} from "lucide-react";
import "./index.css";

const CATEGORIES = [
  "Assistant to Reply",
  "Client to Reply",
  "No Reply Needed",
  "Needs Review",
];

const initialEmails = [
  {
    id: 1,
    sender: "Ananya Sharma",
    email: "ananya@northstar.design",
    subject: "Updated proposal for the website redesign",
    preview: "Hi team, I've attached the revised proposal with the updated timelines. Please review the changes.",
    time: "10:42 AM",
    day: "Today",
    category: "Client to Reply",
    initials: "AS",
    color: "peach",
    unread: true,
    important: true,
    summary: "Ananya has shared a revised website redesign proposal and needs confirmation on the updated delivery timeline.",
    draft: "Hi Ananya,\n\nThanks for sharing the revised proposal. I've reviewed the updates and will confirm the remaining details with the team shortly.\n\nBest regards",
  },
  {
    id: 2,
    sender: "Rahul Mehta",
    email: "rahul@brightlabs.io",
    subject: "Quick question about our Friday call",
    preview: "Would it be possible to move our discussion to 3 PM instead?",
    time: "9:58 AM",
    day: "Today",
    category: "Assistant to Reply",
    initials: "RM",
    color: "blue",
    unread: true,
    important: false,
    summary: "Rahul wants to reschedule Friday's call to 3 PM. Check your calendar before confirming.",
    draft: "Hi Rahul,\n\nThanks for checking. I'll review the calendar and confirm whether 3 PM works for everyone.\n\nBest regards",
  },
  {
    id: 3,
    sender: "Priya Kapoor",
    email: "priya@studioform.in",
    subject: "Brand assets — final files",
    preview: "Everything is ready! Sharing the final brand assets for your review.",
    time: "9:21 AM",
    day: "Today",
    category: "No Reply Needed",
    initials: "PK",
    color: "lavender",
    unread: false,
    important: false,
    summary: "Priya has delivered the final brand assets. This is an informational update and does not require a reply.",
    draft: "",
  },
  {
    id: 4,
    sender: "Arjun Verma",
    email: "arjun@orbitworks.co",
    subject: "Invoice #1048 — payment confirmation",
    preview: "Just confirming that the payment has been processed successfully.",
    time: "Yesterday",
    day: "Yesterday",
    category: "No Reply Needed",
    initials: "AV",
    color: "green",
    unread: false,
    important: false,
    summary: "Arjun confirms that invoice #1048 has been paid. No response is necessary unless you need a receipt.",
    draft: "",
  },
  {
    id: 5,
    sender: "Neha from PixelCraft",
    email: "neha@pixelcraft.studio",
    subject: "Could you share your availability?",
    preview: "We'd love to schedule a quick project kickoff next week.",
    time: "Yesterday",
    day: "Yesterday",
    category: "Client to Reply",
    initials: "NP",
    color: "pink",
    unread: true,
    important: true,
    summary: "Neha wants to schedule a project kickoff next week. Share a few suitable time slots.",
    draft: "Hi Neha,\n\nThanks for reaching out! I'd be happy to schedule a kickoff next week. I'll check my availability and share a few suitable time slots with you.\n\nBest regards",
  },
  {
    id: 6,
    sender: "Saarthi Daily Brief",
    email: "brief@saarthi.example",
    subject: "Your daily inbox summary",
    preview: "You have 3 emails that need attention today.",
    time: "Yesterday",
    day: "Yesterday",
    category: "Assistant to Reply",
    initials: "SD",
    color: "gold",
    unread: false,
    important: false,
    summary: "Your daily brief highlights emails requiring attention. Review the priority messages first.",
    draft: "Review today's priority emails and prepare the required responses.",
  },
  {
    id: 7,
    sender: "Karan Malhotra",
    email: "karan@novastack.dev",
    subject: "Need clarification on the requirements",
    preview: "Could you clarify the final deliverables before we move ahead?",
    time: "Yesterday",
    day: "Yesterday",
    category: "Needs Review",
    initials: "KM",
    color: "orange",
    unread: true,
    important: false,
    summary: "The sender needs clarification about the final deliverables. Review the project requirements before responding.",
    draft: "Hi Karan,\n\nThanks for reaching out. I'll review the requirements and get back to you with clarification.\n\nBest regards",
  },
];

const folderIcons = {
  "All Mail": Inbox,
  "Assistant to Reply": Sparkles,
  "Client to Reply": Users,
  "No Reply Needed": MailCheck,
  "Needs Review": CircleHelp,
  Starred: Star,
  Archived: Archive,
};

function App() {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedId, setSelectedId] = useState(1);
  const [activeFolder, setActiveFolder] = useState("All Mail");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("All time");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [draft, setDraft] = useState(initialEmails[0].draft);
  const [editing, setEditing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [aiLoading, setAiLoading] = useState("");
  const [aiError, setAiError] = useState("");
  const [notice, setNotice] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedIds, setArchivedIds] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);

  const selectedEmail = emails.find((email) => email.id === selectedId);

  useEffect(() => {
    setDraft(selectedEmail?.draft || "");
    setEditing(false);
    setAiError("");
  }, [selectedId]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setComposeOpen(false);
        setDateMenuOpen(false);
        setMobileDetail(false);
      }

      if (
        event.key.toLowerCase() === "c" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName
        ) &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        setComposeOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function toast(message) {
    setNotice(message);
  }

  function updateEmail(id, changes) {
    setEmails((current) =>
      current.map((email) =>
        email.id === id ? { ...email, ...changes } : email
      )
    );
  }

  function resetFilters() {
    setSearch("");
    setDateRange("All time");
    setActiveFolder("All Mail");
    setShowArchived(false);
    setDateMenuOpen(false);
  }

  const visibleEmails = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = emails.filter((email) => {
      if (deletedIds.includes(email.id)) return false;

      const isArchived = archivedIds.includes(email.id);

      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;

      const folderMatch =
        activeFolder === "All Mail" ||
        (activeFolder === "Starred" && email.important) ||
        email.category === activeFolder;

      const searchMatch =
        !query ||
        [
          email.sender,
          email.email,
          email.subject,
          email.preview,
          email.category,
        ].some((value) => String(value || "").toLowerCase().includes(query));

      const dateMatch =
        dateRange === "All time" ||
        email.day === dateRange;

      return folderMatch && searchMatch && dateMatch;
    });

    return result.sort((a, b) =>
      sortNewest ? b.id - a.id : a.id - b.id
    );
  }, [
    emails,
    activeFolder,
    search,
    dateRange,
    archivedIds,
    deletedIds,
    showArchived,
    sortNewest,
  ]);

  function selectEmail(email) {
    setSelectedId(email.id);
    setDraft(email.draft || "");
    setEditing(false);
    setAiError("");
    setMobileDetail(true);

    if (email.unread) {
      updateEmail(email.id, { unread: false });
    }
  }

  function chooseFolder(folder) {
    setActiveFolder(folder);
    setShowArchived(false);
    setMobileDetail(false);
  }

  function openArchived() {
    setShowArchived(true);
    setActiveFolder("All Mail");
    setMobileDetail(false);
  }

  function archiveEmail() {
    if (!selectedEmail) return;

    setArchivedIds((ids) =>
      [...new Set([...ids, selectedEmail.id])]
    );
    setMobileDetail(false);
    toast("Email archived");
  }

  function restoreEmail() {
    if (!selectedEmail) return;

    setArchivedIds((ids) =>
      ids.filter((id) => id !== selectedEmail.id)
    );
    setShowArchived(false);
    setActiveFolder("All Mail");
    setMobileDetail(false);
    toast("Email restored to inbox");
  }

  function deleteEmail() {
    if (!selectedEmail) return;

    setDeletedIds((ids) =>
      [...new Set([...ids, selectedEmail.id])]
    );
    setMobileDetail(false);
    toast("Email moved to demo trash");
  }

  function toggleStar(email) {
    updateEmail(email.id, { important: !email.important });
    toast(email.important ? "Removed from starred" : "Added to starred");
  }

  function saveDraft() {
    if (!selectedEmail) return;

    updateEmail(selectedEmail.id, { draft });
    setEditing(false);
    toast("Draft saved locally");
  }

  
  async function callAI(kind) {
    if (!selectedEmail || aiLoading) return;

    setAiLoading(kind);
    setAiError("");

    try {
      const endpoint = kind === "summary" ? "summarize" : "reply";

      const payload = {
        emailText: [
          `From: ${selectedEmail.sender} <${selectedEmail.email}>`,
          `Subject: ${selectedEmail.subject}`,
          "",
          selectedEmail.preview,
        ].join("\n"),
        tone: "professional",
      };

      const response = await fetch(
        `https://saarthi-maildesk-api.onrender.com/api/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.details ||
          data.error ||
          `AI service returned ${response.status}`
        );
      }

      if (kind === "summary") {
        if (!data.summary) {
          throw new Error("AI returned an empty summary.");
        }

        updateEmail(selectedEmail.id, {
          summary: data.summary,
        });

        toast("AI summary updated");
      } else {
        if (!data.reply) {
          throw new Error("AI returned an empty reply.");
        }

        setDraft(data.reply);
        updateEmail(selectedEmail.id, {
          draft: data.reply,
        });
        setEditing(true);

        toast("AI reply generated — review it before use");
      }
    } catch (error) {
      setAiError(
        error.message ||
        "Could not connect to the AI service. Please try again."
      );
    } finally {
      setAiLoading("");
    }
  }


  function createDemoEmail(event) {
    event.preventDefault();

    if (!composeTo.trim() || !composeSubject.trim()) {
      toast("Please enter a recipient and subject");
      return;
    }

    const recipient = composeTo.trim();
    const fresh = {
      id: Date.now(),
      sender: recipient,
      email: recipient.includes("@")
        ? recipient
        : "new-contact@example.com",
      subject: composeSubject.trim(),
      preview: composeBody.trim() || "No message content",
      time: "Just now",
      day: "Today",
      category: "Needs Review",
      initials: recipient
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      color: "lavender",
      unread: false,
      important: false,
      summary:
        "New locally created demo message. Review its content before taking action.",
      draft: "",
    };

    setEmails((current) => [fresh, ...current]);
    setSelectedId(fresh.id);
    setActiveFolder("All Mail");
    setDateRange("All time");
    setShowArchived(false);
    setComposeOpen(false);
    setMobileDetail(true);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setEditing(false);

    toast("Demo message created locally — not sent");
  }

  const count = (category) =>
    emails.filter(
      (email) =>
        !deletedIds.includes(email.id) &&
        !archivedIds.includes(email.id) &&
        (category === "All Mail" || email.category === category)
    ).length;

  const unreadCount = emails.filter(
    (email) =>
      email.unread &&
      !deletedIds.includes(email.id) &&
      !archivedIds.includes(email.id)
  ).length;

  const currentEmailVisible =
    selectedEmail &&
    !deletedIds.includes(selectedEmail.id) &&
    (showArchived
      ? archivedIds.includes(selectedEmail.id)
      : !archivedIds.includes(selectedEmail.id));

  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <aside
        className={`sidebar ${
          sidebarOpen ? "" : "sidebar-collapsed"
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>

          {sidebarOpen && (
            <div className="brand-copy">
              <h1>Saarthi<span>.</span></h1>
              <p>AI MAILDESK</p>
            </div>
          )}

          <button
            type="button"
            className="icon-button sidebar-toggle"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu size={18} />
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button
              type="button"
              className="compose-button"
              onClick={() => setComposeOpen(true)}
            >
              <Plus size={18} />
              Compose email
              <span className="compose-shortcut">C</span>
            </button>

            <div className="sidebar-label">WORKSPACE</div>

            <nav className="folder-nav">
              {["All Mail", ...CATEGORIES].map((folder) => {
                const Icon = folderIcons[folder] || Inbox;

                return (
                  <button
                    type="button"
                    key={folder}
                    className={`folder-link ${
                      activeFolder === folder && !showArchived
                        ? "active"
                        : ""
                    }`}
                    onClick={() => chooseFolder(folder)}
                  >
                    <Icon size={17} />
                    <span>{folder}</span>
                    <span className="folder-count">{count(folder)}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`folder-link ${
                  activeFolder === "Starred" && !showArchived
                    ? "active"
                    : ""
                }`}
                onClick={() => chooseFolder("Starred")}
              >
                <Star size={17} />
                <span>Starred</span>
                <span className="folder-count">
                  {
                    emails.filter(
                      (email) =>
                        email.important &&
                        !archivedIds.includes(email.id) &&
                        !deletedIds.includes(email.id)
                    ).length
                  }
                </span>
              </button>

              <button
                type="button"
                className={`folder-link ${
                  showArchived ? "active" : ""
                }`}
                onClick={openArchived}
              >
                <Archive size={17} />
                <span>Archived</span>
                <span className="folder-count">
                  {
                    archivedIds.filter(
                      (id) => !deletedIds.includes(id)
                    ).length
                  }
                </span>
              </button>
            </nav>

            <div className="sidebar-label">WORKSPACE TOOLS</div>

            <button
              type="button"
              className="folder-link"
              onClick={() =>
                toast(
                  "AI activity: use Generate summary or Generate with AI inside an email."
                )
              }
            >
              <Activity size={17} />
              <span>AI activity</span>
            </button>

            <button
              type="button"
              className="folder-link"
              onClick={() => {
                resetFilters();
                toast("Filters reset");
              }}
            >
              <RefreshCw size={17} />
              <span>Reset filters</span>
            </button>

            <div className="sidebar-bottom">
              <div className="usage-card">
                <div className="usage-heading">
                  <span className="usage-icon">
                    <WandSparkles size={16} />
                  </span>
                  <span>AI workspace</span>
                  <span className="live-dot" />
                </div>

                <p>Review AI suggestions before acting.</p>

                <div className="usage-progress">
                  <span />
                </div>

                <small>Demo workspace · Local sample data</small>
              </div>

              <button
                type="button"
                className="folder-link"
                onClick={() => setDark((value) => !value)}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                <span>
                  {dark ? "Light appearance" : "Dark appearance"}
                </span>
              </button>

              <button
                type="button"
                className="folder-link"
                onClick={() =>
                  toast(
                    "Saarthi MailDesk demo · AI uses your local backend on port 5000."
                  )
                }
              >
                <CircleHelp size={17} />
                <span>Help & support</span>
              </button>

              <div className="profile-row">
                <div className="profile-avatar">DM</div>
                <div className="profile-copy">
                  <strong>Divyansh</strong>
                  <span>Personal workspace</span>
                </div>
                <MoreHorizontal size={18} />
              </div>
            </div>
          </>
        )}
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {showArchived ? "Archived" : activeFolder}
            </strong>
          </div>

          <div className="topbar-actions">
            <span className="connection-status">
              <span className="status-dot" />
              Demo workspace
            </span>

            <button
              type="button"
              className="icon-button"
              title="Notifications"
              aria-label="Notifications"
              onClick={() =>
                toast(`${unreadCount} unread sample emails`)
              }
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="notification-dot" />
              )}
            </button>

            <button
              type="button"
              className="top-avatar"
              title="Toggle appearance"
              aria-label="Toggle appearance"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Sun size={17} /> : "D"}
            </button>
          </div>
        </header>

        <section className="dashboard-heading">
          <div>
            <div className="eyebrow">
              <span />
              YOUR COMMAND CENTER
            </div>

            <h2>
              Good evening, Divyansh <span className="wave">✳</span>
            </h2>

            <p>Less inbox noise. More focus on what matters.</p>
          </div>

          <div className="date-picker-container">
            <button
              type="button"
              className="date-button"
              aria-expanded={dateMenuOpen}
              onClick={() => setDateMenuOpen((open) => !open)}
            >
              <Clock3 size={16} />
              {dateRange}
              <ChevronDown size={15} />
            </button>

            {dateMenuOpen && (
              <div className="date-dropdown">
                {["Today", "Yesterday", "All time"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`date-dropdown-option ${
                      dateRange === option ? "date-option-active" : ""
                    }`}
                    onClick={() => {
                      setDateRange(option);
                      setDateMenuOpen(false);
                    }}
                  >
                    {option}
                    {dateRange === option && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon stat-indigo">
                <Inbox size={19} />
              </span>
              <span className="stat-trend">Workspace</span>
            </div>
            <div className="stat-number">{count("All Mail")}</div>
            <div className="stat-label">Emails in inbox</div>
            <div className="stat-foot">Sample conversations</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon stat-orange">
                <Users size={19} />
              </span>
              <span className="stat-trend trend-orange">Priority</span>
            </div>
            <div className="stat-number">
              {count("Client to Reply")}
            </div>
            <div className="stat-label">Client replies needed</div>
            <div className="stat-foot">
              Keep conversations moving
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon stat-purple">
                <Sparkles size={19} />
              </span>
              <span className="stat-trend">AI assisted</span>
            </div>
            <div className="stat-number">
              {count("Assistant to Reply")}
            </div>
            <div className="stat-label">Assistant to reply</div>
            <div className="stat-foot">Drafts ready for review</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon stat-green">
                <MailCheck size={19} />
              </span>
              <span className="stat-trend trend-green">
                Organized
              </span>
            </div>
            <div className="stat-number">
              {count("No Reply Needed")}
            </div>
            <div className="stat-label">No reply needed</div>
            <div className="stat-foot">Less inbox noise</div>
          </div>
        </section>

        <section
          className={`workspace-grid ${
            mobileDetail ? "show-detail-mobile" : ""
          }`}
        >
          <div className="email-panel">
            <div className="panel-heading">
              <div>
                <h3>
                  {showArchived ? "Archived emails" : "Inbox overview"}
                </h3>
                <p>Find the right conversation, faster.</p>
              </div>

              <button
                type="button"
                className="icon-button subtle-button"
                title="Reset filters"
                aria-label="Reset filters"
                onClick={resetFilters}
              >
                <RefreshCw size={17} />
              </button>
            </div>

            <div className="email-toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search emails..."
                  aria-label="Search emails"
                />

                {search && (
                  <button
                    type="button"
                    className="clear-search"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className="filter-button"
                onClick={resetFilters}
              >
                <Settings2 size={15} />
                <span>Reset</span>
              </button>
            </div>

            <div className="filter-tabs">
              {[
                "All Mail",
                "Client to Reply",
                "Assistant to Reply",
                "Needs Review",
              ].map((folder) => (
                <button
                  type="button"
                  key={folder}
                  className={
                    activeFolder === folder && !showArchived
                      ? "selected"
                      : ""
                  }
                  onClick={() => chooseFolder(folder)}
                >
                  {folder === "All Mail"
                    ? "All"
                    : folder === "Client to Reply"
                    ? "Clients"
                    : folder === "Assistant to Reply"
                    ? "Assistant"
                    : "Review"}
                </button>
              ))}
            </div>

            <div className="list-caption">
              <span>{visibleEmails.length} conversations</span>
              <button
                type="button"
                onClick={() => setSortNewest((value) => !value)}
              >
                {sortNewest ? "Newest first" : "Oldest first"}
                <ChevronDown size={13} />
              </button>
            </div>

            <div className="email-list">
              {visibleEmails.map((email) => (
                <div
                  key={email.id}
                  className={`email-item ${
                    selectedId === email.id ? "email-selected" : ""
                  } ${email.unread ? "email-unread" : ""}`}
                >
                  <button
                    type="button"
                    className="email-open"
                    onClick={() => selectEmail(email)}
                  >
                    <div
                      className={`sender-avatar avatar-${email.color}`}
                    >
                      {email.initials}
                    </div>

                    <div className="email-content">
                      <div className="email-sender-row">
                        <span
                          className={`email-sender ${
                            email.unread ? "unread" : ""
                          }`}
                        >
                          {email.sender}
                        </span>
                        <span className="email-time">{email.time}</span>
                      </div>

                      <div
                        className={`email-subject ${
                          email.unread ? "unread" : ""
                        }`}
                      >
                        {email.subject}
                      </div>

                      <p className="email-preview">{email.preview}</p>

                      <div className="email-item-footer">
                        <span
                          className={`category-pill ${
                            email.category === "Client to Reply"
                              ? "pill-client"
                              : email.category === "Assistant to Reply"
                              ? "pill-assistant"
                              : email.category === "Needs Review"
                              ? "pill-review"
                              : "pill-neutral"
                          }`}
                        >
                          {email.category}
                        </span>

                        {email.unread && (
                          <span className="unread-dot" />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`email-star ${
                      email.important ? "star-filled" : ""
                    }`}
                    title={email.important ? "Unstar" : "Star"}
                    aria-label={email.important ? "Unstar email" : "Star email"}
                    onClick={() => toggleStar(email)}
                  >
                    <Star
                      size={16}
                      fill={email.important ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              ))}

              {visibleEmails.length === 0 && (
                <div className="empty-state">
                  <Search size={27} />
                  <strong>No emails found</strong>
                  <p>Try another search, folder, or date range.</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="list-footer">
              <span>Demo inbox · Sample data</span>
              <span>{visibleEmails.length} shown</span>
            </div>
          </div>

          <div className="detail-panel">
            {currentEmailVisible ? (
              <>
                <div className="detail-toolbar">
                  <button
                    type="button"
                    className="back-to-list"
                    onClick={() => setMobileDetail(false)}
                  >
                    <ChevronLeft size={17} />
                    Inbox
                  </button>

                  <div className="detail-toolbar-actions">
                    <button
                      type="button"
                      className="icon-button"
                      title={
                        selectedEmail.unread
                          ? "Mark read"
                          : "Mark unread"
                      }
                      aria-label={
                        selectedEmail.unread
                          ? "Mark read"
                          : "Mark unread"
                      }
                      onClick={() => {
                        updateEmail(selectedEmail.id, {
                          unread: !selectedEmail.unread,
                        });
                        toast(
                          selectedEmail.unread
                            ? "Marked as read"
                            : "Marked as unread"
                        );
                      }}
                    >
                      <Mail size={17} />
                    </button>

                    <button
                      type="button"
                      className={`icon-button ${
                        selectedEmail.important ? "star-filled" : ""
                      }`}
                      title="Toggle star"
                      aria-label="Toggle star"
                      onClick={() => toggleStar(selectedEmail)}
                    >
                      <Star
                        size={17}
                        fill={
                          selectedEmail.important
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    {showArchived ? (
                      <button
                        type="button"
                        className="icon-button"
                        title="Restore email"
                        aria-label="Restore email"
                        onClick={restoreEmail}
                      >
                        <ArrowLeft size={17} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="icon-button"
                        title="Archive email"
                        aria-label="Archive email"
                        onClick={archiveEmail}
                      >
                        <Archive size={17} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="icon-button"
                      title="Delete email"
                      aria-label="Delete email"
                      onClick={deleteEmail}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="message-detail">
                  <div className="message-category-row">
                    <span className="message-label">
                      <Mail size={13} />
                      MESSAGE DETAILS
                    </span>
                    <span className="ai-confidence">
                      <Sparkles size={12} />
                      AI assisted
                    </span>
                  </div>

                  <h3 className="message-title">
                    {selectedEmail.subject}
                  </h3>

                  <div className="sender-detail">
                    <div
                      className={`sender-avatar sender-avatar-large avatar-${selectedEmail.color}`}
                    >
                      {selectedEmail.initials}
                    </div>

                    <div className="sender-detail-copy">
                      <strong>{selectedEmail.sender}</strong>
                      <span>{selectedEmail.email}</span>
                    </div>

                    <span className="message-time">
                      {selectedEmail.time}
                    </span>
                  </div>

                  <div className="message-body">
                    <p>{selectedEmail.preview}</p>
                    <p>Let me know if you need any additional details.</p>
                    <p>
                      Best regards,
                      <br />
                      {(selectedEmail.sender || "there").split(" ")[0]}
                    </p>
                  </div>

                  <div className="classification-card">
                    <div className="classification-header">
                      <div className="classification-title">
                        <span className="classification-sparkle">
                          <WandSparkles size={17} />
                        </span>
                        <div>
                          <strong>AI classification</strong>
                          <span>Suggested next action</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-button"
                        disabled={!!aiLoading}
                        onClick={() => callAI("summary")}
                      >
                        <Sparkles size={14} />
                        {aiLoading === "summary"
                          ? "Summarizing..."
                          : "Generate summary"}
                      </button>
                    </div>

                    <p className="classification-description">
                      {selectedEmail.summary}
                    </p>

                    {aiError && (
                      <p className="ai-error" role="alert">
                        {aiError}
                      </p>
                    )}

                    <label
                      className="select-label"
                      htmlFor="category-select"
                    >
                      EMAIL CATEGORY
                    </label>

                    <div className="classification-select-wrap">
                      <select
                        id="category-select"
                        value={selectedEmail.category}
                        onChange={(event) => {
                          updateEmail(selectedEmail.id, {
                            category: event.target.value,
                          });
                          toast("Category updated");
                        }}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} />
                    </div>

                    <p className="classification-note">
                      <Check size={13} />
                      You can change this classification anytime.
                    </p>
                  </div>

                  {selectedEmail.category !== "No Reply Needed" ? (
                    <div className="draft-card">
                      <div className="draft-header">
                        <div className="draft-title">
                          <div className="draft-icon">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <strong>Suggested reply</strong>
                            <span>AI draft · Review before use</span>
                          </div>
                        </div>

                        <div className="draft-header-actions">
                          <button
                            type="button"
                            className="text-button"
                            disabled={!!aiLoading}
                            onClick={() => callAI("reply")}
                          >
                            <Sparkles size={13} />
                            {aiLoading === "reply"
                              ? "Generating..."
                              : "Generate with AI"}
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setEditing((value) => !value)}
                          >
                            <Edit3 size={13} />
                            {editing ? "Cancel" : "Edit"}
                          </button>
                        </div>
                      </div>

                      {editing ? (
                        <textarea
                          className="draft-editor"
                          value={draft}
                          onChange={(event) =>
                            setDraft(event.target.value)
                          }
                          rows={7}
                          aria-label="Edit suggested reply"
                        />
                      ) : (
                        <div className="draft-body">
                          {draft ||
                            "No draft available. Use Generate with AI to create one."}
                        </div>
                      )}

                      <div className="draft-footer">
                        <span>
                          <Clock3 size={13} />
                          Not sent
                        </span>

                        <div className="draft-actions">
                          {editing && (
                            <button
                              type="button"
                              className="save-draft-button"
                              onClick={saveDraft}
                            >
                              <Check size={14} />
                              Save draft
                            </button>
                          )}

                          <button
                            type="button"
                            className="send-button"
                            onClick={() =>
                              toast(
                                "Demo only — connect an email provider to send real emails"
                              )
                            }
                          >
                            <Send size={14} />
                            Send reply
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-reply-card">
                      <div className="no-reply-icon">
                        <Check size={18} />
                      </div>
                      <div>
                        <strong>No reply needed</strong>
                        <p>
                          This email can be archived or kept for reference.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="detail-bottom-note">
                    <Sparkles size={13} />
                    <span>
                      AI suggestions are examples. Review before acting.
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-detail">
                <div className="empty-detail-icon">
                  <LayoutDashboard size={27} />
                </div>
                <h3>Select a conversation</h3>
                <p>
                  Choose an email from your inbox to view its details and
                  AI suggestions.
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setComposeOpen(true)}
                >
                  <Plus size={15} />
                  Compose email
                </button>
              </div>
            )}
          </div>
        </section>

        <footer className="app-footer">
          <span>
            <span className="footer-mark">✳</span> Saarthi MailDesk
          </span>
          <span>Thoughtful communication, powered by AI</span>
        </footer>
      </main>

      {composeOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setComposeOpen(false);
            }
          }}
        >
          <form className="compose-modal" onSubmit={createDemoEmail}>
            <div className="compose-modal-heading">
              <div>
                <span className="compose-modal-icon">
                  <Edit3 size={17} />
                </span>
                <strong>Compose email</strong>
                <p>Create a local demo message</p>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Close compose window"
                onClick={() => setComposeOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <label>
              To
              <input
                autoFocus
                value={composeTo}
                onChange={(event) => setComposeTo(event.target.value)}
                placeholder="name@example.com"
              />
            </label>

            <label>
              Subject
              <input
                value={composeSubject}
                onChange={(event) =>
                  setComposeSubject(event.target.value)
                }
                placeholder="Enter email subject"
              />
            </label>

            <label>
              Message
              <textarea
                value={composeBody}
                onChange={(event) => setComposeBody(event.target.value)}
                rows={6}
                placeholder="Write your message..."
              />
            </label>

            <div className="compose-modal-footer">
              <span>Demo only · Not sent to anyone</span>
              <button className="send-button" type="submit">
                <Plus size={15} />
                Create draft
              </button>
            </div>
          </form>
        </div>
      )}

      {notice && (
        <div className="toast-message" role="status">
          <Check size={16} />
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;