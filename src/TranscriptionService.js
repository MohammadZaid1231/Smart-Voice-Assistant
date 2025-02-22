// src/TranscriptionService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export class TranscriptionService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Gemini API key is not set');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async summarizeContent(transcript) {
        try {
            const prompt = `
            Please provide a concise summary of this meeting transcript in 2-3 sentences.
            Focus on key decisions, action items, and main discussion points.

            Transcript: "${transcript}"
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Summarization error:', error);
            throw error;
        }
    }

    async analyzeContent(transcript) {
        try {
            const prompt = `
            Analyze this meeting transcript and categorize information into:
            1. Tasks (prefix with "TASK:") - Include deadlines if mentioned
            2. Events (prefix with "EVENT:") - Include specific dates and times
            3. Notes (prefix with "NOTE:") - Include key discussion points

            Format each item on a new line with the appropriate prefix.
            For events, try to extract specific date and time information.

            Transcript: "${transcript}"
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return this.parseAnalysis(response.text());
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    async createEnhancedSummary(transcript) {
        try {
            const prompt = `
            Create a detailed meeting summary with the following sections:
            1. Key Discussion Points
            2. Action Items with Deadlines
            3. Decisions Made
            4. Next Steps
            5. Participants (if mentioned)

            Format with clear headings and bullet points.
            Transcript: "${transcript}"
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Enhanced summary error:', error);
            throw error;
        }
    }

    async analyzeCombined(transcript) {
        try {
            // Get basic analysis
            const analysis = await this.analyzeContent(transcript);
            
            // Get enhanced summary
            const enhancedSummary = await this.createEnhancedSummary(transcript);
            
            // Create calendar events for meetings
            const calendarEvents = analysis.events.map(event => {
                return this.createCalendarEvent(event);
            });

            return {
                ...analysis,
                enhancedSummary,
                calendarEvents
            };
        } catch (error) {
            console.error('Combined analysis error:', error);
            throw error;
        }
    }

    createCalendarEvent(event) {
        try {
            // Extract date and time from event title
            const eventDetails = this.extractDateTime(event.title);
            
            // Create Google Calendar link
            const calendarUrl = this.createGoogleCalendarUrl({
                title: event.title,
                description: event.description || 'Meeting from voice assistant',
                startTime: eventDetails.startTime,
                endTime: eventDetails.endTime
            });

            return {
                ...event,
                calendarLink: calendarUrl
            };
        } catch (error) {
            console.error('Calendar event creation error:', error);
            return event;
        }
    }

    extractDateTime(eventText) {
        // Simple date/time extraction - can be enhanced with better parsing
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Default to 1 hour meeting
        const startTime = tomorrow;
        const endTime = new Date(startTime.getTime() + 60*60*1000);

        return { startTime, endTime };
    }

    createGoogleCalendarUrl(event) {
        const startTime = event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endTime = event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${
            encodeURIComponent(event.title)
        }&details=${
            encodeURIComponent(event.description)
        }&dates=${startTime}/${endTime}`;
    }

    parseAnalysis(response) {
        const tasks = [];
        const events = [];
        const notes = [];

        const lines = response.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('TASK:')) {
                tasks.push({
                    id: Date.now() + Math.random(),
                    text: trimmedLine.replace('TASK:', '').trim(),
                    completed: false,
                    deadline: this.extractDeadline(trimmedLine)
                });
            } else if (trimmedLine.startsWith('EVENT:')) {
                events.push({
                    id: Date.now() + Math.random(),
                    title: trimmedLine.replace('EVENT:', '').trim(),
                    datetime: this.extractDateTime(trimmedLine)
                });
            } else if (trimmedLine.startsWith('NOTE:')) {
                notes.push({
                    id: Date.now() + Math.random(),
                    text: trimmedLine.replace('NOTE:', '').trim()
                });
            }
        });

        return { tasks, events, notes };
    }

    extractDeadline(text) {
        // Simple deadline extraction - can be enhanced
        const deadlineMatch = text.match(/by\s+([\w\s,]+)/i);
        return deadlineMatch ? deadlineMatch[1] : null;
    }
}
