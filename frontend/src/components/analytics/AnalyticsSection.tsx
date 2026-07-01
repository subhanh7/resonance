import { useRef, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
  LabelList
} from "recharts";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X, ChevronDown, ChevronUp } from "lucide-react";

import { useResonanceStore } from "@/store/useResonanceStore";

const COLORS = {
  positive: "rgb(255, 158, 87)",
  neutral: "rgb(120, 200, 220)",
  negative: "rgb(124, 109, 255)",
};

type SortField = "published_at" | "like_count" | "compound";
type SortDirection = "asc" | "desc";

// Custom tooltip for all charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-[var(--rs-glass-border)] rounded-lg text-sm shadow-xl">
        <p className="text-[var(--rs-text-primary)] font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsSection() {
  const { data } = useResonanceStore();
  if (!data) return null;
  return <AnalyticsSectionInner data={data} />;
}

function AnalyticsSectionInner({ data }: { data: any }) {
  const { sentimentFilter, setSentimentFilter } = useResonanceStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [sortField, setSortField] = useState<SortField>("like_count");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const { breakdown, comments } = data;

  // A: Donut Chart
  const pieData = [
    { name: "Positive", label: "positive", value: breakdown.positive, color: COLORS.positive },
    { name: "Neutral", label: "neutral", value: breakdown.neutral, color: COLORS.neutral },
    { name: "Negative", label: "negative", value: breakdown.negative, color: COLORS.negative },
  ];

  // B: Vertical Bar Chart
  const barData = [
    {
      name: "Sentiment",
      Positive: breakdown.positive,
      Neutral: breakdown.neutral,
      Negative: breakdown.negative,
    },
  ];


  const filteredComments = useMemo(() => {
    let result = comments;
    if (sentimentFilter) {
      result = result.filter((c: any) => c.label === sentimentFilter);
    }
    
    return [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "published_at") {
        aVal = new Date(a.published_at as string).getTime();
        bVal = new Date(b.published_at as string).getTime();
      }
      
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [comments, sentimentFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: filteredComments.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  const handleFilterClick = (label: string) => {
    setSentimentFilter(label as any);
    const el = document.getElementById("analytics-table");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      id="analytics-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-20 flex w-full max-w-7xl flex-col gap-10 mx-auto mt-32 mb-20 px-5"
    >
      <div className="flex flex-col gap-2 px-2">
        <h2 className="font-display text-4xl font-medium tracking-tight text-[var(--rs-text-primary)]">Deep Dive Analytics</h2>
        <p className="font-mono-data text-sm text-[var(--rs-text-secondary)]">Explore the full sentiment landscape across {data.fetched_comment_count.toLocaleString()} comments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Donut */}
        <div className="glass-panel rounded-3xl p-6 h-80 flex flex-col">
          <h3 className="font-display text-lg font-medium text-[var(--rs-text-primary)] mb-4">Sentiment Proportions</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry: any) => handleFilterClick(entry.payload.label)}
                  className="cursor-pointer outline-none"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--rs-glass-border)" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Vertical Bar */}
        <div className="glass-panel rounded-3xl p-6 h-80 flex flex-col">
          <h3 className="font-display text-lg font-medium text-[var(--rs-text-primary)] mb-4">Comment Volume</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rs-glass-border)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--rs-text-tertiary)', fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--rs-glass-border)' }} />
                <Bar dataKey="Positive" fill={COLORS.positive} onClick={() => handleFilterClick("positive")} className="cursor-pointer" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Positive" position="top" fill="var(--rs-text-secondary)" fontSize={12} />
                </Bar>
                <Bar dataKey="Neutral" fill={COLORS.neutral} onClick={() => handleFilterClick("neutral")} className="cursor-pointer" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Neutral" position="top" fill="var(--rs-text-secondary)" fontSize={12} />
                </Bar>
                <Bar dataKey="Negative" fill={COLORS.negative} onClick={() => handleFilterClick("negative")} className="cursor-pointer" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Negative" position="top" fill="var(--rs-text-secondary)" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

      {/* Comment Table */}
      <div id="analytics-table" className="flex flex-col gap-4 mt-4 glass-panel rounded-3xl p-6 mb-12">
        <div className="flex flex-wrap items-center justify-between mb-2 gap-4">
          <h3 className="font-display text-2xl font-medium text-[var(--rs-text-primary)]">Comment Explorer</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-black/20 p-1 rounded-full border border-[var(--rs-glass-border)]">
              <button
                onClick={() => setSentimentFilter(sentimentFilter === "positive" ? null : "positive" as any)}
                className={`px-3 py-1.5 text-xs font-mono-data rounded-full transition-colors cursor-pointer ${sentimentFilter === "positive" ? "bg-[rgb(255,158,87,0.2)] text-[rgb(255,158,87)] border border-[rgb(255,158,87,0.3)] shadow-[0_0_10px_rgba(255,158,87,0.1)]" : "text-[var(--rs-text-secondary)] hover:text-white border border-transparent"}`}
              >
                Positive
              </button>
              <button
                onClick={() => setSentimentFilter(sentimentFilter === "neutral" ? null : "neutral" as any)}
                className={`px-3 py-1.5 text-xs font-mono-data rounded-full transition-colors cursor-pointer ${sentimentFilter === "neutral" ? "bg-[rgb(120,200,220,0.2)] text-[rgb(120,200,220)] border border-[rgb(120,200,220,0.3)] shadow-[0_0_10px_rgba(120,200,220,0.1)]" : "text-[var(--rs-text-secondary)] hover:text-white border border-transparent"}`}
              >
                Neutral
              </button>
              <button
                onClick={() => setSentimentFilter(sentimentFilter === "negative" ? null : "negative" as any)}
                className={`px-3 py-1.5 text-xs font-mono-data rounded-full transition-colors cursor-pointer ${sentimentFilter === "negative" ? "bg-[rgb(124,109,255,0.2)] text-[rgb(124,109,255)] border border-[rgb(124,109,255,0.3)] shadow-[0_0_10px_rgba(124,109,255,0.1)]" : "text-[var(--rs-text-secondary)] hover:text-white border border-transparent"}`}
              >
                Negative
              </button>
            </div>

            {sentimentFilter && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-full border border-[var(--rs-glass-border)] bg-white/5 px-4 py-1.5 text-sm backdrop-blur-md"
              >
                <span className="text-[var(--rs-text-secondary)] font-mono-data">
                  Showing {filteredComments.length.toLocaleString()} comments
                </span>
                <button 
                  onClick={() => setSentimentFilter(null)}
                  className="ml-2 rounded-full p-1 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={14} className="text-[var(--rs-text-primary)]" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--rs-glass-border)] bg-black/20 overflow-hidden flex flex-col h-[600px]">
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-[var(--rs-glass-border)] bg-white/5 px-6 py-3 text-[11px] font-mono-data uppercase tracking-wider text-[var(--rs-text-tertiary)]">
            <div className="flex items-center">Comment</div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-[var(--rs-text-primary)] transition-colors"
              onClick={() => handleSort("published_at")}
            >
              Date {sortField === "published_at" && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </div>
            <div 
              className="flex items-center justify-end gap-1 cursor-pointer hover:text-[var(--rs-text-primary)] transition-colors"
              onClick={() => handleSort("like_count")}
            >
              Likes {sortField === "like_count" && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </div>
            <div 
              className="flex items-center justify-end gap-1 cursor-pointer hover:text-[var(--rs-text-primary)] transition-colors"
              onClick={() => handleSort("compound")}
            >
              Score {sortField === "compound" && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </div>
          </div>

          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden relative"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const comment = filteredComments[virtualRow.index];
                const color = COLORS[comment.label as keyof typeof COLORS] || COLORS.neutral;
                
                return (
                  <div
                    key={comment.id}
                    className="absolute top-0 left-0 w-full grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-[var(--rs-glass-border)] px-6 hover:bg-white/10 transition-colors items-center"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={comment.author_avatar} alt={comment.author} className="w-8 h-8 rounded-full flex-shrink-0 border border-[var(--rs-glass-border)]" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-medium text-[var(--rs-text-secondary)] truncate">{comment.author}</span>
                        <span className="text-[13px] text-[var(--rs-text-primary)] line-clamp-2 mt-0.5 leading-snug">{comment.text}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-[12px] font-mono-data text-[var(--rs-text-tertiary)]">
                      {new Date(comment.published_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-end text-[12px] font-mono-data text-[var(--rs-text-secondary)]">
                      {comment.like_count.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end">
                      <span 
                        className="px-2.5 py-1 text-[11px] font-mono-data rounded-full font-medium border border-white/5"
                        style={{ backgroundColor: `${color}20`, color: color }}
                      >
                        {comment.compound > 0 ? "+" : ""}{comment.compound.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
