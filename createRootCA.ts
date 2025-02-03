import forge from 'node-forge';
const { pki, md } = forge;
import { subject } from './getRootCA';

function createRootCA() {
  // 生成新的 RSA 密钥对
  const keys = pki.rsa.generateKeyPair(2048);

  // 创建新的证书
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = Date.now().toString(); // 证书序列号
  const thisYear = new Date().getFullYear();
  cert.validity.notBefore = new Date(); // 生效时间
  cert.validity.notBefore.setFullYear(thisYear - 1);
  cert.validity.notAfter = new Date(); // 过期时间
  cert.validity.notAfter.setFullYear(thisYear + 20);

  // 设置证书主题
  subject.push({ name: 'commonName', value: 'self-signed-root-ca' });
  cert.setSubject(subject);

  // 设置颁发者（根证书的主题）
  cert.setIssuer(subject);

  // 设置扩展字段
  cert.setExtensions([
    {
      name: 'basicConstraints',
      critical: true,
      cA: true,
    },
    {
      name: 'keyUsage',
      critical: true,
      keyCertSign: true,
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ]);

  // 自签名
  cert.sign(keys.privateKey, md.sha256.create());

  const crtPem = pki.certificateToPem(cert);
  const keyPem = pki.privateKeyToPem(keys.privateKey);

  Bun.write('./cert/rootCA.crt', crtPem);
  Bun.write('./cert/rootCA.key', keyPem);
}

createRootCA();
