import { Button, ButtonProps, Tooltip } from 'antd';
import { useContext } from 'react';
import GlobalContext from 'globalContext';

interface IProps extends ButtonProps {
  authId: string;
  insertWhen?: boolean;
  isInline?: boolean;
  [key: string]: any;
  // 存在自定义提示文字，则使用自定义提示文字
  tooltip?: string;
}
/**
 * 如果 AuthButton 需要添加在MoreOperation组件中请加上isInline属性
 * @param {IProps} props
 * @returns
 */
function AuthButton(props: IProps) {
  const { authId, insertWhen = true, isInline = false, style: customStyle = {}, tooltip, ...restProps } = props;
  const defaultConfig = {};

  // Table 中的操作栏按钮的默认属性
  if (props.className && props.className.includes('operation-button')) {
    Object.assign(defaultConfig, { type: 'primary', ghost: true, size: 'small' });
  }

  const { $elementAuthTable, $elementTooltip } = useContext(GlobalContext);

  if (!insertWhen) return null;
  if (authId && !$elementAuthTable[authId.trim()]) return null;

  return (
    <Tooltip placement="top" title={tooltip || $elementTooltip[authId.trim()] || ''}>
      <Button
        {...defaultConfig}
        {...restProps}
        style={
          isInline
            ? {
                ...customStyle,
                width: '100%',
                textAlign: 'left',
              }
            : customStyle
        }
      >
        {props.children}
      </Button>
    </Tooltip>
  );
}

export default AuthButton;
