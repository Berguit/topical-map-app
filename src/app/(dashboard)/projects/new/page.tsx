"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BusinessType, Project } from "@/types";
import { toast } from "sonner";

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "affiliate", label: "Affiliation" },
  { value: "blog", label: "Blog / Média" },
  { value: "agency", label: "Agence / Service" },
  { value: "local_business", label: "Commerce local" },
  { value: "other", label: "Autre" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    businessType: "" as BusinessType,
    mainTopic: "",
    audience: "",
    objectives: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: formData.name,
        businessType: formData.businessType,
        mainTopic: formData.mainTopic,
        audience: formData.audience,
        objectives: formData.objectives.split("\n").filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addProject(newProject);
      toast.success("Projet créé avec succès");
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Projet</CardTitle>
          <CardDescription>
            Définissez les informations de base pour votre Topical Map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                placeholder="Ex: Guide Visa France"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Business type */}
            <div className="space-y-2">
              <Label htmlFor="businessType">Type de business *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value: BusinessType) =>
                  setFormData({ ...formData, businessType: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main topic */}
            <div className="space-y-2">
              <Label htmlFor="mainTopic">Thématique principale *</Label>
              <Input
                id="mainTopic"
                placeholder="Ex: Visa et immigration en France"
                value={formData.mainTopic}
                onChange={(e) =>
                  setFormData({ ...formData, mainTopic: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Le sujet central autour duquel sera construit votre Topical Map
              </p>
            </div>

            {/* Target audience */}
            <div className="space-y-2">
              <Label htmlFor="audience">Audience cible *</Label>
              <Textarea
                id="audience"
                placeholder="Ex: Expatriés souhaitant obtenir un visa pour la France, étudiants internationaux..."
                value={formData.audience}
                onChange={(e) =>
                  setFormData({ ...formData, audience: e.target.value })
                }
                required
              />
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Objectifs (un par ligne)</Label>
              <Textarea
                id="objectives"
                placeholder="Devenir la référence sur les visas France&#10;Générer du trafic organique qualifié&#10;Convertir en leads pour service d'accompagnement"
                value={formData.objectives}
                onChange={(e) =>
                  setFormData({ ...formData, objectives: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Créer le projet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
