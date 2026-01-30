"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjectStore } from "@/stores/project-store";
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
  Settings,
  Sparkles,
} from "lucide-react";
import type { Project } from "@/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, setCurrentProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const found = projects.find((p) => p.id === params.id);
    if (found) {
      setProject(found);
      setCurrentProject(found);
    }
  }, [params.id, projects, setCurrentProject]);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="py-16">
          <CardContent className="text-center">
            <p className="text-muted-foreground">Projet non trouvé</p>
            <Link href="/projects">
              <Button className="mt-4" variant="outline">
                Retour aux projets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = {
    knowledgeDomain: !!project.knowledgeDomain,
    contextVector: !!project.contextVector,
    eavModel: !!project.eavModel,
    topicalMap: !!project.topicalMap,
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

      {/* Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Progression</CardTitle>
          <CardDescription>
            {completedSteps}/4 étapes complétées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant={progress.knowledgeDomain ? "default" : "outline"}>
              Knowledge Domain
            </Badge>
            <Badge variant={progress.contextVector ? "default" : "outline"}>
              Context Vector
            </Badge>
            <Badge variant={progress.eavModel ? "default" : "outline"}>
              EAV Model
            </Badge>
            <Badge variant={progress.topicalMap ? "default" : "outline"}>
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
                {!progress.knowledgeDomain && (
                  <Button className="justify-start" variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer Knowledge Domain
                  </Button>
                )}
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
                Définissez le domaine de connaissance et ses paramètres de
                qualité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.knowledgeDomain ? (
                <div>
                  <p>Source Context: {project.knowledgeDomain.sourceContext}</p>
                  {/* TODO: Display full knowledge domain */}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Le Knowledge Domain n'a pas encore été généré
                  </p>
                  <Button>
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
                Entités, Attributs et Relations de votre domaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.eavModel ? (
                <div>
                  <p>{project.eavModel.entities.length} entités définies</p>
                  {/* TODO: Display EAV model */}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Le modèle EAV n'a pas encore été généré
                  </p>
                  <Button disabled={!progress.knowledgeDomain}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer avec l'IA
                  </Button>
                  {!progress.knowledgeDomain && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Générez d'abord le Knowledge Domain
                    </p>
                  )}
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">
                      {
                        project.topicalMap.nodes.filter(
                          (n) => n.type === "pillar"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Pillars</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">
                      {
                        project.topicalMap.nodes.filter(
                          (n) => n.type === "cluster"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Clusters</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">
                      {project.topicalMap.edges.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Liens</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    La Topical Map est vide
                  </p>
                  <Link href={`/projects/${project.id}/topical-map`}>
                    <Button>
                      <Map className="mr-2 h-4 w-4" />
                      Commencer à construire
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
