import { NextRequest, NextResponse } from "next/server";
import {
  callOpenRouter,
  parseJSONResponse,
  SYSTEM_PROMPT,
  getKnowledgeDomainPrompt,
  getContextVectorPrompt,
  getEAVModelPrompt,
  getTopicalMapPrompt,
} from "@/lib/openrouter";
import type { Project, KnowledgeDomain, ContextVector, EAVModel, TopicalMap, TopicalMapNode, TopicalMapEdge } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { project, step } = await request.json() as { project: Project; step: string };

    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }

    // Generate based on the requested step
    switch (step) {
      case "knowledge-domain":
        return await generateKnowledgeDomain(project);

      case "context-vector":
        return await generateContextVector(project);

      case "eav-model":
        return await generateEAVModel(project);

      case "topical-map":
        return await generateTopicalMap(project);

      case "full":
        return await generateFull(project);

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

async function generateKnowledgeDomain(project: Project) {
  const prompt = getKnowledgeDomainPrompt(project);

  const response = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  const data = parseJSONResponse<Omit<KnowledgeDomain, "id" | "projectId" | "name">>(response);

  const knowledgeDomain: KnowledgeDomain = {
    id: crypto.randomUUID(),
    projectId: project.id,
    name: project.mainTopic,
    ...data,
  };

  return NextResponse.json({ knowledgeDomain });
}

async function generateContextVector(project: Project) {
  if (!project.knowledgeDomain) {
    return NextResponse.json({ error: "Knowledge Domain is required" }, { status: 400 });
  }

  const prompt = getContextVectorPrompt(project, JSON.stringify(project.knowledgeDomain, null, 2));

  const response = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  const data = parseJSONResponse<Omit<ContextVector, "id" | "projectId">>(response);

  const contextVector: ContextVector = {
    id: crypto.randomUUID(),
    projectId: project.id,
    ...data,
  };

  return NextResponse.json({ contextVector });
}

async function generateEAVModel(project: Project) {
  if (!project.knowledgeDomain || !project.contextVector) {
    return NextResponse.json({ error: "Knowledge Domain and Context Vector are required" }, { status: 400 });
  }

  const prompt = getEAVModelPrompt(
    project,
    JSON.stringify(project.knowledgeDomain, null, 2),
    JSON.stringify(project.contextVector, null, 2)
  );

  const response = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ], { max_tokens: 8192 });

  const data = parseJSONResponse<{ entities: any[]; relations: any[] }>(response);

  // Transform the response to match our types
  const eavModel: EAVModel = {
    id: crypto.randomUUID(),
    projectId: project.id,
    entities: data.entities.map((e: any) => ({
      id: crypto.randomUUID(),
      name: e.name,
      type: e.type,
      description: e.description,
      isMainEntity: e.isMainEntity || false,
      keyAttributes: (e.keyAttributes || []).map((a: any) => ({
        id: crypto.randomUUID(),
        ...a,
        isKey: true,
      })),
      standardAttributes: (e.standardAttributes || []).map((a: any) => ({
        id: crypto.randomUUID(),
        ...a,
        isKey: false,
      })),
    })),
    relations: data.relations.map((r: any) => {
      // Find entity IDs by name
      const sourceEntity = data.entities.find((e: any) => e.name === r.sourceEntity);
      const targetEntity = data.entities.find((e: any) => e.name === r.targetEntity);

      return {
        id: crypto.randomUUID(),
        sourceEntityId: sourceEntity?.name || r.sourceEntity,
        targetEntityId: targetEntity?.name || r.targetEntity,
        relationType: r.relationType,
        description: r.description,
      };
    }),
  };

  return NextResponse.json({ eavModel });
}

async function generateTopicalMap(project: Project) {
  if (!project.knowledgeDomain || !project.contextVector || !project.eavModel) {
    return NextResponse.json({ error: "Knowledge Domain, Context Vector, and EAV Model are required" }, { status: 400 });
  }

  const prompt = getTopicalMapPrompt(
    project,
    JSON.stringify(project.knowledgeDomain, null, 2),
    JSON.stringify(project.contextVector, null, 2),
    JSON.stringify(project.eavModel, null, 2)
  );

  const response = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ], { max_tokens: 8192 });

  const data = parseJSONResponse<{ nodes: any[]; edges: any[] }>(response);

  // Calculate positions for nodes
  const pillars = data.nodes.filter((n: any) => n.type === "pillar");
  const clusters = data.nodes.filter((n: any) => n.type === "cluster");
  const supporting = data.nodes.filter((n: any) => n.type === "supporting");

  let positionIndex = 0;
  const getPosition = (type: string, index: number) => {
    const baseY = type === "pillar" ? 0 : type === "cluster" ? 200 : 400;
    const itemsPerRow = type === "pillar" ? 2 : type === "cluster" ? 4 : 6;
    const spacing = type === "pillar" ? 400 : type === "cluster" ? 300 : 250;

    return {
      x: (index % itemsPerRow) * spacing + 100,
      y: baseY + Math.floor(index / itemsPerRow) * 150,
    };
  };

  const topicalMapNodes: TopicalMapNode[] = [
    ...pillars.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "pillar" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("pillar", i),
    })),
    ...clusters.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "cluster" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("cluster", i),
    })),
    ...supporting.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "supporting" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("supporting", i),
    })),
  ];

  // Create a map of old IDs to new IDs
  const idMap = new Map<string, string>();
  data.nodes.forEach((n: any, i: number) => {
    const newNode = topicalMapNodes.find((tn) => tn.title === n.title);
    if (newNode && n.id) {
      idMap.set(n.id, newNode.id);
    }
  });

  const topicalMapEdges: TopicalMapEdge[] = data.edges.map((e: any) => ({
    id: crypto.randomUUID(),
    source: idMap.get(e.source) || e.source,
    target: idMap.get(e.target) || e.target,
    type: e.type || "hierarchical",
  }));

  const topicalMap: TopicalMap = {
    id: crypto.randomUUID(),
    projectId: project.id,
    nodes: topicalMapNodes,
    edges: topicalMapEdges,
  };

  return NextResponse.json({ topicalMap });
}

async function generateFull(project: Project) {
  // Step 1: Knowledge Domain
  const kdPrompt = getKnowledgeDomainPrompt(project);
  const kdResponse = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: kdPrompt },
  ]);
  const kdData = parseJSONResponse<Omit<KnowledgeDomain, "id" | "projectId" | "name">>(kdResponse);

  const knowledgeDomain: KnowledgeDomain = {
    id: crypto.randomUUID(),
    projectId: project.id,
    name: project.mainTopic,
    ...kdData,
  };

  // Step 2: Context Vector
  const cvPrompt = getContextVectorPrompt(project, JSON.stringify(knowledgeDomain, null, 2));
  const cvResponse = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: cvPrompt },
  ]);
  const cvData = parseJSONResponse<Omit<ContextVector, "id" | "projectId">>(cvResponse);

  const contextVector: ContextVector = {
    id: crypto.randomUUID(),
    projectId: project.id,
    ...cvData,
  };

  // Step 3: EAV Model
  const eavPrompt = getEAVModelPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2)
  );
  const eavResponse = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: eavPrompt },
  ], { max_tokens: 8192 });
  const eavData = parseJSONResponse<{ entities: any[]; relations: any[] }>(eavResponse);

  const eavModel: EAVModel = {
    id: crypto.randomUUID(),
    projectId: project.id,
    entities: eavData.entities.map((e: any) => ({
      id: crypto.randomUUID(),
      name: e.name,
      type: e.type,
      description: e.description,
      isMainEntity: e.isMainEntity || false,
      keyAttributes: (e.keyAttributes || []).map((a: any) => ({
        id: crypto.randomUUID(),
        ...a,
        isKey: true,
      })),
      standardAttributes: (e.standardAttributes || []).map((a: any) => ({
        id: crypto.randomUUID(),
        ...a,
        isKey: false,
      })),
    })),
    relations: eavData.relations.map((r: any) => ({
      id: crypto.randomUUID(),
      sourceEntityId: r.sourceEntity,
      targetEntityId: r.targetEntity,
      relationType: r.relationType,
      description: r.description,
    })),
  };

  // Step 4: Topical Map
  const tmPrompt = getTopicalMapPrompt(
    project,
    JSON.stringify(knowledgeDomain, null, 2),
    JSON.stringify(contextVector, null, 2),
    JSON.stringify(eavModel, null, 2)
  );
  const tmResponse = await callOpenRouter([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: tmPrompt },
  ], { max_tokens: 8192 });
  const tmData = parseJSONResponse<{ nodes: any[]; edges: any[] }>(tmResponse);

  // Process topical map nodes with positions
  const pillars = tmData.nodes.filter((n: any) => n.type === "pillar");
  const clusters = tmData.nodes.filter((n: any) => n.type === "cluster");
  const supporting = tmData.nodes.filter((n: any) => n.type === "supporting");

  const getPosition = (type: string, index: number) => {
    const baseY = type === "pillar" ? 0 : type === "cluster" ? 200 : 400;
    const itemsPerRow = type === "pillar" ? 2 : type === "cluster" ? 4 : 6;
    const spacing = type === "pillar" ? 400 : type === "cluster" ? 300 : 250;

    return {
      x: (index % itemsPerRow) * spacing + 100,
      y: baseY + Math.floor(index / itemsPerRow) * 150,
    };
  };

  const topicalMapNodes: TopicalMapNode[] = [
    ...pillars.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "pillar" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("pillar", i),
    })),
    ...clusters.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "cluster" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("cluster", i),
    })),
    ...supporting.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "supporting" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH,
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "generated" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      position: getPosition("supporting", i),
    })),
  ];

  const idMap = new Map<string, string>();
  tmData.nodes.forEach((n: any) => {
    const newNode = topicalMapNodes.find((tn) => tn.title === n.title);
    if (newNode && n.id) {
      idMap.set(n.id, newNode.id);
    }
  });

  const topicalMapEdges: TopicalMapEdge[] = tmData.edges.map((e: any) => ({
    id: crypto.randomUUID(),
    source: idMap.get(e.source) || e.source,
    target: idMap.get(e.target) || e.target,
    type: e.type || "hierarchical",
  }));

  const topicalMap: TopicalMap = {
    id: crypto.randomUUID(),
    projectId: project.id,
    nodes: topicalMapNodes,
    edges: topicalMapEdges,
  };

  return NextResponse.json({
    knowledgeDomain,
    contextVector,
    eavModel,
    topicalMap,
  });
}
