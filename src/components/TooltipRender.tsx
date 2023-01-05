import React from 'react';
import { Tooltip } from 'antd';
interface ToolTipProps {
  content: string;
}

export default function TooltipRender({ content }: ToolTipProps) {
  return (
    <Tooltip placement={'topLeft'} title={content}>
      {content}
    </Tooltip>
  );
}
