import * as React from 'react';
import { ItemCol, PopoverImg, Title } from 'components';
import { Row } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { _get } from 'utils';

export default function Detail(props: DETAIL.Props) {
  const { data } = props;

  return (
    <div>
      {data.map((item) => {
        const { title, rows } = item;
        return (
          <React.Fragment key={item.title}>
            {title && <Title>{title}</Title>}
            <Row>
              {rows.map((y) => {
                const { label, value, type = 'span', insertWhen = true, span = 8, valueLabel } = y;
                if (!insertWhen) {
                  return null;
                }

                return (
                  <ItemCol span={span} label={label} key={label}>
                    {type === 'span' && <span>{value}</span>}
                    {type === 'multiple' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {value.map((item: string, index: number) => (
                          <span key={index}>{item}</span>
                        ))}
                      </div>
                    )}
                    {type === 'PopoverImg' && <PopoverImg src={value} imgStyle={{ width: 60, height: 60 }} />}
                    {type === 'PopoverImgWithRightIcon' && (
                      <div className="flex">
                        <div className="w60 mr20">
                          <PopoverImg src={value.src} imgStyle={{ width: 60, height: 60 }} />
                        </div>
                        {value.showIcon && (
                          <div className="pt40">
                            <CheckCircleOutlined className="green" />
                          </div>
                        )}
                      </div>
                    )}
                    {type === 'PopoverImgListWithRightIcon' && (
                      <div className="flex" style={{ flexWrap: 'wrap' }}>
                        <div className="mr10">
                          {value.list.map((x: any, index: number) => {
                            return (
                              <PopoverImg
                                src={_get(x, 'url', '')}
                                // key={_get(x, 'id')}
                                key={index}
                                imgStyle={{ width: 60, height: 60, marginRight: 10 }}
                              />
                            );
                          })}
                        </div>
                        {value.showIcon && (
                          <div className="pt40">
                            <CheckCircleOutlined className="green" />
                          </div>
                        )}
                      </div>
                    )}
                    {type === 'UploadFile' && (
                      <div className="flex">
                        <div
                          className="mr10 pointer color-primary "
                          onClick={() => {
                            window.open(value.src);
                          }}
                        >
                          {value.src ? label : ''}
                        </div>
                        <div>
                          {value.showIcon && (
                            <div>
                              <CheckCircleOutlined className="green" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {type === 'UploadFileListWithRightIcon' && (
                      <div className="flex">
                        {value.list.map((item: any, index: number) =>
                          !item ? null : (
                            <React.Fragment key={index}>
                              <div
                                className="mr10 pointer color-primary"
                                onClick={() => {
                                  window.open(item);
                                }}
                              >
                                {item ? valueLabel : ''}
                              </div>
                              <div>
                                {value.showIcon && (
                                  <div>
                                    <CheckCircleOutlined className="green" />
                                  </div>
                                )}
                              </div>
                            </React.Fragment>
                          ),
                        )}
                      </div>
                    )}
                  </ItemCol>
                );
              })}
            </Row>
          </React.Fragment>
        );
      })}
    </div>
  );
}
