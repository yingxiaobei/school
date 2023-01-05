//新增编辑栏目
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { Modal, Form, Input, Button, Spin, Select, Row, message, InputNumber } from 'antd';
import { useRequest, useFetch, useForceUpdate, useOptions } from 'hooks';
import { _addTopic, _updateTopic, _getMockDetail, _addItemConfig } from './_api';
import { ItemCol } from 'components';
import OrgSelect from './OrgSelect';

interface IProps {
  // visible: boolean;
  onCancel(): void;
  onOk(): void;
  currentId: any;
  isEdit: boolean;
  title: string;
  currentRecord?: any;
}

const config = [
  {
    label: '栏目名称',
    name: 'name',
    type: 'select',
    value: '',
  },
  {
    label: '栏目分类',
    name: 'type',
    type: 'select',
    value: '',
  },
  {
    label: '页面位置',
    name: 'site',
    type: 'select',
    value: '',
  },
  {
    label: '页面类型',
    name: 'showType',
    type: 'select',
    value: '',
  },
  {
    label: '排序',
    name: 'serialNumber',
    type: 'input',
    value: '',
  },
];

export default function AddTemCfg(props: IProps) {
  let temconfig = JSON.parse(JSON.stringify(config));

  let arr = [
    {
      config: temconfig,
    },
  ];
  const [form] = Form.useForm();
  const [ignore, forceUpdate] = useForceUpdate();
  const pageSiteOptions = useOptions('page_site');
  const itemTypeOptions = useOptions('item_type');
  const showTypeOptions = useOptions('show_type');
  const { onCancel, onOk, title } = props;
  const [configArr, setConfigArr] = useState<any>(arr);
  const [paramArr, setParamArr] = useState<any>([]);
  const { loading: confirmLoading, run } = useRequest(_addItemConfig, {
    onSuccess: onOk,
  });
  function getEmptyArr(orgArr: any) {
    let arr = [];

    if (orgArr.length < 1) {
      return ['栏目名称', '栏目分类', '页面位置', '页面类型', '排序'];
    }
    for (var item of orgArr) {
      // if (_get(item, 'value', '') === '') {
      //   return;
      // }
      if (_get(item, 'value', '') === '') {
        arr.push(_get(item, 'label', ''));
      }
    }
    return arr;
  }
  function handleSubmit() {
    let emptyArr = [];

    if (configArr.length < 1) {
      return ['栏目名称', '栏目分类', '页面位置', '页面类型', '排序'];
    }
    for (var item of configArr) {
      const config = item.config;
      emptyArr.push(...getEmptyArr(config));
    }
    if (emptyArr.length > 0) {
      const str = emptyArr.join();
      return message.error(`${str}不能为空`);
    }
    run(paramArr);
  }

  return (
    <Modal
      title={title}
      // key={Math.random()}
      width={1400}
      visible
      onCancel={() => {
        const cfg = config.map((x) => {
          return { ...x, value: '' };
        });
        setConfigArr([{ config: cfg }]);
        arr = [];
        onCancel();
      }}
      destroyOnClose
      maskClosable={false}
      // footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      footer={
        <>
          <Button className="mr20" onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={confirmLoading}>
            确定
          </Button>
        </>
      }
    >
      <Spin spinning={confirmLoading}>
        <div
        // form={form}
        >
          {configArr.map((item: any, index: any) => {
            return (
              <Row key={index}>
                {item.config.map((x: any, itemIndex: any) => {
                  if (x.name === 'name') {
                    // debugger;
                    return (
                      <ItemCol label={x.label} span={7} key={x.label} required>
                        <OrgSelect
                          callbackFun={() => {
                            // isEdit && setSelectedOrgIds(_get(currentRecord, 'superId', ''));
                          }}
                          onChange={(val: any) => {
                            const name = x.name;
                            paramArr[index] = { ...paramArr[index], [name]: val.label, itemId: val.value };
                            setParamArr(paramArr);

                            configArr[index]['config'][itemIndex]['value'] = val.value;
                            setConfigArr([...configArr]);
                          }}
                          value={x.value}
                        />
                      </ItemCol>
                    );
                  }
                  if (x.type === 'select' && x.name !== 'showType') {
                    return (
                      <ItemCol label={x.label} span={4} required key={x.label}>
                        <Select
                          value={x.value}
                          placeholder={x.label}
                          style={{ width: 100 }}
                          onChange={(value: any) => {
                            configArr[index]['config'][itemIndex]['value'] = value;
                            setConfigArr([...configArr]);
                            const name = x.name;
                            paramArr[index] = { ...paramArr[index], [name]: value };
                            setParamArr(paramArr);
                          }}
                          options={x.label === '栏目分类' ? itemTypeOptions : pageSiteOptions}
                        />
                      </ItemCol>
                    );
                  }
                  if (x.type === 'select' && x.name === 'showType') {
                    return (
                      <ItemCol label={x.label} span={4} required key={x.label}>
                        <Select
                          value={x.value}
                          placeholder={x.label}
                          style={{ width: 100 }}
                          onChange={(value: any) => {
                            configArr[index]['config'][itemIndex]['value'] = value;
                            setConfigArr([...configArr]);
                            const name = x.name;
                            paramArr[index] = { ...paramArr[index], [name]: value };
                            setParamArr(paramArr);
                          }}
                          options={showTypeOptions}
                        />
                      </ItemCol>
                    );
                  }
                  return (
                    <ItemCol label={x.label} span={3} required>
                      <InputNumber
                        placeholder={x.label}
                        style={{ width: 80 }}
                        type="number"
                        onChange={(e: any) => {
                          if (!/^(?:[1-9]?\d|100)$/.test(e)) {
                            return message.info('请输入0-100的整数');
                          }
                          configArr[index]['config'][itemIndex]['value'] = e;
                          setConfigArr([...configArr]);
                          const name = x.name;
                          paramArr[index] = { ...paramArr[index], [name]: e };
                          setParamArr(paramArr);
                        }}
                        value={x.value}
                      />
                    </ItemCol>
                  );
                })}
                <Button
                  type="primary"
                  onClick={() => {
                    const arr = configArr[index]['config'];
                    let emptyArr = getEmptyArr(arr);
                    if (emptyArr.length > 0) {
                      const str = emptyArr.join();
                      return message.error(`${str}不能为空`);
                    }
                    const cfg = config.map((x) => {
                      return { ...x, value: '' };
                    });
                    setConfigArr([...configArr, { config: cfg }]);
                  }}
                >
                  +
                </Button>
                {configArr.length > 1 && (
                  <Button
                    className="ml10"
                    type="primary"
                    onClick={() => {
                      const arr = configArr.filter((x: any, itemIndex: any) => {
                        return index !== itemIndex;
                      });
                      setConfigArr([...arr]);
                      const pArr = paramArr.filter((x: any, itemIndex: any) => {
                        return index !== itemIndex;
                      });
                      setParamArr([...pArr]);
                    }}
                  >
                    -
                  </Button>
                )}
              </Row>
            );
          })}
        </div>
      </Spin>
    </Modal>
  );
}
