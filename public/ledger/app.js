const entryStoreKey = "ledger-pilot-entries-v3";
const budgetStoreKey = "ledger-pilot-budgets-v3";

const text = {
  food: "\u9910\u996e",
  transport: "\u4ea4\u901a",
  housing: "\u5c45\u4f4f",
  shopping: "\u8d2d\u7269",
  work: "\u5de5\u4f5c",
  fun: "\u5a31\u4e50",
  income: "\u6536\u5165",
  other: "\u5176\u4ed6",
  alipay: "\u652f\u4ed8\u5b9d",
  wechat: "\u5fae\u4fe1",
  cash: "\u73b0\u91d1",
  bank: "\u94f6\u884c\u5361",
  credit: "\u4fe1\u7528\u5361",
  unmarked: "\u672a\u6807\u8bb0",
  expense: "\u652f\u51fa",
  emptyLedger: "\u8fd8\u6ca1\u6709\u6d41\u6c34\u3002\u5148\u5728\u5de6\u4fa7\u8f93\u5165\u4e00\u53e5\u8bdd\u8bd5\u8bd5\u3002",
  none: "\u6682\u65e0"
};

const categoryRules = [
  { name: text.food, words: ["\u996d", "\u5348\u996d", "\u665a\u996d", "\u65e9\u9910", "\u5496\u5561", "\u5976\u8336", "\u5916\u5356", "\u9910", "\u5403", "\u591c\u5bb5"] },
  { name: text.transport, words: ["\u6253\u8f66", "\u5730\u94c1", "\u516c\u4ea4", "\u9ad8\u94c1", "\u673a\u7968", "\u6cb9\u8d39", "\u505c\u8f66", "\u6ef4\u6ef4"] },
  { name: text.housing, words: ["\u623f\u79df", "\u6c34\u7535", "\u7269\u4e1a", "\u71c3\u6c14", "\u5bbd\u5e26", "\u7535\u8d39", "\u6c34\u8d39"] },
  { name: text.shopping, words: ["\u4e70", "\u8863\u670d", "\u4e66", "\u978b", "\u6dd8\u5b9d", "\u4eac\u4e1c", "\u793c\u7269", "\u8d85\u5e02"] },
  { name: text.work, words: ["\u5ba2\u6237", "\u5408\u540c", "\u6253\u5370", "\u529e\u516c", "\u8f6f\u4ef6", "\u8ba2\u9605", "\u5feb\u9012"] },
  { name: text.fun, words: ["\u7535\u5f71", "\u6e38\u620f", "\u4f1a\u5458", "\u6f14\u5531\u4f1a", "\u805a\u4f1a"] },
  { name: text.income, words: ["\u5de5\u8d44", "\u6536\u5165", "\u4ed8\u6b3e", "\u5230\u8d26", "\u517c\u804c", "\u5956\u91d1", "\u62a5\u9500", "\u9000\u6b3e"] }
];

const defaultBudgets = {
  [text.food]: 1500,
  [text.transport]: 500,
  [text.housing]: 2500,
  [text.shopping]: 1200,
  [text.work]: 800,
  [text.fun]: 600,
  [text.other]: 500
};

const state = {
  entries: loadJson(entryStoreKey, []),
  budgets: loadJson(budgetStoreKey, defaultBudgets)
};

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#entryInput").value = button.dataset.sample;
  });
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelector("#parseButton").addEventListener("click", addNaturalEntries);
document.querySelector("#entryInput").addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") addNaturalEntries();
});
document.querySelector("#clearButton").addEventListener("click", clearEntries);
document.querySelector("#saveBudgets").addEventListener("click", saveBudgetInputs);
document.querySelector("#exportCsv").addEventListener("click", exportCsv);
document.querySelector("#copyReport").addEventListener("click", copyReport);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function addNaturalEntries() {
  const input = document.querySelector("#entryInput").value.trim();
  if (!input) {
    setNote("\u5148\u5199\u4e00\u7b14\u8d26\uff0c\u6bd4\u5982\uff1a\u5348\u996d32\uff0c\u5730\u94c14\uff0c\u5de5\u8d445000\u3002");
    return;
  }

  const parsed = parseEntries(input);
  if (!parsed.length) {
    setNote("\u6211\u6ca1\u8bc6\u522b\u5230\u91d1\u989d\u3002\u8bd5\u8bd5\u5199\u6210\uff1a\u5348\u996d32 \u6216 \u5de5\u8d44\u6536\u51655000\u3002");
    return;
  }

  state.entries.unshift(...parsed);
  saveEntries();
  document.querySelector("#entryInput").value = "";
  render();
  const budgetAlerts = getBudgetAlerts();
  if (budgetAlerts.over.length) {
    setNote(`\u5df2\u5165\u8d26 ${parsed.length} \u7b14\u3002\u9884\u7b97\u8d85\u989d\uff1a${budgetAlerts.over.map((item) => `${item.category} ${item.ratio}%`).join("\u3001")}\uff0c\u5efa\u8bae\u7acb\u523b\u63a7\u5236\u8be5\u7c7b\u652f\u51fa\u3002`);
  } else if (budgetAlerts.warn.length) {
    setNote(`\u5df2\u5165\u8d26 ${parsed.length} \u7b14\u3002\u9884\u7b97\u9884\u8b66\uff1a${budgetAlerts.warn.map((item) => `${item.category} ${item.ratio}%`).join("\u3001")}\u3002`);
  } else {
    setNote(`\u5df2\u5165\u8d26 ${parsed.length} \u7b14\uff1a${parsed.map((item) => item.title).join("\u3001")}\u3002`);
  }
}

function parseEntries(input) {
  const normalized = input
    .replaceAll("\uff0c", ",")
    .replaceAll("\u3001", ",")
    .replaceAll("\u3002", ",")
    .replaceAll("\uff1b", ",");
  const chunks = normalized
    .split(/[,;\n]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.flatMap((chunk) => {
    const matches = [...chunk.matchAll(/(\d+(?:\.\d+)?)/g)];
    if (!matches.length) return [];
    const account = detectAccount(chunk);
    const date = detectDate(chunk);

    return matches.map((match) => {
      const amount = Number(match[1]);
      const rawTitle = chunk
        .replace(match[0], "")
        .replace(/[\u4eca\u5929\u6628\u65e5\u6628\u5929\u524d\u5929\u672c\u6708\u8fd9\u4e2a\u6708\u82b1\u4e86\u82b1\u8d39\u6d88\u8d39\u652f\u51fa\u82b1\u6389\u7528\u4e86\u652f\u4ed8\u4ed8\u4e86\u6536\u5165\u5230\u8d26\uffe5\u00a5\u5143\u5757\u4eba\u6c11\u5e01]/g, "")
        .replace(/\u652f\u4ed8\u5b9d|\u5fae\u4fe1|\u73b0\u91d1|\u94f6\u884c\u5361|\u4fe1\u7528\u5361/g, "")
        .trim();
      const title = rawTitle || inferFallbackTitle(chunk);
      const category = detectCategory(chunk);
      const type = category === text.income || /\u6536\u5165|\u5de5\u8d44|\u4ed8\u6b3e|\u5230\u8d26|\u517c\u804c|\u5956\u91d1|\u62a5\u9500|\u9000\u6b3e/.test(chunk) ? "income" : "expense";

      return {
        id: crypto.randomUUID(),
        date,
        title: title.slice(0, 28),
        category: type === "income" ? text.income : category,
        account,
        amount,
        type
      };
    });
  });
}

function detectCategory(value) {
  const found = categoryRules.find((category) => category.words.some((word) => value.includes(word)));
  return found ? found.name : text.other;
}

function detectAccount(value) {
  if (value.includes(text.alipay)) return text.alipay;
  if (value.includes(text.wechat)) return text.wechat;
  if (value.includes(text.cash)) return text.cash;
  if (value.includes(text.credit)) return text.credit;
  if (value.includes(text.bank)) return text.bank;
  return text.unmarked;
}

function detectDate(value) {
  const date = new Date();
  if (value.includes("\u6628\u5929") || value.includes("\u6628\u65e5")) date.setDate(date.getDate() - 1);
  if (value.includes("\u524d\u5929")) date.setDate(date.getDate() - 2);
  return date.toISOString();
}

function inferFallbackTitle(value) {
  const category = detectCategory(value);
  if (category === text.income) return text.income;
  return category === text.other ? "\u672a\u547d\u540d\u6d41\u6c34" : category;
}

function render() {
  const totals = getTotals();
  const monthName = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long" }).format(new Date());

  document.querySelector("#incomeTotal").textContent = money(totals.income);
  document.querySelector("#expenseTotal").textContent = money(totals.expense);
  document.querySelector("#netBalance").textContent = money(totals.income - totals.expense);
  document.querySelector("#entryCount").textContent = String(state.entries.length);
  document.querySelector("#dailyAverage").textContent = money(totals.expense / new Date().getDate());
  document.querySelector("#monthLabel").textContent = monthName;

  renderBudgetInputs();
  renderBudgetAlerts();
  renderCategoryBars(totals.expense);
  renderLedger();
  renderInsight(totals);
  renderReport(totals);
}

function renderBudgetInputs() {
  const usage = categoryExpenseTotals();
  document.querySelector("#budgetInputs").innerHTML = Object.entries(state.budgets)
    .map(([category, budget]) => {
      const spent = usage[category] || 0;
      const ratio = Math.round((spent / Math.max(budget, 1)) * 100);
      const cappedRatio = Math.min(100, ratio);
      const level = ratio >= 100 ? "over" : ratio >= 80 ? "warn" : "safe";
      const color = level === "over" ? "var(--red)" : level === "warn" ? "var(--yellow)" : "var(--mint)";
      return `
        <label class="budget-row ${level}">
          <span>${escapeHtml(category)}</span>
          <input data-budget="${escapeHtml(category)}" value="${budget}" inputmode="decimal" />
          <strong>${ratio}%</strong>
          <span></span>
          <span class="budget-meter"><span style="width:${cappedRatio}%;background:${color}"></span></span>
        </label>
      `;
    })
    .join("");
}

function renderBudgetAlerts() {
  const alerts = getBudgetAlerts();
  const container = document.querySelector("#budgetAlerts");
  const items = [...alerts.over, ...alerts.warn];
  if (!items.length) {
    container.innerHTML = `<div class="budget-alert safe">\u9884\u7b97\u72b6\u6001\u6b63\u5e38\uff0c\u6682\u65e0\u8d85\u989d\u6216\u9ad8\u98ce\u9669\u5206\u7c7b\u3002</div>`;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const isOver = item.level === "over";
      const overText = isOver ? `\uff0c\u5df2\u8d85\u51fa ${money(item.spent - item.budget)}` : `\uff0c\u5269\u4f59 ${money(Math.max(item.budget - item.spent, 0))}`;
      return `
        <div class="budget-alert ${item.level}">
          <strong>${isOver ? "\u8d85\u989d" : "\u9884\u8b66"}\uff1a${escapeHtml(item.category)} ${item.ratio}%</strong>
          <span>\u5df2\u7528 ${money(item.spent)} / \u9884\u7b97 ${money(item.budget)}${overText}</span>
        </div>
      `;
    })
    .join("");
}

function renderCategoryBars(totalExpense) {
  const totals = categoryExpenseTotals();
  const rows = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  document.querySelector("#categoryBars").innerHTML = rows.length
    ? rows
        .map(([category, amount], index) => {
          const ratio = Math.round((amount / Math.max(totalExpense, 1)) * 100);
          const colors = ["var(--mint)", "var(--blue)", "var(--yellow)", "var(--red)", "var(--violet)", "#ff9f43"];
          return `
            <div class="bar-row">
              <span>${escapeHtml(category)}</span>
              <span class="bar-track"><span style="width:${ratio}%;background:${colors[index]}"></span></span>
              <strong>${money(amount)}</strong>
            </div>
          `;
        })
        .join("")
    : `<div class="bar-row"><span>${text.none}</span><span class="bar-track"><span></span></span><strong>${money(0)}</strong></div>`;
}

function renderLedger() {
  const body = document.querySelector("#ledgerBody");
  if (!state.entries.length) {
    body.innerHTML = `<tr><td colspan="7">${text.emptyLedger}</td></tr>`;
    return;
  }

  body.innerHTML = state.entries
    .map((entry) => {
      const date = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(entry.date));
      return `
        <tr>
          <td>${date}</td>
          <td><span class="type ${entry.type}">${entry.type === "income" ? text.income : text.expense}</span></td>
          <td>${escapeHtml(entry.title)}</td>
          <td>${escapeHtml(entry.category)}</td>
          <td>${escapeHtml(entry.account || text.unmarked)}</td>
          <td>${entry.type === "income" ? "+" : "-"}${money(entry.amount)}</td>
          <td><button class="delete" data-id="${entry.id}" aria-label="delete">x</button></td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll(".delete").forEach((button) => {
    button.addEventListener("click", () => {
      state.entries = state.entries.filter((entry) => entry.id !== button.dataset.id);
      saveEntries();
      render();
    });
  });
}

function renderInsight(totals) {
  const top = topCategory();
  const budgetAlerts = getBudgetAlerts();

  let message = "\u76ee\u524d\u652f\u51fa\u7ed3\u6784\u5065\u5eb7\u3002\u7ee7\u7eed\u4fdd\u6301\u6bcf\u7b14\u53ca\u65f6\u8bb0\u5f55\uff0c\u6708\u5e95\u62a5\u544a\u4f1a\u66f4\u51c6\u3002";
  if (!state.entries.length) {
    message = "\u6dfb\u52a0\u51e0\u7b14\u8d26\u540e\uff0c\u6211\u4f1a\u81ea\u52a8\u5224\u65ad\u6700\u9ad8\u652f\u51fa\u5206\u7c7b\u548c\u9884\u7b97\u98ce\u9669\u3002";
  } else if (budgetAlerts.over.length) {
    message = `\u9884\u7b97\u8d85\u989d\uff1a${budgetAlerts.over.map((item) => `${item.category} \u5df2\u7528 ${item.ratio}%`).join("\uff1b")}\u3002\u5efa\u8bae\u7acb\u523b\u6682\u505c\u8fd9\u4e9b\u5206\u7c7b\u7684\u975e\u5fc5\u8981\u652f\u51fa\u3002`;
  } else if (budgetAlerts.warn.length) {
    message = `\u9884\u7b97\u9884\u8b66\uff1a${budgetAlerts.warn.map((item) => `${item.category} \u5df2\u7528 ${item.ratio}%`).join("\uff1b")}\u3002\u5efa\u8bae\u63a5\u4e0b\u6765 7 \u5929\u4f18\u5148\u63a7\u5236\u8fd9\u4e9b\u5206\u7c7b\u3002`;
  } else if (totals.expense > totals.income && totals.income > 0) {
    message = `\u672c\u6708\u652f\u51fa\u5df2\u7ecf\u9ad8\u4e8e\u6536\u5165 ${money(totals.expense - totals.income)}\uff0c\u5efa\u8bae\u5148\u6682\u505c\u975e\u5fc5\u8981\u6d88\u8d39\u3002`;
  } else if (top) {
    message = `\u672c\u6708\u6700\u9ad8\u652f\u51fa\u662f\u300c${top.name}\u300d${money(top.amount)}\uff0c\u5360\u603b\u652f\u51fa\u7684 ${Math.round((top.amount / Math.max(totals.expense, 1)) * 100)}%\u3002`;
  }

  document.querySelector("#insightText").textContent = message;
}

function renderReport(totals) {
  const top = topCategory();
  const account = topAccount();
  const net = totals.income - totals.expense;
  const savingsRate = totals.income > 0 ? Math.round((net / totals.income) * 100) : 0;
  const report = [
    `\u672c\u6708\u6536\u5165 ${money(totals.income)}\uff0c\u652f\u51fa ${money(totals.expense)}\uff0c\u7ed3\u4f59 ${money(net)}\uff0c\u50a8\u84c4\u7387 ${savingsRate}%\u3002`,
    top ? `\u6700\u9ad8\u652f\u51fa\u5206\u7c7b\u662f\u300c${top.name}\u300d\uff0c\u91d1\u989d ${money(top.amount)}\u3002` : "\u76ee\u524d\u8fd8\u6ca1\u6709\u8db3\u591f\u7684\u652f\u51fa\u6570\u636e\u3002",
    account ? `\u6700\u5e38\u7528\u8d26\u6237\u662f\u300c${account.name}\u300d\uff0c\u7d2f\u8ba1\u8bb0\u5f55 ${money(account.amount)}\u3002` : "\u8d26\u6237\u6570\u636e\u8fd8\u4e0d\u591f\u660e\u786e\u3002",
    nextAction(totals, top)
  ].join("\n");

  document.querySelector("#reportText").textContent = report;
}

function nextAction(totals, top) {
  if (!state.entries.length) return "\u4e0b\u4e00\u6b65\uff1a\u5148\u8fde\u7eed\u8bb0\u5f55 3 \u5929\uff0c\u8ba9\u667a\u80fd\u4f53\u5efa\u7acb\u4f60\u7684\u6d88\u8d39\u57fa\u7ebf\u3002";
  if (totals.expense > totals.income && totals.income > 0) return "\u4e0b\u4e00\u6b65\uff1a\u652f\u51fa\u5df2\u7ecf\u9ad8\u4e8e\u6536\u5165\uff0c\u5efa\u8bae\u9a6c\u4e0a\u6807\u8bb0\u975e\u5fc5\u8981\u6d88\u8d39\u3002";
  if (top && top.amount > totals.expense * 0.45) return `\u4e0b\u4e00\u6b65\uff1a\u91cd\u70b9\u68c0\u67e5\u300c${top.name}\u300d\u5206\u7c7b\uff0c\u770b\u770b\u662f\u5426\u6709\u53ef\u5ef6\u540e\u6216\u53ef\u66ff\u4ee3\u7684\u9879\u76ee\u3002`;
  return "\u4e0b\u4e00\u6b65\uff1a\u53ef\u4ee5\u6bcf\u5929\u665a\u4e0a\u590d\u5236\u62a5\u544a\uff0c\u5f62\u6210\u5468\u62a5\u548c\u6708\u62a5\u3002";
}

function saveBudgetInputs() {
  document.querySelectorAll("[data-budget]").forEach((input) => {
    const value = Number(input.value);
    if (Number.isFinite(value) && value >= 0) state.budgets[input.dataset.budget] = value;
  });
  localStorage.setItem(budgetStoreKey, JSON.stringify(state.budgets));
  render();
  const budgetAlerts = getBudgetAlerts();
  if (budgetAlerts.over.length) {
    setNote(`\u9884\u7b97\u5df2\u4fdd\u5b58\uff0c\u4f46\u6709 ${budgetAlerts.over.length} \u4e2a\u5206\u7c7b\u5df2\u8d85\u989d\u3002`);
  } else if (budgetAlerts.warn.length) {
    setNote(`\u9884\u7b97\u5df2\u4fdd\u5b58\uff0c\u6709 ${budgetAlerts.warn.length} \u4e2a\u5206\u7c7b\u63a5\u8fd1\u4e0a\u9650\u3002`);
  } else {
    setNote("\u9884\u7b97\u5df2\u4fdd\u5b58\u3002");
  }
}

function clearEntries() {
  state.entries = [];
  saveEntries();
  setNote("\u6d41\u6c34\u5df2\u6e05\u7a7a\u3002");
  render();
}

function exportCsv() {
  const header = ["date", "type", "title", "category", "account", "amount"];
  const rows = state.entries.map((entry) => [
    new Date(entry.date).toISOString().slice(0, 10),
    entry.type === "income" ? text.income : text.expense,
    entry.title,
    entry.category,
    entry.account || text.unmarked,
    entry.amount
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ledger-pilot.csv";
  link.click();
  URL.revokeObjectURL(url);
  setNote("CSV \u5df2\u5bfc\u51fa\u3002");
}

async function copyReport() {
  const reportText = document.querySelector("#reportText").innerText.trim();
  try {
    await navigator.clipboard.writeText(reportText);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = reportText;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
  setNote("\u6708\u5ea6\u62a5\u544a\u5df2\u590d\u5236\u3002");
}

function getTotals() {
  return {
    income: sumBy((entry) => entry.type === "income"),
    expense: sumBy((entry) => entry.type === "expense")
  };
}

function categoryExpenseTotals() {
  return state.entries
    .filter((entry) => entry.type === "expense")
    .reduce((totals, entry) => {
      totals[entry.category] = (totals[entry.category] || 0) + entry.amount;
      return totals;
    }, {});
}

function topCategory() {
  return Object.entries(categoryExpenseTotals())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)[0];
}

function getBudgetAlerts() {
  const usage = categoryExpenseTotals();
  const alerts = Object.entries(state.budgets)
    .map(([category, budget]) => {
      const spent = usage[category] || 0;
      const ratio = Math.round((spent / Math.max(budget, 1)) * 100);
      return {
        category,
        budget,
        spent,
        ratio,
        level: ratio >= 100 ? "over" : ratio >= 80 ? "warn" : "safe"
      };
    })
    .filter((item) => item.budget > 0 && item.ratio >= 80)
    .sort((a, b) => b.ratio - a.ratio);

  return {
    over: alerts.filter((item) => item.level === "over"),
    warn: alerts.filter((item) => item.level === "warn")
  };
}

function topAccount() {
  const totals = state.entries.reduce((map, entry) => {
    const account = entry.account || text.unmarked;
    map[account] = (map[account] || 0) + entry.amount;
    return map;
  }, {});
  return Object.entries(totals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)[0];
}

function sumBy(predicate) {
  return state.entries.filter(predicate).reduce((sum, entry) => sum + entry.amount, 0);
}

function money(value) {
  return `\u00a5${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function setNote(value) {
  document.querySelector("#agentNote").textContent = value;
}

function saveEntries() {
  localStorage.setItem(entryStoreKey, JSON.stringify(state.entries));
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
