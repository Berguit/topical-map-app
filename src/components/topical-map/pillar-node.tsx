"use client";

import { Handle, Position } from "@xyflow/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import type { TopicalMapNode } from "@/types";

interface PillarNodeProps {
  data: TopicalMapNode;
  selected?: boolean;
}

export function PillarNode({ data, selected }: PillarNodeProps) {
  return (
    <div className={selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />
      <Card className="w-64 border-2 border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              Pillar
            </Badge>
          </div>
          <CardTitle className="mt-2 text-sm font-medium leading-tight">
            {data.title || "Sans titre"}
          </CardTitle>
          {data.keywords && data.keywords.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {data.keywords[0]?.keyword}
            </p>
          )}
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  );
}
