# Topical Map App - SaaS

## Objectif
SaaS de création de Topical Maps basées sur le Semantic SEO pour déployer du contenu optimisé sur WordPress.

## Stack Technique
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/ui
- **Visualisation**: React Flow (@xyflow/react)
- **State**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod
- **Database**: PostgreSQL (Supabase) - à configurer
- **Auth**: Supabase Auth - à configurer

## Intégrations Externes
- **Haloscan API**: Keywords, clusters, PAA
- **Claude API**: Génération de contenu
- **WordPress REST API**: Déploiement

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   └── login/
│   ├── (dashboard)/         # Pages protégées
│   │   └── projects/
│   │       └── [id]/
│   │           ├── topical-map/   # Visualisation Topical Map
│   │           ├── content/       # Éditeur de contenu
│   │           └── deploy/        # Déploiement WordPress
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Composants Shadcn
│   ├── topical-map/         # Composants Topical Map
│   ├── onboarding/          # Wizard d'onboarding
│   ├── editor/              # Éditeur de contenu
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # Utilitaires API
│   ├── haloscan/            # Intégration Haloscan
│   ├── wordpress/           # Intégration WordPress
│   └── claude/              # Intégration Claude
├── stores/                  # Zustand stores
├── types/                   # Types TypeScript
└── hooks/                   # Custom hooks
```

## Workflow du SaaS (7 Phases)

```
PHASE 0: Onboarding Client
    ↓ (Type business, audience, thématique, objectifs)
PHASE 1: Knowledge Domain
    ↓ (Source Context, paramètres qualité, frontières)
PHASE 2: Context Vector
    ↓ (Vocabulaire, prédicats, patterns requêtes, 5W+H)
PHASE 3: Modèle EAV
    ↓ (Entités, Key/Standard Attributes, Relations)
PHASE 4: Topical Map
    ↓ (Hierarchy, 5W+H, Intents, Expansion 3 stratégies)
PHASE 5: Semantic Content Network
    ↓ (Pillar, Clusters, Briefs, Maillage)
PHASE 6: Déploiement WordPress
    ↓ (Structure, Templates, Contenu, SEO)
PHASE 7: Monitoring & Expansion
```

## Concepts Clés Semantic SEO

### Hiérarchie
1. **Knowledge Domain** - Domaine avec paramètres de qualité spécifiques
2. **Context Vector** - Terminologie et patterns du domaine
3. **EAV Model** - Entity-Attribute-Value
4. **Topical Map** - Organisation hiérarchique
5. **Semantic Content Network** - Pillar + Clusters + Maillage
6. **Topical Authority** - État de ranking positif

### Distinctions Importantes
| Concept A | Concept B | Différence |
|-----------|-----------|------------|
| Popular | Prominent | Volume vs Pertinence contextuelle |
| Key Attributes | Standard Attributes | Central vs Secondaire |
| Topical Coverage | Contextual Coverage | Quoi vs Angles |

### Règles
- **3 ponts contextuels minimum** pour justifier une expansion
- **Max 100-150 liens** par page
- **Pillar-Cluster model** pour structure
- **5W+H** (What, Who, Where, When, Why, How) pour couverture

## MVP V1 - Fonctionnalités

### Phase 1: Onboarding & Topical Map
- [ ] Wizard d'onboarding (type business, audience, thématique)
- [ ] Intégration Haloscan pour keywords/PAA
- [ ] Génération Knowledge Domain
- [ ] Génération Context Vector
- [ ] Génération modèle EAV
- [ ] Visualisation Topical Map (React Flow)

### Phase 2: Content Briefs & Rédaction
- [ ] Génération Content Briefs
- [ ] Éditeur de contenu
- [ ] Intégration Claude pour génération/assistance
- [ ] Validation SEO du contenu

### Phase 3: Déploiement
- [ ] Configuration WordPress
- [ ] Déploiement automatique
- [ ] Gestion du maillage interne

## Commandes

```bash
npm run dev      # Lancer en développement
npm run build    # Build production
npm run lint     # Linter
```

## Documentation de Référence
Voir le repo `topical-map-saas` pour:
- `/research` - Analyses détaillées des articles de Koray Gübür
- `/specs/PROCESS-COMPLET.md` - Workflow complet et détaillé

## Notes de Session

### 30 janvier 2026
- Initialisation du projet Next.js 14
- Configuration Tailwind CSS v4 + Shadcn/ui
- Installation React Flow, Zustand, React Query
- Création de la structure de dossiers
