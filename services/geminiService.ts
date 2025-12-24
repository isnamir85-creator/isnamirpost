
import { GoogleGenAI, Type } from "@google/genai";
import { DeliveryRecord, ResidenceStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageSearch = async (query: string, existingRecords: DeliveryRecord[]): Promise<{
  suggestedRecord?: Partial<DeliveryRecord>;
  explanation: string;
}> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `사용자가 입력한 배달 정보 쿼리: "${query}"
    
    이 앱은 집배원이 사용하는 앱입니다. 
    기존 데이터베이스에 있는 기록들을 참고하여, 사용자의 입력을 분석하세요.
    입력에서 건물명, 호수, 수취인 이름, 혹은 상태를 추출하세요.

    현재 데이터 예시: ${JSON.stringify(existingRecords.slice(0, 5))}

    결과는 반드시 JSON 형식으로 반환하세요.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedRecord: {
            type: Type.OBJECT,
            properties: {
              buildingName: { type: Type.STRING },
              unitNumber: { type: Type.STRING },
              residentName: { type: Type.STRING },
              status: { type: Type.STRING, enum: Object.values(ResidenceStatus) },
            }
          },
          explanation: { type: Type.STRING }
        },
        required: ["explanation"]
      }
    }
  });

  // @google/genai: Access .text property directly and handle potential undefined
  const text = response.text || "{}";
  return JSON.parse(text);
};

export const getAIInsight = async (record: DeliveryRecord): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `다음 배달 정보에 대한 주의사항이나 집배원을 위한 조언을 한 줄로 작성해줘:
    건물: ${record.buildingName}, 호수: ${record.unitNumber}, 수취인: ${record.residentName}, 상태: ${record.status}, 메모: ${record.memo || '없음'}`,
    config: {
      systemInstruction: "당신은 30년 경력의 베테랑 집배원입니다. 후배 집배원에게 짧고 명확한 조언을 제공하세요."
    }
  });
  // @google/genai: Access .text property directly and handle potential undefined
  return (response.text || "").trim();
};
