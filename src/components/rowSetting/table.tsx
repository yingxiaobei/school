import Container from 'components/rowSetting/container';
import ColumnSetting from 'components/RowSetting';
import React from 'react';
import { isEqual } from 'lodash';
const ConnectDemo = (WrappedComponent: any) => {
  return (props: any) => {
    return (
      <div>
        {/* <ColumnSetting columns={props.columns}></ColumnSetting> */}
        <WrappedComponent
          columns={props.tableColumn}
          ColumnSetting={ColumnSetting({ columns: props.columns })}
        ></WrappedComponent>
      </div>
    );
  };
};

const Protable = (props: any) => {
  const { columns, table } = Container.useContainer();
  return ConnectDemo(props.children)({ tableColumn: table, columns: columns });
};

const Demo = (props: any) => {
  return (
    <Container.Provider
      initialState={{
        columns: props.props.columns,
        loadDependece: props.props.loadDependece,
        columnsState: {
          persistenceKey: 'studentInfo',
          persistenceType: 'localStorage',
        },
      }}
    >
      <Protable>{props.children}</Protable>
    </Container.Provider>
  );
};

function areEqual(prevProps: any, nextProps: any) {
  return (
    isEqual(prevProps.props.tableProps.loading, nextProps.props.tableProps.loading) &&
    isEqual(prevProps.props.tableProps.pagination.current, nextProps.props.tableProps.pagination.current) &&
    isEqual(prevProps.props.tableProps.pagination.pageSize, nextProps.props.tableProps.pagination.pageSize) &&
    isEqual(prevProps.props.loadDependece, nextProps.props.loadDependece) &&
    isEqual(prevProps.props.tableProps.pagination.total, nextProps.props.tableProps.pagination.total) &&
    isEqual(prevProps.props.rowSelection.selectedRowKeys, nextProps.props.rowSelection.selectedRowKeys)
  );
}

export default React.memo(Demo, areEqual);
