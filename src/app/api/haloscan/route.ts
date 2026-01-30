import { NextRequest, NextResponse } from "next/server";
import {
  getKeywordOverview,
  getKeywordQuestions,
  getSiteStructure,
  getFullKeywordAnalysis,
  generateTopicalStructure,
  HaloscanError,
} from "@/lib/haloscan";

export async function POST(request: NextRequest) {
  try {
    const { keyword, action } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "overview":
        const overview = await getKeywordOverview({
          keyword,
          requested_data: [
            "metrics",
            "keyword_match",
            "similar_highlight",
            "top_sites",
            "serp",
          ],
        });
        return NextResponse.json({ overview });

      case "questions":
        const questions = await getKeywordQuestions({
          keyword,
          lineCount: 50,
          keep_only_paa: true,
        });
        return NextResponse.json({ questions: questions.results });

      case "structure":
        const structure = await generateTopicalStructure(keyword, {
          granularity: 0.25,
          maxKeywords: 500,
        });
        return NextResponse.json({ structure });

      case "full":
        const analysis = await getFullKeywordAnalysis(keyword);
        return NextResponse.json({ analysis });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: overview, questions, structure, full" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Haloscan API error:", error);

    if (error instanceof HaloscanError) {
      return NextResponse.json(
        { error: error.message, failureReason: error.failureReason },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Haloscan request failed" },
      { status: 500 }
    );
  }
}
