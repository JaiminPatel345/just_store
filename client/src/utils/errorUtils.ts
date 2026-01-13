/**
 * Utility function to extract error message from API error responses
 * Handles different error response formats from the backend
 */
export const extractErrorMessage = (err: any, fallbackMessage: string = 'An error occurred'): string => {
  // Check if it's an axios error with response
  if (err.response?.data) {
    const data = err.response.data;
    
    // Try different possible error message fields
    if (data.error) return data.error;
    if (data.message) return data.message;
    
    // Handle validation errors with field-specific messages
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      if (errorMessages) return errorMessages;
    }
    
    // If response.data is a string, return it
    if (typeof data === 'string') return data;
  }
  
  // Check for error message in the error object itself
  if (err.message) return err.message;
  
  // Fallback to the provided fallback message
  return fallbackMessage;
};
