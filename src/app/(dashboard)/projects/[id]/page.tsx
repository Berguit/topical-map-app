"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjectStore, useHydration } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Map,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const hasHydrated = useHydration();
  const { projects, setCurrentProject, updateProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    const found = projects.find((p) => p.id === params.id);
    if (found) {
      setProject(found);
      setCurrentProject(found);
    }
  }, [params.id, projects, setCurrentProject, hasHydrated]);

  // Update local state when store changes
  useEffect(() => {
    if (!hasHydrated) return;

    const found = projects.find((p) => p.id === params.id);
    if (found) {
      setProject(found);
    }
  }, [projects, params.id, hasHydrated]);

  const handleGenerateAll = async () => {
    if (!project) return;

    setIsGenerating(true);
    setGenerationStep("Génération en cours... (4 étapes)");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, step: "full" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur de génération");
      }

      const data = await response.json();

      // Update project with all generated data
      updateProject(project.id, {
        knowledgeDomain: data.knowledgeDomain,
        contextVector: data.contextVector,
        eavModel: data.eavModel,
        topicalMap: data.topicalMap,
      });

      toast.success("Génération terminée !");
      setGenerationStep("");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur de génération");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasHydrated || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="py-16">
          <CardContent className="text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = {
    knowledgeDomain: !!project.knowledgeDomain,
    contextVector: !!project.contextVector,
    eavModel: !!project.eavModel,
    topicalMap: !!project.topicalMap && project.topicalMap.nodes.length > 0,
  };

  const completedSteps = Object.values(progress).filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/projects")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux projets
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.mainTopic}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {project.businessType}
          </Badge>
        </div>
      </div>

      {/* Progress & Generate */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Progression</CardTitle>
              <CardDescription>
                {completedSteps}/4 étapes complétées
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {generationStep}
                </>
              ) : completedSteps === 4 ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Régénérer tout
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer avec l'IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge
              variant={progress.knowledgeDomain ? "default" : "outline"}
              className="gap-1"
            >
              {progress.knowledgeDomain && (
                <CheckCircle className="h-3 w-3" />
              )}
              Knowledge Domain
            </Badge>
            <Badge
              variant={progress.contextVector ? "default" : "outline"}
              className="gap-1"
            >
              {progress.contextVector && <CheckCircle className="h-3 w-3" />}
              Context Vector
            </Badge>
            <Badge
              variant={progress.eavModel ? "default" : "outline"}
              className="gap-1"
            >
              {progress.eavModel && <CheckCircle className="h-3 w-3" />}
              EAV Model
            </Badge>
            <Badge
              variant={progress.topicalMap ? "default" : "outline"}
              className="gap-1"
            >
              {progress.topicalMap && <CheckCircle className="h-3 w-3" />}
              Topical Map
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Domain</TabsTrigger>
          <TabsTrigger value="context">Context Vector</TabsTrigger>
          <TabsTrigger value="eav">Modèle EAV</TabsTrigger>
          <TabsTrigger value="map">Topical Map</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Audience cible</p>
                  <p className="text-muted-foreground">{project.audience}</p>
                </div>
                {project.objectives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Objectifs</p>
                    <ul className="list-inside list-disc text-muted-foreground">
                      {project.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link href={`/projects/${project.id}/topical-map`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Map className="mr-2 h-4 w-4" />
                    Voir la Topical Map
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/content`}>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer le contenu
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/deploy`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Déployer sur WordPress
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Domain</CardTitle>
              <CardDescription>
                Domaine de connaissance et paramètres de qualité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.knowledgeDomain ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Source Context</h4>
                    <p className="text-muted-foreground">
                      {project.knowledgeDomain.sourceContext}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Paramètres de qualité</h4>
                    <div className="grid gap-2">
                      {project.knowledgeDomain.qualityParameters.map((param, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Badge variant={
                            param.importance === "critical" ? "destructive" :
                            param.importance === "high" ? "default" : "secondary"
                          }>
                            {param.importance}
                          </Badge>
                          <div>
                            <p className="font-medium">{param.name}</p>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Frontières du domaine</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {project.knowledgeDomain.boundaries.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Attentes utilisateur</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {project.knowledgeDomain.userExpectations.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Le Knowledge Domain n'a pas encore été généré
                  </p>
                  <Button onClick={handleGenerateAll} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer avec l'IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle>Context Vector</CardTitle>
              <CardDescription>
                Vocabulaire, prédicats et patterns du domaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.contextVector ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Vocabulaire ({project.contextVector.vocabulary.length} termes)</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.contextVector.vocabulary.map((term, i) => (
                        <Badge key={i} variant={
                          term.category === "technical" ? "default" :
                          term.category === "jargon" ? "secondary" : "outline"
                        } title={term.definition}>
                          {term.term}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Prédicats ({project.contextVector.predicates.length})</h4>
                    <div className="grid gap-2">
                      {project.contextVector.predicates.map((pred, i) => (
                        <div key={i} className="p-2 bg-muted rounded">
                          <span className="font-medium">{pred.verb}</span>
                          <span className="text-muted-foreground ml-2">— {pred.usage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Patterns de requêtes ({project.contextVector.queryPatterns.length})</h4>
                    <div className="grid gap-2">
                      {project.contextVector.queryPatterns.map((qp, i) => (
                        <div key={i} className="p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{qp.pattern}</span>
                            <Badge variant="outline">{qp.intent}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ex: {qp.examples.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Patterns 5W+H</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {project.contextVector.fiveWHPatterns.map((fwh, i) => (
                        <div key={i} className="p-2 bg-muted rounded">
                          <Badge className="mb-2">{fwh.type.toUpperCase()}</Badge>
                          <ul className="text-sm text-muted-foreground">
                            {fwh.patterns.map((p, j) => (
                              <li key={j}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Le Context Vector n'a pas encore été généré
                  </p>
                  <Button onClick={handleGenerateAll} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer avec l'IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eav">
          <Card>
            <CardHeader>
              <CardTitle>Modèle EAV</CardTitle>
              <CardDescription>
                Entités, Attributs et Relations du domaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.eavModel ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Entités ({project.eavModel.entities.length})</h4>
                    <div className="grid gap-4">
                      {project.eavModel.entities.map((entity, i) => (
                        <Card key={i} className={entity.isMainEntity ? "border-primary" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{entity.name}</CardTitle>
                              <Badge variant="outline">{entity.type}</Badge>
                              {entity.isMainEntity && <Badge>Principal</Badge>}
                            </div>
                            <CardDescription>{entity.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium mb-1">Attributs clés</p>
                                <div className="flex flex-wrap gap-1">
                                  {entity.keyAttributes.map((attr, j) => (
                                    <Badge key={j} variant="default" className="text-xs">
                                      {attr.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Attributs standards</p>
                                <div className="flex flex-wrap gap-1">
                                  {entity.standardAttributes.map((attr, j) => (
                                    <Badge key={j} variant="secondary" className="text-xs">
                                      {attr.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Relations ({project.eavModel.relations.length})</h4>
                    <div className="grid gap-2">
                      {project.eavModel.relations.map((rel, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{rel.sourceEntityId}</span>
                          <Badge variant="outline">{rel.relationType}</Badge>
                          <span className="font-medium">{rel.targetEntityId}</span>
                          {rel.description && (
                            <span className="text-muted-foreground ml-2">— {rel.description}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Le modèle EAV n'a pas encore été généré
                  </p>
                  <Button onClick={handleGenerateAll} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer avec l'IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Topical Map</CardTitle>
                  <CardDescription>
                    Visualisation du réseau de contenu
                  </CardDescription>
                </div>
                <Link href={`/projects/${project.id}/topical-map`}>
                  <Button>
                    <Map className="mr-2 h-4 w-4" />
                    Ouvrir l'éditeur
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {project.topicalMap && project.topicalMap.nodes.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {project.topicalMap.nodes.filter((n) => n.type === "pillar").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pillars</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {project.topicalMap.nodes.filter((n) => n.type === "cluster").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Clusters</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {project.topicalMap.nodes.filter((n) => n.type === "supporting").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Supporting</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Pages générées</h4>
                    <div className="grid gap-2">
                      {project.topicalMap.nodes.map((node, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Badge variant={
                            node.type === "pillar" ? "default" :
                            node.type === "cluster" ? "secondary" : "outline"
                          }>
                            {node.type}
                          </Badge>
                          <span className="font-medium">{node.title}</span>
                          <Badge variant="outline" className="ml-auto">{node.intent}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    La Topical Map est vide
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={handleGenerateAll} disabled={isGenerating}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer avec l'IA
                    </Button>
                    <Link href={`/projects/${project.id}/topical-map`}>
                      <Button variant="outline">
                        <Map className="mr-2 h-4 w-4" />
                        Créer manuellement
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
