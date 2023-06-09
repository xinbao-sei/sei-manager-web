import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Input, Empty, Layout, Tooltip } from 'antd';
import { ListCard, ListLoader } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '@/utils';
import DropdownApp from './components/DropdownApp';
import RedefinedType from './components/RedefinedTypes';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
const { Sider, Content } = Layout;
const FILTER_FIELDS = [{ fieldName: 'appId', operator: 'EQ', value: null }];

@connect(({ flowRedefined, loading }) => ({ flowRedefined, loading }))
class FlowRedefined extends Component {
  static listCardRef = null;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowRedefined/updateState',
      payload: {
        currentModule: null,
        moduleFilter: {},
      },
    });
  }

  handlerModuleSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentModule = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'flowRedefined/getFlowInstanceTask',
      payload: {
        currentModule,
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

  handlerAppChange = appId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowRedefined/updateState',
      payload: {
        moduleFilter: { appId },
      },
    });
  };

  getFilter = () => {
    const { flowRedefined } = this.props;
    const { moduleFilter } = flowRedefined;
    const filters = [{ fieldName: 'frozen', operator: 'EQ', value: false }];
    FILTER_FIELDS.forEach(f => {
      const value = get(moduleFilter, f.fieldName, null) || null;
      if (value !== null && value !== '') {
        const param = { ...f };
        Object.assign(param, { value });
        filters.push(param);
      }
    });
    return { filters };
  };

  handlerTabChange = currentTabKey => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowRedefined/updateState',
      payload: {
        currentTabKey,
      },
    });
    this.refreshNodeData();
  };

  refreshNodeData = () => {
    const { dispatch, flowRedefined } = this.props;
    const { currentModule } = flowRedefined;
    dispatch({
      type: 'flowRedefined/getFlowInstanceTask',
      payload: {
        currentModule,
      },
    });
  };

  handlerSaveInstanceTask = (data, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowRedefined/saveInstanceTask',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          callback();
          this.refreshNodeData();
        }
      },
    });
  };

  renderCustomTool = () => (
    <>
      <DropdownApp onAction={this.handlerAppChange} />
      <Tooltip title="输入代码、名称、描述关键字查询">
        <Search
          allowClear
          placeholder="代码、名称、描述"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerPressEnter}
          style={{ width: 160 }}
        />
      </Tooltip>
    </>
  );

  renderModuleDesc = item => {
    return (
      <>
        <div>{`版本：${item.version}`}</div>
        <div>{`描述：${item.remark}`}</div>
      </>
    );
  };

  render() {
    const { flowRedefined, loading } = this.props;
    const { currentModule, redefinedTypeData, currentTabKey, typeNodeData } = flowRedefined;
    const saving = loading.effects['flowRedefined/saveInstanceTask'];
    const refreshing = loading.effects['flowRedefined/getFlowInstanceTask'];
    const moduleProps = {
      className: 'left-content',
      title: '模块列表',
      showSearch: false,
      onSelectChange: this.handlerModuleSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['remark', 'name', 'code'],
      itemField: {
        title: item => `${item.name}(${item.code})`,
        description: this.renderModuleDesc,
      },
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/sei-manager/appModule/findByPage`,
      },
      cascadeParams: {
        ...this.getFilter(),
      },
    };
    const redefinedTypeProps = {
      redefinedTypeData,
      currentModule,
      currentTabKey,
      onTabChange: this.handlerTabChange,
      typeNodeData,
      refreshNodeData: this.refreshNodeData,
      refreshing,
      saving,
      save: this.handlerSaveInstanceTask,
    };
    const initing = loading.effects['flowRedefined/getRedefinedTypes'];
    return (
      <>
        {initing ? (
          <ListLoader />
        ) : (
          <div className={cls(styles['container-box'])}>
            <Layout className="auto-height">
              <Sider width={420} className="auto-height" theme="light">
                <ListCard {...moduleProps} />
              </Sider>
              <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
                {currentModule ? (
                  <RedefinedType {...redefinedTypeProps} />
                ) : (
                  <div className="blank-empty">
                    <Empty image={empty} description="可选择模块进行评审配置" />
                  </div>
                )}
              </Content>
            </Layout>
          </div>
        )}
      </>
    );
  }
}
export default FlowRedefined;
