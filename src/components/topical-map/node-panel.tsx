"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Trash2, Plus } from "lucide-react";
import type { TopicalMapNode, SearchIntent } from "@/types";

interface NodePanelProps {
  node: TopicalMapNode;
  onUpdate: (node: TopicalMapNode) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const intentOptions: { value: SearchIntent; label: string }[] = [
  { value: "informational", label: "Informationnel" },
  { value: "navigational", label: "Navigationnel" },
  { value: "transactional", label: "Transactionnel" },
  { value: "commercial", label: "Commercial" },
];

const fiveWHOptions = [
  { value: "what", label: "What (Quoi)" },
  { value: "who", label: "Who (Qui)" },
  { value: "where", label: "Where (Où)" },
  { value: "when", label: "When (Quand)" },
  { value: "why", label: "Why (Pourquoi)" },
  { value: "how", label: "How (Comment)" },
];

export function NodePanel({ node, onUpdate, onDelete, onClose }: NodePanelProps) {
  const [editedNode, setEditedNode] = useState<TopicalMapNode>(node);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPAA, setNewPAA] = useState("");

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  const handleSave = () => {
    onUpdate(editedNode);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setEditedNode({
      ...editedNode,
      keywords: [
        ...editedNode.keywords,
        { keyword: newKeyword.trim(), isMain: false, source: "manual" },
      ],
    });
    setNewKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    setEditedNode({
      ...editedNode,
      keywords: editedNode.keywords.filter((_, i) => i !== index),
    });
  };

  const handleAddPAA = () => {
    if (!newPAA.trim()) return;
    setEditedNode({
      ...editedNode,
      paaQuestions: [...editedNode.paaQuestions, newPAA.trim()],
    });
    setNewPAA("");
  };

  const handleRemovePAA = (index: number) => {
    setEditedNode({
      ...editedNode,
      paaQuestions: editedNode.paaQuestions.filter((_, i) => i !== index),
    });
  };

  const toggleFiveWH = (value: string) => {
    const current = editedNode.fiveWH || [];
    const newFiveWH = current.includes(value as any)
      ? current.filter((v) => v !== value)
      : [...current, value as any];
    setEditedNode({ ...editedNode, fiveWH: newFiveWH });
  };

  return (
    <div className="w-96 border-l bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <Badge
            variant={
              editedNode.type === "pillar"
                ? "default"
                : editedNode.type === "cluster"
                ? "secondary"
                : "outline"
            }
          >
            {editedNode.type}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={editedNode.title}
            onChange={(e) =>
              setEditedNode({ ...editedNode, title: e.target.value })
            }
            placeholder="Titre de la page"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editedNode.description}
            onChange={(e) =>
              setEditedNode({ ...editedNode, description: e.target.value })
            }
            placeholder="Description du contenu"
            rows={3}
          />
        </div>

        {/* Intent */}
        <div className="space-y-2">
          <Label>Intent</Label>
          <Select
            value={editedNode.intent}
            onValueChange={(value: SearchIntent) =>
              setEditedNode({ ...editedNode, intent: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner l'intent" />
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

        {/* 5W+H */}
        <div className="space-y-2">
          <Label>Couverture 5W+H</Label>
          <div className="flex flex-wrap gap-2">
            {fiveWHOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  editedNode.fiveWH?.includes(option.value as any)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleFiveWH(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Mots-clés</Label>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Ajouter un mot-clé"
              onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            />
            <Button size="icon" onClick={handleAddKeyword}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {editedNode.keywords.map((kw, i) => (
              <Badge
                key={i}
                variant={kw.isMain ? "default" : "secondary"}
                className="gap-1"
              >
                {kw.keyword}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveKeyword(i)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* PAA Questions */}
        <div className="space-y-2">
          <Label>Questions PAA</Label>
          <div className="flex gap-2">
            <Input
              value={newPAA}
              onChange={(e) => setNewPAA(e.target.value)}
              placeholder="Ajouter une question"
              onKeyDown={(e) => e.key === "Enter" && handleAddPAA()}
            />
            <Button size="icon" onClick={handleAddPAA}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {editedNode.paaQuestions.map((q, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm bg-muted p-2 rounded"
              >
                <span className="truncate">{q}</span>
                <X
                  className="h-3 w-3 cursor-pointer shrink-0 ml-2"
                  onClick={() => handleRemovePAA(i)}
                />
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Sauvegarder
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
