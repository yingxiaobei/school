import { Tooltip, message, Button } from 'antd';
import copy from 'copy-text-to-clipboard';

interface CopyProps {
  content: string;
  width: number;
}

export default function CopyWords({ content, width }: CopyProps) {
  return (
    <Tooltip
      placement="topLeft"
      title={() => {
        return (
          <>
            <div style={{ textAlign: 'right' }} className="mb10 mt10">
              <Button
                type="primary"
                onClick={() => {
                  message.success('复制成功');
                  copy(content);
                }}
              >
                复制
              </Button>
            </div>
            {content}
          </>
        );
      }}
    >
      <div
        style={{
          width,
          textOverflow: '-o-ellipsis-lastline',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {content}
      </div>
    </Tooltip>
  );
}
