import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { _createImg, _getImg, _deleteImg } from 'api';
import { IF, Loading, MultipleUpload, PopoverImg } from 'components';
import { useFetch, useOptions } from 'hooks';
import { Row } from 'antd';

export default function SchoolImg(props: any) {
  const { currentId, isEdit } = props;
  const [imgsData, setImgsData] = useState([]);
  const [dataList, setDataList] = useState({} as any);
  const [finished, setFinished] = useState(false);
  const IMG_TYPE = ['8', '9', '10', '11']; // 8校园风貌\9培训实景\10教具设施\11场地图片
  const SCHOOL_IMG_LIST = useOptions('company_img_type').filter((x) => IMG_TYPE.includes(x.value));
  const NAME_LIST = SCHOOL_IMG_LIST.sort((x: any, y: any) => x.value - y.value); // 图片

  useEffect(() => {
    const dataList = NAME_LIST.reduce((acc, x) => {
      const imgData = (imgsData || []).filter((item: any) => _get(item, 'type') === x.value);
      const imgDataMap = imgData.map((item: any) => {
        return { url: item.url, id: item.id };
      });
      return { ...acc, [x.value]: imgDataMap };
    }, {});

    setDataList(dataList);
    if (!isLoading) {
      setFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NAME_LIST.length, imgsData]);

  // 资质信息
  const { isLoading } = useFetch<any>({
    query: {
      id: currentId,
      permissionType: 1,
    },
    request: _getImg,
    callback: (data) => {
      setImgsData(data);
    },
  });

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            {NAME_LIST.map((item: any) => {
              return (
                <div key={item.value}>
                  <Row className="bold mt10 mb10">{item.label}</Row>

                  {finished &&
                    (isEdit ? (
                      <MultipleUpload
                        fileList={dataList[item.value]}
                        setFileList={(p) => setDataList({ ...dataList, [item.value]: p })}
                        callback={async (data: { url: string; id: string }) => {
                          const { url, id } = data;
                          await _createImg({
                            id: currentId,
                            tmpId: id,
                            type: item.value,
                            permissionType: 1,
                          });
                        }}
                        onRemove={async (data: any) => {
                          await _deleteImg({ id: currentId, tmpId: data.id, permissionType: 1 });
                        }}
                        limit={10}
                      />
                    ) : _get(dataList[item.value], 'length', 0) > 0 ? (
                      (dataList[item.value] || []).map((x: any, index: number) => {
                        return _get(x, 'url', '') ? (
                          <PopoverImg src={_get(x, 'url', '')} key={_get(x, 'id')} imgStyle={{ marginRight: 20 }} />
                        ) : (
                          '未上传'
                        );
                      })
                    ) : (
                      '未上传'
                    ))}
                </div>
              );
            })}
          </>
        }
      />
    </div>
  );
}
