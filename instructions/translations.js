let currentLanguage = 'en';

function setLanguage(lang) {
    if (['en', 'te', 'hi'].includes(lang)) {
        currentLanguage = lang;
        // Trigger an event or call a global function to update UI
        if (typeof updateDirectionsUI === 'function') {
            updateDirectionsUI();
        }
    }
}

function getInstructionString(type, label, lang = currentLanguage) {
    const template = instructionTemplates[type];
    if (template && template[lang]) {
        return template[lang](label);
    }
    // Fallback to English if translation missing
    if (template && template['en']) {
        return template['en'](label);
    }
    return `${type} ${label}`;
}
