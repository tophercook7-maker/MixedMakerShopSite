export default async (req) => {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    const strategy = (url.searchParams.get("strategy") || "mobile").toLowerCase();

    if (!target) {
      return new Response(JSON.stringify({ error: "Missing url parameter" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    let parsedTarget;
    try {
      parsedTarget = new URL(target.startsWith("http") ? target : "https://" + target);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (!["http:", "https:"].includes(parsedTarget.protocol)) {
      return new Response(JSON.stringify({ error: "URL must be http or https" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = process.env.PAGESPEED_API_KEY || "";
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server missing PAGESPEED_API_KEY" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const endpoint = new URL("https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", parsedTarget.toString());
    endpoint.searchParams.set("strategy", strategy === "desktop" ? "desktop" : "mobile");
    endpoint.searchParams.set("key", apiKey);
    endpoint.searchParams.append("category", "performance");
    endpoint.searchParams.append("category", "accessibility");
    endpoint.searchParams.append("category", "best-practices");
    endpoint.searchParams.append("category", "seo");

    const resp = await fetch(endpoint.toString(), { method: "GET" });
    const data = await resp.json();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "PageSpeed API error", details: data }), {
        status: resp.status,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=60",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected server error", details: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
