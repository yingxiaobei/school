import { useState } from 'react';
import { Modal, Form, Row, Button, Alert, message } from 'antd';
import { useFetch, useVisible } from 'hooks';
import { _getSchContractTemp, _stuSignContract, _previewContract } from './_api';
import { AuthButton, BaseTemplateContract, Loading } from 'components';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { PUBLIC_URL } from 'constants/env';
import { useHistory } from 'react-router-dom';
import { ItemCol } from 'components';
import { previewPdf, _get } from 'utils';
import SignContract from './SignContract';
import TemplateText from 'utils/Temaplate';
import { Template } from 'app/school/pages/trainingInstitution/contractTemplate/_api';
import styles from './index.module.scss';

interface GenerateContractProps {
  onOk: () => void;
  onCancel: () => void;
  currentRecord: any;
  title: string;
}

export default function GenerateContract({ onCancel, currentRecord, title, onOk }: GenerateContractProps) {
  const [form] = Form.useForm();
  const history = useHistory();
  const [schContractTempitemList, setSchContractTempitemList] = useState<Template[]>([]);
  const [signContractVisible, setSignContractVisible] = useVisible();
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const { data = {}, isLoading } = useFetch({
    query: {
      sid: _get(currentRecord, 'sid'),
    },
    request: _getSchContractTemp,
    callback: (data) => {
      setSchContractTempitemList(TemplateText.sortByItemType(data));
    },
  });

  const generateContract = async () => {
    if (Object.keys(data).length === 0) {
      message.error('当前没有该车型的合同内容项模板');
      return false;
    }
    if (!TemplateText.checkContract(schContractTempitemList)) {
      return;
    }

    const res = await _stuSignContract({
      sid: _get(currentRecord, 'sid'),
      cartype: _get(currentRecord, 'traintype'),
      schContractTempitemList,
      tempid: _get(data, 'tempid'),
    });
    return res;
  };

  const Footer = (
    <Row justify={'end'}>
      <Button type="primary" onClick={onCancel}>
        取消
      </Button>
      <Button
        type="primary"
        className="ml20"
        loading={loading1}
        onClick={() => {
          if (Object.keys(data).length === 0) {
            message.error('当前没有该车型的合同内容项模板');
            return false;
          }
          if (!TemplateText.checkContract(schContractTempitemList)) {
            return;
          }
          setLoading1(true);
          _previewContract({
            sid: _get(currentRecord, 'sid'),
            cartype: _get(currentRecord, 'traintype'),
            schContractTempitemList,
            tempid: _get(data, 'tempid'),
          }).then((res) => {
            setLoading1(false);
            previewPdf([res]);
          });
        }}
      >
        预览合同
      </Button>
      <Button
        type="primary"
        loading={loading2}
        className="ml20"
        onClick={async () => {
          setLoading2(true);
          const res = await generateContract();

          setLoading2(false);
          if (_get(res, 'code') === 200) {
            message.success('操作成功');
            onOk();
          }
        }}
      >
        确认生成合同
      </Button>
      <AuthButton
        authId="student/studentInfo:btn15"
        type="primary"
        loading={loading3}
        className="ml20"
        onClick={async () => {
          setLoading3(true);
          const res = await generateContract();
          setLoading3(false);
          if (_get(res, 'code') === 200) {
            setSignContractVisible();
          }
        }}
      >
        确认生成合同并签字
      </AuthButton>
    </Row>
  );

  return (
    <>
      {signContractVisible && (
        <SignContract
          onCancel={setSignContractVisible}
          onOk={() => {
            setSignContractVisible();
            onOk();
          }}
          data={data}
          currentRecord={currentRecord}
          schContractTempitemList={schContractTempitemList}
        />
      )}
      <Modal
        getContainer={false}
        visible
        title={title}
        width={TemplateText.ModalWidth}
        maskClosable={false}
        footer={Footer}
        onCancel={onCancel}
      >
        {isLoading && <Loading />}

        {!isLoading && (
          <Form
            className={styles['generateContract']}
            form={form}
            labelWrap
            autoComplete="off"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 12 }}
          >
            {Object.keys(data).length === 0 && ( // 不存在合同模板时需出现如下提醒
              <Alert
                message={
                  <>
                    当前没有该车型的合同内容项模板，您可以
                    <span
                      style={{ color: PRIMARY_COLOR, cursor: 'pointer' }}
                      onClick={() => {
                        history.push(`${PUBLIC_URL}contractTemplate`);
                      }}
                    >
                      立即前往
                    </span>
                    设置合同模板信息内容
                  </>
                }
                type="warning"
                className="mb20"
              />
            )}

            <BaseTemplateContract
              carTypeRender={<ItemCol label="车型">{_get(currentRecord, 'traintype')}</ItemCol>}
              schContractTempitemList={schContractTempitemList}
              setSchContractTempitemList={setSchContractTempitemList}
            />
          </Form>
        )}
      </Modal>
    </>
  );
}
