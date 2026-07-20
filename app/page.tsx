"use client";

import { useMemo, useState } from "react";

type View = "home" | "explore" | "detail" | "builder" | "results" | "about";
type RiskPreference = "conservative" | "balanced" | "aggressive";
type AllocationMethod = "equal" | "score";
type FactorKey = "beta" | "smb" | "rmw" | "cma" | "hmlo" | "momentum" | "volatility";

type Stock = {
  stock_id: string;
  stock_name: string;
  industry: string;
  market: string;
  reference_price: number;
  data_date: string;
  market_cap: number;
  popularity: number;
  beta_exposure: number;
  smb_exposure: number;
  rmw_exposure: number;
  cma_exposure: number;
  hmlo_exposure: number;
  momentum_value: number;
  volatility_value: number;
  beta_percentile: number;
  smb_percentile: number;
  rmw_percentile: number;
  cma_percentile: number;
  hmlo_percentile: number;
  momentum_percentile: number;
  volatility_percentile: number;
  beta_star: number;
  smb_star: number;
  rmw_star: number;
  cma_star: number;
  hmlo_star: number;
  momentum_star: number;
  volatility_star: number;
  overall_star: number;
  fatal_flag: boolean;
  risk_level: "低" | "中" | "高";
  data_quality_flag: "通過" | "注意";
  regression_observation_count: number;
  regression_fit_quality: "佳" | "中" | "弱";
};

type PortfolioSettings = {
  totalAmount: number;
  stockCount: number;
  minOverallStar: number;
  riskPreference: RiskPreference;
  excludeFatal: boolean;
  limitIndustry: boolean;
  industryCap: number;
  oddLots: boolean;
  factorWeights: Record<FactorKey, number>;
  allocationMethod: AllocationMethod;
  maxSingleWeight: number;
  minSingleWeight: number;
  reserveCashPercent: number;
};

type Recommendation = Stock & {
  custom_score: number;
  rank: number;
  allocation_weight: number;
  target_amount: number;
  purchasable_shares: number;
  actual_amount: number;
  remaining_cash: number;
  recommendation_reasons: string[];
  risk_reasons: string[];
};

const factorLabels: Record<FactorKey, string> = {
  beta: "Beta",
  smb: "SMB",
  rmw: "RMW",
  cma: "CMA",
  hmlo: "HML_o",
  momentum: "Momentum",
  volatility: "Volatility",
};

const factorHelp: Record<FactorKey, string> = {
  beta: "市場風險曝險，需依風險偏好判斷理想區間。",
  smb: "規模風格曝險，正值偏小型股，負值偏大型股。",
  rmw: "獲利能力因子曝險，較高通常代表品質特徵較明顯。",
  cma: "投資風格因子曝險，正值偏保守投資，負值偏積極擴張。",
  hmlo: "正交化價值因子曝險，協助辨識價值風格。",
  momentum: "歷史動能表現，反映近期相對強弱。",
  volatility: "歷史波動度，穩健偏好下會採反向計分。",
};

const stocks: Stock[] = [
  {
    stock_id: "2330",
    stock_name: "台積電",
    industry: "半導體",
    market: "上市",
    reference_price: 1035,
    data_date: "2026-07-19",
    market_cap: 26800,
    popularity: 98,
    beta_exposure: 1.04,
    smb_exposure: -0.42,
    rmw_exposure: 0.68,
    cma_exposure: 0.22,
    hmlo_exposure: 0.11,
    momentum_value: 0.18,
    volatility_value: 0.21,
    beta_percentile: 57,
    smb_percentile: 12,
    rmw_percentile: 92,
    cma_percentile: 68,
    hmlo_percentile: 55,
    momentum_percentile: 84,
    volatility_percentile: 38,
    beta_star: 3,
    smb_star: 1,
    rmw_star: 5,
    cma_star: 4,
    hmlo_star: 3,
    momentum_star: 5,
    volatility_star: 2,
    overall_star: 5,
    fatal_flag: false,
    risk_level: "中",
    data_quality_flag: "通過",
    regression_observation_count: 250,
    regression_fit_quality: "佳",
  },
  {
    stock_id: "2454",
    stock_name: "聯發科",
    industry: "半導體",
    market: "上市",
    reference_price: 1290,
    data_date: "2026-07-19",
    market_cap: 2040,
    popularity: 88,
    beta_exposure: 1.16,
    smb_exposure: -0.18,
    rmw_exposure: 0.44,
    cma_exposure: 0.09,
    hmlo_exposure: 0.05,
    momentum_value: 0.12,
    volatility_value: 0.27,
    beta_percentile: 68,
    smb_percentile: 28,
    rmw_percentile: 78,
    cma_percentile: 55,
    hmlo_percentile: 49,
    momentum_percentile: 73,
    volatility_percentile: 58,
    beta_star: 4,
    smb_star: 2,
    rmw_star: 4,
    cma_star: 3,
    hmlo_star: 3,
    momentum_star: 4,
    volatility_star: 3,
    overall_star: 4,
    fatal_flag: false,
    risk_level: "中",
    data_quality_flag: "通過",
    regression_observation_count: 244,
    regression_fit_quality: "佳",
  },
  {
    stock_id: "2412",
    stock_name: "中華電",
    industry: "電信服務",
    market: "上市",
    reference_price: 126,
    data_date: "2026-07-19",
    market_cap: 978,
    popularity: 76,
    beta_exposure: 0.48,
    smb_exposure: -0.35,
    rmw_exposure: 0.51,
    cma_exposure: 0.41,
    hmlo_exposure: 0.28,
    momentum_value: 0.04,
    volatility_value: 0.12,
    beta_percentile: 17,
    smb_percentile: 18,
    rmw_percentile: 83,
    cma_percentile: 86,
    hmlo_percentile: 69,
    momentum_percentile: 42,
    volatility_percentile: 12,
    beta_star: 1,
    smb_star: 1,
    rmw_star: 5,
    cma_star: 5,
    hmlo_star: 4,
    momentum_star: 3,
    volatility_star: 1,
    overall_star: 4,
    fatal_flag: false,
    risk_level: "低",
    data_quality_flag: "通過",
    regression_observation_count: 250,
    regression_fit_quality: "佳",
  },
  {
    stock_id: "2881",
    stock_name: "富邦金",
    industry: "金融保險",
    market: "上市",
    reference_price: 91,
    data_date: "2026-07-19",
    market_cap: 1190,
    popularity: 72,
    beta_exposure: 0.86,
    smb_exposure: -0.08,
    rmw_exposure: 0.22,
    cma_exposure: 0.31,
    hmlo_exposure: 0.46,
    momentum_value: 0.07,
    volatility_value: 0.2,
    beta_percentile: 44,
    smb_percentile: 38,
    rmw_percentile: 58,
    cma_percentile: 76,
    hmlo_percentile: 87,
    momentum_percentile: 54,
    volatility_percentile: 34,
    beta_star: 3,
    smb_star: 2,
    rmw_star: 3,
    cma_star: 4,
    hmlo_star: 5,
    momentum_star: 3,
    volatility_star: 2,
    overall_star: 4,
    fatal_flag: false,
    risk_level: "低",
    data_quality_flag: "通過",
    regression_observation_count: 232,
    regression_fit_quality: "中",
  },
  {
    stock_id: "2308",
    stock_name: "台達電",
    industry: "電子零組件",
    market: "上市",
    reference_price: 415,
    data_date: "2026-07-19",
    market_cap: 1078,
    popularity: 81,
    beta_exposure: 1.03,
    smb_exposure: -0.12,
    rmw_exposure: 0.59,
    cma_exposure: 0.17,
    hmlo_exposure: 0.2,
    momentum_value: 0.14,
    volatility_value: 0.23,
    beta_percentile: 55,
    smb_percentile: 34,
    rmw_percentile: 88,
    cma_percentile: 64,
    hmlo_percentile: 63,
    momentum_percentile: 79,
    volatility_percentile: 45,
    beta_star: 3,
    smb_star: 2,
    rmw_star: 5,
    cma_star: 4,
    hmlo_star: 4,
    momentum_star: 4,
    volatility_star: 3,
    overall_star: 5,
    fatal_flag: false,
    risk_level: "中",
    data_quality_flag: "通過",
    regression_observation_count: 249,
    regression_fit_quality: "佳",
  },
  {
    stock_id: "2603",
    stock_name: "長榮",
    industry: "航運",
    market: "上市",
    reference_price: 201,
    data_date: "2026-07-19",
    market_cap: 431,
    popularity: 69,
    beta_exposure: 1.42,
    smb_exposure: 0.19,
    rmw_exposure: 0.08,
    cma_exposure: -0.13,
    hmlo_exposure: 0.39,
    momentum_value: 0.21,
    volatility_value: 0.36,
    beta_percentile: 86,
    smb_percentile: 71,
    rmw_percentile: 41,
    cma_percentile: 26,
    hmlo_percentile: 81,
    momentum_percentile: 91,
    volatility_percentile: 84,
    beta_star: 5,
    smb_star: 4,
    rmw_star: 3,
    cma_star: 2,
    hmlo_star: 5,
    momentum_star: 5,
    volatility_star: 5,
    overall_star: 3,
    fatal_flag: false,
    risk_level: "高",
    data_quality_flag: "通過",
    regression_observation_count: 238,
    regression_fit_quality: "中",
  },
  {
    stock_id: "3008",
    stock_name: "大立光",
    industry: "光電",
    market: "上市",
    reference_price: 2360,
    data_date: "2026-07-19",
    market_cap: 316,
    popularity: 63,
    beta_exposure: 1.28,
    smb_exposure: 0.06,
    rmw_exposure: 0.32,
    cma_exposure: 0.04,
    hmlo_exposure: 0.12,
    momentum_value: -0.02,
    volatility_value: 0.33,
    beta_percentile: 78,
    smb_percentile: 58,
    rmw_percentile: 66,
    cma_percentile: 47,
    hmlo_percentile: 57,
    momentum_percentile: 27,
    volatility_percentile: 76,
    beta_star: 4,
    smb_star: 3,
    rmw_star: 4,
    cma_star: 3,
    hmlo_star: 3,
    momentum_star: 2,
    volatility_star: 4,
    overall_star: 3,
    fatal_flag: false,
    risk_level: "高",
    data_quality_flag: "通過",
    regression_observation_count: 246,
    regression_fit_quality: "中",
  },
  {
    stock_id: "6488",
    stock_name: "環球晶",
    industry: "半導體",
    market: "上櫃",
    reference_price: 512,
    data_date: "2026-07-19",
    market_cap: 224,
    popularity: 57,
    beta_exposure: 1.34,
    smb_exposure: 0.23,
    rmw_exposure: -0.11,
    cma_exposure: -0.21,
    hmlo_exposure: 0.08,
    momentum_value: 0.03,
    volatility_value: 0.39,
    beta_percentile: 82,
    smb_percentile: 78,
    rmw_percentile: 18,
    cma_percentile: 16,
    hmlo_percentile: 51,
    momentum_percentile: 38,
    volatility_percentile: 89,
    beta_star: 5,
    smb_star: 4,
    rmw_star: 1,
    cma_star: 1,
    hmlo_star: 3,
    momentum_star: 2,
    volatility_star: 5,
    overall_star: 2,
    fatal_flag: true,
    risk_level: "高",
    data_quality_flag: "注意",
    regression_observation_count: 198,
    regression_fit_quality: "弱",
  },
  {
    stock_id: "9910",
    stock_name: "豐泰",
    industry: "消費品",
    market: "上市",
    reference_price: 147,
    data_date: "2026-07-19",
    market_cap: 145,
    popularity: 44,
    beta_exposure: 0.72,
    smb_exposure: 0.14,
    rmw_exposure: 0.37,
    cma_exposure: 0.27,
    hmlo_exposure: 0.18,
    momentum_value: 0.08,
    volatility_value: 0.19,
    beta_percentile: 31,
    smb_percentile: 66,
    rmw_percentile: 71,
    cma_percentile: 72,
    hmlo_percentile: 61,
    momentum_percentile: 59,
    volatility_percentile: 29,
    beta_star: 2,
    smb_star: 4,
    rmw_star: 4,
    cma_star: 4,
    hmlo_star: 4,
    momentum_star: 3,
    volatility_star: 2,
    overall_star: 4,
    fatal_flag: false,
    risk_level: "低",
    data_quality_flag: "通過",
    regression_observation_count: 221,
    regression_fit_quality: "中",
  },
  {
    stock_id: "3661",
    stock_name: "世芯-KY",
    industry: "半導體",
    market: "上市",
    reference_price: 2890,
    data_date: "2026-07-19",
    market_cap: 235,
    popularity: 74,
    beta_exposure: 1.56,
    smb_exposure: 0.22,
    rmw_exposure: -0.06,
    cma_exposure: -0.09,
    hmlo_exposure: -0.12,
    momentum_value: 0.24,
    volatility_value: 0.44,
    beta_percentile: 92,
    smb_percentile: 76,
    rmw_percentile: 24,
    cma_percentile: 29,
    hmlo_percentile: 21,
    momentum_percentile: 94,
    volatility_percentile: 95,
    beta_star: 5,
    smb_star: 4,
    rmw_star: 2,
    cma_star: 2,
    hmlo_star: 2,
    momentum_star: 5,
    volatility_star: 5,
    overall_star: 3,
    fatal_flag: true,
    risk_level: "高",
    data_quality_flag: "通過",
    regression_observation_count: 210,
    regression_fit_quality: "中",
  },
];

const presets: Record<string, Record<FactorKey, number>> = {
  均衡型: { beta: 10, smb: 10, rmw: 20, cma: 15, hmlo: 15, momentum: 15, volatility: 15 },
  穩健低波動型: { beta: 10, smb: 5, rmw: 20, cma: 20, hmlo: 15, momentum: 5, volatility: 25 },
  品質成長型: { beta: 10, smb: 5, rmw: 30, cma: 15, hmlo: 5, momentum: 25, volatility: 10 },
  價值型: { beta: 10, smb: 10, rmw: 15, cma: 15, hmlo: 35, momentum: 5, volatility: 10 },
  動能型: { beta: 10, smb: 5, rmw: 15, cma: 5, hmlo: 5, momentum: 45, volatility: 15 },
  小型股風格: { beta: 10, smb: 35, rmw: 15, cma: 10, hmlo: 10, momentum: 10, volatility: 10 },
  大型股穩健型: { beta: 15, smb: 5, rmw: 25, cma: 20, hmlo: 15, momentum: 5, volatility: 15 },
};

const initialSettings: PortfolioSettings = {
  totalAmount: 1000000,
  stockCount: 5,
  minOverallStar: 3,
  riskPreference: "balanced",
  excludeFatal: true,
  limitIndustry: true,
  industryCap: 45,
  oddLots: true,
  factorWeights: presets["均衡型"],
  allocationMethod: "score",
  maxSingleWeight: 30,
  minSingleWeight: 5,
  reserveCashPercent: 3,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);

const starText = (count: number) => "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
const weightSum = (weights: Record<FactorKey, number>) =>
  Object.values(weights).reduce((sum, value) => sum + value, 0);

function adjustedPercentile(stock: Stock, factor: FactorKey, riskPreference: RiskPreference) {
  if (factor === "volatility") return 100 - stock.volatility_percentile;
  if (factor === "beta") {
    if (riskPreference === "conservative") return 100 - stock.beta_percentile;
    if (riskPreference === "aggressive") return stock.beta_percentile;
    return Math.max(0, 100 - Math.abs(stock.beta_percentile - 50) * 2);
  }
  if (factor === "smb" && riskPreference === "conservative") return 100 - stock.smb_percentile;
  return stock[`${factor}_percentile` as keyof Stock] as number;
}

function calculateScore(stock: Stock, settings: PortfolioSettings) {
  const total = weightSum(settings.factorWeights) || 1;
  const weighted = (Object.keys(settings.factorWeights) as FactorKey[]).reduce((sum, factor) => {
    return sum + adjustedPercentile(stock, factor, settings.riskPreference) * (settings.factorWeights[factor] / total);
  }, 0);
  return Math.max(0, Math.min(100, stock.fatal_flag && !settings.excludeFatal ? weighted - 12 : weighted));
}

function reasonsFor(stock: Stock) {
  const reasons = [];
  if (stock.rmw_percentile >= 75) reasons.push(`RMW 百分位 ${stock.rmw_percentile}，品質因子相對突出`);
  if (stock.momentum_percentile >= 75) reasons.push(`Momentum 百分位 ${stock.momentum_percentile}，近期動能明顯`);
  if (stock.hmlo_percentile >= 75) reasons.push(`HML_o 百分位 ${stock.hmlo_percentile}，價值風格清楚`);
  if (stock.volatility_percentile <= 35) reasons.push(`Volatility 百分位 ${stock.volatility_percentile}，歷史波動相對低`);
  if (!reasons.length) reasons.push("綜合因子表現符合目前篩選條件");
  return reasons.slice(0, 3);
}

function riskReasonsFor(stock: Stock) {
  const risks = [];
  if (stock.fatal_flag) risks.push("觸發 SMB > 0、RMW < 0、CMA < 0 致命組合");
  if (stock.volatility_percentile >= 75) risks.push("歷史波動度位於市場較高區間");
  if (stock.beta_percentile >= 80) risks.push("Beta 曝險偏高，對市場波動較敏感");
  if (stock.regression_fit_quality === "弱") risks.push("迴歸配適品質較弱，解讀需保守");
  if (!risks.length) risks.push("未觸發主要風險規則，仍需留意模型限制");
  return risks;
}

function buildRecommendations(settings: PortfolioSettings): Recommendation[] {
  const available = settings.totalAmount * (1 - settings.reserveCashPercent / 100);
  const filtered = stocks
    .filter((stock) => stock.data_quality_flag === "通過")
    .filter((stock) => stock.overall_star >= settings.minOverallStar)
    .filter((stock) => (settings.excludeFatal ? !stock.fatal_flag : true))
    .filter((stock) => (settings.riskPreference === "conservative" ? stock.risk_level !== "高" : true))
    .map((stock) => ({ stock, score: calculateScore(stock, settings) }))
    .sort((a, b) => b.score - a.score);

  const selected: typeof filtered = [];
  const industryBudget = new Map<string, number>();
  for (const item of filtered) {
    if (selected.length >= settings.stockCount) break;
    const currentIndustryCount = industryBudget.get(item.stock.industry) || 0;
    const projectedIndustryShare = ((currentIndustryCount + 1) / settings.stockCount) * 100;
    if (settings.limitIndustry && projectedIndustryShare > settings.industryCap) continue;
    industryBudget.set(item.stock.industry, currentIndustryCount + 1);
    selected.push(item);
  }

  const scoreTotal = selected.reduce((sum, item) => sum + item.score, 0) || 1;
  let remainingCash = settings.totalAmount;

  return selected.map((item, index) => {
    const baseWeight =
      settings.allocationMethod === "equal" ? 100 / selected.length : (item.score / scoreTotal) * 100;
    const allocation_weight = Math.min(
      settings.maxSingleWeight,
      Math.max(settings.minSingleWeight, Number(baseWeight.toFixed(2))),
    );
    const target_amount = available * (allocation_weight / 100);
    const lotSize = settings.oddLots ? 1 : 1000;
    const purchasable_shares = Math.floor(target_amount / item.stock.reference_price / lotSize) * lotSize;
    const actual_amount = purchasable_shares * item.stock.reference_price;
    remainingCash -= actual_amount;
    return {
      ...item.stock,
      custom_score: Number(item.score.toFixed(2)),
      rank: index + 1,
      allocation_weight,
      target_amount,
      purchasable_shares,
      actual_amount,
      remaining_cash: Math.max(0, remainingCash),
      recommendation_reasons: reasonsFor(item.stock),
      risk_reasons: riskReasonsFor(item.stock),
    };
  });
}

function AiStockExplanation({ stock }: { stock: Stock }) {
  return (
    <div className="notice">
      <strong>AI 一句話摘要</strong>
      <p>
        {stock.stock_name} 的主要特徵是 {reasonsFor(stock).join("；")}。此說明僅根據結構化因子資料生成，不代表未來報酬保證。
      </p>
    </div>
  );
}

function StockCard({
  stock,
  onDetail,
  onCandidate,
}: {
  stock: Stock;
  onDetail: () => void;
  onCandidate: () => void;
}) {
  return (
    <article className="card stock-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>{stock.stock_name}</strong>
          <div className="subtle">
            {stock.stock_id} · {stock.industry}
          </div>
        </div>
        <span className="stars" title={`${stock.overall_star} 星`}>
          {starText(stock.overall_star)}
        </span>
      </div>
      <div className="tag-row">
        {reasonsFor(stock).slice(0, 2).map((reason) => (
          <span className="tag" key={reason}>
            {reason.split("，")[0]}
          </span>
        ))}
        {stock.fatal_flag && <span className="tag risk">致命組合警示</span>}
      </div>
      <p className="subtle">{riskReasonsFor(stock)[0]}</p>
      <div className="row">
        <button className="button secondary" onClick={onDetail}>
          查看詳情
        </button>
        <button className="button ghost" onClick={onCandidate}>
          加入候選
        </button>
      </div>
    </article>
  );
}

function FactorCard({ stock, factor }: { stock: Stock; factor: FactorKey }) {
  const percentile = stock[`${factor}_percentile` as keyof Stock] as number;
  const exposureKey = factor === "momentum" ? "momentum_value" : factor === "volatility" ? "volatility_value" : `${factor}_exposure`;
  const exposure = stock[exposureKey as keyof Stock] as number;
  const star = stock[`${factor}_star` as keyof Stock] as number;
  const direction =
    factor === "volatility"
      ? "穩健偏好下反向解讀"
      : factor === "beta"
        ? "依風險偏好判斷"
        : factor === "smb"
          ? stock.smb_exposure > 0
            ? "偏小型股"
            : "偏大型股"
          : exposure >= 0
            ? "正向曝險"
            : "負向曝險";
  return (
    <article className="card factor-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong title={factorHelp[factor]}>{factorLabels[factor]}</strong>
        <span className="stars">{starText(star)}</span>
      </div>
      <div className="meter" aria-label={`${factorLabels[factor]} 百分位 ${percentile}`}>
        <span style={{ width: `${percentile}%` }} />
      </div>
      <div className="grid two">
        <span>原始值：{exposure.toFixed(2)}</span>
        <span>百分位：{percentile}</span>
      </div>
      <span className="tag">{direction}</span>
      <p className="subtle">{factorHelp[factor]}</p>
    </article>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("全部");
  const [minStar, setMinStar] = useState(1);
  const [risk, setRisk] = useState("全部");
  const [excludeFatal, setExcludeFatal] = useState(false);
  const [sortBy, setSortBy] = useState("overall");
  const [selectedId, setSelectedId] = useState(stocks[0].stock_id);
  const [candidateIds, setCandidateIds] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [preset, setPreset] = useState("均衡型");
  const [settings, setSettings] = useState<PortfolioSettings>(initialSettings);

  const selectedStock = stocks.find((stock) => stock.stock_id === selectedId) || stocks[0];
  const industries = ["全部", ...Array.from(new Set(stocks.map((stock) => stock.industry)))];
  const recommendations = useMemo(() => buildRecommendations(settings), [settings]);
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((stock) => `${stock.stock_name}${stock.stock_id}`.toLowerCase().includes(query.toLowerCase()))
      .filter((stock) => (industry === "全部" ? true : stock.industry === industry))
      .filter((stock) => stock.overall_star >= minStar)
      .filter((stock) => (risk === "全部" ? true : stock.risk_level === risk))
      .filter((stock) => (excludeFatal ? !stock.fatal_flag : true))
      .sort((a, b) => {
        if (sortBy === "custom") return calculateScore(b, settings) - calculateScore(a, settings);
        if (sortBy === "momentum") return b.momentum_percentile - a.momentum_percentile;
        if (sortBy === "rmw") return b.rmw_percentile - a.rmw_percentile;
        if (sortBy === "hmlo") return b.hmlo_percentile - a.hmlo_percentile;
        if (sortBy === "lowVol") return a.volatility_percentile - b.volatility_percentile;
        if (sortBy === "popular") return b.popularity - a.popularity;
        return b.overall_star - a.overall_star;
      });
  }, [query, industry, minStar, risk, excludeFatal, sortBy, settings]);

  const addCandidate = (id: string) => {
    setCandidateIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const updateSetting = <K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateWeight = (factor: FactorKey, value: number) => {
    setSettings((current) => ({
      ...current,
      factorWeights: { ...current.factorWeights, [factor]: value },
    }));
  };

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <span>AI x Smart Beta</span>
        </div>
        <nav className="nav" aria-label="主要導覽">
          {[
            ["home", "首頁"],
            ["explore", "股票探索"],
            ["builder", "建立投資組合"],
            ["results", "結果"],
            ["about", "系統說明"],
          ].map(([id, label]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => navigate(id as View)}>
              {label}
            </button>
          ))}
        </nav>
        <input
          className="field top-search"
          aria-label="股票名稱或代碼搜尋"
          placeholder="搜尋股票名稱或代碼"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setView("explore");
          }}
        />
      </header>

      {view === "home" && (
        <>
          <section className="hero">
            <div>
              <h1>AI x Smart Beta 智能選股決策系統</h1>
              <p>用因子模型看懂股票，建立符合你偏好的投資組合。</p>
              <div className="hero-actions">
                <input
                  className="field"
                  style={{ maxWidth: 360 }}
                  placeholder="輸入公司名稱或股票代碼"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button className="button" onClick={() => navigate("builder")}>
                  開始建立投資組合
                </button>
                <button className="button secondary" onClick={() => navigate("explore")}>
                  探索股票
                </button>
              </div>
              <p className="subtle">最新資料更新日期：2026-07-19。本系統為投資決策輔助，非投資保證。</p>
            </div>
            <aside className="market-panel" aria-label="市場探索摘要">
              <strong>市場探索中心</strong>
              <div className="market-chart">
                {[42, 55, 48, 74, 62, 88, 69, 92, 57].map((height, index) => (
                  <span className="bar" key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="grid three">
                <div>
                  <span className="subtle">樣本股票</span>
                  <strong>{stocks.length}</strong>
                </div>
                <div>
                  <span className="subtle">因子</span>
                  <strong>7</strong>
                </div>
                <div>
                  <span className="subtle">候選</span>
                  <strong>{candidateIds.length}</strong>
                </div>
              </div>
            </aside>
          </section>
          <main className="main">
            {[
              ["熱門關注", [...stocks].sort((a, b) => b.popularity - a.popularity).slice(0, 4)],
              ["綜合評分較高", [...stocks].sort((a, b) => b.overall_star - a.overall_star).slice(0, 4)],
              ["強勢動能", [...stocks].sort((a, b) => b.momentum_percentile - a.momentum_percentile).slice(0, 4)],
              ["穩健低波動", [...stocks].sort((a, b) => a.volatility_percentile - b.volatility_percentile).slice(0, 4)],
            ].map(([title, list]) => (
              <section key={title as string} style={{ marginBottom: 32 }}>
                <div className="section-head">
                  <div>
                    <h2>{title as string}</h2>
                    <p>首頁僅呈現主要因子特色與風險提示，完整曝險請進入個股分析。</p>
                  </div>
                </div>
                <div className="grid four">
                  {(list as Stock[]).map((stock) => (
                    <StockCard
                      key={`${title}-${stock.stock_id}`}
                      stock={stock}
                      onCandidate={() => addCandidate(stock.stock_id)}
                      onDetail={() => {
                        setSelectedId(stock.stock_id);
                        navigate("detail");
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </main>
        </>
      )}

      {view === "explore" && (
        <main className="main">
          <div className="section-head">
            <div>
              <h2>股票搜尋與篩選</h2>
              <p>以全市場百分位、星等、風險條件與客製化分數探索股票。</p>
            </div>
            <span className="tag">結果 {filteredStocks.length} 筆</span>
          </div>
          <div className="filter-layout">
            <aside className="card filter-panel">
              <label className="label">
                公司名稱或代碼
                <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <label className="label">
                產業
                <select className="select" value={industry} onChange={(event) => setIndustry(event.target.value)}>
                  {industries.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="label">
                最低綜合星等
                <select className="select" value={minStar} onChange={(event) => setMinStar(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <option value={item} key={item}>
                      {item} 星以上
                    </option>
                  ))}
                </select>
              </label>
              <label className="label">
                風險等級
                <select className="select" value={risk} onChange={(event) => setRisk(event.target.value)}>
                  {["全部", "低", "中", "高"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="label">
                排序方式
                <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="overall">綜合評分</option>
                  <option value="custom">客製化評分</option>
                  <option value="momentum">動能</option>
                  <option value="rmw">獲利能力</option>
                  <option value="hmlo">價值因子</option>
                  <option value="lowVol">低波動</option>
                  <option value="popular">市場熱門程度</option>
                </select>
              </label>
              <label className="row">
                <input type="checkbox" checked={excludeFatal} onChange={(event) => setExcludeFatal(event.target.checked)} />
                排除致命組合
              </label>
            </aside>
            <section className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>股票</th>
                    <th>產業</th>
                    <th>綜合星等</th>
                    <th>客製化分數</th>
                    <th>RMW</th>
                    <th>Momentum</th>
                    <th>Volatility</th>
                    <th>風險</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.stock_id}>
                      <td>
                        <strong>{stock.stock_name}</strong>
                        <div className="subtle">{stock.stock_id}</div>
                      </td>
                      <td>{stock.industry}</td>
                      <td className="stars">{starText(stock.overall_star)}</td>
                      <td>{calculateScore(stock, settings).toFixed(1)}</td>
                      <td>{stock.rmw_percentile}</td>
                      <td>{stock.momentum_percentile}</td>
                      <td>{stock.volatility_percentile}</td>
                      <td>
                        <span className={stock.fatal_flag ? "tag risk" : "tag"}>{stock.fatal_flag ? "致命組合" : stock.risk_level}</span>
                      </td>
                      <td>
                        <div className="row">
                          <button
                            className="button secondary"
                            onClick={() => {
                              setSelectedId(stock.stock_id);
                              navigate("detail");
                            }}
                          >
                            詳情
                          </button>
                          <button className="button ghost" onClick={() => addCandidate(stock.stock_id)}>
                            候選
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </main>
      )}

      {view === "detail" && (
        <main className="main">
          <div className="factor-layout">
            <section className="grid">
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <h2 className="panel-title">
                      {selectedStock.stock_name} {selectedStock.stock_id}
                    </h2>
                    <p className="subtle">
                      {selectedStock.industry} · {selectedStock.market} · 資料日期 {selectedStock.data_date} · 參考股價{" "}
                      {formatCurrency(selectedStock.reference_price)}
                    </p>
                  </div>
                  <span className="stars">{starText(selectedStock.overall_star)}</span>
                </div>
              </div>
              <AiStockExplanation stock={selectedStock} />
              <section>
                <div className="section-head">
                  <div>
                    <h2>市場與規模</h2>
                    <p>Beta 與 SMB 用來理解市場敏感度與規模風格，不直接代表公司品質。</p>
                  </div>
                </div>
                <div className="grid two">
                  <FactorCard stock={selectedStock} factor="beta" />
                  <FactorCard stock={selectedStock} factor="smb" />
                </div>
              </section>
              <section>
                <div className="section-head">
                  <h2>獲利與投資</h2>
                </div>
                <div className="grid two">
                  <FactorCard stock={selectedStock} factor="rmw" />
                  <FactorCard stock={selectedStock} factor="cma" />
                </div>
              </section>
              <section>
                <div className="section-head">
                  <h2>價值與動能</h2>
                </div>
                <div className="grid two">
                  <FactorCard stock={selectedStock} factor="hmlo" />
                  <FactorCard stock={selectedStock} factor="momentum" />
                </div>
              </section>
              <section>
                <div className="section-head">
                  <h2>風險狀態</h2>
                </div>
                <div className="grid two">
                  <FactorCard stock={selectedStock} factor="volatility" />
                  <article className="card">
                    <strong>Fatal combination</strong>
                    <p className="subtle">規則：SMB &gt; 0、RMW &lt; 0、CMA &lt; 0 同時成立。</p>
                    <span className={selectedStock.fatal_flag ? "tag risk" : "tag"}>
                      {selectedStock.fatal_flag ? "已觸發" : "未觸發"}
                    </span>
                  </article>
                </div>
              </section>
            </section>
            <aside className="grid">
              <div className="card">
                <h2 className="panel-title">風險警示</h2>
                {riskReasonsFor(selectedStock).map((reason) => (
                  <p className="warning-box" key={reason}>
                    {reason}
                  </p>
                ))}
                <p className="subtle">
                  迴歸觀測數 {selectedStock.regression_observation_count}，配適品質 {selectedStock.regression_fit_quality}。
                </p>
              </div>
              <div className="card">
                <h2 className="panel-title">下一步</h2>
                <div className="grid">
                  <button className="button" onClick={() => addCandidate(selectedStock.stock_id)}>
                    加入候選清單
                  </button>
                  <button className="button secondary" onClick={() => navigate("builder")}>
                    加入投資組合
                  </button>
                  <button className="button secondary" onClick={() => navigate("explore")}>
                    回到搜尋結果
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {view === "builder" && (
        <main className="main">
          <div className="section-head">
            <div>
              <h2>投資組合建立</h2>
              <p>四步驟區分投資條件、因子偏好與資金配置，避免混淆評分權重和資金權重。</p>
            </div>
            <span className={weightSum(settings.factorWeights) === 100 ? "tag" : "tag warn"}>
              因子權重總和 {weightSum(settings.factorWeights)}%
            </span>
          </div>
          <div className="stepper">
            {["投資條件", "因子偏好", "資金配置", "確認設定"].map((label, index) => (
              <button key={label} className={step === index + 1 ? "step-tab active" : "step-tab"} onClick={() => setStep(index + 1)}>
                {index + 1}. {label}
              </button>
            ))}
          </div>
          <section className="step-panel">
            {step === 1 && (
              <div className="grid three">
                <label className="label">
                  投資總金額
                  <input
                    className="field"
                    type="number"
                    value={settings.totalAmount}
                    onChange={(event) => updateSetting("totalAmount", Number(event.target.value))}
                  />
                </label>
                <label className="label">
                  預計持有股票數量
                  <input
                    className="field"
                    type="number"
                    min={3}
                    max={10}
                    value={settings.stockCount}
                    onChange={(event) => updateSetting("stockCount", Number(event.target.value))}
                  />
                </label>
                <label className="label">
                  最低綜合星等
                  <select
                    className="select"
                    value={settings.minOverallStar}
                    onChange={(event) => updateSetting("minOverallStar", Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((item) => (
                      <option value={item} key={item}>
                        {item} 星以上
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label">
                  風險偏好
                  <select
                    className="select"
                    value={settings.riskPreference}
                    onChange={(event) => updateSetting("riskPreference", event.target.value as RiskPreference)}
                  >
                    <option value="conservative">保守</option>
                    <option value="balanced">均衡</option>
                    <option value="aggressive">積極</option>
                  </select>
                </label>
                <label className="label">
                  單一產業配置上限
                  <input
                    className="field"
                    type="number"
                    value={settings.industryCap}
                    onChange={(event) => updateSetting("industryCap", Number(event.target.value))}
                  />
                </label>
                <div className="grid">
                  <label className="row">
                    <input
                      type="checkbox"
                      checked={settings.excludeFatal}
                      onChange={(event) => updateSetting("excludeFatal", event.target.checked)}
                    />
                    排除致命組合
                  </label>
                  <label className="row">
                    <input
                      type="checkbox"
                      checked={settings.limitIndustry}
                      onChange={(event) => updateSetting("limitIndustry", event.target.checked)}
                    />
                    限制產業集中
                  </label>
                  <label className="row">
                    <input type="checkbox" checked={settings.oddLots} onChange={(event) => updateSetting("oddLots", event.target.checked)} />
                    使用零股
                  </label>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="grid">
                <div className="preset-grid">
                  {Object.keys(presets).map((name) => (
                    <button
                      key={name}
                      className={preset === name ? "preset active" : "preset"}
                      onClick={() => {
                        setPreset(name);
                        updateSetting("factorWeights", presets[name]);
                      }}
                    >
                      <strong>{name}</strong>
                      <p className="subtle">一鍵帶入預設因子偏好。</p>
                    </button>
                  ))}
                </div>
                {(Object.keys(settings.factorWeights) as FactorKey[]).map((factor) => (
                  <label className="slider-row" key={factor}>
                    <span title={factorHelp[factor]}>{factorLabels[factor]}</span>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={settings.factorWeights[factor]}
                      onChange={(event) => updateWeight(factor, Number(event.target.value))}
                    />
                    <input
                      className="field"
                      type="number"
                      min={0}
                      max={100}
                      value={settings.factorWeights[factor]}
                      onChange={(event) => updateWeight(factor, Number(event.target.value))}
                    />
                  </label>
                ))}
                {weightSum(settings.factorWeights) !== 100 && (
                  <p className="warning-box">輸入錯誤：因子權重總和必須等於 100%，目前為 {weightSum(settings.factorWeights)}%。</p>
                )}
              </div>
            )}
            {step === 3 && (
              <div className="grid three">
                <label className="label">
                  資金配置方式
                  <select
                    className="select"
                    value={settings.allocationMethod}
                    onChange={(event) => updateSetting("allocationMethod", event.target.value as AllocationMethod)}
                  >
                    <option value="equal">等額配置</option>
                    <option value="score">依評分配置</option>
                  </select>
                </label>
                <label className="label">
                  單一股票最大配置比例
                  <input
                    className="field"
                    type="number"
                    value={settings.maxSingleWeight}
                    onChange={(event) => updateSetting("maxSingleWeight", Number(event.target.value))}
                  />
                </label>
                <label className="label">
                  最低配置比例
                  <input
                    className="field"
                    type="number"
                    value={settings.minSingleWeight}
                    onChange={(event) => updateSetting("minSingleWeight", Number(event.target.value))}
                  />
                </label>
                <label className="label">
                  保留最低現金比例
                  <input
                    className="field"
                    type="number"
                    value={settings.reserveCashPercent}
                    onChange={(event) => updateSetting("reserveCashPercent", Number(event.target.value))}
                  />
                </label>
              </div>
            )}
            {step === 4 && (
              <div className="grid two">
                <div className="card">
                  <h2 className="panel-title">設定摘要</h2>
                  <p>投資金額：{formatCurrency(settings.totalAmount)}</p>
                  <p>股票數量：{settings.stockCount}</p>
                  <p>風險偏好：{settings.riskPreference === "conservative" ? "保守" : settings.riskPreference === "balanced" ? "均衡" : "積極"}</p>
                  <p>配置方式：{settings.allocationMethod === "equal" ? "等額配置" : "依評分配置"}</p>
                  <p>排除致命組合：{settings.excludeFatal ? "是" : "否"}</p>
                </div>
                <div className="card">
                  <h2 className="panel-title">可產生結果</h2>
                  <p className="subtle">
                    符合條件股票不足時，系統會保留條件並提示原因，不會自行忽略條件。
                  </p>
                  <button className="button" disabled={weightSum(settings.factorWeights) !== 100} onClick={() => navigate("results")}>
                    產生智能投資組合
                  </button>
                </div>
              </div>
            )}
            <div className="row" style={{ marginTop: 18, justifyContent: "space-between" }}>
              <button className="button secondary" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
                上一步
              </button>
              <button className="button" disabled={step === 4} onClick={() => setStep((current) => Math.min(4, current + 1))}>
                下一步
              </button>
            </div>
          </section>
        </main>
      )}

      {view === "results" && (
        <main className="main">
          <div className="section-head">
            <div>
              <h2>投資組合結果</h2>
              <p>推薦清單由確定性量化規則產生，AI 僅根據結果產生解釋文字。</p>
            </div>
            <button className="button secondary" onClick={() => navigate("builder")}>
              調整設定
            </button>
          </div>
          {recommendations.length < settings.stockCount && (
            <p className="warning-box">
              符合條件股票不足：目前僅 {recommendations.length} 支。可能原因包含最低星等、排除致命組合、保守風險偏好或產業上限過嚴。建議放寬最低星等、提高產業上限或取消排除致命組合。
            </p>
          )}
          <section className="summary-strip">
            <div className="kpi">
              投資總金額<strong>{formatCurrency(settings.totalAmount)}</strong>
            </div>
            <div className="kpi">
              實際配置<strong>{formatCurrency(recommendations.reduce((sum, item) => sum + item.actual_amount, 0))}</strong>
            </div>
            <div className="kpi">
              剩餘現金<strong>{formatCurrency(settings.totalAmount - recommendations.reduce((sum, item) => sum + item.actual_amount, 0))}</strong>
            </div>
            <div className="kpi">
              股票數量<strong>{recommendations.length}</strong>
            </div>
            <div className="kpi">
              平均星等<strong>{(recommendations.reduce((sum, item) => sum + item.overall_star, 0) / Math.max(1, recommendations.length)).toFixed(1)}</strong>
            </div>
            <div className="kpi">
              風險等級<strong>{recommendations.some((item) => item.risk_level === "高") ? "高" : "中"}</strong>
            </div>
          </section>
          <section style={{ marginTop: 22 }} className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>股票</th>
                  <th>分數</th>
                  <th>星等</th>
                  <th>配置比例</th>
                  <th>配置金額</th>
                  <th>股數</th>
                  <th>推薦原因</th>
                  <th>主要風險</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((item) => (
                  <tr key={item.stock_id}>
                    <td>{item.rank}</td>
                    <td>
                      <strong>{item.stock_name}</strong>
                      <div className="subtle">
                        {item.stock_id} · {item.industry}
                      </div>
                    </td>
                    <td>{item.custom_score}</td>
                    <td className="stars">{starText(item.overall_star)}</td>
                    <td>{item.allocation_weight}%</td>
                    <td>{formatCurrency(item.actual_amount)}</td>
                    <td>{item.purchasable_shares.toLocaleString("zh-TW")}</td>
                    <td>{item.recommendation_reasons[0]}</td>
                    <td>{item.risk_reasons[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="grid two" style={{ marginTop: 22 }}>
            <div className="card">
              <h2 className="panel-title">AI 組合整體分析</h2>
              <p className="subtle">
                此組合主要偏向 {settings.allocationMethod === "score" ? "依客製化分數提高高排名股票權重" : "等額分散配置"}，
                較強因子集中在 {recommendations[0]?.recommendation_reasons[0] || "目前條件下沒有足夠樣本"}。主要風險來自
                {recommendations.find((item) => item.risk_level === "高")?.risk_reasons[0] || "模型估計期間、資料品質與市場狀態變化"}。
              </p>
            </div>
            <div className="card">
              <h2 className="panel-title">免責聲明</h2>
              <p className="subtle">
                本結果為量化模型之決策輔助，不代表未來報酬保證。因子曝險由歷史資料估計，可能受到市場狀態、資料品質與估計期間影響。本 MVP 尚未納入交易成本、稅費、流動性與滑價。
              </p>
            </div>
          </section>
        </main>
      )}

      {view === "about" && (
        <main className="main">
          <div className="section-head">
            <div>
              <h2>系統說明</h2>
              <p>本系統不是股價預測或自動下單工具，而是可解釋的量化投資決策輔助系統。</p>
            </div>
          </div>
          <div className="grid three">
            {[
              ["確定性量化計算", "Rolling Regression、百分位、星等、致命組合、排名與配置由程式完成。"],
              ["AI 解釋邊界", "AI 僅根據結構化 JSON 解釋，不創造新聞、財務資訊或報酬預測。"],
              ["待產品決策", "TEJ 欄位授權、批次頻率、Beta 理想區間、資料不足門檻與上線資料庫規格需再決策。"],
            ].map(([title, body]) => (
              <article className="card" key={title}>
                <h2 className="panel-title">{title}</h2>
                <p className="subtle">{body}</p>
              </article>
            ))}
          </div>
        </main>
      )}

      <footer className="footer-note">
        資料欄位命名遵循 stock_id、factor_percentile、factor_star、custom_score、allocation_weight 等一致規格。此 MVP 使用樣本資料展示流程，正式版需串接 TEJ/API 與批次因子引擎。
      </footer>
    </div>
  );
}
