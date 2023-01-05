import React, { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Popover, Tabs, List, Card, Button, notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import styles from './Message.module.css';
import { _getMessageList, _messageRead, _getSchMsgList, _batchUpdateByKey, _getCode } from 'api';
import { Auth } from 'utils';
import { useFetch, useVisible } from 'hooks';
import MessageDetail from 'components/MessageDetail';
import { useHistory } from 'react-router-dom';
import { useEventListener } from 'ahooks';
import GlobalContext from 'globalContext';

const { TabPane } = Tabs;
type ListItem = {
  id: string;
  msgType: string;
  sendTime: string;
  status: string;
  subTitle: string;
  title: string;
};
function MessageContent(props: {
  messageDetailRef: any;
  _switchVisible: () => void;
  titleObj: { [key: string]: string };
  messageNums: number[];
}) {
  const history = useHistory();
  const { $setMessageCount } = useContext(GlobalContext);
  // 系统公告
  const { data: list, isLoading } = useFetch({
    request: _getMessageList,
    query: { page: 1, limit: 10, screen: 0 },
    depends: [],
  });
  // 系统通知
  const { data: list2, isLoading: isLoading2 } = useFetch({
    request: _getSchMsgList,
    query: { page: 1, limit: 10, isDeleted: 0 },
    depends: [],
  });
  return (
    <Tabs defaultActiveKey="1" centered onClick={(e) => e.stopPropagation()}>
      {['系统公告', '系统通知'].map((a, i) => (
        <TabPane tab={`${a}（${props.messageNums[i]}）`} key={a}>
          <List
            itemLayout="horizontal"
            dataSource={i === 0 ? list?.rows || [] : list2?.rows || []}
            split={false}
            locale={{ emptyText: '暂无新消息' }}
            className={styles.list}
            loading={i === 0 ? isLoading : isLoading2}
            renderItem={(item: ListItem) => (
              <List.Item
                style={{ padding: '6px 0' }}
                onClick={async () => {
                  props._switchVisible();
                  if (item.status === '0') {
                    i === 0
                      ? await _messageRead({ status: 1, idVo: [item.id] })
                      : await _batchUpdateByKey({ idList: [item.id] });
                    // 未读数量-1
                    $setMessageCount();
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
                  if (Number(item.msgType) < 6) {
                    //  1-5弹框
                    props.messageDetailRef?.current.setDetail({
                      ...item,
                      title: item.title || props.titleObj[item.msgType],
                    });
                  }
                }}
              >
                <Card
                  style={{ width: '100%' }}
                  bodyStyle={{
                    padding: '10px 20px 0 30px',
                    boxShadow: '0px 4px 12px rgb(0 0 0 / 15%)',
                    margin: '0 10px',
                    cursor: 'pointer',
                  }}
                  bordered={false}
                >
                  <h2
                    className={item.status === '1' ? '' : styles.title}
                    style={{ fontSize: 16, color: item.status === '1' ? '#999999' : 'rgba(0,0,0,.8)', fontWeight: 700 }}
                  >
                    {item.title || props.titleObj[item.msgType]}
                  </h2>
                  <p style={{ fontSize: 12, color: '#999999' }}>{item.subTitle}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#999999' }}>{item.sendTime}</p>
                </Card>
              </List.Item>
            )}
          />
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <Button
              onClick={() => {
                props._switchVisible();
                history.push('/school/messageList', '' + i);
              }}
            >
              查看全部
            </Button>
          </div>
        </TabPane>
      ))}
    </Tabs>
  );
}
function Message() {
  const { $messageCount, $setMessageCount, $setMsgCount } = useContext(GlobalContext);
  const messageDetailRef: any = useRef();
  const history = useHistory();
  const [visible, _switchVisible] = useVisible();
  const [titleObj, setTitleObj] = useState({});
  const [messageNums, setMessageNums] = useState<number[]>([0, 0]);
  const [lastMessageIds, setLastMessageIds] = useState<string[]>([]);
  const lastMessageRef: any = useRef();
  const titleRef: any = useRef();
  // 必须提前拿到title，确保消息有title
  // const titleObj = useHash('sch_msg_name_type');
  const getMessageListFn = async () => {
    let titleHash = { ...titleRef.current };
    if (JSON.stringify(titleHash) === '{}') {
      const titleRes = await _getCode({ codeType: 'sch_msg_name_type', parentCodeKey: '-1' });
      titleHash = (titleRes?.data || []).reduce((p: any, c: any) => {
        p[c.value] = c.text;
        return p;
      }, {});
      setTitleObj(titleHash);
    }
    // 【X】后，本次登陆不再显示，下次登录时若消息状态仍为未读，则仍需要显示
    const closeMessageList = JSON.parse(Auth.get('closeMessageList') || '[]');
    //系统公告
    const res = await _getMessageList({ page: 1, limit: 9999, screen: 1 });
    // 系统通知
    const res2 = await _getSchMsgList({ page: 1, limit: 9999, isDeleted: 0, status: 0 });
    // 1、系统公告>系统通知 2、时间正序   数组最后一个在页面最底部
    const list = [
      ...(res2?.data?.rows || [])
        .map((item: any) => ({ ...item, flag: true, title: titleHash[item.msgType] }))
        .reverse(),
      ...(res?.data?.rows || []),
    ];
    const curMessageIds = list.map((item) => item.id);
    // 关闭撤销消息
    const removeMessageIds = lastMessageRef.current.reduce((p: string[], c: string) => {
      if (!curMessageIds.includes(c)) {
        p.push(c);
      }
      return p;
    }, []);
    for (const removeId of removeMessageIds) {
      notification.close(removeId);
    }
    setLastMessageIds(curMessageIds);

    const messageList = list.filter((f) => !closeMessageList.includes(f.id));
    $setMsgCount((res?.data?.msgRead || 0) + (res2?.data?.total || 0));
    setMessageNums([res?.data?.msgRead || 0, res2?.data?.total || 0]);
    for (const val of messageList) {
      // 是否是系统公告
      const isSys = !val.flag;
      const notifi = isSys ? notification.warn : notification.open;
      notifi({
        message: val.title,
        className: styles.myNotification,
        duration: null,
        key: val.id, // 通知id用于关闭
        description: (
          <>
            <p style={{ fontSize: 12, color: '#999999', paddingRight: 20 }}>{val.subTitle}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#999999', paddingRight: 20 }}>{val.sendTime}</p>
          </>
        ),
        placement: 'bottomRight',
        onClick: async () => {
          notification.close(val.id);
          isSys ? await _messageRead({ status: 1, idVo: [val.id] }) : await _batchUpdateByKey({ idList: [val.id] });
          // 顶部消息数量-1
          $setMessageCount();
          // 6跳 教练员、7/8跳 教练车 1-5是 学师的 消息 类型
          if (val.msgType === '6') {
            history.push('/school/coachInfo');
          }
          if (['7', '8'].includes(val.msgType)) {
            history.push('/school/carInfo');
          }
          if (val.msgType < 6) {
            //  1-5弹框
            messageDetailRef.current?.setDetail(val);
          }
        },
        onClose: () => {
          // ①系统通知，【查看】或【X】后，永远不会再在该区域显示
          // ②系统公告，【查看】后，永远不会再在该区域显示；【X】后，本次登陆不再显示，下次登录时若消息状态仍为未读，则仍需要显示
          if (isSys) {
            const closeMessageList = JSON.parse(Auth.get('closeMessageList') || '[]');
            closeMessageList.push(val.id);
            Auth.set('closeMessageList', JSON.stringify(closeMessageList));
          } else {
            _batchUpdateByKey({ idList: [val.id] });
          }
        },
      });
    }
  };
  useEffect(() => {
    getMessageListFn();
    const timer = setInterval(() => {
      getMessageListFn();
    }, 300000);
    return () => {
      timer && clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    lastMessageRef.current = lastMessageIds;
  }, [lastMessageIds]);
  useEffect(() => {
    titleRef.current = titleObj;
  }, [titleObj]);
  useEventListener(
    'click',
    () => {
      visible && _switchVisible();
    },
    { target: document.body },
  );
  return (
    <>
      <Popover
        visible={visible}
        placement="bottomRight"
        destroyTooltipOnHide
        content={
          <MessageContent
            messageDetailRef={messageDetailRef}
            _switchVisible={_switchVisible}
            titleObj={titleObj}
            messageNums={messageNums}
          />
        }
        trigger="click"
        arrowPointAtCenter
        overlayClassName={styles.myOverlay}
      >
        <span
          style={{ marginRight: 40, cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            _switchVisible();
          }}
        >
          <Badge count={$messageCount} size={'small'}>
            <BellOutlined style={{ fontSize: 22 }} />
          </Badge>
        </span>
      </Popover>
      <MessageDetail ref={messageDetailRef} />
    </>
  );
}

export default Message;
