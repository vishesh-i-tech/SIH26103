import React, { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import { formatINR, riskLabel } from "../utils/risk";
import Panel from "../components/Panel";

export function Assistant() {
  const { projects } = useProjects();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Namaste, Officer. I am PAIMANA AI — MoSPI Central Sector Project Risk Assistant. You can query project delay root-causes, cross-examine billing anomalies against daily logs, compare sector performances, or generate risk briefings.",
    },
  ]);

  const quickPrompts = [
    "Why is NH-4471 flagged with an 87 risk score?",
    "What's the average risk score across all Roads projects?",
    "Show me projects behind schedule by more than 15 points",
    "What's the total portfolio cost drift?",
    "Which contractor has the most flagged bills?",
    "Compare Bridges sector vs Railways sector risk.",
    "Which projects have pending billing anomalies over 5 days?",
    "Summarize the main factors delaying railway projects in UP and MP.",
  ];

  const generateAnswer = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Direct Project ID or Name Match
    const matchedProject = projects.find(
      (p) =>
        (p.code && q.includes(p.code.toLowerCase())) ||
        (p.id && q.includes(p.id.toLowerCase())) ||
        q.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
    );

    if (matchedProject) {
      const p = matchedProject;
      const lag = p.planned - p.actual;
      const flaggedBills = p.billing.filter((b) => b.status === "flagged");
      const costDiff = p.costRevised - p.costOriginal;

      return `Intelligence File for ${p.name} (${p.id}):
• Composite Risk Score: ${p.risk}/100 [${riskLabel(p.risk)}]
• Physical Progress: ${p.actual}% actual vs ${p.planned}% planned (${lag > 0 ? `${lag} points behind schedule` : "on or ahead of schedule"})
• Financial Outlay: Sanctioned ${formatINR(p.costOriginal)} · Revised ${formatINR(p.costRevised)} (${costDiff > 0 ? `+${formatINR(costDiff)} drift` : "no cost overrun"})
• Primary Root Cause: ${p.reason}
• Key Risk Factors: ${p.factors.map((f) => `${f.f} (${f.w}%)`).join(", ")}
• Billing Audit: ${flaggedBills.length > 0 ? `${flaggedBills.length} flagged bill(s) totaling ₹${flaggedBills.reduce((s, b) => s + b.claimed, 0).toFixed(1)} Cr claimed vs ₹${flaggedBills.reduce((s, b) => s + b.expected, 0).toFixed(1)} Cr expected` : "All RA-bills cleared with no open variance flags"}
• AI Recommended Action: ${p.recommendation}`;
    }

    // 2. Sector Comparison (e.g. "compare bridges vs railways")
    if (q.includes("compare") && (q.includes("bridge") || q.includes("rail") || q.includes("road") || q.includes("power"))) {
      const sec1Name = q.includes("bridge") ? "Bridges" : q.includes("road") ? "Roads" : "Railways";
      const sec2Name = q.includes("rail") && sec1Name !== "Railways" ? "Railways" : q.includes("power") ? "Power" : "Roads";

      const g1 = projects.filter((p) => p.sector.toLowerCase() === sec1Name.toLowerCase());
      const g2 = projects.filter((p) => p.sector.toLowerCase() === sec2Name.toLowerCase());

      if (g1.length > 0 && g2.length > 0) {
        const avgR1 = Math.round(g1.reduce((s, p) => s + p.risk, 0) / g1.length);
        const avgR2 = Math.round(g2.reduce((s, p) => s + p.risk, 0) / g2.length);
        const avgLag1 = Math.round(g1.reduce((s, p) => s + (p.planned - p.actual), 0) / g1.length);
        const avgLag2 = Math.round(g2.reduce((s, p) => s + (p.planned - p.actual), 0) / g2.length);

        return `Comparative Sector Analysis (${sec1Name} vs ${sec2Name}):
• ${sec1Name} Sector (${g1.length} projects): Average Risk Score = ${avgR1}/100, Average Schedule Lag = ${avgLag1} pts.
• ${sec2Name} Sector (${g2.length} projects): Average Risk Score = ${avgR2}/100, Average Schedule Lag = ${avgLag2} pts.
• Analytical Finding: ${avgR1 > avgR2 ? `${sec1Name} exhibits higher systemic vulnerability (${avgR1} vs ${avgR2})` : `${sec2Name} exhibits higher systemic vulnerability (${avgR2} vs ${avgR1})`}, primarily driven by foundation/geological clearances and milestone variances.`;
      }
    }

    // 3. Sector Average Query (e.g. "average risk score across all Roads projects")
    const matchedSector = ["Roads", "Bridges", "Railways", "Power"].find((s) =>
      q.includes(s.toLowerCase())
    );
    if (matchedSector && (q.includes("average") || q.includes("risk") || q.includes("sector"))) {
      const sectorProjects = projects.filter((p) => p.sector.toLowerCase() === matchedSector.toLowerCase());
      if (sectorProjects.length > 0) {
        const avgRisk = Math.round(
          sectorProjects.reduce((sum, p) => sum + p.risk, 0) / sectorProjects.length
        );
        const highestRisk = [...sectorProjects].sort((a, b) => b.risk - a.risk)[0];
        const avgLag = Math.round(
          sectorProjects.reduce((sum, p) => sum + (p.planned - p.actual), 0) / sectorProjects.length
        );

        return `Sector Intelligence Summary: ${matchedSector}
• Monitored Projects: ${sectorProjects.length} Central Sector infrastructure packages
• Average Sector Risk Score: ${avgRisk}/100 [${riskLabel(avgRisk)}]
• Average Schedule Lag: ${avgLag} percentage points behind CPM baseline
• Highest-Risk Asset: ${highestRisk.name} (${highestRisk.id}) with risk score ${highestRisk.risk}/100 — Driver: ${highestRisk.reason}`;
      }
    }

    // 4. Behind schedule / lag queries (e.g. "behind schedule by more than 15 points")
    if (q.includes("behind schedule") || q.includes("15 points") || (q.includes("lag") && q.includes("schedule"))) {
      const delayed = projects.filter((p) => p.planned - p.actual >= 15);
      if (delayed.length === 0) {
        return "No monitored projects are currently running more than 15 points behind their CPM/PERT schedule trajectory.";
      }
      return `Found ${delayed.length} projects running ≥15 points behind schedule:
` + delayed
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} (${p.id}): Planned ${p.planned}% vs Actual ${p.actual}% (${p.planned - p.actual} pts lag) · Risk: ${p.risk}/100 · Reason: ${p.reason}`
        )
        .join("\n") +
        `\n\nRecommendation: Immediate field engineering conference recommended for contractor mobilization remediation.`;
    }

    // 5. Total Portfolio Cost Drift
    if (q.includes("cost drift") || q.includes("sanctioned vs revised") || q.includes("cost overrun") || q.includes("total cost")) {
      const totalOrig = projects.reduce((s, p) => s + p.costOriginal, 0);
      const totalRev = projects.reduce((s, p) => s + p.costRevised, 0);
      const diff = totalRev - totalOrig;
      const pct = (((totalRev - totalOrig) / totalOrig) * 100).toFixed(1);
      const drifted = projects
        .filter((p) => p.costRevised > p.costOriginal)
        .sort((a, b) => b.costRevised - b.costOriginal - (a.costRevised - a.costOriginal));

      return `Portfolio Financial Outlay & Cost Drift Analysis:
• Total Original Sanction: ${formatINR(totalOrig)}
• Total Revised Sanction: ${formatINR(totalRev)}
• Net Cumulative Cost Drift: +${formatINR(diff)} (+${pct}% over original sanction)
• Highest Cost Drift Assets:
${drifted.slice(0, 3).map((p, i) => `  ${i + 1}. ${p.name} (${p.id}): +${formatINR(p.costRevised - p.costOriginal)} (+${(((p.costRevised - p.costOriginal) / p.costOriginal) * 100).toFixed(1)}%)`).join("\n")}
• Key Driver: Material price indices (cement/TMT steel) and extended preliminary land diversion overheads.`;
    }

    // 6. Contractor with most flagged bills
    if (q.includes("contractor") && (q.includes("flagged") || q.includes("bill") || q.includes("most"))) {
      const contractorStats = {};
      projects.forEach((p) => {
        const flagged = p.billing.filter((b) => b.status === "flagged");
        if (flagged.length > 0) {
          if (!contractorStats[p.contractor]) {
            contractorStats[p.contractor] = { count: 0, claimed: 0, expected: 0, projects: [] };
          }
          contractorStats[p.contractor].count += flagged.length;
          contractorStats[p.contractor].claimed += flagged.reduce((s, b) => s + b.claimed, 0);
          contractorStats[p.contractor].expected += flagged.reduce((s, b) => s + b.expected, 0);
          contractorStats[p.contractor].projects.push(p.id);
        }
      });

      const sorted = Object.entries(contractorStats).sort((a, b) => b[1].count - a[1].count);
      if (sorted.length === 0) {
        return "No contractors currently have flagged billing anomalies.";
      }

      const [topContractor, data] = sorted[0];
      const variance = (((data.claimed - data.expected) / data.expected) * 100).toFixed(1);

      return `Contractor Billing Anomaly Audit:
• Contractor with Highest Flagged Bills: ${topContractor}
• Flagged Items: ${data.count} running account (RA) bills across package(s) ${data.projects.join(", ")}
• Financial Exposure: ₹${data.claimed.toFixed(1)} Cr claimed vs ₹${data.expected.toFixed(1)} Cr AI-estimated from daily site consumption (+${variance}% variance)
• Status: All flagged disbursements are currently on hold pending joint verification with site QA/QC engineers.`;
    }

    // 7. Days flagged / persistent billing anomalies
    if (q.includes("days") && (q.includes("flagged") || q.includes("billing") || q.includes("anomal"))) {
      const flagged = projects.filter((p) => p.daysFlagged > 5);
      return `Persistent Billing Anomalies (Flagged > 5 Days):
Found ${flagged.length} project(s) requiring executive intervention:
` + flagged
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} (${p.id}): Flagged ${p.daysFlagged} days ago · Contractor: ${p.contractor} · Risk: ${p.risk}/100`
        )
        .join("\n") +
        `\n\nPolicy Action: MoSPI IPMD circular dictates mandatory inquiry for anomalies unresolved beyond 7 business days.`;
    }

    // 8. Railway delay factors in UP/MP
    if (q.includes("railway") && (q.includes("factor") || q.includes("delay") || q.includes("up") || q.includes("mp"))) {
      const rails = projects.filter((p) => p.sector === "Railways");
      return `Railway Sector Delay Analysis (Central Sector Network):
• Monitored Railway Packages: ${rails.length} active routes (${rails.map((p) => p.id).join(", ")})
• Primary Delay Drivers:
  1. Subgrade soil compaction settlement & geological formation failures (41% factor weight)
  2. Petty contractor payment bottlenecks and tier-2 vendor liquidity (31%)
  3. Railway safety commissioner inspection backlog and block clearance timing (28%)
• High Priority: Eastern DFC Spur (RW-9104) and Bullet Pier Package C2 (RW-7319) require technical audit before monsoon onset.`;
    }

    // Default Fallback: Dynamic Real-Time Portfolio State
    const totalCount = projects.length;
    const avgRisk = Math.round(projects.reduce((s, p) => s + p.risk, 0) / totalCount);
    const criticalCount = projects.filter((p) => p.risk >= 70).length;
    const totalRev = projects.reduce((s, p) => s + p.costRevised, 0);

    return `Real-Time MoSPI Portfolio Telemetry Analysis:
• Total Projects Monitored: ${totalCount} infrastructure packages (Total Revised Outlay: ${formatINR(totalRev)})
• Circle Average Risk: ${avgRisk}/100 [${riskLabel(avgRisk)}]
• Critical Risk Tier: ${criticalCount} project(s) currently requiring officer escalation
• Primary Delay Trends: Land acquisition right-of-way disputes (36%), Material supply bottlenecks (31%), and monsoon water levels (18%).
• Try asking about a specific project code (e.g. "NH-4471", "BR-2209"), a sector ("average risk across Roads"), or billing anomalies ("contractor with most flagged bills").`;
  };

  const handleSend = (textToSend) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { sender: "user", text: q };
    const aiReply = generateAnswer(q);

    setMessages((prev) => [...prev, userMsg, { sender: "ai", text: aiReply }]);
    setQuery("");
  };

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "calc(100vh - 52px)", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          MoSPI AI Intelligence Assistant
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          Natural language synthesis over daily logs, milestone records, and billing variance models.
        </div>
        {/* Subtle demo clarity caption */}
        <div
          style={{
            fontSize: 11,
            color: tokens.slate,
            marginTop: 4,
            fontStyle: "italic",
            letterSpacing: "0.01em",
          }}
        >
          Simulated reasoning over structured project telemetry — demonstrates the decision-support pattern this system is designed to scale into with full historical training data.
        </div>
      </div>

      {/* Suggested Quick Queries (8 Chips) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            style={{
              fontSize: 11.5,
              padding: "5px 10px",
              background: tokens.panel,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              color: tokens.steelDeep,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.steel)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = tokens.line)}
          >
            <Sparkles size={12} color={tokens.steel} />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Transcript Area */}
      <Panel style={{ flex: 1, padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginBottom: 12 }}>
        {messages.map((m, idx) => {
          const isAI = m.sender === "ai";
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 12,
                maxWidth: "85%",
                alignSelf: isAI ? "flex-start" : "flex-end",
                flexDirection: isAI ? "row" : "row-reverse",
              }}
            >
              {isAI && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: tokens.radiusSm,
                    background: tokens.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={16} color={tokens.steel} />
                </div>
              )}
              <div
                style={{
                  background: isAI ? tokens.paper : tokens.steelDeep,
                  color: isAI ? tokens.ink : "#FFFFFF",
                  border: isAI ? `1px solid ${tokens.line}` : "none",
                  borderRadius: tokens.radiusSm,
                  padding: "12px 14px",
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </Panel>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: "flex", gap: 10 }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question (e.g. 'What's the average risk score across all Roads projects?')..."
          style={{
            flex: 1,
            padding: "10px 14px",
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: tokens.radiusSm,
            fontSize: 13,
            outline: "none",
            color: tokens.ink,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0 18px",
            background: tokens.steel,
            color: "#FFFFFF",
            border: "none",
            borderRadius: tokens.radiusSm,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Query</span>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

export default Assistant;
