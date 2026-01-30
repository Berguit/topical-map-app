// ===========================================
// TOPICAL MAP GENERATOR SERVICE
// ===========================================
// Orchestrates the full pipeline:
// 1. Fetch keyword data from Haloscan
// 2. Generate semantic analysis with Claude
// 3. Return structured Topical Map

import type { Project } from "@/types";
import {
  getFullKeywordAnalysis,
  generateTopicalStructure,
} from "@/lib/haloscan";
import {
  callOpenRouter,
  parseJSONResponse,
  SYSTEM_PROMPT,
  getKnowledgeDomainPrompt,
  getContextVectorPrompt,
  getEAVModelPrompt,
  getTopicalMapPrompt,
  type HaloscanDataInput,
} from "@/lib/openrouter";

// ===========================================
// TYPES
// ===========================================

export interface GenerationProgress {
  step: "haloscan" | "knowledge_domain" | "context_vector" | "eav_model" | "topical_map";
  status: "pending" | "in_progress" | "completed" | "error";
  message: string;
  data?: unknown;
}

export interface TopicalMapGenerationResult {
  haloscanData: HaloscanDataInput;
  knowledgeDomain: KnowledgeDomainResult;
  contextVector: ContextVectorResult;
  eavModel: EAVModelResult;
  topicalMap: TopicalMapResult;
}

interface KnowledgeDomainResult {
  sourceContext: string;
  qualityParameters: Array<{
    name: string;
    description: string;
    importance: "critical" | "high" | "medium" | "low";
  }>;
  boundaries: string[];
  userExpectations: string[];
}

interface ContextVectorResult {
  vocabulary: Array<{
    term: string;
    category: "technical" | "common" | "jargon";
    definition: string;
    searchVolume?: number;
  }>;
  predicates: Array<{
    verb: string;
    usage: string;
    foundInQueries?: string[];
    semanticRoles: Array<{
      role: string;
      description: string;
    }>;
  }>;
  queryPatterns: Array<{
    pattern: string;
    intent: "informational" | "navigational" | "transactional" | "commercial";
    examples: string[];
    totalVolume?: number;
  }>;
  fiveWHPatterns: Array<{
    type: "what" | "who" | "where" | "when" | "why" | "how";
    patterns: string[];
    paaExamples?: string[];
  }>;
}

interface EAVModelResult {
  entities: Array<{
    name: string;
    type: string;
    description: string;
    isMainEntity: boolean;
    basedOnCluster?: string;
    keyAttributes: Array<{
      name: string;
      valueType: string;
      isKey: boolean;
      description: string;
      relatedKeywords?: string[];
    }>;
    standardAttributes: Array<{
      name: string;
      valueType: string;
      isKey: boolean;
      description: string;
      relatedKeywords?: string[];
    }>;
  }>;
  relations: Array<{
    sourceEntity: string;
    targetEntity: string;
    relationType: string;
    description: string;
  }>;
}

interface TopicalMapResult {
  nodes: Array<{
    id: string;
    type: "pillar" | "cluster" | "supporting";
    title: string;
    description: string;
    intent: "informational" | "navigational" | "transactional" | "commercial";
    fiveWH: string[];
    keywords: Array<{
      keyword: string;
      volume?: number;
      kgr?: number | null;
      isMain: boolean;
    }>;
    paaQuestions: string[];
    basedOnHaloscanCluster?: string | null;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: "hierarchical" | "contextual";
  }>;
}

// ===========================================
// MAIN GENERATOR FUNCTION
// ===========================================

export async function generateTopicalMap(
  project: Project,
  onProgress?: (progress: GenerationProgress) => void
): Promise<TopicalMapGenerationResult> {
  const keyword = project.mainTopic;

  // Step 1: Fetch Haloscan data
  onProgress?.({
    step: "haloscan",
    status: "in_progress",
    message: `Récupération des données Haloscan pour "${keyword}"...`,
  });

  const [fullAnalysis, structure] = await Promise.all([
    getFullKeywordAnalysis(keyword),
    generateTopicalStructure(keyword, {
      granularity: 0.25,
      maxKeywords: 500,
    }),
  ]);

  // Transform Haloscan data to our format
  const haloscanData: HaloscanDataInput = {
    seedKeyword: keyword,
    metrics: fullAnalysis.metrics
      ? {
          volume: fullAnalysis.metrics.volume,
          kgr: fullAnalysis.metrics.kgr,
          allintitle: fullAnalysis.metrics.allintitle_count,
        }
      : undefined,
    similarKeywords: fullAnalysis.similarKeywords,
    matchingKeywords: fullAnalysis.matchingKeywords,
    relatedKeywords: fullAnalysis.relatedKeywords,
    questions: fullAnalysis.questions,
    clusters: structure.clusters,
    topSites: fullAnalysis.topSites,
    serp: fullAnalysis.serp?.results?.serp,
  };

  onProgress?.({
    step: "haloscan",
    status: "completed",
    message: `Données Haloscan récupérées: ${haloscanData.similarKeywords?.length || 0} keywords similaires, ${haloscanData.questions?.length || 0} questions PAA, ${haloscanData.clusters?.length || 0} entrées de clusters`,
    data: haloscanData,
  });

  // Step 2: Generate Knowledge Domain
  onProgress?.({
    step: "knowledge_domain",
    status: "in_progress",
    message: "Génération du Knowledge Domain avec Claude...",
  });

  const knowledgeDomainPrompt = getKnowledgeDomainPrompt(project, haloscanData);
  const knowledgeDomainRaw = await callOpenRouter(knowledgeDomainPrompt, SYSTEM_PROMPT);
  const knowledgeDomain = parseJSONResponse<KnowledgeDomainResult>(knowledgeDomainRaw);

  onProgress?.({
    step: "knowledge_domain",
    status: "completed",
    message: "Knowledge Domain généré",
    data: knowledgeDomain,
  });

  // Step 3: Generate Context Vector
  onProgress?.({
    step: "context_vector",
    status: "in_progress",
    message: "Génération du Context Vector avec Claude...",
  });

  const contextVectorPrompt = getContextVectorPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    haloscanData
  );
  const contextVectorRaw = await callOpenRouter(contextVectorPrompt, SYSTEM_PROMPT);
  const contextVector = parseJSONResponse<ContextVectorResult>(contextVectorRaw);

  onProgress?.({
    step: "context_vector",
    status: "completed",
    message: `Context Vector généré: ${contextVector.vocabulary.length} termes, ${contextVector.predicates.length} prédicats`,
    data: contextVector,
  });

  // Step 4: Generate EAV Model
  onProgress?.({
    step: "eav_model",
    status: "in_progress",
    message: "Génération du modèle EAV avec Claude...",
  });

  const eavModelPrompt = getEAVModelPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2),
    haloscanData
  );
  const eavModelRaw = await callOpenRouter(eavModelPrompt, SYSTEM_PROMPT);
  const eavModel = parseJSONResponse<EAVModelResult>(eavModelRaw);

  onProgress?.({
    step: "eav_model",
    status: "completed",
    message: `Modèle EAV généré: ${eavModel.entities.length} entités, ${eavModel.relations.length} relations`,
    data: eavModel,
  });

  // Step 5: Generate Topical Map
  onProgress?.({
    step: "topical_map",
    status: "in_progress",
    message: "Génération de la Topical Map avec Claude...",
  });

  const topicalMapPrompt = getTopicalMapPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2),
    JSON.stringify(eavModel, null, 2),
    haloscanData
  );
  const topicalMapRaw = await callOpenRouter(topicalMapPrompt, SYSTEM_PROMPT);
  const topicalMap = parseJSONResponse<TopicalMapResult>(topicalMapRaw);

  onProgress?.({
    step: "topical_map",
    status: "completed",
    message: `Topical Map générée: ${topicalMap.nodes.length} nodes, ${topicalMap.edges.length} edges`,
    data: topicalMap,
  });

  return {
    haloscanData,
    knowledgeDomain,
    contextVector,
    eavModel,
    topicalMap,
  };
}

// ===========================================
// STEP-BY-STEP GENERATION (for UI control)
// ===========================================

export async function fetchHaloscanData(keyword: string): Promise<HaloscanDataInput> {
  const [fullAnalysis, structure] = await Promise.all([
    getFullKeywordAnalysis(keyword),
    generateTopicalStructure(keyword, {
      granularity: 0.25,
      maxKeywords: 500,
    }),
  ]);

  return {
    seedKeyword: keyword,
    metrics: fullAnalysis.metrics
      ? {
          volume: fullAnalysis.metrics.volume,
          kgr: fullAnalysis.metrics.kgr,
          allintitle: fullAnalysis.metrics.allintitle_count,
        }
      : undefined,
    similarKeywords: fullAnalysis.similarKeywords,
    matchingKeywords: fullAnalysis.matchingKeywords,
    relatedKeywords: fullAnalysis.relatedKeywords,
    questions: fullAnalysis.questions,
    clusters: structure.clusters,
    topSites: fullAnalysis.topSites,
    serp: fullAnalysis.serp?.results?.serp,
  };
}

export async function generateKnowledgeDomain(
  project: Project,
  haloscanData: HaloscanDataInput
): Promise<KnowledgeDomainResult> {
  const prompt = getKnowledgeDomainPrompt(project, haloscanData);
  const raw = await callOpenRouter(prompt, SYSTEM_PROMPT);
  return parseJSONResponse<KnowledgeDomainResult>(raw);
}

export async function generateContextVector(
  project: Project,
  knowledgeDomain: KnowledgeDomainResult,
  haloscanData: HaloscanDataInput
): Promise<ContextVectorResult> {
  const prompt = getContextVectorPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    haloscanData
  );
  const raw = await callOpenRouter(prompt, SYSTEM_PROMPT);
  return parseJSONResponse<ContextVectorResult>(raw);
}

export async function generateEAVModel(
  project: Project,
  knowledgeDomain: KnowledgeDomainResult,
  contextVector: ContextVectorResult,
  haloscanData: HaloscanDataInput
): Promise<EAVModelResult> {
  const prompt = getEAVModelPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2),
    haloscanData
  );
  const raw = await callOpenRouter(prompt, SYSTEM_PROMPT);
  return parseJSONResponse<EAVModelResult>(raw);
}

export async function generateTopicalMapFromEAV(
  project: Project,
  knowledgeDomain: KnowledgeDomainResult,
  contextVector: ContextVectorResult,
  eavModel: EAVModelResult,
  haloscanData: HaloscanDataInput
): Promise<TopicalMapResult> {
  const prompt = getTopicalMapPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2),
    JSON.stringify(eavModel, null, 2),
    haloscanData
  );
  const raw = await callOpenRouter(prompt, SYSTEM_PROMPT);
  return parseJSONResponse<TopicalMapResult>(raw);
}
