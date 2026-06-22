interface SplitOptions {
  chunkSize: number;
  chunkOverlap: number;
}

const DEFAULT_OPTIONS: SplitOptions = {
  chunkSize: 500,
  chunkOverlap: 50,
};

export function splitText(text: string, options: SplitOptions = DEFAULT_OPTIONS): string[] {
  const { chunkSize, chunkOverlap } = { ...DEFAULT_OPTIONS, ...options };
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.substring(start, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const lastSpace = chunk.lastIndexOf(' ');

      let splitPoint = -1;
      if (lastPeriod > chunkSize * 0.7) {
        splitPoint = lastPeriod + 1;
      } else if (lastNewline > chunkSize * 0.7) {
        splitPoint = lastNewline + 1;
      } else if (lastSpace > chunkSize * 0.7) {
        splitPoint = lastSpace + 1;
      }

      if (splitPoint > 0) {
        chunk = text.substring(start, start + splitPoint);
        start += splitPoint;
      } else {
        start += chunkSize;
      }
    } else {
      start += chunkSize;
    }

    chunks.push(chunk.trim());
    start -= chunkOverlap;
    if (start < 0) start = 0;
  }

  return chunks.filter(chunk => chunk.length > 50);
}

export function extractTitle(text: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.slice(2).trim();
    }
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('>')) {
      return trimmed.substring(0, 100).trim();
    }
  }
  return 'Untitled';
}
