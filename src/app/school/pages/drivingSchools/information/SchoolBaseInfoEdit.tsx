import { memo } from 'react';
import { Drawer, Form, Button, Divider, Typography, Row, Input } from 'antd';
import { ItemCol, UploadPro } from 'components';
import Checkbox from 'antd/es/checkbox';
import { BaseInfo, Infrastructure, _updateSchoolDetail } from './_api';
import { useEffect } from 'react';
import styles from './index.module.css';
import { _get } from 'utils';
import { useState } from 'react';
import RichText from './RichText';
import { useVisible } from 'hooks';
import AddressLocator from './AddressLocator';
import { RULES } from 'constants/rules';
interface Props {
  baseInfo: Partial<BaseInfo>;
  switchVisible: () => void;
  updateBaseInfoCallback: () => void;
}

const { Title } = Typography;

function SchoolBaseInfoEdit({ switchVisible, updateBaseInfoCallback, baseInfo = {} }: Props) {
  const [form] = Form.useForm();
  const [bannerImgUrl, setBannerImgUrl] = useState<string | undefined>(undefined);
  const [bannerImgId, setBannerImgId] = useState<string | undefined>(undefined);
  const [richTextContent, setRichTextContent] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [mapLocatorVisible, setMapLocatorVisible] = useVisible();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const {
      totalCoachArea,
      totalCoachCar,
      totalCoachCnt,
      address = '',
      bannerImgUrl,
      description = '',
      facilityInfo = {},
    } = baseInfo;

    // eslint-disable-next-line array-callback-return
    const infrastructureOptions = Object.entries(facilityInfo as Infrastructure).map(([key, value]) => {
      if (value === 1) {
        return key;
      }
    });

    // 编辑bannerUrl
    setBannerImgUrl(bannerImgUrl);
    // 设置富文本内容
    setRichTextContent(description);
    // 设置驾校的定位地址
    setSchoolAddress(address);

    form.setFieldsValue({
      totalCoachArea,
      totalCoachCar,
      totalCoachCnt,
      address,
      infrastructureOptions: infrastructureOptions.filter((item) => item), // 排除 undefined
    });
  }, [baseInfo, form]);

  const infrastructureOptions: { label: string; value: keyof Infrastructure }[] = [
    {
      label: '食堂',
      value: 'canteen',
    },
    {
      label: '免费WIFI',
      value: 'freeNet',
    },
    {
      label: '商店',
      value: 'shop',
    },
    {
      label: '储物箱',
      value: 'locker',
    },
    {
      label: '网吧',
      value: 'internetBar',
    },
    {
      label: '咖啡厅',
      value: 'cofferShop',
    },
    {
      label: '浴室',
      value: 'bathroom',
    },
    {
      label: '休息区',
      value: 'restArea',
    },
  ];

  const updateSchoolBaseInfo = () => {
    form.validateFields().then(async (value) => {
      try {
        setConfirmLoading(true);
        let { address, totalCoachCnt, totalCoachCar, totalCoachArea } = value;

        const infrastructureOptions: (keyof Infrastructure)[] = _get(value, 'infrastructureOptions', []);
        const facilityInfo = {};
        infrastructureOptions.forEach((infrastructure) => {
          facilityInfo[infrastructure] = 1;
        });

        await _updateSchoolDetail({
          name: _get(baseInfo, 'name', ''),
          totalCoachCar,
          totalCoachCnt,
          totalCoachArea,
          address,
          facilityInfo,
          description: richTextContent,
          bannerImg: bannerImgId,
        });
        switchVisible();
        updateBaseInfoCallback();
      } catch (error) {
        console.error(error);
      } finally {
        setConfirmLoading(false);
      }
    });
  };

  return (
    <Drawer
      visible
      title="基本信息"
      width="960px"
      footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      footer={
        <>
          <Button style={{ marginRight: '1.4rem' }} onClick={switchVisible}>
            取消
          </Button>
          <Button type="primary" onClick={updateSchoolBaseInfo} loading={confirmLoading}>
            确定
          </Button>
        </>
      }
      onClose={switchVisible}
    >
      <Form form={form}>
        <Title level={5}>驾校推广图</Title>
        <UploadPro maxSize={5} imageUrl={bannerImgUrl} setImageUrl={setBannerImgUrl} setImgId={setBannerImgId} />
        <Row style={{ marginTop: '1rem' }}>
          <ItemCol
            span={12}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }}
            rules={[{ whitespace: true, required: true }]}
            label="地址"
            name="address"
          >
            <Input
              value={schoolAddress}
              onChange={(e) => {
                setSchoolAddress(e.target.value);
              }}
              placeholder="请输入地址"
              suffix={
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    setMapLocatorVisible();
                  }}
                >
                  地图定位
                </Button>
              }
            />
          </ItemCol>
          {mapLocatorVisible && (
            <AddressLocator
              switchVisible={setMapLocatorVisible}
              schoolAddress={schoolAddress}
              confirmAddressCallback={(address) => {
                form.setFieldsValue({ address });
                setSchoolAddress(address);
                setMapLocatorVisible();
              }}
            />
          )}
        </Row>

        <Row className={styles['schoolInfoCountWrapper']}>
          <ItemCol
            rules={[RULES.POSITIVE_NUM]}
            label="教练"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 12 }}
            span={6}
            name="totalCoachCnt"
          >
            <Input placeholder="请输入教练人数" suffix="人" />
          </ItemCol>
          <ItemCol
            rules={[RULES.POSITIVE_NUM]}
            label="车辆"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 12 }}
            span={6}
            name="totalCoachCar"
          >
            <Input placeholder="请输入车辆" suffix="辆" />
          </ItemCol>
          <ItemCol
            rules={[RULES.TOTAL_COACH_AREA]}
            label="占地面积"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 12 }}
            span={6}
            name="totalCoachArea"
          >
            <Input placeholder="请输入占地面积" suffix="㎡" />
          </ItemCol>
        </Row>
        <Divider />
        <Title level={5}>配套设施</Title>

        <Form.Item name="infrastructureOptions">
          <Checkbox.Group>
            {infrastructureOptions.map((infrastructure) => (
              <Checkbox key={infrastructure.value} value={infrastructure.value} style={{ lineHeight: '32px' }}>
                {infrastructure.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Divider />
        <Title level={5}>驾校简介</Title>
        <RichText editorState={richTextContent} setEditorState={setRichTextContent} />
      </Form>
    </Drawer>
  );
}

export default memo(SchoolBaseInfoEdit);
