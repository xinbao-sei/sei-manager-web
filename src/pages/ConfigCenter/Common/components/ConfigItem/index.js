import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Card, Drawer, Popconfirm, Popover } from 'antd';
import { ExtTable, BannerTitle, ExtIcon, ListCard, AuthAction, utils } from 'suid';
import { UseStatus } from '@/components';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH, USER_STATUS } = constants;
const { authAction } = utils;

@connect(({ configCommon, loading }) => ({ configCommon, loading }))
class ConfigItem extends Component {
  static tableRef;

  static syncEvnData;

  constructor(props) {
    super(props);
    this.syncEvnData = [];
    this.state = {
      selectedRowKeys: [],
      delRowId: null,
      showEvnSync: false,
    };
  }

  componentWillUnmount() {
    this.syncEvnData = [];
  }

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handlerSelectRow = selectedRowKeys => {
    this.setState({
      selectedRowKeys,
    });
  };

  handlerClearSelect = () => {
    this.setState({
      selectedRowKeys: [],
    });
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCommon/updateState',
      payload: {
        showFormModal: true,
        currentConfigItem: null,
      },
    });
  };

  edit = currentConfigItem => {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCommon/updateState',
      payload: {
        showFormModal: true,
        currentConfigItem,
      },
    });
  };

  save = (data, callback) => {
    const { dispatch, configCommon } = this.props;
    const { currentConfigItem } = configCommon;
    let action = 'saveConfig';
    if (currentConfigItem) {
      action = 'saveConfigItem';
    }
    dispatch({
      type: `configCommon/${action}`,
      payload: data,
      callback: res => {
        if (res.success) {
          this.reloadData();
          if (callback && callback instanceof Function) {
            callback();
          }
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
          type: 'configCommon/delConfigItem',
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

  enableConfig = () => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configCommon/enableConfig',
      payload: selectedRowKeys,
      callback: res => {
        if (res.success) {
          this.reloadData();
          this.handlerClearSelect();
        }
      },
    });
  };

  disableConfig = () => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configCommon/disableConfig',
      payload: selectedRowKeys,
      callback: res => {
        if (res.success) {
          this.reloadData();
          this.handlerClearSelect();
        }
      },
    });
  };

  handlerSync = () => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    const data = [];
    this.syncEvnData.forEach(env => {
      selectedRowKeys.forEach(id => {
        data.push({
          envCode: env.code,
          envName: env.name,
          id,
        });
      });
    });
    dispatch({
      type: 'configCommon/syncConfigs',
      payload: data,
      callback: res => {
        if (res.success) {
          this.setState({ selectedRowKeys: [], showEvnSync: false });
          this.reloadData();
          this.handlerClearSelect();
        }
      },
    });
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCommon/updateState',
      payload: {
        showFormModal: false,
        currentConfigItem: null,
      },
    });
  };

  handlerEvnSync = showEvnSync => {
    this.setState({ showEvnSync });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (row.useStatus === USER_STATUS.NONE.key) {
      if (loading.effects['configCommon/delConfigItem'] && delRowId === row.id) {
        return <ExtIcon className="del-loading" type="loading" antd />;
      }
      return (
        <AuthAction>
          <Popconfirm
            authCode="DELETE"
            placement="topLeft"
            title={formatMessage({
              id: 'global.delete.confirm',
              defaultMessage: '确定要删除吗？提示：删除后不可恢复',
            })}
            onConfirm={() => this.del(row)}
          >
            <ExtIcon className="del" type="delete" antd />
          </Popconfirm>
        </AuthAction>
      );
    }
    return (
      <AuthAction>
        <ExtIcon authCode="DELETE" className="del disabled" type="delete" antd />
      </AuthAction>
    );
  };

  renderEvnVarList = () => {
    const {
      loading,
      configCommon: { envData, selectedEnv },
    } = this.props;
    const dataSource = envData.filter(env => env.code !== selectedEnv.code);
    const listProps = {
      searchProperties: ['code', 'remark'],
      showArrow: false,
      checkbox: true,
      pagination: false,
      showSearch: false,
      customTool: () => null,
      dataSource,
      itemField: {
        title: item => item.code,
        description: item => item.name,
      },
      onSelectChange: (_keys, items) => {
        this.syncEvnData = items;
        this.forceUpdate();
      },
    };
    const syncLoading = loading.effects['configCommon/syncConfigs'];
    return (
      <>
        <div className="tool-box">
          <AuthAction>
            <Popconfirm
              authCode="SYNC"
              disabled={syncLoading || this.syncEvnData.length === 0}
              title="确定要同步吗?"
              onConfirm={() => this.handlerSync()}
            >
              <Button loading={syncLoading} disabled={this.syncEvnData.length === 0} type="primary">
                开始同步
              </Button>
            </Popconfirm>
          </AuthAction>
        </div>
        <div className="env-box">
          <ListCard {...listProps} />
        </div>
      </>
    );
  };

  renderItemName = st => {
    return <UseStatus status={st} />;
  };

  render() {
    const { selectedRowKeys, showEvnSync } = this.state;
    const { loading, configCommon } = this.props;
    const { selectedEnv, currentConfigItem, showFormModal, envData } = configCommon;
    const hasSelected = selectedRowKeys.length > 0;
    const columns = [
      {
        title: '操作',
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_text, record) => (
          <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
            <AuthAction>
              <ExtIcon
                authCode="EDIT"
                className="edit"
                onClick={() => this.edit(record)}
                type="edit"
                antd
              />
            </AuthAction>
            {this.renderDelBtn(record)}
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'useStatus',
        width: 100,
        required: true,
        align: 'center',
        render: this.renderItemName,
      },
      {
        title: '键名',
        dataIndex: 'key',
        width: 220,
        required: true,
      },
      {
        title: '键值',
        dataIndex: 'value',
        width: 260,
        render: t => t || '-',
      },
      {
        title: '描述说明',
        dataIndex: 'remark',
        width: 360,
        render: t => t || '-',
      },
    ];
    if (!authAction([<span authCode="EDIT" />, <span authCode="DELETE" />])) {
      columns.splice(0, 1);
    }
    const enableConfigLoading = loading.effects['configCommon/enableConfig'];
    const disableConfigLoading = loading.effects['configCommon/disableConfig'];
    const syncConfigLoading = loading.effects['configCommon/syncConfigs'];
    const saving =
      loading.effects['configCommon/saveConfig'] || loading.effects['configCommon/saveConfigItem'];
    const toolBarProps = {
      left: (
        <>
          <AuthAction>
            <Button authCode="CREATE" type="primary" onClick={this.add}>
              新建配置键
            </Button>
          </AuthAction>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
          <Drawer
            placement="top"
            closable={false}
            mask={false}
            height={44}
            getContainer={false}
            style={{ position: 'absolute' }}
            visible={hasSelected}
          >
            <Button
              onClick={this.handlerClearSelect}
              disabled={enableConfigLoading || disableConfigLoading || syncConfigLoading}
            >
              取消
            </Button>
            <AuthAction>
              <Popconfirm
                authCode="DISABLED_KEY"
                disabled={enableConfigLoading || syncConfigLoading}
                title="确定要停用选择的项吗?"
                onConfirm={() => this.disableConfig()}
              >
                <Button
                  type="danger"
                  disabled={enableConfigLoading || syncConfigLoading}
                  loading={disableConfigLoading}
                >
                  停用
                </Button>
              </Popconfirm>
            </AuthAction>
            <AuthAction>
              <Popconfirm
                authCode="ENABLE_KEY"
                disabled={disableConfigLoading || syncConfigLoading}
                title="确定要启用选择的项吗?"
                onConfirm={() => this.enableConfig()}
              >
                <Button
                  disabled={disableConfigLoading || syncConfigLoading}
                  loading={enableConfigLoading}
                >
                  启用
                </Button>
              </Popconfirm>
            </AuthAction>
            <Popover
              overlayClassName={styles['sync-popover-box']}
              onVisibleChange={this.handlerEvnSync}
              visible={showEvnSync}
              destroyTooltipOnHide
              trigger="click"
              placement="rightTop"
              content={this.renderEvnVarList()}
              title="同步到环境"
            >
              <Button type="primary" ghost disabled={enableConfigLoading || disableConfigLoading}>
                同步到环境
              </Button>
            </Popover>
          </Drawer>
        </>
      ),
    };
    const extTableProps = {
      bordered: false,
      lineNumber: false,
      toolBar: toolBarProps,
      columns,
      checkbox: {
        rowCheck: false,
      },
      pagination: false,
      selectedRowKeys,
      onSelectRow: this.handlerSelectRow,
      onTableRef: ref => (this.tableRef = ref),
      searchPlaceHolder: '输入键名、键值、描述关键字',
      searchProperties: ['key', 'value', 'remark'],
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/sei-manager/generalConfig/findByEnv`,
        loaded: () => {
          this.setState({ selectedRowKeys: [] });
        },
      },
      cascadeParams: {
        envCode: get(selectedEnv, 'code'),
      },
    };
    const formModalProps = {
      selectedEnv,
      rowData: currentConfigItem,
      closeFormModal: this.closeFormModal,
      showModal: showFormModal,
      saving,
      save: this.save,
      envData,
    };
    return (
      <div className={cls(styles['common-config-box'])}>
        <Card
          title={<BannerTitle title={get(selectedEnv, 'name')} subTitle="配置键清单" />}
          bordered={false}
        >
          <ExtTable {...extTableProps} />
        </Card>
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default ConfigItem;
