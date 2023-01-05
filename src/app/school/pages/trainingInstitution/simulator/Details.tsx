import { Form, Row, Modal } from 'antd';
import { useFetch } from 'hooks';
import { _getDetails } from './_api';
import { Loading, ItemCol, PopoverImg } from 'components';
import { _get } from 'utils';

export default function Details(props: any) {
  const { onCancel, currentId, setLng, setLat, lng, lat } = props;

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
    callback: (data) => {
      setLng(_get(data, 'longitude'));
      setLat(_get(data, 'latitude'));
    },
  });

  return (
    <Modal visible width={900} title={'模拟器详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      {isLoading && <Loading />}
      {!isLoading && (
        <Form>
          <Row>
            <ItemCol label="模拟器名称">{_get(data, 'simulatorname', '')}</ItemCol>
            <ItemCol label="培训车型">{_get(data, 'perdritype', '')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="品牌">{_get(data, 'brand', '')}</ItemCol>
            <ItemCol label="型号">{_get(data, 'model', '')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="类型">{_get(data, 'typeValue', '')}</ItemCol>
            <ItemCol label="购买日期">{_get(data, 'buydate', '')}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="生产厂家">{_get(data, 'manufacture', '')}</ItemCol>
            <ItemCol label="所在位置">{lng ? `${Number(lng).toFixed(6)},${Number(lat).toFixed(6)}` : ''}</ItemCol>
          </Row>
          <Row>
            <ItemCol label="模拟器图片">
              <PopoverImg src={_get(data, 'showUrl', '')} alt="" />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
