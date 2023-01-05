import { memo } from 'react';

interface Props {
  text: string;
  account: string;
}

function AccountItem({ text, account }: Props) {
  const toFix2 = (amount: number | string) => {
    return amount < 0 ? '0.00' : Number(amount).toFixed(2);
  };

  return (
    <>
      <span>{text}</span>
      <span>{toFix2(account)}元</span>
    </>
  );
}

export default memo(AccountItem);
