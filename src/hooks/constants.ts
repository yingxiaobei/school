export type TCategory =
  // ---------------------twk-----------------------
  | 'saleable'
  | string
  | 'registered_flag'
  | 'card_status_type'
  | 'business_scope'
  | 'order_mode'
  | 'subjectcode2'
  | 'order_status'
  // ---------------------twk-----------------------

  // ---------------------wy-----------------------
  | 'status'
  | 'checkflag'
  | 'pass_notpass_type'
  | 'human_type'
  | 'signType'
  | 'min_crstate_type'
  | 'review_type'
  | 'teach_type'
  | 'coach_type'
  | 'platecolor_type'
  | 'car_status_type'
  | 'simulator_record_status'
  | 'fence_type'
  | 'enableflag_type'
  | 'record_status_type'
  | 'company_busi_status'
  | 'company_level'
  | 'company_category'
  | 'company_img_type'
  | 'busi_type'
  | 'stu_contract_status'
  | 'registered_national_flag'
  | 'nationality_type'
  | 'checkstatus_sign'
  | 'traincode_type'
  | 'isapply_stu'
  | 'yes_no_type'
  | 'isapply_drop'
  | 'SchoolSubjectApply'
  | 'SubjectApplyStatus'
  | 'occupation_level_type'
  | 'sch_region_state_type'
  | 'region_registered_type'
  | 'techlevel_type'
  | 'combo'
  | 'photo_type'
  | 'bind_card_type'
  | 'settlementflag'
  | 'statistic_subject'
  | 'statistic_exam_result'
  | 'iscyzg_type'
  | 'businessType'
  | 'car_online_state'
  | 'traintime_apply_status_type'
  | 'exam_result_type'
  | 'trainning_time_type'
  | 'train_finish_flag'
  | 'stu_drivetrain_status_old'
  | 'portal_article_type'
  | 'article_publish_type'
  | 'portal_subject_type'
  | 'audit_status_type'
  | 'is_effective_type'
  | 'obd_flag_type'
  | 'obd_status'
  | 'obd_audit_status'
  | 'video_upload_status'
  | 'video_alarm_type'
  | 'car_csys_type'
  | 'region_jlcdly_type'
  | 'region_cdlx_type'
  | 'shop_category_type'
  | 'region_lhwlhj_type'
  | 'jg_service_name_type'
  | 'classrecord_appeal_status'
  | 'stu_bankaccountflag_type'
  // ---------------------wy-----------------------
  | 'trans_car_type'
  | 'gender_type'
  | 'coa_master_status'
  | 'registered_flag_type'
  | 'card_type'
  | 'subject'
  | 'isapply'
  | 'trans_part_type'
  | 'subject_type'
  | 'crstate_type'
  | 'checkstatus_jx_type'
  | 'checkstatus_jg_type'
  | 'stu_drivetrain_status'
  | 'source_type'
  | 'settlement_type'
  | 'settlement_status'
  | 'business_type'
  | 'order_type'
  | 'pay_type'
  | 'pay_status'
  | 'student_contract_check_type'
  | 'transaction_status'
  | 'input_type'
  | 'edit_option'
  | 'trans_type'
  | 'trade_status_type'
  | 'transaction_type'
  | 'ic_card_physics_status_type'
  | 'withdraw_status_type'
  | 'company_init_status'
  | 'common_status_type'
  | 'train_part'
  | 'overall_type'
  | 'appraisalresult_type'
  | 'stu_record_status_type'
  | 'trade_list_page_trade_status'
  | 'report_status_type'
  | 'studentFieldLabelMapping'
  | 'student_send_status'
  | 'place_type'
  | 'pos_type'
  | 'order_appoint_status'
  | 'pay_mode_type'
  | 'subject_code_class_type'
  | 'train_study_type'
  | 'charge_mode_type'
  | 'binding_card_cert_type'
  | 'ic_apply_status'
  | 'student_type'
  | 'stucardnocrc'
  | 'timing_firm'
  | 'evaluation_quality_type'
  | 'pay_way_type'
  | 'pay_status_type'
  | 'sub_account_name_type'
  | 'review_status_type'
  | 'classrecord_review_type'
  | 'acc_confirm_status_type'
  | 'exception_code_type'
  | 'item_type'
  | 'show_type'
  | 'page_site'
  | 'organ_credentials_type'
  | 'certificates_type'
  // ---------------------gjf-----------------------
  | 'applymemo_code_type'
  | 'stu_fund_confirm_status_type'
  | 'stu_exam_is_qualified_type'
  | 'robot_exam_mark_item_type'
  | 'robot_exam_mark_type'
  | 'push_graduation_third_type'
  | 'split_ratio_status_type'
  | 'car_rl_type'
  | 'car_bzbsx_type'
  | 'coa_whcd_type'
  | 'coa_zjlx_type'
  | 'bill_end_status_type'
  | 'person_manage_type'
  | 'stu_education_type'
  | 'stu_nationalReconciliation_type'
  | 'stu_healthState_type'
  | 'stu_drivliceperiod_type'
  // | 'hn_coach_type'
  | 'stu_drivliceperiod_type'
  | 'sch_msg_name_type'
  | 'gd_card_type'
  | 'stu_theory_check_status'
  | 'sub_account_type'
  | 'stu_apply_type'
  | 'stu_apply_status'
  | 'simulator_bind_status'
  | 'simulator_type'
  | 'robot_test_item_type'
  | 'log_service_name_type'
  | 'ratio_is_share'
  | 'pushga_status'
  | 'select_device_photo_command_type'
  | 'pre_send_message_send_status'
  | 'select_device_photo_pull_status'
  | 'theory_course_type'
  | 'withdraw_app_status'
  | 'order_retail_pay_status'
  | 'withdraw_apply_status'
  | 'school_withdraw_status'
  | 'classrecord_appeal_status_jx'
  | 'alarm_type';

export const HASH = {
  // ---------------------twk-----------------------
  saleable: [
    { label: '未发布', value: '0' },
    { label: '直接发布排班', value: '1' },
  ],
  order_status: [
    { label: '待支付', value: '0' },
    { label: '提交', value: '1' },
    { label: '已预约', value: '2' },
    { label: '上车', value: '4' },
    { label: '待评价', value: '5' },
    { label: '已评价', value: '6' },
    { label: '取消中', value: '7' },
    { label: '已取消', value: '8' },
    { label: '已删除', value: '9' },
    { label: '已退款', value: '10' },
  ], // 预约状态
  order_mode: [
    { label: '学员自主预约', value: '1' },
    { label: '驾校约课', value: '2' },
    { label: '直接安排', value: '3' },
  ],
  subjectcode2: [
    { label: '科目一', value: '1' },
    { label: '科目二', value: '2' },
    { label: '科目三', value: '3' },
    { label: '科目四', value: '4' },
  ],
  registered_flag: [
    { label: '未备案', value: '0' },
    { label: '已备案', value: '1' },
  ], // 备案状态
  card_status_type: [
    { label: '已制卡', value: '1' },
    { label: '未制卡', value: '0' },
  ], // 卡状态
  business_scope: [], // 经营范围
  // ---------------------twk-----------------------

  // ---------------------wy-----------------------
  status: [
    { label: '待审核', value: '0' },
    { label: '有效', value: '1' },
    { label: '无效', value: '2' },
    { label: '作废', value: '3' },
  ], // 审核状态-学员人脸模板审核
  checkflag: [
    { label: '待审核', value: '0' },
    { label: '审核通过', value: '1' },
    { label: '审核未通过', value: '2' },
    { label: '审核异常', value: '3' },
    { label: '不启用', value: '4' },
  ], // 自动审核-人工审核-学员人脸模板审核
  pass_notpass_type: [
    { label: '通过', value: '1' },
    { label: '不通过', value: '2' },
  ], // 自动审核-人工审核-学员人脸模板审核
  human_type: [], // 人员类别 0:全部，1:学员，2:教练
  signType: [{ label: '签到', value: '1' }], // 签到状态1：签到
  review_type: [
    { label: '未审核', value: '-1' },
    { label: '驾校审核', value: '1' },
    { label: '系统自动审核', value: '2' },
    { label: '人防审核', value: '3' },
    { label: '监管审核', value: '4' },
  ], // 审核类型-1:未审核 1:驾校审核 2:系统自动审核 3:人防审核 4:监管审核 --电子教学日志分钟学时
  teach_type: [
    { label: '场地', value: '1' },
    { label: '道路', value: '2' },
  ], // 教学区域类型 1：场地 2：道路
  coach_type: [
    { label: '理论', value: '0' },
    { label: '实操', value: '1' },
    { label: '理论和实操', value: '2' },
    { label: '空', value: '3' },
  ], // 教学区域类型 1：第二部分(场地) 2：第三部分(道路)
  platecolor_type: [
    { label: '蓝色', value: '1' },
    { label: '黄色', value: '2' },
    { label: '黑色', value: '3' },
    { label: '白色', value: '4' },
    { label: '绿色', value: '5' },
    { label: '其他', value: '9' },
  ], // 车牌颜色(1:蓝色, 2:黄色, 3:黑色, 4:白色, 5:绿色, 9:其他)
  car_status_type: [
    { label: '启用', value: '1' },
    { label: '停用', value: '2' },
    { label: '注销', value: '3' },
    { label: '转校', value: '4' },
    { label: '未审核', value: '5' },
    { label: '上锁', value: '9' },
  ], // 车辆状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
  fence_type: [
    { label: '全部', value: '0' },
    { label: '通用', value: '1' },
    { label: '特定', value: '2' },
  ], //采用围栏类型 0：全部 1：通用 2：车辆特定
  enableflag_type: [
    { label: '无效', value: '0' },
    { label: '有效', value: '1' },
    { label: '禁用标志', value: '2' },
  ], //围栏状态   // 状态0：无效、1：有效、2：禁用标志
  record_status_type: [], // 备案状态（培训机构信息）
  company_busi_status: [], // 营业状态（培训机构信息）
  company_level: [
    { label: '一级', value: '1' },
    { label: '二级', value: '2' },
    { label: '三级', value: '3' },
  ], // 驾校等级（培训机构信息）
  company_category: [], // 驾校类别 （培训机构信息）
  company_img_type: [
    { label: '法人签字', value: '1' },
    { label: '培训实景', value: '10' },
    { label: '校园风貌', value: '11' },
    { label: '培训单专用章', value: '12' },
    { label: '结业证专用章', value: '13' },
    { label: '合同专用章', value: '14' },
    { label: '工商营业执照（正本）', value: '2' },
    { label: '工商营业执照（副本）', value: '3' },
    { label: '道路运输经营许可证（正本）', value: '4' },
    { label: '道路运输经营许可证（副本）', value: '5' },
    { label: '电子印章', value: '6' },
    { label: '培训机构头像', value: '7' },
    { label: '场地', value: '8' },
    { label: '教具设施', value: '9' },
  ], //  图片（培训机构信息）
  occupation_level_type: [], // 职业资格等级(教练管理/教练信息管理)

  busi_type: [
    { label: '初领', value: '0' },
    { label: '增领', value: '1' },
    { label: '其他', value: '9' },
  ], // 业务类型 0:初领 1:增领 9:其他(学员信息)
  stu_contract_status: [
    { label: '未生成', value: '0' },
    { label: '未签订', value: '1' },
    { label: '已签订', value: '2' },
    { label: '已上传', value: '3' },
  ], // 合同签订标志 0 未签订  1已签订 2:已签订 3:已上传(学员信息)
  registered_national_flag: [
    { label: '未获取', value: '0' },
    { label: '已获取', value: '1' },
  ], // 全国平台获取统一编码标志(0:未获取 1:已获取)(学员信息)
  nationality_type: [], // 国籍(学员信息)
  checkstatus_sign: [
    { label: '待处理', value: '0' },
    { label: '审核不通过', value: '1' },
    { label: '审核通过', value: '2' },
  ],
  traincode_type: [
    { label: '模拟', value: '3' },
    { label: '理论', value: '2' },
  ], // 可培训类型 （营业网点-教室）
  isapply_stu: [
    { label: '已上传', value: '1' },
    { label: '未上传', value: '0' },
  ], // 上传状态 0：未上传； 1：已上传；(学员结业管理)
  yes_no_type: [
    { label: '是', value: '1' },
    { label: '否', value: '0' },
  ], // 模拟带教：0：否1：是
  isapply_drop: [
    { label: '申请', value: 0 },
    { label: '同意', value: 2 },
    { label: '拒绝', value: 3 },
    { label: '撤销', value: 4 },
  ], // 学员退学=》审核状态 0: 待提交（申请准备）   1：已提交（提交上报）  2：通过（同意）  3： 不通过（拒绝）  4：撤销
  SchoolSubjectApply: [], // 驾校报审科目列表 （阶段报审）
  SubjectApplyStatus: [], // 驾校阶段核实状态 （阶段报审）
  examType: [],
  sch_region_state_type: [], //教学区域（教学区域状态）
  region_registered_type: [], //教学区域（备案状态）
  techlevel_type: [], // 车辆信息管理
  combo: [], // 课程类型
  photo_type: [], // 照片类型
  settlementflag: [], //结算状态
  statistic_subject: [], // 考试科目
  statistic_exam_result: [], //考试结果
  iscyzg_type: [], // 从业资格学时
  businessType: [], // 业务类型（学员）
  car_online_state: [], // 状态数据
  traintime_apply_status_type: [], // 申报状态
  exam_result_type: [], // 考核结果
  trainning_time_type: [], // 培训时段
  train_finish_flag: [], // 培训情况
  stu_drivetrain_status_old: [], // 学员状态
  portal_article_type: [], // 资讯类型
  article_publish_type: [], // 发布类型
  portal_subject_type: [], // 栏目类型
  audit_status_type: [], // 开班审核状态
  is_effective_type: [], // 是否有效
  obd_flag_type: [], //  是否有obd
  obd_status: [], // obd状态
  obd_audit_status: [], // obd审核（插拔）状态
  video_upload_status: [], // 视频状态
  video_alarm_type: [], // 视频类型
  car_csys_type: [], // 车身颜色
  car_bzbsx_type: [], // car_bzbsx_type
  car_rl_type: [], // car_dljsjxcl_type
  region_jlcdly_type: [], //教练场地来源
  region_cdlx_type: [], // 场地类型
  region_lhwlhj_type: [], //良好网络环境
  jg_service_name_type: [], // 服务名称
  classrecord_appeal_status: [], // 申诉状态
  stu_bankaccountflag_type: [], // 开户状态
  // ---------------------wy-----------------------
  trans_car_type: [], // 车辆类型
  card_type: [
    { label: '居民身份证', value: '1' },
    { label: '护照', value: '2' },
    { label: '军官证', value: '3' },
    { label: '其他', value: '4' },
  ], // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  gender_type: [
    { label: '未知', value: '0' },
    { label: '男性', value: '1' },
    { label: '女性', value: '2' },
  ], // 性别 1:男性;2:女性  0:未知
  coa_master_status: [
    { label: '注册', value: '00' },
    { label: '在教', value: '01' },
    { label: '停教', value: '02' },
    { label: '离职', value: '04' },
    { label: '注销', value: '05' },
  ], // 供职状态 (00-注册 01-在教 02-停教  04-离职 05-注销 )
  registered_flag_type: [
    { label: '未备案', value: '0' },
    { label: '备案审核中', value: '1' },
    { label: '备案同意启用', value: '2' },
    { label: '备案不同意启用', value: '3' },
    { label: '编辑后待重新备案', value: '4' },
  ], // 备案标记-  0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案
  subject: [
    { label: '科目一', value: 1 },
    { label: '科目二', value: 2 },
    { label: '科目三', value: 3 },
    { label: '科目四', value: 4 },
    { label: '组合报审', value: 5 },
    { label: '结业上报', value: 9 },
  ], // 报审类型1
  isapply: [
    { label: '申请', value: 0 },
    { label: '同意', value: 2 },
    { label: '拒绝', value: 3 },
    { label: '撤销', value: 4 },
    { label: '提交', value: 1 },
    { label: '提交准备中', value: 5 },
  ], // 报审状态 0: 待提交（申请准备）   1：已提交（提交上报）  2：通过（同意）  3： 不通过（拒绝）  4：撤销   5：提交准备中
  trans_part_type: [
    { label: '科目一', value: '1' },
    { label: '科目二', value: '2' },
    { label: '科目三', value: '3' },
    { label: '科目四', value: '4' },
  ], // 考核科目
  subject_type: [
    { label: '实操', value: '1' },
    { label: '课堂教学', value: '2' },
    { label: '模拟器教学', value: '3' },
    { label: '远程教学', value: '4' },
  ], // 课程方式
  crstate_type: [
    { label: '待评判', value: '0' },
    { label: '整体有效', value: '1' },
    { label: '部分有效', value: '2' },
    { label: '整体无效', value: '3' },
  ], // 是否有效-电子教学日志
  min_crstate_type: [
    { label: '待评判', value: '0' },
    { label: '有效', value: '1' },
    { label: '无效', value: '2' },
  ], // 是否有效-分钟学时
  checkstatus_jx_type: [
    { label: '未初审', value: '0' },
    { label: '初审中', value: '1' },
    { label: '已初审', value: '2' },
    { label: '系统自动审批', value: '9' },
  ], // 初审状态
  checkstatus_jg_type: [
    { label: '待上传', value: '0' },
    { label: '审核中', value: '1' },
    { label: '审核通过', value: '2' },
    { label: '审核不通过', value: '9' },
  ], // 审核状态-电子教学日志
  stu_drivetrain_status: [
    { label: '报名', value: '00' },
    { label: '学驾中', value: '01' },
    { label: '退学', value: '02' },
    { label: '结业', value: '03' },
    { label: '注销', value: '04' },
    { label: '转校', value: '05' },
    { label: '归档', value: '99' },
  ], // 学员状态
  source_type: [
    { label: '本系统产生', value: '0' },
    { label: '老系统', value: '1' },
    { label: '第三方外部系统', value: '2' },
  ], // 数据来源
  student_contract_check_type: [
    { label: '勾选', value: '1' },
    { label: '不勾选', value: '0' },
  ], //勾选方式
  business_type: [
    { label: '报名缴费', value: '1' },
    { label: '课程预约', value: '2' },
  ], //业务类型
  order_type: [
    { label: '冻结支付', value: '1' },
    { label: '到账支付', value: '2' },
    { label: '线下支付', value: '3' },
  ], //订单类型
  pay_type: [], //支付方式
  pay_status: [
    { label: '待支付', value: '0' },
    { label: '支付中', value: '1' },
    { label: '已支付', value: '2' },
    { label: '已取消', value: '3' },
    { label: '已完成', value: '4' },
  ], //订单状态
  settlement_type: [
    { label: '按学时', value: '1' },
    { label: '按阶段', value: '2' },
    { label: '按课程', value: '3' },
    { label: '按计时', value: '4' },
  ], //结算类型
  settlement_status: [
    { label: '待结算', value: '0' },
    { label: '结算中', value: '1' },
    { label: '已结算', value: '2' },
    { label: '结算异常', value: '3' },
  ], //结算状态
  transaction_status: [
    { label: '成功', value: '0' },
    { label: '失败', value: '1' },
    { label: '待确认', value: '2' },
    { label: '待处理', value: '3' },
    { label: '处理中', value: '4' },
  ], //交易状态
  trade_list_page_trade_status: [], //交易记录-交易状态
  input_type: [
    { label: '文本框', value: '0' },
    { label: '下拉框', value: '1' },
  ],
  edit_option: [
    { label: '是', value: '1' },
    { label: '否', value: '0' },
  ], //是否可编辑
  trans_type: [
    { label: '支付', value: '1' },
    { label: '退款', value: '2' },
    { label: '冻结', value: '3' },
    { label: '解冻', value: '4' },
    { label: '结算', value: '5' },
    { label: '充值', value: '6' },
    { label: '提现', value: '7' },
  ], //交易类型
  trade_status_type: [
    { label: '待处理', value: '0' },
    { label: '处理中', value: '1' },
    { label: '交易成功', value: '2' },
    { label: '交易失败', value: '3' },
    { label: '交易关闭', value: '4' },
    { label: '退款', value: '5' },
    { label: '状态未知', value: '6' },
    { label: '待确认', value: '7' },
    { label: '超时异常', value: '8' },
    { label: '订单不存在', value: '9' },
    { label: '人工处理', value: '10' },
    { label: '人工处理中', value: '11' },
    { label: '人工处理成功', value: '12' },
    { label: '人工处理失败', value: '13' },
    { label: '未知异常', value: '99' },
  ], //交易状态
  transaction_type: [
    { label: '支付', value: '1' },
    { label: '退款', value: '2' },
    { label: '冻结', value: '3' },
    { label: '解冻', value: '4' },
    { label: '结算', value: '5' },
    { label: '充值', value: '6' },
    { label: '提现', value: '7' },
    { label: '转账（会员间）', value: '8' },
  ], //财务类型
  ic_card_physics_status_type: [
    { label: '始发卡', value: '0' },
    { label: '补发卡', value: '1' },
  ], //IC卡类型
  withdraw_status_type: [
    { label: '处理中', value: '1' },
    { label: '提现成功', value: '2' },
    { label: '提现失败', value: '3' },
  ], //提现状态（1.处理中 2.提现成功 3.提现失败）
  company_init_status: [
    { label: '未初始化', value: '0' },
    { label: '已初始化', value: '1' },
  ], //初始化状态：0：未初始化1：已初始化
  common_status_type: [
    { label: '启用', value: '1' },
    { label: '停用', value: '2' },
  ], //授权状态1：启用2：停用
  train_part: [
    { label: '第一部分', value: '1' },
    { label: '第二部分', value: '2' },
    { label: '第三部分', value: '3' },
    { label: '第四部分', value: '4' },
  ],
  overall_type: [
    { label: '一星', value: '1' },
    { label: '二星 ', value: '2' },
    { label: '三星 ', value: '3' },
    { label: '四星 ', value: '4' },
    { label: '五星 ', value: '5' },
  ], //总体满意度 1：一星 2：二星 3：三星 4：四星 5：五星（最满意）
  stu_record_status_type: [
    { label: '未备案', value: '0' },
    { label: '已备案 ', value: '1' },
  ], //学员备案状态
  appraisalresult_type: [
    { label: '不合格', value: '0' },
    { label: '合格 ', value: '1' },
  ], //考核结果
  report_status_type: [
    { label: '可报审', value: '0' },
    { label: '不可报审 ', value: '1' },
  ],
  studentFieldLabelMapping: [
    { label: '姓名', value: 'name' },
    { label: '性别', value: 'sex' },
    { label: '证件号', value: 'idcard' },
    { label: '国籍', value: 'nationality' },
    { label: '联系电话', value: 'phone' },
    { label: '地址', value: 'address' },
    { label: '照片', value: 'head_img_oss_id' },
    { label: '业务类型', value: 'busitype' },
    { label: '原驾驶证号', value: 'drilicnum' },
    { label: '初领日期', value: 'fstdrilicdate' },
    { label: '原准驾车型', value: 'perdritype' },
    { label: '培训车型', value: 'traintype' },
    { label: '报名日期', value: 'applydate' },
    { label: '是否外地转入', value: 'isotherprovince' },
    { label: '业务类型', value: 'fileType' },
    { label: '班级套餐ID', value: 'package_id' },
    { label: '学员班级', value: 'package_name' },
    { label: '学车教练', value: 'cid' },
    { label: '转出驾校省市', value: 'jump_fromarea' },
    { label: '是否本地', value: 'islocal' },
    { label: '居住证号', value: 'livecardnumber' },
    { label: '居住地址', value: 'liveaddress' },
    { label: '备注', value: 'note' },
    { label: '出生日期', value: 'birthday' },
    { label: '姓名', value: 'train_price' },
    { label: '证件类型', value: 'cardtype' },
    { label: '驾驶证图片', value: 'drilicenceossid' },
  ],
  student_send_status: [
    { label: '成功', value: '1' },
    { label: '失败', value: '2' },
    { label: '未推送', value: '0' },
  ],
  place_type: [
    { label: '允许训练', value: '1' },
    { label: '禁止训练', value: '0' },
  ],
  pos_type: [],
  bind_card_type: [
    { label: 'IC卡绑定', value: '1' },
    { label: '身份证卡编号绑定', value: '2' },
    { label: '未绑定', value: '0' },
  ],
  order_appoint_status: [], //预约状态
  pay_mode_type: [], //付费模式
  subject_code_class_type: [
    { label: '科目一', value: '1' },
    { label: '科目二', value: '2' },
    { label: '科目三', value: '3' },
    { label: '科目四', value: '4' },
    { label: '科二与科三组合', value: '0' },
  ], //班级管理-课程类型
  train_study_type: [
    { label: '定时培训', value: '1' },
    { label: '课程预约', value: '2' },
    { label: '随到随签', value: '3' },
  ], //培训签到方式
  charge_mode_type: [], //收费模式
  binding_card_cert_type: [], //绑卡证件类型
  ic_apply_status: [], //申请状态：1、无需申请 2、未申请 3、待审核 4、审核通过 5、审核不通过
  student_type: [],
  stucardnocrc: [
    { label: '成功', value: '1' },
    { label: '失败', value: '2' },
    { label: '强制签退', value: '3' },
  ], // 签退方式
  timing_firm: [], //计时厂商
  applymemo_code_type: [], // 退学原因
  pay_status_type: [], // 支付状态
  acc_confirm_status_type: [], //兑换状态
  sub_account_name_type: [], //兑换账户类型
  pay_way_type: [], // 支付方式
  review_status_type: [], //审核状态
  classrecord_review_type: [], //审核类型
  page_site: [],
  item_type: [],
  show_type: [],
  shop_category_type: [],
  organ_credentials_type: [], //证件类型：浙商
  certificates_type: [], //证件类型：平安开户（暂未使用）
  exception_code_type: [], //异常原因
  evaluation_quality_type: [],
  stu_fund_confirm_status_type: [], //学员资金确认状态数据字典
  stu_exam_is_qualified_type: [], //考试结果
  robot_exam_mark_item_type: [], //考试项目类型
  robot_exam_mark_type: [], //扣分名称
  push_graduation_third_type: [], // 第三方类型 2：鸿阳 3：监管 4：监管和鸿阳
  split_ratio_status_type: [], //教练分账状态
  bill_end_status_type: [], // 入职状态
  person_manage_type: [], //启用禁用
  stu_education_type: [],
  stu_healthState_type: [],
  stu_nationalReconciliation_type: [],
  stu_drivliceperiod_type: [],
  sch_msg_name_type: [],
  // hn_coach_type: [], //海南教练员类型
  gd_card_type: [], //广东证件类型
  stu_theory_check_status: [], // 理论中心审核状态
  sub_account_type: [], //入账状态
  simulator_record_status: [], // 模拟器备案状态
  simulator_bind_status: [], // 模拟器绑定状态
  simulator_type: [], // 模拟器类型
  log_service_name_type: [], // 服务名称
  pushga_status: [], // 推送公安状态
  withdraw_app_status: [], //提现申请状态
  order_retail_pay_status: [], //订单状态
  withdraw_apply_status: [], //提现审核状态
  school_withdraw_status: [], //提现状态
};
