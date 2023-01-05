import { Spin, Row, Col, Empty } from 'antd';
import styles from './index.module.css';

interface Props {
  dataSource: any[];
  columns: any[];
  loading: boolean;
}

function DashBarList({ dataSource, columns, loading }: Props) {
  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          <Row className={styles.dataHeader}>
            {columns.map((column) => (
              <Col span={24 / columns.length} key={column.dataIndex} className={styles.text}>
                {column.title}
              </Col>
            ))}
          </Row>

          {/* body */}
          <div className={styles.body}>
            {dataSource.length ? (
              dataSource.map((data, index) => (
                <Row key={index} className={styles.dataContent}>
                  {columns.map((column) => (
                    <Col span={24 / columns.length} key={column.dataIndex} className={styles.text}>
                      {data[column.dataIndex] || ''}
                    </Col>
                  ))}
                </Row>
              ))
            ) : (
              <Empty style={{ marginTop: 22 }} />
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default DashBarList;
