/* eslint-disable no-new */
import React, { Component } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Drawer } from 'antd';
import { BannerTitle, ExtIcon, ListLoader, ScrollBar } from 'suid';
import { CodeDiff } from '@/components';
import styles from './index.less';

class AppCompare extends Component {
  static propTypes = {
    selectedApp: PropTypes.object,
    selectedEnv: PropTypes.object,
    targetCompareEvn: PropTypes.object,
    showCompare: PropTypes.bool,
    handlerClose: PropTypes.func,
    compareData: PropTypes.object,
    compareLoading: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const { compareData } = props;
    this.state = {
      currentConfig: get(compareData, 'currentConfig') || '',
      targetConfig: get(compareData, 'targetConfig') || '',
    };
  }

  componentDidMount() {
    this.resize();
  }

  componentDidUpdate(preProps) {
    const { compareData } = this.props;
    if (!isEqual(preProps.compareData, compareData)) {
      this.setState({
        currentConfig: get(compareData, 'currentConfig') || '',
        targetConfig: get(compareData, 'targetConfig') || '',
      });
    }
  }

  renderMasterTitle = (title, currentEnvName, targetEnvName) => {
    return (
      <>
        {title}
        <span style={{ color: '#029688', marginLeft: 16 }}>{currentEnvName}</span>
        <span style={{ fontSize: 14 }}>(当前)</span>
        <ExtIcon type="swap-right" style={{ margin: '0 4px' }} antd />
        <span style={{ color: '#357bd8' }}>{targetEnvName}</span>
        <span style={{ fontSize: 14 }}>(目标)</span>
      </>
    );
  };

  renderTitle = () => {
    const { selectedApp, selectedEnv, targetCompareEvn, handlerClose } = this.props;
    const title = get(selectedApp, 'name');
    const currentEnvName = get(selectedEnv, 'name');
    const targetEnvName = get(targetCompareEvn, 'name');
    return (
      <>
        <ExtIcon onClick={handlerClose} type="left" className="trigger-back" antd />
        <BannerTitle
          title={this.renderMasterTitle(title, currentEnvName, targetEnvName)}
          subTitle="比较结果"
        />
      </>
    );
  };

  resize = () => {
    setTimeout(() => {
      const winResize = new Event('resize');
      window.dispatchEvent(winResize);
    }, 300);
  };

  handlerComplete = ace => {
    if (ace) {
      this.resize();
    }
  };

  render() {
    const { currentConfig, targetConfig } = this.state;
    const { compareLoading, showCompare, handlerClose } = this.props;
    return (
      <Drawer
        width="100%"
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showCompare}
        title={this.renderTitle()}
        className={cls(styles['app-compare-box'])}
        onClose={handlerClose}
        style={{ position: 'absolute' }}
      >
        <div className={cls('body-content', 'auto-height')}>
          {compareLoading ? (
            <ListLoader />
          ) : (
            <ScrollBar>
              <CodeDiff context={100000} oldText={currentConfig} newText={targetConfig} />
            </ScrollBar>
          )}
        </div>
      </Drawer>
    );
  }
}

export default AppCompare;
