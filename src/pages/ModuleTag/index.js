import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import copy from 'copy-to-clipboard';
import { Input, Empty, Layout } from 'antd';
import { ListCard, message, ExtIcon } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '@/utils';
import TagList from './components/TagList';
import DropdownApp from './components/DropdownApp';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
const { Sider, Content } = Layout;
const FILTER_FIELDS = [{ fieldName: 'appId', operator: 'EQ', value: null }];

@connect(({ moduleTag, loading }) => ({ moduleTag, loading }))
class ModuleTag extends Component {
  static listCardRef = null;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'moduleTag/updateState',
      payload: {
        currentModule: null,
        moduleFilter: {},
      },
    });
  }

  reloadModuleData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  handlerModuleSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentModule = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'moduleTag/updateState',
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

  closeAssignUsers = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'moduleTag/updateState',
      payload: {
        showTagModal: false,
      },
    });
  };

  handlerAppChange = appId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'moduleTag/updateState',
      payload: {
        moduleFilter: { appId },
      },
    });
  };

  getFilter = () => {
    const { moduleTag } = this.props;
    const { moduleFilter } = moduleTag;
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

  handlerCopy = text => {
    copy(text);
    message.success(`已复制到粘贴板`);
  };

  renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入代码、名称关键字查询"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: 220 }}
      />
      <DropdownApp onAction={this.handlerAppChange} />
    </>
  );

  renderModuleName = item => {
    return (
      <>
        {item.name}
        <span
          style={{ marginLeft: 4, fontSize: 12, color: '#999' }}
        >{`版本：${item.version}`}</span>
        <ExtIcon
          type="copy"
          className="copy-btn"
          style={{ marginLeft: 4 }}
          antd
          tooltip={{ title: '复制Git地址到粘贴板' }}
          onClick={e => {
            e.stopPropagation();
            this.handlerCopy(item.gitHttpUrl);
          }}
        />
      </>
    );
  };

  render() {
    const { moduleTag } = this.props;
    const { currentModule } = moduleTag;
    const moduleProps = {
      className: 'left-content',
      title: '模块列表',
      showSearch: false,
      onSelectChange: this.handlerModuleSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['remark', 'name'],
      itemField: {
        title: this.renderModuleName,
        description: item => item.remark,
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
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={460} className="auto-height" theme="light">
            <ListCard {...moduleProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 8 }}>
            {currentModule ? (
              <TagList />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="可选择模块进行标签管理" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default ModuleTag;
