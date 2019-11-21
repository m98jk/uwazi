/** @format */

import { EntitySchema } from 'api/entities/entityType';
import db from 'api/utils/testing_db';
import { extractSequence, modelName } from '../common';
import fixtures, { template1 } from './fixtures';

describe('templates utils', () => {
  beforeEach(async () => {
    await db.clearAllAndLoad(fixtures);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('modelName', () => {
    process.env.DATABASE_NAME = 'test-db';
    expect(modelName('Abc-D e')).toBe('test-db-abc-d_e');
  });

  describe('extractSequence', () => {
    it('should ignore non-text fields, no title', async () => {
      const entity: EntitySchema = { template: template1 };
      const result = await extractSequence(entity);
      expect(result).toBe('');
    });
    it('should ignore non-text fields, with title', async () => {
      const entity: EntitySchema = { template: template1, title: 'hello' };
      const result = await extractSequence(entity);
      expect(result).toBe('hello');
    });
    it('should ignore non-text fields, with title', async () => {
      const entity: EntitySchema = {
        template: template1,
        title: 'hello',
        metadata: { date: [{ value: 10 }] },
      };
      const result = await extractSequence(entity);
      expect(result).toBe('hello');
    });
    it('should ignore non-single fields', async () => {
      const entity: EntitySchema = {
        template: template1,
        title: 'hello',
        metadata: { date: [{ value: 10 }], text: [] },
      };
      const result = await extractSequence(entity);
      expect(result).toBe('hello');
    });
    it('should use text fields', async () => {
      const entity: EntitySchema = {
        template: template1,
        title: 'hello',
        metadata: { date: [{ value: 10 }], text: [{ value: 'world' }] },
      };
      const result = await extractSequence(entity);
      expect(result).toBe('hello world');
    });
  });
});
