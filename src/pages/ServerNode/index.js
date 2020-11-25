import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Button, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
import FormModal from './FormModal';
import styles from './index.less';

@connect(({ serverNode, loading }) => ({ serverNode, loading }))
class ServerNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
    };
  }

  reloadData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'serverNode/queryList',
    });
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'serverNode/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'serverNode/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'serverNode/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'serverNode/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        delRowId: record.id,
      },
      () => {
        dispatch({
          type: 'serverNode/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delRowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'serverNode/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  getEnvRemark = key => {
    const {
      serverNode: { evnData },
    } = this.props;
    const env = evnData.filter(e => e.key === key);
    if (env.length === 1) {
      return env[0].title;
    }
    return '';
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['serverNode/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { serverNode, loading } = this.props;
    const { showModal, rowData, list, evnData } = serverNode;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtIcon
              className="edit"
              onClick={() => this.edit(record)}
              type="edit"
              ignore="true"
              antd
            />
            <Popconfirm
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '环境',
        dataIndex: 'env',
        width: 140,
        required: true,
        render: this.getEnvRemark,
      },
      {
        title: '节点名称',
        dataIndex: 'name',
        width: 220,
        required: true,
      },
      {
        title: '节点地址',
        dataIndex: 'address',
        width: 280,
        required: true,
      },
      {
        title: '节点描述',
        dataIndex: 'remark',
        width: 380,
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      evnData,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['serverNode/save'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add} ignore="true">
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable
          loading={loading.effects['serverNode/queryList']}
          toolBar={toolBarProps}
          columns={columns}
          dataSource={list}
          searchWidth={260}
          searchPlaceHolder="节点名称、节点地址、节点描述"
          searchProperties={['name', 'value', 'remark']}
          showSearchTooltip
          sort={{
            field: { name: 'asc', remark: null, value: null },
          }}
        />
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default ServerNode;