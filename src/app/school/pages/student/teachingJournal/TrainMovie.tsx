import { _getTrainingPhotosDetail, _getStuMubanPic, _getCoMubanPic } from './_api';
import { _get } from 'utils';
import { Image, Space, Divider, Popover } from 'antd';
import { CSSProperties, useEffect, useState } from 'react';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import alt from 'statics/alt.png';

const itemStyle: CSSProperties = { width: '160px', height: '200px', margin: 'auto 20px' };
const titleStyle: CSSProperties = {
  fontWeight: 'bolder',
  borderLeft: ' 2px solid #666',
  paddingLeft: '8px',
  marginBottom: '4px',
};

const titleList = ['学员证件照', '学员模板照', '学员签到照', '学员签退照', '教练证件照', '教练模板照'];

export default function TrainMovie(props: any) {
  const { currentRecord } = props;
  const [list, setList] = useState<any>([]); // 第一行照片
  const [otherList, setOtherList] = useState<any>([]); // 第二行照片
  const UPLOAD_STATUS: any = {
    0: '未上报',
    1: '已上报',
    2: '上报失败',
  };

  useEffect(() => {
    Promise.all([
      _getCoMubanPic({
        cid: _get(currentRecord, 'coachid'),
      }),
      _getStuMubanPic({
        sid: _get(currentRecord, 'stuid'),
      }),
      _getTrainingPhotosDetail({
        classid: _get(currentRecord, 'classid'),
        signstarttime: _get(currentRecord, 'signstarttime', ''),
        photoTypes: '17,18,99,5,51', // 17:学员登录拍照,18:学员登出拍照,99:证件照 // 5:定时拍照 51:萤石云抓拍
      }),
    ]).then((res: any) => {
      console.log('first', res);
      list[1] = { title: titleList[1], url: _get(res, '[1].data')?.faceid_center };
      let other: any = [];
      Array.isArray(_get(res, '[2].data')) &&
        _get(res, '[2].data')?.forEach((item: any) => {
          if (_get(item, 'phototype') === '99') {
            //学员证件照
            list[0] = { title: titleList[0], url: _get(item, 'url') };
            return;
          }
          if (_get(item, 'phototype') === '17') {
            list[2] = {
              // 学员签到照片
              title: titleList[2],
              url: _get(item, 'url'),
              equtime: _get(item, 'equtime'),
              color: _get(item, 'uploadstatus') === '2' ? PRIMARY_COLOR : '',
              uploadstatus: UPLOAD_STATUS[_get(item, 'uploadstatus')],
            };
            return;
          }
          if (_get(item, 'phototype') === '18') {
            list[3] = {
              // 学员签出照片
              title: titleList[3],
              url: _get(item, 'url'),
              equtime: _get(item, 'equtime'),
              color: _get(item, 'uploadstatus') === '2' ? PRIMARY_COLOR : '',
              uploadstatus: UPLOAD_STATUS[_get(item, 'uploadstatus')],
            };
            return;
          } else {
            other.push({
              title: '', // 随机照片
              url: _get(item, 'url'),
              equtime: _get(item, 'equtime'),
              color: _get(item, 'uploadstatus') === '2' ? PRIMARY_COLOR : '',
              uploadstatus: UPLOAD_STATUS[_get(item, 'uploadstatus')],
            });
          }
        });

      list[4] = { title: titleList[4], url: _get(res, '[0].data')?.head_img_url };
      list[5] = { title: titleList[5], url: _get(res, '[0].data')?.faceid_center };
      setList(list);
      setOtherList(other);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_get(currentRecord, 'stuid')]);

  return (
    <>
      <Image.PreviewGroup>
        <Space wrap>
          {titleList.map((title: string, index: number) => {
            const item: any = list[index];
            return item ? (
              <div style={itemStyle} key={index}>
                <div style={titleStyle}>{title}</div>
                {item && item.url ? (
                  <Popover content={<img src={item.url} alt={alt} style={{ width: 500 }} />}>
                    <Image src={item.url} alt="照片" style={{ width: 150, height: 150 }} />
                  </Popover>
                ) : (
                  <img src={alt} alt="" style={{ width: 150, height: 150 }} />
                )}
                <div>{item.equtime}</div>
                <div style={{ color: item.color }}>{item.uploadstatus}</div>
              </div>
            ) : (
              <div style={itemStyle} key={index}>
                <div style={titleStyle}>{title}</div>
                <img src={alt} alt="" style={{ width: 150, height: 150 }} />
              </div>
            );
          })}
        </Space>

        <Divider />
        <p style={{ ...titleStyle, marginLeft: '20px' }}>随机照片</p>
        <Space wrap size={[8, 16]}>
          {otherList.map((item: any, index: number) => {
            return (
              <div style={itemStyle} key={index}>
                {item && item.url ? (
                  <Popover content={<img src={item.url} alt={alt} style={{ width: 500 }} />}>
                    <Image src={item.url} alt="照片" style={{ width: 150, height: 150 }} />
                  </Popover>
                ) : (
                  <img src={alt} alt="" style={{ width: 150, height: 150 }} />
                )}
                <div>{item.equtime}</div>
                <div style={{ color: item.color }}>{item.uploadstatus}</div>
              </div>
            );
          })}
        </Space>
      </Image.PreviewGroup>
    </>
  );
}
