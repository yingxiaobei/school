interface IParams {
  request: any;
  query: any;
}

export function foo({ request, query }: IParams) {
  type RestParamsArgs = Parameters<typeof request>;
  request(query);

  console.log(8);
}

interface IQuery {
  id: number;
  name: string;
}

type F = Parameters<typeof _api>;

function _api(query: IQuery) {
  console.log(query);
}

foo({ request: _api, query: { id: 4 } });
