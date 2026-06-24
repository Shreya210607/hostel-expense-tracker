const { GoogleGenAI } = require('@google/genai');

// Initialize the Gemini API client using your API key from the .env file
const ai = new GoogleGenAI({ apiKey: 'YOUR_ACTUAL_GEMINI_API_KEY_HERE' });

exports.askAssistant = async (req, res) => {
    try {
        const { question, currentBudgetStats } = req.body;

        // Create a custom prompt that forces Gemini to act as a witty, smart hostel financial coach
        const prompt = `
            You are a witty, supportive, and practical AI Financial Coach for hostel college students. 
            The student is asking: "${question}"
            
            Here is their current monthly budget snapshot:
            - Remaining Balance: ₹${currentBudgetStats.remainingBalance}
            - Safe Daily Spending Limit: ₹${currentBudgetStats.safeDailyLimit}
            - Days left in the month: ${currentBudgetStats.daysRemaining}
            
            Give them a highly contextual, personalized, and slightly humorous response. 
            If they want to buy something they can't afford, gently roast them or give them a funny, cheap alternative (like eating hostel mess food). Keep your answer brief, warm, and highly practical.
        `;

        // Request a response from the gemini-2.5-flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "The AI assistant took a nap. Try again shortly!" });
    }
};