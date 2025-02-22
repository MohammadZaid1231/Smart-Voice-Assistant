// src/index.js
import { AudioRecorder } from './AudioRecorder';
import { TranscriptionService } from './TranscriptionService';
import { UIController } from './UIController';
import html2pdf from 'html2pdf.js';

class VoiceAssistant {
    constructor() {
        this.audioRecorder = new AudioRecorder();
        this.transcriptionService = new TranscriptionService();
        this.uiController = new UIController();
        this.currentTranscript = '';
        
        // Debug log for API key
        console.log('Gemini API initialized');
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        console.log('Voice Assistant initialized');
    }
setupSpeechRecognition() {
    this.audioRecorder.setTranscriptCallback((finalTranscript, interimTranscript) => {
        // Update UI with interim results
        const currentText = this.currentTranscript + interimTranscript;
        this.uiController.updateTranscription(currentText);
        
        // If we have final transcript, append it
        if (finalTranscript) {
            this.currentTranscript += finalTranscript;
            this.uiController.updateTranscription(this.currentTranscript);
            
            // Enable/disable buttons based on content
            this.uiController.toggleAnalysisButtons(!!this.currentTranscript.trim());
            // Only enable action buttons if we have content
            if (this.currentTranscript.trim()) {
                this.uiController.toggleActionButtons(true);
            }
        }
    });
}

    setupEventListeners() {
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        const summarizeBtn = document.getElementById('summarizeBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (startBtn && stopBtn) {
            startBtn.addEventListener('click', () => this.startRecording());
            stopBtn.addEventListener('click', () => this.stopRecording());
        }

        if (summarizeBtn) {
            summarizeBtn.addEventListener('click', () => this.summarizeContent());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeContent());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }
    }

    async startRecording() {
        try {
            this.uiController.updateStatus('Starting recording...');
            this.currentTranscript = '';
            await this.audioRecorder.start();
            this.uiController.updateStatus('Recording in progress...');
            this.uiController.toggleButtons(true);
            this.uiController.toggleAnalysisButtons(false);
            this.uiController.toggleActionButtons(false);
            
            // Hide previous results
            document.getElementById('summarySection').classList.add('hidden');
            document.getElementById('analysisSection').classList.add('hidden');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.uiController.updateStatus('Error: ' + error.message);
            this.uiController.toggleButtons(false);
        }
    }

    async stopRecording() {
        try {
            this.uiController.updateStatus('Stopped recording...');
            await this.audioRecorder.stop();
            
            if (this.currentTranscript.trim()) {
                this.uiController.updateStatus('Ready for analysis');
                this.uiController.toggleAnalysisButtons(true);
                this.uiController.toggleActionButtons(true);
            }

            this.uiController.toggleButtons(false);
        } catch (error) {
            console.error('Error stopped recording:', error);
            this.uiController.updateStatus('Error: ' + error.message);
            this.uiController.toggleButtons(false);
        }
    }

    async summarizeContent() {
        try {
            if (!this.currentTranscript.trim()) {
                this.uiController.updateStatus('No content to summarize');
                return;
            }

            this.uiController.showLoadingIndicator(true);
            this.uiController.updateStatus('Generating summary...');
            
            const summary = await this.transcriptionService.summarizeContent(this.currentTranscript);
            this.uiController.updateSummary(summary);
            
            this.uiController.updateStatus('Summary generated');
            this.uiController.showLoadingIndicator(false);
        } catch (error) {
            console.error('Error generating summary:', error);
            this.uiController.updateStatus('Error: ' + error.message);
            this.uiController.showLoadingIndicator(false);
        }
    }

    async analyzeContent() {
        try {
            if (!this.currentTranscript.trim()) {
                this.uiController.updateStatus('No content to analyze');
                return;
            }

            this.uiController.showLoadingIndicator(true);
            this.uiController.updateStatus('Analyzing content...');
            
            // Get combined analysis (summary and categories)
            const analysis = await this.transcriptionService.analyzeCombined(this.currentTranscript);
            this.uiController.updateCombinedAnalysis(analysis);
            
            this.uiController.updateStatus('Analysis complete');
            this.uiController.showLoadingIndicator(false);
            this.uiController.toggleActionButtons(true);
        } catch (error) {
            console.error('Error analyzing content:', error);
            this.uiController.updateStatus('Error: ' + error.message);
            this.uiController.showLoadingIndicator(false);
        }
    }

    clearAll() {
        try {
            this.currentTranscript = '';
            this.uiController.clearAll();
            console.log('All data cleared');
        } catch (error) {
            console.error('Error clearing data:', error);
            this.uiController.updateStatus('Error clearing data');
        }
    }

    async exportToPDF() {
        try {
            if (!this.currentTranscript.trim()) {
                this.uiController.updateStatus('No content to export');
                return;
            }

            this.uiController.updateStatus('Generating PDF...');
            this.uiController.showLoadingIndicator(true);

            // Create content for PDF
            const content = document.createElement('div');
            content.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">
                        Voice Assistant Analysis
                    </h1>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #34495e; margin-bottom: 10px;">Transcript</h2>
                        <p style="line-height: 1.6;">${this.currentTranscript}</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #34495e; margin-bottom: 10px;">Summary</h2>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                            ${document.getElementById('summaryContent').innerHTML}
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #34495e; margin-bottom: 10px;">Analysis</h2>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                            ${document.getElementById('analysisSection').innerHTML}
                        </div>
                    </div>

                    <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                        Generated on: ${new Date().toLocaleString()}
                    </div>
                </div>
            `;

            const opt = {
                margin: 1,
                filename: `voice-analysis-${new Date().toISOString().slice(0,10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(content).save();
            
            this.uiController.updateStatus('PDF exported successfully');
            this.uiController.showLoadingIndicator(false);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.uiController.updateStatus('Error exporting PDF');
            this.uiController.showLoadingIndicator(false);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistant();
});