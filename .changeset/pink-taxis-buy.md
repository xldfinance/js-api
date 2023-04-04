---
'@xld-sdk/js-api': major
---

# Initial release of XLD Javascript API SDK

The **@xld-sdk/js-api** SDK provides an easier way to interacte with the XLD API using javascript/typescript.

## Getting Started

Install using your favorite package manager:

```bash
# Using NPM
npm install "@xld-sdk/js-api"

# Or using yarn
yarn add "@xld-sdk/js-api"
```

**for usage in Node.js version < 18**, you will need to install the `isomorphic-unfetch` package.

### Usage examples

You can get started by importing the method you want to call in your project.

```ts
import { getEstimate } from '@xld-js/api';

async function main() {
  try {
    const estimate = await getEstimate();
    console.log(estimate);
  } catch (error) {
    // Handle Error
    console.log(error);
  }
}

main();
```

Example usage in react:

```tsx
import { useState } from 'react';
import { type Estimate, getEstimate } from '@xld-js/api';

type Status = 'idle' | 'pending' | 'resolved' | 'rejected';

export default function App() {
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [estimate, setEstimate] = useState<Estimate>();

  const isLoading = status === 'pending';
  const isError = status === 'rejected' && error;
  const isSuccess = status === 'resolved' && typeof estimate !== undefined;

  const handleClick = async () => {
    try {
      setStatus('pending');
      setError('');

      const data = await getEstimate();

      setEstimate(data);
      setStatus('resolved');
    } catch (err) {
      setError(err.message);
      setStatus('rejected');
    }
  };

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isLoading}>
        Get gas fee estimate
      </button>

      {isLoading && <p>Fetching gas fee estiamte...</p>}
      {isError && error && <p>{error}</p>}
      {isSuccess && (
        <div>
          <p>Gas Fee Estimate:</p>
          <pre>{JSON.stringify(estimate, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Configure Environment

By default the SDK is running in development environment. Once you're ready to move to production, you can set the environment to production using the config manager.

```ts
import { getConfigManager } from '@xld-js/api';

const configManager = getConfigManager();

if (process.env.NODE_ENV === 'production') {
  configManager.setEnvironment('production');
}

// Or using getConfigManager options
if (process.env.NODE_ENV === 'production') {
  getConfigManager({ environment: 'production' });
}
```

Now, you're application will be using the production version of the SDK.

### Authentication

To authenticate, on your server call the authenticate method passing your credentials.

```ts
import { authenticate } from '@xld-js/api';

async function main() {
  try {
    await authenticate({ public: 'accessKey', secret: 'secretKey' });
  } catch (error) {
    // Handle Error
    console.log(error);
  }
}

main();
```

Now, you're application is authorized to call all endpoints.
