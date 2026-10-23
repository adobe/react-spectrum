/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export function matchMimeType(mimeType: string | undefined, acceptedMimeTypes: string[]): boolean {
  if (!mimeType) {
    return false;
  }

  return acceptedMimeTypes.some(type => {
    if (type === '*/*') {
      return true;
    }
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.slice(0, -2));
    }
    return mimeType === type;
  });
}

const MIME_TYPE_LABELS: Record<string, string> = {
  'application/json': 'JSON',
  'application/msword': 'DOC',
  'application/pdf': 'PDF',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/zip': 'ZIP',
  'audio/mpeg': 'MP3',
  'image/gif': 'GIF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/svg+xml': 'SVG',
  'image/webp': 'WEBP',
  'text/csv': 'CSV',
  'text/plain': 'TXT'
};

export function getMimeTypeLabel(mimeType: string): string | null {
  let mappedLabel = MIME_TYPE_LABELS[mimeType];
  if (mappedLabel) {
    return mappedLabel;
  }

  let subtype = mimeType.split('/')[1];
  if (!subtype) {
    return null;
  }

  subtype =
    subtype
      .replace(/^(x-|vnd\.)/, '')
      .split(/[+.]/)
      .pop() || subtype;
  return subtype.slice(0, 4).toUpperCase();
}
