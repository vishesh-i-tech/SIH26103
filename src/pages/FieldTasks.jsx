import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  CheckCircle2,
  Camera,
  Layers,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import Panel from "../components/Panel";

const initialTasks = [
  {
    id: 1,
    title: "Upload daily site photo — NH-4471",
    subtitle: "Pier 14 reinforcement progress requires timestamped & geo-tagged upload.",
    projectId: "NH-4471",
    status: "Overdue",
    dueText: "Due 10:00 AM",
    type: "photo",
    completed: false,
  },
  {
    id: 2,
    title: "Submit material quantity — NH-4471",
    subtitle: "Verify 40 MT steel consignment gate pass and cement consumption.",
    projectId: "NH-4471",
    status: "Pending",
    dueText: "Due 05:00 PM",
    type: "material",
    completed: false,
  },
  {
    id: 3,
    title: "QA/QC inspection pending — BR-2209",
    subtitle: "Joint inspection with third-party testing agency on abutment shuttering.",
    projectId: "BR-2209",
    status: "Pending",
    dueText: "Due 03:00 PM",
    type: "inspection",
    completed: false,
  },
  {
    id: 4,
    title: "Concrete cylinder slump test log — BR-2209",
    subtitle: "Record 7-day compressive batch test figures for Girder Span 3.",
    projectId: "BR-2209",
    status: "Done",
    dueText: "Completed 09:30 AM",
    type: "test",
    completed: true,
  },
  {
    id: 5,
    title: "Site safety clearance verification — NH-4471",
    subtitle: "Sign off morning traffic diversion barricading on Betul section bypass.",
    projectId: "NH-4471",
    status: "Done",
    dueText: "Completed 08:15 AM",
    type: "safety",
    completed: true,
  },
];

export function FieldTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? "Done" : "Pending",
            dueText: nextCompleted ? "Completed just now" : "Due today",
          };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Today's Field Checklist & Reminders
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Mandatory daily tasks for Site Engineers under MoSPI Central Sector verification guidelines.
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all", label: `All Tasks (${tasks.length})` },
            { id: "pending", label: `Pending (${pendingCount})` },
            { id: "completed", label: `Completed (${tasks.length - pendingCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              style={{
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: tokens.radiusSm,
                border: `1px solid ${filter === item.id ? tokens.steel : tokens.line}`,
                background: filter === item.id ? tokens.steelDeep : tokens.panel,
                color: filter === item.id ? "#FFFFFF" : tokens.ink,
                fontWeight: filter === item.id ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Checklist Panel */}
      <Panel>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: tokens.slate }}>
            No tasks in this category.
          </div>
        ) : (
          filteredTasks.map((t, idx) => {
            const isOverdue = t.status === "Overdue" && !t.completed;
            const isDone = t.completed;

            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: idx < filteredTasks.length - 1 ? `1px solid ${tokens.line}` : "none",
                  background: isDone ? "#FAF9F6" : tokens.panel,
                  transition: "background 0.15s ease",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(t.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginTop: 2,
                    color: isDone ? tokens.good : isOverdue ? tokens.bad : tokens.slate,
                  }}
                  title={isDone ? "Mark as pending" : "Mark as completed"}
                >
                  {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: isDone ? tokens.slate : tokens.ink,
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </span>
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 11,
                        padding: "1px 6px",
                        background: tokens.paper,
                        border: `1px solid ${tokens.line}`,
                        borderRadius: tokens.radiusSm,
                        color: tokens.slate,
                      }}
                    >
                      {t.projectId}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: tokens.slate, marginTop: 3 }}>
                    {t.subtitle}
                  </div>
                </div>

                {/* Status Tag */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 11,
                        ...monoStyle,
                        padding: "2px 8px",
                        borderRadius: tokens.radiusSm,
                        fontWeight: 600,
                        background: isDone
                          ? tokens.goodBg
                          : isOverdue
                          ? tokens.badBg
                          : tokens.warnBg,
                        color: isDone
                          ? tokens.good
                          : isOverdue
                          ? tokens.bad
                          : tokens.warn,
                        border: `1px solid ${
                          isDone
                            ? tokens.good
                            : isOverdue
                            ? tokens.bad
                            : tokens.warn
                        }33`,
                      }}
                    >
                      {t.status}
                    </span>
                    <div style={{ fontSize: 10.5, color: tokens.slate, marginTop: 3 }}>
                      {t.dueText}
                    </div>
                  </div>

                  {/* Action link if relevant to entry upload */}
                  {(t.type === "photo" || t.type === "material") && !isDone && (
                    <button
                      onClick={() => navigate(`/field-entry/${t.projectId}`)}
                      style={{
                        fontSize: 11.5,
                        padding: "4px 8px",
                        background: tokens.steel,
                        color: "#FFF",
                        border: "none",
                        borderRadius: tokens.radiusSm,
                        cursor: "pointer",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      title="Open entry upload form"
                    >
                      <span>Upload</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

export default FieldTasks;
