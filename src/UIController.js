// src/UIController.js
export class UIController {
    constructor() {
        this.statusElement = document.getElementById('status');
        this.transcriptionElement = document.getElementById('transcriptionText');
        this.startButton = document.getElementById('startRecording');
        this.stopButton = document.getElementById('stopRecording');
        this.summarizeButton = document.getElementById('summarizeBtn');
        this.analyzeButton = document.getElementById('analyzeBtn');
        
        this.summarySection = document.getElementById('summarySection');
        this.summaryContent = document.getElementById('summaryContent');
        this.analysisSection = document.getElementById('analysisSection');
        
        this.tasksContainer = document.getElementById('tasks');
        this.eventsContainer = document.getElementById('events');
        this.notesContainer = document.getElementById('notes');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        this.clearButton = document.getElementById('clearBtn');
        this.exportButton = document.getElementById('exportBtn');

        this.initializeTabs();
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    updateTranscription(text) {
        if (this.transcriptionElement) {
            this.transcriptionElement.textContent = text;
            // Enable/disable analysis buttons based on content
            this.toggleAnalysisButtons(!!text.trim());
        }
    }

    toggleButtons(isRecording) {
        if (this.startButton && this.stopButton) {
            this.startButton.disabled = isRecording;
            this.stopButton.disabled = !isRecording;
        }
    }

    toggleAnalysisButtons(enabled) {
        if (this.summarizeButton && this.analyzeButton) {
            this.summarizeButton.disabled = !enabled;
            this.analyzeButton.disabled = !enabled;
        }
    }

    showLoadingIndicator(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.toggle('hidden', !show);
        }
    }

    updateSummary(summary) {
        if (this.summaryContent) {
            this.summaryContent.innerHTML = `<p>${summary}</p>`;
            this.summarySection.classList.remove('hidden');
            this.analysisSection.classList.add('hidden');
        }
    }

    updateAnalysis(analysis) {
        if (this.analysisSection) {
            if (this.tasksContainer) {
                this.tasksContainer.innerHTML = this.createTasksList(analysis.tasks);
            }
            if (this.eventsContainer) {
                this.eventsContainer.innerHTML = this.createEventsList(analysis.events);
            }
            if (this.notesContainer) {
                this.notesContainer.innerHTML = this.createNotesList(analysis.notes);
            }
            
            this.analysisSection.classList.remove('hidden');
            this.summarySection.classList.add('hidden');
        }
    }
    // Add new methods
updateCombinedAnalysis(data) {
    // Update summary first
    if (data.summary) {
        this.summaryContent.innerHTML = `
            <div class="summary-box">
                <h3>Summary</h3>
                <p>${data.summary}</p>
            </div>
        `;
        this.summarySection.classList.remove('hidden');
    }

    // Then update analysis
    if (this.analysisSection) {
        if (this.tasksContainer) {
            this.tasksContainer.innerHTML = this.createTasksList(data.tasks);
        }
        if (this.eventsContainer) {
            this.eventsContainer.innerHTML = this.createEventsList(data.events);
        }
        if (this.notesContainer) {
            this.notesContainer.innerHTML = this.createNotesList(data.notes);
        }
        this.analysisSection.classList.remove('hidden');
    }
}

toggleActionButtons(enabled) {
    if (this.clearButton && this.exportButton) {
        this.clearButton.disabled = !enabled;
        this.exportButton.disabled = !enabled;
    }
}

clearAll() {
    this.transcriptionElement.textContent = 'Your transcribed text will appear here...';
    this.summarySection.classList.add('hidden');
    this.analysisSection.classList.add('hidden');
    this.toggleAnalysisButtons(false);
    this.toggleActionButtons(false);
    this.updateStatus('Ready to record');
}

    createTasksList(tasks) {
        if (!tasks || !tasks.length) {
            return '<p>No tasks found</p>';
        }
        
        return `
            <ul class="tasks-list">
                ${tasks.map(task => `
                    <li class="task-item">
                        <input type="checkbox" id="task-${task.id}">
                        <label for="task-${task.id}">${task.text}</label>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    createEventsList(events) {
        if (!events || !events.length) {
            return '<p>No events found</p>';
        }
        
        return `
            <ul class="events-list">
                ${events.map(event => `
                    <li class="event-item">
                        <h3>${event.title}</h3>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    createNotesList(notes) {
        if (!notes || !notes.length) {
            return '<p>No notes found</p>';
        }
        
        return `
            <ul class="notes-list">
                ${notes.map(note => `
                    <li class="note-item">
                        <p>${note.text}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    }
    //changed
    // Add these methods to your existing UIController class

createShareButtons(content) {
    return `
        <div class="share-buttons">
            <a href="mailto:?subject=Meeting Summary&body=${encodeURIComponent(content)}" 
               class="share-btn email-btn">
                📧 Share via Email
            </a>
            <a href="https://wa.me/?text=${encodeURIComponent(content)}" 
               target="_blank" 
               class="share-btn whatsapp-btn">
                📱 Share via WhatsApp
            </a>
            <button onclick="navigator.clipboard.writeText('${content.replace(/'/g, "\\'")}')" 
                    class="share-btn copy-btn">
                📋 Copy to Clipboard
            </button>
        </div>
    `;
}

updateCombinedAnalysis(data) {
    // Update summary with enhanced version
    if (data.enhancedSummary) {
        this.summaryContent.innerHTML = `
            <div class="meeting-summary">
                <h3>Meeting Summary</h3>
                ${data.enhancedSummary}
                ${this.createShareButtons(data.enhancedSummary)}
            </div>
        `;
        this.summarySection.classList.remove('hidden');
    }

    // Update analysis section
    if (this.analysisSection) {
        // Update tasks
        if (this.tasksContainer) {
            this.tasksContainer.innerHTML = this.createTasksList(data.tasks);
        }
        
        // Update events with calendar links
        if (this.eventsContainer) {
            this.eventsContainer.innerHTML = this.createEventsList(data.events, data.calendarEvents);
        }
        
        // Update notes
        if (this.notesContainer) {
            this.notesContainer.innerHTML = this.createNotesList(data.notes);
        }
        
        this.analysisSection.classList.remove('hidden');
    }
}

createEventsList(events, calendarEvents = []) {
    if (!events || !events.length) {
        return '<p>No events found</p>';
    }
    
    return `
        <ul class="events-list">
            ${events.map((event, index) => `
                <li class="event-item">
                    <h3>${event.title}</h3>
                    ${event.datetime ? `
                        <p class="event-time">
                            ${new Date(event.datetime.startTime).toLocaleString()}
                        </p>
                    ` : ''}
                    ${calendarEvents[index]?.calendarLink ? `
                        <a href="${calendarEvents[index].calendarLink}" 
                           target="_blank" 
                           class="calendar-link">
                            📅 Add to Google Calendar
                        </a>
                    ` : ''}
                </li>
            `).join('')}
        </ul>
    `;
}    
}