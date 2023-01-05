import { Title, ItemCol } from 'components';
import { _get } from 'utils';
import { Row } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getBaseInfo } from 'api';
import { IF, Loading } from 'components';

export default function BasicInfo(props: any) {
  const { currentRecord } = props;
  const recordStatusType = useHash('record_status_type'); // 备案状态
  const companyBusiStatusHash: any = useHash('company_busi_status'); // 营业状态
  const companyLevelHash = useHash('company_level'); // 驾校等级
  const initStatusHash: any = useHash('company_init_status'); // 初始化状态

  const { data: basicInfoData, isLoading } = useFetch<any>({
    request: _getBaseInfo,
    query: { id: _get(currentRecord, 'id', ''), permissionType: 1 },
  });

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            <Title>备案信息</Title>

            <Row>
              <ItemCol span={6} label="统一编码">
                {_get(basicInfoData, 'uniCode', '未获取')}
              </ItemCol>
              <ItemCol span={6} label="备案状态">
                {recordStatusType[_get(basicInfoData, 'status', '')]}
              </ItemCol>
            </Row>
            <Title>基本信息</Title>
            <Row>
              <ItemCol span={6} label="机构名称">
                {_get(basicInfoData, 'name')}
              </ItemCol>
              <ItemCol span={6} label="机构简称">
                {_get(basicInfoData, 'shortName')}
              </ItemCol>
              <ItemCol span={6} label="初始化状态">
                {initStatusHash[_get(basicInfoData, 'initStatus', '')]}
              </ItemCol>
              <ItemCol span={6} label="行政区划">
                {_get(basicInfoData, 'area')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={6} label="经营范围">
                {_get(basicInfoData, 'busiScope')}
              </ItemCol>
              <ItemCol span={6} label="经营状态">
                {companyBusiStatusHash[_get(basicInfoData, 'busiStatus', '')]}
              </ItemCol>
              <ItemCol span={6} label="营业执照号">
                {_get(basicInfoData, 'certificate')}
              </ItemCol>
              <ItemCol span={6} label="企业法人">
                {_get(basicInfoData, 'legalPerson')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={6} label="统一社会信用代码">
                {_get(basicInfoData, 'socialCredit')}
              </ItemCol>
              <ItemCol span={6} label="经营许可证编码">
                {_get(basicInfoData, 'licNum')}
              </ItemCol>
              <ItemCol span={6} label="经营许可证起止日期">
                {_get(basicInfoData, 'licDate')}
              </ItemCol>
              <ItemCol span={6} label="培训机构分类等级">
                {companyLevelHash[_get(basicInfoData, 'schoolLevel', '')]}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={6} label="教练员总数">
                {_get(basicInfoData, 'coachNumber')}
              </ItemCol>
              <ItemCol span={6} label="考核员总数">
                {_get(basicInfoData, 'grasupvNum')}
              </ItemCol>
              <ItemCol span={6} label="安全员总数">
                {_get(basicInfoData, 'safmngNum')}
              </ItemCol>
              <ItemCol span={6} label="教练车总数">
                {_get(basicInfoData, 'tracarNum')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={6} label="教室总面积">
                {_get(basicInfoData, 'classroom')}
              </ItemCol>
              <ItemCol span={6} label="理论教室面积">
                {_get(basicInfoData, 'thClassroom')}
              </ItemCol>
              <ItemCol span={6} label="实操教室总面积">
                {_get(basicInfoData, 'praticeField')}
              </ItemCol>
              <ItemCol span={6} label="联系人">
                {_get(basicInfoData, 'leader')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={6} label="联系人手机号">
                {_get(basicInfoData, 'leaderPhone')}
              </ItemCol>
              <ItemCol span={6} label="邮政编码">
                {_get(basicInfoData, 'postCode')}
              </ItemCol>
              <ItemCol span={6} label="培训机构地址">
                {_get(basicInfoData, 'address')}
              </ItemCol>
            </Row>
          </>
        }
      />
    </div>
  );
}
