# Session Notes - Topical Map SaaS

**Dernière mise à jour**: 31 janvier 2026

---

## Contexte du Projet

**Objectif**: SaaS de création de Topical Maps basées sur le Semantic SEO pour déployer du contenu optimisé sur WordPress.

**Stack**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4 + Shadcn/ui
- React Flow pour visualisation
- Zustand pour state management
- OpenRouter API (Claude Sonnet 4.5)
- Haloscan API (keyword research)

---

## Ce qui a été fait

### 1. Infrastructure de base
- Projet Next.js initialisé avec toutes les dépendances
- Structure de dossiers créée selon le workflow Semantic SEO
- Types TypeScript définis (`src/types/index.ts`)

### 2. Intégration Haloscan (COMPLET)
**Fichiers**:
- `src/lib/haloscan/client.ts` - Client API complet (14 endpoints)
- `src/lib/haloscan/types.ts` - Types TypeScript
- `src/lib/haloscan/index.ts` - Exports
- `src/app/api/haloscan/route.ts` - Route API test

**Endpoints disponibles**:
- `/keywords/overview` - Métriques complètes d'un mot-clé
- `/keywords/match` - Keywords contenant le seed
- `/keywords/similar` - Keywords similaires (SERP)
- `/keywords/highlights` - Combinaison match + similar
- `/keywords/related` - Recherches associées Google
- `/keywords/synonyms` - Synonymes
- `/keywords/questions` - PAA (People Also Ask)
- `/keywords/siteStructure` - Clustering hiérarchique
- `/keywords/bulk` - Métriques en masse
- `/keywords/find` - Recherche multi-stratégies
- `/keywords/serp/compare` - Comparaison SERP historique
- `/keywords/serp/availableDates` - Dates SERP disponibles
- `/keywords/scrap` - Refresh de keywords

### 3. Intégration OpenRouter/Claude (COMPLET)
**Fichiers**:
- `src/lib/openrouter/client.ts` - Client API OpenRouter
- `src/lib/openrouter/prompts.ts` - Prompts avec injection Haloscan
- `src/lib/openrouter/index.ts` - Exports

**Prompts créés**:
1. `getKnowledgeDomainPrompt()` - Génère Knowledge Domain
2. `getContextVectorPrompt()` - Génère Context Vector (vocabulaire, prédicats, 5W+H)
3. `getEAVModelPrompt()` - Génère Entity-Attribute-Value model
4. `getTopicalMapPrompt()` - Génère la Topical Map (nodes + edges)

**IMPORTANT**: Tous les prompts acceptent maintenant `HaloscanDataInput` pour injecter les données RÉELLES de keywords avant génération.

### 4. Service d'orchestration (COMPLET)
**Fichier**: `src/lib/services/topical-map-generator.ts`

**Fonctions**:
- `generateTopicalMap(project, onProgress)` - Pipeline complet
- `fetchHaloscanData(keyword)` - Récupère données Haloscan
- `generateKnowledgeDomain(project, haloscanData)` - Step-by-step
- `generateContextVector(project, knowledgeDomain, haloscanData)`
- `generateEAVModel(project, knowledgeDomain, contextVector, haloscanData)`
- `generateTopicalMapFromEAV(project, ..., haloscanData)`

### 5. API Route Generate (COMPLET)
**Fichier**: `src/app/api/generate/route.ts`

**Steps disponibles**:
- `haloscan` - Fetch données Haloscan uniquement
- `knowledge-domain` - Génère Knowledge Domain (+ fetch Haloscan auto)
- `context-vector` - Génère Context Vector
- `eav-model` - Génère EAV Model
- `topical-map` - Génère Topical Map
- `full` - Pipeline complet (redirige vers full-with-haloscan)
- `full-with-haloscan` - Pipeline complet avec données Haloscan

### 6. Composants React Flow (CRÉÉS)
**Fichiers dans** `src/components/topical-map/`:
- `pillar-node.tsx` - Node type Pillar
- `cluster-node.tsx` - Node type Cluster
- `supporting-node.tsx` - Node type Supporting
- `node-panel.tsx` - Panel d'édition de node
- `add-node-dialog.tsx` - Dialog pour ajouter un node
- `index.ts` - Exports

---

## Architecture du Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                               │
│         Entre: keyword principal + infos projet              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   HALOSCAN API                               │
│  • getFullKeywordAnalysis(keyword)                          │
│  • generateTopicalStructure(keyword)                         │
│                                                              │
│  Retourne:                                                   │
│  - Métriques (volume, KGR, CPC)                             │
│  - Keywords similaires + matching + related                  │
│  - Questions PAA                                             │
│  - Clusters sémantiques                                      │
│  - SERP actuel                                               │
│  - Top sites                                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              INJECTION DANS PROMPTS                          │
│                                                              │
│  Les données Haloscan sont formatées et injectées dans      │
│  chaque prompt pour que Claude travaille sur des            │
│  données RÉELLES, pas des suppositions.                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CLAUDE (via OpenRouter)                         │
│                                                              │
│  Step 1: Knowledge Domain                                    │
│    → sourceContext basé sur SERP réel                       │
│    → qualityParameters déduits des sites qui rankent        │
│    → boundaries définies par keywords similaires            │
│    → userExpectations extraites des PAA                     │
│                                                              │
│  Step 2: Context Vector                                      │
│    → vocabulary EXTRAIT des keywords Haloscan               │
│    → predicates TROUVÉS dans les requêtes réelles           │
│    → queryPatterns RÉELS                                    │
│    → fiveWHPatterns EXTRAITS des PAA                        │
│                                                              │
│  Step 3: EAV Model                                           │
│    → entities BASÉES sur clusters Haloscan                  │
│    → attributes = keywords à fort volume                    │
│    → relations DÉDUITES de la structure clusters            │
│                                                              │
│  Step 4: Topical Map                                         │
│    → Pillars = keywords fort volume                         │
│    → Clusters = catégories V1 Haloscan                      │
│    → Supporting = PAA + keywords bon KGR                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 TOPICAL MAP                                  │
│                                                              │
│  Structure JSON avec:                                        │
│  - nodes[] (pillar, cluster, supporting)                    │
│  - edges[] (hierarchical, contextual)                       │
│  - Chaque node a: keywords, volume, KGR, PAA questions     │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Variables d'environnement (.env.local)
```
OPENROUTER_API_KEY=sk-or-v1-xxxx
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
HALOSCAN_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxx
```

**Note**: .env.local est dans .gitignore, les clés ne sont PAS sur GitHub.

---

## Commits GitHub

1. `14791b3` - feat: Add Haloscan API client and OpenRouter integration
2. `071b534` - feat: Integrate Haloscan data into Claude prompts

**Repo**: https://github.com/Berguit/topical-map-app

---

## Prochaines étapes

### Priorité 1: Tester le pipeline complet
- [ ] Lancer `npm run dev`
- [ ] Tester POST `/api/generate` avec step `full-with-haloscan`
- [ ] Vérifier que les données Haloscan sont bien injectées
- [ ] Vérifier que Claude génère une Topical Map cohérente

### Priorité 2: Frontend
- [ ] Page de création de projet avec wizard
- [ ] Affichage des données Haloscan récupérées
- [ ] Visualisation de la progression (5 steps)
- [ ] Affichage React Flow de la Topical Map générée

### Priorité 3: Amélioration des prompts
- [ ] Tester avec différents keywords
- [ ] Ajuster les prompts si résultats insuffisants
- [ ] Ajouter validation des réponses JSON

### Priorité 4: Content Briefs
- [ ] Créer prompt pour générer un brief à partir d'un node
- [ ] Interface d'édition de brief
- [ ] Génération de contenu avec Claude

### Priorité 5: WordPress
- [ ] Intégration WordPress REST API
- [ ] Déploiement automatique des articles
- [ ] Gestion du maillage interne

---

## Types principaux (référence rapide)

```typescript
// Données Haloscan injectées dans les prompts
interface HaloscanDataInput {
  seedKeyword: string;
  metrics?: { volume: number; kgr: number; allintitle: number };
  similarKeywords?: HaloscanKeywordData[];
  matchingKeywords?: HaloscanKeywordData[];
  relatedKeywords?: HaloscanKeywordData[];
  questions?: HaloscanQuestionData[];
  clusters?: HaloscanClusterData[];
  topSites?: { domain: string; score: number }[];
  serp?: { position: number; url: string; title: string }[];
}

// Node de la Topical Map
interface TopicalMapNode {
  id: string;
  type: "pillar" | "cluster" | "supporting";
  title: string;
  description: string;
  intent: "informational" | "navigational" | "transactional" | "commercial";
  fiveWH: string[];
  keywords: { keyword: string; volume?: number; kgr?: number; isMain: boolean }[];
  paaQuestions: string[];
  position: { x: number; y: number };
}
```

---

## Commandes utiles

```bash
# Lancer le serveur de dev
npm --prefix "C:/Users/adrie/projects/topical-map-app" run dev

# Vérifier les erreurs TypeScript/ESLint
npm --prefix "C:/Users/adrie/projects/topical-map-app" run lint

# Build production
npm --prefix "C:/Users/adrie/projects/topical-map-app" run build

# Git status
git -C "C:/Users/adrie/projects/topical-map-app" status

# Git commit
git -C "C:/Users/adrie/projects/topical-map-app" add -A && git -C "C:/Users/adrie/projects/topical-map-app" commit -m "message"

# Git push
git -C "C:/Users/adrie/projects/topical-map-app" push
```

---

## Tests API (curl/Postman)

### Test Haloscan
```bash
POST http://localhost:3000/api/haloscan
{
  "keyword": "topical map seo",
  "action": "overview"
}
```

### Test Generate complet
```bash
POST http://localhost:3000/api/generate
{
  "project": {
    "id": "test-123",
    "name": "Test Project",
    "businessType": "E-commerce",
    "mainTopic": "chaussures de running",
    "audience": "Coureurs amateurs et professionnels",
    "objectives": ["Augmenter le trafic organique", "Générer des ventes"]
  },
  "step": "full-with-haloscan"
}
```

---

## Notes importantes

1. **Haloscan avant Claude**: C'est l'insight clé du user. On récupère TOUJOURS les données Haloscan AVANT d'appeler Claude pour que l'analyse soit basée sur des faits réels.

2. **KGR (Keyword Golden Ratio)**: Un KGR < 0.25 = opportunité facile à ranker. On les met en avant dans le prompt Topical Map pour les pages Supporting.

3. **Clusters Haloscan**: La structure V1/V2/V3 représente ce que Google reconnaît comme catégories sémantiques. On s'en sert pour définir les entités EAV et les clusters de la Topical Map.

4. **5W+H**: What, Who, Where, When, Why, How. Chaque page doit couvrir un ou plusieurs angles pour une couverture contextuelle complète.

5. **Pillar-Cluster model**:
   - Pillar = page principale (guide complet, fort volume)
   - Cluster = sous-thème (catégorie V1 Haloscan)
   - Supporting = page de détail (PAA, questions spécifiques, bon KGR)
