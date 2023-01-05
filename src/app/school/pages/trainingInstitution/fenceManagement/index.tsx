// 围栏版本管理
import { useRef, useState } from 'react';
import { Row, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getTableMaxHeightRef, _get } from 'utils';
import { useFetch, useTablePagination, useSearch, useVisible, useForceUpdate, useOptions, useHash } from 'hooks';
import { _getInfo, _getTeachAreaList } from './_api';
import VersionRecord from './VersionRecord';
import { AuthButton, AuthWrapper, ButtonContainer, CustomTable, Search } from 'components';
import ReleaseVersion from './ReleaseVersion';
import FenceDetail from './FenceDetail';

interface IProps {
  type: string;
}

function FenceManagement(props: IProps) {
  const { type = '' } = props;
  const searchRef = useRef(null as any);
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [ignore2, forceUpdate2] = useForceUpdate();
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [versionVisible, _switchVersionVisible] = useVisible(); // 版本记录
  const [releaseVisible, _switchReleaseVisible] = useVisible(); // 发布新版本
  const [detailVisible, _switchDetailVisible] = useVisible(); // 详情
  const [teachAreaOption, setTeachAreaOption] = useState<any>([]); // 教学区域下拉数据
  const [isCarDetail, setIsCarDetail] = useState<any>(); // 列表=》查看=》isCarDetail='true'；列表=》版本记录=》详情=》isCarDetail='false'。
  //参数意义：作为详情接口，判断传入参数fid的来源
  const [carFid, setCarFid] = useState(); // isCarDetail参数来源是版本记录详情的时候，所取fid的值

  // 驾校车辆列表
  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: _get(search, 'fenceType'),
      licnum: _get(search, 'licnum'),
      regionseq: _get(search, 'regionseq'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  // 教学区域下拉数据
  const { data: teachAreaList = [] } = useFetch({
    request: _getTeachAreaList,
    callback: (teachAreaList: any) => {
      const teachAreaData = teachAreaList.map((x: any) => {
        return {
          label: x.name,
          value: x.regionseq,
        };
      });
      setTeachAreaOption(teachAreaData);
    },
  });

  const fenceTypeHash = useHash('fence_type');

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'licnum',
    },
    {
      title: '采用围栏类型',
      dataIndex: 'type',
      render: (type: any) => fenceTypeHash[type],
    },
    {
      title: '当前采用版本',
      dataIndex: 'version',
      render: (version: any, record: any): any => {
        return (
          <>
            {version && (
              <span
                className="color-primary pointer"
                onClick={() => {
                  _switchDetailVisible();
                  setCurrentRecord(record);
                  setIsCarDetail(true);
                }}
                style={{ marginRight: 6 }}
              >
                查看
              </span>
            )}
            {!version && <>未设置版本</>}
            {version}
          </>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId={`trainingInstitution/fenceManagement${type}:btn2`}
            className="operation-button"
            onClick={() => {
              _switchReleaseVisible();
              setCurrentRecord(record);
            }}
          >
            发布新版本
          </AuthButton>
          <AuthButton
            authId={`trainingInstitution/fenceManagement${type}:btn3`}
            onClick={() => {
              _switchVersionVisible();
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            版本记录
          </AuthButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 版本记录 */}
      {versionVisible && (
        <VersionRecord
          currentRecord={currentRecord}
          onCancel={_switchVersionVisible}
          setCarFid={setCarFid}
          setIsCarDetail={setIsCarDetail}
          _switchReleaseVisible={_switchReleaseVisible}
          _switchDetailVisible={_switchDetailVisible}
          ignore={ignore2}
          forceUpdate={forceUpdate2}
        />
      )}

      {/* 发布围栏版本 */}
      {releaseVisible && (
        <ReleaseVersion
          type={type}
          currentRecord={currentRecord}
          onCancel={_switchReleaseVisible}
          onOk={() => {
            _switchReleaseVisible();
            forceUpdate();
            forceUpdate2(); //更新版本记录
          }}
        />
      )}

      {/* 查看详情 */}
      {detailVisible && (
        <FenceDetail
          currentRecord={currentRecord}
          onCancel={_switchDetailVisible}
          carFid={carFid}
          isCarDetail={isCarDetail}
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'licnum', placeholder: '车牌号' },
          {
            type: 'Select',
            field: 'regionseq',
            options: [{ label: '教学区域(全部)', value: '' }, ...teachAreaOption],
            otherProps: {
              showSearch: true,
              filterOption: false,
              onSelect: (value: any) => {
                setTeachAreaOption(
                  teachAreaList.map((x: any) => {
                    return {
                      label: x.name,
                      value: x.regionseq,
                    };
                  }),
                );
              },
              onSearch: (value: any) => {
                setTeachAreaOption(
                  teachAreaList
                    .filter((item: any) => {
                      if (value) {
                        return item.name.includes(value);
                      }
                      return item;
                    })
                    .map((x: any) => {
                      return {
                        label: x.name,
                        value: x.regionseq,
                      };
                    }),
                );
              },
            },
          },
          {
            type: 'Select',
            field: 'fenceType',
            options: [{ label: '围栏类型(全部)', value: '' }, ...useOptions('fence_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        ref={searchRef}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        searchRef={searchRef}
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
      >
        <AuthButton
          authId={`trainingInstitution/fenceManagement${type}:btn1`}
          type="primary"
          onClick={() => {
            setCurrentRecord(null);
            _switchVersionVisible();
          }}
          className="mb20"
        >
          设置通用围栏
        </AuthButton>
        <AuthWrapper authId={`trainingInstitution/fenceManagement${type}:btn1`}>
          <Tooltip title="当车辆未添加单独教学区域，默认使用该通用围栏">
            <QuestionCircleOutlined className="questionIcon-40" />
          </Tooltip>
        </AuthWrapper>
      </ButtonContainer>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'carid')}
        pagination={tablePagination}
        scroll={{ y: getTableMaxHeightRef(searchRef) }}
      />
    </div>
  );
}

export default FenceManagement;
