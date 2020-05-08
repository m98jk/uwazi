import { tenants } from 'api/odm/tenantContext';

const { DATABASE_NAME, INDEX_NAME } = process.env;

const indexes = {
  demo: INDEX_NAME || DATABASE_NAME || 'uwazi_demo',
  development: INDEX_NAME || DATABASE_NAME || 'uwazi_development',
  testing: INDEX_NAME || DATABASE_NAME || 'testing',
  production: INDEX_NAME || DATABASE_NAME || 'uwazi_development',
  getIndex: () => {
    const tenant = tenants.current();
    if (tenant === 'default') {
      return indexes.index;
    }
    return tenant;
  },
};

export default indexes;
