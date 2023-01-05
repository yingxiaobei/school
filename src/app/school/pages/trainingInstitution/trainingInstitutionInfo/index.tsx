// 培训机构信息
import { useState } from 'react';
import { Row, Form, Tooltip } from 'antd';
import { useFetch, useHash, useOptions, useVisible } from 'hooks';
import { _getBaseInfo, _getTeachInfo, _getImg } from './_api';
import { Title, ItemCol, PopoverImg, Signature } from 'components';
import { Auth, _get } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { _createImg } from 'api';

export default function TrainingInstitutionInfo() {
  const [signVisible, setSignVisible] = useVisible();
  const [imgsData, setImgsData] = useState([]);
  // 基本信息详情
  const { data: basicInfoData } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });

  // 教学信息详情
  const { data: teachInfoData } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getTeachInfo,
  });

  const IS_NOT: any = {
    true: '是',
    false: '否',
  };

  // 资质信息
  useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getImg,
    callback: (data) => {
      setImgsData(data);
    },
  });

  const NAME_LIST = useOptions('company_img_type').sort((x: any, y: any) => x.value - y.value); // 图片

  // 筛选图片类型
  function imgList(type: string) {
    const imgData = (imgsData || []).filter((item: any) => _get(item, 'type') === type);

    if (imgData.length < 1) {
      return '未上传';
    }
    return imgData.map((item: any) => {
      if (String(_get(item, 'type', '')) === '1') {
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'baseline' }}>
            <PopoverImg src={item.url} imgStyle={{ width: 100, height: 100, marginRight: 20 }} />
            <span style={{ cursor: 'pointer', color: '#F3302B' }} onClick={setSignVisible}>
              在线签字
            </span>
          </div>
        );
      }
      return <PopoverImg src={item.url} key={item.id} imgStyle={{ width: 100, height: 100, marginRight: 20 }} />;
    });
  }

  const recordStatusType = useHash('record_status_type'); // 备案状态
  const companyBusiStatusHash: any = useHash('company_busi_status'); // 营业状态
  const companyLevelHash = useHash('company_level'); // 驾校等级
  const companyCategoryHash = useHash('company_category'); // 驾校类别

  return (
    <>
      {signVisible && (
        <Signature
          onCancel={setSignVisible}
          onOk={async (result) => {
            setSignVisible();
            const res = await _createImg({
              id: Auth.get('schoolId'),
              tmpId: _get(result, 'data.id', ''),
              type: '1',
            });
            if (_get(res, 'code') === 200) {
              const res = await _getImg({
                id: String(Auth.get('schoolId')),
              });
              setImgsData(_get(res, 'data', []));
            }
          }}
        />
      )}
      <div style={{ height: document.body.clientHeight - 200 }}>
        <Title>备案信息</Title>

        <Row>
          <ItemCol span={8} label="统一编码">
            {_get(basicInfoData, 'uniCode')}
          </ItemCol>
          <ItemCol span={8} label="备案状态">
            {recordStatusType[_get(basicInfoData, 'status', '')]}
          </ItemCol>
          {/* '1：只有已备案才展示 */}
          {String(_get(basicInfoData, 'status', '')) === '1' && _get(basicInfoData, 'statusTime', '') && (
            <ItemCol span={8} label="备案日期">
              {_get(basicInfoData, 'statusTime', '')}
            </ItemCol>
          )}
        </Row>

        <Title>基本信息</Title>

        <Row>
          <ItemCol span={8} label="机构名称">
            {_get(basicInfoData, 'name')}
          </ItemCol>
          <ItemCol span={8} label="机构简称">
            {_get(basicInfoData, 'shortName')}
          </ItemCol>
          <ItemCol span={8} label="行政区划">
            {_get(basicInfoData, 'area')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="经营范围">
            {_get(basicInfoData, 'busiScope')}
          </ItemCol>
          <ItemCol span={8} label="联系电话">
            {_get(basicInfoData, 'leaderPhone')}
          </ItemCol>
          <ItemCol span={8} label="邮政编码">
            {_get(basicInfoData, 'postCode')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="营业状态">
            {companyBusiStatusHash[_get(basicInfoData, 'busiStatus', '')]}
          </ItemCol>
          <ItemCol span={8} label="营业执照号">
            {_get(basicInfoData, 'certificate')}
          </ItemCol>
          <ItemCol span={8} label="社会信用代码">
            {_get(basicInfoData, 'socialCredit')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="经营许可证号/备案编号">
            {_get(basicInfoData, 'licNum')}
          </ItemCol>
          <ItemCol span={8} label="许可日期">
            {_get(basicInfoData, 'licDate')}
          </ItemCol>
          <ItemCol span={8} label="法人代表">
            {_get(basicInfoData, 'legalPerson')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="分类等级">
            {companyLevelHash[_get(basicInfoData, 'schoolLevel', '')]}
          </ItemCol>
          <ItemCol span={8} label="教练员总数">
            {_get(basicInfoData, 'coachNumber')}
          </ItemCol>
          <ItemCol span={8} label="考核员总数">
            {_get(basicInfoData, 'grasupvNum')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="安全员总数">
            {_get(basicInfoData, 'safmngNum')}
          </ItemCol>
          <ItemCol span={8} label="教练车总数">
            {_get(basicInfoData, 'tracarNum')}
          </ItemCol>
          <ItemCol span={8} label="教室总面积">
            {_get(basicInfoData, 'classroom')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="理论教室面积">
            {_get(basicInfoData, 'thClassroom')}
          </ItemCol>
          <ItemCol span={8} label="教练场总面积">
            {_get(basicInfoData, 'praticeField')}
          </ItemCol>
          <ItemCol span={8} label="联系人">
            {_get(basicInfoData, 'leader')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="地址">
            {_get(basicInfoData, 'address')}
          </ItemCol>
          <ItemCol span={8} label="驾校口令">
            {_get(basicInfoData, 'randomPasswd')}
            <Tooltip
              color={'#333'}
              className="ml20"
              placement="right"
              title="此口令用于驾校学员购买内容增值产品时享受特别优惠"
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </ItemCol>
        </Row>

        <Title>教学信息</Title>

        <Row>
          <ItemCol span={8} label="驾校类别">
            {companyCategoryHash[_get(teachInfoData, 'companyType', '')]}
          </ItemCol>
          {_get(teachInfoData, 'companyType') === '2' && (
            <ItemCol span={8} label="总校">
              {_get(teachInfoData, 'mainCompany')}
            </ItemCol>
          )}
          <ItemCol span={8} label="投诉电话">
            {_get(teachInfoData, 'complaintPhone')}
          </ItemCol>

          <ItemCol span={8} label="网络理论教学">
            {IS_NOT[_get(teachInfoData, 'internetTheory', '')]}
          </ItemCol>
          <ItemCol span={8} label="课堂理论教学">
            {IS_NOT[_get(teachInfoData, 'classroomTheory', '')]}
          </ItemCol>
          <ItemCol span={8} label="实操教学">
            {IS_NOT[_get(teachInfoData, 'practice', '')]}
          </ItemCol>

          <ItemCol span={8} label="模拟教学">
            {IS_NOT[_get(teachInfoData, 'simulation', '')]}
          </ItemCol>
        </Row>

        <Title>资质信息</Title>
        {NAME_LIST.map((item: any) => {
          return (
            <Form.Item
              label={item.label}
              key={item.value}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              labelAlign={'left'}
            >
              {imgList(item.value)}
            </Form.Item>
          );
        })}
      </div>
    </>
  );
}
