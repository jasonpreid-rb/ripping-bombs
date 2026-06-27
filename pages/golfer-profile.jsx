import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

// Design tokens
const ORG = "#a3e635";
const MUT = "#6b7280";
const TXT = "#f5f5f5";
const BG2 = "#1a1a1a";
const BG3 = "#242424";
const BDR = "#2e2e2e";
const DIM = "#9ca3af";
const SANS = "'Inter', sans-serif";
const DISP = "'Barlow Condensed', sans-serif";

// ─── Inline mock screenshots ────────────────────────────────────────────────

function ProfileUrlBadge({ username = "jake-henderson" }) {
  return (
    <div style={{
      background: BG3,
      border: `1px solid ${BDR}`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      fontFamily: SANS,
    }}>
      <span style={{ color: MUT, fontSize: 13 }}>rippingbombs.com/</span>
      <span style={{ color: ORG, fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
        {username}
      </span>
      <span style={{
        background: "#a3e63520",
        color: ORG,
        border: `1px solid ${ORG}40`,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}>YOUR LINK</span>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div style={{
      background: BG3,
      border: `1px solid ${BDR}`,
      borderRadius: 16,
      overflow: "hidden",
      fontFamily: SANS,
      maxWidth: 680,
      margin: "0 auto",
      boxShadow: "0 24px 64px #00000060",
    }}>
      {/* Browser chrome */}
      <div style={{
        background: "#111",
        borderBottom: `1px solid ${BDR}`,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          background: "#1e1e1e",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          color: DIM,
          flex: 1,
          maxWidth: 320,
        }}>
          rippingbombs.com/<span style={{ color: ORG }}>jake-henderson</span>
        </div>
      </div>

      {/* Profile header */}
      <div style={{
        background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)",
        padding: "28px 28px 20px",
        borderBottom: `1px solid ${BDR}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ORG}30, ${ORG}10)`,
            border: `2px solid ${ORG}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}>🏌️</div>
          <div>
            <div style={{ color: TXT, fontWeight: 700, fontSize: 18, fontFamily: DISP, letterSpacing: "0.02em" }}>
              Jake Henderson
            </div>
            <div style={{ color: DIM, fontSize: 13, marginTop: 2 }}>
              Member since Jan 2025 · Sydney, AU
            </div>
          </div>
          {/* Ranking badge */}
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{
              background: `linear-gradient(135deg, ${ORG}25, ${ORG}10)`,
              border: `1px solid ${ORG}50`,
              borderRadius: 10,
              padding: "8px 16px",
            }}>
              <div style={{ color: ORG, fontWeight: 800, fontSize: 22, fontFamily: DISP, lineHeight: 1 }}>
                #847
              </div>
              <div style={{ color: DIM, fontSize: 10, letterSpacing: "0.06em", marginTop: 2 }}>
                WORLD RANK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        borderBottom: `1px solid ${BDR}`,
      }}>
        {[
          { label: "Best Drive", value: "312 yds", sub: "Personal best" },
          { label: "Avg Drive", value: "287 yds", sub: "Last 10 rounds" },
          { label: "Total Drives", value: "48", sub: "Recorded" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "16px 20px",
            borderRight: i < 2 ? `1px solid ${BDR}` : "none",
          }}>
            <div style={{ color: TXT, fontWeight: 700, fontSize: 18, fontFamily: DISP }}>
              {s.value}
            </div>
            <div style={{ color: ORG, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
              {s.label}
            </div>
            <div style={{ color: MUT, fontSize: 11, marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Drive history */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ color: DIM, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 12 }}>
          RECENT DRIVES
        </div>
        {[
          { date: "22 Jun 2025", venue: "Ace Golf Sims", dist: "312", rank: "#1 at venue" },
          { date: "15 Jun 2025", venue: "SwingZone Melbourne", dist: "298", rank: "#3 at venue" },
          { date: "3 Jun 2025", venue: "Ace Golf Sims", dist: "291", rank: "#2 at venue" },
        ].map((d, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: i < 2 ? `1px solid ${BDR}` : "none",
            gap: 12,
          }}>
            <div style={{
              background: `${ORG}15`,
              color: ORG,
              fontWeight: 700,
              fontFamily: DISP,
              fontSize: 17,
              padding: "4px 10px",
              borderRadius: 6,
              minWidth: 64,
              textAlign: "center",
            }}>{d.dist} yds</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: TXT, fontSize: 13 }}>{d.venue}</div>
              <div style={{ color: MUT, fontSize: 11 }}>{d.date}</div>
            </div>
            <div style={{
              color: ORG,
              fontSize: 11,
              fontWeight: 600,
              background: `${ORG}10`,
              padding: "3px 8px",
              borderRadius: 4,
            }}>{d.rank}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingMockup() {
  return (
    <div style={{
      background: BG3,
      border: `1px solid ${BDR}`,
      borderRadius: 16,
      padding: 24,
      fontFamily: SANS,
      maxWidth: 520,
      margin: "0 auto",
    }}>
      <div style={{ color: DIM, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 16 }}>
        WORLD LEADERBOARD · JUNE 2025
      </div>
      {[
        { rank: 845, name: "Chris Tamara", dist: 334, country: "🇺🇸" },
        { rank: 846, name: "Priya Nath", dist: 318, country: "🇦🇺" },
        { rank: 847, name: "Jake Henderson", dist: 312, country: "🇦🇺", isYou: true },
        { rank: 848, name: "Tom Brannigan", dist: 308, country: "🇬🇧" },
        { rank: 849, name: "Luis Ferreira", dist: 301, country: "🇧🇷" },
      ].map((p) => (
        <div key={p.rank} style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: 8,
          marginBottom: 4,
          background: p.isYou ? `${ORG}15` : "transparent",
          border: p.isYou ? `1px solid ${ORG}40` : "1px solid transparent",
          gap: 12,
        }}>
          <div style={{
            color: p.isYou ? ORG : MUT,
            fontFamily: DISP,
            fontWeight: 700,
            fontSize: 15,
            minWidth: 40,
          }}>#{p.rank}</div>
          <div style={{ flex: 1 }}>
            <span style={{ color: TXT, fontSize: 14 }}>{p.country} {p.name}</span>
            {p.isYou && <span style={{ color: ORG, fontSize: 11, marginLeft: 8, fontWeight: 600 }}>YOU</span>}
          </div>
          <div style={{ color: p.isYou ? ORG : DIM, fontWeight: 700, fontFamily: DISP, fontSize: 16 }}>
            {p.dist} yds
          </div>
        </div>
      ))}
    </div>
  );
}

function PointsMockup() {
  return (
    <div style={{
      background: BG3,
      border: `1px solid ${BDR}`,
      borderRadius: 16,
      padding: 24,
      fontFamily: SANS,
      maxWidth: 480,
      margin: "0 auto",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
      }}>
        <div>
          <div style={{ color: DIM, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>2027 CHAMPIONSHIP POINTS</div>
          <div style={{ color: TXT, fontWeight: 800, fontFamily: DISP, fontSize: 36, lineHeight: 1.1, marginTop: 4 }}>
            2,450 <span style={{ color: ORG }}>pts</span>
          </div>
        </div>
        <div style={{
          background: `${ORG}20`,
          border: `1px solid ${ORG}40`,
          borderRadius: 8,
          padding: "6px 12px",
          textAlign: "center",
        }}>
          <div style={{ color: ORG, fontWeight: 700, fontSize: 13 }}>Top 18%</div>
          <div style={{ color: MUT, fontSize: 10 }}>Global</div>
        </div>
      </div>
      {/* Bar chart */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: DIM, fontSize: 11, marginBottom: 8 }}>Points per month</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
          {[320, 280, 410, 390, 450, 600].map((h, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: Math.round(h / 10),
                background: i === 5
                  ? `linear-gradient(180deg, ${ORG}, ${ORG}90)`
                  : `${ORG}30`,
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s",
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {["Jan","Feb","Mar","Apr","May","Jun"].map(m => (
            <div key={m} style={{ flex: 1, textAlign: "center", color: MUT, fontSize: 9 }}>{m}</div>
          ))}
        </div>
      </div>
      {/* Recent events */}
      <div style={{ color: DIM, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8 }}>
        RECENT POINT EVENTS
      </div>
      {[
        { label: "312 yd drive — top 15% at venue", pts: "+180" },
        { label: "New personal best bonus", pts: "+250" },
        { label: "Weekly challenge entry", pts: "+50" },
      ].map((e, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "7px 0",
          borderBottom: i < 2 ? `1px solid ${BDR}` : "none",
        }}>
          <span style={{ color: DIM, fontSize: 12 }}>{e.label}</span>
          <span style={{ color: ORG, fontWeight: 700, fontSize: 12 }}>{e.pts}</span>
        </div>
      ))}
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is my golfer profile free to create?",
    a: "Yes, completely free. Sign up with your email and your profile, unique URL, and world ranking are live instantly. No subscription required.",
  },
  {
    q: "Can I choose my own URL?",
    a: "You pick your username when you register, and that becomes your permanent URL at rippingbombs.com/your-username. Make it your name, your nickname, whatever you want to be known as on the leaderboard.",
  },
  {
    q: "How is my world ranking calculated?",
    a: "Your ranking is based on your best recorded drive distance. As you improve and log more drives at compatible simulators, your ranking updates automatically in real time.",
  },
  {
    q: "What are the 2027 Championship points?",
    a: "From 2026, every drive you log at a participating venue earns you Championship points. Points accumulate over time and determine your seeding and qualification pathway for the 2027 Ripping Bombs World Championship.",
  },
  {
    q: "What simulators are compatible?",
    a: "We support a growing list of major simulator brands including Trackman, Foresight Sports, FlightScope and more. Check our compatible simulators page for the full list — any drive recorded on a compatible system at a participating venue is automatically added to your profile.",
  },
  {
    q: "Can I share my profile on social media?",
    a: "Absolutely. Your profile URL is your permanent, shareable link. Post it to Instagram, TikTok, or wherever you want to back up your big drives with real data.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {FAQS.map((f, i) => (
        <div
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          style={{
            borderBottom: `1px solid ${BDR}`,
            cursor: "pointer",
            padding: "20px 0",
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}>
            <span style={{
              color: open === i ? TXT : DIM,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 15,
              transition: "color 0.2s",
            }}>{f.q}</span>
            <span style={{
              color: open === i ? "#ec4899" : MUT,
              fontSize: 22,
              lineHeight: 1,
              flexShrink: 0,
              transition: "color 0.2s",
              transform: open === i ? "rotate(45deg)" : "none",
              display: "inline-block",
              transition: "transform 0.2s, color 0.2s",
            }}>+</span>
          </div>
          {open === i && (
            <div style={{
              color: DIM,
              fontSize: 14,
              lineHeight: 1.7,
              marginTop: 12,
              fontFamily: SANS,
            }}>{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GolferProfilePage() {
  return (
    <>
      <Head>
        <title>Your Golfer Profile & World Ranking | Ripping Bombs</title>
        <meta
          name="description"
          content="Register free and get your own golfer profile with a unique URL, personal dashboard, world long-drive ranking, full drive history, and 2027 Championship points tracker."
        />
        <meta property="og:title" content="Your Golfer Profile & World Ranking | Ripping Bombs" />
        <meta property="og:description" content="Your personal long-drive identity — world ranking, drive history, and 2027 Championship points. Free to join." />
        <link rel="canonical" href="https://rippingbombs.com/golfer-profile" />
      </Head>

      <main style={{
        background: "#0e0e0e",
        color: TXT,
        fontFamily: SANS,
        minHeight: "100vh",
      }}>

        {/* ── HERO ── */}
        <section style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 24px 64px",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-block",
            background: `${ORG}15`,
            border: `1px solid ${ORG}30`,
            borderRadius: 20,
            padding: "5px 14px",
            color: ORG,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.07em",
            marginBottom: 24,
          }}>
            FREE FOR ALL REGISTERED GOLFERS
          </div>
          <h1 style={{
            fontFamily: DISP,
            fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 68px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            margin: "0 0 24px",
          }}>
            Your Golf Identity.<br />
            <span style={{ color: ORG }}>Backed by Real Data.</span>
          </h1>
          <p style={{
            color: DIM,
            fontSize: 18,
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            Register free and unlock your own golfer profile — a unique URL,
            a personal dashboard, a live world ranking, and a complete record
            of every drive you've ever bombed.
          </p>

          <ProfileUrlBadge username="your-name" />

          <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/register">
              <a style={{
                background: ORG,
                color: "#0e0e0e",
                fontWeight: 700,
                fontFamily: DISP,
                fontSize: 17,
                letterSpacing: "0.04em",
                padding: "14px 32px",
                borderRadius: 8,
                textDecoration: "none",
                display: "inline-block",
              }}>CLAIM YOUR PROFILE →</a>
            </Link>
            <Link href="/leaderboard">
              <a style={{
                border: `1px solid ${BDR}`,
                color: DIM,
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 8,
                textDecoration: "none",
                display: "inline-block",
              }}>View leaderboard</a>
            </Link>
          </div>
        </section>

        {/* ── DASHBOARD SCREENSHOT ── */}
        <section style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}>
          <DashboardMockup />
          <p style={{
            textAlign: "center",
            color: MUT,
            fontSize: 13,
            marginTop: 16,
          }}>Your profile at a glance — ranking, stats, and every drive on record.</p>
        </section>

        {/* ── YOUR UNIQUE URL ── */}
        <section style={{
          background: BG2,
          borderTop: `1px solid ${BDR}`,
          borderBottom: `1px solid ${BDR}`,
          padding: "64px 24px",
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ color: ORG, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", marginBottom: 12 }}>YOUR UNIQUE URL</div>
              <h2 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 36, margin: "0 0 16px", lineHeight: 1.1 }}>
                One link.<br />Your whole game.
              </h2>
              <p style={{ color: DIM, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>
                The moment you register, you get a permanent URL at rippingbombs.com that's yours alone.
                Put it in your Instagram bio. Drop it in the group chat.
                Let your drives do the talking.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Shareable on any social platform",
                  "Always up to date with your latest ranking",
                  "Public by default, private by choice",
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: DIM,
                    fontSize: 14,
                    marginBottom: 10,
                  }}>
                    <span style={{ color: ORG, fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["alex-the-bomber", "tee-shot-queen", "big-drive-brian"].map(u => (
                <ProfileUrlBadge key={u} username={u} />
              ))}
            </div>
          </div>
        </section>

        {/* ── WORLD RANKING ── */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <RankingMockup />
            </div>
            <div>
              <div style={{ color: ORG, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", marginBottom: 12 }}>WORLD RANKING</div>
              <h2 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 36, margin: "0 0 16px", lineHeight: 1.1 }}>
                See exactly where you stand — globally.
              </h2>
              <p style={{ color: DIM, fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>
                Your world ranking updates automatically every time a new drive is recorded.
                It's not just a number — it's a real-time benchmark of your longest drive
                against every other registered golfer on the platform.
              </p>
              <p style={{ color: DIM, fontSize: 15, lineHeight: 1.7 }}>
                Whether you're chasing the top 500 or just beating your mates,
                you'll always know exactly where you sit.
              </p>
            </div>
          </div>
        </section>

        {/* ── DRIVE HISTORY ── */}
        <section style={{
          background: BG2,
          borderTop: `1px solid ${BDR}`,
          borderBottom: `1px solid ${BDR}`,
          padding: "72px 24px",
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ color: ORG, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", marginBottom: 12 }}>DRIVE HISTORY</div>
              <h2 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 40, margin: "0 0 16px" }}>
                Every bomb, on record.
              </h2>
              <p style={{ color: DIM, fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Your profile logs every drive you record at a participating venue —
                distance, location, date, and how it stacked up at that venue on the day.
                Watch your progression over time and identify your peak.
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}>
              {[
                { icon: "📍", label: "Venue & date", desc: "Every drive tied to where and when it was hit" },
                { icon: "📈", label: "Progression over time", desc: "Watch your average and best improve across sessions" },
                { icon: "🏆", label: "Venue context", desc: "See how your drive ranked on the venue leaderboard that day" },
              ].map((c, i) => (
                <div key={i} style={{
                  background: BG3,
                  border: `1px solid ${BDR}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ color: TXT, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{c.label}</div>
                  <div style={{ color: MUT, fontSize: 13, lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2027 POINTS ── */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ color: ORG, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", marginBottom: 12 }}>2027 CHAMPIONSHIP POINTS</div>
              <h2 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 36, margin: "0 0 16px", lineHeight: 1.1 }}>
                Every drive earns points toward the 2027 Championship.
              </h2>
              <p style={{ color: DIM, fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>
                From 2026, every drive you log at a participating venue automatically earns
                Championship points. They accumulate on your profile and determine your
                qualification pathway for the 2027 Ripping Bombs World Championship.
              </p>
              <p style={{ color: DIM, fontSize: 15, lineHeight: 1.7 }}>
                The sooner you start logging drives, the more of a head start you build.
                Your dashboard shows a live points total, monthly breakdown, and
                your standing against the global field.
              </p>
              <Link href="/2027-championship">
                <a style={{
                  display: "inline-block",
                  marginTop: 20,
                  color: ORG,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                  borderBottom: `1px solid ${ORG}40`,
                  paddingBottom: 2,
                }}>Learn about the 2027 Championship →</a>
              </Link>
            </div>
            <div>
              <PointsMockup />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          background: BG2,
          borderTop: `1px solid ${BDR}`,
          borderBottom: `1px solid ${BDR}`,
          padding: "64px 24px",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: DISP, fontWeight: 800, fontSize: 38, marginBottom: 48 }}>
              Getting started takes 60 seconds.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}>
              {[
                { step: "1", title: "Register free", desc: "Pick your username and claim your permanent profile URL." },
                { step: "2", title: "Hit the simulator", desc: "Play at any compatible sim venue. Your drives are logged automatically." },
                { step: "3", title: "Climb the rankings", desc: "Watch your world ranking update. Share your profile. Keep bombing." },
              ].map((s) => (
                <div key={s.step} style={{ padding: "24px 20px", background: BG3, border: `1px solid ${BDR}`, borderRadius: 12 }}>
                  <div style={{
                    color: ORG,
                    fontFamily: DISP,
                    fontWeight: 800,
                    fontSize: 32,
                    lineHeight: 1,
                    marginBottom: 12,
                  }}>{s.step}</div>
                  <div style={{ color: TXT, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ color: MUT, fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
          <h2 style={{
            fontFamily: DISP,
            fontWeight: 800,
            fontSize: 38,
            textAlign: "center",
            marginBottom: 48,
          }}>Common questions</h2>
          <FAQ />
        </section>

        {/* ── CTA ── */}
        <section style={{
          background: `linear-gradient(135deg, ${ORG}12, ${ORG}05)`,
          borderTop: `1px solid ${ORG}25`,
          padding: "72px 24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: DISP,
              fontWeight: 800,
              fontSize: 44,
              margin: "0 0 16px",
              lineHeight: 1.05,
            }}>
              Claim your profile.<br />
              <span style={{ color: ORG }}>It's free.</span>
            </h2>
            <p style={{ color: DIM, fontSize: 16, margin: "0 0 36px", lineHeight: 1.7 }}>
              Join thousands of sim golfers who already have their own ranking,
              their own profile, and their own drive history on Ripping Bombs.
            </p>
            <Link href="/register">
              <a style={{
                background: ORG,
                color: "#0e0e0e",
                fontWeight: 700,
                fontFamily: DISP,
                fontSize: 18,
                letterSpacing: "0.04em",
                padding: "16px 40px",
                borderRadius: 8,
                textDecoration: "none",
                display: "inline-block",
              }}>CREATE MY PROFILE →</a>
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
