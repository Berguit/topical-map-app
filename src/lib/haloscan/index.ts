// Client functions
export {
  getKeywordOverview,
  getKeywordMatch,
  getKeywordSimilar,
  getKeywordHighlights,
  getKeywordRelated,
  getKeywordSynonyms,
  getKeywordQuestions,
  getSiteStructure,
  getKeywordsBulk,
  findKeywords,
  compareSerpHistory,
  getAvailableSerpDates,
  scrapKeywords,
  getFullKeywordAnalysis,
  generateTopicalStructure,
  HaloscanError,
} from "./client";

// Types
export type {
  // Common
  HaloscanKeywordResult,
  HaloscanBaseResponse,
  // Overview
  OverviewRequestedData,
  OverviewRequest,
  OverviewResponse,
  OverviewSerpResult,
  OverviewTopSite,
  // Keyword Search
  KeywordSearchRequest,
  KeywordSearchResponse,
  // Questions
  QuestionType,
  QuestionsRequest,
  QuestionsResponse,
  QuestionResult,
  // Site Structure
  SiteStructureMode,
  SiteStructureSource,
  SiteStructureRequest,
  SiteStructureResponse,
  SiteStructureNode,
  SiteStructureCannibalisation,
  SiteStructureTableEntry,
  // Bulk
  BulkRequest,
  BulkResponse,
  // Find
  FindSource,
  FindRequest,
  FindResponse,
  FindResult,
  // SERP
  SerpCompareRequest,
  SerpCompareResponse,
  SerpCompareResult,
} from "./types";
