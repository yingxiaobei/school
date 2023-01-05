import { Modal, Form, Row, Space } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getDetails } from './_api';
import { CheckCircleOutlined } from '@ant-design/icons';
import { _getCustomParam } from 'api';
import { _get, Auth, formatTime } from 'utils';
import moment from 'moment';
import { ItemCol, Title, PopoverImg } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();

  const { data } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
  });

  const genderHash = useHash('gender_type'); // 性别
  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const occupation_levelHash = useHash('occupation_level_type'); // 职业资格等级
  const { data: paramData } = useFetch({
    request: _getCustomParam, //"是否开启资质上传(0-不开启，1-开启)"
    query: { paramCode: 'is_allow_exam_license_up', schoolId: Auth.get('schoolId') },
  });
  const { data: roleData } = useFetch({
    request: _getCustomParam, // 0：国交 1：至正 2 ：福建
    query: { paramCode: 'jg_request_platform_type', schoolId: Auth.get('schoolId') },
  });
  const authHash = ['0', '2'].includes(_get(roleData, 'paramValue')) && _get(paramData, 'paramValue', '0') === '1';

  return (
    <Modal visible width={800} title={'考核员信息详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Title>备案信息</Title>

        <Row>
          <ItemCol span={8} label="统一编码">
            {_get(data, 'examnum', '')}
          </ItemCol>
          <ItemCol span={8} label="备案状态">
            {registeredExamFlagHash[_get(data, 'coaCoachExtinfoEntity.registeredExamflag', 0)]}
          </ItemCol>
          {/* // TODO: 12-13 新增枚举 备案失败 */}
          {(_get(data, 'coaCoachExtinfoEntity.registeredExamflag', 0) === '3' ||
            _get(data, 'coaCoachExtinfoEntity.registeredExamflag', 0) === '5') && (
            <ItemCol span={8} label="原因">
              {_get(data, 'coaCoachExtinfoEntity.messageExam', '')}
            </ItemCol>
          )}
        </Row>

        <Title>基本信息</Title>

        <Row>
          <ItemCol span={8} label="姓名">
            {_get(data, 'coachname', '')}
          </ItemCol>
          <ItemCol span={8} label="性别">
            {genderHash[_get(data, 'sex', 0)]}
          </ItemCol>
          <ItemCol span={8} label="身份证号">
            {_get(data, 'idcard', '')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="联系电话">
            {_get(data, 'mobile', '')}
          </ItemCol>
          <ItemCol span={8} label="地址">
            {_get(data, 'address', '')}
          </ItemCol>
          <ItemCol span={8} label="照片">
            <PopoverImg src={_get(data, 'coaCoachExtinfoEntity.headImgUrl', '')} imgStyle={{ width: 60, height: 60 }} />
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="驾驶证号">
            {_get(data, 'drilicence', '')}
          </ItemCol>
          <ItemCol span={8} label="初领日期">
            {formatTime(_get(data, 'fstdrilicdate'), 'DATE')}
          </ItemCol>
          <ItemCol span={8} label="准驾车型">
            {_get(data, 'dripermitted', '')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="职业资格证">
            {_get(data, 'occupationno', '')}
          </ItemCol>
          <ItemCol span={8} label="职业资格等级">
            {occupation_levelHash[_get(data, 'occupationlevel', '')]}
          </ItemCol>
          <ItemCol span={8} label="准教车型">
            {_get(data, 'teachpermitted', '')}
          </ItemCol>
        </Row>

        <Row>
          <ItemCol span={8} label="供职状态">
            {employStatusHash[_get(data, 'employstatusKhy', '00')]}
          </ItemCol>
          <ItemCol span={8} label="入职日期">
            {formatTime(_get(data, 'hiredate'), 'DATE')}
          </ItemCol>
          <ItemCol span={8} label="离职日期">
            {formatTime(_get(data, 'leavedate'), 'DATE')}
          </ItemCol>
        </Row>

        <Row>
          <Title>其他信息</Title>
        </Row>

        <Row>
          <ItemCol span={8} label="考核员签字">
            <PopoverImg
              src={_get(data, 'coaCoachExtinfoEntity.signNoteImgUrl', '')}
              imgStyle={{ width: 60, height: 60 }}
            />
          </ItemCol>
        </Row>
        {authHash ? (
          <>
            <Title>备案信息补充</Title>
            <Row>
              <ItemCol label="机动车驾驶证">
                <div className="flex">
                  <div className=" mr20">
                    <Space>
                      <div
                        className="mr10 pointer color-primary "
                        onClick={() => {
                          window.open(_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl'));
                        }}
                      >
                        {_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl') ? '驾驶证' : ''}
                      </div>
                      <div
                        className="mr10 pointer color-primary "
                        onClick={() => {
                          window.open(_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl1'));
                        }}
                      >
                        {_get(data, 'coaCoachExtinfoEntity.driverLicenseImgUrl1') ? '驾驶证' : ''}
                      </div>
                      {_get(data, 'coaCoachExtinfoEntity.driverLicenseImageupFlag') === '1' ? (
                        <div>
                          <CheckCircleOutlined className="green" />
                        </div>
                      ) : undefined}
                    </Space>
                  </div>
                </div>
              </ItemCol>
              <ItemCol label="身份证">
                <div className="flex">
                  <div className=" mr20">
                    <Space>
                      <div
                        className="mr10 pointer color-primary "
                        onClick={() => {
                          window.open(_get(data, 'coaCoachExtinfoEntity.idcardImgUrl', ''));
                        }}
                      >
                        {_get(data, 'coaCoachExtinfoEntity.idcardImgUrl') ? '身份证' : ''}
                      </div>
                      <div
                        className="mr10 pointer color-primary "
                        onClick={() => {
                          window.open(_get(data, 'coaCoachExtinfoEntity.idcardImgUrl1'));
                        }}
                      >
                        {_get(data, 'coaCoachExtinfoEntity.idcardImgUrl1') ? '身份证' : ''}
                      </div>
                      {_get(data, 'coaCoachExtinfoEntity.idcardImageupFlag') === '1' ? (
                        <div>
                          <CheckCircleOutlined className="green" />
                        </div>
                      ) : undefined}
                    </Space>
                  </div>
                </div>
              </ItemCol>
              <ItemCol label="安全员从业资格证">
                <div className="flex">
                  <div className=" mr20">
                    {_get(data, 'coaCoachExtinfoEntity.practice_license', [])?.map((x: any, index: number) => {
                      return (
                        <PopoverImg
                          src={_get(x, 'url', '')}
                          key={_get(x, 'id')}
                          imgStyle={{ width: 60, height: 60, marginRight: 10 }}
                        />
                      );
                    })}
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.practiceLicenseImageupFlag') === '1' ? (
                    <div>
                      <CheckCircleOutlined className="green" />
                    </div>
                  ) : undefined}
                </div>
              </ItemCol>
              <ItemCol label="安全员安全资格证">
                <div className="flex">
                  <div className=" mr20">
                    {_get(data, 'coaCoachExtinfoEntity.security_license', [])?.map((x: any, index: number) => {
                      return (
                        <PopoverImg
                          src={_get(x, 'url', '')}
                          key={_get(x, 'id')}
                          imgStyle={{ width: 60, height: 60, marginRight: 10 }}
                        />
                      );
                    })}
                  </div>
                  {_get(data, 'coaCoachExtinfoEntity.securityLicenseImageupFlag') === '1' ? (
                    <div>
                      <CheckCircleOutlined className="green" />
                    </div>
                  ) : undefined}
                </div>
              </ItemCol>
            </Row>
          </>
        ) : undefined}
      </Form>
    </Modal>
  );
}
