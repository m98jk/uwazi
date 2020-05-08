import { AsyncLocalStorage } from 'async_hooks';
import { EventEmitter } from 'events';
import { MultiTenantConfig } from 'api/config/tenancy';

type Tenant = {
  name: string;
};

class Tenants extends EventEmitter {
  storage = new AsyncLocalStorage();

  async run(store: Tenant, cb: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.run(store, () => {
        cb()
          .then(resolve)
          .catch(reject);
      });
    });
  }

  current() {
    if (!MultiTenantConfig.active) {
      return 'default';
    }

    const store = this.storage.getStore() as Tenant;
    if (!store) {
      throw new Error(
        'There is no tenant on the current async context, multi tenancy is activated there should always be a tenant'
      );
    }
    return store.name;
  }

  add(tenant: Tenant) {
    this.emit('newTenant', tenant.name);
  }
}

const tenants = new Tenants();
tenants.setMaxListeners(17);

export { tenants };
