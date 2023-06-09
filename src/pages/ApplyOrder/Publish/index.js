import React, { PureComponent } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { trim, get } from 'lodash';
import { Button, Modal, Input } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, message, ListCard } from 'suid';
import { constants } from '@/utils';
import { JenkinsState } from '@/components';
import ApplyState from '../components/ApplyState';
import ExtAction from './ExtAction';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH, APPLY_APPLICATION_ACTION } = constants;
const { TextArea, Search } = Input;
const FILTER_FIELDS = [
  { fieldName: 'name', operator: 'LK', value: null },
  { fieldName: 'appId', operator: 'EQ', value: null },
  { fieldName: 'moduleName', operator: 'LK', value: null },
];

@connect(({ applyPublish, loading }) => ({ applyPublish, loading }))
class ApplyPublish extends PureComponent {
  static tableRef;

  static messageText;

  static confirmModal;

  static listCardRef = null;

  constructor(props) {
    super(props);
    this.state = {
      appName: '全部',
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'applyPublish/updateState',
      payload: {
        filter: {},
      },
    });
  }

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'applyPublish/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    let action = 'createSave';
    if (data.id) {
      action = 'editSave';
    }
    dispatch({
      type: `applyPublish/${action}`,
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  saveToApprove = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'applyPublish/saveToApprove',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'applyPublish/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  approve = rowData => {
    const { dispatch } = this.props;
    message.loading('正在提交审核...');
    dispatch({
      type: 'applyPublish/approve',
      payload: {
        ...rowData,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'applyPublish/updateState',
      payload: {
        onlyView: false,
        showModal: false,
        rowData: null,
      },
    });
  };

  handlerAction = (key, rowData) => {
    const { dispatch } = this.props;
    switch (key) {
      case APPLY_APPLICATION_ACTION.VIEW:
        dispatch({
          type: 'applyPublish/updateState',
          payload: {
            onlyView: true,
            showModal: true,
          },
        });
        dispatch({
          type: 'applyPublish/getPublish',
          payload: {
            id: rowData.relationId,
          },
        });
        break;
      case APPLY_APPLICATION_ACTION.EDIT:
        dispatch({
          type: 'applyPublish/updateState',
          payload: {
            showModal: true,
          },
        });
        dispatch({
          type: 'applyPublish/getPublish',
          payload: {
            showModal: true,
            id: rowData.relationId,
          },
        });
        break;
      case APPLY_APPLICATION_ACTION.DELETE:
        this.delConfirm(rowData);
        break;
      case APPLY_APPLICATION_ACTION.APPROVE:
        this.approve(rowData);
        break;
      case APPLY_APPLICATION_ACTION.STOP_APPROVE:
        this.stopApprove(rowData);
        break;
      default:
    }
  };

  handlerMessageText = e => {
    this.messageText = trim(e.target.value);
  };

  stopApprove = rowData => {
    const { dispatch } = this.props;
    this.confirmModal = Modal.confirm({
      title: '终止审核确认',
      content: (
        <TextArea
          style={{ resize: 'none' }}
          placeholder="请输入终止审核的原因"
          rows={3}
          onChange={this.handlerMessageText}
        />
      ),
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          if (this.messageText) {
            this.confirmModal.update({
              okButtonProps: { type: 'primary', loading: true },
              cancelButtonProps: { disabled: true },
            });
            dispatch({
              type: 'applyPublish/stopApprove',
              payload: {
                id: rowData.id,
                messageText: this.messageText,
              },
              callback: res => {
                if (res.success) {
                  message.destroy();
                  resolve();
                  this.reloadData();
                } else {
                  this.confirmModal.update({
                    okButtonProps: { loading: false },
                    cancelButtonProps: { disabled: false },
                  });
                }
              },
            });
          } else {
            message.destroy();
            message.error('请输入终止审核原因');
            this.confirmModal.update({
              okButtonProps: { loading: false },
              cancelButtonProps: { disabled: false },
            });
          }
        });
      },
      cancelText: '取消',
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  delConfirm = rowData => {
    const { dispatch } = this.props;
    this.confirmModal = Modal.confirm({
      title: `删除确认`,
      content: `提示：申请删除后不可恢复!`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          dispatch({
            type: 'applyPublish/del',
            payload: {
              id: rowData.relationId,
            },
            callback: res => {
              if (res.success) {
                resolve();
                this.reloadData();
              } else {
                this.confirmModal.update({
                  okButtonProps: { loading: false },
                  cancelButtonProps: { disabled: false },
                });
              }
            },
          });
        });
      },
      cancelText: '取消',
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  handleColumnSearch = (selectedKeys, dataIndex, confirm) => {
    const { dispatch, applyPublish } = this.props;
    const { filter: originFilter } = applyPublish;
    const filter = { ...originFilter };
    Object.assign(filter, { [dataIndex]: selectedKeys[0] });
    confirm();
    dispatch({
      type: 'applyPublish/updateState',
      payload: {
        filter,
      },
    });
  };

  handleColumnSearchReset = (dataIndex, clearFilter) => {
    const { dispatch, applyPublish } = this.props;
    const { filter: originFilter } = applyPublish;
    const filter = { ...originFilter };
    Object.assign(filter, { [dataIndex]: '' });
    clearFilter();
    dispatch({
      type: 'applyPublish/updateState',
      payload: {
        filter,
      },
    });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerPressEnter = () => {
    this.listCardRef.handlerPressEnter();
  };

  handlerSearch = v => {
    this.listCardRef.handlerSearch(v);
  };

  renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入代码或名称关键字"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  getColumnSearchComponent = (dataIndex, setSelectedKeys, selectedKeys, confirm, clearFilters) => {
    if (dataIndex === 'appName') {
      const { appName } = this.state;
      const appListProps = {
        className: 'search-content',
        showArrow: false,
        showSearch: false,
        selectedKeys,
        remotePaging: true,
        onSelectChange: (keys, items) => {
          setSelectedKeys(keys);
          this.setState({ appName: items[0].name });
          this.handleColumnSearch(keys, 'appId', confirm);
        },
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/sei-manager/application/findByPage`,
          params: {
            filters: [{ fieldName: 'frozen', operator: 'EQ', value: false }],
          },
        },
        customTool: () => this.renderCustomTool('appId', clearFilters),
        onListCardRef: ref => (this.listCardRef = ref),
        itemField: {
          title: item => item.name,
          description: item => item.code,
        },
      };
      return (
        <div
          style={{
            padding: 8,
            maxHeight: 520,
            height: 520,
            width: 320,
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              height: 42,
              padding: '0 24px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>{appName}</div>
            <Button
              onClick={() => {
                this.setState({ appName: '全部' });
                this.handleColumnSearchReset('appId', clearFilters);
              }}
              style={{ marginLeft: 8 }}
            >
              重置
            </Button>
          </div>
          <div className="list-body" style={{ height: 462 }}>
            <ListCard {...appListProps} />
          </div>
        </div>
      );
    }
    return (
      <div style={{ padding: 8, width: 320, boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder="输入关键字查询"
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleColumnSearch(selectedKeys, dataIndex, confirm)}
          style={{ width: '100%', marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleColumnSearch(selectedKeys, dataIndex, confirm)}
          icon="search"
          size="small"
          style={{ width: 70, marginRight: 8 }}
        >
          搜索
        </Button>
        <Button
          onClick={() => this.handleColumnSearchReset(dataIndex, clearFilters)}
          size="small"
          style={{ width: 70 }}
        >
          重置
        </Button>
      </div>
    );
  };

  getColumnSearchProps = dataIndex => {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) =>
        this.getColumnSearchComponent(
          dataIndex,
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        ),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => {
            if (this.searchInput) {
              this.searchInput.select();
            }
          });
        }
      },
    };
  };

  getFilter = () => {
    const { applyPublish } = this.props;
    const { filter } = applyPublish;
    const filters = [];
    FILTER_FIELDS.forEach(f => {
      const value = get(filter, f.fieldName, null) || null;
      if (value !== null) {
        const param = { ...f };
        Object.assign(param, { value });
        filters.push(param);
      }
    });
    return { filters };
  };

  renderColumnAppName = () => {
    const { appName } = this.state;
    return `应用(${appName})`;
  };

  getTagContent = tagId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'applyPublish/getTag',
      payload: {
        id: tagId,
      },
    });
  };

  render() {
    const { applyPublish, loading } = this.props;
    const {
      showModal,
      rowData,
      onlyView,
      versionTypeData,
      flowNodeData,
      tagContent,
    } = applyPublish;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 60,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        fixed: 'left',
        render: (id, record) => (
          <span className={cls('action-box')}>
            <ExtAction key={id} onAction={this.handlerAction} recordItem={record} />
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'approvalStatus',
        width: 160,
        required: true,
        render: (_, r) => <ApplyState item={r} />,
      },
      {
        title: '构建状态',
        dataIndex: 'buildStatus',
        width: 100,
        required: true,
        render: t => <JenkinsState state={t} />,
      },
      {
        title: '发版主题',
        dataIndex: 'name',
        width: 250,
        required: true,
        ...this.getColumnSearchProps('name'),
      },
      {
        title: this.renderColumnAppName(),
        dataIndex: 'appName',
        width: 200,
        required: true,
        ...this.getColumnSearchProps('appName'),
      },
      {
        title: '模块名称',
        dataIndex: 'moduleName',
        width: 240,
        required: true,
        ...this.getColumnSearchProps('moduleName'),
      },
      {
        title: '申请版本',
        dataIndex: 'version',
        width: 120,
        required: true,
      },
    ];
    const formModalProps = {
      save: this.save,
      onlyView,
      rowData,
      showModal,
      flowNodeData,
      versionTypeData,
      closeFormModal: this.closeFormModal,
      dataLoading: loading.effects['applyPublish/getPublish'],
      saving:
        loading.effects['applyPublish/createSave'] || loading.effects['applyPublish/editSave'],
      saveToApprove: this.saveToApprove,
      saveToApproving: loading.effects['applyPublish/saveToApprove'],
      tagContent,
      getTagContent: this.getTagContent,
      loadingTagContent: loading.effects['applyPublish/getTag'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add}>
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      onTableRef: ref => (this.tableRef = ref),
      showSearchTooltip: false,
      searchPlaceHolder: '请输入发版主题关键字查询',
      searchProperties: ['name'],
      searchWidth: 260,
      remotePaging: true,
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        ...this.getFilter(),
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/sei-manager/releaseVersion/findRequisitionByPage`,
      },
      sort: {
        field: {
          name: 'desc',
        },
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default ApplyPublish;
