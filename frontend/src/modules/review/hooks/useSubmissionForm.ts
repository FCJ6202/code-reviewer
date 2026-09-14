import { useCallback, useMemo, useState } from 'react';
import { byteLength, countLines } from '@/lib/code';
import { formatBytes } from '@/lib/format';
import { detectLanguage } from '@/lib/language';
import { MAX_CODE_BYTES } from '@/config/review';
import type { ReviewRequest } from '@/types';

export const MAX_CODE_LABEL = `${MAX_CODE_BYTES / 1024} KB`;

export function useSubmissionForm() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const bytes = useMemo(() => byteLength(code), [code]);
  const lineCount = useMemo(() => countLines(code), [code]);
  const tooLarge = bytes > MAX_CODE_BYTES;

  const loadFile = useCallback(async (file: File) => {
    if (file.size > MAX_CODE_BYTES) {
      setFileError(`${file.name} is ${formatBytes(file.size)}. The limit is ${MAX_CODE_LABEL}.`);
      return;
    }
    setFileError(null);
    setFilename(file.name);
    setCode(await file.text());
  }, []);

  const request: ReviewRequest = { code, filename: filename.trim() };

  return {
    code,
    setCode,
    filename,
    setFilename,
    language: detectLanguage(filename),
    bytes,
    lineCount,
    tooLarge,
    fileError,
    loadFile,
    canSubmit: code.trim() !== '' && !tooLarge,
    request,
  };
}

export type SubmissionForm = ReturnType<typeof useSubmissionForm>;
