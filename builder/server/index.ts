import { buildApp } from './app.ts';

const app = await buildApp();
try {
  await app.listen({ host: '127.0.0.1', port: 4310 });
  app.log.info('Builder API listening on http://127.0.0.1:4310');
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
  await app.close();
}
