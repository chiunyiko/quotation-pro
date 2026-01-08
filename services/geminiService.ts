
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponseItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIEstimate = async (prompt: string): Promise<AIResponseItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `請根據以下專案描述生成結構化的報價清單（請使用繁體中文）："${prompt}"。
      請提供至少 6-10 個相關的報價項目，涵蓋標準的製作類別（創意策略、動態製作、後期剪輯、音效製作、專案管理）。
      價格應符合高階動態設計工作室或廣告製作公司的市場行情（台幣或港幣概念）。`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: ['創意策略', '動態製作', '後期剪輯', '音效製作', '專案管理', '其他'] 
              },
              unit: { type: Type.STRING },
              suggestedQuantity: { type: Type.NUMBER },
              suggestedUnitPrice: { type: Type.NUMBER }
            },
            required: ['name', 'description', 'category', 'unit', 'suggestedQuantity', 'suggestedUnitPrice']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Estimation failed:", error);
    return [];
  }
};
