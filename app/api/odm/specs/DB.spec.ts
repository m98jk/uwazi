import mongoose, { Connection } from 'mongoose';
import { tenants } from 'api/odm/tenantContext';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db } from 'mongodb';

import * as DB from '../DB';

import { instanceModel } from '../model';

const testSchema = new mongoose.Schema({
  name: { type: String, index: true },
  value: String,
  text: String,
});

interface TestDoc {
  name: string;
  value?: string;
  text?: string;
}

describe('ODM Model multi-tenant', () => {
  let db1: Db;
  let db2: Db;
  let defaultDb: Db;
  let mongod: MongoMemoryServer;
  let mongoUri: string;
  let defaultConnection: Connection;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    mongoUri = await mongod.getUri();
  });

  beforeEach(async () => {
    defaultConnection = await DB.connect(mongoUri);

    defaultDb = defaultConnection.db;
    db1 = defaultConnection.useDb('db1').db;
    db2 = defaultConnection.useDb('db2').db;
    await db1.collection('docs').deleteMany({});
    await db2.collection('docs').deleteMany({});
  });

  afterEach(async () => {
    //no types for mongoose 5.9 yet
    //@ts-ignore
    await mongoose.deleteModel('docs');
    await mongoose.disconnect();
  });

  const instanceTestingModel = () => {
    const testingModel = instanceModel<TestDoc>('docs', testSchema);
    tenants.add({ name: 'db1' });
    tenants.add({ name: 'db2' });
    return testingModel;
  };

  const waitForIndexes = async (time = 1000) => new Promise(resolve => setTimeout(resolve, time));

  describe('instance', () => {
    it('should create indexes', async () => {
      instanceTestingModel();

      await waitForIndexes();

      const expected = ['_id_', 'name_1'];

      expect(Object.keys(await db1.collection('docs').indexInformation())).toEqual(expected);
      expect(Object.keys(await db2.collection('docs').indexInformation())).toEqual(expected);
      expect(Object.keys(await defaultDb.collection('docs').indexInformation())).toEqual(expected);
    });

    it('should maintain indexes in sync', async () => {
      const updatedSchema = new mongoose.Schema({
        name: String,
        value: String,
        text: String,
      });

      updatedSchema.index('value');
      updatedSchema.index({ text: 'text' });

      await instanceModel<TestDoc>('docs', updatedSchema);

      tenants.add({ name: 'db1' });
      tenants.add({ name: 'db2' });

      await waitForIndexes();
      const expected = ['_id_', 'name_1', 'value_1', 'text_text'];

      expect(Object.keys(await db1.collection('docs').indexInformation())).toEqual(expected);
      expect(Object.keys(await db2.collection('docs').indexInformation())).toEqual(expected);
      expect(Object.keys(await defaultDb.collection('docs').indexInformation())).toEqual(expected);
    });
  });
});
