/**
 * Validates a file before CSV upload.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateCSVFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check extension
  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv')) {
    return {
      valid: false,
      error: `Invalid file type: "${file.name}". Only CSV files are accepted.`,
    };
  }

  // Check MIME type (loose check — some systems report different MIME for CSV)
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'application/csv',
  ];
  if (file.type && !validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unexpected file type: "${file.type}". Please upload a valid CSV file.`,
    };
  }

  // Check size (50 MB limit)
  const MAX_SIZE_MB = 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`,
    };
  }

  // Check not empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The file is empty. Please upload a CSV with data.',
    };
  }

  return { valid: true, error: null };
}
