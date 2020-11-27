import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get } from 'lodash';
import { Button, Input } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ListCard } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
const FILTER_FIELDS = [
  { fieldName: 'code', operator: 'EQ', value: null },
  { fieldName: 'name', operator: 'EQ', value: null },
  { fieldName: 'appName', operator: 'EQ', value: null },
  { fieldName: 'version', operator: 'EQ', value: null },
  { fieldName: 'remark', operator: 'EQ', value: null },
  { fieldName: 'gitUrl', operator: 'EQ', value: null },
  { fieldName: 'nameSpace', operator: 'EQ', value: null },
];

@connect(({ applicationModule, loading }) => ({ applicationModule, loading }))
class ApplicationModule extends Component {
  static tableRef;

  static listCardRef = null;

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handleColumnSearch = (selectedKeys, dataIndex, confirm) => {
    const { dispatch, applicationModule } = this.props;
    const { filter: originFilter } = applicationModule;
    const filter = { ...originFilter };
    Object.assign(filter, { [dataIndex]: selectedKeys[0] });
    confirm();
    dispatch({
      type: 'applicationModule/updateState',
      payload: {
        filter,
      },
    });
  };

  handleColumnSearchReset = (dataIndex, clearFilter) => {
    const { dispatch, applicationModule } = this.props;
    const { filter: originFilter } = applicationModule;
    const filter = { ...originFilter };
    Object.assign(filter, { [dataIndex]: '' });
    clearFilter();
    dispatch({
      type: 'applicationModule/updateState',
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
      const { applicationModule } = this.props;
      const { filter } = applicationModule;
      const appName = get(filter, 'appName') || '全部';
      const appListProps = {
        className: 'search-content',
        showArrow: false,
        showSearch: false,
        selectedKeys,
        rowKey: 'name',
        remotePaging: true,
        onSelectChange: keys => {
          setSelectedKeys(keys);
          this.handleColumnSearch(keys, dataIndex, confirm);
        },
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/sei-manager/application/findByPage`,
        },
        customTool: () => this.renderCustomTool(dataIndex, clearFilters),
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
              onClick={() => this.handleColumnSearchReset(dataIndex, clearFilters)}
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
    const { applicationModule } = this.props;
    const { filter } = applicationModule;
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

  render() {
    const columns = [
      {
        title: '应用名称',
        dataIndex: 'appName',
        width: 160,
        required: true,
        ...this.getColumnSearchProps('appName'),
      },
      {
        title: '模块代码',
        dataIndex: 'code',
        width: 120,
        required: true,
        ...this.getColumnSearchProps('code'),
      },
      {
        title: '模块名称',
        dataIndex: 'name',
        width: 260,
        required: true,
        ...this.getColumnSearchProps('name'),
      },
      {
        title: '模块版本',
        dataIndex: 'version',
        width: 120,
        ...this.getColumnSearchProps('version'),
      },
      {
        title: '描述说明',
        dataIndex: 'remark',
        width: 320,
        required: true,
        ...this.getColumnSearchProps('remark'),
      },
      {
        title: 'Git地址',
        dataIndex: 'gitUrl',
        width: 420,
        required: true,
        ...this.getColumnSearchProps('gitUrl'),
      },
      {
        title: '命名空间(包路径)',
        dataIndex: 'nameSpace',
        width: 320,
        required: true,
        ...this.getColumnSearchProps('nameSpace'),
      },
    ];
    const toolBarProps = {
      left: (
        <>
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
      showSearchTooltip: true,
      searchPlaceHolder: '模块代码、模块名称、描述说明、Git地址、命名空间(包路径)',
      searchProperties: ['code', 'name', 'remark', 'gitUrl', 'nameSpace'],
      searchWidth: 260,
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/sei-manager/appModule/findByPage`,
      },
      cascadeParams: {
        ...this.getFilter(),
      },
      sort: {
        multiple: true,
        field: {
          name: 'asc',
          version: 'asc',
          code: null,
          remark: null,
          gitUrl: null,
          nameSpace: null,
        },
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
      </div>
    );
  }
}

export default ApplicationModule;