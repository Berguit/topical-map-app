"use client";

import { Handle, Position } from "@xyflow/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import type { TopicalMapNode } from "@/types";

interface ClusterNodeProps {
  data: TopicalMapNode;
  selected?: boolean;
}

export function ClusterNode({ data, selected }: ClusterNodeProps) {
  return (
    <div className={selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Card className="w-56 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
        <CardHeader className="p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              Cluster
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
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}
