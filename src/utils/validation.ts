/**
 * Input validation and sanitization utilities
 */

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_CATEGORY_LENGTH = 50;

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Validate task title
 */
export const validateTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  const sanitized = sanitizeText(title);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Title contains invalid characters' };
  }
  
  if (sanitized.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be less than ${MAX_TITLE_LENGTH} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate date string (ISO 8601 format: YYYY-MM-DD)
 */
export const validateDate = (date: string): { valid: boolean; error?: string } => {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  
  return { valid: true };
};

/**
 * Validate time string (24-hour format: HH:mm)
 */
export const validateTime = (time?: string): { valid: boolean; error?: string } => {
  if (!time) {
    return { valid: true }; // Time is optional
  }
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Invalid time format. Expected HH:mm (24-hour)' };
  }
  
  return { valid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description?: string): { valid: boolean; error?: string } => {
  if (!description) {
    return { valid: true }; // Description is optional
  }
  
  const sanitized = sanitizeText(description);
  
  if (sanitized.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate priority
 */
export const validatePriority = (priority?: string): { valid: boolean; error?: string } => {
  if (!priority) {
    return { valid: true }; // Priority is optional
  }
  
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return { valid: false, error: 'Invalid priority. Must be low, medium, or high' };
  }
  
  return { valid: true };
};

/**
 * Validate category
 */
export const validateCategory = (category?: string): { valid: boolean; error?: string } => {
  if (!category) {
    return { valid: true }; // Category is optional
  }
  
  const sanitized = sanitizeText(category);
  
  if (sanitized.length > MAX_CATEGORY_LENGTH) {
    return { valid: false, error: `Category must be less than ${MAX_CATEGORY_LENGTH} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate entire task object
 */
export const validateTask = (task: {
  title: string;
  date: string;
  time?: string;
  description?: string;
  priority?: string;
  category?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const titleCheck = validateTitle(task.title);
  if (!titleCheck.valid && titleCheck.error) {
    errors.push(titleCheck.error);
  }
  
  const dateCheck = validateDate(task.date);
  if (!dateCheck.valid && dateCheck.error) {
    errors.push(dateCheck.error);
  }
  
  const timeCheck = validateTime(task.time);
  if (!timeCheck.valid && timeCheck.error) {
    errors.push(timeCheck.error);
  }
  
  const descriptionCheck = validateDescription(task.description);
  if (!descriptionCheck.valid && descriptionCheck.error) {
    errors.push(descriptionCheck.error);
  }
  
  const priorityCheck = validatePriority(task.priority);
  if (!priorityCheck.valid && priorityCheck.error) {
    errors.push(priorityCheck.error);
  }
  
  const categoryCheck = validateCategory(task.category);
  if (!categoryCheck.valid && categoryCheck.error) {
    errors.push(categoryCheck.error);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
