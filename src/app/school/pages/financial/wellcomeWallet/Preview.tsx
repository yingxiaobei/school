import { useEffect } from 'react';
import { DangerouslySetHtmlContent } from 'components';

export default function Preview(props: any) {
  const { richtextContent } = props;
  const foo =
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body><form id = "form" action="https://cloudpayweb-fat7.orangebank.com.cn/api/trade/cashier" method="post"><input type="hidden" name="TranAmt" id="TranAmt" value="5100"/><input type="hidden" name="TraderNo" id="TraderNo" value="510742925487907956"/><input type="hidden" name="OrderName" id="OrderName" value="支付"/><input type="hidden" name="OrderRemark" id="OrderRemark" value="[{\'SFJOrdertype\':\'1\',\'remarktype\':\'JHS0100000\',\'plantCode\':\'5408\',\'oderlist\':[{\'SubAccNo\':\'5408000000061836\',\'PayModel\':\'1\',\'TranFee\':\'50.00\',\'subamount\':\'51.00\',\'suborderId\':\'3573666536436793480\'}]}]"/><input type="hidden" name="ClientType" id="ClientType" value="pc"/><input type="hidden" name="ClientNo" id="ClientNo" value="210416115036"/><input type="hidden" name="CallBackNoticeUrl" id="CallBackNoticeUrl" value="http://60.191.54.28:1444/openapi-test/orderpay-service/n/pa_bank/3379900755808747657/recharge"/><input type="hidden" name="Signature" id="Signature" value="q5ISE1d3LabGOK9yu/KxXpJB8LgV1zaf5p9nrcadnH37SdDMC4RMXgBiRc2QhpNz93AV1lhnBP3h8dMwryftLLnGpJzeGG1qDFOg3BPgTRLj1Wcy2+DAvCP/9Igl0m6RwtqzeMtgE+YYTHMGwP2saCKL2La1bISwqcYRJns/bVhMPCOWJ8uwoW8TB5Q4LGBeNXOaorExNj/YGmPzQDQvtBg5tZveqYSzOrgUhsT7s7YabqrAc6KaoZUkJfOK2mqnf7B3dPhACv4cPAZtx7F5Decrexxzgdc07yhJRyVMkOqLQolXfSlvcpO2dfT5lg/C9zXMkp4CU+1GKcffNnarQQ=="/><input type="hidden" name="OrderSendTime" id="OrderSendTime" value="20210517161922"/><input type="hidden" name="TraderOrderNo" id="TraderOrderNo" value="3573666536436793480"/><input type="hidden" name="FrontSkipUrl" id="FrontSkipUrl" value="http://192.168.191.99:20251/"/></form></body><script type="text/javascript">document.all.form.submit();</script></html>';

  // useEffect(() => {
  //   const o: any = document.getElementById('myIframe');
  //   var ed = document.all ? o.contentWindow.document : o.contentDocument;
  //   ed.open();
  //   ed.write(richtextContent);
  //   ed.close();
  //   ed.contentEditable = true;
  //   ed.designMode = 'on';
  // }, []);
  return <DangerouslySetHtmlContent html={richtextContent} />;
  // return <iframe width="800px" height="500px" id="myIframe"></iframe>;
}
