import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
  import { NextResponse } from "next/server";
  
  // Lấy API key từ biến môi trường
  const API_KEY = process.env.GEMINI_API_KEY;
  
  // Kiểm tra xem API key có tồn tại không
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }
  
  // Khởi tạo mô hình Gemini
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Định nghĩa System Prompt (Chỉ thị Hệ thống)
  // Đây là phần quan trọng nhất để thực thi "Lợi thế Cạnh tranh Cốt lõi" (Defensible Moat)
  // của Mengo: "Sư phạm là trên hết" (Pedagogy-First).
  const systemPrompt = `
  You are "Mengo", an AI Virtual Mentor for programming students.
  Your purpose is TO TEACH, NOT to do the work for them.
  You will receive a "project brief" (đề bài). Your task is to deconstruct this brief into a structured, actionable project plan.
  
  RULES:
  1.  **Analyze the Brief:** Deconstruct the user's brief into high-level project phases (Epics).
  2.  **Generate Tasks:** For each Epic, generate specific, actionable tasks.
  3.  **Generate Hints (The Mentor):** For each Task, you MUST generate the 3-level pedagogical hint scaffold:
      * **Metacognitive Hint:** A question that guides *how* to think (e.g., "What state needs to be managed for this component?").
      * **Conceptual Hint:** A hint pointing to *what* concept to review (e.g., "Review the React 'useState' hook documentation.").
      * **Keywords Hint:** Specific keywords to Google (e.g., "React useState", "JavaScript localStorage").
  4.  **Format Output:** You MUST respond ONLY with a valid, RFC 8259 compliant JSON object. Do not include markdown \`\`\`json tags.
  
  The JSON structure MUST follow this exact schema:
  {
    "epics": [
      {
        "id": "epic-1",
        "title": "Epic Title (e.g., Project Setup & Dependencies)",
        "tasks": [
          {
            "id": "task-1.1",
            "title": "Task Title (e.g., Initialize Next.js project)",
            "hints": {
              "metacognitive": "What command initializes a new Next.js app?",
              "conceptual": "Research the 'create-next-app' CLI tool.",
              "keywords": "create-next-app, nextjs 16 setup, turborepo"
            }
          }
        ]
      }
    ]
  }
  `;
  
  // Cấu hình an toàn
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  
  export async function POST(request: Request) {
    try {
      // 1. Lấy "brief" từ body của request
      const { briefContent } = await request.json();
  
      if (!briefContent) {
        return NextResponse.json(
          { error: "Missing 'briefContent' in request body" },
          { status: 400 }
        );
      }
  
      // 2. Cấu hình generation
      const generationConfig = {
        responseMimeType: "application/json", // Yêu cầu Gemini trả về JSON
      };

      // 3. Thử các model theo thứ tự ưu tiên (theo tài liệu mới nhất)
      const modelsToTry = [
        "gemini-2.5-flash", // Model mới nhất theo tài liệu
        "gemini-1.5-flash", // Fallback
        "gemini-pro", // Fallback cơ bản
      ];
      let lastError: Error | null = null;

      for (const modelName of modelsToTry) {
        try {
          const currentModel = genAI.getGenerativeModel({
            model: modelName,
          });

          // 4. Bắt đầu chat session với system prompt
          const chat = currentModel.startChat({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
              role: "model",
            },
            generationConfig,
            safetySettings,
          });

          // 5. Gửi brief của người dùng và chờ kết quả
          const result = await chat.sendMessage(briefContent);
          const response = result.response;
          const jsonText = response.text();
  
          // 6. Trả JSON về cho client
          // (Lưu ý: Chúng ta không cần JSON.parse(jsonText) vì Gemini đã trả về text
          // mà chúng ta sẽ forward thẳng dưới dạng text, và client sẽ parse)
          
          // Tạo một Response mới để đảm bảo header 'Content-Type' là 'application/json'
          return new Response(jsonText, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          lastError = error as Error;
          console.warn(`Failed to use model ${modelName}, trying next...`, error);
          // Tiếp tục thử model tiếp theo
          continue;
        }
      }

      // Nếu tất cả models đều fail
      throw lastError || new Error("All models failed");
  
    } catch (error) {
      console.error("Error in /api/generate:", error);
      return NextResponse.json(
        { error: "Failed to generate project plan." },
        { status: 500 }
      );
    }
  }