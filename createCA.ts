import forge from 'node-forge';
import { getRootCA, subject } from './getRootCA.ts';

// 读取根证书和私钥
const rootCA = await getRootCA();

// 解析根证书和私钥
const caCrt = forge.pki.certificateFromPem(rootCA.crt);
const caKey = forge.pki.privateKeyFromPem(rootCA.key);

export function createCA(domain: string) {
  // 生成新的 RSA 密钥对
  const keys = forge.pki.rsa.generateKeyPair(2048);

  // 创建新的证书
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = Date.now().toString(); // 证书序列号
  const thisYear = new Date().getFullYear();
  cert.validity.notBefore = new Date(); // 生效时间
  cert.validity.notBefore.setFullYear(thisYear);
  cert.validity.notAfter = new Date(); // 过期时间
  cert.validity.notAfter.setFullYear(thisYear + 1);

  // 设置证书主题
  subject.push({ name: 'commonName', value: domain });
  cert.setSubject(subject);

  // 设置颁发者（根证书的主题）
  cert.setIssuer(caCrt.subject.attributes);

  // 设置扩展字段
  cert.setExtensions([
    {
      name: 'basicConstraints',
      critical: true,
      cA: false,
    },
    {
      name: 'keyUsage',
      critical: true,
      digitalSignature: true,
      contentCommitment: true,
      keyEncipherment: true,
      dataEncipherment: true,
      keyAgreement: true,
      keyCertSign: true,
      cRLSign: true,
      encipherOnly: true,
      decipherOnly: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2,
          value: domain,
        },
      ],
    },
    {
      name: 'subjectKeyIdentifier',
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: 'authorityKeyIdentifier',
    },
  ]);

  // 使用根证书的私钥签名新证书
  cert.sign(caKey, forge.md.sha256.create());

  // 将证书和私钥转换为 PEM 格式
  return {
    key: forge.pki.privateKeyToPem(keys.privateKey),
    cert: forge.pki.certificateToPem(cert),
  };
}
