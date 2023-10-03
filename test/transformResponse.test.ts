import { transformResponse } from '../src/utils/transformResponse';

describe('transformResponse', () => {
  const config = {
    partitionKey: 'PK',
    sortKey: 'SK',
    idField: 'id',
    tableName: 'testTable', // This field is not used in the function but is required by the type
    delimiter: '#', // This field is not used in the function but is required by the type
    generateId: () => '12345', // This field is not used in the function but is required by the type
  };

  it('should transform the response by replacing sortKey with idField', () => {
    const response = {
      PK: 'myCollection',
      SK: 'myDocument',
      name: 'John Doe',
      age: 30,
    };

    const transformed = transformResponse(response, config);
    expect(transformed).toEqual({
      name: 'John Doe',
      age: 30,
      id: 'myDocument',
    });
  });

  it('should handle responses without extra fields', () => {
    const response = {
      PK: 'myCollection',
      SK: 'myDocument',
    };

    const transformed = transformResponse(response, config);
    expect(transformed).toEqual({
      id: 'myDocument',
    });
  });
});
