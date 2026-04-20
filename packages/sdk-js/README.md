# @openyoda/sdk

Official JavaScript/TypeScript SDK for the Yoda.ai API.

```ts
import { Yoda } from '@openyoda/sdk';
const yoda = new Yoda({ apiKey: process.env.YODA_API_KEY! });
const { text } = await yoda.ask('should I take the offer?');
```

> Status: scaffold.
