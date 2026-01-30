"use client";

import { Handle, Position } from "@xyflow/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { TopicalMapNode } from "@/types";

interface SupportingNodeProps {
  data: TopicalMapNode;
  selected?: boolean;
}

export function SupportingNode({ data, selected }: SupportingNodeProps) {
  return (
    <div className={selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <Card className="w-48 border border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardHeader className="p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-gray-500" />
            <Badge variant="outline" className="text-xs border-gray-400 text-gray-600">
              Support
            </Badge>
          </div>
          <CardTitle className="mt-2 text-xs font-medium leading-tight">
            {data.title || "Sans titre"}
          </CardTitle>
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}
