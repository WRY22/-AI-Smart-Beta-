# AI x Smart Beta 智能選股決策系統規劃

## 1. 系統資訊架構

全站分為五個主要頁面：`home` 首頁、`explore` 股票探索、`stock_detail` 個股分析、`portfolio_builder` 投資組合建立、`portfolio_result` 投資組合結果。共用導覽包含系統名稱、首頁、股票探索、建立投資組合、股票搜尋框與系統說明。

資料層以批次量化資料為核心，分為股票基本資料、因子曝險、全市場百分位、星等、風險標記、推薦結果與 AI 解釋輸入輸出。

## 2. 完整使用者流程

使用者從首頁進入市場探索，搜尋或選擇股票後查看個股分析，將股票加入候選清單或直接進入投資組合建立。建立流程依序設定投資條件、因子偏好、資金配置方式與確認設定。送出後，後端篩選股票池、計算客製化分數、排序、配置資金、計算可買股數與剩餘現金，再將結構化結果交給 AI 解釋模組。

## 3. 各頁面功能規格

首頁：Hero、搜尋、主要 CTA、資料更新日期、投資輔助聲明、熱門關注、綜合評分較高、強勢動能、穩健低波動。

股票探索：公司名稱/代碼搜尋、產業篩選、綜合星等、風險等級、致命組合排除、排序、查看詳情、加入候選。

個股分析：基本資訊、AI 一句話摘要、四大因子區塊、百分位與星等、風險警示、操作按鈕。

投資組合建立：四步驟表單、快速投資風格、自訂因子權重、權重總和驗證、等額/依評分配置、單股上限、產業上限、現金保留。

投資組合結果：組合摘要、推薦清單、配置比例、配置金額、可購買股數、推薦原因、風險原因、AI 整體分析、免責聲明。

## 4. 低保真 Wireframe

首頁：`TopNav` → `Hero: H1 + 搜尋 + CTA + 更新日期` → `市場摘要圖` → `四組熱門股票卡片` → `免責聲明`。

股票探索：`TopNav` → 左側 `FilterPanel` → 右側 `StockResultTable` → 列操作 `詳情 / 候選`。

個股分析：上方 `StockHeader` + `AI Summary`；主欄依序 `市場與規模`、`獲利與投資`、`價值與動能`、`風險狀態`；側欄 `RiskAlertPanel` + `ActionPanel`。

投資組合建立：`StepTabs` → `StepContent` → `上一頁 / 下一頁`；第四步顯示設定摘要與產生結果按鈕。

結果頁：`PortfolioSummary KPIs` → `RecommendationTable` → `AI PortfolioAnalysis` → `Disclaimer`。

## 5. 前端元件清單

`TopNav`、`SearchBox`、`Hero`、`StockCard`、`FilterPanel`、`StockResultTable`、`FactorCard`、`RiskAlertPanel`、`Stepper`、`PresetSelector`、`WeightSlider`、`AllocationForm`、`PortfolioSummary`、`RecommendationTable`、`AiExplanationPanel`、`DisclaimerPanel`、`Tag`、`StarRating`、`PercentileMeter`。

## 6. 後端模組架構

`data_ingestion`：TEJ、外部 API、定期更新。

`data_preprocessing`：缺值、異常值、股票日期對齊、公告時間處理、防止未來資料。

`factor_engine`：報酬率、因子序列、Rolling Regression、HML 正交化、Volatility、因子曝險。

`cross_sectional_ranking`：依資料日期進行全市場百分位與星等轉換，保留原始曝險。

`recommendation_engine`：篩選、權重、風險偏好、Fatal rule、排名、集中度控制。

`allocation_engine`：等額配置、依評分配置、股數換算、上限限制、剩餘現金。

`ai_explanation_engine`：接收結構化 JSON，產出受約束的個股與組合解釋。

`api_layer`：首頁、搜尋、個股、因子分析、建立推薦組合、取得 AI 解釋。

## 7. 資料庫 Schema

`stocks(stock_id, stock_name, industry, market, reference_price, data_date, market_cap)`

`factor_exposures(stock_id, data_date, beta_exposure, smb_exposure, rmw_exposure, cma_exposure, hmlo_exposure, momentum_value, volatility_value)`

`factor_rankings(stock_id, data_date, beta_percentile, smb_percentile, rmw_percentile, cma_percentile, hmlo_percentile, momentum_percentile, volatility_percentile, beta_star, smb_star, rmw_star, cma_star, hmlo_star, momentum_star, volatility_star, overall_star)`

`risk_flags(stock_id, data_date, fatal_flag, risk_level, data_quality_flag, regression_observation_count, regression_fit_quality)`

`portfolio_requests(request_id, created_at, total_amount, stock_count, min_overall_star, risk_preference, exclude_fatal, limit_industry, industry_cap, odd_lots, allocation_method, max_single_weight, min_single_weight, reserve_cash_percent, factor_weights_json)`

`portfolio_results(result_id, request_id, stock_id, custom_score, rank, allocation_weight, target_amount, purchasable_shares, actual_amount, remaining_cash, recommendation_reasons_json, risk_reasons_json)`

## 8. REST API 規格

`GET /api/home/highlights`：回傳四組首頁股票清單。

`GET /api/stocks?query=&industry=&min_overall_star=&risk_level=&exclude_fatal=&sort_by=`：搜尋與篩選。

`GET /api/stocks/{stock_id}`：個股基本資訊、因子、百分位、星等、風險。

`GET /api/stocks/{stock_id}/analysis`：個股分析區塊與 AI 解釋輸入。

`POST /api/portfolios/recommendations`：提交投資條件、因子權重與配置規則，回傳推薦結果。

`POST /api/ai/explain-stock`：輸入個股結構化資料，回傳受約束解釋。

`POST /api/ai/explain-portfolio`：輸入推薦組合 JSON，回傳整體分析。

## 9. 評分與推薦演算法偽程式碼

```text
candidate_pool = stocks
  .where(data_quality_flag == "通過")
  .where(overall_star >= min_overall_star)
  .where(exclude_fatal ? fatal_flag == false : true)
  .where(risk_preference == "保守" ? risk_level != "高" : true)

for stock in candidate_pool:
  adjusted_percentiles = direction_adjust(stock.percentiles, risk_preference)
  custom_score = sum(adjusted_percentile[factor] * factor_weight[factor])
  if stock.fatal_flag and not exclude_fatal:
    custom_score = custom_score - fatal_penalty

ranked = sort(candidate_pool, custom_score desc)
selected = apply_industry_cap(ranked, stock_count, industry_cap)
```

## 10. 資金配置演算法偽程式碼

```text
available_cash = total_amount * (1 - reserve_cash_percent)

if allocation_method == "equal":
  raw_weight = 1 / selected_count
else:
  raw_weight = custom_score / sum(custom_score)

allocation_weight = clamp(raw_weight, min_single_weight, max_single_weight)
target_amount = available_cash * allocation_weight
lot_size = odd_lots ? 1 : 1000
purchasable_shares = floor(target_amount / reference_price / lot_size) * lot_size
actual_amount = purchasable_shares * reference_price
remaining_cash = total_amount - sum(actual_amount)
```

## 11. AI 解釋模組 JSON

個股輸入：

```json
{
  "stock_id": "2330",
  "stock_name": "台積電",
  "data_date": "2026-07-19",
  "factors": {
    "rmw": { "exposure": 0.68, "percentile": 92, "star": 5 },
    "momentum": { "exposure": 0.18, "percentile": 84, "star": 5 }
  },
  "risk": {
    "fatal_flag": false,
    "risk_level": "中",
    "regression_fit_quality": "佳"
  }
}
```

個股輸出：

```json
{
  "summary": "台積電的品質與動能因子相對突出，但仍需留意市場風險曝險。",
  "recommendation_reasons": ["RMW 百分位 92", "Momentum 百分位 84"],
  "risk_reasons": ["Beta 接近市場中位以上"],
  "disclaimer": "此說明不代表未來報酬保證。"
}
```

組合輸入包含 `portfolio_summary`、`settings`、`recommendations[]`。組合輸出包含 `style_summary`、`strength_factors`、`risk_sources`、`industry_concentration`、`suitability`、`disclaimer`。

## 12. 錯誤處理與邊界情況

因子權重總和不等於 100：即時阻擋送出並顯示目前總和。

符合條件股票不足：不得自動忽略條件，需回傳不足原因與建議放寬條件。

股價高於可配置金額：股數為 0，保留剩餘現金並提示配置不足。

資料品質不足：排除或標示 `data_quality_flag = 注意`。

AI 回覆包含預測或保證措辭：後處理攔截並重試。

## 13. MVP 開發順序

1. 建立資料欄位與樣本資料。
2. 實作首頁、搜尋、個股分析。
3. 實作百分位、星等與 Fatal rule 顯示。
4. 實作四步驟投資組合建立。
5. 實作客製化分數與排序。
6. 實作等額與依評分配置。
7. 實作 AI 解釋模板與 JSON 契約。
8. 補響應式、錯誤狀態與測試。
9. 串接 TEJ/API 與資料庫。

## 14. 測試計畫

單元測試：百分位方向調整、星等轉換、權重總和、Fatal rule、custom_score、配置股數、剩餘現金。

整合測試：搜尋篩選 API、推薦 API、AI JSON 契約、資料不足回應。

UI 測試：手機與桌面導覽、四步驟流程、輸入錯誤、表格橫向捲動、按鈕狀態。

模型驗證：Rolling Regression 觀測數、配適品質門檻、HML 正交化檢查、避免未來資料。

## 15. 可行性與風險分析

可行性高：MVP 可先用批次因子表與即時計算推薦條件，不需即時重跑 Rolling Regression。

主要風險：TEJ 授權與資料欄位可用性、公告時間對齊、因子定義一致性、AI 語句合規、使用者誤解為投資保證。

待產品決策：

Beta 理想區間：選項 A 使用百分位 40-60 為均衡目標，簡單易懂；選項 B 依產業調整，較精準但複雜。推薦 MVP 採 A。

資料不足門檻：選項 A 觀測數小於 180 排除；選項 B 小於 220 排除。推薦 MVP 採 A 並標示配適品質。

Fatal penalty：選項 A 未排除時扣 12 分；選項 B 依風險偏好扣 8-20 分。推薦 MVP 採 A，後續以回測校準。

資料更新頻率：選項 A 每日批次；選項 B 每週批次。推薦採每日批次，但 UI 顯示資料日期。
