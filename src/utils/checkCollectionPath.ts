export const checkCollectionPath = (path: string, delimiter: string) => {
  if (path.charAt(0) === delimiter) {
    throw new Error(`Collection name can not start with char "${delimiter}".`);
  }

  const segments = path.split(delimiter);

  if (segments.length % 2 == 0) {
    throw new Error('This is a path for a document!');
  }

  return segments;
};
