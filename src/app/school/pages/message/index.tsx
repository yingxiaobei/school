import React, { useEffect, useState, useRef, useContext } from 'react';
import { Tabs, Checkbox, Button, List, Pagination, Popconfirm, message, notification } from 'antd';
import MessageDetail from 'components/MessageDetail';
import {
  _getMessageList,
  _messageRead,
  _deleteMessage,
  _getSchMsgList,
  _batchUpdateByKey,
  _batchDeleteByKey,
} from 'api';
import { useHistory } from 'react-router-dom';
import GlobalContext from 'globalContext';
import { useForceUpdate, useHash } from 'hooks';
import styles from './index.module.css';
import { AuthButton } from 'components';
const { TabPane } = Tabs;

// @ts-ignore
function itemRender(current, type, originalElement) {
  if (type === 'prev') {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <a>上一页</a>;
  }
  if (type === 'next') {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <a>下一页</a>;
  }
  return originalElement;
}
// type 0系统公告 1系统通知
function MessageList(props: { type: number }) {
  const { type } = props;
  const { $setMessageCount } = useContext(GlobalContext);
  const history = useHistory();
  const [dataList, setDataList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [current, setCurrent] = useState<number>(1);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const messageDetailRef: any = useRef();
  const [ignore, forceUpdate] = useForceUpdate();
  const [loading, setLoading] = useState(false);
  const onCheckAllChange = (e: any) => {
    const ids = dataList.map((item) => item.id);
    setCheckedList(e.target.checked ? ids : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };
  const onChange = (e: any, id: string) => {
    if (e.target.checked && !checkedList.includes(id)) {
      setCheckedList([...checkedList, id]);
    }
    if (!e.target.checked && checkedList.includes(id)) {
      setCheckedList(checkedList.filter((f) => f !== id));
    }
  };
  useEffect(() => {
    console.log(checkedList);
    const ids = dataList.map((item) => item.id);
    const checkIds = ids.filter((f) => checkedList.includes(f));
    setIndeterminate(!!checkIds.length && checkIds.length < ids.length);
    setCheckAll(!!checkIds.length && checkIds.length === ids.length);
  }, [checkedList, dataList]);
  const titleObj = useHash('sch_msg_name_type');
  const getList = async () => {
    let res;
    try {
      setLoading(true);
      if (type === 0) {
        res = await _getMessageList({ page: current, limit: pageSize, screen: 0 });
      } else {
        res = await _getSchMsgList({ page: current, limit: pageSize, isDeleted: 0 });
      }
    } finally {
      setLoading(false);
    }

    setDataList(res?.data?.rows || []);
    setTotal(res?.data?.total || 0);
  };
  useEffect(() => {
    setCheckedList([]);
    setIndeterminate(false);
    setCheckAll(false);
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, current, ignore]);
  return (
    <>
      <div>
        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
          全选
        </Checkbox>
        <Popconfirm
          title="确定要删除吗?"
          onConfirm={async () => {
            if (!checkedList.length) {
              return message.error(`请选择要删除的${type === 0 ? '系统公告' : '系统通知'}`);
            }
            type === 0 ? await _deleteMessage({ ids: checkedList }) : await _batchDeleteByKey({ idList: checkedList });
            // 当前页全删，并且当前页大于1
            if (checkedList.length === dataList.length && current > 1) {
              setCurrent(current - 1);
            } else {
              forceUpdate();
            }
            // 同步关闭右下角notification
            for (const id of checkedList) {
              notification.close(id);
            }
          }}
          // onCancel={cancel}
          okText="确定"
          cancelText="取消"
        >
          <AuthButton type="primary" className="mr20" authId="messageList:btn1">
            删除
          </AuthButton>
        </Popconfirm>
        <Popconfirm
          title="确定全部标为已读吗?"
          onConfirm={async () => {
            const notReadList = dataList
              .filter((f) => checkedList.includes(f.id) && f.status === '0')
              .map((item) => item.id);
            if (!notReadList.length) {
              return message.error(`请选择未读的${type === 0 ? '系统公告' : '系统通知'}`);
            }
            type === 0
              ? await _messageRead({ status: 1, idVo: notReadList })
              : await _batchUpdateByKey({ idList: notReadList });
            $setMessageCount();
            forceUpdate();
            // 同步关闭右下角notification
            for (const id of checkedList) {
              notification.close(id);
            }
          }}
          // onCancel={cancel}
          okText="确定"
          cancelText="取消"
        >
          <AuthButton type="primary" authId="messageList:btn2">
            全部标为已读
          </AuthButton>
        </Popconfirm>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={dataList}
        loading={loading}
        style={{ margin: '16px 0' }}
        renderItem={(item: any) => (
          <List.Item
            extra={item.sendTime}
            style={{ cursor: 'pointer' }}
            onClick={async () => {
              if (item.status === '0') {
                type === 0
                  ? await _messageRead({ status: 1, idVo: [item.id] })
                  : await _batchUpdateByKey({ idList: [item.id] });
                // 未读数量-1
                $setMessageCount();
                forceUpdate();
              }
              // 同步关闭右下角notification
              notification.close(item.id);
              // 6跳 教练员、7/8跳 教练车 1-5是 学师的 消息 类型
              if (item.msgType === '6') {
                history.push('/school/coachInfo');
              }
              if (['7', '8'].includes(item.msgType)) {
                history.push('/school/carInfo');
              }
              if (item.msgType < 6) {
                //  1-5弹框
                messageDetailRef.current?.setDetail({ ...item, title: item.title || titleObj[item.msgType] });
              }
            }}
          >
            <List.Item.Meta
              className={item.status === '0' ? styles.notRead : styles.hasRead}
              avatar={
                <Checkbox
                  style={{ marginRight: 30 }}
                  checked={checkedList.includes(item.id)}
                  onChange={(e) => onChange(e, item.id)}
                  onClick={(e) => e.stopPropagation()}
                ></Checkbox>
              }
              title={item.title || titleObj[item.msgType]}
              description={item.subTitle}
            />
          </List.Item>
        )}
      />
      <Pagination
        style={{ display: 'flex', margin: '16px 0' }}
        pageSize={pageSize}
        current={current}
        total={total}
        showSizeChanger
        showQuickJumper
        itemRender={itemRender}
        showTotal={(total: number) => `共${total}条记录`}
        onChange={(page, pageSize) => {
          setCurrent(page);
        }}
        onShowSizeChange={(current, size) => {
          setPageSize(size);
          setCurrent(1);
        }}
      />
      <MessageDetail ref={messageDetailRef} />
    </>
  );
}

function Index() {
  const history = useHistory();
  return (
    <Tabs defaultActiveKey={history.location.state ? '' + history.location.state : '0'}>
      {['系统公告', '系统通知'].map((item, index) => (
        <TabPane tab={item} key={index}>
          <MessageList type={index} />
        </TabPane>
      ))}
    </Tabs>
  );
}

export default Index;
