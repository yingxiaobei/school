import { useState } from 'react';
import { Drawer, Form, Button, Select, Input, DatePicker, message, Row, TimePicker } from 'antd';
import Editor from './Editor';
import Preview from './Preview';
import 'react-quill/dist/quill.snow.css';
import { useVisible, useFetch, useOptions } from 'hooks';
import { ItemCol } from 'components';
import ImportFile from './ImportFile';
import { _getDetails, _addNews, _updateByKey, _getListByType } from './_api';
import { formatTime, _get } from 'utils';
import UploadImg from './UploadPro';
import { Loading } from 'components';
import { RULES } from 'constants/rules';
import moment from 'moment';
import { _getSearchList } from '../templateManage/_api';

interface IProps {
  onCancel(): void;
  onOk(): void;
  isEdit: boolean;
  currentId?: string;
}

export default function AddOrEdit(props: IProps) {
  const { onCancel, onOk, isEdit, currentId } = props;
  const [portalSubjectTypeOptions, setPortalSubjectTypeOptions] = useState<any>([]);
  const [form] = Form.useForm();
  const [richtextContent, setRichtextContent] = useState('');
  const [visible, _setVisible] = useVisible(); // 新增、编辑弹框是否展示
  const [isHome, setIsHome] = useState(''); // 是否是首页
  const [publishType, setPublishType] = useState(''); // 发布类型

  // const portalArticleTypeOptions = useOptions('portal_article_type'); // 资讯类型
  const yesNoTypeOptions = useOptions('yes_no_type'); // 是否首页显示
  const articlePublishTypeOptions = useOptions('article_publish_type'); // 发布类型

  const [fileList, setFileList] = useState([]) as any;

  // 图片数据
  const [imgData, setImgData] = useState({}) as any;

  const [fileIds, setFileIds] = useState(''); // 文件数据
  useFetch({
    request: _getSearchList,
    query: { type: 'information' },
    callback(data: any) {
      console.log(data);
      const arr = (data || []).map((item: any) => {
        return { label: item.name, value: item.itemId };
      });
      setPortalSubjectTypeOptions(arr);
    },
  });
  const LABEL_WAPPER_ONE = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
  };

  const LABEL_WAPPER_TWO = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { isLoading, data = {} } = useFetch({
    request: _getDetails,
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    callback: (data: any) => {
      setRichtextContent(_get(data, 'content', ''));
      setImgData(_get(data, 'img', {}));
      const list: any = _get(data, 'attachments', []).map((item: any) => {
        return {
          osskey: _get(item, 'osskey', ''),
          name: _get(item, 'fileName', ''),
          status: 'done',
          url: _get(item, 'fileUrl', ''),
          uid: _get(item, 'tmpFileId', ''),
        };
      });
      setFileList(list);
      setPublishType(_get(data, 'publishType'));
      setIsHome(_get(data, 'isHomepageShow'));
    },
  });
  const { data: listData = [] } = useFetch({
    request: _getListByType,
  });

  const portalArticleTypeOptions = listData.map((x: any) => {
    return { label: x.categoryValue, value: x.categoryKey };
  });

  return (
    <>
      {visible && <Preview richtextContent={richtextContent} onCancel={_setVisible} />}

      <Drawer
        destroyOnClose
        visible
        width={1000}
        title={isEdit ? '编辑信息' : '发布信息'}
        onClose={onCancel}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button
              onClick={() => {
                if (!richtextContent) {
                  message.error('请输入详情');
                } else {
                  _setVisible();
                }
              }}
              type="primary"
              className="mr20"
            >
              预览
            </Button>
            <Button
              type="primary"
              className="mr20"
              onClick={() => {
                form.validateFields().then(async (values) => {
                  if (_get(fileList, 'length', 0) > 10) {
                    return message.error('文件上传数量超过限制');
                  }
                  if (!richtextContent || richtextContent == '<p><br></p>') {
                    return message.error('请输入详情');
                  }
                  if (publishType === '2' && !_get(values, 'publishTime')) {
                    return message.error('发布时间不能为空');
                  }
                  let queryFinal = {};
                  queryFinal = {
                    ...values,
                    homepageSeq: isHome ? _get(values, 'homepageSeq', '') : null,
                    publishTime: publishType === '2' ? formatTime(_get(values, 'publishTime'), 'NORMAL') : null,
                    content: richtextContent,
                    fileIds,
                  };
                  queryFinal = Object.keys(imgData).length > 0 ? { ...queryFinal, img: imgData } : queryFinal;

                  queryFinal =
                    _get(fileList, 'length', 0) > 0
                      ? {
                          ...queryFinal,
                          attachments: fileList.map((item: any) => {
                            return {
                              fileName: _get(item, 'name', ''),
                              fileUrl: _get(item, 'url', ''),
                              tmpFileId: _get(item, 'uid', '').indexOf('AUTO') > 0 ? '' : _get(item, 'uid', ''),
                              osskey: _get(item, 'osskey', ''),
                            };
                          }),
                        }
                      : queryFinal;
                  const res = isEdit
                    ? await _updateByKey({ ...queryFinal, id: currentId })
                    : await _addNews(queryFinal);
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
            autoComplete="off"
            form={form}
            initialValues={{
              ...data,
              publishTime: moment(_get(data, 'publishTime')),
            }}
          >
            <Form.Item
              {...LABEL_WAPPER_ONE}
              label="栏目名称"
              name="type"
              rules={[{ required: true, message: '请选择栏目名称' }]}
            >
              <Select options={[{ label: '栏目名称(全部)', value: '' }, ...portalSubjectTypeOptions]} />
            </Form.Item>

            <Form.Item
              {...LABEL_WAPPER_ONE}
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }, RULES.CONTENT_100]}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item {...LABEL_WAPPER_ONE} label="详情" required>
              <Editor editorState={richtextContent} setEditorState={setRichtextContent} />
            </Form.Item>

            <Form.Item {...LABEL_WAPPER_ONE} label="上传附件">
              <div className="mb20">
                <ImportFile fileList={fileList} setFileList={setFileList} />
                <div style={{ display: 'inline-block', verticalAlign: -40 }}>
                  支持格式：.rar .zip .doc .docx .pdf ，单个文件不能超过20MB
                </div>
              </div>
            </Form.Item>

            <Form.Item {...LABEL_WAPPER_ONE} label="上传标题图片">
              <div style={{ display: 'inline-block', width: 120, height: 120 }}>
                <UploadImg imgData={imgData} setImgData={setImgData} />
              </div>
              <div style={{ display: 'inline-block', verticalAlign: -40 }}>
                请选择图片文件，仅限png/jpg文件，最大10MB
              </div>
            </Form.Item>

            <Row>
              <ItemCol {...LABEL_WAPPER_TWO} label="是否首页显示" name="isHomepageShow" rules={[{ required: true }]}>
                <Select
                  options={yesNoTypeOptions}
                  onChange={(value: string) => {
                    setIsHome(value);
                  }}
                />
              </ItemCol>
              {isHome === '1' && (
                <ItemCol {...LABEL_WAPPER_TWO} label="首页排序" name="homepageSeq" rules={[RULES.NUMBER_100]}>
                  <Input />
                </ItemCol>
              )}
            </Row>
            <Row>
              <ItemCol {...LABEL_WAPPER_TWO} label="发布类型" name="publishType" rules={[{ required: true }]}>
                <Select
                  options={articlePublishTypeOptions}
                  onChange={(value: string) => {
                    console.log('setPublishType', publishType);
                    setPublishType(value);
                  }}
                />
              </ItemCol>

              {publishType === '2' && (
                <ItemCol {...LABEL_WAPPER_TWO} label="发布时间" name="publishTime">
                  <DatePicker
                    showTime
                    disabledDate={(current: any) => {
                      return current.diff(moment(new Date(), 'second')) <= 0;
                    }}
                  />
                </ItemCol>
              )}
            </Row>
          </Form>
        )}
      </Drawer>
    </>
  );
}
