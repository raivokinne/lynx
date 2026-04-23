// Input validation utilities - reusable validators for request data

// Built-in validator functions
export const validators = {
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (min) => (value, fieldName) => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  email: (value, fieldName) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${fieldName} must be a valid email`;
    }
    return null;
  },

  pattern: (regex, message) => (value, fieldName) => {
    if (value && !regex.test(value)) {
      return message || `${fieldName} is invalid`;
    }
    return null;
  },
};

// Validate an object against a schema
export const validate = (data, schema) => {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Common validation schemas
export const schemas = {
  register: (data) => validate(data, {
    username: [validators.required, validators.minLength(3), validators.maxLength(32), validators.pattern(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, hyphens, and underscores")],
    password: [validators.required, validators.minLength(8), validators.maxLength(20)],
    confirmPassword: [validators.required],
  }),

  login: (data) => validate(data, {
    username: [validators.required],
    password: [validators.required],
  }),

  saveCode: (data) => validate(data, {
    title: [validators.maxLength(100)],
    code: [validators.required],
  }),

  updateCode: (data) => validate(data, {
    id: [validators.required],
    code: [validators.required],
  }),

  shareCode: (data) => validate(data, {
    codeId: [validators.required],
  }),
};

export default { validators, validate, schemas };