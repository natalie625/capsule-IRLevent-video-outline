"use client";
import { useState } from "react";

const SYSTEM_PROMPT = `You are an expert creative director and video editor helping create event recap outlines for Capsule, a video product company that hosts private VIP dinners for in-house creative leaders at enterprise companies.

You will be given interview transcripts from dinner guests and must produce a shot-by-shot video outline for a 45–60 second vertical (9:16) recap video.

GOALS FOR EVERY VIDEO:
1. Instill FOMO in anyone who wasn't at the event — this is a private, VIP, exclusive gathering
2. Align Capsule's brand with leading creative voices on interesting and relevant topics
3. Build excitement, intrigue, and momentum for future in-person events
4. Publish content of creative leaders saying pieces of Capsule's value prop/mission — video is the most effective and dominant communication format, branding and visual consistency in video is important for brands, AI can help creatives spend more time on the things they are most skilled at and best suited for

STRICT RULES:
- ALL soundbite quotes must be verbatim from the transcripts. Never paraphrase, summarize, or approximate. If a quote needs light editing for flow (e.g. removing a stutter), note it.
- Soundbites do not all need to be about video — interesting, provocative thoughts on creativity, brand, in-house teams, or the industry are welcome
- Never use a quote that undermines the VIP/exclusive nature of the event
- Distribute speaker appearances across the video — avoid using the same person back to back without B-roll between them

FORMULA:
1. HOOK SOUNDBITE (0:00–0:10): Bold, complete thought. Long enough for a lower third to appear (~3 seconds in). Should pull viewers in immediately.
2. B-ROLL + TITLE CARD (0:10–0:20): Intimate, moody B-roll direction. Motion graphic: "Capsule VIP Dinner / [CITY]"
3. LOGO CARD (0:20–0:26): "Creative leaders from..." + company logo grid
4. SOUNDBITE 2 (0:26–0:36): "I came to this dinner because..." moment if strong. Should validate the room without being salesy.
5. SOUNDBITE 3 + B-ROLL INTERCUT (0:36–0:48): The intellectual/value prop beat. A guest articulating why video matters — ideally in language that maps to Capsule's mission.
6. SOUNDBITE 4 (0:48–0:56): FOMO closer. Should make viewers feel they missed a genuinely valuable conversation.
7. B-ROLL OUTRO (0:56–1:02): First wide table shot — reveal the full room as a payoff.
8. CLOSING CARD (1:02–1:06): "Capsule / Creative leaders meet here"

OUTPUT FORMAT:
For each section provide: timecode, section label, speaker (if applicable), verbatim quote (if applicable), lower third text (if applicable), B-roll direction (if applicable), motion graphic copy (if applicable), and a one-sentence editorial note explaining why this choice serves the goals.

End with a short "Why this structure works" paragraph and flag any potential issues (e.g. same speaker used twice in a row).`;

export default function Page() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState([
    { name: "", title: "", company: "" },
    { name: "", title: "", company: "" },
  ]);
  const [transcripts, setTranscripts] = useState("");
  const [notes, setNotes] = useState("");
  const [outline, setOutline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const addGuest = () => setGuests([...guests, { name: "", title: "", company: "" }]);
  const removeGuest = (i) => setGuests(guests.filter((_, idx) => idx !== i));
  const updateGuest = (i, field, val) => {
    const updated = [...guests];
    updated[i][field] = val;
    setGuests(updated);
  };

  const handleGenerate = async () => {
    if (!city || !transcripts || guests.some((g) => !g.name || !g.company)) {
      setError("Please fill in event city, all guest names and companies, and paste at least one transcript.");
      return;
    }
    setError("");
    setLoading(true);
    setOutline("");

    const guestList = guests
      .map((g, i) => `${i + 1}. ${g.name}${g.title ? `, ${g.title}` : ""}${g.company ? ` at ${g.company}` : ""}`)
      .join("\n");

    const userMessage = `Please create a video recap outline for the following event:

EVENT: Capsule VIP Dinner
CITY: ${city}
${date ? `DATE: ${date}` : ""}

GUESTS:
${guestList}

TRANSCRIPTS:
${transcripts}

${notes ? `ADDITIONAL NOTES FROM THE PRODUCER:\n${notes}` : ""}

Please produce the full shot-by-shot outline following the formula and rules.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
      if (!text) throw new Error("Empty response");
      setOutline(text);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 720, margin: "0 auto", padding: "40px 24px", color: "#111" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Capsule</span>
          <span style={{ fontSize: 12, color: "#999", fontWeight: 400, background: "#f2f2f2", padding: "2px 8px", borderRadius: 20 }}>
            Event Recap Generator
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
          Fill in the event details, paste your transcripts, and get a shot-by-shot video outline.
        </p>
      </div>

      {/* Event Info */}
      <section style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Event details</label>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="City *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            placeholder="Date (optional)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </section>

      {/* Guests */}
      <section style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Guests *</label>
        {guests.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input
              placeholder="Full name"
              value={g.name}
              onChange={(e) => updateGuest(i, "name", e.target.value)}
              style={{ ...inputStyle, flex: 1.2 }}
            />
            <input
              placeholder="Title (optional)"
              value={g.title}
              onChange={(e) => updateGuest(i, "title", e.target.value)}
              style={{ ...inputStyle, flex: 1.5 }}
            />
            <input
              placeholder="Company"
              value={g.company}
              onChange={(e) => updateGuest(i, "company", e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            {guests.length > 1 && (
              <button onClick={() => removeGuest(i)} style={removeBtnStyle}>×</button>
            )}
          </div>
        ))}
        <button onClick={addGuest} style={addBtnStyle}>+ Add guest</button>
      </section>

      {/* Transcripts */}
      <section style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Transcripts *</label>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 8, marginTop: 0, lineHeight: 1.5 }}>
          Paste all SRT/VTT transcripts here. Label each one with the speaker name before pasting.
        </p>
        <textarea
          placeholder={"JAMES HURST\n1\n00:00:00,000 --> 00:00:02,000\nthat's the power of brand people...\n\nSHAINA NEILSON\n1\n00:00:00,000 --> 00:00:02,000\nso I came to this dinner..."}
          value={transcripts}
          onChange={(e) => setTranscripts(e.target.value)}
          style={{ ...inputStyle, height: 200, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
        />
      </section>

      {/* Notes */}
      <section style={{ marginBottom: 32 }}>
        <label style={labelStyle}>
          Producer notes{" "}
          <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
        </label>
        <textarea
          placeholder="Any standout moments from the evening, lines that felt especially strong, themes that came up, anything the editor should know..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, height: 90, resize: "vertical" }}
        />
      </section>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fdd" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: loading ? "#999" : "#111",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "14px 28px",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          marginBottom: 40,
          transition: "background 0.15s",
          letterSpacing: "-0.2px",
        }}
      >
        {loading ? "Generating outline…" : "Generate outline"}
      </button>

      {outline && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Your outline</span>
            <button
              onClick={handleCopy}
              style={{
                fontSize: 12,
                color: copied ? "#2ecc71" : "#888",
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#222" }}>
            {outline}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 10,
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
  color: "#111",
  background: "#fafafa",
  fontFamily: "inherit",
};

const addBtnStyle = {
  fontSize: 12,
  color: "#555",
  background: "none",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: "5px 12px",
  cursor: "pointer",
  marginTop: 2,
  fontFamily: "inherit",
};

const removeBtnStyle = {
  fontSize: 18,
  color: "#bbb",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0 4px",
  lineHeight: 1,
  flexShrink: 0,
};
