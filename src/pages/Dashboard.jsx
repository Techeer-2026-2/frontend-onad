import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChartLine,
  ChevronDown,
  Coins,
  Eye,
  Megaphone,
  MousePointerClick,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import CampaignSelect from "../components/CampaignSelect";
import CampaignTable from "../components/CampaignTable";
import KpiCard from "../components/kpiCard";
import MetricTrendChart from "../components/MetricTrendChart";
import { getCampaigns } from "../api/campaigns";
import { getCampaignTimeseries, toTrendSeries } from "../api/campaignPerformance";

function formatTargetAudience(ageGroups, genders) {
  const ages = Array.isArray(ageGroups)
    ? ageGroups.includes("all")
      ? ["전체 연령"]
      : ageGroups.map((value) => value.replace(/^(\d+)s$/, "$1대"))
    : [];
  const gendersLabel = Array.isArray(genders)
    ? genders.includes("all")
      ? ["전체 성별"]
      : genders.map(
          (value) => ({ male: "남성", female: "여성" })[value] || value,
        )
    : [];
  return (
    [
      ...ages,
      ...(gendersLabel.length ? [`(${gendersLabel.join(", ")})`] : []),
    ].join(" ") || "—"
  );
}

function formatCampaignPeriod(startAt, endAt) {
  const format = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("ko-KR");
  };
  return `${format(startAt)} ~ ${format(endAt)}`;
}

function toNonnegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function mapDashboardCampaign(campaign) {
  const sent = toNonnegativeNumber(campaign.impressionCount);
  const clicks = toNonnegativeNumber(campaign.clickCount);
  if (sent === null || clicks === null)
    throw new Error("캠페인 목록 통계 응답이 올바르지 않습니다.");
  return {
    ...campaign,
    id: campaign.campaignId,
    name: campaign.title,
    targetAudience: formatTargetAudience(
      campaign.targetAgeGroups,
      campaign.targetGenders,
    ),
    period: formatCampaignPeriod(campaign.startAt, campaign.endAt),
    sent,
    clicks,
    ctr:
      sent !== null && clicks !== null
        ? sent > 0
          ? (clicks / sent) * 100
          : 0
        : null,
  };
}

const presetOptions = [
  ["month", "이번 달"],
  ["yesterday", "어제"],
  ["7days", "최근 7일"],
  ["custom", "직접 설정"],
];

function shiftDay(day, count) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

function getPresetDates(preset) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  if (preset === "month") return { start: today.slice(0, 7) + "-01", end: today };
  if (preset === "yesterday") {
    const yesterday = shiftDay(today, -1);
    return { start: yesterday, end: yesterday };
  }
  return { start: shiftDay(today, -6), end: today };
}

function formatWon(value) {
  return `₩${Math.round(value).toLocaleString("ko-KR")}`;
}

// 성과 그래프 탭: 각 지표의 계산식과 단위 표시 방법
const chartMetrics = {
  ctr: {
    label: "CTR",
    description: "클릭률",
    unit: "%",
    format: (value) => `${value.toFixed(2)}%`,
  },
  cpc: {
    label: "CPC",
    description: "클릭당 비용",
    unit: "원",
    format: formatWon,
  },
  cpm: {
    label: "CPM",
    description: "1,000회 노출당 비용",
    unit: "원",
    format: formatWon,
  },
};

function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState("7days");
  const [range, setRange] = useState(() => getPresetDates("7days"));
  const [dateInputs, setDateInputs] = useState(range);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [dateError, setDateError] = useState("");
  const [granularity, setGranularity] = useState("day");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [chartMetric, setChartMetric] = useState("ctr");
  // 어떤 캠페인의 결과인지 id와 함께 저장한다
  const [performanceState, setPerformanceState] = useState({
    queryKey: null,
    data: null,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    getCampaigns({ signal: controller.signal })
      .then((response) => {
        if (!Array.isArray(response))
          throw new Error("캠페인 목록 응답 형식이 올바르지 않습니다.");
        if (controller.signal.aborted) return;
        setCampaigns(response.map(mapDashboardCampaign));
        setErrorMessage("");
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === "AbortError") return;
        setCampaigns([]);
        setErrorMessage(
          error.message || "대시보드 데이터를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [retryCount]);

  const sourceCampaigns = campaigns;
  const isOngoing = (campaign) =>
    campaign.status === "ONGOING" || campaign.status === "active";
  // 기본 선택: 진행 중인 첫 캠페인 → 없으면 첫 캠페인
  const defaultCampaign = sourceCampaigns.find(isOngoing) ?? sourceCampaigns[0];
  const selectedCampaign =
    sourceCampaigns.find((campaign) => campaign.id === selectedCampaignId) ??
    defaultCampaign;
  const campaignOptions = sourceCampaigns.map((campaign) => ({
    value: campaign.id,
    label: campaign.name,
  }));

  const selectedId = selectedCampaign?.id;
  const from = range.start + "T00:00:00";
  const to = shiftDay(range.end, 1) + "T00:00:00";
  const queryKey = JSON.stringify([selectedId, from, to, granularity]);
  const [chartRetry, setChartRetry] = useState(0);
  const hourRangeTooLong = granularity === "hour" && shiftDay(range.start, 30) < range.end;
  const canLoadTrend = selectedId != null && !hourRangeTooLong;

  useEffect(() => {
    if (!canLoadTrend) return undefined;
    const controller = new AbortController();
    getCampaignTimeseries(selectedId, { from, to, granularity, signal: controller.signal })
      .then((buckets) => {
        const data = toTrendSeries(buckets, granularity);
        if (!controller.signal.aborted) setPerformanceState({ queryKey, chartRetry, data, error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const message = error.status === 404 ? "성과 추이 API를 사용할 수 없습니다." : error.message;
        setPerformanceState({ queryKey, chartRetry, data: null, error: message });
      });
    return () => controller.abort();
  }, [canLoadTrend, selectedId, from, to, granularity, queryKey, chartRetry]);

  const isPerformanceLoading = canLoadTrend &&
    (performanceState.queryKey !== queryKey || performanceState.chartRetry !== chartRetry);
  const chartSeries = canLoadTrend && !isPerformanceLoading ? performanceState.data : null;
  const metric = chartMetrics[chartMetric];
  const metricValues = chartSeries?.[chartMetric] ?? [];
  const hasMetricData = metricValues.length > 0 && metricValues.every(Number.isFinite);
  const impressions = selectedCampaign?.sent;
  const clicks = selectedCampaign?.clicks;
  const budget = toNonnegativeNumber(selectedCampaign?.totalBudget);
  const remaining = toNonnegativeNumber(selectedCampaign?.remainingBudget);
  const spent = toNonnegativeNumber(selectedCampaign?.spentTotal);
  const spentRate = budget > 0 && spent !== null ? (spent / budget) * 100 : null;
  const activeCampaignCount = campaigns.filter(isOngoing).length;
  const recentCampaigns = campaigns.slice(0, 10);
  const metrics = [
    {
      label: "누적 노출 수",
      value: impressions?.toLocaleString("ko-KR") ?? "—",
      icon: Eye,
      tone: "lavender",
    },
    {
      label: "누적 클릭수",
      value: clicks?.toLocaleString("ko-KR") ?? "—",
      icon: MousePointerClick,
      tone: "dark",
    },
    remaining !== null
      ? {
          label: "남은 예산",
          value: formatWon(remaining),
          caption: spentRate === null ? undefined : `예산 소진율 ${Math.round(spentRate)}%`,
          progress: spentRate ?? undefined,
          icon: Coins,
          tone: "pink",
        }
      : {
          label: "남은 예산",
          value: "—",
          caption: "예산 정보 없음",
          icon: Coins,
          tone: "pink",
        },
    {
      label: "진행 중인 캠페인",
      value: activeCampaignCount,
      icon: Megaphone,
      tone: "purple",
      to: "/campaigns",
    },
  ];

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    const dates = getPresetDates(preset);
    setRange(dates);
    setDateInputs(dates);
    setDateError("");
  };

  const applyCustomDates = () => {
    const { start, end } = dateInputs;
    if (!start || !end) {
      setDateError("시작일과 종료일을 모두 선택해 주세요.");
      return;
    }
    if (start > end) {
      setDateError("종료일은 시작일과 같거나 이후여야 합니다.");
      return;
    }

    setSelectedPreset("custom");
    setRange({ start, end });
    setDateError("");
    setShowCustomDates(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 text-[30px] font-extrabold tracking-tight text-[#111827]">
            안녕하세요, 광고주님!
          </h2>
          <p className="text-sm text-gray-500">
            광고 성과 요약을 확인해보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CampaignSelect
            options={campaignOptions}
            value={selectedCampaign?.id}
            onChange={setSelectedCampaignId}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isPresetMenuOpen}
              className="inline-flex min-h-11 min-w-44 items-center justify-between gap-5 rounded-xl border border-[#E4E1F0] bg-white px-4 text-sm font-semibold text-onad-dark shadow-sm transition hover:border-[#CFC4FF] hover:bg-[#FCFBFF] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple"
            >
              <span className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="text-[#7C6DB9]"
                  aria-hidden="true"
                />
                {presetOptions.find(
                  ([value]) => value === selectedPreset,
                )?.[1] || "기간 설정"}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#7C6DB9] transition-transform ${isPresetMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {isPresetMenuOpen && (
              <div
                role="menu"
                aria-label="분석 기간 선택"
                className="absolute right-0 z-20 mt-2 w-full min-w-52 overflow-hidden rounded-xl border border-[#E4E1F0] bg-white p-1.5 shadow-xl shadow-[#342B68]/10"
              >
                {presetOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsPresetMenuOpen(false);
                      if (value === "custom") {
                        setDateInputs(range);
                        setShowCustomDates(true);
                        setDateError("");
                        return;
                      }
                      applyPreset(value);
                      setShowCustomDates(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${selectedPreset === value ? "bg-[#F0ECFF] text-onad-purple" : "text-[#4B485C] hover:bg-[#F7F5FF] hover:text-onad-purple"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/campaigns/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-onad-purple px-5 text-sm font-bold text-white shadow-lg shadow-onad-purple/25 transition hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple"
          >
            <Plus size={17} aria-hidden="true" /> 새 캠페인 등록
          </Link>
        </div>
      </section>

      {showCustomDates && (
        <section
          className="mb-10 space-y-4 rounded-2xl border border-[#DED9FA] bg-white p-5 shadow-lg shadow-onad-purple/5"
          aria-labelledby="custom-date-title"
        >
          <h2
            id="custom-date-title"
            className="text-sm font-bold text-onad-dark"
          >
            분석 시작일 및 종료일 지정
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label
              className="text-xs font-medium text-[#5D5A6E]"
              htmlFor="start-date-input"
            >
              시작일
              <input
                id="start-date-input"
                type="date"
                value={dateInputs.start}
                onChange={(event) =>
                  setDateInputs((current) => ({
                    ...current,
                    start: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-onad-purple focus:ring-2 focus:ring-onad-purple/1010"
              />
            </label>
            <label
              className="text-xs font-medium text-[#5D5A6E]"
              htmlFor="end-date-input"
            >
              종료일
              <input
                id="end-date-input"
                type="date"
                value={dateInputs.end}
                onChange={(event) =>
                  setDateInputs((current) => ({
                    ...current,
                    end: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-onad-purple focus:ring-2 focus:ring-onad-purple/1010"
              />
            </label>
          </div>
          {dateError && (
            <p className="text-xs text-red-600" role="alert">
              {dateError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomDates(false)}
              className="rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-xs text-[#5D5A6E] hover:bg-[#F7F7FB]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={applyCustomDates}
              className="rounded-lg bg-onad-purple px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5839DB]"
            >
              기간 적용
            </button>
          </div>
        </section>
      )}

      <section className="mb-10" aria-label="주요 광고 지표">
        {isLoading ? (
          <p
            role="status"
            className="rounded-xl border bg-white p-5 text-sm text-[#667085]"
          >
            광고 성과를 불러오는 중입니다…
          </p>
        ) : errorMessage ? (
          <div className="rounded-xl border bg-white p-5 text-sm" role="alert">
            <p className="text-rose-600">{errorMessage}</p>
            <button
              type="button"
              className="mt-3 rounded-lg border px-3 py-2 text-xs font-semibold"
              onClick={() => {
                setIsLoading(true);
                setErrorMessage("");
                setRetryCount((n) => n + 1);
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <KpiCard key={metric.tone} {...metric} />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8">
        <section
          className="space-y-4 rounded-4xl border border-[#ECEAF5] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] md:p-6"
          aria-labelledby="trend-title"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2
                id="trend-title"
                className="text-xl font-extrabold tracking-tight text-onad-dark"
              >
                캠페인 성과 추이
              </h2>
              <p className="mt-1 text-xs text-[#858296]">
                {selectedCampaign ? `${selectedCampaign.name} · ${range.start} ~ ${range.end}` : "선택된 캠페인 없음"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="inline-flex self-start rounded-lg border border-[#E8E6F2] bg-[#F7F7FB] p-0.5 text-xs font-medium sm:self-auto"
                role="group"
                aria-label="차트 시간 단위"
              >
                {[
                  ["hour", "시간"],
                  ["day", "일"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGranularity(value)}
                    aria-pressed={granularity === value}
                    className={`rounded-md px-3 py-1 ${granularity === value ? "bg-white font-bold text-onad-purple shadow-sm" : "text-[#6F6C80] hover:text-onad-dark"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7FB] text-[#A3A0AF]">
                <ChartLine size={19} aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#F0EFF7]">
            <div role="tablist" aria-label="성과 지표 선택" className="flex gap-1">
              {Object.entries(chartMetrics).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={chartMetric === key}
                  aria-controls="trend-chart-panel"
                  onClick={() => setChartMetric(key)}
                  className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold transition ${
                    chartMetric === key
                      ? "border-onad-purple text-onad-purple"
                      : "border-transparent text-[#9A97A7] hover:text-onad-dark"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="pb-2 text-xs text-[#858296]">
              {metric.description} · 단위 {metric.unit}
            </p>
          </div>
          <div id="trend-chart-panel" role="tabpanel">
            {hasMetricData ? (
              <MetricTrendChart
                key={queryKey + chartMetric}
                labels={chartSeries.labels}
                values={metricValues}
                metricLabel={metric.label}
                formatValue={metric.format}
              />
            ) : (
              <p
                role={isPerformanceLoading ? "status" : undefined}
                className="flex h-96 items-center justify-center rounded-2xl bg-[#F7F7FB] text-sm text-[#858296]"
              >
                {isPerformanceLoading
                  ? "성과 데이터를 불러오는 중입니다…"
                  : hourRangeTooLong
                    ? "시간 단위 조회는 최대 31일까지 가능합니다."
                    : canLoadTrend && performanceState.error
                      ? performanceState.error
                      : chartSeries?.labels.length
                        ? "이 지표는 현재 서버에서 제공하지 않습니다."
                        : "선택한 캠페인의 성과 데이터가 없습니다."}
              </p>
            )}
          </div>
          {canLoadTrend && !isPerformanceLoading && performanceState.error && (
            <button type="button" className="text-sm font-semibold text-onad-purple" onClick={() => setChartRetry((count) => count + 1)}>다시 시도</button>
          )}
        </section>

        <CampaignTable
          campaigns={recentCampaigns}
          title="최근 캠페인 상태"
          hideDescription
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => {
            setIsLoading(true);
            setErrorMessage("");
            setRetryCount((n) => n + 1);
          }}
          dashboard
          sortableCtr
        />
      </div>
    </div>
  );
}

export default Dashboard;
