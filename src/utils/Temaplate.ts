import { Template } from 'app/school/pages/trainingInstitution/contractTemplate/_api';
import { _get } from 'utils';
import { message } from 'antd';

export default class TemplateText {
  public static ModalWidth = 964;
  private static handleText(execution: 'after' | 'before', text: string) {
    if (execution === 'before') {
      return text.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
    } else {
      return text.replace(/\n/g, '\r\n');
    }
  }

  public static renderTextBefore(text: string) {
    return TemplateText.handleText('before', text);
  }

  public static submitTextAfter(text: string) {
    return TemplateText.handleText('before', text);
  }

  public static sortByItemType<T extends { schContractTempitemList: Template[] }>(data: T) {
    const initialArr: Template[] = _get(data, 'schContractTempitemList', [] as Template[]);
    const textAreaArr = initialArr.filter((template) => template.itemtype === '4');
    const excludeTextAreaArr = initialArr.filter((template) => template.itemtype !== '4');
    return [...excludeTextAreaArr, ...textAreaArr];
  }

  public static checkContract(schContractTempitemList: Template[], callback?: () => void) {
    const labelArr: string[] = [];
    const numberLabelArr: string[] = [];
    const textLabelArr: string[] = [];
    const textAreaLabelArr: string[] = [];
    schContractTempitemList.forEach((item) => {
      if (!item.itemvalue) {
        labelArr.push(item.itemname);
      }
      if (item.itemtype === '0') {
        const val: any = Number(item.itemvalue);
        if (Number.isNaN(val) || val > 100000 || val < 0 || !/^(\d+(\.\d{1,2})?|(0(\.(0[1-9]|[1-9]\d?))))$/.test(val))
          numberLabelArr.push(item.itemname);
      } else if (item.itemtype === '2') {
        if (item.itemvalue.length > 150) {
          textLabelArr.push(item.itemname);
        }
      } else if (item.itemtype === '4') {
        if (item.itemvalue.length > 2000) {
          textAreaLabelArr.push(item.itemname);
        }
      }
    });
    if (labelArr.length > 0) {
      let str = labelArr.join(',');
      message.error(str + '不能为空');
      return false;
    }
    if (numberLabelArr.length > 0) {
      let str = numberLabelArr.join(',');
      message.error(str + '需为大于等于0小于等于100000的数字,最多2位小数点');
      return false;
    }
    if (textLabelArr.length > 0) {
      let str = textLabelArr.join(',');
      message.error(str + '最长不超过150个字符');
      return false;
    }
    if (textAreaLabelArr.length > 0) {
      let str = textAreaLabelArr.join(',');
      message.error(str + '最长不超过2000个字符');
      return false;
    }
    callback && callback();
    return true;
  }
}
