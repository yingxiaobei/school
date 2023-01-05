import { Button, Modal, Tree, Divider, Spin, Empty } from 'antd';
import { useState, useContext, useEffect, useRef } from 'react';
import GlobalContext from 'globalContext';
import { _saveColumInfo } from '../_api';
import { _get } from 'utils';

interface IProps {
  columns: any;
  show?: boolean;
  pageType?: string; //指定的页面：必填项，和后端提供的数据字典对应
}

const RowSetting = (props: IProps) => {
  const { columns, show = true, pageType = '' } = props;
  const { $setColumns, $columnsAll } = useContext(GlobalContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [load, setLoad] = useState(false);
  const [loadReset, setLoadReset] = useState(false);

  const [leftData, setLeftData] = useState([]); //树数据
  const [rightData, setRightData] = useState([]); //树数据
  const [centerData, setCenterData] = useState([]); //树数据
  const [leftCheckList, setLeftCheckList] = useState<any[]>([]); //树数据
  const [rightCheckList, setRightCheckList] = useState<any[]>([]); //树数据
  const [centerCheckList, setCenterCheckList] = useState<any[]>([]); //树数据
  const handleOk = (type: string) => {
    // 0:保存 1：重置
    const param = [
      ...leftData?.filter(({ dataIndex }: any) => leftCheckList.includes(dataIndex)),
      ...centerData?.filter(({ dataIndex }: any) => centerCheckList.includes(dataIndex)),
      ...rightData?.filter(({ dataIndex }: any) => rightCheckList.includes(dataIndex)),
    ].map((item: any, index) => {
      return { dataIndex: item.dataIndex, orderNum: index, id: item.id };
    });
    type === '0' ? setLoad(true) : setLoadReset(true);

    _saveColumInfo(type === '0' ? { dict: pageType, list: param } : { dict: pageType, list: [] }).then(() => {
      $setColumns();

      setTimeout(() => {
        setModalVisible(false);
        type === '0' ? setLoad(false) : setLoadReset(false);
      }, 1000);
    });
  };

  useEffect(() => {
    let leftList: any = [];
    let rightList: any = [];
    let centerList: any = [];
    let leftCheckList: any = [];
    let rightCheckList: any = [];
    let centerCheckList: any = [];
    if (!pageType || !$columnsAll[pageType] || $columnsAll[pageType]?.showList.length <= 0) {
      return;
    }
    $columnsAll[pageType]?.showList
      .map((a: any) => {
        return { ...a, ...columns.filter((item: any) => item.dataIndex === a.dataIndex)[0] };
      })
      .filter((x: any) => {
        return _get(x, 'hide', false) === false;
      })
      .forEach((item: any) => {
        const { fixed } = item;
        item.key = item.dataIndex;
        if (fixed === 'left') {
          leftList.push(item);
          leftCheckList.push(item.dataIndex);
          return;
        }
        if (fixed === 'right') {
          rightList.push(item);
          rightCheckList.push(item.dataIndex);
          return;
        }
        centerCheckList.push(item.dataIndex);
        centerList.push(item);
      });

    centerList = centerList.concat(
      $columnsAll[pageType]?.hideList
        .map((a: any) => {
          a.key = a.dataIndex;
          return { ...a, ...columns.filter((item: any) => item.dataIndex === a.dataIndex)[0] };
        })
        .filter((x: any) => {
          return _get(x, 'hide', false) === false;
        }),
    );
    setLeftCheckList(leftCheckList);
    setRightCheckList(rightCheckList);
    setCenterCheckList(centerCheckList);
    setRightData(rightList);
    setLeftData(leftList);
    setCenterData(centerList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  const onDrop = (info: any, type: string) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data: any[], key: string, callback: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].dataIndex === key) {
          return callback(data[i], i, data);
        }
      }
    };
    // @ts-ignore
    const data = type === 'left' ? [...leftData] : type === 'right' ? [...rightData] : [...centerData];
    let dragObj = {};
    loop(data, dragKey, (item: Object, index: number, arr: any[]) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    loop(data, dropKey, (item: object, index: number, data: any[]) => {
      if (dropPosition === -1) {
        data.splice(index, 0, dragObj);
      } else {
        data.splice(index + 1, 0, dragObj);
      }
    });
    // @ts-ignore
    type === 'left' ? setLeftData(data) : type === 'right' ? setRightData(data) : setCenterData(data);
  };

  return (
    <>
      {show ? (
        <Button onClick={() => setModalVisible(true)} className="ml20">
          列设置
        </Button>
      ) : (
        ''
      )}
      <Modal
        title="列设置"
        visible={modalVisible}
        closable
        destroyOnClose={true}
        width={'300px'}
        onCancel={() => setModalVisible(false)}
        bodyStyle={{ textAlign: 'center' }}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleOk('0')} loading={load}>
            保存
          </Button>,
          <Button key="link" type="primary" onClick={() => handleOk('1')} loading={loadReset}>
            重置
          </Button>,
        ]}
      >
        <Divider orientation="left" style={{ marginTop: 0 }}>
          固定在左侧
        </Divider>
        <Tree
          className="draggable-tree rowTree"
          onCheck={(checkedKeysValue: any) => setLeftCheckList(checkedKeysValue)}
          checkable
          checkedKeys={leftCheckList}
          draggable
          blockNode
          onDrop={(info) => onDrop(info, 'left')}
          treeData={leftData}
        />
        <Divider orientation="left">不固定</Divider>
        {centerData.length > 0 ? (
          <Tree
            className="draggable-tree rowTree"
            onCheck={(checkedKeysValue: any) => setCenterCheckList(checkedKeysValue)}
            checkable
            checkedKeys={centerCheckList}
            draggable
            blockNode
            onDrop={(info) => onDrop(info, 'center')}
            treeData={centerData}
          />
        ) : (
          <Empty />
        )}
        {rightData.length > 0 && (
          <>
            <Divider orientation="left">固定在右侧</Divider>
            <Tree
              className="draggable-tree rowTree"
              onCheck={(checkedKeysValue: any) => setRightCheckList(checkedKeysValue)}
              checkable
              checkedKeys={rightCheckList}
              draggable
              blockNode
              onDrop={(info) => onDrop(info, 'right')}
              treeData={rightData}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default RowSetting;
