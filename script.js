const CATEGORY_DEFINITIONS = [
  {
    id: "backend",
    label: "Backend",
    tools: [
      "node.js",
      "express",
      "postgresql",
      "rest api",
      "python",
      "flask",
      "java",
      "spring boot",
      "maven",
      "jpa",
      "mongodb",
      "mongoose",
      "sqlite",
      "typescript",
      "webauthn",
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    tools: ["react", "javascript", "vite", "webpack", "html", "jinja", "css"],
  },
  {
    id: "ai",
    label: "AI / Conversational",
    tools: ["rasa", "tensorflow", "nlu", "custom actions"],
  },
  {
    id: "mobile",
    label: "Mobile",
    tools: [
      "android",
      "gradle",
      "firebase auth",
      "firebase realtime database",
      "google maps api",
      "volley",
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    tools: ["azure", "cloud docs", "infrastructure"],
  },
  {
    id: "systems",
    label: "Systems",
    tools: ["c", "fuse", "make", "linux filesystems"],
  },
];

const STATUS_META = {
  working: { label: "Working", className: "status-working" },
};

const state = {
  data: null,
  search: "",
  activeCategory: "all",
  tools: new Set(),
  activeProjectIndex: null,
  contactWired: false,
  cardTiltWired: false,
  revealObserver: null,
};

const el = {
  name: document.getElementById("name"),
  tagline: document.getElementById("tagline"),
  heroMeta: document.getElementById("heroMeta"),
  heroContact: document.getElementById("heroContact"),
  resumeButton: document.getElementById("resumeButton"),
  emailButton: document.getElementById("emailButton"),
  profilePhoto: document.getElementById("profilePhoto"),
  aboutText: document.getElementById("aboutText"),
  focusList: document.getElementById("focusList"),
  socialLinks: document.getElementById("socialLinks"),
  topTools: document.getElementById("topTools"),
  skillSignals: document.getElementById("skillSignals"),
  toolConstellation: document.getElementById("toolConstellation"),
  searchInput: document.getElementById("searchInput"),
  skillFilters: document.getElementById("skillFilters"),
  toolFilters: document.getElementById("toolFilters"),
  resultsCount: document.getElementById("resultsCount"),
  projectGrid: document.getElementById("projectGrid"),
  emptyState: document.getElementById("emptyState"),
  contactForm: document.getElementById("contactForm"),
  contactLead: document.getElementById("contactLead"),
  contactHint: document.getElementById("contactHint"),
  modal: document.getElementById("projectModal"),
  modalClose: document.getElementById("modalClose"),
  modalKind: document.getElementById("modalKind"),
  modalTitle: document.getElementById("modalTitle"),
  modalSummary: document.getElementById("modalSummary"),
  modalPath: document.getElementById("modalPath"),
  modalStatus: document.getElementById("modalStatus"),
  modalTools: document.getElementById("modalTools"),
  modalHighlights: document.getElementById("modalHighlights"),
  modalLinks: document.getElementById("modalLinks"),
};

async function init() {
  try {
    const response = await fetch("./data/portfolio.json");
    if (!response.ok) throw new Error("Could not load portfolio data");

    state.data = await response.json();
    wireEvents();
    wireCardTilt();
    wireRevealObserver();
    renderEverything();
    observeRevealTargets();
  } catch (error) {
    el.name.textContent = "Portfolio data could not be loaded";
    el.tagline.textContent = String(error.message || error);
  }
}

function wireEvents() {
  el.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderProjects();
  });

  el.projectGrid.addEventListener("click", (event) => {
    const detailsButton = event.target.closest("[data-project-index]");
    if (!detailsButton) return;
    const index = Number(detailsButton.dataset.projectIndex);
    if (Number.isNaN(index)) return;
    openProjectModal(index);
  });

  el.modalClose.addEventListener("click", closeProjectModal);
  el.modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal='true']")) closeProjectModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.modal.classList.contains("hidden")) {
      closeProjectModal();
    }
  });
}

function wireCardTilt() {
  if (state.cardTiltWired) return;
  state.cardTiltWired = true;

  el.projectGrid.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltY = (px - 0.5) * 8;
    const tiltX = (0.5 - py) * 8;

    card.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
  });

  el.projectGrid.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    if (event.relatedTarget && card.contains(event.relatedTarget)) return;
    resetCardTilt(card);
  });

  el.projectGrid.addEventListener("pointerleave", () => {
    for (const card of el.projectGrid.querySelectorAll(".project-card")) {
      resetCardTilt(card);
    }
  });
}

function resetCardTilt(card) {
  card.style.setProperty("--tiltX", "0deg");
  card.style.setProperty("--tiltY", "0deg");
}

function wireRevealObserver() {
  if (state.revealObserver) return;

  if (!("IntersectionObserver" in window)) {
    for (const node of document.querySelectorAll(".reveal-section, .project-card, .skill-signal, .tool-node")) {
      node.classList.add("is-visible");
    }
    return;
  }

  state.revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        state.revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
}

function observeRevealTargets() {
  const targets = document.querySelectorAll(".reveal-section, .project-card, .skill-signal, .tool-node");
  let index = 0;

  for (const node of targets) {
    if (node.dataset.revealBound === "true") continue;
    node.dataset.revealBound = "true";
    node.style.setProperty("--reveal-delay", `${Math.min(index * 40, 420)}ms`);
    index += 1;

    if (state.revealObserver) state.revealObserver.observe(node);
    else node.classList.add("is-visible");
  }
}

function renderEverything() {
  renderHero();
  renderAbout();
  renderSkillFilters();
  renderToolFilters();
  renderSkillDashboard();
  renderProjects();
  renderContact();
}

function renderHero() {
  const { profile } = state.data;
  el.name.textContent = profile.name || "";
  el.tagline.textContent = profile.tagline || "";
  el.heroMeta.innerHTML = "";
  el.heroContact.innerHTML = "";

  const chips = [profile.role, profile.location, ...(profile.focus || [])].filter(Boolean);
  for (const chip of chips) {
    const pill = document.createElement("span");
    pill.className = "hero-chip";
    pill.textContent = chip;
    el.heroMeta.appendChild(pill);
  }

  if (profile.email) {
    const email = document.createElement("a");
    email.className = "hero-contact-chip";
    email.href = `mailto:${profile.email}`;
    email.textContent = profile.email;
    el.heroContact.appendChild(email);
  }

  if (profile.phone) {
    const phone = document.createElement("a");
    phone.className = "hero-contact-chip";
    phone.href = `tel:${profile.phone.replace(/\s+/g, "")}`;
    phone.textContent = profile.phone;
    el.heroContact.appendChild(phone);
  }

  if (profile.resume) {
    el.resumeButton.href = profile.resume;
    el.resumeButton.setAttribute("download", "");
  } else {
    el.resumeButton.classList.add("hidden");
  }

  if (profile.email) {
    el.emailButton.href = `mailto:${profile.email}`;
  } else {
    el.emailButton.classList.add("hidden");
  }

  if (profile.photo) {
    el.profilePhoto.src = profile.photo;
    el.profilePhoto.alt = `${profile.name || "Profile"} photo`;
  }
}

function renderAbout() {
  const { profile } = state.data;
  el.aboutText.textContent =
    profile.about || "Add your story in data/portfolio.json under profile.about.";
  el.focusList.innerHTML = "";
  el.socialLinks.innerHTML = "";

  for (const focusItem of profile.focus || []) {
    const item = document.createElement("li");
    item.textContent = focusItem;
    el.focusList.appendChild(item);
  }

  for (const link of profile.social || []) {
    const anchor = document.createElement("a");
    anchor.className = "social-link";
    anchor.href = link.url;
    anchor.textContent = link.label;
    if (link.url.startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }
    el.socialLinks.appendChild(anchor);
  }
}

function renderSkillFilters() {
  const categoryStats = getCategoryStats(state.data.projects);
  const activeClass = (id) => (state.activeCategory === id ? "active" : "");

  const allButton = `
    <button type="button" class="pill ${activeClass("all")}" data-skill-filter="all">
      All Skills
    </button>
  `;

  const categoryButtons = categoryStats
    .map(
      (stat) => `
      <button type="button" class="pill ${activeClass(stat.id)}" data-skill-filter="${escapeAttribute(
        stat.id
      )}">
        ${escapeHtml(stat.label)} (${stat.projectCount})
      </button>
    `
    )
    .join("");

  el.skillFilters.innerHTML = allButton + categoryButtons;

  for (const button of el.skillFilters.querySelectorAll("[data-skill-filter]")) {
    button.addEventListener("click", () => {
      const nextCategory = button.dataset.skillFilter || "all";
      state.activeCategory = nextCategory;
      renderSkillFilters();
      renderSkillDashboard();
      renderProjects();
    });
  }
}

function renderToolFilters() {
  el.toolFilters.innerHTML = "";
  const toolCounts = countTools(state.data.projects);
  const sortedTools = [...toolCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  for (const [tool, count] of sortedTools) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.tools.has(tool) ? "active" : ""}`;
    button.textContent = `${tool} (${count})`;
    button.addEventListener("click", () => {
      toggleTool(tool);
      renderToolFilters();
      renderSkillDashboard();
      renderProjects();
    });
    el.toolFilters.appendChild(button);
  }
}

function toggleTool(tool) {
  if (state.tools.has(tool)) state.tools.delete(tool);
  else state.tools.add(tool);
}

function renderSkillDashboard() {
  renderSkillSignals();
  renderToolConstellation();
  renderTopTools();
  observeRevealTargets();
}

function renderSkillSignals() {
  const stats = getCategoryStats(state.data.projects);
  if (!stats.length) {
    el.skillSignals.innerHTML = "<p class='muted'>No categorized skills available yet.</p>";
    return;
  }

  const maxCount = Math.max(...stats.map((stat) => stat.projectCount), 1);
  el.skillSignals.innerHTML = stats
    .map((stat) => {
      const strength = Math.max(8, Math.round((stat.projectCount / maxCount) * 100));
      const active = state.activeCategory === stat.id ? "active" : "";
      const topTools = stat.topTools.slice(0, 3).join(" • ");
      return `
        <button type="button" class="skill-signal ${active}" data-skill-signal="${escapeAttribute(
          stat.id
        )}">
          <div class="skill-signal-head">
            <h3>${escapeHtml(stat.label)}</h3>
            <span>${stat.projectCount} projects</span>
          </div>
          <div class="signal-track">
            <span class="signal-fill" style="--signal:${strength}%"></span>
          </div>
          <p class="signal-meta">${escapeHtml(topTools || "Growing expertise")}</p>
        </button>
      `;
    })
    .join("");

  for (const card of el.skillSignals.querySelectorAll("[data-skill-signal]")) {
    card.addEventListener("click", () => {
      state.activeCategory = card.dataset.skillSignal || "all";
      renderSkillFilters();
      renderSkillDashboard();
      renderProjects();
    });
  }
}

function renderToolConstellation() {
  const topTools = [...countTools(state.data.projects).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18);

  if (!topTools.length) {
    el.toolConstellation.innerHTML = "<p class='muted'>Tool graph will appear as data grows.</p>";
    return;
  }

  const max = Math.max(...topTools.map(([, count]) => count), 1);
  el.toolConstellation.innerHTML = topTools
    .map(([tool, count], index) => {
      const ratio = count / max;
      const sizeClass = ratio > 0.72 ? "size-lg" : ratio > 0.45 ? "size-md" : "size-sm";
      const active = state.tools.has(tool) ? "active" : "";
      return `
        <button
          type="button"
          class="tool-node ${sizeClass} ${active}"
          data-tool-node="${escapeAttribute(tool)}"
          style="--node-delay:${Math.min(index * 45, 540)}ms"
        >
          <span>${escapeHtml(tool)}</span>
          <em>${count}</em>
        </button>
      `;
    })
    .join("");

  for (const node of el.toolConstellation.querySelectorAll("[data-tool-node]")) {
    node.addEventListener("click", () => {
      const tool = node.dataset.toolNode || "";
      if (!tool) return;
      toggleTool(tool);
      renderToolFilters();
      renderToolConstellation();
      renderProjects();
      observeRevealTargets();
    });
  }
}

function renderTopTools() {
  const toolCounts = [...countTools(state.data.projects).entries()].sort((a, b) => b[1] - a[1]);
  const max = toolCounts.length ? toolCounts[0][1] : 1;
  const top = toolCounts.slice(0, 8);

  if (top.length === 0) {
    el.topTools.innerHTML = "<p class='muted'>No tool data yet.</p>";
    return;
  }

  el.topTools.innerHTML = top
    .map(([tool, count]) => {
      const width = Math.max(10, Math.round((count / max) * 100));
      return `
        <div class="tool-row">
          <div class="tool-row-head">
            <span>${escapeHtml(tool)}</span>
            <strong>${count}</strong>
          </div>
          <div class="tool-bar-track">
            <span class="tool-bar-fill" style="--target:${width}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderProjects() {
  const filtered = getFilteredProjects(state.data.projects);

  const filterHints = [];
  if (state.activeCategory !== "all") {
    filterHints.push(`Skill lens: ${getCategoryLabel(state.activeCategory)}`);
  }
  if (state.tools.size > 0) {
    filterHints.push(`Tools selected: ${state.tools.size}`);
  }

  el.resultsCount.textContent = filterHints.length
    ? `${filtered.length} projects in view • ${filterHints.join(" • ")}`
    : `${filtered.length} projects in view`;

  el.emptyState.classList.toggle("hidden", filtered.length > 0);
  el.projectGrid.innerHTML = filtered
    .map((project, index) => renderProjectCard(project, index))
    .join("");

  observeRevealTargets();
}

function getFilteredProjects(projects) {
  return projects
    .map((project, index) => ({ ...project, _index: index }))
    .filter((project) => {
      if (state.activeCategory !== "all" && !projectMatchesCategory(project, state.activeCategory)) {
        return false;
      }

      if (state.tools.size > 0) {
        const hasAnySelectedTool = [...state.tools].some((tool) => (project.tools || []).includes(tool));
        if (!hasAnySelectedTool) return false;
      }

      if (!state.search) return true;
      const searchBlob = [
        project.name,
        project.summary,
        project.description,
        project.path,
        project.kind,
        project.architecture,
        project.impact,
        project.note,
        ...(project.tools || []),
        ...(project.skillsShowcased || []),
        ...(project.highlights || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(state.search);
    });
}

function renderProjectCard(project, index) {
  const statusClass = STATUS_META[project.status]?.className || "status-working";
  const statusLabel = STATUS_META[project.status]?.label || "Working";
  const tools = (project.tools || [])
    .slice(0, 6)
    .map((tool) => `<span class="tool-chip">${escapeHtml(tool)}</span>`)
    .join("");

  const highlightedSkills = (project.skillsShowcased || project.tools || [])
    .slice(0, 4)
    .map((skill) => `<span class="skill-badge">${escapeHtml(skill)}</span>`)
    .join("");

  const details = (project.highlights || [])
    .slice(0, 3)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <article class="project-card" style="--delay: ${index * 55}ms">
      <div class="project-top">
        <h3 class="project-title">${escapeHtml(project.name)}</h3>
        <span class="status ${statusClass}">${escapeHtml(statusLabel)}</span>
      </div>
      <p class="project-kind">${escapeHtml(project.kind || "Project")}</p>
      <p class="project-summary">${escapeHtml(project.summary || "")}</p>
      ${
        project.description
          ? `<p class="project-description">${escapeHtml(project.description)}</p>`
          : ""
      }
      ${
        project.architecture
          ? `<p class="project-meta-line"><span>Architecture</span>${escapeHtml(project.architecture)}</p>`
          : ""
      }
      ${
        project.impact
          ? `<p class="project-meta-line"><span>Impact</span>${escapeHtml(project.impact)}</p>`
          : ""
      }
      ${details ? `<ul class="project-highlights">${details}</ul>` : ""}
      ${highlightedSkills ? `<div class="skill-badges">${highlightedSkills}</div>` : ""}
      <div class="tool-chips">${tools}</div>
      <p class="project-path">${escapeHtml(project.path || "")}</p>
      ${project.note ? `<p class="project-note">${escapeHtml(project.note)}</p>` : ""}
      <div class="card-actions">
        <button type="button" class="details-btn" data-project-index="${project._index}">
          View Deep Dive
        </button>
      </div>
    </article>
  `;
}

function renderContact() {
  const { profile } = state.data;
  const formAction = profile.contact?.formAction || "";
  const isNetlifyHost = window.location.hostname.endsWith(".netlify.app");

  el.contactLead.textContent =
    profile.contact?.lead ||
    "Have an internship, collaboration, or backend role in mind? Send me a message.";

  if (formAction) {
    el.contactForm.action = formAction;
    el.contactHint.textContent = "Form is configured with a custom endpoint.";
  } else if (isNetlifyHost) {
    el.contactHint.textContent = "Form submissions are handled by Netlify Forms.";
  } else {
    el.contactHint.textContent =
      "On GitHub Pages, this form opens your mail app by default. For hosted submissions, set profile.contact.formAction.";
  }

  if (!state.contactWired) {
    state.contactWired = true;
    el.contactForm.addEventListener("submit", (event) => {
      const activeFormAction = profile.contact?.formAction || "";
      const onNetlify = window.location.hostname.endsWith(".netlify.app");
      if (activeFormAction || onNetlify) return;

      event.preventDefault();
      const formData = new FormData(el.contactForm);
      const name = (formData.get("name") || "").toString();
      const sender = (formData.get("email") || "").toString();
      const subject = (formData.get("subject") || "Portfolio Contact").toString();
      const message = (formData.get("message") || "").toString();
      const body = `Name: ${name}\nEmail: ${sender}\n\n${message}`;
      const mailto = `mailto:${encodeURIComponent(profile.email || "")}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }
}

function openProjectModal(projectIndex) {
  const project = state.data.projects[projectIndex];
  if (!project) return;

  state.activeProjectIndex = projectIndex;
  const statusClass = STATUS_META[project.status]?.className || "status-working";
  const statusLabel = STATUS_META[project.status]?.label || "Working";

  el.modalKind.textContent = project.kind || "Project";
  el.modalTitle.textContent = project.name;
  el.modalSummary.textContent = project.description || project.summary || "";
  el.modalPath.textContent = project.path || "";
  el.modalStatus.innerHTML = `<span class="status ${statusClass}">${escapeHtml(statusLabel)}</span>`;
  el.modalTools.innerHTML = (project.tools || [])
    .map((tool) => `<span class="tool-chip">${escapeHtml(tool)}</span>`)
    .join("");

  const enrichedHighlights = [
    ...(project.architecture ? [`Architecture: ${project.architecture}`] : []),
    ...(project.impact ? [`Impact: ${project.impact}`] : []),
    ...(project.highlights || []),
  ];

  el.modalHighlights.innerHTML = enrichedHighlights
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  if (!enrichedHighlights.length) {
    el.modalHighlights.innerHTML =
      "<li>Add project highlights, architecture and impact in portfolio.json.</li>";
  }

  const links = project.links || [];
  el.modalLinks.innerHTML = links
    .map(
      (link) => `
      <a class="modal-link" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
        ${escapeHtml(link.label)}
      </a>
    `
    )
    .join("");

  if (!links.length) {
    el.modalLinks.innerHTML =
      "<p class='muted'>Public links can be added per project (GitHub, demo, docs).</p>";
  }

  el.modal.classList.remove("hidden");
  el.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProjectModal() {
  state.activeProjectIndex = null;
  el.modal.classList.add("hidden");
  el.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function countTools(projects) {
  const map = new Map();
  for (const project of projects) {
    for (const tool of project.tools || []) {
      map.set(tool, (map.get(tool) || 0) + 1);
    }
  }
  return map;
}

function getCategoryStats(projects) {
  const stats = CATEGORY_DEFINITIONS.map((category) => {
    const toolsMap = new Map();
    let projectCount = 0;

    for (const project of projects) {
      const projectTools = project.tools || [];
      const matchingTools = projectTools.filter((tool) => toolMatchesCategory(tool, category.id));

      if (matchingTools.length > 0) {
        projectCount += 1;
      }

      for (const tool of matchingTools) {
        toolsMap.set(tool, (toolsMap.get(tool) || 0) + 1);
      }
    }

    const topTools = [...toolsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tool]) => tool);

    return {
      id: category.id,
      label: category.label,
      projectCount,
      topTools,
    };
  })
    .filter((item) => item.projectCount > 0)
    .sort((a, b) => b.projectCount - a.projectCount || a.label.localeCompare(b.label));

  return stats;
}

function projectMatchesCategory(project, categoryId) {
  return (project.tools || []).some((tool) => toolMatchesCategory(tool, categoryId));
}

function toolMatchesCategory(tool, categoryId) {
  const normalized = normalize(tool);
  const category = CATEGORY_DEFINITIONS.find((item) => item.id === categoryId);
  if (!category) return false;
  return category.tools.some((candidate) => {
    if (candidate.length <= 2) return normalized === candidate;
    return normalized.includes(candidate);
  });
}

function getCategoryLabel(categoryId) {
  if (categoryId === "all") return "All";
  return CATEGORY_DEFINITIONS.find((item) => item.id === categoryId)?.label || categoryId;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return String(value).replaceAll('"', "%22");
}

init();
