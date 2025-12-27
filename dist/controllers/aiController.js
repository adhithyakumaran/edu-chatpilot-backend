"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = exports.analyzeCode = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
// Load keys from env
const GROQ_API_KEYS = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;
const getNextGroqClient = () => {
    if (GROQ_API_KEYS.length === 0) {
        console.error("❌ No Groq API keys found in environment.");
        throw new Error("No Groq API keys found");
    }
    const apiKey = GROQ_API_KEYS[currentKeyIndex];
    console.log(`🔑 Using Groq Key Index: ${currentKeyIndex}/${GROQ_API_KEYS.length}`);
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    return new groq_sdk_1.default({ apiKey });
};
const analyzeCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { code, language } = req.body;
        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language are required' });
        }
        const prompt = `You are a Senior Coding Instructor. Your goal is to TEACH the student, not just fix their code.
        
        Analyze the following ${language} code provided by a student.

        **Guidelines:**
        1. **Be Precise**: Avoid fluff. Get straight to the point.
        2. **Teach Concepts**: If there is an error, explain the *concept* they missed (e.g., scoping, types, syntax).
        3. **Socratic Method**: If the code is mostly correct but has a subtle bug, give a hint first, then the solution.
        4. **Best Practices**: Mention proper naming conventions or cleaner ways to write the same logic.
        
        **Response Structure:**
        - **🔍 Analysis**: What is the code doing? (1 sentence)
        - **❌ Issue/Improvement**: clear explanation of the mistake or area to improve.
        - **💡 The Fix**: The corrected code block.
        - **🚀 Challenge**: A small question or modification for the student to try next to reinforce learning.

        Student Code:
        \`\`\`${language}
        ${code}
        \`\`\``;
        const groq = getNextGroqClient();
        const completion = yield groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile', // or llama3-70b-8192
            temperature: 0.5,
            max_tokens: 1024,
        });
        const feedback = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Excellent code! I couldn't find any issues.";
        res.json({ feedback });
    }
    catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze code', details: error.message });
    }
});
exports.analyzeCode = analyzeCode;
const generateContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { prompt, context, type } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        let systemPrompt = "You are a helpful AI assistant.";
        if (type === 'resume_bullet') {
            systemPrompt = "You are an expert Technical Recruiter. Your goal is to rewrite resume bullet points to be impact-driven, using action verbs and metrics. Keep them concise and professional. Do not include introductory text, just the bullet points.";
        }
        else if (type === 'keyword_suggest') {
            systemPrompt = "You are an ATS Optimization Expert. Given a target role, suggest 10-15 high-value technical keywords, tools, and frameworks that should appear on a resume for that role. Return ONLY the keywords as a comma-separated list.";
        }
        const fullPrompt = `${context ? `Context: ${context}\n\n` : ''}Task: ${prompt}`;
        const groq = getNextGroqClient();
        const completion = yield groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: fullPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        });
        const content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Could not generate content.";
        res.json({ content });
    }
    catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});
exports.generateContent = generateContent;
