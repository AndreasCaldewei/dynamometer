import { checkDocumentPath } from '../src/utils/checkDocumentPath';

describe('checkDocumentPath', () => {
  const delimiter = '#';

  it('should throw an error if path represents a collection', () => {
    const path = 'myCollection';
    expect(() => checkDocumentPath(path, delimiter)).toThrowError(
      'This is a path for a Collection!'
    );
  });

  it('should return segments if path is valid for a document', () => {
    const path = 'myCollection#myDocument';
    const result = checkDocumentPath(path, delimiter);
    expect(result).toEqual(['myCollection', 'myDocument']);
  });

  it('should return segments for deeper document paths', () => {
    const path = 'parentCollection#docId#childCollection#childDocId';
    const result = checkDocumentPath(path, delimiter);
    expect(result).toEqual([
      'parentCollection',
      'docId',
      'childCollection',
      'childDocId',
    ]);
  });
});
