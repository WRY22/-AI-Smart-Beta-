import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var factorLabels = {
	beta: "Beta",
	smb: "SMB",
	rmw: "RMW",
	cma: "CMA",
	hmlo: "HML_o",
	momentum: "Momentum",
	volatility: "Volatility"
};
var factorHelp = {
	beta: "市場風險曝險，需依風險偏好判斷理想區間。",
	smb: "規模風格曝險，正值偏小型股，負值偏大型股。",
	rmw: "獲利能力因子曝險，較高通常代表品質特徵較明顯。",
	cma: "投資風格因子曝險，正值偏保守投資，負值偏積極擴張。",
	hmlo: "正交化價值因子曝險，協助辨識價值風格。",
	momentum: "歷史動能表現，反映近期相對強弱。",
	volatility: "歷史波動度，穩健偏好下會採反向計分。"
};
var stocks = [
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
		smb_exposure: -.42,
		rmw_exposure: .68,
		cma_exposure: .22,
		hmlo_exposure: .11,
		momentum_value: .18,
		volatility_value: .21,
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
		regression_fit_quality: "佳"
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
		smb_exposure: -.18,
		rmw_exposure: .44,
		cma_exposure: .09,
		hmlo_exposure: .05,
		momentum_value: .12,
		volatility_value: .27,
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
		regression_fit_quality: "佳"
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
		beta_exposure: .48,
		smb_exposure: -.35,
		rmw_exposure: .51,
		cma_exposure: .41,
		hmlo_exposure: .28,
		momentum_value: .04,
		volatility_value: .12,
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
		regression_fit_quality: "佳"
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
		beta_exposure: .86,
		smb_exposure: -.08,
		rmw_exposure: .22,
		cma_exposure: .31,
		hmlo_exposure: .46,
		momentum_value: .07,
		volatility_value: .2,
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
		regression_fit_quality: "中"
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
		smb_exposure: -.12,
		rmw_exposure: .59,
		cma_exposure: .17,
		hmlo_exposure: .2,
		momentum_value: .14,
		volatility_value: .23,
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
		regression_fit_quality: "佳"
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
		smb_exposure: .19,
		rmw_exposure: .08,
		cma_exposure: -.13,
		hmlo_exposure: .39,
		momentum_value: .21,
		volatility_value: .36,
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
		regression_fit_quality: "中"
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
		smb_exposure: .06,
		rmw_exposure: .32,
		cma_exposure: .04,
		hmlo_exposure: .12,
		momentum_value: -.02,
		volatility_value: .33,
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
		regression_fit_quality: "中"
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
		smb_exposure: .23,
		rmw_exposure: -.11,
		cma_exposure: -.21,
		hmlo_exposure: .08,
		momentum_value: .03,
		volatility_value: .39,
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
		regression_fit_quality: "弱"
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
		beta_exposure: .72,
		smb_exposure: .14,
		rmw_exposure: .37,
		cma_exposure: .27,
		hmlo_exposure: .18,
		momentum_value: .08,
		volatility_value: .19,
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
		regression_fit_quality: "中"
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
		smb_exposure: .22,
		rmw_exposure: -.06,
		cma_exposure: -.09,
		hmlo_exposure: -.12,
		momentum_value: .24,
		volatility_value: .44,
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
		regression_fit_quality: "中"
	}
];
var presets = {
	均衡型: {
		beta: 10,
		smb: 10,
		rmw: 20,
		cma: 15,
		hmlo: 15,
		momentum: 15,
		volatility: 15
	},
	穩健低波動型: {
		beta: 10,
		smb: 5,
		rmw: 20,
		cma: 20,
		hmlo: 15,
		momentum: 5,
		volatility: 25
	},
	品質成長型: {
		beta: 10,
		smb: 5,
		rmw: 30,
		cma: 15,
		hmlo: 5,
		momentum: 25,
		volatility: 10
	},
	價值型: {
		beta: 10,
		smb: 10,
		rmw: 15,
		cma: 15,
		hmlo: 35,
		momentum: 5,
		volatility: 10
	},
	動能型: {
		beta: 10,
		smb: 5,
		rmw: 15,
		cma: 5,
		hmlo: 5,
		momentum: 45,
		volatility: 15
	},
	小型股風格: {
		beta: 10,
		smb: 35,
		rmw: 15,
		cma: 10,
		hmlo: 10,
		momentum: 10,
		volatility: 10
	},
	大型股穩健型: {
		beta: 15,
		smb: 5,
		rmw: 25,
		cma: 20,
		hmlo: 15,
		momentum: 5,
		volatility: 15
	}
};
var initialSettings = {
	totalAmount: 1e6,
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
	reserveCashPercent: 3
};
var formatCurrency = (value) => new Intl.NumberFormat("zh-TW", {
	style: "currency",
	currency: "TWD",
	maximumFractionDigits: 0
}).format(value);
var starText = (count) => "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
var weightSum = (weights) => Object.values(weights).reduce((sum, value) => sum + value, 0);
function adjustedPercentile(stock, factor, riskPreference) {
	if (factor === "volatility") return 100 - stock.volatility_percentile;
	if (factor === "beta") {
		if (riskPreference === "conservative") return 100 - stock.beta_percentile;
		if (riskPreference === "aggressive") return stock.beta_percentile;
		return Math.max(0, 100 - Math.abs(stock.beta_percentile - 50) * 2);
	}
	if (factor === "smb" && riskPreference === "conservative") return 100 - stock.smb_percentile;
	return stock[`${factor}_percentile`];
}
function calculateScore(stock, settings) {
	const total = weightSum(settings.factorWeights) || 1;
	const weighted = Object.keys(settings.factorWeights).reduce((sum, factor) => {
		return sum + adjustedPercentile(stock, factor, settings.riskPreference) * (settings.factorWeights[factor] / total);
	}, 0);
	return Math.max(0, Math.min(100, stock.fatal_flag && !settings.excludeFatal ? weighted - 12 : weighted));
}
function reasonsFor(stock) {
	const reasons = [];
	if (stock.rmw_percentile >= 75) reasons.push(`RMW 百分位 ${stock.rmw_percentile}，品質因子相對突出`);
	if (stock.momentum_percentile >= 75) reasons.push(`Momentum 百分位 ${stock.momentum_percentile}，近期動能明顯`);
	if (stock.hmlo_percentile >= 75) reasons.push(`HML_o 百分位 ${stock.hmlo_percentile}，價值風格清楚`);
	if (stock.volatility_percentile <= 35) reasons.push(`Volatility 百分位 ${stock.volatility_percentile}，歷史波動相對低`);
	if (!reasons.length) reasons.push("綜合因子表現符合目前篩選條件");
	return reasons.slice(0, 3);
}
function riskReasonsFor(stock) {
	const risks = [];
	if (stock.fatal_flag) risks.push("觸發 SMB > 0、RMW < 0、CMA < 0 致命組合");
	if (stock.volatility_percentile >= 75) risks.push("歷史波動度位於市場較高區間");
	if (stock.beta_percentile >= 80) risks.push("Beta 曝險偏高，對市場波動較敏感");
	if (stock.regression_fit_quality === "弱") risks.push("迴歸配適品質較弱，解讀需保守");
	if (!risks.length) risks.push("未觸發主要風險規則，仍需留意模型限制");
	return risks;
}
function buildRecommendations(settings) {
	const available = settings.totalAmount * (1 - settings.reserveCashPercent / 100);
	const filtered = stocks.filter((stock) => stock.data_quality_flag === "通過").filter((stock) => stock.overall_star >= settings.minOverallStar).filter((stock) => settings.excludeFatal ? !stock.fatal_flag : true).filter((stock) => settings.riskPreference === "conservative" ? stock.risk_level !== "高" : true).map((stock) => ({
		stock,
		score: calculateScore(stock, settings)
	})).sort((a, b) => b.score - a.score);
	const selected = [];
	const industryBudget = /* @__PURE__ */ new Map();
	for (const item of filtered) {
		if (selected.length >= settings.stockCount) break;
		const currentIndustryCount = industryBudget.get(item.stock.industry) || 0;
		const projectedIndustryShare = (currentIndustryCount + 1) / settings.stockCount * 100;
		if (settings.limitIndustry && projectedIndustryShare > settings.industryCap) continue;
		industryBudget.set(item.stock.industry, currentIndustryCount + 1);
		selected.push(item);
	}
	const scoreTotal = selected.reduce((sum, item) => sum + item.score, 0) || 1;
	let remainingCash = settings.totalAmount;
	return selected.map((item, index) => {
		const baseWeight = settings.allocationMethod === "equal" ? 100 / selected.length : item.score / scoreTotal * 100;
		const allocation_weight = Math.min(settings.maxSingleWeight, Math.max(settings.minSingleWeight, Number(baseWeight.toFixed(2))));
		const target_amount = available * (allocation_weight / 100);
		const lotSize = settings.oddLots ? 1 : 1e3;
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
			risk_reasons: riskReasonsFor(item.stock)
		};
	});
}
function AiStockExplanation({ stock }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "notice",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "AI 一句話摘要" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			stock.stock_name,
			" 的主要特徵是 ",
			reasonsFor(stock).join("；"),
			"。此說明僅根據結構化因子資料生成，不代表未來報酬保證。"
		] })]
	});
}
function StockCard({ stock, onDetail, onCandidate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "card stock-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "row",
				style: { justifyContent: "space-between" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stock.stock_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "subtle",
					children: [
						stock.stock_id,
						" · ",
						stock.industry
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "stars",
					title: `${stock.overall_star} 星`,
					children: starText(stock.overall_star)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tag-row",
				children: [reasonsFor(stock).slice(0, 2).map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tag",
					children: reason.split("，")[0]
				}, reason)), stock.fatal_flag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tag risk",
					children: "致命組合警示"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "subtle",
				children: riskReasonsFor(stock)[0]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button secondary",
					onClick: onDetail,
					children: "查看詳情"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button ghost",
					onClick: onCandidate,
					children: "加入候選"
				})]
			})
		]
	});
}
function FactorCard({ stock, factor }) {
	const percentile = stock[`${factor}_percentile`];
	const exposure = stock[factor === "momentum" ? "momentum_value" : factor === "volatility" ? "volatility_value" : `${factor}_exposure`];
	const star = stock[`${factor}_star`];
	const direction = factor === "volatility" ? "穩健偏好下反向解讀" : factor === "beta" ? "依風險偏好判斷" : factor === "smb" ? stock.smb_exposure > 0 ? "偏小型股" : "偏大型股" : exposure >= 0 ? "正向曝險" : "負向曝險";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "card factor-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "row",
				style: { justifyContent: "space-between" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					title: factorHelp[factor],
					children: factorLabels[factor]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "stars",
					children: starText(star)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "meter",
				"aria-label": `${factorLabels[factor]} 百分位 ${percentile}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percentile}%` } })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid two",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["原始值：", exposure.toFixed(2)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["百分位：", percentile] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tag",
				children: direction
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "subtle",
				children: factorHelp[factor]
			})
		]
	});
}
function Home() {
	const [view, setView] = (0, import_react.useState)("home");
	const [query, setQuery] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("全部");
	const [minStar, setMinStar] = (0, import_react.useState)(1);
	const [risk, setRisk] = (0, import_react.useState)("全部");
	const [excludeFatal, setExcludeFatal] = (0, import_react.useState)(false);
	const [sortBy, setSortBy] = (0, import_react.useState)("overall");
	const [selectedId, setSelectedId] = (0, import_react.useState)(stocks[0].stock_id);
	const [candidateIds, setCandidateIds] = (0, import_react.useState)([]);
	const [step, setStep] = (0, import_react.useState)(1);
	const [preset, setPreset] = (0, import_react.useState)("均衡型");
	const [settings, setSettings] = (0, import_react.useState)(initialSettings);
	const selectedStock = stocks.find((stock) => stock.stock_id === selectedId) || stocks[0];
	const industries = ["全部", ...Array.from(new Set(stocks.map((stock) => stock.industry)))];
	const recommendations = (0, import_react.useMemo)(() => buildRecommendations(settings), [settings]);
	const filteredStocks = (0, import_react.useMemo)(() => {
		return stocks.filter((stock) => `${stock.stock_name}${stock.stock_id}`.toLowerCase().includes(query.toLowerCase())).filter((stock) => industry === "全部" ? true : stock.industry === industry).filter((stock) => stock.overall_star >= minStar).filter((stock) => risk === "全部" ? true : stock.risk_level === risk).filter((stock) => excludeFatal ? !stock.fatal_flag : true).sort((a, b) => {
			if (sortBy === "custom") return calculateScore(b, settings) - calculateScore(a, settings);
			if (sortBy === "momentum") return b.momentum_percentile - a.momentum_percentile;
			if (sortBy === "rmw") return b.rmw_percentile - a.rmw_percentile;
			if (sortBy === "hmlo") return b.hmlo_percentile - a.hmlo_percentile;
			if (sortBy === "lowVol") return a.volatility_percentile - b.volatility_percentile;
			if (sortBy === "popular") return b.popularity - a.popularity;
			return b.overall_star - a.overall_star;
		});
	}, [
		query,
		industry,
		minStar,
		risk,
		excludeFatal,
		sortBy,
		settings
	]);
	const addCandidate = (id) => {
		setCandidateIds((current) => current.includes(id) ? current : [...current, id]);
	};
	const updateSetting = (key, value) => {
		setSettings((current) => ({
			...current,
			[key]: value
		}));
	};
	const updateWeight = (factor, value) => {
		setSettings((current) => ({
			...current,
			factorWeights: {
				...current.factorWeights,
				[factor]: value
			}
		}));
	};
	const navigate = (next) => {
		setView(next);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "topbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "brand-mark",
							children: "AI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI x Smart Beta" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "nav",
						"aria-label": "主要導覽",
						children: [
							["home", "首頁"],
							["explore", "股票探索"],
							["builder", "建立投資組合"],
							["results", "結果"],
							["about", "系統說明"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: view === id ? "active" : "",
							onClick: () => navigate(id),
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field top-search",
						"aria-label": "股票名稱或代碼搜尋",
						placeholder: "搜尋股票名稱或代碼",
						value: query,
						onChange: (event) => {
							setQuery(event.target.value);
							setView("explore");
						}
					})
				]
			}),
			view === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "hero",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "AI x Smart Beta 智能選股決策系統" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "用因子模型看懂股票，建立符合你偏好的投資組合。" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								style: { maxWidth: 360 },
								placeholder: "輸入公司名稱或股票代碼",
								value: query,
								onChange: (event) => setQuery(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button",
								onClick: () => navigate("builder"),
								children: "開始建立投資組合"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button secondary",
								onClick: () => navigate("explore"),
								children: "探索股票"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "subtle",
						children: "最新資料更新日期：2026-07-19。本系統為投資決策輔助，非投資保證。"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "market-panel",
					"aria-label": "市場探索摘要",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "市場探索中心" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "market-chart",
							children: [
								42,
								55,
								48,
								74,
								62,
								88,
								69,
								92,
								57
							].map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bar",
								style: { height: `${height}%` }
							}, index))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid three",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "subtle",
									children: "樣本股票"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stocks.length })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "subtle",
									children: "因子"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "7" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "subtle",
									children: "候選"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: candidateIds.length })] })
							]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "main",
				children: [
					["熱門關注", [...stocks].sort((a, b) => b.popularity - a.popularity).slice(0, 4)],
					["綜合評分較高", [...stocks].sort((a, b) => b.overall_star - a.overall_star).slice(0, 4)],
					["強勢動能", [...stocks].sort((a, b) => b.momentum_percentile - a.momentum_percentile).slice(0, 4)],
					["穩健低波動", [...stocks].sort((a, b) => a.volatility_percentile - b.volatility_percentile).slice(0, 4)]
				].map(([title, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					style: { marginBottom: 32 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "section-head",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "首頁僅呈現主要因子特色與風險提示，完整曝險請進入個股分析。" })] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid four",
						children: list.map((stock) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockCard, {
							stock,
							onCandidate: () => addCandidate(stock.stock_id),
							onDetail: () => {
								setSelectedId(stock.stock_id);
								navigate("detail");
							}
						}, `${title}-${stock.stock_id}`))
					})]
				}, title))
			})] }),
			view === "explore" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "股票搜尋與篩選" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "以全市場百分位、星等、風險條件與客製化分數探索股票。" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tag",
						children: [
							"結果 ",
							filteredStocks.length,
							" 筆"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "filter-layout",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "card filter-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "label",
								children: ["公司名稱或代碼", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value: query,
									onChange: (event) => setQuery(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "label",
								children: ["產業", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "select",
									value: industry,
									onChange: (event) => setIndustry(event.target.value),
									children: industries.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "label",
								children: ["最低綜合星等", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "select",
									value: minStar,
									onChange: (event) => setMinStar(Number(event.target.value)),
									children: [
										1,
										2,
										3,
										4,
										5
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: item,
										children: [item, " 星以上"]
									}, item))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "label",
								children: ["風險等級", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "select",
									value: risk,
									onChange: (event) => setRisk(event.target.value),
									children: [
										"全部",
										"低",
										"中",
										"高"
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "label",
								children: ["排序方式", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select",
									value: sortBy,
									onChange: (event) => setSortBy(event.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "overall",
											children: "綜合評分"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "custom",
											children: "客製化評分"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "momentum",
											children: "動能"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "rmw",
											children: "獲利能力"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "hmlo",
											children: "價值因子"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "lowVol",
											children: "低波動"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "popular",
											children: "市場熱門程度"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: excludeFatal,
									onChange: (event) => setExcludeFatal(event.target.checked)
								}), "排除致命組合"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "table-wrap",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "股票" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "產業" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "綜合星等" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "客製化分數" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "RMW" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Momentum" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Volatility" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "風險" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "操作" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredStocks.map((stock) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: stock.stock_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "subtle",
								children: stock.stock_id
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: stock.industry }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "stars",
								children: starText(stock.overall_star)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: calculateScore(stock, settings).toFixed(1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: stock.rmw_percentile }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: stock.momentum_percentile }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: stock.volatility_percentile }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: stock.fatal_flag ? "tag risk" : "tag",
								children: stock.fatal_flag ? "致命組合" : stock.risk_level
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button secondary",
									onClick: () => {
										setSelectedId(stock.stock_id);
										navigate("detail");
									},
									children: "詳情"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button ghost",
									onClick: () => addCandidate(stock.stock_id),
									children: "候選"
								})]
							}) })
						] }, stock.stock_id)) })] })
					})]
				})]
			}),
			view === "detail" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "factor-layout",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "row",
									style: { justifyContent: "space-between" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "panel-title",
										children: [
											selectedStock.stock_name,
											" ",
											selectedStock.stock_id
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "subtle",
										children: [
											selectedStock.industry,
											" · ",
											selectedStock.market,
											" · 資料日期 ",
											selectedStock.data_date,
											" · 參考股價",
											" ",
											formatCurrency(selectedStock.reference_price)
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "stars",
										children: starText(selectedStock.overall_star)
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiStockExplanation, { stock: selectedStock }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-head",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "市場與規模" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Beta 與 SMB 用來理解市場敏感度與規模風格，不直接代表公司品質。" })] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid two",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "beta"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "smb"
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-head",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "獲利與投資" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid two",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "rmw"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "cma"
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-head",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "價值與動能" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid two",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "hmlo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "momentum"
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-head",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "風險狀態" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid two",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorCard, {
									stock: selectedStock,
									factor: "volatility"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Fatal combination" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "subtle",
											children: "規則：SMB > 0、RMW < 0、CMA < 0 同時成立。"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: selectedStock.fatal_flag ? "tag risk" : "tag",
											children: selectedStock.fatal_flag ? "已觸發" : "未觸發"
										})
									]
								})]
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "panel-title",
									children: "風險警示"
								}),
								riskReasonsFor(selectedStock).map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "warning-box",
									children: reason
								}, reason)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "subtle",
									children: [
										"迴歸觀測數 ",
										selectedStock.regression_observation_count,
										"，配適品質 ",
										selectedStock.regression_fit_quality,
										"。"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "panel-title",
								children: "下一步"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button",
										onClick: () => addCandidate(selectedStock.stock_id),
										children: "加入候選清單"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button secondary",
										onClick: () => navigate("builder"),
										children: "加入投資組合"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "button secondary",
										onClick: () => navigate("explore"),
										children: "回到搜尋結果"
									})
								]
							})]
						})]
					})]
				})
			}),
			view === "builder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "投資組合建立" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "四步驟區分投資條件、因子偏好與資金配置，避免混淆評分權重和資金權重。" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: weightSum(settings.factorWeights) === 100 ? "tag" : "tag warn",
							children: [
								"因子權重總和 ",
								weightSum(settings.factorWeights),
								"%"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "stepper",
						children: [
							"投資條件",
							"因子偏好",
							"資金配置",
							"確認設定"
						].map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: step === index + 1 ? "step-tab active" : "step-tab",
							onClick: () => setStep(index + 1),
							children: [
								index + 1,
								". ",
								label
							]
						}, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "step-panel",
						children: [
							step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid three",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["投資總金額", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											value: settings.totalAmount,
											onChange: (event) => updateSetting("totalAmount", Number(event.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["預計持有股票數量", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											min: 3,
											max: 10,
											value: settings.stockCount,
											onChange: (event) => updateSetting("stockCount", Number(event.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["最低綜合星等", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "select",
											value: settings.minOverallStar,
											onChange: (event) => updateSetting("minOverallStar", Number(event.target.value)),
											children: [
												1,
												2,
												3,
												4,
												5
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: item,
												children: [item, " 星以上"]
											}, item))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["風險偏好", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "select",
											value: settings.riskPreference,
											onChange: (event) => updateSetting("riskPreference", event.target.value),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "conservative",
													children: "保守"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "balanced",
													children: "均衡"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "aggressive",
													children: "積極"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["單一產業配置上限", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											value: settings.industryCap,
											onChange: (event) => updateSetting("industryCap", Number(event.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "row",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: settings.excludeFatal,
													onChange: (event) => updateSetting("excludeFatal", event.target.checked)
												}), "排除致命組合"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "row",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: settings.limitIndustry,
													onChange: (event) => updateSetting("limitIndustry", event.target.checked)
												}), "限制產業集中"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "row",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: settings.oddLots,
													onChange: (event) => updateSetting("oddLots", event.target.checked)
												}), "使用零股"]
											})
										]
									})
								]
							}),
							step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "preset-grid",
										children: Object.keys(presets).map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: preset === name ? "preset active" : "preset",
											onClick: () => {
												setPreset(name);
												updateSetting("factorWeights", presets[name]);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "subtle",
												children: "一鍵帶入預設因子偏好。"
											})]
										}, name))
									}),
									Object.keys(settings.factorWeights).map((factor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "slider-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												title: factorHelp[factor],
												children: factorLabels[factor]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "range",
												min: 0,
												max: 50,
												value: settings.factorWeights[factor],
												onChange: (event) => updateWeight(factor, Number(event.target.value))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "field",
												type: "number",
												min: 0,
												max: 100,
												value: settings.factorWeights[factor],
												onChange: (event) => updateWeight(factor, Number(event.target.value))
											})
										]
									}, factor)),
									weightSum(settings.factorWeights) !== 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "warning-box",
										children: [
											"輸入錯誤：因子權重總和必須等於 100%，目前為 ",
											weightSum(settings.factorWeights),
											"%。"
										]
									})
								]
							}),
							step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid three",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["資金配置方式", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "select",
											value: settings.allocationMethod,
											onChange: (event) => updateSetting("allocationMethod", event.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "equal",
												children: "等額配置"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "score",
												children: "依評分配置"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["單一股票最大配置比例", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											value: settings.maxSingleWeight,
											onChange: (event) => updateSetting("maxSingleWeight", Number(event.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["最低配置比例", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											value: settings.minSingleWeight,
											onChange: (event) => updateSetting("minSingleWeight", Number(event.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "label",
										children: ["保留最低現金比例", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											type: "number",
											value: settings.reserveCashPercent,
											onChange: (event) => updateSetting("reserveCashPercent", Number(event.target.value))
										})]
									})
								]
							}),
							step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid two",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "panel-title",
											children: "設定摘要"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["投資金額：", formatCurrency(settings.totalAmount)] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["股票數量：", settings.stockCount] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["風險偏好：", settings.riskPreference === "conservative" ? "保守" : settings.riskPreference === "balanced" ? "均衡" : "積極"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["配置方式：", settings.allocationMethod === "equal" ? "等額配置" : "依評分配置"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["排除致命組合：", settings.excludeFatal ? "是" : "否"] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "panel-title",
											children: "可產生結果"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "subtle",
											children: "符合條件股票不足時，系統會保留條件並提示原因，不會自行忽略條件。"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "button",
											disabled: weightSum(settings.factorWeights) !== 100,
											onClick: () => navigate("results"),
											children: "產生智能投資組合"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "row",
								style: {
									marginTop: 18,
									justifyContent: "space-between"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button secondary",
									disabled: step === 1,
									onClick: () => setStep((current) => Math.max(1, current - 1)),
									children: "上一步"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button",
									disabled: step === 4,
									onClick: () => setStep((current) => Math.min(4, current + 1)),
									children: "下一步"
								})]
							})
						]
					})
				]
			}),
			view === "results" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "投資組合結果" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "推薦清單由確定性量化規則產生，AI 僅根據結果產生解釋文字。" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button secondary",
							onClick: () => navigate("builder"),
							children: "調整設定"
						})]
					}),
					recommendations.length < settings.stockCount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "warning-box",
						children: [
							"符合條件股票不足：目前僅 ",
							recommendations.length,
							" 支。可能原因包含最低星等、排除致命組合、保守風險偏好或產業上限過嚴。建議放寬最低星等、提高產業上限或取消排除致命組合。"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "summary-strip",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["投資總金額", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatCurrency(settings.totalAmount) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["實際配置", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatCurrency(recommendations.reduce((sum, item) => sum + item.actual_amount, 0)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["剩餘現金", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatCurrency(settings.totalAmount - recommendations.reduce((sum, item) => sum + item.actual_amount, 0)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["股票數量", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: recommendations.length })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["平均星等", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: (recommendations.reduce((sum, item) => sum + item.overall_star, 0) / Math.max(1, recommendations.length)).toFixed(1) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kpi",
								children: ["風險等級", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: recommendations.some((item) => item.risk_level === "高") ? "高" : "中" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						style: { marginTop: 22 },
						className: "table-wrap",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "排名" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "股票" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "分數" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "星等" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "配置比例" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "配置金額" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "股數" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "推薦原因" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "主要風險" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recommendations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.rank }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.stock_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "subtle",
								children: [
									item.stock_id,
									" · ",
									item.industry
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.custom_score }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "stars",
								children: starText(item.overall_star)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [item.allocation_weight, "%"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatCurrency(item.actual_amount) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.purchasable_shares.toLocaleString("zh-TW") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.recommendation_reasons[0] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.risk_reasons[0] })
						] }, item.stock_id)) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid two",
						style: { marginTop: 22 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "panel-title",
								children: "AI 組合整體分析"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "subtle",
								children: [
									"此組合主要偏向 ",
									settings.allocationMethod === "score" ? "依客製化分數提高高排名股票權重" : "等額分散配置",
									"， 較強因子集中在 ",
									recommendations[0]?.recommendation_reasons[0] || "目前條件下沒有足夠樣本",
									"。主要風險來自",
									recommendations.find((item) => item.risk_level === "高")?.risk_reasons[0] || "模型估計期間、資料品質與市場狀態變化",
									"。"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "panel-title",
								children: "免責聲明"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "subtle",
								children: "本結果為量化模型之決策輔助，不代表未來報酬保證。因子曝險由歷史資料估計，可能受到市場狀態、資料品質與估計期間影響。本 MVP 尚未納入交易成本、稅費、流動性與滑價。"
							})]
						})]
					})
				]
			}),
			view === "about" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "section-head",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "系統說明" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "本系統不是股價預測或自動下單工具，而是可解釋的量化投資決策輔助系統。" })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid three",
					children: [
						["確定性量化計算", "Rolling Regression、百分位、星等、致命組合、排名與配置由程式完成。"],
						["AI 解釋邊界", "AI 僅根據結構化 JSON 解釋，不創造新聞、財務資訊或報酬預測。"],
						["待產品決策", "TEJ 欄位授權、批次頻率、Beta 理想區間、資料不足門檻與上線資料庫規格需再決策。"]
					].map(([title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "panel-title",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "subtle",
							children: body
						})]
					}, title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "footer-note",
				children: "資料欄位命名遵循 stock_id、factor_percentile、factor_star、custom_score、allocation_weight 等一致規格。此 MVP 使用樣本資料展示流程，正式版需串接 TEJ/API 與批次因子引擎。"
			})
		]
	});
}
//#endregion
export { Home as default };
