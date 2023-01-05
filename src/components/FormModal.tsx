// FIXME: REMOVE

import { Modal, Form } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { _get } from 'utils';
import { Loading } from 'components';
import { AxiosResponse } from 'axios';

interface IProps<T = { [key: string]: any }> {
  queryFields: string[]; // 表单字段数组
  idField: string; // 编辑提交主键字段名称
  children: React.ReactNode; // 表单内部内容
  onCancel(): void;
  currentId: string; // 列表返回的主键字段名称
  isEdit: boolean;
  title?: string; // 表单标题，不传默认是当前页面目录名称
  onOk(): void;
  fetchDetailData(query?: T): Promise<AxiosResponse | undefined | void>; // 详情接口
  addRequest(query?: T): Promise<AxiosResponse | undefined | void>; // 新增接口
  updateRequest(query?: T): Promise<AxiosResponse | undefined | void>; // 编辑接口
}

export default function FormModal(props: IProps) {
  const {
    queryFields,
    idField,
    children,
    onCancel,
    currentId,
    isEdit,
    title,
    onOk,
    fetchDetailData,
    addRequest,
    updateRequest,
  } = props;
  const [form] = Form.useForm();

  const { loading: confirmLoading, run } = useRequest(isEdit ? (updateRequest as any) : addRequest, {
    onSuccess: onOk,
  });

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: fetchDetailData,
  });

  const initialValues = {};
  queryFields.forEach((x: any) => {
    Object.assign(initialValues, { [x]: _get(data, x) });
  });

  return (
    <Modal
      visible
      width={800}
      confirmLoading={confirmLoading}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {};
          queryFields.forEach((x: any) => {
            Object.assign(query, { [x]: _get(values, x) });
          });
          run(isEdit ? { ...query, [idField]: currentId } : query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={initialValues}
        >
          {children}
        </Form>
      )}
    </Modal>
  );
}
