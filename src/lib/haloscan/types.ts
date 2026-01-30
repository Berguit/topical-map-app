// ===========================================
// HALOSCAN API TYPES
// ===========================================

// --- Common Types ---
export interface HaloscanKeywordResult {
  keyword: string;
  volume: number | "NA";
  cpc: number | "NA";
  competition: number | "NA";
  kgr: number | "NA";
  allintitle: number | "NA";
  google_indexed?: number | "NA";
  word_count: number;
}

export interface HaloscanBaseResponse {
  response_time: string;
  response_code: string | null;
  failure_reason: string | null;
}

// --- Overview Endpoint ---
export type OverviewRequestedData =
  | "keyword_match"
  | "related_search"
  | "related_question"
  | "similar_category"
  | "similar_serp"
  | "top_sites"
  | "similar_highlight"
  | "categories"
  | "synonyms"
  | "metrics"
  | "volume_history"
  | "serp";

export interface OverviewRequest {
  keyword: string;
  requested_data: OverviewRequestedData[];
  lang?: "fr" | "en";
}

export interface OverviewSerpResult {
  position: number;
  url: string;
  title: string;
  description: string;
}

export interface OverviewTopSite {
  domain: string;
  score: number;
}

export interface OverviewResponse extends HaloscanBaseResponse {
  keyword: string;
  errors: string[];
  similar_highlight?: {
    results: { keyword: string; volume: number }[];
  };
  keyword_match?: {
    results: { keyword: string; volume: number }[];
  };
  serp?: {
    serp_date: string;
    results: { serp: OverviewSerpResult[] };
  };
  top_sites?: {
    results: OverviewTopSite[];
  };
  seo_metrics?: {
    results_count: number;
    allintitle_count: number;
    volume: number;
    keyword_count: number;
    kgr: number;
  };
  ads_metrics?: {
    volume: number;
    cpc: number;
    competition: number;
  };
}

// --- Match/Similar/Highlights/Related Endpoints ---
export interface KeywordSearchRequest {
  keyword: string;
  lineCount?: number;
  page?: number;
  order_by?: "default" | "keyword" | "volume" | "cpc" | "competition" | "kgr" | "allintitle" | "similarity" | "depth";
  order?: "asc" | "desc";
  exact_match?: boolean;
  volume_min?: number;
  volume_max?: number;
  cpc_min?: number;
  cpc_max?: number;
  competition_min?: number;
  competition_max?: number;
  kgr_min?: number;
  kgr_max?: number;
  allintitle_min?: number;
  allintitle_max?: number;
  word_count_min?: number;
  word_count_max?: number;
  include?: string;
  exclude?: string;
}

export interface KeywordSearchResponse extends HaloscanBaseResponse {
  keyword: string;
  total_result_count: number;
  filtered_result_count: number;
  filtered_result_volume: number;
  returned_result_count: number;
  remaining_result_count: number;
  results: HaloscanKeywordResult[];
}

// --- Questions Endpoint ---
export type QuestionType =
  | "definition"
  | "how"
  | "how_expensive"
  | "how_many"
  | "what"
  | "when"
  | "where"
  | "who"
  | "why"
  | "yesno"
  | "how_long"
  | "unknown";

export interface QuestionsRequest extends KeywordSearchRequest {
  question_types?: QuestionType[];
  keep_only_paa?: boolean;
  depth_min?: number;
  depth_max?: number;
}

export interface QuestionResult extends HaloscanKeywordResult {
  question_type: QuestionType;
  depth: number;
}

export interface QuestionsResponse extends HaloscanBaseResponse {
  keyword: string;
  total_result_count: number;
  filtered_result_count: number;
  filtered_result_volume: number;
  returned_result_count: number;
  remaining_result_count: number;
  results: QuestionResult[];
}

// --- Site Structure Endpoint ---
export type SiteStructureMode = "multi" | "manual";
export type SiteStructureSource = "ngram" | "serp" | "related" | "highlights" | "categories";

export interface SiteStructureRequest {
  keyword?: string;
  keywords?: string[];
  exact_match?: boolean;
  neighbours_sources?: SiteStructureSource[];
  multipartite_modes?: SiteStructureSource[];
  neighbours_sample_max_size?: number;
  mode?: SiteStructureMode;
  granularity?: number;
  manual_common_10?: number;
  manual_common_100?: number;
}

export interface SiteStructureNode {
  name: string;
  value?: number;
  children?: SiteStructureNode[];
}

export interface SiteStructureCannibalisation {
  groupe: string;
  keyword: string;
}

export interface SiteStructureTableEntry extends HaloscanKeywordResult {
  article: string;
  V1: string;
  V2: string;
  V3: string;
  V4: string;
  value: number;
}

export interface SiteStructureResponse extends HaloscanBaseResponse {
  seed: string;
  graph: SiteStructureNode;
  cannibalisation: SiteStructureCannibalisation[];
  table: SiteStructureTableEntry[];
  outliers: string[];
}

// --- Bulk Endpoint ---
export interface BulkRequest {
  keywords: string[];
  lineCount?: number;
  page?: number;
  order_by?: "keep" | "keyword" | "volume" | "cpc" | "competition" | "kgr" | "allintitle";
  order?: "asc" | "desc";
  volume_min?: number;
  volume_max?: number;
}

export interface BulkResponse extends HaloscanBaseResponse {
  keywords: string[];
  total_result_count: number;
  filtered_result_count: number;
  filtered_result_volume: number;
  returned_result_count: number;
  remaining_result_count: number;
  results: HaloscanKeywordResult[];
}

// --- Find Endpoint ---
export type FindSource = "match" | "serp" | "related" | "highlights" | "categories" | "questions";

export interface FindRequest extends KeywordSearchRequest {
  keywords?: string;
  keywords_sources?: FindSource[];
  keep_seed?: boolean;
}

export interface FindResult extends HaloscanKeywordResult {
  match_count: number;
  modalities: string;
}

export interface FindResponse extends HaloscanBaseResponse {
  seed: string;
  total_result_count: number;
  filtered_result_count: number;
  filtered_result_volume: number;
  result_count: number;
  remaining_result_count: number;
  results: FindResult[];
}

// --- SERP Compare Endpoint ---
export interface SerpCompareRequest {
  keyword: string;
  period?: "1 month" | "3 months" | "6 months" | "12 months" | "custom";
  first_date?: string;
  second_date?: string;
}

export interface SerpCompareResult {
  url: string;
  position: number;
  diff: string;
}

export interface SerpCompareResponse extends HaloscanBaseResponse {
  keyword: string;
  dates: [string, string];
  available_search_dates: string[];
  results: {
    old_serp: SerpCompareResult[];
    new_serp: SerpCompareResult[];
  };
}
