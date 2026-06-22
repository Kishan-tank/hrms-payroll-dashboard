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