import type { Project } from "@/types";

// ===========================================
// TYPES FOR HALOSCAN DATA INJECTION
// ===========================================

export interface HaloscanKeywordData {
  keyword: string;
  volume: number | "NA";
  cpc: number | "NA";
  competition: number | "NA";
  kgr: number | "NA";
  allintitle: number | "NA";
}

export interface HaloscanQuestionData {
  keyword: string;
  question_type: string;
  volume: number | "NA";
  depth: number;
}

export interface HaloscanClusterData {
  article: string;
  keyword: string;
  volume: number | "NA";
  V1: string;
  V2: string;
  V3: string;
}

export interface HaloscanDataInput {
  seedKeyword: string;
  metrics?: {
    volume: number;
    kgr: number;
    allintitle: number;
  };
  similarKeywords?: HaloscanKeywordData[];
  matchingKeywords?: HaloscanKeywordData[];
  relatedKeywords?: HaloscanKeywordData[];
  questions?: HaloscanQuestionData[];
  clusters?: HaloscanClusterData[];
  topSites?: { domain: string; score: number }[];
  serp?: { position: number; url: string; title: string }[];
}

// ===========================================
// HELPER: FORMAT HALOSCAN DATA FOR PROMPTS
// ===========================================

function formatKeywordList(keywords: HaloscanKeywordData[], limit = 20): string {
  if (!keywords?.length) return "Aucune donnée disponible";

  return keywords
    .slice(0, limit)
    .map(k => `- "${k.keyword}" (vol: ${k.volume}, KGR: ${k.kgr}, CPC: ${k.cpc})`)
    .join("\n");
}

function formatQuestionsList(questions: HaloscanQuestionData[], limit = 15): string {
  if (!questions?.length) return "Aucune donnée disponible";

  return questions
    .slice(0, limit)
    .map(q => `- [${q.question_type}] "${q.keyword}" (vol: ${q.volume})`)
    .join("\n");
}

function formatClustersList(clusters: HaloscanClusterData[], limit = 30): string {
  if (!clusters?.length) return "Aucune donnée disponible";

  // Group by V1 (top-level category)
  const grouped = clusters.reduce((acc, c) => {
    const key = c.V1 || "Autres";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<string, HaloscanClusterData[]>);

  return Object.entries(grouped)
    .slice(0, 10)
    .map(([category, items]) => {
      const topItems = items.slice(0, 5).map(i => `    - "${i.keyword}" (vol: ${i.volume})`).join("\n");
      return `**${category}**:\n${topItems}`;
    })
    .join("\n\n");
}

function formatSerpList(serp: { position: number; url: string; title: string }[]): string {
  if (!serp?.length) return "Aucune donnée disponible";

  return serp
    .slice(0, 10)
    .map(s => `${s.position}. ${s.title}\n   ${s.url}`)
    .join("\n");
}

// ===========================================
// SYSTEM PROMPT
// ===========================================

export const SYSTEM_PROMPT = `Tu es un expert en Semantic SEO, spécialisé dans la création de Topical Maps et de Semantic Content Networks.

Tu connais parfaitement les concepts de:
- Knowledge Domain et Source Context
- Context Vector (vocabulaire, prédicats, patterns de requêtes)
- Entity-Attribute-Value (EAV) model
- Topical Authority et Knowledge-Based Trust
- Initial Ranking et Re-ranking
- Pillar-Cluster model

**IMPORTANT**: Tu analyses des données RÉELLES de mots-clés issues de l'API Haloscan. Ces données incluent:
- Volume de recherche mensuel
- KGR (Keyword Golden Ratio) - ratio allintitle/volume, < 0.25 = opportunité
- CPC (Cost Per Click) - indicateur de valeur commerciale
- PAA (People Also Ask) - vraies questions des utilisateurs
- Clusters sémantiques - regroupements basés sur la similarité SERP

Utilise ces données pour prendre des décisions BASÉES SUR LES FAITS, pas sur des suppositions.

Tes réponses doivent être structurées en JSON valide.`;

// ===========================================
// KNOWLEDGE DOMAIN PROMPT
// ===========================================

export function getKnowledgeDomainPrompt(
  project: Project,
  haloscanData?: HaloscanDataInput
): string {
  const haloscanSection = haloscanData ? `
## Données Haloscan (ANALYSE RÉELLE)

### Mot-clé principal: "${haloscanData.seedKeyword}"
${haloscanData.metrics ? `
- Volume mensuel: ${haloscanData.metrics.volume}
- KGR: ${haloscanData.metrics.kgr}
- Allintitle: ${haloscanData.metrics.allintitle}
` : ""}

### Top Sites positionnés sur ce sujet
${formatSerpList(haloscanData.serp || [])}

### Mots-clés similaires (même SERP)
${formatKeywordList(haloscanData.similarKeywords || [])}

### Mots-clés connexes (recherches associées)
${formatKeywordList(haloscanData.relatedKeywords || [])}

### Questions PAA (People Also Ask)
${formatQuestionsList(haloscanData.questions || [])}
` : "";

  return `Analyse cette thématique et génère un Knowledge Domain complet BASÉ SUR LES DONNÉES RÉELLES.

## Informations du projet
- **Nom**: ${project.name}
- **Type de business**: ${project.businessType}
- **Thématique principale**: ${project.mainTopic}
- **Audience cible**: ${project.audience}
- **Objectifs**: ${project.objectives.join(", ") || "Non spécifiés"}
${haloscanSection}
## Ta tâche
En utilisant les données Haloscan ci-dessus, génère un Knowledge Domain avec:

1. **sourceContext**: Description du contexte source (2-3 phrases) - BASÉ sur ce que montrent les SERPs et les types de sites positionnés

2. **qualityParameters**: 4-6 paramètres de qualité spécifiques - DÉDUITS des sites qui rankent déjà (type de contenu, niveau d'expertise attendu)

3. **boundaries**: 3-5 frontières du domaine - DÉFINIES par les keywords similaires vs ce qui n'apparaît PAS

4. **userExpectations**: 4-6 attentes utilisateur - EXTRAITES des questions PAA et des patterns de recherche

## Format de réponse (JSON uniquement)
{
  "sourceContext": "string",
  "qualityParameters": [
    {"name": "string", "description": "string", "importance": "critical|high|medium|low"}
  ],
  "boundaries": ["string"],
  "userExpectations": ["string"]
}`;
}

// ===========================================
// CONTEXT VECTOR PROMPT
// ===========================================

export function getContextVectorPrompt(
  project: Project,
  knowledgeDomain: string,
  haloscanData?: HaloscanDataInput
): string {
  const haloscanSection = haloscanData ? `
## Données Haloscan (VOCABULAIRE RÉEL DU MARCHÉ)

### Mot-clé seed: "${haloscanData.seedKeyword}"

### Mots-clés qui matchent (contiennent le seed)
Ces mots-clés RÉELS révèlent le vocabulaire utilisé par les chercheurs:
${formatKeywordList(haloscanData.matchingKeywords || [], 25)}

### Mots-clés similaires (même intention de recherche)
${formatKeywordList(haloscanData.similarKeywords || [], 20)}

### Questions PAA - Révèlent les préoccupations RÉELLES
${formatQuestionsList(haloscanData.questions || [], 20)}

### Mots-clés connexes (associations Google)
${formatKeywordList(haloscanData.relatedKeywords || [], 15)}
` : "";

  return `Génère le Context Vector pour ce Knowledge Domain EN UTILISANT LE VOCABULAIRE RÉEL.

## Knowledge Domain
${knowledgeDomain}

## Informations du projet
- **Thématique**: ${project.mainTopic}
- **Audience**: ${project.audience}
${haloscanSection}
## Ta tâche
**IMPORTANT**: Le vocabulaire, les prédicats et les patterns doivent être EXTRAITS des données Haloscan réelles ci-dessus, PAS inventés.

Génère un Context Vector avec:

1. **vocabulary**: 15-20 termes clés EXTRAITS des keywords Haloscan
   - Identifie les termes techniques, communs et le jargon
   - Priorise les termes à fort volume

2. **predicates**: 8-10 verbes/prédicats TROUVÉS dans les requêtes réelles
   - Exemple: si "comment choisir X" apparaît → prédicat "choisir"

3. **queryPatterns**: 6-8 patterns RÉELS trouvés dans les keywords
   - Utilise les structures des vraies requêtes

4. **fiveWHPatterns**: Patterns 5W+H EXTRAITS des questions PAA
   - What/Quoi, Who/Qui, Where/Où, When/Quand, Why/Pourquoi, How/Comment

## Format de réponse (JSON uniquement)
{
  "vocabulary": [
    {"term": "string", "category": "technical|common|jargon", "definition": "string", "searchVolume": number}
  ],
  "predicates": [
    {"verb": "string", "usage": "string", "foundInQueries": ["string"], "semanticRoles": [{"role": "agent|patient|theme|instrument|location|time|result", "description": "string"}]}
  ],
  "queryPatterns": [
    {"pattern": "string", "intent": "informational|navigational|transactional|commercial", "examples": ["string"], "totalVolume": number}
  ],
  "fiveWHPatterns": [
    {"type": "what|who|where|when|why|how", "patterns": ["string"], "paaExamples": ["string"]}
  ]
}`;
}

// ===========================================
// EAV MODEL PROMPT
// ===========================================

export function getEAVModelPrompt(
  project: Project,
  knowledgeDomain: string,
  contextVector: string,
  haloscanData?: HaloscanDataInput
): string {
  const haloscanSection = haloscanData ? `
## Données Haloscan (ENTITÉS RÉELLES DU MARCHÉ)

### Clusters sémantiques détectés par Haloscan
Ces clusters représentent les VRAIES catégories que Google reconnaît:
${formatClustersList(haloscanData.clusters || [])}

### Top Sites (révèlent les types d'entités qui rankent)
${haloscanData.topSites?.slice(0, 10).map(s => `- ${s.domain} (score: ${s.score})`).join("\n") || "Non disponible"}

### Mots-clés par volume (révèlent les attributs importants)
${formatKeywordList(haloscanData.similarKeywords || [], 15)}
` : "";

  return `Génère le modèle EAV (Entity-Attribute-Value) BASÉ SUR LES CLUSTERS RÉELS.

## Knowledge Domain
${knowledgeDomain}

## Context Vector
${contextVector}

## Informations du projet
- **Thématique**: ${project.mainTopic}
- **Type business**: ${project.businessType}
${haloscanSection}
## Ta tâche
**IMPORTANT**: Les entités doivent correspondre aux CLUSTERS détectés par Haloscan. Les attributs doivent refléter les KEYWORDS réels.

Génère un modèle EAV avec:

1. **entities**: 5-8 entités BASÉES sur les clusters Haloscan
   - Utilise les catégories V1/V2 des clusters comme guide
   - Les attributs clés = keywords à fort volume (prominent)
   - Les attributs standards = keywords secondaires (popular)
   - Une entité = "isMainEntity: true" (le seed keyword)

2. **relations**: 6-10 relations DÉDUITES de la structure des clusters

## Types d'entités possibles
person, organization, product, service, concept, location, event, other

## Types de relations possibles
is_a, part_of, has, belongs_to, related_to, uses, provides, requires

## Format de réponse (JSON uniquement)
{
  "entities": [
    {
      "name": "string",
      "type": "person|organization|product|service|concept|location|event|other",
      "description": "string",
      "isMainEntity": boolean,
      "basedOnCluster": "string (nom du cluster Haloscan)",
      "keyAttributes": [
        {"name": "string", "valueType": "text|number|date|boolean|list", "isKey": true, "description": "string", "relatedKeywords": ["string"]}
      ],
      "standardAttributes": [
        {"name": "string", "valueType": "text|number|date|boolean|list", "isKey": false, "description": "string", "relatedKeywords": ["string"]}
      ]
    }
  ],
  "relations": [
    {"sourceEntity": "string", "targetEntity": "string", "relationType": "is_a|part_of|has|belongs_to|related_to|uses|provides|requires", "description": "string"}
  ]
}`;
}

// ===========================================
// TOPICAL MAP PROMPT
// ===========================================

export function getTopicalMapPrompt(
  project: Project,
  knowledgeDomain: string,
  contextVector: string,
  eavModel: string,
  haloscanData?: HaloscanDataInput
): string {
  const haloscanSection = haloscanData ? `
## Données Haloscan (STRUCTURE RÉELLE À SUIVRE)

### Structure de clusters Haloscan
Cette structure représente l'organisation OPTIMALE selon Google:
${formatClustersList(haloscanData.clusters || [])}

### Questions PAA (à couvrir dans les pages)
${formatQuestionsList(haloscanData.questions || [], 25)}

### Keywords par opportunité (KGR < 0.25 = facile à ranker)
${haloscanData.similarKeywords
  ?.filter(k => typeof k.kgr === "number" && k.kgr < 0.25)
  .slice(0, 15)
  .map(k => `- "${k.keyword}" (vol: ${k.volume}, KGR: ${k.kgr}) ⭐ OPPORTUNITÉ`)
  .join("\n") || "Aucune opportunité KGR détectée"}

### Keywords à fort volume (pour les Pillars)
${haloscanData.similarKeywords
  ?.filter(k => typeof k.volume === "number" && k.volume > 500)
  .slice(0, 10)
  .map(k => `- "${k.keyword}" (vol: ${k.volume})`)
  .join("\n") || "Pas assez de données volume"}
` : "";

  return `Génère une Topical Map BASÉE SUR LA STRUCTURE HALOSCAN.

## Knowledge Domain
${knowledgeDomain}

## Context Vector
${contextVector}

## Modèle EAV
${eavModel}

## Informations du projet
- **Thématique**: ${project.mainTopic}
- **Audience**: ${project.audience}
- **Objectifs**: ${project.objectives.join(", ") || "Non spécifiés"}
${haloscanSection}
## Ta tâche
**CRITIQUE**: La structure de ta Topical Map doit REFLÉTER les clusters Haloscan. Ne crée PAS une structure arbitraire.

Génère une Topical Map avec:

1. **Pillars (1-2)**: Basés sur les keywords à FORT VOLUME
   - Titre = reformulation du seed ou du cluster principal
   - Couvre les questions PAA principales

2. **Clusters (4-8)**: Correspondent aux catégories V1 de Haloscan
   - Chaque cluster = une catégorie Haloscan
   - Keywords = ceux du cluster correspondant

3. **Supporting (6-12)**: Pages de détail
   - Répondent aux questions PAA spécifiques
   - Ciblent les keywords à BON KGR (< 0.25)
   - Couvrent les angles 5W+H

## Règles de maillage
- Chaque cluster → connecté à son pillar parent
- Supporting → connecté à son cluster parent
- 3 ponts contextuels minimum pour justifier une connexion

## Format de réponse (JSON uniquement)
{
  "nodes": [
    {
      "id": "string (unique)",
      "type": "pillar|cluster|supporting",
      "title": "string",
      "description": "string",
      "intent": "informational|navigational|transactional|commercial",
      "fiveWH": ["what", "who", "where", "when", "why", "how"],
      "keywords": [{"keyword": "string", "volume": number, "kgr": number|null, "isMain": boolean}],
      "paaQuestions": ["string"],
      "basedOnHaloscanCluster": "string|null"
    }
  ],
  "edges": [
    {"source": "nodeId", "target": "nodeId", "type": "hierarchical|contextual"}
  ]
}`;
}
