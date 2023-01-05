const data: any = [
  { name: '55', code: 'A', parentCode: 0 },
  { name: '44', code: 'B', parentCode: 'A' },
  { name: '22', code: 'C', parentCode: 'B' },
  { name: '11', code: 'D', parentCode: 0 },
  { name: '11', code: 'E', parentCode: 'B' },
];

const res = [
  {
    name: '55',
    code: 'A',
    parentCode: 0,
    children: [
      {
        name: '44',
        code: 'B',
        parentCode: 'A',
        children: [
          { name: '22', code: 'C', parentCode: 'B', children: [] },
          { name: '11', code: 'E', parentCode: 'B', children: [] },
        ],
      },
    ],
  },
  { name: '11', code: 'D', parentCode: 0, children: [] },
];

export function foo(data: any) {
  const hash: any = {};

  for (let node of data) {
    const { parentCode } = node;
    if (hash[parentCode]) {
      hash[parentCode].push(node);
    } else {
      hash[parentCode] = [node];
    }
  }

  const res = dfs(0);
  return res;

  function dfs(code: string | number) {
    if (hash[code]) {
      const arr = [];
      for (let node of hash[code]) {
        node.children = dfs(node.code);
        arr.push(node);
      }
      return arr;
    }

    return [];
  }
}

foo(data);
