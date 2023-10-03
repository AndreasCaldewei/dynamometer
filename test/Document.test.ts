import { Dynamometer } from '../src';
import { deleteTable } from './utils/deleteTable';
import { createTable } from './utils/createTable';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { delay } from './utils/delay';

describe('Document ', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await delay();
    await deleteTable();
    await delay();
    await createTable();
    await delay();

    let uuidCounter = -1;
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

    dynamometer = Dynamometer.fromDynamoDBDocument(dynamoDBDocument, {
      tableName,
      generateId() {
        uuidCounter = uuidCounter + 1;
        return uuidCounter.toString();
      },
    });
  });

  test('set', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');

    await doc.set({
      name: 'test',
    });

    await doc.set({
      test: 'test',
    });

    const response = await doc.get();

    expect(response).toStrictEqual({
      id: '1234',
      test: 'test',
    });
  });

  test('get', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    await doc.set({
      name: 'test',
    });
    const response = await doc.get();
    expect(response).toStrictEqual({
      id: '1234',
      name: 'test',
    });
  });

  test('delete', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    await doc.set({
      name: 'test',
    });
    await doc.delete();
    const response = await doc.get();
    expect(response).toBe(null);
  });

  test('update', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    await doc.set({
      name: 'test',
      text: 'test',
    });
    await doc.update({
      name: 'name',
      property: 'property',
    });
    const response = await doc.get();
    expect(response).toStrictEqual({
      id: '1234',
      name: 'name',
      property: 'property',
      text: 'test',
    });
  });

  test('update - nested', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    await doc.set({
      name: 'test',
      text: 'test',
      obj: {
        name: 'test',
        text: 'test',
      },
    });
    await doc.update({
      name: 'name',
      property: 'property',
      obj: {
        text: 'text',
      },
    });
    const response = await doc.get();
    expect(response).toStrictEqual({
      id: '1234',
      name: 'name',
      property: 'property',
      obj: {
        name: 'test',
        text: 'text',
      },
      text: 'test',
    });
  });
});
