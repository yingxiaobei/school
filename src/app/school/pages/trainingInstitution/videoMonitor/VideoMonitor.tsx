import { Button, Input, message, Row, Select, Tree } from 'antd';
import { useFetch } from 'hooks';
import { useEffect, useState, useRef } from 'react';
import { _get } from 'utils/_get';
import { _getCarVideo, _stopCarVideo } from './_api';
import { _getTreeData, _getSearchText } from 'api';
import VideoOverview from './VideoOverview';
import { Auth } from 'utils';
import { _getBaseInfo } from 'api';
const initTreeData: any = [
  {
    title: Auth.get('schoolName'),
    key: 'schoolName',
    type: -1,
    pid: -1,
    id: -1,
    checkable: false,
    isLeaf: false,
  },
];

const isHTTPS = document.location.protocol === 'https:';

export default function VideoMonitor() {
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
  const [checkedNodes, setCheckedNodes] = useState([]);
  const [selectedUrlData, setSelectedUrlData] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [treeData, setTreeData] = useState(initTreeData);
  const [searchType, setSearchType] = useState('1'); //查询类型 1：车牌号 2：驾校
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<any>({});
  const [optionData, setOptionData] = useState([]);
  const [firstStageType, setFirstStageType] = useState(''); //树第一层返回值type
  const [searching, setSearching] = useState(false); //是否是搜索状态
  const [selectOptions, setSelectOptions] = useState([{ label: '车牌号', value: '1' }]);
  const treeRef = useRef(null);

  useFetch({
    request: _getTreeData,
    query: { pid: '-1', ptype: '-1', page: 1, limit: 5 },
    callback: (data: any) => {
      setFirstStageType(_get(data, 'rows.0.type', ''));
    },
  });
  // 基本信息详情
  const { data: basicInfoData } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });

  useEffect(() => {
    const selectOptions =
      String(_get(basicInfoData, 'type', '')) === '2' //监管账号
        ? [
            { label: '车牌号', value: '1' },
            { label: '驾校名称', value: '2' },
          ]
        : [{ label: '车牌号', value: '1' }]; //非监管账号屏蔽驾校的搜索
    setSelectOptions(selectOptions);
  }, [basicInfoData]);

  useEffect(() => {
    async function getCarVideo() {
      const urlData = checkedNodes.map(async (item: any) => {
        const res = await _getCarVideo({
          carId: _get(item, 'carId', ''),
          cameraNum: _get(item, 'id', ''),
          carSchoolId: _get(item, 'carSchoolId', ''),
        });
        const oriUrl = _get(res, 'data.hlsPullUrl', '');
        // eslint-disable-next-line no-useless-escape
        const oriUrlArr = oriUrl.split(/\:/);
        const url = isHTTPS ? `https:${_get(oriUrlArr, '1', '')}` : oriUrl; // 视频播放地址是否https根据当前环境是否https切换
        return { url, ...item };
      });
      const data: any = [];
      for (const urlItem of urlData) {
        const res = await urlItem;
        data.push(res);
      }
      setSelectedUrlData(data);
    }
    getCarVideo();
  }, [checkedNodes]);

  function updateTreeData(list: any, key: React.Key, children: any) {
    return list.map((node: any) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }

  function onLoadData(treeNode: any) {
    const { children, key, pid, type, id, schoolId, title, text } = treeNode;
    let carId = '';
    let carSchoolId = '';
    let carLicense = '';
    if (type === 'car') {
      carId = id;
      carSchoolId = schoolId;
      carLicense = text;
    }
    return new Promise<void>(async (resolve) => {
      if (children) {
        resolve();
        return;
      }
      const res = await _getTreeData({
        pid: id ? id : -1,
        ptype: type ? type : -1,
        page: 1,
        limit: 100,
      });
      const data = _get(res, 'data.rows', []).map((item: any) => {
        return {
          ...item,
          title:
            item.type !== 'car' ? (
              item.text
            ) : (
              <div>
                {item.text}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: item.activeState === 1 ? '#0f0' : '#aaa',
                    borderRadius: 5,
                    display: 'inline-block',
                    marginLeft: 10,
                  }}
                />
              </div>
            ),
          key: item.type === 'camera' ? item.id + ',' + carId + ',' + carSchoolId : item.id,
          carId,
          carSchoolId,
          carLicense,
          checkable: item.type === 'camera' ? true : false,
          isLeaf: item.type === 'camera' ? true : false,
        };
      });
      setTimeout(() => {
        setTreeData((origin: any) => updateTreeData(origin, key, data));
        resolve();
      }, 1000);
    });
  }

  const onCheck = async (checkedKeys: any, info: any) => {
    if (!_get(info, 'checked', false)) {
      await _stopCarVideo({
        carId: _get(info, 'node.carId', ''),
        cameraNum: _get(info, 'node.id', ''),
        carSchoolId: _get(info, 'node.carSchoolId', ''),
      });
    }
    if (_get(info, 'checked', false) && _get(checkedKeys, 'checked.length', 0) > 9) {
      return message.error('最多支持展示9个监控视频');
    }
    setCheckedKeys(_get(checkedKeys, 'checked', []));
    setCheckedNodes(_get(info, 'checkedNodes'));
  };

  const onExpand = (expandedKeys: any) => {
    setExpandedKeys([...expandedKeys]);
    setAutoExpandParent(false);
  };

  const onLoad = (loadedKeys: any, obj: any) => {
    //load完成后调用

    //0-city  1-area   2-school   3-car  4-camera
    if (Object.keys(searchResult).length > 0 && searching) {
      const cityCode = _get(searchResult, 'cityCode', '');
      const areaCode = _get(searchResult, 'areaCode', '');
      const schoolCode = searchType === '1' ? _get(searchResult, 'schoolCode', '') : _get(searchResult, 'id', '');
      const carId = searchType === '1' ? _get(searchResult, 'id', '') : '';
      if (firstStageType === 'city') {
        if (!loadedKeys.includes(cityCode)) {
          return setExpandedKeys([...expandedKeys, cityCode]);
        }
        if (!loadedKeys.includes(areaCode)) {
          return setExpandedKeys([...expandedKeys, areaCode]);
        }
        searchType === '2' && setSearching(false);
        if (searchType === '1' && !loadedKeys.includes(schoolCode)) {
          //查询车牌号才需要展开驾校
          return setExpandedKeys([...expandedKeys, schoolCode]);
        }
      }
      if (firstStageType === 'area') {
        if (!loadedKeys.includes(areaCode)) {
          return setExpandedKeys([...expandedKeys, areaCode]);
        }
        searchType === '2' && setSearching(false);
        if (searchType === '1' && !loadedKeys.includes(schoolCode)) {
          return setExpandedKeys([...expandedKeys, schoolCode]);
        }
      }
      if (firstStageType === 'school') {
        searchType === '2' && setSearching(false);
        if (searchType === '1' && !loadedKeys.includes(schoolCode)) {
          return setExpandedKeys([...expandedKeys, schoolCode]);
        }
      }
      if (searchType === '1' && !loadedKeys.includes(carId)) {
        //查询车牌号才需要展开车牌
        setExpandedKeys([...expandedKeys, carId]);
        setSearching(false);
        const tree: any = treeRef?.current;
        tree.scrollTo({ key: carId, align: 'top' }); //{ key: string | number; align?: 'top' | 'bottom' | 'auto'; offset?: number }
        return;
      }
    }
  };
  const fetchOptions = (val: any) => {
    const query = {
      searchType, // 搜索类别  1-车牌； 2-驾校名称
      searchText: val, // 搜索关键字
    };

    _getSearchText(query).then((res: any) => {
      setOptionData(
        _get(res, 'data.rows', []).map((x: any) => ({ value: _get(x, 'text', ''), label: _get(x, 'text', ''), ...x })),
      );
    });
  };

  const handleSearch = () => {
    if (!searchText) {
      return;
    }
    const cityCode = _get(searchResult, 'cityCode', '');
    const areaCode = _get(searchResult, 'areaCode', '');
    const schoolCode = _get(searchResult, 'schoolCode', '');
    const carId = _get(searchResult, 'id', '');
    const isExpandRoot = firstStageType !== 'car' || (firstStageType === 'car' && searchType === '1'); //是否展开根节点：当第一层节点是car但查询类型是车牌号时或当第一层节点不是car
    setAutoExpandParent(true);
    const tree: any = treeRef?.current;
    if (searchType === '2' && _get(searchResult, 'id', '') === Auth.get('schoolId')) {
      //查询驾校是当前驾校时，选中根节点
      setSelectedKeys(['schoolName']);
    } else {
      setSelectedKeys([carId]);
    }
    setSearching(true);
    //  0-city  1-area   2-school   3-car  4-camera
    if (isExpandRoot && _get(expandedKeys, 'length', 0) === 0) {
      return setExpandedKeys(['schoolName']);
    }
    if (firstStageType === 'city') {
      if (!expandedKeys.includes(cityCode)) {
        return setExpandedKeys([...expandedKeys, cityCode]);
      }
    }
    if (firstStageType === 'area') {
      if (!expandedKeys.includes(areaCode)) {
        return setExpandedKeys([...expandedKeys, areaCode]);
      }
    }
    if (firstStageType === 'school') {
      if (searchType === '1' && !expandedKeys.includes(schoolCode)) {
        return setExpandedKeys([...expandedKeys, schoolCode]);
      }
    }
    if (searchType === '1' && !expandedKeys.includes(carId)) {
      tree.scrollTo({ key: carId, align: 'top' });
      return setExpandedKeys([...expandedKeys, carId]);
    }
    tree.scrollTo({ key: carId, align: 'top' });
  };

  return (
    <div className="flex">
      <div style={{ width: 240 }}>
        <Row>
          <Input.Group
            compact
            style={{ margin: '0 20px 20px 0', width: 240, display: 'inline-block', marginRight: 20 }}
          >
            <Select
              defaultValue="1"
              style={{ width: 100 }}
              onChange={(value: any) => {
                setSearchType(value);
                setSearchText('');
                setOptionData([]);
              }}
              options={selectOptions}
            />
            <Select
              value={searchText}
              placeholder={searchType === '1' ? '车牌号' : '驾校全称'}
              onSearch={(value) => {
                fetchOptions(value);
              }}
              onClear={() => {
                setSearchText('');
                setSelectedKeys([]);
              }}
              showSearch
              filterOption={false}
              style={{ width: 120 }}
              allowClear={true}
              onChange={(value: any) => {
                setSearchText(value);
                const res = optionData.filter((x: any) => x.value === value);
                setSearchResult(_get(res, '0', {}));
              }}
              options={optionData}
            />
          </Input.Group>
          <Button type="primary" className="mr20 mb20" onClick={handleSearch}>
            查询
          </Button>
        </Row>
        {_get(treeData, 'length', 0) > 0 && (
          <Tree
            ref={treeRef}
            showIcon
            checkable
            loadData={onLoadData}
            onLoad={onLoad}
            treeData={treeData}
            onCheck={onCheck}
            defaultExpandAll
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            selectedKeys={selectedKeys}
            checkedKeys={checkedKeys}
            checkStrictly
            // style={{ overflow: 'auto' }}
            height={480}
          />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <VideoOverview
          selectedUrlData={selectedUrlData}
          checkedKeys={checkedKeys}
          setCheckedKeys={setCheckedKeys}
          checkedNodes={checkedNodes}
          setCheckedNodes={setCheckedNodes}
        />
      </div>
    </div>
  );
}
