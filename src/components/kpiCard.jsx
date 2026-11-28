import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const toneClassNames = {
  lavender: "bg-linear-to-br from-[#E0DEFF] to-[#C7C2FF] text-white",
  dark: "bg-linear-to-br from-[#3A3C51] to-[#2A2C41] text-white",
  pink: "bg-linear-to-br from-[#FF88A3] to-[#FF6B8B] text-white",
  purple: "bg-linear-to-br from-[#8061F9] to-[#6C48F5] text-white",
};

const labelClassNames = {
  lavender: "text-onad-purple",
  dark: "text-gray-300",
  pink: "text-white",
  purple: "text-white",
};

function KpiCard({
  label,
  value,
  change,
  caption = "누적 성과",
  progress,
  icon: Icon,
  tone = "lavender",
  to,
}) {
  const isCampaigns = tone === "purple";
  const content = (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 ${isCampaigns ? "h-full" : ""} ${toneClassNames[tone]}`}
    >
      <div
        className={`relative z-10 flex items-center justify-between ${isCampaigns ? "mb-4 h-7" : "mb-8 h-6"}`}
      >
        <span
          className={`flex items-center gap-2 text-sm font-semibold ${labelClassNames[tone]}`}
        >
          {Icon && <Icon size={18} aria-hidden="true" />}
          {label}
        </span>
        {isCampaigns && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-white/30">
            <span className="text-[10px]">＋</span> View All
          </span>
        )}
      </div>

      <div className="relative z-10">
        {!isCampaigns && (
          <p
            className={`mb-1 text-sm font-medium ${tone === "dark" ? "text-gray-400" : "text-white/80"}`}
          >
            {caption}
          </p>
        )}
        <h3 className="text-4xl font-black tracking-tight text-white">
          {isCampaigns ? (
            <>
              <span>{value}</span>개 진행중
            </>
          ) : (
            value
          )}
        </h3>
        {change && (
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/90">
            <TrendingUp size={13} aria-hidden="true" />
            지난 기간 대비 {change}
          </p>
        )}
      </div>
      {isCampaigns && (
        <span className="pointer-events-none absolute -bottom-4 -left-4 select-none text-8xl font-black italic text-white/10">
          ON
        </span>
      )}
      {tone === "lavender" && (
        <span className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/20 blur-2xl transition-colors group-hover:bg-white/30" />
      )}
      {typeof progress === "number" && (
        <div
          className="absolute inset-x-6 bottom-3 z-10 h-1.5 overflow-hidden rounded-full bg-white/25"
          role="progressbar"
          aria-label={`${label} 소진율`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </article>
  );

  return to ? (
    <Link
      to={to}
      aria-label="전체 캠페인 보기"
      className="block h-full cursor-pointer"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export default KpiCard;
