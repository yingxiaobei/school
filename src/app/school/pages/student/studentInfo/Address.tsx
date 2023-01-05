import { useEffect, useState } from 'react';
import { Select, Col, Row } from 'antd';
import { useFetch } from 'hooks';
import { _getBaseInfo, _getCode } from 'api';
import { Auth, _get } from 'utils';

const { Option } = Select;

interface AddressProps {
  cityCode: string;
  setCityCode: (cityCode: string) => void;
  // stutransareatype/isEdit 仅仅用在学员档案中 转入
  stutransareatype?: string;
  isEdit?: boolean;
}

const enum STU_TRANS_AREA_TYPE {
  Default = '0', // 普通学员
  Out_Of_Province = '1', // 省外转入
  Offsite_In_The_Province = '2', // 省内异地转入
  The_City = '3', // 本市转入
}

// export type DefaultAddress = {
//   stutransareatype: string;
//   provinceCode: string;
//   cityCode: string;
// };

export default function Address({ cityCode, setCityCode, stutransareatype = '0', isEdit = false }: AddressProps) {
  const [provinceCode, setProvinceCode] = useState<any>(cityCode ? cityCode.slice(0, 2) + '0000' : '');
  // 方案一
  // const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  // 方案二
  const [defaultProvinceCode, setDefaultProvinceCode] = useState('');
  const [defaultCityCode, setDefaultCityCode] = useState('');

  useEffect(() => {
    setProvinceCode(cityCode ? cityCode.slice(0, 2) + '0000' : provinceCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityCode]);

  const { data: provinceData = [] } = useFetch({
    request: _getCode,
    query: {
      codeType: 'address_type',
      parentCodeKey: '-1',
    },
  });

  const { data: cityData = [] } = useFetch({
    request: _getCode,
    query: {
      codeType: 'address_type',
      parentCodeKey: provinceCode,
    },
    depends: [provinceCode],
  });

  const { data } = useFetch({
    request: _getBaseInfo,
    query: {
      id: Auth.get('schoolId'),
    },
  });

  useEffect(() => {
    if (data && stutransareatype !== STU_TRANS_AREA_TYPE.Default) {
      const provinceCode = _get(data, 'provinceCode');
      const cityCode = _get(data, 'cityCode');
      // 迁移数据的考虑
      // note: 1. 问题在于是否有可能只有 baseInfo中只有省 没有市
      // note: 2. 问题在于是否有可能 baseInfo 既没有省 也没有市
      setDefaultProvinceCode(provinceCode);
      setDefaultCityCode(cityCode);
      // setDefaultAddress({
      //   provinceCode,
      //   cityCode,
      //   stutransareatype,
      // });
    }
  }, [data, stutransareatype]);

  useEffect(() => {
    if (!isEdit && defaultProvinceCode) {
      // 新增省 code变化
      // const { provinceCode, stutransareatype } = defaultAddress;
      switch (stutransareatype) {
        case STU_TRANS_AREA_TYPE.Offsite_In_The_Province:
        case STU_TRANS_AREA_TYPE.The_City:
          setProvinceCode(defaultProvinceCode);
          break;
        case STU_TRANS_AREA_TYPE.Out_Of_Province:
        default:
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, defaultProvinceCode]);

  useEffect(() => {
    // 新增 市区code变化 的情况
    if (!isEdit && defaultCityCode && provinceCode) {
      // const { cityCode, stutransareatype } = defaultAddress;
      switch (stutransareatype) {
        case STU_TRANS_AREA_TYPE.The_City:
          setCityCode(defaultCityCode);
          break;
        case STU_TRANS_AREA_TYPE.Offsite_In_The_Province:
        case STU_TRANS_AREA_TYPE.Out_Of_Province:
        default:
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, defaultCityCode, provinceCode]);

  const provinceDisabled = (provinceCodeItem: string) => {
    if (!defaultProvinceCode) {
      return false;
    } else {
      // const { provinceCode, stutransareatype } = defaultAddress;
      /**
       * （1）选择省内异地转入：默认转出驾校省市为本省，市为空，且只能选择本省，非本市的。点 击确定时，校验市是否为空，若为空，则 toast 提示：转出省市不能为空；
       * （2）选择市内转入：默认当前驾校所属省份和城市，且只能选择本市的，不能更改；
       * （3）省外转入：没有默认值，只能选择本省之外的省市。
       */
      switch (stutransareatype) {
        case STU_TRANS_AREA_TYPE.Out_Of_Province: // 省外转入
          return provinceCodeItem === defaultProvinceCode;
        case STU_TRANS_AREA_TYPE.Offsite_In_The_Province: // 省内异地转入
          return provinceCodeItem !== defaultProvinceCode;
        case STU_TRANS_AREA_TYPE.The_City: // 本市转入
          return provinceCodeItem !== defaultProvinceCode;
        default:
          return false;
      }
    }
  };

  const cityDisabled = (cityCodeItem: string) => {
    if (!defaultCityCode) {
      return false;
    } else {
      // const { cityCode, stutransareatype } = defaultAddress;
      /**
       * （1）选择省内异地转入：默认转出驾校省市为本省，市为空，且只能选择本省，非本市的。点 击确定时，校验市是否为空，若为空，则 toast 提示：转出省市不能为空；
       * （2）选择市内转入：默认当前驾校所属省份和城市，且只能选择本市的，不能更改；
       * （3）省外转入：没有默认值，只能选择本省之外的省市。
       */
      switch (stutransareatype) {
        case STU_TRANS_AREA_TYPE.Out_Of_Province: // 省外转入
          return false;
        case STU_TRANS_AREA_TYPE.Offsite_In_The_Province: // 省内异地转入
          return cityCodeItem === defaultCityCode;
        case STU_TRANS_AREA_TYPE.The_City: // 本市转入
          return cityCodeItem !== defaultCityCode;
        default:
          return false;
      }
    }
  };

  return (
    <>
      <Row>
        <Col>
          <Select
            className="mr20"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            onChange={(value: any) => {
              setProvinceCode(value);
              setCityCode('');
            }}
            value={provinceCode}
          >
            {provinceData.map((x: any) => {
              return (
                <Option disabled={provinceDisabled(_get(x, 'value'))} key={x.value} value={x.value}>
                  {x.text}
                </Option>
              );
            })}
          </Select>
        </Col>

        <Col>
          <Select
            className="mr20"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            onChange={(value: any) => {
              setCityCode(value);
            }}
            value={cityCode}
          >
            {cityData.map((x: any) => {
              return (
                <Option disabled={cityDisabled(_get(x, 'value'))} key={x.value} value={x.value}>
                  {x.text}
                </Option>
              );
            })}
          </Select>
        </Col>
      </Row>
    </>
  );
}
