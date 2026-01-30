"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import type { TopicalMapNode, SearchIntent } from "@/types";

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (node: TopicalMapNode) => void;
  existingNodes: TopicalMapNode[];
}

const nodeTypes = [
  { value: "pillar", label: "Pillar (Page principale)" },
  { value: "cluster", label: "Cluster (Page secondaire)" },
  { value: "supporting", label: "Supporting (Page de support)" },
];

const intentOptions: { value: SearchIntent; label: string }[] = [
  { value: "informational", label: "Informationnel" },
  { value: "navigational", label: "Navigationnel" },
  { value: "transactional", label: "Transactionnel" },
  { value: "commercial", label: "Commercial" },
];

export function AddNodeDialog({
  open,
  onOpenChange,
  onAdd,
  existingNodes,
}: AddNodeDialogProps) {
  const [formData, setFormData] = useState({
    type: "cluster" as "pillar" | "cluster" | "supporting",
    title: "",
    description: "",
    intent: "informational" as SearchIntent,
    mainKeyword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate position based on existing nodes
    const xOffset = existingNodes.length * 50;
    const yBase =
      formData.type === "pillar" ? 0 : formData.type === "cluster" ? 200 : 400;

    const newNode: TopicalMapNode = {
      id: crypto.randomUUID(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      intent: formData.intent,
      keywords: formData.mainKeyword
        ? [{ keyword: formData.mainKeyword, isMain: true, source: "manual" }]
        : [],
      paaQuestions: [],
      position: {
        x: 100 + xOffset,
        y: yBase + Math.random() * 100,
      },
    };

    onAdd(newNode);

    // Reset form
    setFormData({
      type: "cluster",
      title: "",
      description: "",
      intent: "informational",
      mainKeyword: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un node</DialogTitle>
          <DialogDescription>
            Créez un nouveau node dans votre Topical Map
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node type */}
          <div className="space-y-2">
            <Label>Type de node</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "pillar" | "cluster" | "supporting") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="add-title">Titre *</Label>
            <Input
              id="add-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Guide complet des visas France"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="add-description">Description</Label>
            <Textarea
              id="add-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Décrivez le contenu de cette page"
              rows={2}
            />
          </div>

          {/* Intent */}
          <div className="space-y-2">
            <Label>Intent</Label>
            <Select
              value={formData.intent}
              onValueChange={(value: SearchIntent) =>
                setFormData({ ...formData, intent: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main keyword */}
          <div className="space-y-2">
            <Label htmlFor="add-keyword">Mot-clé principal</Label>
            <Input
              id="add-keyword"
              value={formData.mainKeyword}
              onChange={(e) =>
                setFormData({ ...formData, mainKeyword: e.target.value })
              }
              placeholder="Ex: visa france"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
