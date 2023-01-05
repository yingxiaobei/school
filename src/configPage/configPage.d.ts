declare namespace CONFIG_PAGE {}

declare namespace DETAIL {
  interface Props {
    data: [{ title?: string; rows: Row[] }];
  }

  type Row = RowItem[];

  interface RowItem {
    label: string;
    value: any;
  }
}
