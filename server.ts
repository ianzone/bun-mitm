import type { Socket } from 'bun';
import { createMITM } from './mitm.ts';

let mitmSocket: Socket;
Bun.listen({
  hostname: 'localhost',
  port: 8080,
  socket: {
    data: async (clientSocket, reqData) => {
      const reqStr = reqData.toString();

      if (reqStr.startsWith('CONNECT')) {
        const domain = reqStr.split('\r\n')[0].split(' ')[1].split(':')[0];
        const mitm = createMITM(domain);
        mitmSocket = await Bun.connect({
          hostname: 'localhost',
          port: mitm.port,
          socket: {
            open: () => {
              // 建立隧道
              clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            },
            data: (mitmSocket, resData) => {
              // 来自代理服务器的数据
              clientSocket.write(resData);
            },
          },
        });
      } else {
        // 将请求发送到代理服务器
        mitmSocket.write(reqData);
      }
    },
  },
});
