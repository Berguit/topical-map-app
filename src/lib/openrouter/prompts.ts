import type { Project } from "@/types";

export const SYSTEM_PROMPT = `Tu es un expert en Semantic SEO, spécialisé dans la création de Topical Maps et de Semantic Content Networks.

Tu connais parfaitement les concepts de:
- Knowledge Domain et Source Context
- Context Vector (vocabulaire, prédicats, patterns de requêtes)
- Entity-Attribute-Value (EAV) model
- Topical Authority et Knowledge-Based Trust
- Initial Ranking et Re-ranking
- Pillar-Cluster model

Tes réponses doivent être structurées en JSON valide.`;

export function getKnowledgeDomainPrompt(project: Project): string {
  return `Analyse cette thématique et génère un Knowledge Domain complet.

## Informations du projet
- **Nom**: ${project.name}
- **Type de business**: ${project.businessType}
- **Thématique principale**: ${project.mainTopic}
- **Audience cible**: ${project.audience}
- **Objectifs**: ${project.objectives.join(", ") || "Non spécifiés"}

## Ta tâche
Génère un Knowledge Domain avec:
1. **sourceContext**: Description du contexte source (2-3 phrases)
2. **qualityParameters**: 4-6 paramètres de qualité spécifiques à ce domaine (ce que Google attend)
3. **boundaries**: 3-5 frontières du domaine (ce qui est inclus/exclu)
4. **userExpectations**: 4-6 attentes utilisateur pour ce type de contenu

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

export function getContextVectorPrompt(project: Project, knowledgeDomain: string): string {
  return `Génère le Context Vector pour ce Knowledge Domain.

## Knowledge Domain
${knowledgeDomain}

## Informations du projet
- **Thématique**: ${project.mainTopic}
- **Audience**: ${project.audience}

## Ta tâche
Génère un Context Vector avec:
1. **vocabulary**: 15-20 termes clés du domaine (techniques, communs, jargon)
2. **predicates**: 8-10 verbes/prédicats importants avec leurs rôles sémantiques
3. **queryPatterns**: 6-8 patterns de requêtes typiques avec leur intent
4. **fiveWHPatterns**: Patterns 5W+H (What, Who, Where, When, Why, How)

## Format de réponse (JSON uniquement)
{
  "vocabulary": [
    {"term": "string", "category": "technical|common|jargon", "definition": "string"}
  ],
  "predicates": [
    {"verb": "string", "usage": "string", "semanticRoles": [{"role": "agent|patient|theme|instrument|location|time|result", "description": "string"}]}
  ],
  "queryPatterns": [
    {"pattern": "string", "intent": "informational|navigational|transactional|commercial", "examples": ["string"]}
  ],
  "fiveWHPatterns": [
    {"type": "what|who|where|when|why|how", "patterns": ["string"]}
  ]
}`;
}

export function getEAVModelPrompt(project: Project, knowledgeDomain: string, contextVector: string): string {
  return `Génère le modèle EAV (Entity-Attribute-Value) pour cette thématique.

## Knowledge Domain
${knowledgeDomain}

## Context Vector
${contextVector}

## Informations du projet
- **Thématique**: ${project.mainTopic}
- **Type business**: ${project.businessType}

## Ta tâche
Génère un modèle EAV avec:
1. **entities**: 5-8 entités principales du domaine
   - Pour chaque entité: nom, type, description, attributs clés (2-4), attributs standards (3-5)
   - Une entité doit être marquée comme "isMainEntity: true"
   - Les attributs clés = ce qui définit l'entité (prominent)
   - Les attributs standards = informations secondaires (popular)
2. **relations**: 6-10 relations entre entités

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
      "keyAttributes": [
        {"name": "string", "valueType": "text|number|date|boolean|list", "isKey": true, "description": "string"}
      ],
      "standardAttributes": [
        {"name": "string", "valueType": "text|number|date|boolean|list", "isKey": false, "description": "string"}
      ]
    }
  ],
  "relations": [
    {"sourceEntity": "string", "targetEntity": "string", "relationType": "is_a|part_of|has|belongs_to|related_to|uses|provides|requires", "description": "string"}
  ]
}`;
}

export function getTopicalMapPrompt(
  project: Project,
  knowledgeDomain: string,
  contextVector: string,
  eavModel: string
): string {
  return `Génère une Topical Map complète basée sur l'analyse sémantique.

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

## Ta tâche
Génère une Topical Map avec:
1. **1-2 Pillars**: Pages principales (guides complets)
2. **4-8 Clusters**: Pages secondaires par sous-thème
3. **6-12 Supporting**: Pages de support (questions spécifiques, comparaisons)

Pour chaque node, fournis:
- title: Titre de la page
- description: Ce que la page doit couvrir
- type: pillar, cluster, ou supporting
- intent: informational, navigational, transactional, ou commercial
- fiveWH: Quels angles 5W+H cette page couvre
- keywords: 2-4 mots-clés cibles
- paaQuestions: 2-4 questions PAA potentielles

## Règles importantes
- Chaque cluster doit être connecté à un pillar
- Les supporting peuvent être connectés à des clusters ou pillars
- Respecter la règle des 3 ponts contextuels minimum pour chaque expansion
- Couvrir les différents intents (informationnel, transactionnel, etc.)

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
      "keywords": [{"keyword": "string", "isMain": boolean}],
      "paaQuestions": ["string"]
    }
  ],
  "edges": [
    {"source": "nodeId", "target": "nodeId", "type": "hierarchical|contextual"}
  ]
}`;
}
