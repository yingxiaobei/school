import { useState, useEffect } from 'react';
import { Drawer, Form, Button, Select, Input, message } from 'antd';
import { useFetch, useOptions } from 'hooks';
import { _getDetails, _addNews, _updateByKey } from './_api';
import 'react-quill/dist/quill.snow.css';
import { _get } from 'utils';
import { Loading } from 'components';
import UploadPro from '../sendNews/UploadPro';
import { RULES } from 'constants/rules';
import { _getSearchList } from '../templateManage/_api';
import Editor from '../sendNews/Editor';

interface IProps {
  onCancel(): void;
  onOk(): void;
  isEdit: boolean;
  currentId?: string;
}

export default function AddOrEdit(props: IProps) {
  const { onCancel, onOk, isEdit, currentId } = props;
  const [richtextContent, setRichtextContent] = useState('');
  const [portalSubjectTypeOptions, setPortalSubjectTypeOptions] = useState([]);
  const [footerArr, setFooterArr] = useState([]) as any;
  const [quillVisible, setQuillVisible] = useState(false);
  const [form] = Form.useForm();
  useFetch({
    request: _getSearchList,
    query: { type: 'home_page' },
    callback(data: any) {
      const arr = (data || []).map((item: any) => {
        return { label: item.name, value: item.itemId };
      });

      setPortalSubjectTypeOptions(arr);
      const filter = data.filter((x: any) => {
        return x.type === 'home_page' && x.site === 'page_footer';
      });
      let footerArr = filter.map((x: any) => {
        return x.itemId;
      });
      setFooterArr(footerArr);
    },
  });

  // const portalSubjectTypeOptions_old = useOptions('portal_subject_type'); // 资讯类型

  // 图片数据
  const [imgData, setImgData] = useState() as any;

  const { isLoading, data = {} } = useFetch({
    request: _getDetails,
    query: {
      id: currentId,
    },
    callback: (data: any) => {
      setImgData(_get(data, 'img'));
      setRichtextContent(_get(data, 'content', ''));
    },
  });

  useEffect(() => {
    if (isEdit && footerArr.includes(data.type)) {
      setQuillVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, footerArr]);
  return (
    <>
      <Drawer
        destroyOnClose
        visible
        width={800}
        title={isEdit ? '编辑页面管理' : '新增页面管理'}
        onClose={onCancel}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button
              type="primary"
              className="mr20"
              onClick={() => {
                form.validateFields().then(async (values) => {
                  if (footerArr.includes(values.type)) {
                    if (!richtextContent || richtextContent == '<p><br></p>') {
                      return message.error('请输入详情');
                    }
                  }

                  const query = {
                    ...values,
                    img: imgData,
                    content: richtextContent,
                  };
                  const res = isEdit ? await _updateByKey({ ...query, id: currentId }) : await _addNews(query);
                  if (_get(res, 'code') === 200) {
                    onOk();
                  }
                });
              }}
            >
              确定
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        }
      >
        {isLoading && <Loading />}
        {!isLoading && (
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            initialValues={{
              ...data,
              type: _get(data, 'type', ''),
            }}
          >
            <Form.Item label="栏目名称" name="type" rules={[{ required: true, message: '请输入栏目名称' }]}>
              <Select
                options={[...portalSubjectTypeOptions]}
                onChange={(val) => {
                  if (footerArr.includes(val)) {
                    setQuillVisible(true);
                  } else {
                    setQuillVisible(false);
                  }
                }}
              />
            </Form.Item>

            <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }, RULES.CONTENT_100]}>
              <Input />
            </Form.Item>
            {quillVisible && (
              <Form.Item label="详情" required>
                <Editor editorState={richtextContent} setEditorState={setRichtextContent} />
              </Form.Item>
            )}
            <Form.Item label="跳转地址" name="url" rules={[RULES.CONTENT_100]}>
              <Input />
            </Form.Item>

            <Form.Item label="排序值" name="seq" rules={[RULES.NUMBER_100]}>
              <Input />
            </Form.Item>

            <Form.Item label="上传图片">
              <UploadPro imgData={imgData} setImgData={setImgData} />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  );
}
