import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Card from '../../components/ui/Card';
import { validateCSVFile } from '../../utils/validators';

/**
 * Upload Zone component for Step 2 (Data Exploration) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function UploadZone({ onUpload, isLoading }) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles?.length > 0) {
        toast.error('Invalid file. Only CSV files under 50 MB are accepted.');
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validation = validateCSVFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
          return;
        }
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'text/csv': ['.csv'],
      },
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024,
      disabled: isLoading,
    });

  return (
    <Card>
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive && !isDragReject && 'border-primary bg-primary-bg',
          isDragReject && 'border-danger bg-red-50',
          !isDragActive && !isDragReject && 'border-slate-300 hover:border-primary hover:bg-primary-bg/30',
          isLoading && 'opacity-50 pointer-events-none'
        )}
        role="button"
        aria-label="Drop a CSV file here or click to browse"
      >
        <input {...getInputProps()} aria-label="CSV file upload input" />
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center animate-pulse">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">
                Processing file...
              </p>
            </>
          ) : isDragActive ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">
                Drop your CSV file here
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark">
                  Drop CSV file here or click to browse
                </p>
                <p className="text-xs text-muted mt-1">
                  Accepts .csv files up to 50 MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
