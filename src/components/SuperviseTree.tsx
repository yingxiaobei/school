import { Button, Row, Select, Tree } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Auth, _get } from 'utils';
import { _getBaseInfo, _getSearchText, _getTreeData } from 'api';
import { useFetch } from 'hooks';
import { IF, Loading } from 'components';

interface IProps {
  callback(customSchoolId: string): void;
  height?: number;
  width?: number | string;
  leafType?: 'city' | 'area' | 'school' | 'car' | 'camera';
  showSearch?: boolean;
}

interface ITreeData {
  title: string;
  key: string;
  type: string;
  pid: string;
  id: string;
  isLeaf: boolean;
  schoolId?: string;
  text?: string;
}

export default function SuperviseTree(props: IProps) {
  const { callback, height = 500, width = 300, leafType = 'school', showSearch = true } = props;

  const initTreeData: ITreeData[] = [
    {
      title: String(Auth.get('schoolName')),
      key: 'schoolName',
      type: '-1',
      pid: '-1',
      id: '-1',
      isLeaf: false,
    },
  ];
  const [treeData, setTreeData] = useState(initTreeData);
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>(['schoolName']);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<any>({});
  const [optionData, setOptionData] = useState([]);
  const [firstStageType, setFirstStageType] = useState(''); //树第一层返回值type
  const [searching, setSearching] = useState(false); //是否是搜索状态
  const treeRef = useRef(null);

  useFetch({
    request: _getTreeData,
    query: { pid: '-1', ptype: '-1', page: 1, limit: 5, schoolType: '3' },
    callback: (data: any) => {
      setFirstStageType(_get(data, 'rows.0.type', ''));
    },
  });

  // 基本信息详情
  const { data: basicInfoData, isLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });
  const isSupervise = String(_get(basicInfoData, 'type', '')) === '2'; //是否监管账号

  useEffect(() => {
    const schoolId = _get(selectedKeys, '0', '');
    callback(schoolId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);

  function onLoadData(treeNode: any) {
    // TODO: any替换
    const { children, key, pid, type, id, schoolId, title, text } = treeNode;
    let carId = '';
    let carSchoolId = '';
    return new Promise<void>(async (resolve) => {
      if (children) {
        resolve();
        return;
      }
      const res = await _getTreeData({
        pid: id || '-1',
        ptype: type || '-1',
        page: 1,
        limit: 100,
        schoolType: '3',
      });
      const data = _get(res, 'data.rows', []).map((item: any) => {
        return {
          ...item,
          title: item.text,
          key: item.type === 'camera' ? item.id + ',' + carId + ',' + carSchoolId : item.id,
          isLeaf: item.type === leafType ? true : false,
        };
      });
      setTimeout(() => {
        isSupervise && setTreeData((origin: any) => updateTreeData(origin, key, data)); //如果不是监管账号，就不要展开树，因为普通驾校查询到的数据是车牌号
        resolve();
      }, 1000);
    });
  }

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
  const onSelect = async (selectedKeys: any, e: { selected: boolean; selectedNodes: any; node: any; event: any }) => {
    const type = _get(e, 'node.type', '');
    if (type !== leafType) {
      return;
    }

    setSelectedKeys(selectedKeys);
  };

  const onExpand = (expandedKeys: any) => {
    setExpandedKeys([...expandedKeys]);
    setAutoExpandParent(false);
  };

  const onLoad = (loadedKeys: any) => {
    //load完成后调用
    //0-city  1-area   2-school   3-car  4-camera
    if (Object.keys(searchResult).length > 0 && searching) {
      const cityCode = _get(searchResult, 'cityCode', '');
      const areaCode = _get(searchResult, 'areaCode', '');

      if (firstStageType === 'city') {
        if (!loadedKeys.includes(cityCode)) {
          return setExpandedKeys([...expandedKeys, cityCode]);
        }
        if (!loadedKeys.includes(areaCode)) {
          return setExpandedKeys([...expandedKeys, areaCode]);
        }
        setSearching(false);
      }
      if (firstStageType === 'area') {
        if (!loadedKeys.includes(areaCode)) {
          return setExpandedKeys([...expandedKeys, areaCode]);
        }
        setSearching(false);
      }
      if (firstStageType === 'school') {
        setSearching(false);
      }
    }
  };

  const fetchOptions = (val: any) => {
    const query = {
      searchType: '2', // 搜索类别  1-车牌； 2-驾校名称
      searchText: val, // 搜索关键字
      schoolType: '3',
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
    const id = _get(searchResult, 'id', '');
    const isExpandRoot = firstStageType !== 'car';
    setAutoExpandParent(true);
    const tree: any = treeRef?.current;
    if (_get(searchResult, 'id', '') === Auth.get('schoolId')) {
      //查询驾校是当前驾校时，选中根节点
      setSelectedKeys(['schoolName']);
    } else {
      setSelectedKeys([id]);
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
    tree.scrollTo({ key: id, align: 'top' });
  };

  return (
    <div style={{ width }}>
      {showSearch && (
        <Row>
          <Select
            style={{ margin: '0 20px 20px 0', width: 200, display: 'inline-block', marginRight: 20 }}
            value={searchText}
            placeholder="驾校全称"
            onSearch={(value) => {
              fetchOptions(value);
            }}
            onClear={() => {
              setSearchText('');
              setSelectedKeys([]);
            }}
            showSearch
            filterOption={false}
            allowClear={true}
            onChange={(value: any) => {
              setSearchText(value);
              const res = optionData.filter((x: any) => x.value === value);
              setSearchResult(_get(res, '0', {}));
            }}
            options={[{ label: '驾校名称(全部)', value: '' }, ...optionData]}
          />
          <Button type="primary" className="mr20 mb20" onClick={handleSearch}>
            查询
          </Button>
        </Row>
      )}

      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Tree
            showIcon
            ref={treeRef}
            loadData={onLoadData}
            treeData={treeData}
            onSelect={onSelect}
            onLoad={onLoad}
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            selectedKeys={selectedKeys}
            height={height}
          />
        }
      />
    </div>
  );
}
