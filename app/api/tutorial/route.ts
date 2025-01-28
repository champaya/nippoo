import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json(
        { error: "ユーザーが存在しないか、ログインしていません" },
        { status: 404 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
以下の文章から、書き手の文体や口癖の特徴を分析してください。
分析結果は以下の形式で出力してください：
1. 文体の特徴（例：「ですます調」「である調」「カジュアル」など）
2. 頻出する表現や口癖
3. 文章の長さや構造の特徴
4. その他の特徴的な点

分析対象の文章：
${content}
`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const personal = response.text();

    return NextResponse.json({ personal });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "文体の分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
