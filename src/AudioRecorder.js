// src/AudioRecorder.js
export class AudioRecorder {
    constructor() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            throw new Error('Speech recognition is not supported in this browser');
        }

        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isRecording = false;
        this.transcriptCallback = null;
    }

    setTranscriptCallback(callback) {
        this.transcriptCallback = callback;
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (this.transcriptCallback) {
                this.transcriptCallback(finalTranscript, interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.recognition.start();
                this.isRecording = true;
                
                this.recognition.onstart = () => {
                    console.log('Speech recognition started');
                    resolve();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.recognition.stop();
            this.isRecording = false;
            this.recognition.onend = () => {
                console.log('Speech recognition stopped');
                resolve();
            };
        });
    }
}