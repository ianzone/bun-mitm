import { createCA } from './createCA';

export function createMITM(domain: string) {
  const ca = createCA(domain);
  const mitm = Bun.serve({
    tls: {
      key: ca.key,
      cert: ca.cert,
    },
    port: 0, // 任意端口
    fetch(req) {
      console.log(req);
      return new Response('Hello from MITM proxy!');
    },
  });
  return mitm;
}
