export const checkDocumentPath = (path: string, delimiter: string) => {
  const segments = path.split(delimiter);

  if (segments.length % 2 == 1) {
    throw new Error('This is a path for a Collection!');
  }

  return segments;
};
