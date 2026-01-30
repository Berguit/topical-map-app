import { NextRequest, NextResponse } from "next/server";
import type { Project, KnowledgeDomain, ContextVector, EAVModel, TopicalMap, TopicalMapNode, TopicalMapEdge } from "@/types";
import {
  generateTopicalMap as generateFullTopicalMap,
  fetchHaloscanData,
} from "@/lib/services/topical-map-generator";
import {
  callOpenRouter,
  parseJSONResponse,
  SYSTEM_PROMPT,
  getKnowledgeDomainPrompt,
  getContextVectorPrompt,
  getEAVModelPrompt,
  getTopicalMapPrompt,
  type HaloscanDataInput,
} from "@/lib/openrouter";

// ===========================================
// API ROUTE: /api/generate
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, step, haloscanData } = body as {
      project: Project;
      step: string;
      haloscanData?: HaloscanDataInput;
    };

    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }

    switch (step) {
      // ===========================================
      // NEW: Full pipeline with Haloscan data
      // ===========================================
      case "full-with-haloscan":
        return await generateFullWithHaloscan(project);

      // ===========================================
      // NEW: Fetch Haloscan data only
      // ===========================================
      case "haloscan":
        return await getHaloscanData(project);

      // ===========================================
      // Individual steps (with optional Haloscan data)
      // ===========================================
      case "knowledge-domain":
        return await generateKnowledgeDomain(project, haloscanData);

      case "context-vector":
        return await generateContextVector(project, haloscanData);

      case "eav-model":
        return await generateEAVModel(project, haloscanData);

      case "topical-map":
        return await generateTopicalMap(project, haloscanData);

      // ===========================================
      // Legacy: Full without Haloscan (backwards compat)
      // ===========================================
      case "full":
        return await generateFull(project);

      default:
        return NextResponse.json(
          { error: "Invalid step. Use: haloscan, knowledge-domain, context-vector, eav-model, topical-map, full, full-with-haloscan" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

// ===========================================
// NEW: Full pipeline with Haloscan
// ===========================================

async function generateFullWithHaloscan(project: Project) {
  try {
    const result = await generateFullTopicalMap(project);

    // Transform to match expected types
    const knowledgeDomain: KnowledgeDomain = {
      id: crypto.randomUUID(),
      projectId: project.id,
      name: project.mainTopic,
      ...result.knowledgeDomain,
    };

    const contextVector: ContextVector = {
      id: crypto.randomUUID(),
      projectId: project.id,
      ...result.contextVector,
    };

    const eavModel: EAVModel = {
      id: crypto.randomUUID(),
      projectId: project.id,
      entities: result.eavModel.entities.map((e) => ({
        id: crypto.randomUUID(),
        name: e.name,
        type: e.type as any,
        description: e.description,
        isMainEntity: e.isMainEntity,
        keyAttributes: e.keyAttributes.map((a) => ({
          id: crypto.randomUUID(),
          ...a,
          valueType: a.valueType as any,
        })),
        standardAttributes: e.standardAttributes.map((a) => ({
          id: crypto.randomUUID(),
          ...a,
          valueType: a.valueType as any,
        })),
      })),
      relations: result.eavModel.relations.map((r) => ({
        id: crypto.randomUUID(),
        sourceEntityId: r.sourceEntity,
        targetEntityId: r.targetEntity,
        relationType: r.relationType as any,
        description: r.description,
      })),
    };

    const topicalMap = transformTopicalMap(result.topicalMap, project.id);

    return NextResponse.json({
      haloscanData: result.haloscanData,
      knowledgeDomain,
      contextVector,
      eavModel,
      topicalMap,
    });
  } catch (error) {
    console.error("Full generation with Haloscan failed:", error);
    throw error;
  }
}

// ===========================================
// Fetch Haloscan data
// ===========================================

async function getHaloscanData(project: Project) {
  const data = await fetchHaloscanData(project.mainTopic);
  return NextResponse.json({ haloscanData: data });
}

// ===========================================
// Individual generation steps
// ===========================================

async function generateKnowledgeDomain(project: Project, haloscanData?: HaloscanDataInput) {
  // If no Haloscan data provided, fetch it
  const hData = haloscanData || await fetchHaloscanData(project.mainTopic);

  const prompt = getKnowledgeDomainPrompt(project, hData);
  const response = await callOpenRouter(prompt, SYSTEM_PROMPT);
  const data = parseJSONResponse<Omit<KnowledgeDomain, "id" | "projectId" | "name">>(response);

  const knowledgeDomain: KnowledgeDomain = {
    id: crypto.randomUUID(),
    projectId: project.id,
    name: project.mainTopic,
    ...data,
  };

  return NextResponse.json({ knowledgeDomain, haloscanData: hData });
}

async function generateContextVector(project: Project, haloscanData?: HaloscanDataInput) {
  if (!project.knowledgeDomain) {
    return NextResponse.json({ error: "Knowledge Domain is required" }, { status: 400 });
  }

  // If no Haloscan data provided, fetch it
  const hData = haloscanData || await fetchHaloscanData(project.mainTopic);

  const prompt = getContextVectorPrompt(
    project,
    JSON.stringify(project.knowledgeDomain, null, 2),
    hData
  );
  const response = await callOpenRouter(prompt, SYSTEM_PROMPT);
  const data = parseJSONResponse<Omit<ContextVector, "id" | "projectId">>(response);

  const contextVector: ContextVector = {
    id: crypto.randomUUID(),
    projectId: project.id,
    ...data,
  };

  return NextResponse.json({ contextVector });
}

async function generateEAVModel(project: Project, haloscanData?: HaloscanDataInput) {
  if (!project.knowledgeDomain || !project.contextVector) {
    return NextResponse.json({ error: "Knowledge Domain and Context Vector are required" }, { status: 400 });
  }

  // If no Haloscan data provided, fetch it
  const hData = haloscanData || await fetchHaloscanData(project.mainTopic);

  const prompt = getEAVModelPrompt(
    project,
    JSON.stringify(project.knowledgeDomain, null, 2),
    JSON.stringify(project.contextVector, null, 2),
    hData
  );
  const response = await callOpenRouter(prompt, SYSTEM_PROMPT, { max_tokens: 8192 });
  const data = parseJSONResponse<{ entities: any[]; relations: any[] }>(response);

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
    relations: data.relations.map((r: any) => ({
      id: crypto.randomUUID(),
      sourceEntityId: r.sourceEntity,
      targetEntityId: r.targetEntity,
      relationType: r.relationType,
      description: r.description,
    })),
  };

  return NextResponse.json({ eavModel });
}

async function generateTopicalMap(project: Project, haloscanData?: HaloscanDataInput) {
  if (!project.knowledgeDomain || !project.contextVector || !project.eavModel) {
    return NextResponse.json({ error: "Knowledge Domain, Context Vector, and EAV Model are required" }, { status: 400 });
  }

  // If no Haloscan data provided, fetch it
  const hData = haloscanData || await fetchHaloscanData(project.mainTopic);

  const prompt = getTopicalMapPrompt(
    project,
    JSON.stringify(project.knowledgeDomain, null, 2),
    JSON.stringify(project.contextVector, null, 2),
    JSON.stringify(project.eavModel, null, 2),
    hData
  );
  const response = await callOpenRouter(prompt, SYSTEM_PROMPT, { max_tokens: 8192 });
  const data = parseJSONResponse<{ nodes: any[]; edges: any[] }>(response);

  const topicalMap = transformTopicalMap(data, project.id);

  return NextResponse.json({ topicalMap });
}

// ===========================================
// Legacy full generation (without Haloscan)
// ===========================================

async function generateFull(project: Project) {
  // Redirect to new method with Haloscan
  return generateFullWithHaloscan(project);
}

// ===========================================
// Helper: Transform topical map data
// ===========================================

function transformTopicalMap(data: { nodes: any[]; edges: any[] }, projectId: string): TopicalMap {
  const pillars = data.nodes.filter((n: any) => n.type === "pillar");
  const clusters = data.nodes.filter((n: any) => n.type === "cluster");
  const supporting = data.nodes.filter((n: any) => n.type === "supporting");

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
      fiveWH: n.fiveWH || [],
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        volume: typeof k === "object" ? k.volume : undefined,
        kgr: typeof k === "object" ? k.kgr : undefined,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "haloscan" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      basedOnHaloscanCluster: n.basedOnHaloscanCluster,
      position: getPosition("pillar", i),
    })),
    ...clusters.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "cluster" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH || [],
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        volume: typeof k === "object" ? k.volume : undefined,
        kgr: typeof k === "object" ? k.kgr : undefined,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "haloscan" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      basedOnHaloscanCluster: n.basedOnHaloscanCluster,
      position: getPosition("cluster", i),
    })),
    ...supporting.map((n: any, i: number) => ({
      id: n.id || crypto.randomUUID(),
      type: "supporting" as const,
      title: n.title,
      description: n.description,
      intent: n.intent,
      fiveWH: n.fiveWH || [],
      keywords: (n.keywords || []).map((k: any) => ({
        keyword: typeof k === "string" ? k : k.keyword,
        volume: typeof k === "object" ? k.volume : undefined,
        kgr: typeof k === "object" ? k.kgr : undefined,
        isMain: typeof k === "string" ? i === 0 : k.isMain,
        source: "haloscan" as const,
      })),
      paaQuestions: n.paaQuestions || [],
      basedOnHaloscanCluster: n.basedOnHaloscanCluster,
      position: getPosition("supporting", i),
    })),
  ];

  // Create ID mapping for edges
  const idMap = new Map<string, string>();
  data.nodes.forEach((n: any) => {
    const newNode = topicalMapNodes.find((tn) => tn.title === n.title);
    if (newNode && n.id) {
      idMap.set(n.id, newNode.id);
    }
  });

  const topicalMapEdges: TopicalMapEdge[] = (data.edges || []).map((e: any) => ({
    id: crypto.randomUUID(),
    source: idMap.get(e.source) || e.source,
    target: idMap.get(e.target) || e.target,
    type: e.type || "hierarchical",
  }));

  return {
    id: crypto.randomUUID(),
    projectId,
    nodes: topicalMapNodes,
    edges: topicalMapEdges,
  };
}
