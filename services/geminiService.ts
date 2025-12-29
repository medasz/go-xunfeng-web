import { GoogleGenAI } from "@google/genai";
import { Vulnerability } from "../types";

// 注意：在实际部署中，API 密钥应安全处理。
// 对于此客户端演示，我们依赖环境变量。
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async analyzeVulnerability(vuln: Vulnerability, lang: 'zh' | 'en' = 'zh'): Promise<string> {
    if (!apiKey) {
      return lang === 'zh' 
        ? "错误：未检测到 Google Gemini API Key。请配置 process.env.API_KEY 环境变量。"
        : "Error: Google Gemini API Key not detected. Please configure process.env.API_KEY environment variable.";
    }

    try {
      const promptZh = `
        你是一位资深的网络安全专家。请分析扫描器发现的以下漏洞，并提供一份简洁的修复方案。
        
        **漏洞详情：**
        - 标题: ${vuln.title}
        - URL: ${vuln.url}
        - 严重程度: ${vuln.severity}
        - 插件/类型: ${vuln.plugin}
        - 技术细节: ${vuln.detail}

        **任务要求：**
        1. 用 1-2 句话解释为什么这个漏洞是危险的。
        2. 为开发人员提供分步修复指南。
        3. 如果适用，请提供修复的代码示例（例如针对 SQL 注入或 XSS）。
        
        请务必使用**中文**回答。
      `;

      const promptEn = `
        You are a senior cybersecurity expert. Please analyze the following vulnerability detected by the scanner and provide a concise remediation plan.
        
        **Vulnerability Details:**
        - Title: ${vuln.title}
        - URL: ${vuln.url}
        - Severity: ${vuln.severity}
        - Plugin/Type: ${vuln.plugin}
        - Technical Details: ${vuln.detail}

        **Task Requirements:**
        1. Explain in 1-2 sentences why this vulnerability is dangerous.
        2. Provide a step-by-step remediation guide for developers.
        3. If applicable, provide code examples for the fix (e.g., for SQL Injection or XSS).
        
        Please answer in **English**.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: lang === 'zh' ? promptZh : promptEn,
      });

      return response.text || (lang === 'zh' ? "未能生成分析结果。" : "Failed to generate analysis.");
    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      return lang === 'zh' 
        ? "无法连接 Gemini API 进行分析。请检查您的网络连接和 API 密钥配置。"
        : "Cannot connect to Gemini API for analysis. Please check your network connection and API key configuration.";
    }
  }
};