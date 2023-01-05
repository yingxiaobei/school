import React from 'react';
import { DatePicker, Input, message, Row, Select } from 'antd';
import { ItemCol } from 'components';
import moment from 'moment';
import { Template } from 'app/school/pages/trainingInstitution/contractTemplate/_api';
import { useOptions } from 'hooks';
import TemplateText from 'utils/Temaplate';

interface BaseTemplateContractProps {
  carTypeRender: React.ReactElement;
  schContractTempitemList: Template[];
  setSchContractTempitemList: (schContractTempitemList: Template[]) => void;
}
const BaseTemplateContract = ({
  carTypeRender,
  schContractTempitemList,
  setSchContractTempitemList,
}: BaseTemplateContractProps) => {
  // 勾选与不勾选
  const checkTypeOptions = useOptions('student_contract_check_type');

  return (
    <Row>
      {carTypeRender}
      {schContractTempitemList.map((item, index) => {
        if (item.itemtype === '1') {
          return (
            <ItemCol label={item.itemname} key={item.itemcode} required>
              <Select
                options={checkTypeOptions}
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
                value={item.itemvalue}
                onChange={(value) => {
                  schContractTempitemList[index].itemvalue = value;
                  setSchContractTempitemList([...schContractTempitemList]);
                }}
              />
            </ItemCol>
          );
        }
        if (item.itemtype === '3') {
          return (
            <ItemCol label={item.itemname} key={item.itemcode} required>
              <DatePicker
                style={{ width: 240 }}
                allowClear={false}
                value={moment(item.itemvalue)}
                placeholder={'日期'}
                defaultValue={moment()}
                onChange={(dates: any) => {
                  schContractTempitemList[index].itemvalue = dates.format('YYYY-MM-DD');
                  setSchContractTempitemList([...schContractTempitemList]);
                }}
              />
            </ItemCol>
          );
        }
        if (item.itemtype === '4') {
          return (
            <ItemCol
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              span={24}
              label={item.itemname}
              key={item.itemcode}
              required
            >
              <Input.TextArea
                autoSize
                style={{ width: '100%' }}
                value={TemplateText.renderTextBefore(item.itemvalue)}
                onChange={(e) => {
                  schContractTempitemList[index].itemvalue = TemplateText.submitTextAfter(e.target.value);
                  setSchContractTempitemList([...schContractTempitemList]);
                }}
              ></Input.TextArea>
            </ItemCol>
          );
        }
        return (
          <ItemCol label={item.itemname} key={item.itemcode} required>
            <Input
              value={item.itemvalue}
              onChange={(e) => {
                if (item.itemtype === '0') {
                  const val: any = Number(e.target.value);
                  if (
                    Number.isNaN(val) ||
                    val > 100000 ||
                    val < 0 ||
                    !/^(\d+(\.\d{1,2})?|(0(\.(0[1-9]|[1-9]\d?))))$/.test(val)
                  )
                    message.error('输入内容需为大于等于0小于等于100000的数字,最多2位小数点');
                } else {
                  if (e.target.value.length > 150) message.error('输入内容最长不超过150个字符');
                }
                schContractTempitemList[index].itemvalue = e.target.value;
                setSchContractTempitemList([...schContractTempitemList]);
              }}
            />
          </ItemCol>
        );
      })}
    </Row>
  );
};
export default BaseTemplateContract;
