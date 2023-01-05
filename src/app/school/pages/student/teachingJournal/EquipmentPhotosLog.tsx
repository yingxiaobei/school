import * as React from 'react';
import { CustomTable, Title } from 'components';
import { useHash, useTablePro } from 'hooks';
import { ColumnsType } from 'antd/lib/table';
import { _getSelectDevicePhotoLog, EquipmentPhotoLog } from './_api';
import {
  FONT_COLOR_BLACK,
  FONT_COLOR_GRAY,
  FONT_COLOR_GREEN,
  FONT_COLOR_ORANGE,
  FONT_COLOR_RED,
} from 'constants/styleVariables';
import CopyWords from 'components/CopyWords';

interface EquipmentPhotosLogProps {
  titleStyle?: React.CSSProperties;
  classid: string;
}

const sendStatusToColorMap = new Map([
  ['0', FONT_COLOR_BLACK], // 待发送（黑色）
  ['1', FONT_COLOR_ORANGE], // 发送中（橙色）
  ['2', FONT_COLOR_RED], // 发送失败（红色）
  ['3', FONT_COLOR_GREEN], // 发送成功（绿色）
]);

const pullStatusToColorMap = new Map([
  ['0', FONT_COLOR_BLACK], // 待确认（黑色）
  ['1', FONT_COLOR_GRAY], // 无需获取（灰色）
  ['2', FONT_COLOR_BLACK], // 带获取（黑色）
  ['3', FONT_COLOR_ORANGE], // 获取中（橙色）
  ['4', FONT_COLOR_RED], // 获取失败（红色）
  ['5', FONT_COLOR_GREEN], // 获取成功（绿色）
]);

function statusToColor<T>(status: T, colorMap: Map<T, string>) {
  return colorMap.get(status);
}

function renderColor<T>({ text, status, colorMap }: { text: string; status: T; colorMap: Map<T, string> }) {
  return <div style={{ color: statusToColor<T>(status, colorMap) }}>{text}</div>;
}

export default function EquipmentPhotosLog({ titleStyle = {}, classid }: EquipmentPhotosLogProps) {
  const { tableProps } = useTablePro({
    request: _getSelectDevicePhotoLog,
    extraParams: {
      classid,
    },
  });

  const logCommandHash = useHash('select_device_photo_command_type'); // 获取设备照片日志命令类型
  const pullStatusHash = useHash('select_device_photo_pull_status'); // 获取设备照片日志获取状态
  const sendStatusHash = useHash('pre_send_message_send_status'); // 获取设备照片日志发送状态

  const columns: ColumnsType<EquipmentPhotoLog> = [
    {
      title: '车牌号',
      dataIndex: 'licnum',
      width: 100,
    },
    {
      title: '消息命令',
      dataIndex: 'commandType',
      render: (commandType: string) => logCommandHash[commandType],
      width: 100,
    },
    {
      title: '发送内容',
      dataIndex: 'requestcontent',
      width: 300,
      render: (requestContent: string) => CopyWords({ content: requestContent, width: 280 }),
    },
    {
      title: '发送时间',
      dataIndex: 'sendTime',
      width: 160,
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      render: (sendStatus: number) =>
        renderColor({
          text: sendStatusHash[sendStatus],
          status: sendStatus + '',
          colorMap: sendStatusToColorMap,
        }),
      width: 100,
    },
    {
      title: '返回消息内容',
      dataIndex: 'responsecontent',
      width: 340,
      render: (responseContent: string) =>
        CopyWords({
          content: responseContent,
          width: 320,
        }),
    },
    {
      title: '获取状态',
      dataIndex: 'pullStatus',
      render: (pullStatus: number) =>
        renderColor({
          text: pullStatusHash[pullStatus],
          status: pullStatus + '',
          colorMap: pullStatusToColorMap,
        }),
      width: 100,
    },
  ];

  return (
    <>
      <Title style={{ ...titleStyle }}>获取设备照片交互日志</Title>
      <CustomTable {...tableProps} columns={columns} rowKey={'id'} />
    </>
  );
}
