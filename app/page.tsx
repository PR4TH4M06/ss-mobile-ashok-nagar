"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { normalizeCat, normalizeLang, synthesizeSmartReview } from "@/lib/reviews";
import {
  categories,
  googleReviewUrl,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  shop,
  vcard,
  whatsappUrl,
} from "@/lib/shop";

const USED_IDS_KEY = "ss-mobile-used-reviews";
const USED_TEXTS_KEY = "ss-mobile-used-review-texts";

const copy = {
  en: {
    lbl: "Your Review",
    sub: "Share your experience",
    copy: "Copy & Paste on Google",
    done: "Copied! Opening Google… ✓",
    hint: "Tap to copy your review, then paste it on Google.",
    hint2: "Paste it in the review box on Google. 📝",
    disc: "Edit it to match your own experience before posting.",
    load: "AI is writing a new review...",
  },
  hi: {
    lbl: "Aapka Review",
    sub: "Apna experience share karein",
    copy: "Copy Karein & Google Pe Paste Karein",
    done: "Copy ho gaya! Google khul raha hai… ✓",
    hint: "Review copy karein, phir Google par paste karein.",
    hint2: "Google ke review box mein paste karein. 📝",
    disc: "Post karne se pehle ise apne experience ke hisaab se badlein.",
    load: "AI naya review likh raha hai...",
  },
};

type ReviewPayload = { review: string; id: string; source: "ai" };

function readList(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: string[], limit: number) {
  try {
    const next = [...new Set(items)].slice(-limit);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore storage quota errors */
  }
}

export default function Page() {
  const [cat, setCat] = useState("all");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [review, setReview] = useState("");
  const [shown, setShown] = useState("");
  const [hint, setHint] = useState(copy.en.hint);
  const [copied, setCopied] = useState(false);
  const [spin, setSpin] = useState(false);
  const [typing, setTyping] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const token = useRef(0);
  const raf = useRef<number | null>(null);
  const t = copy[lang];

  const typeText = useCallback((text: string) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const dur = Math.min(1700, Math.max(600, text.length * 10));
    let t0: number | null = null;
    setTyping(true);
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      setShown(text.slice(0, Math.floor(p * text.length)));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else {
        setShown(text);
        setTyping(false);
        raf.current = null;
      }
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const generateNext = useCallback((): ReviewPayload => {
    const usedIds = new Set(readList(USED_IDS_KEY));
    const usedTexts = readList(USED_TEXTS_KEY);
    const result = synthesizeSmartReview(
      normalizeCat(cat),
      normalizeLang(lang === "hi" ? "hinglish" : "en"),
      usedIds,
      usedTexts
    );
    writeList(USED_IDS_KEY, [...usedIds, result.id], 500);
    writeList(USED_TEXTS_KEY, [...usedTexts, result.text], 80);
    return { review: result.text, id: result.id, source: "ai" };
  }, [cat, lang]);

  const load = useCallback(() => {
    const my = ++token.current;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setTyping(false);
    setCopied(false);
    setHint(copy[lang].hint);

    const data = generateNext();
    if (my !== token.current) return;
    setReview(data.review);
    setAiReady(true);
    typeText(data.review);
  }, [lang, generateNext, typeText]);

  useEffect(() => {
    load();
  }, [load]);

  function saveContact() {
    const url = URL.createObjectURL(new Blob([vcard()], { type: "text/vcard" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "Avinash_Dogdhe_SS_Mobile.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function onCopy() {
    const ok = () => {
      setCopied(true);
      setHint(t.hint2);
      setTimeout(() => window.open(googleReviewUrl(), "_blank"), 900);
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = review;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
      ok();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(review).then(ok).catch(fallback);
    else fallback();
  }

  const phoneReady = !shop.phoneTel.includes("X");
  const wa = whatsappUrl();

  return (
    <>
      <div className="bar" />
      <div className="page">
        <Logo />
        <h1 className="sr">{shop.name}</h1>
        <div className="brand">{shop.tagline}</div>
        <div className="stars">★★★★★</div>
        <div className="sub">{t.sub}</div>

        <div className="cats">
          <div className="row">
            {categories.map((c) => (
              <button key={c.id} className={`chip${cat === c.id ? " on" : ""}`} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lang">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
            English
          </button>
          <button className={lang === "hi" ? "on" : ""} onClick={() => setLang("hi")}>
            Hinglish
          </button>
        </div>

        <div className="card">
          <div className="lbl">
            {t.lbl}
            {aiReady ? <span className="ai-pill">AI</span> : null}
          </div>
          <div id="rv" className={typing ? "typing" : ""}>
            {shown}
          </div>
          <div className="div" />
          <div className="btns">
            <button className={`cta${copied ? " ok" : ""}`} onClick={onCopy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? t.done : t.copy}</span>
            </button>
            <button
              className={`new${spin ? " spin" : ""}`}
              title="New review"
              onClick={() => {
                setSpin(true);
                setTimeout(() => setSpin(false), 450);
                load();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
          <div className="hint">{hint}</div>
          <div className="disc">{t.disc}</div>
        </div>

        <div className="icons">
          <a className="ib" href={shop.instagram} target="_blank" rel="noopener">
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </i>
            Instagram
          </a>
          <a className="ib" href={shop.facebook} target="_blank" rel="noopener">
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
              </svg>
            </i>
            Facebook
          </a>
          <a className="ib" href={wa} target={wa === "#" ? undefined : "_blank"} rel="noopener">
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.85-1.47A10 10 0 1 0 12 2zm0 18.15a8.1 8.1 0 0 1-4.15-1.14l-.298-.177-3.08.933.94-2.98-.194-.307A8.15 8.15 0 1 1 12 20.15z" />
              </svg>
            </i>
            WhatsApp
          </a>
          <a className="ib" href={phoneReady ? `tel:${shop.phoneTel}` : "#"}>
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </i>
            Call Us
          </a>
          <a className="ib" href={mapsDirectionsUrl()} target="_blank" rel="noopener">
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </i>
            Get
            <br />
            Directions
          </a>
          <button className="ib" onClick={saveContact} aria-label="Save Contact">
            <i>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </i>
            Save
            <br />
            Contact
          </button>
        </div>

        <div className="addr">
          {shop.address}
          <br />☎ {shop.phoneDisplay}
        </div>
        <div className="map">
          <iframe src={mapsEmbedUrl()} title="SS Mobile location" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
        </div>

        <div className="info">
          <h3>What we offer</h3>
          <ul>
            {shop.offers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
