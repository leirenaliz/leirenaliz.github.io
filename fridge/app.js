const STORAGE_KEY = "fridge.items.v1";
const SOON_DAYS = 3;

const $ = (id) => document.getElementById(id);
const form = $("add-form");
const nameInput = $("name");
const qtyInput = $("qty");
const expiryInput = $("expiry");
const itemsEl = $("items");
const emptyEl = $("empty");
const countEl = $("count");
const alertsEl = $("alerts");
const alertListEl = $("alert-list");

let items = load();
let activeFilter = "all";

document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  items.push({
    id: crypto.randomUUID(),
    name,
    qty: qtyInput.value.trim(),
    expiry: expiryInput.value || null,
    addedAt: new Date().toISOString().slice(0, 10),
  });
  save();
  form.reset();
  nameInput.focus();
  render();
});

itemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.remove");
  if (!btn) return;
  const id = btn.dataset.id;
  items = items.filter((it) => it.id !== id);
  save();
  render();
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(todayISO() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function statusOf(item) {
  const d = daysUntil(item.expiry);
  if (d === null) return "none";
  if (d < 0) return "expired";
  if (d <= SOON_DAYS) return "soon";
  return "fresh";
}

function statusLabel(item) {
  const d = daysUntil(item.expiry);
  if (d === null) return "no date";
  if (d < 0) return d === -1 ? "expired yesterday" : `expired ${-d}d ago`;
  if (d === 0) return "expires today";
  if (d === 1) return "expires tomorrow";
  return `${d}d left`;
}

function sortKey(item) {
  const d = daysUntil(item.expiry);
  return d === null ? Number.POSITIVE_INFINITY : d;
}

function render() {
  items.sort((a, b) => sortKey(a) - sortKey(b));

  const soon = items.filter((it) => {
    const s = statusOf(it);
    return s === "soon" || s === "expired";
  });

  if (soon.length === 0) {
    alertsEl.hidden = true;
    alertListEl.innerHTML = "";
  } else {
    alertsEl.hidden = false;
    alertListEl.innerHTML = soon
      .map((it) => `<li>${escapeHtml(it.name)} — ${escapeHtml(statusLabel(it))}</li>`)
      .join("");
  }

  const filtered = items.filter((it) => {
    if (activeFilter === "all") return true;
    return statusOf(it) === activeFilter;
  });

  countEl.textContent = `(${items.length})`;

  if (items.length === 0) {
    emptyEl.style.display = "block";
    emptyEl.textContent = "Your fridge is empty. Add something above.";
    itemsEl.innerHTML = "";
    return;
  }

  if (filtered.length === 0) {
    emptyEl.style.display = "block";
    emptyEl.textContent = "Nothing here for that filter.";
    itemsEl.innerHTML = "";
    return;
  }

  emptyEl.style.display = "none";
  itemsEl.innerHTML = filtered.map(renderItem).join("");
}

function renderItem(item) {
  const status = statusOf(item);
  const meta = [];
  if (item.qty) meta.push(escapeHtml(item.qty));
  if (item.expiry) meta.push(`exp ${escapeHtml(item.expiry)}`);
  return `
    <li class="item ${status}">
      <div class="item-main">
        <div class="item-name">${escapeHtml(item.name)}</div>
        ${meta.length ? `<div class="item-meta">${meta.join(" · ")}</div>` : ""}
      </div>
      <span class="badge ${status}">${escapeHtml(statusLabel(item))}</span>
      <button type="button" class="remove" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
    </li>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

render();
