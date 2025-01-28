import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GenerateReportParams {
  purposeId: string;
  formatId: string | null;
  currentContent: string;
  images: Base64Image[];
}

interface Base64Image {
  data: string;
  mimeType: string;
}

export async function POST(request: Request) {
  try {
    const { purposeId, formatId, currentContent, images } =
      await request.json();

    if (!purposeId) {
      return NextResponse.json(
        { error: "フォルダは必須です" },
        { status: 400 }
      );
    }

    const content = await generateReport({
      purposeId,
      formatId,
      currentContent,
      images,
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("LLM API Error:", error);
    return NextResponse.json(
      { error: error.message || "エラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function generateReport({
  purposeId,
  formatId,
  currentContent,
  images,
}: GenerateReportParams) {
  const supabase = await createClient();

  // フォーマットの取得
  const { data: format } = await supabase
    .from("nippo_report_formats")
    .select("content")
    .eq("id", formatId)
    .single();

  // 過去の日報50件を取得
  const { data: pastReports } = await supabase
    .from("nippo_reports")
    .select("content, report_date")
    .eq("purpose_id", purposeId)
    .order("report_date", { ascending: false })
    .limit(50);

  // ユーザーの文体情報を取得
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data: profile } = await supabase
    .from("nippo_profiles")
    .select("personal")
    .eq("id", userId)
    .single();

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
以下の情報を基に、新しい日報を生成してください。

【フォーマット】
${format?.content || "（フォーマットなし）"}

【ユーザーの入力内容】
${currentContent || "（入力なし）"}

【ユーザーの文体特徴】
${profile?.personal || "（文体情報なし）"}

【過去の日報】
${pastReports?.length ? pastReportsText : "過去の日報はありません"}

【指示】
1. 上記のフォーマットに従って日報を作成してください
2. ユーザーの入力内容を優先的に反映してください
3. ユーザーの文体特徴を参考に、その人らしい文章を生成してください
4. 過去の日報の内容を参考にしつつ、自然な日本語で書いてください
5. 具体的な情報は過去の日報から抽出してください
6. 日付は本日の日付を使用してください
`;

  const imagesPrompt = images.map((image) => {
    return {
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    };
  });

  // Gemini APIの呼び出し
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const result = await model.generateContent([prompt, ...imagesPrompt]);
  const response = await result.response;
  const text = response.text();

  return text;
}
