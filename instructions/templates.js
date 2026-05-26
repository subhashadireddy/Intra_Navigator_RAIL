const instructionTemplates = {
    walkway: {
        en: (label) => `Walk along ${label}`,
        te: (label) => `${label} గుండా నడవండి`,
        hi: (label) => `${label} के साथ चलें`
    },
    fob: {
        en: (label) => `Continue on the ${label}`,
        te: (label) => `${label} పై కొనసాగండి`,
        hi: (label) => `${label} पर आगे बढ़ें`
    },
    stairs: {
        en: (label) => `Use the stairs`,
        te: (label) => `మెట్లు ఉపయోగించండి`,
        hi: (label) => `सीढ़ियों का उपयोग करें`
    },
    ramp: {
        en: (label) => `Use the ramp`,
        te: (label) => `ర్యాంప్ ఉపయోగించండి`,
        hi: (label) => `रैंप का उपयोग करें`
    },
    escalator: {
        en: (label) => `Use the escalator`,
        te: (label) => `ఎస్కలేటర్ ఉపయోగించండి`,
        hi: (label) => `एस्केलेटर का उपयोग करें`
    },
    lift: {
        en: (label) => `Take the lift`,
        te: (label) => `లిఫ్ట్ తీసుకోండి`,
        hi: (label) => `लिफ्ट लें`
    },
    gate: {
        en: (label) => `Exit through ${label}`,
        te: (label) => `${label} ద్వారా బయటకు వెళ్ళండి`,
        hi: (label) => `${label} से बाहर निकलें`
    },
    arrive: {
        en: (label) => `Arrive at your destination`,
        te: (label) => `మీ గమ్యస్థానానికి చేరుకోండి`,
        hi: (label) => `अपने गंतव्य पर पहुंचें`
    }
};
