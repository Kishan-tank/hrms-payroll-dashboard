import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
import Employee from "../models/employee.js";
import Attendance from "../models/attendance.js";

dotenv.config();

export const askAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY is not configured on the server." });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemInstruction = `You are Ask HRMS AI, an intelligent agent integrated into an HRMS and Payroll Dashboard called "HRMSPro". 
You are assisting a user with the role of ${req.user.role}.
You can perform actions on behalf of the user using the provided tools. If a tool fails, inform the user politely.
Answer concisely, professionally, and helpfully. Keep your responses short as they will be displayed in a small chat window. Do not use complex markdown that requires a full markdown renderer, but basic line breaks and simple lists are fine.

Here is the structure and knowledge of the website you should use to guide users:
- Dashboard (/employee-dashboard or /hr-dashboard depending on role)
- Attendance (/attendance)
- Leave Management (/leave)
- Payroll (/payroll)
- Employees (/employees)
- Reports (/reports)
- Settings (/settings)
`;

        const tools = [{
            functionDeclarations: [
                {
                    name: "checkIn",
                    description: "Checks the currently logged-in user into the HRMS attendance system for today.",
                    parameters: { type: "OBJECT", properties: {} }
                },
                {
                    name: "checkOut",
                    description: "Checks the currently logged-in user out of the HRMS attendance system for today.",
                    parameters: { type: "OBJECT", properties: {} }
                }
            ]
        }];

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                temperature: 0.7,
                tools
            }
        });

        let response = await chat.sendMessage({ message: prompt });

        // Check if Gemini wants to call a function
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            let apiResponse = {};
            
            try {
                const employee = await Employee.findOne({ userId: req.user.id });
                if (!employee) {
                    apiResponse = { success: false, message: "Employee profile not found for this user." };
                } else {
                    const date = new Date().toISOString().split('T')[0];
                    const now = new Date();
                    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                    const currentTime = now.toLocaleTimeString('en-US', timeOptions);
                    
                    let record = await Attendance.findOne({ employeeId: employee._id, date });

                    if (call.name === "checkIn") {
                        if (record && record.checkIn && record.checkIn !== "-") {
                            apiResponse = { success: false, message: "You are already checked in for today." };
                        } else {
                            if (record) {
                                record.checkIn = currentTime;
                                record.status = "Present";
                                await record.save();
                            } else {
                                record = await Attendance.create({
                                    employeeId: employee._id,
                                    date,
                                    checkIn: currentTime,
                                    status: "Present"
                                });
                            }
                            apiResponse = { success: true, message: `Successfully checked in at ${currentTime}` };
                        }
                    } else if (call.name === "checkOut") {
                        if (!record || !record.checkIn || record.checkIn === "-") {
                            apiResponse = { success: false, message: "You must check in first before checking out." };
                        } else if (record.checkOut && record.checkOut !== "-") {
                            apiResponse = { success: false, message: "You are already checked out for today." };
                        } else {
                            record.checkOut = currentTime;
                            await record.save();
                            apiResponse = { success: true, message: `Successfully checked out at ${currentTime}` };
                        }
                    }
                }
            } catch (err) {
                apiResponse = { success: false, message: err.message };
            }

            // Send the function response back to Gemini
            response = await chat.sendMessage({
                message: [{
                    functionResponse: {
                        name: call.name,
                        response: apiResponse
                    }
                }]
            });
        }

        res.status(200).json({ success: true, response: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant failed to respond", error: error.message });
    }
};

export const getAIInsights = async (req, res) => {
    try {
        const { summary } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY is not configured on the server." });
        }

        const ctx = summary
            ? `
        Total employees: ${summary.totalEmployees ?? summary.total ?? 'unknown'}
        Present today: ${summary.presentToday ?? summary.present ?? 'unknown'}
        On leave today: ${summary.onLeave ?? summary.onLeaveToday ?? 'unknown'}
        Pending leave requests: ${summary.pendingLeaves ?? summary.pending ?? 'unknown'}
        Pending approvals: ${summary.pendingApprovals ?? 'unknown'}
        Total monthly payroll: ${summary.totalPayroll ?? summary.payrollTotal ?? 'unknown'}
        Active employees: ${summary.activeEmployees ?? 'unknown'}
      `.trim()
            : 'No summary data available — generate general HRMS insights.';

        const systemInstruction = `You are an expert HR analytics AI embedded in HRMSPro, 
an enterprise HRMS platform. You analyse workforce data and return structured 
JSON insights. You are precise, data-driven, and commercially focused. 
You never fabricate specific employee names or IDs. 
You always return ONLY valid JSON — no markdown, no preamble, no explanation.`;

        const userPrompt = `Analyse this HR workforce snapshot and return exactly 4 
insight cards as a JSON array. Each card identifies a workforce signal, risk, or 
opportunity an HR manager should act on today.

Current workforce data:
${ctx}

Return this exact JSON structure (array of 4 objects, nothing else):
[
  {
    "id": "unique_string",
    "category": "ATTENDANCE" | "LEAVE" | "PAYROLL" | "APPROVALS",
    "title": "concise headline under 8 words",
    "body": "1-2 sentence insight with specific numbers where available. Be direct.",
    "confidence": number between 70 and 99,
    "action": "2-3 word CTA e.g. Review now",
    "sentiment": "positive" | "warning" | "critical" | "neutral"
  }
]

Rules:
- Use exactly these 4 categories, one card each: ATTENDANCE, LEAVE, PAYROLL, APPROVALS
- confidence reflects how certain you are given the data quality (higher if data is specific)
- sentiment: positive=good news, warning=needs attention, critical=urgent, neutral=informational
- If a data field is unknown, make a reasonable inference but lower confidence accordingly
- Return ONLY the JSON array. No markdown. No explanation. No backticks.`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.4,
                responseMimeType: "application/json"
            }
        });

        const dataText = response.text;
        
        let parsed;
        try {
            let cleanText = dataText.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.substring(7);
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.substring(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            parsed = JSON.parse(cleanText.trim());
        } catch (e) {
            return res.status(500).json({ success: false, message: "AI response was not valid JSON", error: dataText });
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            return res.status(500).json({ success: false, message: "Invalid insight structure returned by AI" });
        }

        const VALID_CATEGORIES = ['ATTENDANCE', 'LEAVE', 'PAYROLL', 'APPROVALS'];
        const VALID_SENTIMENTS = ['positive', 'warning', 'critical', 'neutral'];

        const validated = parsed.map((item, i) => ({
            id: item.id ?? `insight-${i}`,
            category: VALID_CATEGORIES.includes(item.category) ? item.category : 'ATTENDANCE',
            title: item.title ?? 'Workforce insight',
            body: item.body ?? '',
            confidence: typeof item.confidence === 'number' ? Math.min(99, Math.max(50, item.confidence)) : 80,
            action: item.action ?? 'Review now',
            sentiment: VALID_SENTIMENTS.includes(item.sentiment) ? item.sentiment : 'neutral',
        }));

        res.status(200).json({ success: true, insights: validated });
    } catch (error) {
        console.error("AI Insights Error:", error);
        import('fs').then(fs => fs.appendFileSync('ai-error.log', new Date().toISOString() + ': ' + error.stack + '\n'));
        res.status(500).json({ success: false, message: "Failed to generate AI insights", error: error.message });
    }
};