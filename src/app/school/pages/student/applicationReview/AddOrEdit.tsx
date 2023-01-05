import { useState } from 'react';
import type { Review } from '.';
import { DatePicker, Form, message, Row, Modal } from 'antd';
import { ItemCol, Loading } from 'components';
import { useFetch } from 'hooks';
import { formatTime, _get } from 'utils';
import {
  ApplicationReviewDetailData,
  _getApplicationReviewDetail,
  _insertApplicationReview,
  _setApplicationReview,
} from './_api';
import { UploadFile, UploadFileStatus } from 'antd/lib/upload/interface';
import MultipleUpload from './MultipleUpload';
import moment, { Moment } from 'moment';

interface AddOrEditProps {
  isEdit: boolean;
  visible: boolean;
  onCancel: () => void;
  handleOk: () => void;

  currentId: string | number | null;
  currentRecord: Review;

  isDetail: boolean;

  setCurrentId: (currentId: any) => void;
  setCurrentRecord: (currentRecord: any) => void;
}

export type AddOrEditValue = {
  firstPartTime: Moment | null;
  secondPartTime: Moment | null;
  thirdPartTime: Moment | null;
  fourthPartTime: Moment | null;

  id: string;
  tempId: string;
};

export type FileRes = { data: { id: string; url: string } };

function AddOrEdit({
  isEdit,
  visible,
  onCancel,
  currentRecord,
  currentId,
  isDetail = false,
  handleOk,
  setCurrentId,
  setCurrentRecord,
}: AddOrEditProps) {
  const [form] = Form.useForm<AddOrEditValue>();
  const [fileList, setFileList] = useState<UploadFile<FileRes>[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const setUpload = (data: ApplicationReviewDetailData) => {
    //  检查清除脏数据
    try {
      let isCommaStart = /^,+/.test(_get(data, 'tempId', ''));
      let tempList = isCommaStart ? _get(data, 'tempId', '').slice(1).split(',') : _get(data, 'tempId', '').split(',');

      const fileList = _get(data, 'showUrl', [] as string[]).map((file, index) => ({
        name: file || `image_${index}`,
        status: 'done' as UploadFileStatus,
        url: file,
        uid: tempList[index],
        thumbUrl: file,
        id: tempList[index],
      }));
      setFileList(fileList);
    } catch (error) {
      console.log(error);
    }
  };

  const setForm = (data: ApplicationReviewDetailData) => {
    let values: Partial<AddOrEditValue> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (
          key === 'firstPartTime' ||
          key === 'secondPartTime' ||
          key === 'thirdPartTime' ||
          key === 'fourthPartTime'
        ) {
          values[key] = moment(data[key]);
        }
      }
    }
    form.setFieldsValue({
      ...values,
    });
  };

  const {
    isLoading: detailLoading,
    data: detail,
  }: { isLoading: boolean; data: Partial<ApplicationReviewDetailData> } = useFetch({
    request: _getApplicationReviewDetail,
    query: {
      id: currentId,
    },
    depends: [currentId],
    requiredFields: ['id'],
    callback(data: ApplicationReviewDetailData) {
      setUpload(data);
      setForm(data);
    },
  });

  function disabledDate(current: any) {
    // NOTE: 无法选择当天之后的日子
    return current && current > moment().endOf('day');
  }

  return (
    <Modal
      visible={visible}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      // destroyOnClose={true}
      title={isDetail ? '详情' : isEdit ? '编辑' : '报审补录'}
      okText={isDetail ? '确定' : '提交'}
      okButtonProps={{ disabled: isDetail }}
      cancelText={'取消'}
      onOk={() => {
        const files = fileList.map((file) => {
          return file.response
            ? {
                id: _get<UploadFile<FileRes>, 'response'>(file, ['response'])?.data?.id,
                url: _get<UploadFile<FileRes>, 'response'>(file, ['response'])?.data?.url,
              }
            : { id: _get(file, 'id'), url: _get(file, 'url') };
        });

        if (isDetail) {
          return onCancel();
        }

        form.validateFields().then((values) => {
          const res: Record<string, string | Moment | undefined | null> = {};
          for (const [key, value] of Object.entries(values)) {
            if (key === 'files') continue;
            if (value == null) {
              continue;
            } else {
              res[key] = value;
            }
          }

          // firstPartStatus secondPartStatus thirdPartStatus fourthPartStatus
          for (const key in res) {
            if (Object.prototype.hasOwnProperty.call(res, key)) {
              res[key] = formatTime(res[key], 'NORMAL');
            }
          }

          if (!Object.keys(res).length) {
            return message.error('至少有一科报审日期不为空');
          }

          if (!fileList.length) {
            return message.error('请上传证明文件');
          }

          // 新增编辑的时候都有可能修改
          res['tempId'] = files.map((file) => file.id).join(',');
          res['stuid'] = currentRecord['stuid'];
          res['applyTime'] = formatTime(moment.now(), 'NORMAL');
          // NOTE: 编辑阶段
          setConfirmLoading(true);
          if (isEdit) {
            /**
             *  1. 可以在编辑的时候清空 原有的状态
             *  2. 当详情的时间和原来的时间发生变化的时候 对应时间状态变成 0
             */
            const query = {
              ...detail,
              ...res,
            };
            type PartTime = 'firstPartTime' | 'secondPartTime' | 'thirdPartTime' | 'fourthPartTime';
            type PartStatus = 'firstPartStatus' | 'secondPartStatus' | 'thirdPartStatus' | 'fourthPartStatus';
            const diffPartTimeToStatus: Record<PartTime, PartStatus> = {
              firstPartTime: 'firstPartStatus',
              secondPartTime: 'secondPartStatus',
              thirdPartTime: 'thirdPartStatus',
              fourthPartTime: 'fourthPartStatus',
            };
            for (const queryKey in query) {
              if (queryKey in diffPartTimeToStatus) {
                const status = diffPartTimeToStatus[queryKey];
                // 现在有两种情况 一种是还没有经过后台的审核的数据 返回
                if (!detail[queryKey]) {
                  // 说明之前没有添加该部分的时间片段
                  query[status] = '0';
                } else if (!res[queryKey]) {
                  // 本版本 不处理（现在不允许清空）
                } else {
                  if (res[queryKey] !== detail[queryKey]) {
                    query[status] = '0';
                  }
                }
              }

              // 处理
              if (
                queryKey === 'firstPartStatus' ||
                queryKey === 'secondPartStatus' ||
                queryKey === 'thirdPartStatus' ||
                queryKey === 'fourthPartStatus'
              ) {
                if (query[queryKey] === '') {
                  query[queryKey] = '0';
                }
              }
            }

            delete query['showUrl'];

            _setApplicationReview(query).finally(() => {
              setConfirmLoading(false);
              handleOk();
              setCurrentId(null);
            });
          } else {
            // NOTE: 新增阶段
            _insertApplicationReview(res).finally(() => {
              setConfirmLoading(false);
              handleOk();
              setCurrentId(null);
            });
          }
        });
      }}
      // destroyOnClose={true}
    >
      {detailLoading ? (
        <Loading tip="loading" loadingStyle={{ margin: 0 }}></Loading>
      ) : (
        <Form form={form}>
          <Row justify={'space-between'}>
            <ItemCol span={16} label="学员姓名">
              {_get(currentRecord, 'name')}
            </ItemCol>
            <ItemCol span={8} label="培训车型">
              {_get(currentRecord, 'traintype')}
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={24} name="firstPartTime" label="第一部分报审日期">
              <DatePicker
                allowClear={!_get(detail, 'firstPartTime')}
                disabledDate={disabledDate}
                disabled={isDetail || _get(detail, 'firstPartStatus') === '1'}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={24} name="secondPartTime" label="第二部分报审日期">
              <DatePicker
                allowClear={!_get(detail, 'secondPartTime')}
                disabledDate={disabledDate}
                disabled={isDetail || _get(detail, 'secondPartStatus') === '1'}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={24} name="thirdPartTime" label="第三部分报审日期">
              <DatePicker
                allowClear={!_get(detail, 'thirdPartTime')}
                disabledDate={disabledDate}
                disabled={isDetail || _get(detail, 'thirdPartStatus') === '1'}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={24} name="fourthPartTime" label="第四部分报审日期">
              <DatePicker
                allowClear={!_get(detail, 'fourthPartTime')}
                disabledDate={disabledDate}
                disabled={isDetail || _get(detail, 'fourthPartStatus') === '1'}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol span={24} name="files" label="证明文件">
              <MultipleUpload
                limit={10}
                setFileList={setFileList}
                fileList={(fileList as unknown) as UploadFile[]}
                disabled={isDetail}
                setConfirmLoading={setConfirmLoading}
              />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}

export default AddOrEdit;
