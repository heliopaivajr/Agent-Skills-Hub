const STORAGE_KEY = "agent-skills-hub-state-v1";
const ENTITY_META = {
  skills: { singular: "Skill", icon: "◇", type: "skill", title: "Skills" },
  agents: { singular: "Agente", icon: "◎", type: "agent", title: "Agentes" },
  mcps: { singular: "MCP", icon: "▣", type: "mcp", title: "MCPs" },
  uploads: { singular: "Upload", icon: "⇧", type: "upload", title: "Uploads" },
  projects: { singular: "Projeto", icon: "□", type: "project", title: "Projetos" },
  collections: { singular: "Coleção", icon: "⊞", type: "collection", title: "Coleções" },
  templates: { singular: "Template", icon: "✎", type: "template", title: "Templates" }
};
const statusOptions = ["ativo", "rascunho", "arquivado"];
const fileRoles = ["Documento principal", "Documentação complementar", "Configuração", "Exemplo", "Template", "Referência", "Dependência", "Anexo técnico", "Imagem de apoio", "Arquivo de teste", "Prompt principal", "Prompt auxiliar", "Checklist", "Outro"];
const categories = ["Frontend", "Backend", "Banco de Dados", "Supabase", "Engenharia de Software", "SDD", "Refatoração", "Testes", "DevOps", "Documentação", "UI/UX", "Segurança", "Automação", "Ministério / Teologia", "Engenharia Civil", "Ciência de Dados", "IA", "Prompt Engineering"];
const navItems = [
  ["dashboard", "Dashboard"], ["library", "Biblioteca"], ["skills", "Skills"], ["agents", "Agentes"], ["mcps", "MCPs"],
  ["projects", "Projetos"], ["collections", "Coleções"], ["uploads", "Uploads"], ["templates", "Templates"],
  ["dependencies", "Dependências"], ["import", "Importar"], ["export", "Exportar"], ["settings", "Configurações"], ["users", "Usuários"]
];

let state = loadState();
let view = parseHash();
let modal = null;

window.addEventListener("hashchange", () => {
  view = parseHash();
  render();
});

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function today() {
  return new Date().toISOString();
}

function slugify(value) {
  return (value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const seeded = seedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedState() {
  const orgId = uid("org");
  const userId = uid("usr");
  const now = today();
  const base = {
    currentUserId: userId,
    currentOrgId: orgId,
    organizations: [{ id: orgId, name: "Helio Labs", plan: "MVP", created_at: now }],
    users: [{ id: userId, name: "Helio", email: "helio@example.com", role: "Owner", organization_id: orgId, created_at: now }],
    skills: [], agents: [], mcps: [], uploads: [], projects: [], collections: [], templates: [],
    tags: ["react", "supabase", "sdd", "segurança", "documentação", "qa", "frontend", "backend", "mcp", "prompt"],
    categories,
    versions: [],
    audit_logs: [],
    import_logs: [],
    export_logs: []
  };
  const projectNames = ["Plataforma EBD", "SaaS OdontoNexo", "Sistema de Agentes IA", "Biblioteca de Skills", "Plataforma de Automação"];
  base.projects = projectNames.map((name, index) => itemBase("project", { name, description: `Projeto exemplo para ${name}.`, category: "Engenharia de Software", status: index === 4 ? "rascunho" : "ativo", tags: ["sdd", "documentação"] }, base));
  const collectionNames = ["Stack Supabase", "Stack Frontend React", "Stack Claude Code", "Stack OpenHands", "Stack SDD", "Stack Segurança", "Stack Documentação"];
  base.collections = collectionNames.map((name) => itemBase("collection", { name, description: `Coleção reutilizável: ${name}.`, category: "IA", status: "ativo", tags: ["stack", "template"] }, base));
  const skillNames = ["Criar Componente React", "Refatorar Código", "Criar Schema Supabase", "Gerar PRD", "Criar Testes Automatizados", "Revisar Segurança", "Criar Prompt SDD", "Revisar UX"];
  base.skills = skillNames.map((name, i) => itemBase("skill", {
    name,
    short_description: `Skill para ${name.toLowerCase()}.`,
    full_description: `Documenta processo, entradas, saídas e restrições para ${name}.`,
    category: categories[i % categories.length],
    content_markdown: `# ${name}\n\n## Objetivo\nExecutar ${name.toLowerCase()} com critérios claros.\n\n## Processo\n1. Entender o contexto.\n2. Aplicar checklist.\n3. Entregar resultado revisável.`,
    usage_examples: "Use em projetos com necessidade de padronização.",
    compatibility: ["Codex", "Claude", "Cursor"],
    tags: ["sdd", i % 2 ? "backend" : "frontend"],
    status: i === 1 ? "rascunho" : "ativo",
    project_id: base.projects[i % base.projects.length].id
  }, base));
  const mcpNames = ["GitHub MCP", "Supabase MCP", "File System MCP", "Playwright MCP", "Figma MCP", "PostgreSQL MCP", "Notion MCP", "Google Drive MCP"];
  base.mcps = mcpNames.map((name, i) => itemBase("mcp", {
    name,
    description: `Configuração e notas de segurança para ${name}.`,
    category: "Automação",
    transport_type: i % 3 === 0 ? "HTTP" : "stdio",
    command: i % 3 === 0 ? "remote-endpoint" : "npx",
    args: ["-y", name.toLowerCase().replaceAll(" ", "-")],
    env_vars: { API_KEY: "********" },
    exposed_tools: ["read", "search", "write"].slice(0, (i % 3) + 1),
    config_json: JSON.stringify({ name, transport: i % 3 === 0 ? "http" : "stdio", command: "npx", args: [] }, null, 2),
    security_level: i === 2 ? "alto" : i === 5 ? "médio" : "baixo",
    security_notes: i === 2 ? "Acesso amplo ao sistema de arquivos; revisar escopos." : "Escopos limitados.",
    tags: ["mcp", i % 2 ? "backend" : "automação"],
    status: "ativo",
    project_id: base.projects[i % base.projects.length].id
  }, base));
  const agentNames = ["Frontend Engineer", "Backend Engineer", "Database Architect", "QA Tester", "Product Manager", "Agent Queen", "Security Reviewer", "Documentation Writer", "Prompt Engineer", "DevOps Engineer"];
  base.agents = agentNames.map((name, i) => itemBase("agent", {
    name,
    role: name,
    description: `${name} responsável por executar tarefas especializadas.`,
    objective: `Ajudar projetos com foco em ${name}.`,
    system_prompt: `Você é ${name}. Trabalhe com rigor, segurança e clareza.`,
    operational_instructions: "Validar contexto, executar checklist, registrar decisões.",
    model_recommendation: i % 2 ? "gpt-5-mini" : "gpt-5",
    temperature: 0.3,
    autonomy_level: i === 5 ? "alta" : "média",
    constraints: "Não executar ações destrutivas sem confirmação.",
    checklist: "- Revisar contexto\n- Confirmar dependências\n- Entregar resumo",
    tags: ["agent", i % 2 ? "backend" : "frontend"],
    status: "ativo",
    project_id: base.projects[i % base.projects.length].id,
    skillIds: base.skills.slice(i % 4, (i % 4) + 2).map(x => x.id),
    mcpIds: base.mcps.slice(i % 3, (i % 3) + 2).map(x => x.id)
  }, base));
  const uploadSeed = [
    ["frontend-engineer-agent.md", "Agente", "text/markdown"], ["supabase-mcp-config.json", "MCP", "application/json"],
    ["skill-criar-componente-react.md", "Skill", "text/markdown"], ["checklist-code-review.md", "Documentação", "text/markdown"],
    ["arquitetura-agentes.pdf", "Documentação", "application/pdf"], ["exemplo-output.json", "Exemplo", "application/json"], ["figma-reference.png", "Imagem de apoio", "image/png"]
  ];
  base.uploads = uploadSeed.map(([file_name, classification, mime_type], i) => itemBase("upload", {
    name: file_name,
    file_name,
    original_file_name: file_name,
    file_type: file_name.split(".").pop(),
    mime_type,
    file_size: 12000 + (i * 3800),
    storage_path: `local/demo/${file_name}`,
    description: `Arquivo exemplo classificado como ${classification}.`,
    classification,
    category: classification === "MCP" ? "Automação" : "Documentação",
    tags: ["exemplo", classification.toLowerCase()],
    status: "ativo",
    content: mime_type.includes("json") ? JSON.stringify({ name: file_name, demo: true }, null, 2) : `# ${file_name}\n\nConteúdo de exemplo para demonstração.`,
    project_id: base.projects[i % base.projects.length].id
  }, base));
  base.skills[0].uploadIds = [base.uploads[2].id, base.uploads[6].id];
  base.agents[0].uploadIds = [base.uploads[0].id];
  base.mcps[1].uploadIds = [base.uploads[1].id];
  base.file_links = [
    linkFile(base.uploads[2].id, "skill", base.skills[0].id, "Documento principal", base),
    linkFile(base.uploads[6].id, "skill", base.skills[0].id, "Imagem de apoio", base),
    linkFile(base.uploads[0].id, "agent", base.agents[0].id, "Prompt principal", base),
    linkFile(base.uploads[1].id, "mcp", base.mcps[1].id, "Configuração", base)
  ];
  base.templates = [
    itemBase("template", { name: "Template de Skill", category: "Documentação", description: "Estrutura padrão para nova Skill.", content_markdown: "# Nome da Skill\n\n## Objetivo\n\n## Quando usar\n\n## Entrada esperada\n\n## Processo\n\n## Saída esperada\n\n## Restrições\n\n## Exemplos", tags: ["skill", "template"], status: "ativo" }, base),
    itemBase("template", { name: "Template de Agente", category: "Prompt Engineering", description: "Estrutura padrão para novo Agente.", content_markdown: "# Nome do Agente\n\n## Papel\n\n## Objetivo\n\n## Responsabilidades\n\n## Ferramentas permitidas\n\n## Skills obrigatórias\n\n## MCPs necessários\n\n## Processo de trabalho\n\n## Critérios de qualidade\n\n## Restrições", tags: ["agent", "template"], status: "ativo" }, base),
    itemBase("template", { name: "Template de MCP", category: "Automação", description: "Estrutura JSON para novo MCP.", content_markdown: '{\n  "name": "",\n  "transport": "stdio",\n  "command": "",\n  "args": [],\n  "env": {},\n  "tools": [],\n  "security_notes": ""\n}', tags: ["mcp", "template"], status: "ativo" }, base)
  ];
  return base;
}

function itemBase(type, data, source = state) {
  const now = today();
  const name = data.name || data.file_name || "Sem nome";
  return {
    id: data.id || uid(type),
    organization_id: source.currentOrgId,
    created_by: source.currentUserId,
    updated_by: source.currentUserId,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
    status: data.status || "rascunho",
    version: data.version || "1.0.0",
    slug: data.slug || slugify(name),
    category: data.category || "IA",
    tags: data.tags || [],
    uploadIds: data.uploadIds || [],
    skillIds: data.skillIds || [],
    mcpIds: data.mcpIds || [],
    collectionIds: data.collectionIds || [],
    ...data
  };
}

function linkFile(file_id, linked_item_type, linked_item_id, file_role, source = state) {
  return {
    id: uid("fl"),
    organization_id: source.currentOrgId,
    file_id,
    linked_item_type,
    linked_item_id,
    file_role,
    description: "",
    sort_order: 0,
    created_by: source.currentUserId,
    created_at: today()
  };
}

function parseHash() {
  const raw = location.hash.replace("#/", "") || "dashboard";
  const [page, id] = raw.split("/");
  return { page, id };
}

function route(page, id) {
  location.hash = id ? `#/${page}/${id}` : `#/${page}`;
}

function currentOrg() {
  return state.organizations.find(o => o.id === state.currentOrgId);
}

function currentUser() {
  return state.users.find(u => u.id === state.currentUserId);
}

function orgItems(key) {
  return (state[key] || []).filter(x => x.organization_id === state.currentOrgId && !x.deleted_at);
}

function render() {
  const app = document.getElementById("app");
  if (!state.currentUserId) {
    app.innerHTML = renderAuth();
    bindAuth();
    return;
  }
  const pageTitle = navItems.find(([id]) => id === view.page)?.[1] || detailTitle();
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">ASH</div><div><strong>Agent Skills Hub</strong><span>SaaS workspace</span></div></div>
        <nav class="nav">${navItems.map(([id, label]) => `<button class="${view.page === id ? "active" : ""}" data-route="${id}">${label}</button>`).join("")}</nav>
        <div class="org-card"><strong>${escapeHtml(currentOrg().name)}</strong><br>${escapeHtml(currentUser().name)} · ${escapeHtml(currentUser().role)}</div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div><h1>${pageTitle}</h1><p>Organização isolada por organization_id: ${state.currentOrgId.slice(0, 12)}...</p></div>
          <div class="toolbar">
            <button data-action="quick-create">Novo item</button>
            <button data-route="export">Exportar JSON</button>
          </div>
        </div>
        <section class="content">${renderPage()}</section>
      </main>
    </div>
    ${modal || ""}
  `;
  bindGlobal();
  bindPage();
}

function detailTitle() {
  for (const key of Object.keys(ENTITY_META)) {
    const found = orgItems(key).find(x => x.id === view.id);
    if (found) return found.name || found.file_name;
  }
  return "Agent Skills Hub";
}

function renderPage() {
  if (ENTITY_META[view.page]) return view.id ? renderDetail(view.page, view.id) : renderEntityList(view.page);
  const pages = {
    dashboard: renderDashboard,
    library: renderLibrary,
    dependencies: renderDependencies,
    import: renderImport,
    export: renderExport,
    settings: renderSettings,
    users: renderUsers
  };
  return (pages[view.page] || renderDashboard)();
}

function renderDashboard() {
  const metrics = [
    ["Skills", orgItems("skills").length], ["Agentes", orgItems("agents").length], ["MCPs", orgItems("mcps").length], ["Uploads", orgItems("uploads").length],
    ["Projetos", orgItems("projects").length], ["Coleções", orgItems("collections").length], ["Ativos", allItems().filter(x => x.status === "ativo").length], ["Rascunhos", allItems().filter(x => x.status === "rascunho").length]
  ];
  const latest = allItems().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6);
  const highRisk = orgItems("mcps").filter(x => x.security_level === "alto");
  const agentsNoSkills = orgItems("agents").filter(x => !x.skillIds?.length);
  return `
    <div class="grid cols-4">${metrics.map(([label, value]) => `<div class="card metric"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
    <div class="grid cols-2">
      <div class="card"><div class="section-title"><h2>Últimos itens editados</h2><button data-route="library">Ver biblioteca</button></div><div class="list">${latest.map(renderMiniRow).join("")}</div></div>
      <div class="card"><div class="section-title"><h2>Alertas operacionais</h2><span class="pill ${highRisk.length ? "high" : "active"}">${highRisk.length + agentsNoSkills.length} alertas</span></div>
        <div class="list">
          ${highRisk.map(x => `<div class="notice">MCP de risco alto: <strong>${escapeHtml(x.name)}</strong></div>`).join("")}
          ${agentsNoSkills.map(x => `<div class="notice">Agente sem skill vinculada: <strong>${escapeHtml(x.name)}</strong></div>`).join("") || "<div class='empty'>Nenhum alerta crítico agora.</div>"}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="section-title"><h2>Atalhos</h2></div>
      <div class="toolbar">${["skills", "agents", "mcps", "projects", "collections", "uploads"].map(k => `<button class="primary" data-new="${k}">Criar ${ENTITY_META[k].singular}</button>`).join("")}</div>
    </div>
  `;
}

function allItems() {
  return Object.keys(ENTITY_META).flatMap(key => orgItems(key).map(x => ({ ...x, entityKey: key })));
}

function renderMiniRow(item) {
  return `<div class="item-row"><div><h3>${escapeHtml(item.name || item.file_name)}</h3><div class="pill-row"><span class="pill">${ENTITY_META[item.entityKey]?.singular || "Item"}</span>${statusPill(item.status)}</div></div><button data-route="${item.entityKey}" data-id="${item.id}">Ver</button></div>`;
}

function renderLibrary() {
  const q = getParam("q");
  const type = getParam("type");
  const status = getParam("status");
  const mode = getParam("mode") || "cards";
  let items = allItems();
  if (q) items = items.filter(x => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  if (type) items = items.filter(x => x.entityKey === type);
  if (status) items = items.filter(x => x.status === status);
  return `
    ${renderFilters({ q, type, status, mode })}
    ${mode === "table" ? renderTable(items) : `<div class="entity-grid">${items.map(renderEntityCard).join("")}</div>`}
  `;
}

function renderFilters({ q = "", type = "", status = "", mode = "cards" }) {
  return `<div class="card toolbar">
    <input placeholder="Buscar por nome, conteúdo, tag, arquivo..." value="${escapeHtml(q)}" data-filter="q" />
    <select data-filter="type"><option value="">Todos os tipos</option>${Object.keys(ENTITY_META).map(k => `<option value="${k}" ${type === k ? "selected" : ""}>${ENTITY_META[k].title}</option>`).join("")}</select>
    <select data-filter="status"><option value="">Todos os status</option>${statusOptions.map(s => `<option ${status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
    <select data-filter="mode"><option value="cards" ${mode === "cards" ? "selected" : ""}>Cards</option><option value="table" ${mode === "table" ? "selected" : ""}>Tabela</option></select>
  </div>`;
}

function renderTable(items) {
  return `<table><thead><tr><th>Nome</th><th>Tipo</th><th>Categoria</th><th>Status</th><th>Atualizado</th><th>Ações</th></tr></thead><tbody>
    ${items.map(item => `<tr><td>${escapeHtml(item.name || item.file_name)}</td><td>${ENTITY_META[item.entityKey].singular}</td><td>${escapeHtml(item.category || "-")}</td><td>${statusPill(item.status)}</td><td>${formatDate(item.updated_at)}</td><td><button data-route="${item.entityKey}" data-id="${item.id}">Ver</button></td></tr>`).join("")}
  </tbody></table>`;
}

function renderEntityList(key) {
  const meta = ENTITY_META[key];
  const items = orgItems(key).filter(x => getParam("showArchived") === "1" || x.status !== "arquivado");
  return `
    <div class="toolbar">
      <button class="primary" data-new="${key}">Criar ${meta.singular}</button>
      ${key === "uploads" ? `<button data-action="upload-file">Enviar arquivo</button>` : ""}
      <button data-param="showArchived" data-value="${getParam("showArchived") === "1" ? "" : "1"}">${getParam("showArchived") === "1" ? "Ocultar arquivados" : "Mostrar arquivados"}</button>
    </div>
    <div class="entity-grid">${items.map(item => renderEntityCard({ ...item, entityKey: key })).join("") || `<div class="empty">Nenhum item nesta área ainda.</div>`}</div>
  `;
}

function renderEntityCard(item) {
  return `<article class="card entity-card">
    <div>
      <div class="pill-row"><span class="pill">${ENTITY_META[item.entityKey].singular}</span>${statusPill(item.status)}${item.security_level ? riskPill(item.security_level) : ""}</div>
      <h3>${escapeHtml(item.name || item.file_name)}</h3>
      <p>${escapeHtml(item.short_description || item.description || item.full_description || "Sem descrição.")}</p>
    </div>
    <div class="pill-row">${(item.tags || []).slice(0, 4).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("")}</div>
    <div class="muted">Atualizado ${formatDate(item.updated_at)}</div>
    <div class="item-actions">
      <button data-route="${item.entityKey}" data-id="${item.id}">Ver</button>
      <button data-edit="${item.entityKey}" data-id="${item.id}">Editar</button>
      <button data-duplicate="${item.entityKey}" data-id="${item.id}">Duplicar</button>
      <button data-archive="${item.entityKey}" data-id="${item.id}">Arquivar</button>
      <button class="danger" data-delete="${item.entityKey}" data-id="${item.id}">Excluir</button>
    </div>
  </article>`;
}

function renderDetail(key, id) {
  const item = orgItems(key).find(x => x.id === id);
  if (!item) return `<div class="empty">Item não encontrado.</div>`;
  const linkedFiles = getLinkedFiles(key, id);
  const related = relatedItems(key, item);
  return `
    <div class="card">
      <div class="section-title">
        <div><div class="pill-row"><span class="pill">${ENTITY_META[key].singular}</span>${statusPill(item.status)}${item.security_level ? riskPill(item.security_level) : ""}</div><h2>${escapeHtml(item.name || item.file_name)}</h2></div>
        <div class="toolbar"><button data-edit="${key}" data-id="${id}">Editar</button><button data-export-item="${key}" data-id="${id}">Exportar</button><button data-duplicate="${key}" data-id="${id}">Duplicar</button><button class="danger" data-delete="${key}" data-id="${id}">Excluir</button></div>
      </div>
      <p>${escapeHtml(item.description || item.full_description || item.short_description || "Sem descrição.")}</p>
      <div class="pill-row">${(item.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("")}</div>
    </div>
    <div class="grid cols-2">
      <div class="card"><h2>Conteúdo principal</h2>${renderContent(item, key)}</div>
      <div class="card"><h2>Relacionamentos</h2>${related}</div>
    </div>
    <div class="card"><div class="section-title"><h2>Arquivos Relacionados</h2><button data-edit="${key}" data-id="${id}">Gerenciar vínculos</button></div>${renderLinkedFiles(linkedFiles)}</div>
    <div class="card"><h2>Histórico de versões</h2>${renderVersions(id)}</div>
  `;
}

function renderContent(item, key) {
  if (key === "mcps") return `<pre class="markdown-preview">${escapeHtml(item.config_json || JSON.stringify({ command: item.command, args: item.args, env: item.env_vars }, null, 2))}</pre>`;
  if (key === "uploads") return `<div class="markdown-preview">${escapeHtml(item.content || "Prévia não disponível para este tipo de arquivo.")}</div><div class="toolbar"><button data-convert="${item.id}" data-kind="skills">Criar Skill</button><button data-convert="${item.id}" data-kind="agents">Criar Agente</button><button data-convert="${item.id}" data-kind="mcps">Criar MCP</button></div>`;
  return `<div class="markdown-preview">${escapeHtml(item.content_markdown || item.system_prompt || item.operational_instructions || item.description || "Sem conteúdo.")}</div>`;
}

function relatedItems(key, item) {
  const rows = [];
  if (key === "agents") {
    rows.push(["Skills", namesByIds("skills", item.skillIds)]);
    rows.push(["MCPs", namesByIds("mcps", item.mcpIds)]);
  }
  if (key === "skills") rows.push(["MCPs dependentes", namesByIds("mcps", item.mcpIds)]);
  if (item.project_id) rows.push(["Projeto", namesByIds("projects", [item.project_id])]);
  if (item.collectionIds?.length) rows.push(["Coleções", namesByIds("collections", item.collectionIds)]);
  if (!rows.length) return `<div class="empty">Nenhum relacionamento cadastrado.</div>`;
  return `<table><tbody>${rows.map(([label, value]) => `<tr><th>${label}</th><td>${value || "-"}</td></tr>`).join("")}</tbody></table>`;
}

function namesByIds(key, ids = []) {
  return ids.map(id => orgItems(key).find(x => x.id === id)?.name).filter(Boolean).join(", ");
}

function getLinkedFiles(key, id) {
  return (state.file_links || [])
    .filter(l => l.organization_id === state.currentOrgId && l.linked_item_type === ENTITY_META[key].type && l.linked_item_id === id)
    .map(l => ({ ...l, file: orgItems("uploads").find(f => f.id === l.file_id) }))
    .filter(x => x.file);
}

function renderLinkedFiles(links) {
  if (!links.length) return `<div class="empty">Nenhum arquivo vinculado.</div>`;
  const groups = Object.groupBy ? Object.groupBy(links, x => x.file_role || "Outro") : links.reduce((a, x) => ((a[x.file_role || "Outro"] ||= []).push(x), a), {});
  return Object.entries(groups).map(([role, list]) => `<h3>${escapeHtml(role)}</h3><div class="list">${list.map(l => `<div class="item-row"><div><strong>${escapeHtml(l.file.file_name)}</strong><br><span class="muted">${escapeHtml(l.file.file_type)} · ${formatBytes(l.file.file_size)} · ${formatDate(l.file.created_at)}</span></div><div class="item-actions"><button data-route="uploads" data-id="${l.file.id}">Visualizar</button><button data-download="${l.file.id}">Baixar</button></div></div>`).join("")}</div>`).join("");
}

function renderVersions(itemId) {
  const versions = (state.versions || []).filter(v => v.item_id === itemId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!versions.length) return `<div class="empty">A primeira alteração editada criará uma versão automaticamente.</div>`;
  return `<table><thead><tr><th>Versão</th><th>Data</th><th>Autor</th><th>Nota</th></tr></thead><tbody>${versions.map(v => `<tr><td>${escapeHtml(v.version)}</td><td>${formatDate(v.created_at)}</td><td>${escapeHtml(currentUser().name)}</td><td>${escapeHtml(v.note || "Alteração salva")}</td></tr>`).join("")}</tbody></table>`;
}

function renderDependencies() {
  const rows = [];
  orgItems("agents").forEach(agent => {
    rows.push([agent.name, "usa skill", namesByIds("skills", agent.skillIds) || "Sem skill vinculada"]);
    rows.push([agent.name, "usa MCP", namesByIds("mcps", agent.mcpIds) || "Sem MCP vinculado"]);
  });
  orgItems("skills").forEach(skill => rows.push([skill.name, "depende de MCP", namesByIds("mcps", skill.mcpIds) || "Sem MCP"]));
  orgItems("uploads").forEach(file => {
    const links = (state.file_links || []).filter(l => l.file_id === file.id);
    rows.push([file.file_name, "vinculado a", links.length ? links.map(l => `${l.linked_item_type}:${l.linked_item_id.slice(0, 6)}`).join(", ") : "Órfão"]);
  });
  return `<div class="card"><div class="section-title"><h2>Mapa de Dependências</h2><span class="pill">Tabela inicial</span></div><table><thead><tr><th>Origem</th><th>Relação</th><th>Destino / Alerta</th></tr></thead><tbody>${rows.map(r => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
}

function renderImport() {
  return `<div class="card"><h2>Importação JSON</h2><p class="muted">Cole um pacote exportado ou um array de itens. A importação valida tipo, organização e duplicatas por slug.</p><textarea id="import-json" placeholder='{"skills":[...]}'></textarea><div class="toolbar"><button class="primary" data-action="import-json">Validar e importar</button></div></div><div id="import-result"></div>`;
}

function renderExport() {
  const payload = exportPayload();
  return `<div class="card"><div class="section-title"><h2>Exportação da organização</h2><button class="primary" data-action="download-export">Baixar JSON</button></div><pre class="markdown-preview">${escapeHtml(JSON.stringify(payload, null, 2))}</pre></div>`;
}

function renderSettings() {
  return `<div class="card"><h2>Configurações da Organização</h2><div class="form-grid"><label>Nome da organização<input id="org-name" value="${escapeHtml(currentOrg().name)}"></label><label>Plano futuro<select id="org-plan"><option>MVP</option><option>Team</option><option>Business</option></select></label><label class="wide">Política de segurança<textarea id="org-policy">Isolamento por organization_id, soft delete, histórico de versão e confirmação antes de exclusões definitivas.</textarea></label></div><br><button class="primary" data-action="save-settings">Salvar configurações</button></div>`;
}

function renderUsers() {
  return `<div class="card"><div class="section-title"><h2>Usuários e papéis</h2><button data-action="add-user">Adicionar usuário</button></div><table><thead><tr><th>Nome</th><th>Email</th><th>Papel</th></tr></thead><tbody>${state.users.filter(u => u.organization_id === state.currentOrgId).map(u => `<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.role)}</td></tr>`).join("")}</tbody></table></div>`;
}

function renderAuth() {
  return `<div class="auth"><div class="auth-panel"><h1>Agent Skills Hub</h1><p class="muted">Entre no workspace SaaS multi-tenant de demonstração.</p><label>Email<input id="auth-email" value="helio@example.com"></label><label>Nome<input id="auth-name" value="Helio"></label><label>Organização<input id="auth-org" value="Helio Labs"></label><button class="primary" data-action="login">Entrar / cadastrar</button></div></div>`;
}

function bindGlobal() {
  document.querySelectorAll("[data-route]").forEach(btn => btn.addEventListener("click", () => route(btn.dataset.route, btn.dataset.id)));
  document.querySelectorAll("[data-new]").forEach(btn => btn.addEventListener("click", () => openEditor(btn.dataset.new)));
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openEditor(btn.dataset.edit, btn.dataset.id)));
  document.querySelectorAll("[data-duplicate]").forEach(btn => btn.addEventListener("click", () => duplicateItem(btn.dataset.duplicate, btn.dataset.id)));
  document.querySelectorAll("[data-archive]").forEach(btn => btn.addEventListener("click", () => archiveItem(btn.dataset.archive, btn.dataset.id)));
  document.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => softDelete(btn.dataset.delete, btn.dataset.id)));
  document.querySelectorAll("[data-export-item]").forEach(btn => btn.addEventListener("click", () => downloadJson(`${btn.dataset.exportItem}-${btn.dataset.id}.json`, findItem(btn.dataset.exportItem, btn.dataset.id))));
  document.querySelectorAll("[data-download]").forEach(btn => btn.addEventListener("click", () => downloadUpload(btn.dataset.download)));
  document.querySelectorAll("[data-convert]").forEach(btn => btn.addEventListener("click", () => convertUpload(btn.dataset.convert, btn.dataset.kind)));
  document.querySelectorAll("[data-param]").forEach(btn => btn.addEventListener("click", () => setParam(btn.dataset.param, btn.dataset.value)));
  const quick = document.querySelector("[data-action='quick-create']");
  if (quick) quick.addEventListener("click", () => openQuickCreate());
  if (modal) bindModal();
}

function bindPage() {
  document.querySelectorAll("[data-filter]").forEach(input => input.addEventListener("input", () => setParam(input.dataset.filter, input.value, false)));
  document.querySelectorAll("[data-filter]").forEach(input => input.addEventListener("change", () => setParam(input.dataset.filter, input.value)));
  const uploadBtn = document.querySelector("[data-action='upload-file']");
  if (uploadBtn) uploadBtn.addEventListener("click", openUploadModal);
  const importBtn = document.querySelector("[data-action='import-json']");
  if (importBtn) importBtn.addEventListener("click", importJson);
  const exportBtn = document.querySelector("[data-action='download-export']");
  if (exportBtn) exportBtn.addEventListener("click", () => downloadJson(`agent-skills-hub-${Date.now()}.json`, exportPayload()));
  const settingsBtn = document.querySelector("[data-action='save-settings']");
  if (settingsBtn) settingsBtn.addEventListener("click", () => {
    currentOrg().name = document.getElementById("org-name").value;
    currentOrg().plan = document.getElementById("org-plan").value;
    saveState(); render();
  });
  const addUser = document.querySelector("[data-action='add-user']");
  if (addUser) addUser.addEventListener("click", () => openUserModal());
}

function bindAuth() {
  document.querySelector("[data-action='login']").addEventListener("click", () => {
    const org = itemValue("auth-org") || "Nova Organização";
    const orgId = uid("org");
    const userId = uid("usr");
    state.organizations.push({ id: orgId, name: org, plan: "MVP", created_at: today() });
    state.users.push({ id: userId, name: itemValue("auth-name") || "Usuário", email: itemValue("auth-email") || "user@example.com", role: "Owner", organization_id: orgId, created_at: today() });
    state.currentOrgId = orgId;
    state.currentUserId = userId;
    saveState(); render();
  });
}

function openQuickCreate() {
  modal = `<div class="modal-backdrop"><div class="modal"><header><h2>Novo item</h2><button data-close>Fechar</button></header><div class="modal-body"><div class="grid cols-3">${Object.keys(ENTITY_META).map(k => `<button class="primary" data-new="${k}">Criar ${ENTITY_META[k].singular}</button>`).join("")}</div></div></div></div>`;
  render();
}

function openEditor(key, id) {
  const item = id ? findItem(key, id) : itemBase(ENTITY_META[key].type, { name: "" });
  const relatedFiles = new Set(getLinkedFiles(key, id).map(l => l.file_id));
  modal = `<div class="modal-backdrop"><div class="modal"><header><h2>${id ? "Editar" : "Criar"} ${ENTITY_META[key].singular}</h2><button data-close>Fechar</button></header>
    <div class="modal-body"><form id="entity-form" class="form-grid">
      <label>Nome<input name="name" required value="${escapeHtml(item.name || item.file_name || "")}"></label>
      <label>Slug<input name="slug" required value="${escapeHtml(item.slug || "")}"></label>
      <label>Categoria<select name="category">${categories.map(c => `<option ${item.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
      <label>Status<select name="status">${statusOptions.map(s => `<option ${item.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
      <label class="wide">Descrição<textarea name="description" required>${escapeHtml(item.description || item.full_description || item.short_description || "")}</textarea></label>
      ${editorSpecificFields(key, item)}
      <label class="wide">Tags (separadas por vírgula)<input name="tags" value="${escapeHtml((item.tags || []).join(", "))}"></label>
      <label>Projeto<select name="project_id"><option value="">Nenhum</option>${orgItems("projects").map(p => `<option value="${p.id}" ${item.project_id === p.id ? "selected" : ""}>${escapeHtml(p.name)}</option>`).join("")}</select></label>
      <label>Coleções<select name="collectionIds" multiple>${orgItems("collections").map(c => `<option value="${c.id}" ${item.collectionIds?.includes(c.id) ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}</select></label>
      <div class="wide card"><div class="section-title"><h2>Arquivos Relacionados</h2><button type="button" data-action="upload-file-inline">Enviar novo</button></div>
        <div class="grid cols-2">${orgItems("uploads").map(file => `<label><input type="checkbox" name="uploadIds" value="${file.id}" ${relatedFiles.has(file.id) || item.uploadIds?.includes(file.id) ? "checked" : ""}> ${escapeHtml(file.file_name)}</label>`).join("") || "<p class='muted'>Nenhum upload disponível.</p>"}</div>
        <label>Papel dos novos vínculos<select name="file_role">${fileRoles.map(r => `<option>${r}</option>`).join("")}</select></label>
      </div>
    </form></div><footer><button data-close>Cancelar</button><button class="primary" data-save-entity="${key}" data-id="${id || ""}">Salvar</button></footer></div></div>`;
  render();
}

function editorSpecificFields(key, item) {
  if (key === "skills") return `
    <label class="wide">Conteúdo Markdown<textarea name="content_markdown">${escapeHtml(item.content_markdown || "")}</textarea></label>
    <label>Entrada esperada<textarea name="input_schema">${escapeHtml(item.input_schema || "")}</textarea></label>
    <label>Saída esperada<textarea name="output_schema">${escapeHtml(item.output_schema || "")}</textarea></label>
    <label>MCPs dependentes<select name="mcpIds" multiple>${orgItems("mcps").map(m => `<option value="${m.id}" ${item.mcpIds?.includes(m.id) ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select></label>`;
  if (key === "agents") return `
    <label>Papel/Função<input name="role" value="${escapeHtml(item.role || "")}"></label>
    <label>Modelo recomendado<input name="model_recommendation" value="${escapeHtml(item.model_recommendation || "")}"></label>
    <label class="wide">Prompt de sistema<textarea name="system_prompt">${escapeHtml(item.system_prompt || "")}</textarea></label>
    <label class="wide">Instruções operacionais<textarea name="operational_instructions">${escapeHtml(item.operational_instructions || "")}</textarea></label>
    <label>Skills vinculadas<select name="skillIds" multiple>${orgItems("skills").map(s => `<option value="${s.id}" ${item.skillIds?.includes(s.id) ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}</select></label>
    <label>MCPs vinculados<select name="mcpIds" multiple>${orgItems("mcps").map(m => `<option value="${m.id}" ${item.mcpIds?.includes(m.id) ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select></label>
    <label class="wide">Checklist<textarea name="checklist">${escapeHtml(item.checklist || "")}</textarea></label>`;
  if (key === "mcps") return `
    <label>Transporte<select name="transport_type">${["stdio", "HTTP", "SSE", "outro"].map(t => `<option ${item.transport_type === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <label>Nível de risco<select name="security_level">${["baixo", "médio", "alto"].map(t => `<option ${item.security_level === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <label>Comando<input name="command" value="${escapeHtml(item.command || "")}"></label>
    <label>Argumentos<input name="argsText" value="${escapeHtml((item.args || []).join(", "))}"></label>
    <label class="wide">Configuração JSON/YAML<textarea name="config_json">${escapeHtml(item.config_json || "")}</textarea></label>
    <label class="wide">Notas de segurança<textarea name="security_notes">${escapeHtml(item.security_notes || "")}</textarea></label>`;
  if (key === "uploads") return `
    <label>Nome do arquivo<input name="file_name" value="${escapeHtml(item.file_name || item.name || "")}"></label>
    <label>Classificação<select name="classification">${["Skill", "Agente", "MCP", "Template", "Documentação", "Configuração", "Arquivo de apoio", "Anexo de projeto", "Exemplo", "Outro"].map(c => `<option ${item.classification === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
    <label class="wide">Prévia / conteúdo textual<textarea name="content">${escapeHtml(item.content || "")}</textarea></label>`;
  if (["projects", "collections", "templates"].includes(key)) return `<label class="wide">Documentação / conteúdo Markdown<textarea name="content_markdown">${escapeHtml(item.content_markdown || "")}</textarea></label>`;
  return "";
}

function bindModal() {
  document.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", () => { modal = null; render(); }));
  document.querySelectorAll("[data-save-entity]").forEach(btn => btn.addEventListener("click", () => saveEntity(btn.dataset.saveEntity, btn.dataset.id)));
  const inlineUpload = document.querySelector("[data-action='upload-file-inline']");
  if (inlineUpload) inlineUpload.addEventListener("click", openUploadModal);
  document.querySelectorAll("[data-new]").forEach(btn => btn.addEventListener("click", () => openEditor(btn.dataset.new)));
  const saveUser = document.querySelector("[data-action='save-user']");
  if (saveUser) saveUser.addEventListener("click", saveUserFromModal);
}

function saveEntity(key, id) {
  const form = document.getElementById("entity-form");
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  ["collectionIds", "uploadIds", "skillIds", "mcpIds"].forEach(name => {
    data[name] = [...form.querySelectorAll(`[name="${name}"]:checked, select[name="${name}"] option:checked`)].map(x => x.value).filter(Boolean);
  });
  data.tags = (data.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  if (data.argsText) data.args = data.argsText.split(",").map(x => x.trim()).filter(Boolean);
  const existing = id ? findItem(key, id) : null;
  if (existing) {
    addVersion(key, existing);
    Object.assign(existing, data, { updated_at: today(), updated_by: state.currentUserId });
  } else {
    const newItem = itemBase(ENTITY_META[key].type, data);
    state[key].push(newItem);
    id = newItem.id;
  }
  syncFileLinks(key, id, data.uploadIds || [], data.file_role || "Referência");
  saveState();
  modal = null;
  route(key, id);
  render();
}

function addVersion(key, item) {
  const patch = JSON.parse(JSON.stringify(item));
  state.versions.push({ id: uid("ver"), organization_id: state.currentOrgId, item_type: ENTITY_META[key].type, item_id: item.id, version: item.version || "1.0.0", content_previous: patch, note: "Snapshot antes da edição", created_by: state.currentUserId, created_at: today() });
  const parts = String(item.version || "1.0.0").split(".").map(Number);
  item.version = `${parts[0] || 1}.${parts[1] || 0}.${(parts[2] || 0) + 1}`;
}

function syncFileLinks(key, id, uploadIds, role) {
  const type = ENTITY_META[key].type;
  state.file_links = (state.file_links || []).filter(l => !(l.linked_item_type === type && l.linked_item_id === id));
  uploadIds.forEach((fileId, index) => {
    const link = linkFile(fileId, type, id, role);
    link.sort_order = index;
    state.file_links.push(link);
  });
}

function findItem(key, id) {
  return orgItems(key).find(x => x.id === id);
}

function duplicateItem(key, id) {
  const item = findItem(key, id);
  if (!item) return;
  const copy = itemBase(ENTITY_META[key].type, { ...JSON.parse(JSON.stringify(item)), id: uid(ENTITY_META[key].type), name: `${item.name || item.file_name} (cópia)`, slug: `${item.slug}-copia-${Date.now().toString(36)}`, created_at: today(), updated_at: today() });
  state[key].push(copy);
  saveState(); route(key, copy.id); render();
}

function archiveItem(key, id) {
  const item = findItem(key, id);
  if (!item) return;
  addVersion(key, item);
  item.status = item.status === "arquivado" ? "ativo" : "arquivado";
  item.updated_at = today();
  saveState(); render();
}

function softDelete(key, id) {
  const item = findItem(key, id);
  if (!item) return;
  const links = key === "uploads" ? (state.file_links || []).filter(l => l.file_id === id).length : getLinkedFiles(key, id).length;
  if (!confirm(`Excluir "${item.name || item.file_name}"? ${links ? `Ele possui ${links} vínculo(s).` : ""} A exclusão será lógica.`)) return;
  item.deleted_at = today();
  item.status = "arquivado";
  saveState(); route(key); render();
}

function openUploadModal() {
  modal = `<div class="modal-backdrop"><div class="modal"><header><h2>Novo upload</h2><button data-close>Fechar</button></header><div class="modal-body">
    <label>Arquivo<input id="file-input" type="file" accept=".md,.txt,.json,.yaml,.yml,.zip,.pdf,.docx,.png,.jpg,.jpeg,.webp"></label>
    <label>Classificação<select id="file-classification"><option>Detectar automaticamente</option><option>Skill</option><option>Agente</option><option>MCP</option><option>Template</option><option>Documentação</option><option>Configuração</option><option>Arquivo de apoio</option><option>Anexo de projeto</option><option>Exemplo</option><option>Outro</option></select></label>
    <label>Descrição<textarea id="file-description"></textarea></label>
    <div class="notice">Arquivos ficam vinculados à organização atual. Conteúdos sensíveis como chaves de API devem ser mascarados antes de compartilhar.</div>
  </div><footer><button data-close>Cancelar</button><button class="primary" data-action="save-upload">Enviar</button></footer></div></div>`;
  render();
  document.querySelector("[data-action='save-upload']").addEventListener("click", saveUpload);
}

function saveUpload() {
  const input = document.getElementById("file-input");
  const file = input.files[0];
  if (!file) return alert("Selecione um arquivo.");
  const reader = new FileReader();
  reader.onload = () => {
    const ext = file.name.split(".").pop().toLowerCase();
    const content = typeof reader.result === "string" ? reader.result.slice(0, 120000) : "";
    const chosen = document.getElementById("file-classification").value;
    const classification = chosen === "Detectar automaticamente" ? detectFile(file.name, file.type, content) : chosen;
    const upload = itemBase("upload", {
      name: file.name,
      file_name: file.name,
      original_file_name: file.name,
      file_type: ext,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      storage_path: `local/${state.currentOrgId}/${file.name}`,
      classification,
      description: document.getElementById("file-description").value,
      category: classification === "MCP" ? "Automação" : "Documentação",
      content,
      tags: [classification.toLowerCase(), ext],
      status: "ativo"
    });
    state.uploads.push(upload);
    saveState();
    modal = null;
    route("uploads", upload.id);
    render();
  };
  if (file.type.startsWith("image/") || file.type.includes("pdf") || file.name.endsWith(".zip") || file.name.endsWith(".docx")) reader.readAsDataURL(file);
  else reader.readAsText(file);
}

function detectFile(name, mime, content) {
  const lower = `${name} ${mime} ${content.slice(0, 400)}`.toLowerCase();
  if (name.endsWith(".zip")) return "Pacote de importação";
  if (mime.includes("pdf") || name.endsWith(".docx")) return "Documentação";
  if (mime.startsWith("image/")) return "Imagem de apoio";
  if (lower.includes("mcp") || lower.includes('"transport"') || lower.includes('"command"')) return "MCP";
  if (lower.includes("system prompt") || lower.includes("prompt de sistema") || lower.includes("papel")) return "Agente";
  if (lower.includes("quando usar") || lower.includes("entrada esperada") || lower.includes("saída esperada")) return "Skill";
  return "Outro";
}

function convertUpload(uploadId, key) {
  const upload = findItem("uploads", uploadId);
  if (!upload) return;
  const base = {
    name: upload.file_name.replace(/\.[^.]+$/, "").replaceAll("-", " "),
    description: upload.description || `Criado a partir de ${upload.file_name}.`,
    tags: upload.tags || [],
    status: "rascunho",
    uploadIds: [upload.id],
    content_markdown: upload.content || "",
    system_prompt: upload.content || "",
    config_json: upload.content || ""
  };
  const item = itemBase(ENTITY_META[key].type, base);
  state[key].push(item);
  syncFileLinks(key, item.id, [upload.id], upload.classification === "MCP" ? "Configuração" : "Documento principal");
  saveState();
  route(key, item.id);
  render();
}

function importJson() {
  const target = document.getElementById("import-result");
  try {
    const data = JSON.parse(document.getElementById("import-json").value);
    const imported = [];
    Object.keys(ENTITY_META).forEach(key => {
      (data[key] || []).forEach(raw => {
        const exists = orgItems(key).some(x => x.slug === raw.slug);
        if (!exists) {
          const item = itemBase(ENTITY_META[key].type, { ...raw, id: uid(ENTITY_META[key].type), organization_id: state.currentOrgId, created_by: state.currentUserId, updated_by: state.currentUserId });
          state[key].push(item);
          imported.push(`${ENTITY_META[key].singular}: ${item.name || item.file_name}`);
        }
      });
    });
    state.import_logs.push({ id: uid("imp"), organization_id: state.currentOrgId, summary: imported, created_at: today(), created_by: state.currentUserId });
    saveState();
    target.innerHTML = `<div class="card"><strong>${imported.length} item(ns) importados.</strong><div class="list">${imported.map(x => `<div>${escapeHtml(x)}</div>`).join("") || "Duplicatas ignoradas por slug."}</div></div>`;
  } catch (error) {
    target.innerHTML = `<div class="notice">JSON inválido: ${escapeHtml(error.message)}</div>`;
  }
}

function exportPayload() {
  const payload = { organization: currentOrg(), exported_at: today() };
  Object.keys(ENTITY_META).forEach(key => payload[key] = orgItems(key));
  payload.file_links = (state.file_links || []).filter(l => l.organization_id === state.currentOrgId);
  payload.versions = (state.versions || []).filter(v => v.organization_id === state.currentOrgId);
  state.export_logs.push?.({ id: uid("exp"), organization_id: state.currentOrgId, created_at: today(), created_by: state.currentUserId });
  return payload;
}

function downloadJson(name, payload) {
  downloadBlob(name, JSON.stringify(payload, null, 2), "application/json");
}

function downloadUpload(id) {
  const upload = findItem("uploads", id);
  if (!upload) return;
  downloadBlob(upload.file_name, upload.content || "", upload.mime_type || "text/plain");
}

function downloadBlob(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function openUserModal() {
  modal = `<div class="modal-backdrop"><div class="modal"><header><h2>Adicionar usuário</h2><button data-close>Fechar</button></header><div class="modal-body form-grid"><label>Nome<input id="new-user-name"></label><label>Email<input id="new-user-email"></label><label>Papel<select id="new-user-role"><option>Viewer</option><option>Editor</option><option>Admin</option><option>Owner</option></select></label></div><footer><button data-close>Cancelar</button><button class="primary" data-action="save-user">Salvar</button></footer></div></div>`;
  render();
}

function saveUserFromModal() {
  state.users.push({ id: uid("usr"), organization_id: state.currentOrgId, name: itemValue("new-user-name"), email: itemValue("new-user-email"), role: itemValue("new-user-role"), created_at: today() });
  saveState(); modal = null; render();
}

function setParam(name, value, rerender = true) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  if (value) params.set(name, value); else params.delete(name);
  const base = location.hash.split("?")[0] || "#/dashboard";
  location.hash = `${base}${params.toString() ? `?${params}` : ""}`;
  if (rerender) render();
}

function getParam(name) {
  return new URLSearchParams(location.hash.split("?")[1] || "").get(name) || "";
}

function itemValue(id) {
  return document.getElementById(id)?.value || "";
}

function statusPill(status) {
  const cls = status === "ativo" ? "active" : status === "rascunho" ? "draft" : "archived";
  return `<span class="pill ${cls}">${escapeHtml(status || "rascunho")}</span>`;
}

function riskPill(level) {
  const cls = level === "alto" ? "high" : level === "médio" ? "medium" : "active";
  return `<span class="pill ${cls}">risco ${escapeHtml(level)}</span>`;
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "-";
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
}

render();
