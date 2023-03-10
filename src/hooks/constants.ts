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
    { label: '?????????', value: '0' },
    { label: '??????????????????', value: '1' },
  ],
  order_status: [
    { label: '?????????', value: '0' },
    { label: '??????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '??????', value: '4' },
    { label: '?????????', value: '5' },
    { label: '?????????', value: '6' },
    { label: '?????????', value: '7' },
    { label: '?????????', value: '8' },
    { label: '?????????', value: '9' },
    { label: '?????????', value: '10' },
  ], // ????????????
  order_mode: [
    { label: '??????????????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
  ],
  subjectcode2: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
  ],
  registered_flag: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
  ], // ????????????
  card_status_type: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '0' },
  ], // ?????????
  business_scope: [], // ????????????
  // ---------------------twk-----------------------

  // ---------------------wy-----------------------
  status: [
    { label: '?????????', value: '0' },
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
  ], // ????????????-????????????????????????
  checkflag: [
    { label: '?????????', value: '0' },
    { label: '????????????', value: '1' },
    { label: '???????????????', value: '2' },
    { label: '????????????', value: '3' },
    { label: '?????????', value: '4' },
  ], // ????????????-????????????-????????????????????????
  pass_notpass_type: [
    { label: '??????', value: '1' },
    { label: '?????????', value: '2' },
  ], // ????????????-????????????-????????????????????????
  human_type: [], // ???????????? 0:?????????1:?????????2:??????
  signType: [{ label: '??????', value: '1' }], // ????????????1?????????
  review_type: [
    { label: '?????????', value: '-1' },
    { label: '????????????', value: '1' },
    { label: '??????????????????', value: '2' },
    { label: '????????????', value: '3' },
    { label: '????????????', value: '4' },
  ], // ????????????-1:????????? 1:???????????? 2:?????????????????? 3:???????????? 4:???????????? --??????????????????????????????
  teach_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
  ], // ?????????????????? 1????????? 2?????????
  coach_type: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '???????????????', value: '2' },
    { label: '???', value: '3' },
  ], // ?????????????????? 1???????????????(??????) 2???????????????(??????)
  platecolor_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
    { label: '??????', value: '4' },
    { label: '??????', value: '5' },
    { label: '??????', value: '9' },
  ], // ????????????(1:??????, 2:??????, 3:??????, 4:??????, 5:??????, 9:??????)
  car_status_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
    { label: '??????', value: '4' },
    { label: '?????????', value: '5' },
    { label: '??????', value: '9' },
  ], // ????????????(1-?????? 2-?????? 3-?????? 4-?????? 5-?????????,9-??????)
  fence_type: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
  ], //?????????????????? 0????????? 1????????? 2???????????????
  enableflag_type: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '????????????', value: '2' },
  ], //????????????   // ??????0????????????1????????????2???????????????
  record_status_type: [], // ????????????????????????????????????
  company_busi_status: [], // ????????????????????????????????????
  company_level: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
  ], // ????????????????????????????????????
  company_category: [], // ???????????? ????????????????????????
  company_img_type: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '10' },
    { label: '????????????', value: '11' },
    { label: '??????????????????', value: '12' },
    { label: '??????????????????', value: '13' },
    { label: '???????????????', value: '14' },
    { label: '??????????????????????????????', value: '2' },
    { label: '??????????????????????????????', value: '3' },
    { label: '???????????????????????????????????????', value: '4' },
    { label: '???????????????????????????????????????', value: '5' },
    { label: '????????????', value: '6' },
    { label: '??????????????????', value: '7' },
    { label: '??????', value: '8' },
    { label: '????????????', value: '9' },
  ], //  ??????????????????????????????
  occupation_level_type: [], // ??????????????????(????????????/??????????????????)

  busi_type: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '??????', value: '9' },
  ], // ???????????? 0:?????? 1:?????? 9:??????(????????????)
  stu_contract_status: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
  ], // ?????????????????? 0 ?????????  1????????? 2:????????? 3:?????????(????????????)
  registered_national_flag: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
  ], // ????????????????????????????????????(0:????????? 1:?????????)(????????????)
  nationality_type: [], // ??????(????????????)
  checkstatus_sign: [
    { label: '?????????', value: '0' },
    { label: '???????????????', value: '1' },
    { label: '????????????', value: '2' },
  ],
  traincode_type: [
    { label: '??????', value: '3' },
    { label: '??????', value: '2' },
  ], // ??????????????? ???????????????-?????????
  isapply_stu: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '0' },
  ], // ???????????? 0??????????????? 1???????????????(??????????????????)
  yes_no_type: [
    { label: '???', value: '1' },
    { label: '???', value: '0' },
  ], // ???????????????0??????1??????
  isapply_drop: [
    { label: '??????', value: 0 },
    { label: '??????', value: 2 },
    { label: '??????', value: 3 },
    { label: '??????', value: 4 },
  ], // ????????????=??????????????? 0: ???????????????????????????   1??????????????????????????????  2?????????????????????  3??? ?????????????????????  4?????????
  SchoolSubjectApply: [], // ???????????????????????? ??????????????????
  SubjectApplyStatus: [], // ???????????????????????? ??????????????????
  examType: [],
  sch_region_state_type: [], //????????????????????????????????????
  region_registered_type: [], //??????????????????????????????
  techlevel_type: [], // ??????????????????
  combo: [], // ????????????
  photo_type: [], // ????????????
  settlementflag: [], //????????????
  statistic_subject: [], // ????????????
  statistic_exam_result: [], //????????????
  iscyzg_type: [], // ??????????????????
  businessType: [], // ????????????????????????
  car_online_state: [], // ????????????
  traintime_apply_status_type: [], // ????????????
  exam_result_type: [], // ????????????
  trainning_time_type: [], // ????????????
  train_finish_flag: [], // ????????????
  stu_drivetrain_status_old: [], // ????????????
  portal_article_type: [], // ????????????
  article_publish_type: [], // ????????????
  portal_subject_type: [], // ????????????
  audit_status_type: [], // ??????????????????
  is_effective_type: [], // ????????????
  obd_flag_type: [], //  ?????????obd
  obd_status: [], // obd??????
  obd_audit_status: [], // obd????????????????????????
  video_upload_status: [], // ????????????
  video_alarm_type: [], // ????????????
  car_csys_type: [], // ????????????
  car_bzbsx_type: [], // car_bzbsx_type
  car_rl_type: [], // car_dljsjxcl_type
  region_jlcdly_type: [], //??????????????????
  region_cdlx_type: [], // ????????????
  region_lhwlhj_type: [], //??????????????????
  jg_service_name_type: [], // ????????????
  classrecord_appeal_status: [], // ????????????
  stu_bankaccountflag_type: [], // ????????????
  // ---------------------wy-----------------------
  trans_car_type: [], // ????????????
  card_type: [
    { label: '???????????????', value: '1' },
    { label: '??????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '??????', value: '4' },
  ], // ????????????(1-??????????????? 2-?????? 3-????????? 4-??????)
  gender_type: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
  ], // ?????? 1:??????;2:??????  0:??????
  coa_master_status: [
    { label: '??????', value: '00' },
    { label: '??????', value: '01' },
    { label: '??????', value: '02' },
    { label: '??????', value: '04' },
    { label: '??????', value: '05' },
  ], // ???????????? (00-?????? 01-?????? 02-??????  04-?????? 05-?????? )
  registered_flag_type: [
    { label: '?????????', value: '0' },
    { label: '???????????????', value: '1' },
    { label: '??????????????????', value: '2' },
    { label: '?????????????????????', value: '3' },
    { label: '????????????????????????', value: '4' },
  ], // ????????????-  0 :????????????1: ???????????????   2: ?????????????????? 3: ?????????????????????  4???????????????????????????
  subject: [
    { label: '?????????', value: 1 },
    { label: '?????????', value: 2 },
    { label: '?????????', value: 3 },
    { label: '?????????', value: 4 },
    { label: '????????????', value: 5 },
    { label: '????????????', value: 9 },
  ], // ????????????1
  isapply: [
    { label: '??????', value: 0 },
    { label: '??????', value: 2 },
    { label: '??????', value: 3 },
    { label: '??????', value: 4 },
    { label: '??????', value: 1 },
    { label: '???????????????', value: 5 },
  ], // ???????????? 0: ???????????????????????????   1??????????????????????????????  2?????????????????????  3??? ?????????????????????  4?????????   5??????????????????
  trans_part_type: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
  ], // ????????????
  subject_type: [
    { label: '??????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '???????????????', value: '3' },
    { label: '????????????', value: '4' },
  ], // ????????????
  crstate_type: [
    { label: '?????????', value: '0' },
    { label: '????????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
  ], // ????????????-??????????????????
  min_crstate_type: [
    { label: '?????????', value: '0' },
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
  ], // ????????????-????????????
  checkstatus_jx_type: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '??????????????????', value: '9' },
  ], // ????????????
  checkstatus_jg_type: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '???????????????', value: '9' },
  ], // ????????????-??????????????????
  stu_drivetrain_status: [
    { label: '??????', value: '00' },
    { label: '?????????', value: '01' },
    { label: '??????', value: '02' },
    { label: '??????', value: '03' },
    { label: '??????', value: '04' },
    { label: '??????', value: '05' },
    { label: '??????', value: '99' },
  ], // ????????????
  source_type: [
    { label: '???????????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '?????????????????????', value: '2' },
  ], // ????????????
  student_contract_check_type: [
    { label: '??????', value: '1' },
    { label: '?????????', value: '0' },
  ], //????????????
  business_type: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '2' },
  ], //????????????
  order_type: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
  ], //????????????
  pay_type: [], //????????????
  pay_status: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
  ], //????????????
  settlement_type: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
  ], //????????????
  settlement_status: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '????????????', value: '3' },
  ], //????????????
  transaction_status: [
    { label: '??????', value: '0' },
    { label: '??????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
  ], //????????????
  trade_list_page_trade_status: [], //????????????-????????????
  input_type: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
  ],
  edit_option: [
    { label: '???', value: '1' },
    { label: '???', value: '0' },
  ], //???????????????
  trans_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
    { label: '??????', value: '4' },
    { label: '??????', value: '5' },
    { label: '??????', value: '6' },
    { label: '??????', value: '7' },
  ], //????????????
  trade_status_type: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
    { label: '????????????', value: '4' },
    { label: '??????', value: '5' },
    { label: '????????????', value: '6' },
    { label: '?????????', value: '7' },
    { label: '????????????', value: '8' },
    { label: '???????????????', value: '9' },
    { label: '????????????', value: '10' },
    { label: '???????????????', value: '11' },
    { label: '??????????????????', value: '12' },
    { label: '??????????????????', value: '13' },
    { label: '????????????', value: '99' },
  ], //????????????
  transaction_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '??????', value: '3' },
    { label: '??????', value: '4' },
    { label: '??????', value: '5' },
    { label: '??????', value: '6' },
    { label: '??????', value: '7' },
    { label: '?????????????????????', value: '8' },
  ], //????????????
  ic_card_physics_status_type: [
    { label: '?????????', value: '0' },
    { label: '?????????', value: '1' },
  ], //IC?????????
  withdraw_status_type: [
    { label: '?????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
  ], //???????????????1.????????? 2.???????????? 3.???????????????
  company_init_status: [
    { label: '????????????', value: '0' },
    { label: '????????????', value: '1' },
  ], //??????????????????0???????????????1???????????????
  common_status_type: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
  ], //????????????1?????????2?????????
  train_part: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
    { label: '????????????', value: '4' },
  ],
  overall_type: [
    { label: '??????', value: '1' },
    { label: '?????? ', value: '2' },
    { label: '?????? ', value: '3' },
    { label: '?????? ', value: '4' },
    { label: '?????? ', value: '5' },
  ], //??????????????? 1????????? 2????????? 3????????? 4????????? 5????????????????????????
  stu_record_status_type: [
    { label: '?????????', value: '0' },
    { label: '????????? ', value: '1' },
  ], //??????????????????
  appraisalresult_type: [
    { label: '?????????', value: '0' },
    { label: '?????? ', value: '1' },
  ], //????????????
  report_status_type: [
    { label: '?????????', value: '0' },
    { label: '???????????? ', value: '1' },
  ],
  studentFieldLabelMapping: [
    { label: '??????', value: 'name' },
    { label: '??????', value: 'sex' },
    { label: '?????????', value: 'idcard' },
    { label: '??????', value: 'nationality' },
    { label: '????????????', value: 'phone' },
    { label: '??????', value: 'address' },
    { label: '??????', value: 'head_img_oss_id' },
    { label: '????????????', value: 'busitype' },
    { label: '???????????????', value: 'drilicnum' },
    { label: '????????????', value: 'fstdrilicdate' },
    { label: '???????????????', value: 'perdritype' },
    { label: '????????????', value: 'traintype' },
    { label: '????????????', value: 'applydate' },
    { label: '??????????????????', value: 'isotherprovince' },
    { label: '????????????', value: 'fileType' },
    { label: '????????????ID', value: 'package_id' },
    { label: '????????????', value: 'package_name' },
    { label: '????????????', value: 'cid' },
    { label: '??????????????????', value: 'jump_fromarea' },
    { label: '????????????', value: 'islocal' },
    { label: '????????????', value: 'livecardnumber' },
    { label: '????????????', value: 'liveaddress' },
    { label: '??????', value: 'note' },
    { label: '????????????', value: 'birthday' },
    { label: '??????', value: 'train_price' },
    { label: '????????????', value: 'cardtype' },
    { label: '???????????????', value: 'drilicenceossid' },
  ],
  student_send_status: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '?????????', value: '0' },
  ],
  place_type: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '0' },
  ],
  pos_type: [],
  bind_card_type: [
    { label: 'IC?????????', value: '1' },
    { label: '????????????????????????', value: '2' },
    { label: '?????????', value: '0' },
  ],
  order_appoint_status: [], //????????????
  pay_mode_type: [], //????????????
  subject_code_class_type: [
    { label: '?????????', value: '1' },
    { label: '?????????', value: '2' },
    { label: '?????????', value: '3' },
    { label: '?????????', value: '4' },
    { label: '?????????????????????', value: '0' },
  ], //????????????-????????????
  train_study_type: [
    { label: '????????????', value: '1' },
    { label: '????????????', value: '2' },
    { label: '????????????', value: '3' },
  ], //??????????????????
  charge_mode_type: [], //????????????
  binding_card_cert_type: [], //??????????????????
  ic_apply_status: [], //???????????????1??????????????? 2???????????? 3???????????? 4??????????????? 5??????????????????
  student_type: [],
  stucardnocrc: [
    { label: '??????', value: '1' },
    { label: '??????', value: '2' },
    { label: '????????????', value: '3' },
  ], // ????????????
  timing_firm: [], //????????????
  applymemo_code_type: [], // ????????????
  pay_status_type: [], // ????????????
  acc_confirm_status_type: [], //????????????
  sub_account_name_type: [], //??????????????????
  pay_way_type: [], // ????????????
  review_status_type: [], //????????????
  classrecord_review_type: [], //????????????
  page_site: [],
  item_type: [],
  show_type: [],
  shop_category_type: [],
  organ_credentials_type: [], //?????????????????????
  certificates_type: [], //?????????????????????????????????????????????
  exception_code_type: [], //????????????
  evaluation_quality_type: [],
  stu_fund_confirm_status_type: [], //????????????????????????????????????
  stu_exam_is_qualified_type: [], //????????????
  robot_exam_mark_item_type: [], //??????????????????
  robot_exam_mark_type: [], //????????????
  push_graduation_third_type: [], // ??????????????? 2????????? 3????????? 4??????????????????
  split_ratio_status_type: [], //??????????????????
  bill_end_status_type: [], // ????????????
  person_manage_type: [], //????????????
  stu_education_type: [],
  stu_healthState_type: [],
  stu_nationalReconciliation_type: [],
  stu_drivliceperiod_type: [],
  sch_msg_name_type: [],
  // hn_coach_type: [], //?????????????????????
  gd_card_type: [], //??????????????????
  stu_theory_check_status: [], // ????????????????????????
  sub_account_type: [], //????????????
  simulator_record_status: [], // ?????????????????????
  simulator_bind_status: [], // ?????????????????????
  simulator_type: [], // ???????????????
  log_service_name_type: [], // ????????????
  pushga_status: [], // ??????????????????
  withdraw_app_status: [], //??????????????????
  order_retail_pay_status: [], //????????????
  withdraw_apply_status: [], //??????????????????
  school_withdraw_status: [], //????????????
};
