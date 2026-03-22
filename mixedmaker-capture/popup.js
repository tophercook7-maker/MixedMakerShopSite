const QUICK_ADD_ORIGIN = "https://mixedmakershop.com";

async function getPageData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          const text = document.body.innerText;

          const phoneMatch = text.match(/(\+?\d[\d\-\(\) ]{7,}\d)/);
          const emailMatch = text.match(/[^\s]+@[^\s]+\.[^\s]+/);

          return {
            title: document.title,
            url: window.location.href,
            phone: phoneMatch ? phoneMatch[0] : "",
            email: emailMatch ? emailMatch[0] : ""
          };
        }
      },
      (results) => {
        const first = results && results[0];
        if (!first || first.result == null) {
          reject(new Error("Could not read this page."));
          return;
        }
        resolve(first.result);
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await getPageData();
    document.getElementById("name").value = data.title;
    document.getElementById("website").value = data.url;
    document.getElementById("phone").value = data.phone;
    document.getElementById("email").value = data.email;
  } catch {
    // Restricted pages (e.g. chrome://) — leave fields empty.
  }

  document.getElementById("save").onclick = async () => {
    const pageUrl = document.getElementById("website").value;
    const payload = {
      name: document.getElementById("name").value,
      website: pageUrl,
      source_url: pageUrl,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      notes: document.getElementById("notes").value,
      source: "extension"
    };

    const res = await fetch(`${QUICK_ADD_ORIGIN}/api/crm/quick-add`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = await res.json().catch(() => ({}));

    if (res.ok && body.ok) {
      const msg = body.message || "Saved to Leads.";
      const leadId = body.leadId ? String(body.leadId) : "";
      const listWithHighlight = leadId
        ? `/admin/leads?highlight=${encodeURIComponent(leadId)}`
        : "/admin/leads";
      if (leadId && confirm(`${msg}\n\nOpen Leads in a new tab? (Your new capture will be highlighted.)`)) {
        chrome.tabs.create({ url: `${QUICK_ADD_ORIGIN}${listWithHighlight}` });
      } else {
        alert(msg);
      }
    } else {
      alert(body.error || "Could not save. Sign in to MixedMaker in this browser and try again.");
    }
  };
});
