interface ParsedTask {
  title: string;
  date: string;
  time?: string;
}

export const parseVoiceInput = (transcript: string): ParsedTask | null => {
  try {
    const lowerTranscript = transcript.toLowerCase();
    
    const dateMatch = extractDate(lowerTranscript);
    const timeMatch = extractTime(lowerTranscript);
    const title = extractTitle(lowerTranscript, dateMatch, timeMatch);
    
    if (!title || !dateMatch) {
      return null;
    }
    
    return {
      title,
      date: dateMatch,
      time: timeMatch || undefined,
    };
  } catch (error) {
    console.error('Voice parsing error:', error);
    return null;
  }
};

const extractDate = (text: string): string | null => {
  const today = new Date();
  
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }
  
  if (text.includes('today')) {
    return formatDate(today);
  }
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const fullDateRegex = /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i;
  const fullDateMatch = text.match(fullDateRegex);
  
  if (fullDateMatch) {
    const day = parseInt(fullDateMatch[1]);
    const monthIndex = monthNames.indexOf(fullDateMatch[2].toLowerCase());
    const year = parseInt(fullDateMatch[3]);
    
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day);
      return formatDate(date);
    }
  }
  
  const shortDateRegex = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i;
  const shortDateMatch = text.match(shortDateRegex);
  
  if (shortDateMatch) {
    const monthIndex = monthNames.indexOf(shortDateMatch[1].toLowerCase());
    const day = parseInt(shortDateMatch[2]);
    const year = today.getFullYear();
    
    if (monthIndex !== -1) {
      const date = new Date(year, monthIndex, day);
      if (date < today) {
        date.setFullYear(year + 1);
      }
      return formatDate(date);
    }
  }
  
  const nextWeekdayRegex = /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
  const nextWeekdayMatch = text.match(nextWeekdayRegex);
  
  if (nextWeekdayMatch) {
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(nextWeekdayMatch[1].toLowerCase());
    
    const date = new Date(today);
    const currentDay = date.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilTarget);
    
    return formatDate(date);
  }
  
  return null;
};

const extractTime = (text: string): string | null => {
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const timeMatch = text.match(timeRegex);
  
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3]?.toLowerCase();
    
    if (period && period.startsWith('p') && hours < 12) {
      hours += 12;
    } else if (period && period.startsWith('a') && hours === 12) {
      hours = 0;
    } else if (!period && hours < 12 && text.includes('afternoon')) {
      hours += 12;
    } else if (!period && hours < 12 && text.includes('evening')) {
      hours += 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if (text.includes('morning')) {
    return '09:00';
  } else if (text.includes('afternoon')) {
    return '14:00';
  } else if (text.includes('evening')) {
    return '18:00';
  } else if (text.includes('night')) {
    return '20:00';
  }
  
  return null;
};

const extractTitle = (text: string, date: string | null, time: string | null): string => {
  let title = text;
  
  const patterns = [
    /set task (on|for|at)?\s*/i,
    /create task (on|for|at)?\s*/i,
    /add task (on|for|at)?\s*/i,
    /remind me (to|about|of)?\s*/i,
    /schedule (a|an)?\s*/i,
    /task (on|for|at)?\s*/i,
  ];
  
  patterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  const datePatterns = [
    /on\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
    /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(tomorrow|today)/i,
  ];
  
  datePatterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  const timePatterns = [
    /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i,
    /(in the )?(morning|afternoon|evening|night)/i,
  ];
  
  timePatterns.forEach(pattern => {
    title = title.replace(pattern, '');
  });
  
  title = title.replace(/\s+as\s+/i, ' ');
  title = title.replace(/\s+called\s+/i, ' ');
  title = title.replace(/\s+named\s+/i, ' ');
  
  title = title.trim().replace(/\s+/g, ' ');
  
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
