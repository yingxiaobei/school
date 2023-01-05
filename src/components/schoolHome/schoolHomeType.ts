export type BannerVersion = {
  fieldNumber: string; // 栏位编号。普通栏位如001，多级栏位如002,001
  version?: string; // 位广告版本号。如V20210714.1018
};

export type AD = {
  adId: string; // 广告编号
  age: string; // 定位人群年龄
  backgroundColor: string; // 背景颜色
  carType: string; // 定位人群车型。逗号分隔，如C1,C2
  duration: number; // 素材时长（秒）。
  endTime: number; // 广告结束时间
  materialContent1: string; // 素材内容1
  materialContent2: string; // 素材类型2
  materialType1: string; // 素材类型1
  materialType2: string; // 素材类型2
  sex: string; // 定位人群性别。0男1女。多选用逗号分隔
  sort: number; // 轮播排序值
  startTime: string; // 广告开始时间
};

export type BannerBody = {
  adFieldList?: BannerVersion[]; // 栏位广告版本信息
  areaCode: string; // 区域编码。如330521
  deviceType: number; // 设备类型：0.计时平台、1.学员app
  schoolUniCode?: string; // 驾校统一编码
};

export type BannerData = {
  ads: AD[]; // 广告信息
  fieldNumber: string; // 栏位编号
  version: string; // 栏位广告版本号
};

export type StudentExamQuery = {
  cid: string; // 教练id
  sid: number; // 学员id
  testSubject: string; // 考试科目
  testResult: string; // 考试结果
  testCarModel: string; // 考试车型
  limit: number;
  page: number;
  startDate: string;
  endDate: string;
};

export type StudentExamData = {
  id: string;
  studentName: string;
  testDate: string;
  testEtc: string;
  testPlace: string;
  // todo: 数据结构较为庞大 只写目前页面需要的 其余用签名索引替换
  [key: string]: any;
};

export interface IGetInfoParams extends IPaginationParams {
  cname?: string;
  idCardNo?: string;
  licnum?: string;
  phone?: string;
  statisticType?: string; // 统计类型: 0.周、1.月、2.季度、3.年
  subjectCode?: string;
}

export type CoachingData = {
  id: string;
  statisticTimeSum: string;
  statisticMileSum: string;
  cname: string;

  [key: string]: any;
};

export type ExamPassRateQuery = {
  limit: number;
  page: number;
  period: 'year' | 'trimonth' | 'month' | 'week';
};

export type Subject = {
  examCount: number; // 参考人数
  failCount: number; // 不合格人数
  mulPassCount: number; // 补考通过人数
  onePassCount: number; // 首次通过人数
  onePassRate: number; // 首考合格率
  passRate: number; // 合格率
  subject: string; // 科目
};

export type Summary = {
  subjectItems: Subject[];
  title: string; // 教练员姓名
  totalPass: number; // 考出人数
};

export type ExamPassRateData = {
  startDate: string;
  endDate: string;
  rows: Summary[];
  total: number;
  summary: Summary; // 在首页的数据中不需要明确结构 any
};

export type EnrollmentData = {
  day: number;
  month: number;
  year: number;
};

export type Path =
  | 'exam/examResultManage'
  | 'exam/examPassRate'
  | 'coachTrainStatistic'
  | 'phasedReview'
  | 'studentInfo';

export const EXAM_RESULT_MANAGE = 'exam/examResultManage';
export const EXAM_PASS_RATE = 'exam/examPassRate';
export const COACH_TRAIN_STATIC = 'coachTrainStatistic';
export const PHASED_REVIEW = 'phasedReview';
export const STUDENT_INFO = 'studentInfo';

export type SelectedPartial<T, U extends keyof T> = Pick<Partial<T>, U> & Omit<T, U>;
