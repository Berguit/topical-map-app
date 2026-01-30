// ===========================================
// TYPES PRINCIPAUX - TOPICAL MAP SAAS
// ===========================================

// --- Project ---
export interface Project {
  id: string;
  name: string;
  businessType: BusinessType;
  audience: string;
  mainTopic: string;
  objectives: string[];
  knowledgeDomain?: KnowledgeDomain;
  contextVector?: ContextVector;
  eavModel?: EAVModel;
  topicalMap?: TopicalMap;
  createdAt: Date;
  updatedAt: Date;
}

export type BusinessType =
  | 'ecommerce'
  | 'saas'
  | 'affiliate'
  | 'blog'
  | 'agency'
  | 'local_business'
  | 'other';

// --- Knowledge Domain ---
export interface KnowledgeDomain {
  id: string;
  projectId: string;
  name: string;
  sourceContext: string;
  qualityParameters: QualityParameter[];
  boundaries: string[];
  userExpectations: string[];
}

export interface QualityParameter {
  name: string;
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

// --- Context Vector ---
export interface ContextVector {
  id: string;
  projectId: string;
  vocabulary: VocabularyTerm[];
  predicates: Predicate[];
  queryPatterns: QueryPattern[];
  fiveWHPatterns: FiveWHPattern[];
}

export interface VocabularyTerm {
  term: string;
  category: 'technical' | 'common' | 'jargon';
  definition?: string;
}

export interface Predicate {
  verb: string;
  usage: string;
  semanticRoles: SemanticRole[];
}

export interface SemanticRole {
  role: 'agent' | 'patient' | 'theme' | 'instrument' | 'location' | 'time' | 'result';
  description: string;
}

export interface QueryPattern {
  pattern: string;
  intent: SearchIntent;
  examples: string[];
}

export type SearchIntent =
  | 'informational'
  | 'navigational'
  | 'transactional'
  | 'commercial';

export interface FiveWHPattern {
  type: 'what' | 'who' | 'where' | 'when' | 'why' | 'how';
  patterns: string[];
}

// --- EAV Model ---
export interface EAVModel {
  id: string;
  projectId: string;
  entities: Entity[];
  relations: EntityRelation[];
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  keyAttributes: Attribute[];
  standardAttributes: Attribute[];
  isMainEntity: boolean;
}

export type EntityType =
  | 'person'
  | 'organization'
  | 'product'
  | 'service'
  | 'concept'
  | 'location'
  | 'event'
  | 'other';

export interface Attribute {
  id: string;
  name: string;
  valueType: 'text' | 'number' | 'date' | 'boolean' | 'list';
  isKey: boolean; // Key vs Standard attribute
  values?: string[];
  description?: string;
}

export interface EntityRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: RelationType;
  description?: string;
}

export type RelationType =
  | 'is_a'
  | 'part_of'
  | 'has'
  | 'belongs_to'
  | 'related_to'
  | 'uses'
  | 'provides'
  | 'requires';

// --- Topical Map ---
export interface TopicalMap {
  id: string;
  projectId: string;
  nodes: TopicalMapNode[];
  edges: TopicalMapEdge[];
}

export interface TopicalMapNode {
  id: string;
  type: 'pillar' | 'cluster' | 'supporting';
  title: string;
  description: string;
  entityId?: string;
  intent: SearchIntent;
  fiveWH?: ('what' | 'who' | 'where' | 'when' | 'why' | 'how')[];
  keywords: Keyword[];
  paaQuestions: string[];
  contentBrief?: ContentBrief;
  content?: Content;
  position: { x: number; y: number };
}

export interface TopicalMapEdge {
  id: string;
  source: string;
  target: string;
  type: 'hierarchical' | 'contextual' | 'related';
}

export interface Keyword {
  keyword: string;
  volume?: number;
  difficulty?: number;
  isMain: boolean;
  source: 'haloscan' | 'manual' | 'generated';
}

// --- Content Brief ---
export interface ContentBrief {
  id: string;
  nodeId: string;
  title: string;
  metaDescription: string;
  h1: string;
  structure: ContentStructure[];
  targetKeywords: Keyword[];
  entitiesToMention: string[];
  internalLinks: InternalLink[];
  wordCountTarget: number;
  uniqueAngle: string;
}

export interface ContentStructure {
  level: 'h2' | 'h3' | 'h4';
  text: string;
  keywords?: string[];
  notes?: string;
}

export interface InternalLink {
  targetNodeId: string;
  anchorText: string;
  context: string;
}

// --- Content ---
export interface Content {
  id: string;
  nodeId: string;
  briefId: string;
  title: string;
  htmlContent: string;
  status: ContentStatus;
  wordCount: number;
  seoScore?: number;
  publishedUrl?: string;
  wordpressPostId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published';

// --- WordPress Integration ---
export interface WordPressConfig {
  id: string;
  projectId: string;
  siteUrl: string;
  username: string;
  applicationPassword: string;
  defaultCategory?: number;
  defaultAuthor?: number;
}

// --- Haloscan Integration ---
export interface HaloscanKeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc?: number;
  trend?: number[];
}

export interface HaloscanCluster {
  name: string;
  keywords: HaloscanKeywordData[];
  totalVolume: number;
}

export interface HaloscanPAA {
  question: string;
  relatedKeyword: string;
}
