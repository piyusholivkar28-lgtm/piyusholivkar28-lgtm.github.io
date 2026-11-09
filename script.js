/* Piyush Olivkar — site behaviour: menu, consent-gated analytics, reveal, lightbox. */
document.documentElement.classList.add("js");

/* ---------- Analytics (only after consent) ---------- */
const GA_MEASUREMENT_ID = "G-Y3CQW7PE4V";
const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
const store = {
  get(k, s = localStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = localStorage) { try { s.setItem(k, v); } catch {} },
  del(k, s = localStorage) { try { s.removeItem(k); } catch {} }
};
const getCampaign = () => { try { return JSON.parse(store.get("outreach-campaign", sessionStorage) || "{}"); } catch { return {}; } };
const captureCampaign = () => {
  const q = new URLSearchParams(location.search), c = {};
  campaignKeys.forEach(k => { const v = q.get(k); if (v) c[k] = v; });
  if (Object.keys(c).length) store.set("outreach-campaign", JSON.stringify(c), sessionStorage);
};
const startAnalytics = () => {
  if (document.getElementById("google-analytics")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.id = "google-analytics"; s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  const c = getCampaign();
  if (c.utm_campaign) gtag("event", "outreach_campaign_visit", c);
};
const track = (name, params = {}) => {
  if (store.get("analytics-consent") !== "granted" || typeof gtag !== "function") return;
  gtag("event", name, { ...getCampaign(), ...params });
};
captureCampaign();
if (store.get("analytics-consent") === "granted") startAnalytics();

const consent = document.querySelector(".analyticsConsent");
if (consent && !store.get("analytics-consent")) consent.hidden = false;
consent?.querySelectorAll("[data-consent]").forEach(b => b.addEventListener("click", () => {
  const choice = b.dataset.consent;
  store.set("analytics-consent", choice);
  if (choice === "granted") startAnalytics();
  consent.hidden = true;
}));
document.querySelector(".privacyReset")?.addEventListener("click", () => { store.del("analytics-consent"); location.reload(); });

/* ---------- Mobile menu ---------- */
const menu = document.querySelector(".menuButton"), nav = document.querySelector(".nav");
menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "Close" : "Menu";
});

/* ---------- Click tracking ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest?.("a"); if (!a) return;
  const href = a.getAttribute("href") || "";
  if (a.classList.contains("initiativeInvite")) track("talk_invitation_click");
  else if (/\.pdf(?:$|\?)/i.test(href)) track(/CV/i.test(href) ? "cv_download" : "pdf_open", { file: href });
  else if (href.startsWith("mailto:")) track("email_click");
  else if (href.includes("drive.google.com")) track("fdp_video_open");
  else if (/linkedin\.com|facebook\.com/.test(href)) track("social_link_click", { destination: new URL(href, location.href).hostname });
  else if (/scholar\.google|orcid\.org|github\.com/.test(href)) track("academic_profile_click", { destination: new URL(href, location.href).hostname });
});

/* ---------- Section views + reveal on scroll ---------- */
const viewed = new Set();
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const t = en.target;
    if (t.classList.contains("reveal")) { t.classList.add("in"); io.unobserve(t); }
    if (t.id && !viewed.has(t.id)) { viewed.add(t.id); track("section_view", { section_id: t.id }); }
  }), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, main section[id]").forEach(el => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
}

/* ---------- Lightbox for photos ---------- */
const links = document.querySelectorAll("a[data-lightbox]");
if (links.length && typeof HTMLDialogElement === "function") {
  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.innerHTML = '<button type="button" aria-label="Close">×</button><img alt=""><p></p>';
  document.body.appendChild(dlg);
  const img = dlg.querySelector("img"), cap = dlg.querySelector("p");
  dlg.querySelector("button").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  links.forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const thumb = a.querySelector("img");
    img.src = a.href; img.alt = thumb?.alt || "";
    cap.textContent = thumb?.alt || "";
    dlg.showModal();
  }));
}
