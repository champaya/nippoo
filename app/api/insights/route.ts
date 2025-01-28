import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { purposeId, content } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // 過去の日報50件を取得
    const { data: pastReports } = await supabase
      .from("nippo_reports")
      .select("content, report_date")
      .eq("purpose_id", purposeId)
      .order("report_date", { ascending: false })
      .limit(50);

    // プロンプトの作成
    const pastReportsText = pastReports
      ?.map(
        (report) =>
          `日付: ${new Date(report.report_date).toLocaleDateString("ja-JP")}\n${
            report.content
          }\n---\n`
      )
      .join("\n");

    const prompt = `
以下の日報内容から、重要なインサイトを3点抽出してください。
各インサイトは、具体的で実用的なアドバイスを含めてください。
回答は日本語でお願いします。

日報内容:
${content}

【過去の日報】
${pastReports?.length ? pastReportsText : "過去の日報はありません"}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // insightsを更新
    const { error: updateError } = await supabase
      .from("nippo_purposes")
      .update({ insights: text })
      .eq("id", purposeId);

    if (updateError) {
      console.error("Error updating insights:", updateError);
      return NextResponse.json(
        { error: "Failed to update insights" },
        { status: 500 }
      );
    }

    return NextResponse.json({ insights: text });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
