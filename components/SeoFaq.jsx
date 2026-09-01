import { useState } from "react";
import { ORG, MUT, TXT, BG2, BDR, SANS, DISP } from "../lib/constants";

/**
 * Shared FAQ accordion for SEO/content pages.
 * Drop into: components/SeoFaq.jsx
 *
 * Extracted from the accordion pattern already used on index.jsx (click to
 * expand, one question open at a time, animated) so content pages match the
 * homepage instead of each hand-rolling a static, always-open Q&A list.
 * Also emits FAQPage JSON-LD automatically — previously only the homepage
 * did this, so every content page using this component picks up rich-
 * snippet eligibility for free.
 *
 * Usage:
 *   import SeoFaq from "../components/SeoFaq";
 *   <SeoFaq faqs={[{ q: "...", a: "..." }, ...]} />
 *
 * Replaces this pattern (do not use this old pattern in new pages):
 *   <SeoH2>FAQs</SeoH2>
 *   {faqs.map(({ q, a }) => ( ...static div... ))}
 */
export default function SeoFaq({ faqs, title = "FAQ" }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ fontFamily: DISP, fontSize: 28, color: TXT, letterSpacing: 0.5, marginBottom: 20 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map(({ q, a }, i) => (
          <div key={i} style={{ background: BG2, border: `1px solid ${openFaq === i ? "rgba(255,0,144,0.25)" : BDR}`, overflow: "hidden" }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 16 }}
            >
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TXT, textAlign: "left" }}>{q}</span>
              <span style={{ fontFamily: SANS, fontSize: 18, color: ORG, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
            </button>
            <div style={{ display: "grid", gridTemplateRows: openFaq === i ? "1fr" : "0fr", transition: "grid-template-rows .2s ease" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ padding: "0 20px 18px", fontFamily: SANS, fontSize: 13, color: MUT, lineHeight: 1.75 }}>{a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
