declare namespace DETAIL {
  interface Props {
    data: IData;
  }

  type IData = { title?: string; rows: RowItem[] }[];

  interface RowItem {
    label: string;
    value: any;
    span?: number;
    insertWhen?: boolean;
    valueLabel?: string;
    type?:
      | 'span'
      | 'PopoverImg'
      | 'PopoverImgWithRightIcon'
      | 'PopoverImgListWithRightIcon'
      | 'UploadFile'
      | 'multiple'
      | 'UploadFileListWithRightIcon';
  }
}
