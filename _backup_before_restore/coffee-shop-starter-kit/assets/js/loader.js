/* Loads content from EDIT_BASICS.txt and EDIT_MENU.txt and injects into pages. */
/* Works when served over HTTP (Netlify, local server). For file:// preview, uses fallback values. */

const DEFAULTS = {
  businessName: "Coffee House",
  tagline: "Fresh coffee • Cozy vibe",
  phoneDisplay: "(501) 555-0123",
  phoneLink: "+15015550123",
  email: "hello@yourcoffeehouse.com",
  address1: "123 Main Street",
  address2: "Your Town, AR 71901",
  hours: "Mon–Fri: 6:30am – 4:00pm<br/>Sat: 7:00am – 3:00pm<br/>Sun: Closed",
  orderOnlineUrl: ""
};

const BASIC_KEYS = {
  "Business Name": "businessName",
  "Tagline": "tagline",
  "Phone (what customers see)": "phoneDisplay",
  "Phone (for tap-to-call, numbers only)": "phoneLink",
  "Email": "email",
  "Address Line 1": "address1",
  "Address Line 2": "address2",
  "Hours (use | where you want a line break)": "hours",
  "Order Online link (leave blank if none)": "orderOnlineUrl"
};

async function loadText(path) {
  const res = await fetch(path, { cache: "no-store" });
  return await res.text();
}

function parseBasics(text) {
  const out = { ...DEFAULTS };
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [label, key] of Object.entries(BASIC_KEYS)) {
      if (line.startsWith(label + ": ")) {
        let val = line.slice(label.length + 2).trim();
        if (key === "hours") val = val.replace(/\|/g, "<br/>");
        if (val) out[key] = val;
        break;
      }
    }
  }
  return out;
}

function parseMenu(text) {
  // Use content after "---" separator if present
  const sep = text.indexOf("---");
  const body = sep >= 0 ? text.slice(sep + 3) : text;
  // Parse <h3>...</h3> and <div class="item">...</div> format, wrap each section in card menuCard
  const re = /<h3>([^<]*)<\/h3>([\s\S]*?)(?=<h3>|$)/g;
  let html = "";
  let m;
  while ((m = re.exec(body)) !== null) {
    const title = m[1].trim();
    const items = m[2].trim();
    if (!title) continue;
    html += '<div class="card menuCard"><h3>' + escapeHtml(title) + "</h3>" + items + "</div>";
  }
  return html || null;
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function setAll(selector, html) {
  document.querySelectorAll(selector).forEach(el => el.innerHTML = html);
}

async function run() {
  let basics = { ...DEFAULTS };
  let menuHtml = "";

  try {
    const basicsText = await loadText("EDIT_BASICS.txt");
    basics = parseBasics(basicsText);

    const menuText = await loadText("EDIT_MENU.txt");
    menuHtml = parseMenu(menuText);
  } catch (e) {
    /* file:// or CORS: use defaults */
  }

  setAll("[data-fill='businessName']", basics.businessName);
  setAll("[data-fill='tagline']", basics.tagline);
  setAll("[data-fill='phoneDisplay']", basics.phoneDisplay);
  document.querySelectorAll("[data-fill='phoneLink']").forEach(a => {
    a.setAttribute("href", basics.phoneLink ? "tel:" + basics.phoneLink : "#");
  });
  setAll("[data-fill='email']", basics.email);
  document.querySelectorAll("[data-fill='emailLink']").forEach(a => {
    a.setAttribute("href", basics.email ? "mailto:" + basics.email : "#");
  });
  setAll("[data-fill='address1']", basics.address1);
  setAll("[data-fill='address2']", basics.address2);
  setAll("[data-fill='hours']", basics.hours);

  document.querySelectorAll("[data-fill='orderOnline']").forEach(a => {
    if (basics.orderOnlineUrl) {
      a.setAttribute("href", basics.orderOnlineUrl);
      a.style.display = "";
    } else {
      a.style.display = "none";
    }
  });

  const menuTarget = document.getElementById("menuInjected");
  if (menuTarget && menuHtml) {
    menuTarget.innerHTML = menuHtml;
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

run();
