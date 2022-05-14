import { Dynamometer } from '../src';
import { deleteTable } from './utils/deleteTable';
import { createTable } from './utils/createTable';

describe('Document ', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await deleteTable();
    await createTable();
    let uuidCounter = -1;
    dynamometer = Dynamometer.create({
      tableName,
      dynamoDBClientConfig: {
        endpoint: 'http://localhost:8000/',
        region: 'eu-central-1',
      },
      uuidFunction() {
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

    expect(response.Item).toStrictEqual({
      PK: 'POSTS',
      SK: '1234',
      test: 'test',
    });
  });

  test('get', async () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    await doc.set({
      name: 'test',
    });
    const response = await doc.get();
    expect(response.Item).toStrictEqual({
      PK: 'POSTS',
      SK: '1234',
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
    expect(response.Item).toBe(undefined);
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
    expect(response.Item).toStrictEqual({
      PK: 'POSTS',
      SK: '1234',
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
    expect(response.Item).toStrictEqual({
      PK: 'POSTS',
      SK: '1234',
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
