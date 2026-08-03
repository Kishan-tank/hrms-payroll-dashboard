import Groq from "groq-sdk";
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
        
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "GROQ_API_KEY is not configured on the server." });
        }
        
        const groq = new Groq({ apiKey });

        const systemInstruction = `You are Ask HRMS AI, an intelligent assistant integrated into HRMSPro dashboard.
You are assisting a user with the role of ${req.user.role}.
Answer concisely, professionally, and helpfully. Keep responses short and friendly for a chat widget.
You can perform actions using function tools when requested (such as checking in or checking out for today).

Site Structure Knowledge:
- Dashboard (/employee-dashboard or /hr-dashboard)
- Attendance (/attendance)
- Leave Management (/leave)
- Payroll (/payroll)
- Employees (/employees)
- Analytics (/analytics)
- Settings (/settings)
`;

        const tools = [
            {
                type: "function",
                function: {
                    name: "checkIn",
                    description: "Checks the currently logged-in user into the HRMS attendance system for today.",
                    parameters: { type: "object", properties: {} }
                }
            },
            {
                type: "function",
                function: {
                    name: "checkOut",
                    description: "Checks the currently logged-in user out of the HRMS attendance system for today.",
                    parameters: { type: "object", properties: {} }
                }
            }
        ];

        let messages = [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ];

        let completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools,
            tool_choice: "auto",
            temperature: 0.7,
        });

        let responseMessage = completion.choices[0]?.message;

        if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolCall = responseMessage.tool_calls[0];
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

                    if (toolCall.function.name === "checkIn") {
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
                    } else if (toolCall.function.name === "checkOut") {
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

            messages.push(responseMessage);
            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(apiResponse)
            });

            const secondCompletion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
            });

            return res.status(200).json({
                success: true,
                response: secondCompletion.choices[0]?.message?.content || apiResponse.message,
            });
        }

        res.status(200).json({
            success: true,
            response: responseMessage?.content || "No response generated",
        });
    } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant failed to respond", error: error.message });
    }
};

export const getAIInsights = async (req, res) => {
    try {
        const { summary } = req.body;
        
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "GROQ_API_KEY is not configured on the server." });
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

        const systemInstruction = `You are an expert HR analytics AI embedded in HRMSPro. You analyze workforce data and return structured JSON insights. You return ONLY valid JSON inside an object with an "insights" key.`;

        const userPrompt = `Analyze this HR workforce snapshot and return exactly 4 insight cards as a JSON object containing an "insights" array.

Current workforce data:
${ctx}

Return this exact JSON structure:
{
  "insights": [
    {
      "id": "unique_string",
      "category": "ATTENDANCE" | "LEAVE" | "PAYROLL" | "APPROVALS",
      "title": "concise headline under 8 words",
      "body": "1-2 sentence insight with specific numbers where available. Be direct.",
      "confidence": 85,
      "action": "Review now",
      "sentiment": "positive" | "warning" | "critical" | "neutral"
    }
  ]
}

Rules:
- Use exactly these 4 categories, one card each: ATTENDANCE, LEAVE, PAYROLL, APPROVALS
- Return ONLY the JSON object. No markdown. No explanation.`;

        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        });

        const dataText = completion.choices[0]?.message?.content || "{}";
        
        let parsed;
        try {
            const raw = JSON.parse(dataText);
            parsed = Array.isArray(raw) ? raw : (raw.insights || raw.cards || []);
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
        console.error("Groq AI Insights Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI insights", error: error.message });
    }
};