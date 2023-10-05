import { Dynamometer } from '../src';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { deleteTable } from './utils/deleteTable';
import { createTable } from './utils/createTable';
import { delay } from './utils/delay';

describe('Document', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await delay();
    await deleteTable();
    await delay();
    await createTable();
    await delay();

    const dynamoDBDocument = DynamoDBDocument.from(
      new DynamoDBClient({
        endpoint: 'http://localhost:8000/',
        region: 'eu-central-1',
      }),
      {
        marshallOptions: {
          convertEmptyValues: false,
          removeUndefinedValues: false,
          convertClassInstanceToMap: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      }
    );

    let uuidCounter = -1;
    dynamometer = Dynamometer.fromDynamoDBDocument(dynamoDBDocument, {
      tableName,
      generateId: () => (++uuidCounter).toString(),
    });
  });

  afterEach(async () => {
    await delay();
    await deleteTable();
    await delay();
  });

  const setupDocument = (id?: string) =>
    dynamometer.collection('POSTS').doc(id);

  test('should set and overwrite data', async () => {
    const doc = setupDocument('1234');
    await doc.set({ name: 'test' });
    await doc.set({ test: 'test' });

    const response = await doc.get();
    expect(response).toStrictEqual({ id: '0', test: 'test' });
  });

  test('should set data with generated UUID', async () => {
    const doc = setupDocument();
    await doc.set({ name: 'test' });
    await doc.set({ test: 'test2' });

    const response = await doc.get();
    expect(response).toStrictEqual({ id: '0', test: 'test2' });
  });

  test('should retrieve data', async () => {
    const doc = setupDocument('1234');
    await doc.set({ name: 'test' });

    const response = await doc.get();
    expect(response).toStrictEqual({ id: '0', name: 'test' });
  });

  test('should delete data', async () => {
    const doc = setupDocument('1234');
    await doc.set({ name: 'test' });
    await doc.delete();

    const response = await doc.get();
    expect(response).toBe(null);
  });

  test('should update data', async () => {
    const doc = setupDocument('1234');
    await doc.set({ name: 'test', text: 'test' });
    await doc.update({ name: 'name', property: 'property' });

    const response = await doc.get();
    expect(response).toStrictEqual({
      id: '0',
      name: 'name',
      property: 'property',
      text: 'test',
    });
  });

  test('should update nested data', async () => {
    const doc = setupDocument('1234');
    await doc.set({
      name: 'test',
      text: 'test',
      obj: { name: 'test', text: 'test' },
    });
    await doc.update({
      name: 'name',
      property: 'property',
      obj: { text: 'text' },
    });

    const response = await doc.get();
    expect(response).toStrictEqual({
      id: '0',
      name: 'name',
      property: 'property',
      obj: { name: 'test', text: 'text' },
      text: 'test',
    });
  });
});
