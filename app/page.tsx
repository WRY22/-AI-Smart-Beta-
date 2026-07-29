"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type View = "home" | "explore" | "detail" | "builder" | "results" | "about" | "login" | "register" | "account";
type RiskPreference = "conservative" | "balanced" | "aggressive";
type AllocationMethod = "equal" | "score";
type FactorKey = "beta" | "smb" | "rmw" | "cma" | "hmlo" | "momentum" | "volatility";
type PortfolioType =
  | "均衡型"
  | "穩健低波動型"
  | "品質成長型"
  | "價值型"
  | "動能型"
  | "小型股風格"
  | "大型股穩健型"
  | "自訂型";

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
  portfolioType: PortfolioType;
  totalAmount: number;
  stockCount: number;
  minOverallStar: number;
  riskPreference: RiskPreference;
  excludeFatal: boolean;
  limitIndustry: boolean;
  industryCap: number;
  oddLots: boolean;
  factorWeights: Record<FactorKey, number>;
  candidateOnly: boolean;
  allocationMethod: AllocationMethod;
  maxSingleWeight: number;
  minSingleWeight: number;
  reserveCashPercent: number;
};

type Recommendation = Stock & {
  custom_score: number;
  factor_scores: Record<FactorKey, number>;
  rank: number;
  allocation_weight: number;
  target_amount: number;
  purchasable_shares: number;
  actual_amount: number;
  remaining_cash: number;
  recommendation_reasons: string[];
  risk_reasons: string[];
};

type ExcludedCandidate = {
  stock_id: string;
  stock_name: string;
  reason: string;
};

type RecommendationResult = {
  recommendations: Recommendation[];
  poolMode: "完整股票池" | "僅使用候選股票";
  candidateTotal: number;
  eligibleCandidateCount: number;
  excludedCandidates: ExcludedCandidate[];
  validationErrors: string[];
  requestPayload: {
    portfolioType: "custom" | PortfolioType;
    factorWeights: Record<FactorKey, number>;
    candidateOnly: boolean;
    candidateTickers: string[];
    stockCount: number;
    riskPreference: RiskPreference;
  };
};

type AppUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

type PortfolioRun = {
  id: string;
  portfolioType: string;
  conditions: Partial<PortfolioSettings>;
  factorWeights: Record<FactorKey, number>;
  allocationSettings: Partial<PortfolioSettings>;
  candidateOnly: boolean;
  candidateTickers: string[];
  result: RecommendationResult;
  createdAt: string;
};

type HomeCategoryKey = "popular" | "overall" | "momentum" | "stable";
type AccountTab = "profile" | "history" | "candidates";

const factorMeta: Record<FactorKey, { label: string; shortLabel: string; help: string }> = {
  beta: {
    label: "市場敏感因子",
    shortLabel: "Beta",
    help: "衡量股票對整體市場波動的敏感度。分數較高代表股票較容易跟隨市場上漲或下跌；提高此因子權重後，積極偏好會更接受高市場曝險，保守偏好則會降低高 Beta 股票分數。",
  },
  smb: {
    label: "規模因子",
    shortLabel: "SMB",
    help: "衡量大型股與小型股風格。依目前程式邏輯，SMB 分數較高代表較偏小型股；保守偏好會反向計分、較偏好大型股特性。提高此因子權重後，系統會更重視規模風格對排序的影響。",
  },
  rmw: {
    label: "獲利因子",
    shortLabel: "RMW",
    help: "衡量公司的獲利能力、財務穩健度及營運品質。分數較高通常代表公司獲利狀況、資本使用效率或財務結構相對穩健；提高此因子權重後，系統會更重視基本面品質較佳的公司。",
  },
  cma: {
    label: "投資風格因子",
    shortLabel: "CMA",
    help: "衡量公司投資行為偏保守或偏積極擴張。分數較高通常代表投資配置較保守穩健；提高此因子權重後，系統會更偏好投資紀律較明確、擴張節奏較穩的股票。",
  },
  hmlo: {
    label: "價值因子",
    shortLabel: "HML_o",
    help: "衡量股票價格相對公司基本面是否偏低。價值因子分數較高，通常表示股票相對營收、獲利、淨資產或其他基本面指標可能較便宜；提高此因子權重後，系統會更偏好估值相對較低的股票。",
  },
  momentum: {
    label: "動能因子",
    shortLabel: "Momentum",
    help: "衡量股票近期價格趨勢與相對強弱。分數較高通常代表股票近期走勢相對強勢；提高此因子權重後，系統會更偏好近期具有上漲趨勢的股票，但也可能承受趨勢反轉風險。",
  },
  volatility: {
    label: "低波動因子",
    shortLabel: "Volatility",
    help: "衡量股票價格波動程度。建立投資組合時沿用原本反向計分，低波動分數較高通常代表過去價格變動相對穩定；提高此因子權重後，系統會更偏好波動較小、風險相對較低的股票。",
  },
};

const factorKeys: FactorKey[] = ["beta", "smb", "rmw", "cma", "hmlo", "momentum", "volatility"];

const candidateOnlyHelp = {
  title: "僅使用候選股票",
  body:
    "勾選後，系統只會從您已加入候選清單的股票中進行評分與篩選，最終投資組合不會出現候選清單以外的股票。未勾選時，系統會從完整股票池中建立投資組合，候選股票不保證一定入選。若候選股票數量少於投資組合所需的股票數量，系統將要求您增加候選股票、降低持股數量，或取消此選項，不會自動加入候選清單以外的股票。",
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

const presets: Record<Exclude<PortfolioType, "自訂型">, Record<FactorKey, number>> = {
  均衡型: { beta: 10, smb: 10, rmw: 20, cma: 15, hmlo: 15, momentum: 15, volatility: 15 },
  穩健低波動型: { beta: 10, smb: 5, rmw: 20, cma: 20, hmlo: 15, momentum: 5, volatility: 25 },
  品質成長型: { beta: 10, smb: 5, rmw: 30, cma: 15, hmlo: 5, momentum: 25, volatility: 10 },
  價值型: { beta: 10, smb: 10, rmw: 15, cma: 15, hmlo: 35, momentum: 5, volatility: 10 },
  動能型: { beta: 10, smb: 5, rmw: 15, cma: 5, hmlo: 5, momentum: 45, volatility: 15 },
  小型股風格: { beta: 10, smb: 35, rmw: 15, cma: 10, hmlo: 10, momentum: 10, volatility: 10 },
  大型股穩健型: { beta: 15, smb: 5, rmw: 25, cma: 20, hmlo: 15, momentum: 5, volatility: 15 },
};

const portfolioDescriptions: Record<PortfolioType, string> = {
  均衡型:
    "適合希望風險與報酬較平均的投資者。風險程度中等，選股方向分散於品質、投資風格、價值、動能與低波動，RMW 權重最高。",
  穩健低波動型:
    "適合重視本金波動控制與防守性的投資者。風險程度偏低，主要挑選低波動、品質佳且投資行為較保守的股票，較重視低波動、RMW 與 CMA。",
  品質成長型:
    "適合可接受中高波動、希望捕捉基本面品質與趨勢延續的投資者。風險程度中高，主要選股方向為高獲利能力與強動能，較重視 RMW 與 Momentum。",
  價值型:
    "適合偏好價格相對基本面具吸引力、可承受等待修復時間的投資者。風險程度中等，主要選股方向為價值風格清楚且品質不弱的股票，最重視 HML_o。",
  動能型:
    "適合能承受趨勢反轉風險、偏好近期強勢標的的投資者。風險程度偏高，主要選股方向為價格動能明顯的股票，最重視 Momentum。",
  小型股風格:
    "適合願意承擔規模與流動性風險、尋找小型股風格曝險的投資者。風險程度偏高，主要選股方向為 SMB 百分位較高且品質尚可的股票。",
  大型股穩健型:
    "適合偏好成熟大型股、品質與投資紀律的投資者。風險程度偏低至中等，主要選股方向為大型股特性、RMW、CMA 與低波動表現較佳的股票。",
  自訂型:
    "適合希望自行調整選股條件的使用者。您可以自由設定各項因子的權重，系統將依照您的偏好進行股票評分與投資組合篩選。",
};

const initialSettings: PortfolioSettings = {
  portfolioType: "均衡型",
  totalAmount: 1000000,
  stockCount: 5,
  minOverallStar: 3,
  riskPreference: "balanced",
  excludeFatal: true,
  limitIndustry: true,
  industryCap: 45,
  oddLots: true,
  factorWeights: presets["均衡型"],
  candidateOnly: false,
  allocationMethod: "score",
  maxSingleWeight: 30,
  minSingleWeight: 5,
  reserveCashPercent: 3,
};

function loadStoredCandidateIds() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem("smartBetaCandidateIds");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as string[];
    return parsed.filter((id) => stocks.some((stock) => stock.stock_id === id));
  } catch {
    return [];
  }
}

function loadStoredSettings() {
  if (typeof window === "undefined") return initialSettings;
  try {
    const storedCandidateOnly = window.localStorage.getItem("smartBetaCandidateOnly");
    const storedCustomWeights = window.localStorage.getItem("smartBetaCustomWeights");
    const parsedWeights = storedCustomWeights ? (JSON.parse(storedCustomWeights) as Record<FactorKey, number>) : null;
    return {
      ...initialSettings,
      candidateOnly: storedCandidateOnly === "true",
      factorWeights: parsedWeights && !validateFactorWeights(parsedWeights).length ? parsedWeights : initialSettings.factorWeights,
    };
  } catch {
    return initialSettings;
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);

const starText = (count: number) => "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
const weightSum = (weights: Record<FactorKey, number>) =>
  Object.values(weights).reduce((sum, value) => sum + value, 0);
const isValidWeightTotal = (weights: Record<FactorKey, number>) => Math.abs(weightSum(weights) - 100) <= 0.01;

function averageWeights() {
  const base = Math.floor((100 / factorKeys.length) * 100) / 100;
  const weights = Object.fromEntries(factorKeys.map((factor) => [factor, base])) as Record<FactorKey, number>;
  const gap = Number((100 - weightSum(weights)).toFixed(2));
  weights[factorKeys[factorKeys.length - 1]] = Number((weights[factorKeys[factorKeys.length - 1]] + gap).toFixed(2));
  return weights;
}

function validateFactorWeights(weights: Record<FactorKey, number>) {
  const errors: string[] = [];
  for (const factor of factorKeys) {
    const value = weights[factor];
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
      errors.push(`${factorMeta[factor].label} 權重必須是有效數字。`);
    } else if (value < 0 || value > 100) {
      errors.push(`${factorMeta[factor].label} 權重必須介於 0% 至 100%。`);
    }
  }
  if (Object.values(weights).every((value) => value === 0)) {
    errors.push("所有因子權重皆為 0%，請至少設定一個有效權重。");
  }
  if (!isValidWeightTotal(weights)) {
    errors.push(`目前因子權重總和為 ${weightSum(weights)}%，請將權重總和調整為 100%。`);
  }
  return errors;
}

function validateStepOne(settings: PortfolioSettings, candidateCount: number) {
  const errors: string[] = [];
  if (!Number.isFinite(settings.totalAmount) || settings.totalAmount <= 0) errors.push("投資總金額必須大於 0。");
  if (!Number.isInteger(settings.stockCount) || settings.stockCount < 1 || settings.stockCount > 10) {
    errors.push("預計持有股票數量必須是 1 到 10 之間的整數。");
  }
  if (!Number.isInteger(settings.minOverallStar) || settings.minOverallStar < 1 || settings.minOverallStar > 5) {
    errors.push("最低綜合星等必須介於 1 到 5 星。");
  }
  if (!Number.isFinite(settings.industryCap) || settings.industryCap <= 0 || settings.industryCap > 100) {
    errors.push("單一產業配置上限必須介於 1% 到 100%。");
  }
  if (settings.candidateOnly && candidateCount === 0) errors.push("若要僅使用候選股票，請先加入至少一檔候選股票。");
  return errors;
}

function validateStepThree(settings: PortfolioSettings) {
  const errors: string[] = [];
  if (!Number.isFinite(settings.maxSingleWeight) || settings.maxSingleWeight <= 0 || settings.maxSingleWeight > 100) {
    errors.push("單一股票最大配置比例必須介於 1% 到 100%。");
  }
  if (!Number.isFinite(settings.minSingleWeight) || settings.minSingleWeight < 0 || settings.minSingleWeight > 100) {
    errors.push("最低配置比例必須介於 0% 到 100%。");
  }
  if (settings.minSingleWeight > settings.maxSingleWeight) errors.push("最低配置比例不可高於單一股票最大配置比例。");
  if (!Number.isFinite(settings.reserveCashPercent) || settings.reserveCashPercent < 0 || settings.reserveCashPercent >= 100) {
    errors.push("保留現金比例必須介於 0% 到 99%。");
  }
  return errors;
}

function weightGuidance(weights: Record<FactorKey, number>) {
  const total = Number(weightSum(weights).toFixed(2));
  const activeCount = Math.max(1, Object.values(weights).filter((value) => value > 0).length);
  if (Math.abs(total - 100) <= 0.01) return "權重設定完成，可以進入下一步。";
  if (total < 100) {
    const gap = Number((100 - total).toFixed(2));
    return `目前還差 ${gap}%。若平均分配到 ${activeCount} 個正在使用的因子，每個因子可以增加約 ${Number((gap / activeCount).toFixed(2))}%。`;
  }
  const gap = Number((total - 100).toFixed(2));
  return `目前超出 ${gap}%。若平均調整 ${activeCount} 個非零因子，每個因子可以減少約 ${Number((gap / activeCount).toFixed(2))}%。`;
}

function factorScoresFor(stock: Stock, settings: PortfolioSettings) {
  return Object.fromEntries(
    factorKeys.map((factor) => [factor, adjustedPercentile(stock, factor, settings.riskPreference)]),
  ) as Record<FactorKey, number>;
}

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
  const weighted = factorKeys.reduce((sum, factor) => {
    return sum + adjustedPercentile(stock, factor, settings.riskPreference) * (settings.factorWeights[factor] / total);
  }, 0);
  return Math.max(0, Math.min(100, stock.fatal_flag && !settings.excludeFatal ? weighted - 12 : weighted));
}

function reasonsFor(stock: Stock) {
  const reasons = [];
  if (stock.rmw_percentile >= 75) reasons.push(`獲利因子百分位 ${stock.rmw_percentile}，品質因子相對突出`);
  if (stock.momentum_percentile >= 75) reasons.push(`動能因子百分位 ${stock.momentum_percentile}，近期動能明顯`);
  if (stock.hmlo_percentile >= 75) reasons.push(`價值因子百分位 ${stock.hmlo_percentile}，價值風格清楚`);
  if (stock.volatility_percentile <= 35) reasons.push(`低波動因子百分位 ${stock.volatility_percentile}，歷史波動相對低`);
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

function exclusionReason(stock: Stock, settings: PortfolioSettings) {
  if (stock.data_quality_flag !== "通過") return "資料品質標記為注意，無法納入本次因子評分。";
  if (stock.overall_star < settings.minOverallStar) return `綜合星等低於 ${settings.minOverallStar} 星門檻。`;
  if (settings.excludeFatal && stock.fatal_flag) return "已勾選排除致命組合，該股票觸發致命組合。";
  if (settings.riskPreference === "conservative" && stock.risk_level === "高") return "保守風險偏好會排除高風險股票。";
  return "";
}

function buildRecommendations(settings: PortfolioSettings, candidateIds: string[]): RecommendationResult {
  const available = settings.totalAmount * (1 - settings.reserveCashPercent / 100);
  const candidateSet = new Set(candidateIds);
  const sourcePool = settings.candidateOnly ? stocks.filter((stock) => candidateSet.has(stock.stock_id)) : stocks;
  const excludedCandidates = settings.candidateOnly
    ? candidateIds
        .map((id) => stocks.find((stock) => stock.stock_id === id))
        .filter((stock): stock is Stock => Boolean(stock))
        .map((stock) => ({
          stock_id: stock.stock_id,
          stock_name: stock.stock_name,
          reason: exclusionReason(stock, settings),
        }))
        .filter((item) => item.reason)
    : [];
  const validationErrors = validateFactorWeights(settings.factorWeights);
  if (settings.candidateOnly && candidateIds.length === 0) {
    validationErrors.push("請先加入至少一檔候選股票。");
  }

  const filtered = sourcePool
    .filter((stock) => stock.data_quality_flag === "通過")
    .filter((stock) => stock.overall_star >= settings.minOverallStar)
    .filter((stock) => (settings.excludeFatal ? !stock.fatal_flag : true))
    .filter((stock) => (settings.riskPreference === "conservative" ? stock.risk_level !== "高" : true))
    .map((stock) => ({ stock, score: calculateScore(stock, settings) }))
    .sort((a, b) => b.score - a.score);

  if (settings.candidateOnly && filtered.length < settings.stockCount) {
    validationErrors.push(
      `目前只有 ${filtered.length} 檔候選股票可用，但本投資組合需要 ${settings.stockCount} 檔股票。請增加候選股票、降低持股數量，或取消勾選「僅使用候選股票」。`,
    );
  }

  const selected: typeof filtered = [];
  const industryBudget = new Map<string, number>();
  if (!validationErrors.length || !settings.candidateOnly) {
    for (const item of filtered) {
      if (selected.length >= settings.stockCount) break;
      const currentIndustryCount = industryBudget.get(item.stock.industry) || 0;
      const projectedIndustryShare = ((currentIndustryCount + 1) / settings.stockCount) * 100;
      if (settings.limitIndustry && projectedIndustryShare > settings.industryCap) continue;
      industryBudget.set(item.stock.industry, currentIndustryCount + 1);
      selected.push(item);
    }
  }

  const scoreTotal = selected.reduce((sum, item) => sum + item.score, 0) || 1;
  let remainingCash = settings.totalAmount;

  const recommendations = selected.map((item, index) => {
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
      factor_scores: factorScoresFor(item.stock, settings),
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

  return {
    recommendations,
    poolMode: settings.candidateOnly ? "僅使用候選股票" : "完整股票池",
    candidateTotal: candidateIds.length,
    eligibleCandidateCount: settings.candidateOnly ? filtered.length : 0,
    excludedCandidates,
    validationErrors,
    requestPayload: {
      portfolioType: settings.portfolioType === "自訂型" ? "custom" : settings.portfolioType,
      factorWeights: Object.fromEntries(
        factorKeys.map((factor) => [factor, Number((settings.factorWeights[factor] / 100).toFixed(4))]),
      ) as Record<FactorKey, number>,
      candidateOnly: settings.candidateOnly,
      candidateTickers: candidateIds,
      stockCount: settings.stockCount,
      riskPreference: settings.riskPreference,
    },
  };
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
  isCandidate,
}: {
  stock: Stock;
  onDetail: () => void;
  onCandidate: () => void;
  isCandidate: boolean;
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
          {isCandidate ? "移除候選" : "加入候選"}
        </button>
      </div>
    </article>
  );
}

function InfoButton({
  id,
  title,
  body,
  activeInfoId,
  setActiveInfoId,
  ariaLabel,
}: {
  id: string;
  title: string;
  body: string;
  activeInfoId: string | null;
  setActiveInfoId: (id: string | null) => void;
  ariaLabel: string;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = activeInfoId === id;
  const popoverId = `${id}-popover`;
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popover = document.getElementById(popoverId);
    const popoverHeight = popover?.getBoundingClientRect().height ?? 150;
    const width = Math.min(340, window.innerWidth - 24);
    const aboveTop = rect.top - popoverHeight - 8;
    const belowTop = rect.bottom + 8;
    setPosition({
      top: aboveTop >= 12 ? aboveTop : belowTop,
      left: Math.min(Math.max(12, rect.left - width + rect.width), window.innerWidth - width - 12),
    });
  }, [isOpen, popoverId]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={isOpen ? "info-dot active" : "info-dot"}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        aria-describedby={isOpen ? popoverId : undefined}
        data-info-button="true"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveInfoId(isOpen ? null : id);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          setActiveInfoId(isOpen ? null : id);
        }}
      >
        <span aria-hidden="true">i</span>
      </button>
      {isOpen &&
        createPortal(
          <div
            id={popoverId}
            className="info-popover"
            role="dialog"
            aria-label={title}
            data-info-popover="true"
            style={{ top: position.top, left: position.left }}
          >
            <button
              type="button"
              className="popover-close"
              aria-label={`關閉${title}說明`}
              onClick={() => setActiveInfoId(null)}
            >
              ×
            </button>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>,
          document.body,
        )}
    </>
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
        <strong title={factorMeta[factor].help}>{factorMeta[factor].label}</strong>
        <span className="stars">{starText(star)}</span>
      </div>
      <div className="meter" aria-label={`${factorMeta[factor].label} 百分位 ${percentile}`}>
        <span style={{ width: `${percentile}%` }} />
      </div>
      <div className="grid two">
        <span>原始值：{exposure.toFixed(2)}</span>
        <span>百分位：{percentile}</span>
      </div>
      <span className="tag">{direction}</span>
      <p className="subtle">{factorMeta[factor].help}</p>
    </article>
  );
}

const riskPreferenceLabel: Record<RiskPreference, string> = {
  conservative: "保守",
  balanced: "均衡",
  aggressive: "積極",
};

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
  const [preset, setPreset] = useState<PortfolioType>("均衡型");
  const [applyPreset, setApplyPreset] = useState<Exclude<PortfolioType, "自訂型">>("均衡型");
  const [settings, setSettings] = useState<PortfolioSettings>(initialSettings);
  const [storageReady, setStorageReady] = useState(false);
  const [activeInfoId, setActiveInfoId] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [homeCategory, setHomeCategory] = useState<HomeCategoryKey>("popular");
  const [homePage, setHomePage] = useState(1);
  const [homePageSize, setHomePageSize] = useState(8);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardNotice, setWizardNotice] = useState("");
  const [createdResult, setCreatedResult] = useState<RecommendationResult | null>(null);
  const [resultStale, setResultStale] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>("profile");
  const [historyItems, setHistoryItems] = useState<PortfolioRun[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const selectedStock = stocks.find((stock) => stock.stock_id === selectedId) || stocks[0];
  const industries = ["全部", ...Array.from(new Set(stocks.map((stock) => stock.industry)))];
  const portfolioResult = useMemo(() => buildRecommendations(settings, candidateIds), [settings, candidateIds]);
  const activeResult = createdResult;
  const recommendations = activeResult?.recommendations ?? [];
  const candidateStocks = useMemo(() => stocks.filter((stock) => candidateIds.includes(stock.stock_id)), [candidateIds]);
  const weightErrors = validateFactorWeights(settings.factorWeights);
  const stepErrors = {
    1: validateStepOne(settings, candidateIds.length),
    2: validateFactorWeights(settings.factorWeights),
    3: validateStepThree(settings),
    4: portfolioResult.validationErrors,
  } as Record<number, string[]>;
  const canGenerate = Object.values(stepErrors).every((errors) => errors.length === 0);
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
  const homeCategories: Record<HomeCategoryKey, { label: string; help: string; items: Stock[] }> = useMemo(
    () => ({
      popular: {
        label: "熱門關注",
        help: "市場討論度與關注度較高的股票，適合作為認識市場的起點。",
        items: [...stocks].sort((a, b) => b.popularity - a.popularity),
      },
      overall: {
        label: "整體表現較佳",
        help: "綜合星等較高的股票，代表目前樣本中多個條件相對均衡。",
        items: [...stocks].sort((a, b) => b.overall_star - a.overall_star),
      },
      momentum: {
        label: "近期走勢強勢",
        help: "近期價格走勢相對強的股票，但近期上漲不保證未來持續上漲。",
        items: [...stocks].sort((a, b) => b.momentum_percentile - a.momentum_percentile),
      },
      stable: {
        label: "價格相對穩定",
        help: "過去價格波動較小的股票，通常較適合偏穩健的觀察方向。",
        items: [...stocks].sort((a, b) => a.volatility_percentile - b.volatility_percentile),
      },
    }),
    [],
  );
  const activeHome = homeCategories[homeCategory];
  const homeTotalPages = Math.max(1, Math.ceil(activeHome.items.length / homePageSize));
  const homeItems = activeHome.items.slice((homePage - 1) * homePageSize, homePage * homePageSize);
  const resultTotalAmount = activeResult?.recommendations.reduce((sum, item) => sum + item.actual_amount + item.remaining_cash, 0) ?? settings.totalAmount;
  const resultInvested = recommendations.reduce((sum, item) => sum + item.actual_amount, 0);
  const resultScoredCount = activeResult
    ? activeResult.poolMode === "僅使用候選股票"
      ? activeResult.eligibleCandidateCount
      : stocks.filter((stock) => !exclusionReason(stock, settings)).length
    : 0;

  useEffect(() => {
    queueMicrotask(() => {
      const storedIds = loadStoredCandidateIds();
      setCandidateIds(storedIds);
      setSettings(loadStoredSettings());
      setStorageReady(true);
      fetch("/api/auth/me")
        .then((response) => response.json())
        .then(async (data: { user: AppUser | null }) => {
          setUser(data.user);
          if (data.user) await mergeServerCandidates(storedIds);
        })
        .catch(() => setUser(null));
    });
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("smartBetaCandidateIds", JSON.stringify(candidateIds));
  }, [candidateIds, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("smartBetaCandidateOnly", String(settings.candidateOnly));
    if (settings.portfolioType === "自訂型") {
      window.localStorage.setItem("smartBetaCustomWeights", JSON.stringify(settings.factorWeights));
    }
  }, [settings.candidateOnly, settings.factorWeights, settings.portfolioType, storageReady]);

  useEffect(() => {
    if (!activeInfoId) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-info-button='true'], [data-info-popover='true']")) return;
      setActiveInfoId(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveInfoId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeInfoId]);

  useEffect(() => {
    if (!user || accountTab !== "history") return;
    void fetch(`/api/portfolio-runs?page=${historyPage}&pageSize=6`)
      .then((response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ items: PortfolioRun[]; totalPages: number }>;
      })
      .then((data) => {
        if (!data) return;
        setHistoryItems(data.items);
        setHistoryTotalPages(data.totalPages);
      });
  }, [user, accountTab, historyPage]);

  async function mergeServerCandidates(localIds: string[]) {
    try {
      await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: localIds }),
      });
      const response = await fetch("/api/candidates");
      if (!response.ok) return;
      const data = (await response.json()) as { candidates: { ticker: string }[] };
      setCandidateIds(data.candidates.map((item) => item.ticker));
    } catch {
      // 訪客或本地預覽沒有 D1 時，保留瀏覽器候選清單。
    }
  }

  const toggleCandidate = (id: string) => {
    setCandidateIds((current) => {
      const exists = current.includes(id);
      const next = exists ? current.filter((item) => item !== id) : [...current, id];
      void syncCandidateChange(id, !exists);
      return next;
    });
    if (createdResult) setResultStale(true);
  };

  const updateSetting = <K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    if (createdResult) setResultStale(true);
  };

  const updateWeight = (factor: FactorKey, value: number) => {
    const bounded = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    setSettings((current) => ({
      ...current,
      factorWeights: { ...current.factorWeights, [factor]: bounded },
    }));
    if (createdResult) setResultStale(true);
  };

  const syncCandidateChange = async (id: string, shouldAdd: boolean) => {
    if (!user) return;
    try {
      if (shouldAdd) {
        await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tickers: [id] }),
        });
      } else {
        await fetch(`/api/candidates?ticker=${encodeURIComponent(id)}`, { method: "DELETE" });
      }
    } catch {
      setAuthMessage("候選清單已先保存在此裝置，稍後登入後會再同步。");
    }
  };

  const clearCandidates = async () => {
    if (!window.confirm("確定要清空所有候選股票嗎？")) return;
    setCandidateIds([]);
    if (createdResult) setResultStale(true);
    if (user) await fetch("/api/candidates", { method: "DELETE" });
  };

  const signIn = async () => {
    setAuthMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await response.json();
    if (!response.ok) {
      setAuthMessage(data.error ?? "登入失敗。");
      return;
    }
    setUser(data.user);
    await mergeServerCandidates(candidateIds);
    navigate("account");
  };

  const register = async () => {
    setAuthMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm),
    });
    const data = await response.json();
    if (!response.ok) {
      setAuthMessage(data.error ?? "註冊失敗。");
      return;
    }
    setUser(data.user);
    await mergeServerCandidates(candidateIds);
    navigate("account");
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setHistoryItems([]);
    navigate("home");
  };

  async function loadHistory(page = 1) {
    if (!user) return;
    const response = await fetch(`/api/portfolio-runs?page=${page}&pageSize=6`);
    if (!response.ok) return;
    const data = (await response.json()) as { items: PortfolioRun[]; totalPages: number };
    setHistoryItems(data.items);
    setHistoryTotalPages(data.totalPages);
  }

  const saveHistory = async (result: RecommendationResult) => {
    if (!user) return;
    await fetch("/api/portfolio-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioType: settings.portfolioType,
        conditions: {
          totalAmount: settings.totalAmount,
          stockCount: settings.stockCount,
          minOverallStar: settings.minOverallStar,
          riskPreference: settings.riskPreference,
          excludeFatal: settings.excludeFatal,
          limitIndustry: settings.limitIndustry,
          industryCap: settings.industryCap,
        },
        factorWeights: settings.factorWeights,
        allocationSettings: {
          allocationMethod: settings.allocationMethod,
          maxSingleWeight: settings.maxSingleWeight,
          minSingleWeight: settings.minSingleWeight,
          reserveCashPercent: settings.reserveCashPercent,
          oddLots: settings.oddLots,
        },
        candidateOnly: settings.candidateOnly,
        candidateTickers: candidateIds,
        result,
      }),
    });
  };

  const createPortfolio = async () => {
    if (!canGenerate || isCreating) return;
    setIsCreating(true);
    try {
      const result = buildRecommendations(settings, candidateIds);
      setCreatedResult(result);
      setResultStale(false);
      setCompletedSteps([1, 2, 3, 4]);
      await saveHistory(result);
      navigate("results");
    } finally {
      setIsCreating(false);
    }
  };

  const applyRunSettings = (run: PortfolioRun) => {
    setSettings((current) => ({
      ...current,
      ...run.conditions,
      ...run.allocationSettings,
      portfolioType: run.portfolioType as PortfolioType,
      factorWeights: run.factorWeights,
      candidateOnly: run.candidateOnly,
    }));
    setCandidateIds(run.candidateTickers);
    setCreatedResult(null);
    setResultStale(false);
    setStep(1);
    setCompletedSteps([]);
    setWizardNotice("已套用歷史條件。請重新確認並建立投資組合。");
    navigate("builder");
  };

  const deleteRun = async (id: string) => {
    if (!window.confirm("確定要刪除這筆投資組合紀錄嗎？")) return;
    await fetch(`/api/portfolio-runs/${id}`, { method: "DELETE" });
    await loadHistory(historyPage);
  };

  const firstInvalidStep = () => {
    for (const item of [1, 2, 3, 4]) {
      if (stepErrors[item].length) return item;
    }
    return 0;
  };

  const goToStep = (nextStep: number) => {
    if (nextStep <= step || completedSteps.includes(nextStep - 1)) {
      setStep(nextStep);
      setWizardNotice("");
      return;
    }
    const blockedStep = firstInvalidStep();
    if (blockedStep && blockedStep < nextStep) {
      setStep(blockedStep);
      setWizardNotice(`請先完成第 ${blockedStep} 步：${stepErrors[blockedStep][0]}`);
      return;
    }
    setStep(nextStep);
  };

  const nextStep = () => {
    const errors = stepErrors[step];
    if (errors.length) {
      setWizardNotice(errors[0]);
      return;
    }
    setCompletedSteps((current) => Array.from(new Set([...current, step])));
    setWizardNotice("");
    setStep((current) => Math.min(4, current + 1));
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
        <div className="top-actions">
          <button className="button secondary compact-button" type="button" onClick={() => setDrawerOpen(true)}>
            候選清單（{candidateIds.length}）
          </button>
          {user ? (
            <>
              <button className={view === "account" ? "button compact-button" : "button secondary compact-button"} type="button" onClick={() => navigate("account")}>
                我的帳戶
              </button>
              <button className="button ghost compact-button" type="button" onClick={signOut}>
                登出
              </button>
            </>
          ) : (
            <>
              <button className={view === "login" ? "button compact-button" : "button secondary compact-button"} type="button" onClick={() => navigate("login")}>
                登入
              </button>
              <button className={view === "register" ? "button compact-button" : "button ghost compact-button"} type="button" onClick={() => navigate("register")}>
                註冊
              </button>
            </>
          )}
        </div>
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
      {drawerOpen && (
        <div className="drawer-layer" role="presentation" onPointerDown={() => setDrawerOpen(false)}>
          <aside className="candidate-drawer" role="dialog" aria-label="候選股票清單" onPointerDown={(event) => event.stopPropagation()}>
            <div className="section-head compact-head">
              <div>
                <h2>候選清單</h2>
                <p>目前候選股票：{candidateIds.length} 檔</p>
              </div>
              <button className="icon-btn" type="button" aria-label="關閉候選清單" onClick={() => setDrawerOpen(false)}>
                ×
              </button>
            </div>
            {candidateStocks.length ? (
              <div className="drawer-list">
                {candidateStocks.map((stock) => (
                  <div className="drawer-item" key={stock.stock_id}>
                    <div>
                      <strong>{stock.stock_name}</strong>
                      <p className="subtle">
                        {stock.stock_id} · {stock.industry} · {starText(stock.overall_star)}
                      </p>
                    </div>
                    <button className="button ghost compact-button" type="button" onClick={() => toggleCandidate(stock.stock_id)}>
                      移除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>尚未加入候選股票</strong>
                <p className="subtle">可以先到股票探索頁把想觀察的標的加入清單。</p>
              </div>
            )}
            <div className="drawer-actions">
              <button
                className="button"
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("builder");
                }}
              >
                前往建立投資組合
              </button>
              <button className="button secondary" type="button" onClick={() => navigate("explore")}>
                前往選股頁面
              </button>
              <button className="button ghost" type="button" disabled={!candidateIds.length} onClick={clearCandidates}>
                清空候選
              </button>
            </div>
          </aside>
        </div>
      )}

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
            <section>
              <div className="section-head">
                <div>
                  <h2>{activeHome.label}</h2>
                  <p>{activeHome.help}</p>
                </div>
                <div className="home-tools">
                  <div className="segmented" role="tablist" aria-label="首頁股票分類">
                    {(Object.keys(homeCategories) as HomeCategoryKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={homeCategory === key}
                        className={homeCategory === key ? "active" : ""}
                        onClick={() => {
                          setHomeCategory(key);
                          setHomePage(1);
                        }}
                      >
                        {homeCategories[key].label}
                      </button>
                    ))}
                  </div>
                  <select
                    className="select page-size"
                    aria-label="每頁顯示股票數"
                    value={homePageSize}
                    onChange={(event) => {
                      setHomePageSize(Number(event.target.value));
                      setHomePage(1);
                    }}
                  >
                    {[4, 8, 12].map((size) => (
                      <option key={size} value={size}>
                        每頁 {size} 檔
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid four">
                {homeItems.map((stock) => (
                  <StockCard
                    key={`${homeCategory}-${stock.stock_id}`}
                    stock={stock}
                    isCandidate={candidateIds.includes(stock.stock_id)}
                    onCandidate={() => toggleCandidate(stock.stock_id)}
                    onDetail={() => {
                      setSelectedId(stock.stock_id);
                      navigate("detail");
                    }}
                  />
                ))}
              </div>
              <div className="pagination-row">
                <button className="button secondary" type="button" disabled={homePage === 1} onClick={() => setHomePage((current) => Math.max(1, current - 1))}>
                  上一頁
                </button>
                <span className="subtle">
                  第 {homePage} / {homeTotalPages} 頁
                </span>
                <button
                  className="button secondary"
                  type="button"
                  disabled={homePage === homeTotalPages}
                  onClick={() => setHomePage((current) => Math.min(homeTotalPages, current + 1))}
                >
                  下一頁
                </button>
              </div>
            </section>
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
                    <th>獲利因子</th>
                    <th>動能因子</th>
                    <th>低波動因子</th>
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
                          <button className="button ghost" onClick={() => toggleCandidate(stock.stock_id)}>
                            {candidateIds.includes(stock.stock_id) ? "移除候選" : "候選"}
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
                    <strong>致命組合規則</strong>
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
                  <button className="button" onClick={() => toggleCandidate(selectedStock.stock_id)}>
                    {candidateIds.includes(selectedStock.stock_id) ? "移除候選清單" : "加入候選清單"}
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
            <span className={isValidWeightTotal(settings.factorWeights) ? "tag" : "tag warn"}>
              因子權重總和 {weightSum(settings.factorWeights)}%
            </span>
          </div>
          <div className="stepper">
            {["投資條件", "因子偏好", "資金配置", "確認設定"].map((label, index) => (
              <button
                key={label}
                className={[
                  "step-tab",
                  step === index + 1 ? "active" : "",
                  completedSteps.includes(index + 1) ? "done" : "",
                  stepErrors[index + 1].length ? "has-error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                onClick={() => goToStep(index + 1)}
                aria-current={step === index + 1 ? "step" : undefined}
              >
                {index + 1}. {label}
                <small>{completedSteps.includes(index + 1) ? "已完成" : stepErrors[index + 1].length ? "需確認" : "可填寫"}</small>
              </button>
            ))}
          </div>
          <section className="step-panel">
            {wizardNotice && <p className="warning-box">{wizardNotice}</p>}
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
                <div className="candidate-option">
                  <div className="candidate-control">
                    <label className="row" htmlFor="candidate-only">
                      <input
                        id="candidate-only"
                        type="checkbox"
                        checked={settings.candidateOnly}
                        aria-describedby="candidate-only-help"
                        onChange={(event) => updateSetting("candidateOnly", event.target.checked)}
                      />
                      <strong>僅使用候選股票</strong>
                    </label>
                    <InfoButton
                      id="candidate-only-info"
                      title={candidateOnlyHelp.title}
                      body={candidateOnlyHelp.body}
                      activeInfoId={activeInfoId}
                      setActiveInfoId={setActiveInfoId}
                      ariaLabel="查看僅使用候選股票說明"
                    />
                  </div>
                  <p id="candidate-only-help" className="subtle">
                    目前候選股票：{candidateIds.length} 檔。勾選後，最終結果只會包含候選清單中的股票。
                  </p>
                  {candidateStocks.length > 0 && (
                    <div className="factor-weight-list" aria-label="目前候選股票清單">
                      {candidateStocks.map((stock) => (
                        <span key={stock.stock_id}>
                          {stock.stock_id} {stock.stock_name}
                        </span>
                      ))}
                    </div>
                  )}
                  {settings.candidateOnly && (
                  <p className={candidateIds.length ? "notice compact" : "warning-box"}>
                      {candidateIds.length
                        ? "候選股票限定模式已開啟，最終結果只會包含候選清單中的股票。"
                        : "請先加入至少一檔候選股票。"}
                    </p>
                  )}
                  <button className="button secondary" type="button" onClick={() => navigate("explore")}>
                    前往選股頁面
                  </button>
                </div>
                {stepErrors[1].map((error) => (
                  <p className="warning-box" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="grid">
                <div className="preset-grid">
                  {(Object.keys(portfolioDescriptions) as PortfolioType[]).map((name) => (
                    <button
                      key={name}
                      className={preset === name ? "preset active" : "preset"}
                      onClick={() => {
                        setPreset(name);
                        updateSetting("portfolioType", name);
                        if (name !== "自訂型") {
                          updateSetting("factorWeights", presets[name]);
                        }
                      }}
                      aria-pressed={preset === name}
                    >
                      <strong>{name}</strong>
                      <p className="subtle">{portfolioDescriptions[name]}</p>
                    </button>
                  ))}
                </div>
                {settings.portfolioType === "自訂型" && (
                  <div className="weight-actions">
                    <button className="button secondary" type="button" onClick={() => updateSetting("factorWeights", averageWeights())}>
                      平均分配
                    </button>
                    <button className="button secondary" type="button" onClick={() => updateSetting("factorWeights", initialSettings.factorWeights)}>
                      重設權重
                    </button>
                    <select
                      className="select"
                      aria-label="選擇要套用的既有投資組合類型權重"
                      value={applyPreset}
                      onChange={(event) => setApplyPreset(event.target.value as Exclude<PortfolioType, "自訂型">)}
                    >
                      {(Object.keys(presets) as Exclude<PortfolioType, "自訂型">[]).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button className="button secondary" type="button" onClick={() => updateSetting("factorWeights", presets[applyPreset])}>
                      套用目前類型權重
                    </button>
                  </div>
                )}
                <p className={isValidWeightTotal(settings.factorWeights) ? "notice compact" : "warning-box"}>
                  目前權重總和：{weightSum(settings.factorWeights)}%
                  {!isValidWeightTotal(settings.factorWeights) && "。請將權重總和調整為 100%。"}
                </p>
                <p className="notice compact">{weightGuidance(settings.factorWeights)}</p>
                {factorKeys.map((factor) => (
                  <div className="slider-row" key={factor}>
                    <span className="factor-name">
                      {factorMeta[factor].label}
                      <InfoButton
                        id={`factor-${factor}-info`}
                        title={factorMeta[factor].label}
                        body={factorMeta[factor].help}
                        activeInfoId={activeInfoId}
                        setActiveInfoId={setActiveInfoId}
                        ariaLabel={`查看${factorMeta[factor].label}說明`}
                      />
                      <small>{factorMeta[factor].shortLabel}</small>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.factorWeights[factor]}
                      aria-label={`${factorMeta[factor].label}權重滑桿`}
                      onChange={(event) => updateWeight(factor, Number(event.target.value))}
                    />
                    <input
                      className="field"
                      type="number"
                      min={0}
                      max={100}
                      value={settings.factorWeights[factor]}
                      aria-label={`${factorMeta[factor].label}權重數值`}
                      onChange={(event) => updateWeight(factor, Number(event.target.value))}
                    />
                  </div>
                ))}
                {weightErrors.map((error) => (
                  <p className="warning-box" key={error}>
                    {error}
                  </p>
                ))}
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
                {stepErrors[3].map((error) => (
                  <p className="warning-box" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            )}
            {step === 4 && (
              <div className="grid two">
                <div className="card">
                  <h2 className="panel-title">設定摘要</h2>
                  <p>投資金額：{formatCurrency(settings.totalAmount)}</p>
                  <p>投資組合類型：{settings.portfolioType}</p>
                  <p>股票數量：{settings.stockCount}</p>
                  <p>風險偏好：{riskPreferenceLabel[settings.riskPreference]}</p>
                  <p>配置方式：{settings.allocationMethod === "equal" ? "等額配置" : "依評分配置"}</p>
                  <p>排除致命組合：{settings.excludeFatal ? "是" : "否"}</p>
                  <p>股票池模式：{settings.candidateOnly ? `僅使用候選股票（${candidateIds.length} 檔）` : "完整股票池"}</p>
                </div>
                <div className="card">
                  <h2 className="panel-title">可產生結果</h2>
                  <p className="subtle">
                    符合條件股票不足時，系統會保留條件並提示原因，不會自行忽略條件。
                  </p>
                  {portfolioResult.validationErrors.map((error) => (
                    <p className="warning-box" key={error}>
                      {error}
                    </p>
                  ))}
                  {!user && <p className="notice compact">目前以訪客模式建立。登入後建立的投資組合會自動保存至歷史紀錄。</p>}
                  <button className="button" disabled={!canGenerate || isCreating} onClick={createPortfolio}>
                    {isCreating ? "建立中..." : "確認並建立投資組合"}
                  </button>
                </div>
              </div>
            )}
            <div className="row" style={{ marginTop: 18, justifyContent: "space-between" }}>
              <button className="button secondary" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
                上一步
              </button>
              <button className="button" disabled={step === 4} onClick={nextStep}>
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
          {!activeResult ? (
            <section className="card empty-state">
              <h2 className="panel-title">尚未建立投資組合</h2>
              <p className="subtle">請先到建立投資組合頁完成四個步驟，並按下「確認並建立投資組合」。</p>
              <button className="button" type="button" onClick={() => navigate("builder")}>
                前往建立
              </button>
            </section>
          ) : (
            <>
              {resultStale && <p className="warning-box">你已修改設定或候選清單。此頁仍顯示上一次確認建立的結果，若要更新請回到建立頁重新建立。</p>}
              {activeResult.validationErrors.map((error) => (
                <p className="warning-box" key={error}>
                  {error}
                </p>
              ))}
              {!activeResult.validationErrors.length && recommendations.length < settings.stockCount && (
                <p className="warning-box">
                  符合條件股票不足：目前僅 {recommendations.length} 支。可能原因包含最低星等、排除致命組合、保守風險偏好或產業上限過嚴。
                </p>
              )}
              <section className="summary-strip">
                <div className="kpi">
                  股票池模式<strong>{activeResult.poolMode}</strong>
                </div>
                <div className="kpi">
                  投資總金額<strong>{formatCurrency(resultTotalAmount)}</strong>
                </div>
                <div className="kpi">
                  實際配置<strong>{formatCurrency(resultInvested)}</strong>
                </div>
                <div className="kpi">
                  剩餘現金<strong>{formatCurrency(Math.max(0, resultTotalAmount - resultInvested))}</strong>
                </div>
                <div className="kpi">
                  入選股票<strong>{recommendations.length}</strong>
                </div>
                <div className="kpi">
                  參與評分<strong>{resultScoredCount}</strong>
                </div>
                <div className="kpi">
                  平均星等<strong>{(recommendations.reduce((sum, item) => sum + item.overall_star, 0) / Math.max(1, recommendations.length)).toFixed(1)}</strong>
                </div>
                <div className="kpi">
                  風險等級<strong>{recommendations.some((item) => item.risk_level === "高") ? "高" : "中"}</strong>
                </div>
              </section>
              <section className="grid two result-meta">
                <div className="card">
                  <h2 className="panel-title">本次設定</h2>
                  <p>投資組合類型：{activeResult.requestPayload.portfolioType === "custom" ? "自訂型" : activeResult.requestPayload.portfolioType}</p>
                  <p>股票池：{activeResult.poolMode}</p>
                  <p>是否僅使用候選股票：{activeResult.requestPayload.candidateOnly ? "是" : "否"}</p>
                  {activeResult.poolMode === "僅使用候選股票" && (
                    <>
                      <p>本次候選股票總數：{activeResult.candidateTotal}</p>
                      <p>成功取得資料並參與評分：{activeResult.eligibleCandidateCount}</p>
                      <p>最終入選股票數量：{recommendations.length}</p>
                    </>
                  )}
                  {!user && <p className="notice compact">登入後建立的投資組合會自動保存歷史紀錄。</p>}
                </div>
                <div className="card">
                  <h2 className="panel-title">本次因子權重</h2>
                  <div className="factor-weight-list">
                    {factorKeys.map((factor) => (
                      <span key={factor}>
                        {factorMeta[factor].label}：{Number((activeResult.requestPayload.factorWeights[factor] * 100).toFixed(2))}%
                      </span>
                    ))}
                  </div>
                </div>
              </section>
              {activeResult.poolMode === "僅使用候選股票" && activeResult.excludedCandidates.length > 0 && (
                <section className="card result-meta">
                  <h2 className="panel-title">候選股票排除原因</h2>
                  <div className="grid">
                    {activeResult.excludedCandidates.map((item) => (
                      <p className="warning-box" key={item.stock_id}>
                        {item.stock_id} {item.stock_name}：{item.reason}
                      </p>
                    ))}
                  </div>
                </section>
              )}
              <section style={{ marginTop: 22 }} className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>股票</th>
                      <th>綜合分數</th>
                      <th>星等</th>
                      <th>各因子分數</th>
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
                        <td>
                          <div className="factor-score-list">
                            {factorKeys.map((factor) => (
                              <span key={factor}>
                                {factorMeta[factor].label} {item.factor_scores[factor]}
                              </span>
                            ))}
                          </div>
                        </td>
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
            </>
          )}
        </main>
      )}

      {view === "login" && (
        <main className="main auth-layout">
          <section className="card auth-card">
            <h2 className="panel-title">登入帳號</h2>
            <p className="subtle">登入後可同步候選股票並保存每次建立的投資組合紀錄。</p>
            <label className="label">
              電子信箱
              <input
                className="field"
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="label">
              密碼
              <input
                className="field"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {authMessage && <p className="warning-box">{authMessage}</p>}
            <button className="button" type="button" onClick={signIn}>
              登入
            </button>
            <button className="button ghost" type="button" onClick={() => navigate("register")}>
              還沒有帳號，前往註冊
            </button>
          </section>
        </main>
      )}

      {view === "register" && (
        <main className="main auth-layout">
          <section className="card auth-card">
            <h2 className="panel-title">建立帳號</h2>
            <p className="subtle">註冊後，瀏覽器中的候選清單會合併到你的帳號。</p>
            <label className="label">
              顯示名稱
              <input
                className="field"
                value={registerForm.displayName}
                onChange={(event) => setRegisterForm((current) => ({ ...current, displayName: event.target.value }))}
              />
            </label>
            <label className="label">
              電子信箱
              <input
                className="field"
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="label">
              密碼
              <input
                className="field"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            <label className="label">
              確認密碼
              <input
                className="field"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              />
            </label>
            {authMessage && <p className="warning-box">{authMessage}</p>}
            <button className="button" type="button" onClick={register}>
              註冊並登入
            </button>
            <button className="button ghost" type="button" onClick={() => navigate("login")}>
              已有帳號，前往登入
            </button>
          </section>
        </main>
      )}

      {view === "account" && (
        <main className="main">
          {!user ? (
            <section className="card empty-state">
              <h2 className="panel-title">請先登入</h2>
              <p className="subtle">登入後可以查看個人資料、投資組合歷史紀錄與候選清單。</p>
              <button className="button" type="button" onClick={() => navigate("login")}>
                前往登入
              </button>
            </section>
          ) : (
            <>
              <div className="section-head">
                <div>
                  <h2>我的帳戶</h2>
                  <p>{user.displayName}，這裡保存你的候選股票與投資組合紀錄。</p>
                </div>
                <button className="button secondary" type="button" onClick={signOut}>
                  登出
                </button>
              </div>
              <div className="segmented account-tabs" role="tablist" aria-label="帳戶分頁">
                {[
                  ["profile", "基本資料"],
                  ["history", "投資組合歷史"],
                  ["candidates", "候選清單"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={accountTab === id}
                    className={accountTab === id ? "active" : ""}
                    onClick={() => setAccountTab(id as AccountTab)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {accountTab === "profile" && (
                <section className="grid two account-panel">
                  <div className="card">
                    <h2 className="panel-title">基本資料</h2>
                    <p>顯示名稱：{user.displayName}</p>
                    <p>電子信箱：{user.email}</p>
                    <p>建立時間：{new Date(user.createdAt).toLocaleString("zh-TW")}</p>
                  </div>
                  <div className="card">
                    <h2 className="panel-title">資料保存狀態</h2>
                    <p>候選股票：{candidateIds.length} 檔</p>
                    <p>投資組合歷史：登入後建立的紀錄會保存於資料庫。</p>
                  </div>
                </section>
              )}
              {accountTab === "history" && (
                <section className="account-panel">
                  {historyItems.length ? (
                    <div className="grid two">
                      {historyItems.map((run) => (
                        <article className="card history-card" key={run.id}>
                          <div>
                            <h2 className="panel-title">{run.portfolioType === "custom" ? "自訂型" : run.portfolioType}</h2>
                            <p className="subtle">
                              {new Date(run.createdAt).toLocaleString("zh-TW")} · {run.candidateOnly ? "僅使用候選股票" : "完整股票池"} · 入選{" "}
                              {run.result.recommendations.length} 檔
                            </p>
                          </div>
                          <div className="factor-weight-list">
                            {factorKeys.map((factor) => (
                              <span key={factor}>
                                {factorMeta[factor].label}：{run.factorWeights[factor]}%
                              </span>
                            ))}
                          </div>
                          <div className="row">
                            <button
                              className="button secondary"
                              type="button"
                              onClick={() => {
                                setCreatedResult(run.result);
                                setResultStale(false);
                                navigate("results");
                              }}
                            >
                              查看結果
                            </button>
                            <button className="button secondary" type="button" onClick={() => applyRunSettings(run)}>
                              套用條件
                            </button>
                            <button className="button ghost" type="button" onClick={() => deleteRun(run.id)}>
                              刪除
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="card empty-state">
                      <h2 className="panel-title">尚無歷史紀錄</h2>
                      <p className="subtle">登入狀態下完成建立後，這裡會自動保存投資組合。</p>
                    </div>
                  )}
                  <div className="pagination-row">
                    <button className="button secondary" type="button" disabled={historyPage === 1} onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}>
                      上一頁
                    </button>
                    <span className="subtle">
                      第 {historyPage} / {historyTotalPages} 頁
                    </span>
                    <button
                      className="button secondary"
                      type="button"
                      disabled={historyPage === historyTotalPages}
                      onClick={() => setHistoryPage((current) => Math.min(historyTotalPages, current + 1))}
                    >
                      下一頁
                    </button>
                  </div>
                </section>
              )}
              {accountTab === "candidates" && (
                <section className="account-panel">
                  <div className="section-head">
                    <div>
                      <h2>候選股票</h2>
                      <p>目前候選股票：{candidateIds.length} 檔。登入後會同步保存到帳號。</p>
                    </div>
                    <button className="button ghost" type="button" disabled={!candidateIds.length} onClick={clearCandidates}>
                      清空候選
                    </button>
                  </div>
                  {candidateStocks.length ? (
                    <div className="grid four">
                      {candidateStocks.map((stock) => (
                        <StockCard
                          key={stock.stock_id}
                          stock={stock}
                          isCandidate
                          onCandidate={() => toggleCandidate(stock.stock_id)}
                          onDetail={() => {
                            setSelectedId(stock.stock_id);
                            navigate("detail");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="card empty-state">
                      <h2 className="panel-title">尚未加入候選股票</h2>
                      <p className="subtle">到股票探索頁選擇你想納入觀察的股票。</p>
                      <button className="button" type="button" onClick={() => navigate("explore")}>
                        前往股票探索
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
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
        本網站提供之股票資訊、因子分數、投資組合建議與 AI 說明僅供學術專題展示與投資決策輔助參考，不構成任何投資建議、招攬或報酬保證。投資一定有風險，實際交易前請自行評估並承擔盈虧責任。
      </footer>
    </div>
  );
}
