"use client";

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
import { Plus, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const { projects } = useProjectStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos Topical Maps et réseaux de contenu
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Aucun projet</h2>
            <p className="mb-6 text-muted-foreground">
              Créez votre premier projet pour commencer à construire votre
              Topical Map
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un projet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge variant="secondary">{project.businessType}</Badge>
                  </div>
                  <CardDescription>{project.mainTopic}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {project.knowledgeDomain && (
                      <Badge variant="outline">Knowledge Domain</Badge>
                    )}
                    {project.contextVector && (
                      <Badge variant="outline">Context Vector</Badge>
                    )}
                    {project.eavModel && <Badge variant="outline">EAV</Badge>}
                    {project.topicalMap && (
                      <Badge variant="outline">
                        {project.topicalMap.nodes.length} nodes
                      </Badge>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Mis à jour le{" "}
                    {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
