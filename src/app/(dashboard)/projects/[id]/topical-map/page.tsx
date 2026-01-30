"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useProjectStore, useHydration } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import type { Project, TopicalMapNode, TopicalMapEdge } from "@/types";

import { PillarNode } from "@/components/topical-map/pillar-node";
import { ClusterNode } from "@/components/topical-map/cluster-node";
import { SupportingNode } from "@/components/topical-map/supporting-node";
import { NodePanel } from "@/components/topical-map/node-panel";
import { AddNodeDialog } from "@/components/topical-map/add-node-dialog";

const nodeTypes = {
  pillar: PillarNode,
  cluster: ClusterNode,
  supporting: SupportingNode,
};

export default function TopicalMapPage() {
  const params = useParams();
  const router = useRouter();
  const hasHydrated = useHydration();
  const { projects, updateProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopicalMapNode | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load project and convert to React Flow format
  useEffect(() => {
    if (!hasHydrated) return;

    const found = projects.find((p) => p.id === params.id);
    if (found) {
      setProject(found);

      // Convert TopicalMapNodes to React Flow nodes
      if (found.topicalMap) {
        const flowNodes: Node[] = found.topicalMap.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: { ...node },
        }));
        setNodes(flowNodes);

        const flowEdges: Edge[] = found.topicalMap.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "smoothstep",
          animated: edge.type === "contextual",
        }));
        setEdges(flowEdges);
      }
    }
  }, [params.id, projects, setNodes, setEdges, hasHydrated]);

  // Save changes to store
  const saveToStore = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      if (!project) return;

      const topicalMapNodes: TopicalMapNode[] = newNodes.map((node) => ({
        ...node.data,
        id: node.id,
        position: node.position,
      })) as TopicalMapNode[];

      const topicalMapEdges: TopicalMapEdge[] = newEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.animated ? "contextual" : "hierarchical",
      })) as TopicalMapEdge[];

      updateProject(project.id, {
        topicalMap: {
          id: project.topicalMap?.id || crypto.randomUUID(),
          projectId: project.id,
          nodes: topicalMapNodes,
          edges: topicalMapEdges,
        },
      });
    },
    [project, updateProject]
  );

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(
        {
          ...connection,
          type: "smoothstep",
          id: crypto.randomUUID(),
        },
        edges
      );
      setEdges(newEdges);
      saveToStore(nodes, newEdges);
    },
    [edges, nodes, setEdges, saveToStore]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const topicalNode = project?.topicalMap?.nodes.find(
        (n) => n.id === node.id
      );
      setSelectedNode(topicalNode || null);
    },
    [project]
  );

  // Handle node drag end
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      saveToStore(updatedNodes, edges);
    },
    [nodes, edges, saveToStore]
  );

  // Add new node
  const handleAddNode = (newNode: TopicalMapNode) => {
    const flowNode: Node = {
      id: newNode.id,
      type: newNode.type,
      position: newNode.position,
      data: { ...newNode },
    };
    const updatedNodes = [...nodes, flowNode];
    setNodes(updatedNodes);
    saveToStore(updatedNodes, edges);
    setIsAddDialogOpen(false);
  };

  // Update node
  const handleUpdateNode = (updatedNode: TopicalMapNode) => {
    const updatedNodes = nodes.map((n) =>
      n.id === updatedNode.id
        ? { ...n, data: { ...updatedNode }, position: updatedNode.position }
        : n
    );
    setNodes(updatedNodes);
    saveToStore(updatedNodes, edges);
    setSelectedNode(updatedNode);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveToStore(updatedNodes, updatedEdges);
    setSelectedNode(null);
  };

  if (!hasHydrated || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Topical Map</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un node
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* React Flow Canvas */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-muted/30"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        </div>

        {/* Side panel */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Add node dialog */}
      <AddNodeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddNode}
        existingNodes={project.topicalMap?.nodes || []}
      />
    </div>
  );
}
