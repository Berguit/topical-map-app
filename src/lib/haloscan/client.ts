// ===========================================
// HALOSCAN API CLIENT
// ===========================================

import type {
  OverviewRequest,
  OverviewResponse,
  KeywordSearchRequest,
  KeywordSearchResponse,
  QuestionsRequest,
  QuestionsResponse,
  SiteStructureRequest,
  SiteStructureResponse,
  BulkRequest,
  BulkResponse,
  FindRequest,
  FindResponse,
  SerpCompareRequest,
  SerpCompareResponse,
  HaloscanBaseResponse,
} from "./types";

const HALOSCAN_API_URL = "https://api.haloscan.com/api";

class HaloscanError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public failureReason?: string
  ) {
    super(message);
    this.name = "HaloscanError";
  }
}

async function haloscanFetch<T extends HaloscanBaseResponse>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.HALOSCAN_API_KEY;

  if (!apiKey) {
    throw new HaloscanError("HALOSCAN_API_KEY is not configured");
  }

  const response = await fetch(`${HALOSCAN_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "haloscan-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new HaloscanError(
      `Haloscan API error: ${response.status} - ${error}`,
      response.status
    );
  }

  const data: T = await response.json();

  if (data.failure_reason) {
    throw new HaloscanError(
      `Haloscan API failed: ${data.failure_reason}`,
      undefined,
      data.failure_reason
    );
  }

  return data;
}

// ===========================================
// KEYWORD OVERVIEW
// ===========================================

/**
 * Get comprehensive overview of a keyword including metrics, SERP, related keywords, etc.
 * Cost: 1 keyword credit
 */
export async function getKeywordOverview(
  request: OverviewRequest
): Promise<OverviewResponse> {
  return haloscanFetch<OverviewResponse>("/keywords/overview", request);
}

// ===========================================
// KEYWORD SEARCH ENDPOINTS
// ===========================================

/**
 * Find keywords containing the seed keyword
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordMatch(
  request: KeywordSearchRequest
): Promise<KeywordSearchResponse> {
  return haloscanFetch<KeywordSearchResponse>("/keywords/match", request);
}

/**
 * Find semantically similar keywords (based on SERP similarity)
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordSimilar(
  request: KeywordSearchRequest
): Promise<KeywordSearchResponse> {
  return haloscanFetch<KeywordSearchResponse>("/keywords/similar", request);
}

/**
 * Get highlighted keywords (combination of match + similarity)
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordHighlights(
  request: KeywordSearchRequest
): Promise<KeywordSearchResponse> {
  return haloscanFetch<KeywordSearchResponse>("/keywords/highlights", request);
}

/**
 * Get related keywords (from Google's related searches)
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordRelated(
  request: KeywordSearchRequest
): Promise<KeywordSearchResponse> {
  return haloscanFetch<KeywordSearchResponse>("/keywords/related", request);
}

/**
 * Get synonyms for a keyword
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordSynonyms(
  request: KeywordSearchRequest
): Promise<KeywordSearchResponse> {
  return haloscanFetch<KeywordSearchResponse>("/keywords/synonyms", request);
}

// ===========================================
// QUESTIONS (PAA)
// ===========================================

/**
 * Get PAA (People Also Ask) questions for a keyword
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function getKeywordQuestions(
  request: QuestionsRequest
): Promise<QuestionsResponse> {
  return haloscanFetch<QuestionsResponse>("/keywords/questions", request);
}

// ===========================================
// SITE STRUCTURE (CLUSTERING)
// ===========================================

/**
 * Generate hierarchical site structure with keyword clustering
 * Cost: 1 keyword credit
 */
export async function getSiteStructure(
  request: SiteStructureRequest
): Promise<SiteStructureResponse> {
  return haloscanFetch<SiteStructureResponse>("/keywords/siteStructure", request);
}

// ===========================================
// BULK & FIND
// ===========================================

/**
 * Get metrics for multiple keywords at once
 * Cost: 1 bulk credit + 1 export credit per result
 */
export async function getKeywordsBulk(
  request: BulkRequest
): Promise<BulkResponse> {
  return haloscanFetch<BulkResponse>("/keywords/bulk", request);
}

/**
 * Find keywords using multiple strategies
 * Cost: 1 keyword credit + 1 export credit per result
 */
export async function findKeywords(
  request: FindRequest
): Promise<FindResponse> {
  return haloscanFetch<FindResponse>("/keywords/find", request);
}

// ===========================================
// SERP ANALYSIS
// ===========================================

/**
 * Compare SERPs between two dates
 * Cost: 1 keyword credit
 */
export async function compareSerpHistory(
  request: SerpCompareRequest
): Promise<SerpCompareResponse> {
  return haloscanFetch<SerpCompareResponse>("/keywords/serp/compare", request);
}

/**
 * Get available SERP dates for a keyword
 * Cost: FREE
 */
export async function getAvailableSerpDates(
  keyword: string
): Promise<{ keyword: string; available_search_dates: string[] }> {
  return haloscanFetch("/keywords/serp/availableDates", { keyword });
}

// ===========================================
// REFRESH
// ===========================================

/**
 * Request a refresh/scrape of keywords
 * Cost: 1 refresh credit per keyword
 */
export async function scrapKeywords(keywords: string[]): Promise<void> {
  const apiKey = process.env.HALOSCAN_API_KEY;

  if (!apiKey) {
    throw new HaloscanError("HALOSCAN_API_KEY is not configured");
  }

  const response = await fetch(`${HALOSCAN_API_URL}/keywords/scrap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "haloscan-api-key": apiKey,
    },
    body: JSON.stringify({ keywords }),
  });

  if (!response.ok && response.status !== 201) {
    const error = await response.text();
    throw new HaloscanError(
      `Haloscan scrap error: ${response.status} - ${error}`,
      response.status
    );
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get full keyword analysis for topical map generation
 * Combines overview, questions, and related keywords
 */
export async function getFullKeywordAnalysis(keyword: string) {
  const [overview, questions, related] = await Promise.all([
    getKeywordOverview({
      keyword,
      requested_data: [
        "metrics",
        "keyword_match",
        "similar_highlight",
        "top_sites",
        "serp",
      ],
    }),
    getKeywordQuestions({
      keyword,
      lineCount: 50,
      keep_only_paa: true,
    }),
    getKeywordRelated({
      keyword,
      lineCount: 50,
      order_by: "volume",
      order: "desc",
    }),
  ]);

  return {
    keyword,
    metrics: overview.seo_metrics,
    serp: overview.serp,
    topSites: overview.top_sites?.results || [],
    similarKeywords: overview.similar_highlight?.results || [],
    matchingKeywords: overview.keyword_match?.results || [],
    questions: questions.results,
    relatedKeywords: related.results,
  };
}

/**
 * Generate topical map structure from Haloscan data
 */
export async function generateTopicalStructure(
  keyword: string,
  options?: {
    granularity?: number;
    maxKeywords?: number;
  }
) {
  const structure = await getSiteStructure({
    keyword,
    mode: "multi",
    multipartite_modes: ["serp", "related"],
    neighbours_sources: ["serp", "related"],
    neighbours_sample_max_size: options?.maxKeywords || 500,
    granularity: options?.granularity || 0.25,
  });

  return {
    keyword,
    graph: structure.graph,
    clusters: structure.table,
    cannibalisation: structure.cannibalisation,
  };
}

export { HaloscanError };
