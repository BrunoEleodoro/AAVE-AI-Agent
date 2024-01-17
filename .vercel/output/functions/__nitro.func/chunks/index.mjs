import { e as eventHandler } from './nitro/vercel.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

const index = eventHandler((event) => {
  const address = event.context.params.name;
  return { nitro: "Is Awesome!", address };
});

export { index as default };
//# sourceMappingURL=index.mjs.map
