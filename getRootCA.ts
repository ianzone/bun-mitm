export const subject = [
  {
    name: 'countryName',
    value: 'CN',
  },
  {
    shortName: 'ST',
    value: 'Hubei',
  },
  {
    name: 'localityName',
    value: 'Jingmen',
  },
  {
    name: 'organizationName',
    value: 'ianzone',
  },
  {
    shortName: 'OU',
    value: 'proxy',
  },
];

export async function getRootCA() {
  return {
    crt: await Bun.file('./cert/rootCA.crt').text(),
    key: await Bun.file('./cert/rootCA.key').text(),
  };
}
