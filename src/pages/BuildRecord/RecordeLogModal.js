import React, { PureComponent } from 'react';
import cls from 'classnames';
import { PubSub } from 'pubsub-js';
import copy from 'copy-to-clipboard';
import { get, includes, isEqual } from 'lodash';
import { Modal, Layout, Descriptions, Steps, Card } from 'antd';
import { ListLoader, BannerTitle, ExtIcon, utils, message } from 'suid';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-kuroir';
import { JenkinsState } from '@/components';
import { wsocket, constants } from '@/utils';
import styles from './RecordeLogModal.less';

const { Sider, Content } = Layout;
const { Step } = Steps;
const { getUUID } = utils;
const { WSBaseUrl, JENKINS_STATUS } = constants;
const { closeWebSocket, createWebSocket } = wsocket;

class RecordeLogModal extends PureComponent {
  static ace;

  static aceId;

  static messageSocket;

  static stages;

  static propTypes = {
    title: PropTypes.string,
    logData: PropTypes.object,
    dataLoading: PropTypes.bool,
    showModal: PropTypes.bool,
    closeFormModal: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.aceId = getUUID();
    this.stages = [];
    this.state = {
      currentStage: 0,
      stageStatus: [],
      buildLog: '',
      building: false,
      buildStatus: '',
    };
  }

  componentDidUpdate(preProps) {
    const { logData } = this.props;
    if (!isEqual(preProps.logData, logData) && logData) {
      const buildLog = get(logData, 'buildLog') || '';
      const state = this.getFieldValue('buildStatus');
      this.stages = get(logData, 'stages') || [];
      let building = false;
      if (state === JENKINS_STATUS.BUILDING.name) {
        building = true;
        const id = get(logData, 'id') || null;
        const url = `${WSBaseUrl}/sei-manager/websocket/buildLog/${id}`;
        createWebSocket(url);
        this.messageSocket = PubSub.subscribe('message', (topic, msgObj) => {
          // message 为接收到的消息  这里进行业务处理
          if (topic === 'message') {
            const { buildLog: prevBuildLog } = this.state;
            const wsLog = get(msgObj, 'buildLog') || '';
            this.setState({ buildLog: `${prevBuildLog}${wsLog}` }, () => {
              this.counterStep();
              this.resize();
              const lineNumber = this.ace.session.getLength();
              this.ace.gotoLine(lineNumber);
            });
          }
        });
      }
      this.setState({ buildLog, building, buildStatus: state }, () => {
        this.counterStep();
        this.resize();
      });
    }
  }

  componentWillUnmount() {
    closeWebSocket();
    PubSub.unsubscribe(this.messageSocket);
  }

  resize = () => {
    setTimeout(() => {
      const resize = new Event('resize');
      window.dispatchEvent(resize);
    }, 300);
  };

  closeFormModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal) {
      closeFormModal();
      closeWebSocket();
      PubSub.unsubscribe(this.messageSocket);
    }
  };

  handlerCopy = text => {
    copy(text);
    message.success(`已复制到粘贴板`);
  };

  getFieldValue = fieldName => {
    const { logData } = this.props;
    return get(logData, fieldName) || '-';
  };

  counterStep = () => {
    const { buildLog, buildStatus: prevBuildStatus, building: preBuilding } = this.state;
    let currentStage = 0;
    const stageStatus = [];
    for (let i = 0; i < this.stages.length; i += 1) {
      const { name } = this.stages[i];
      if (includes(buildLog, name)) {
        currentStage = i;
        stageStatus.push('finish');
      } else {
        stageStatus.push('wait');
      }
    }
    let buildStatus = prevBuildStatus;
    let building = preBuilding;
    if (includes(buildLog, `Finished`)) {
      building = false;
    }
    if (includes(buildLog, `Finished: ${JENKINS_STATUS.SUCCESS.name}`)) {
      buildStatus = JENKINS_STATUS.SUCCESS.name;
    }
    if (includes(buildLog, `Finished: ${JENKINS_STATUS.FAILURE.name}`)) {
      buildStatus = JENKINS_STATUS.FAILURE.name;
    }
    this.setState({ currentStage, stageStatus, buildStatus, building });
  };

  getCurrentStageStatus = () => {
    const { buildLog } = this.state;
    if (includes(buildLog, `Finished: ${JENKINS_STATUS.SUCCESS.name}`)) {
      return JENKINS_STATUS.SUCCESS.stepResult;
    }
    if (includes(buildLog, `Finished: ${JENKINS_STATUS.FAILURE.name}`)) {
      return JENKINS_STATUS.FAILURE.stepResult;
    }
    return 'process';
  };

  handlerComplete = ace => {
    this.ace = ace;
    if (ace) {
      const { buildLog } = this.state;
      ace.setOptions({ value: buildLog || '暂无构建日志!' });
    }
  };

  renderStages = () => {
    const { currentStage, buildLog, building, stageStatus } = this.state;
    return (
      <>
        <div className="step-box">
          <Steps current={currentStage} labelPlacement="horizontal">
            {this.stages.map((item, idx) => (
              <Step
                key={item.id}
                icon={
                  idx === currentStage && building ? (
                    <ExtIcon type="sync" antd spin style={{ marginRight: 4 }} />
                  ) : null
                }
                status={idx === currentStage ? this.getCurrentStageStatus() : stageStatus[idx]}
                title={item.name}
                description={item.remark}
              />
            ))}
          </Steps>
        </div>
        <div className="log-box">
          <div className="log-header">
            构建日志-Console Output
            <ExtIcon
              type="copy"
              className="copy-btn"
              antd
              tooltip={{ title: '复制内容到粘贴板' }}
              onClick={() => this.handlerCopy(buildLog)}
            />
          </div>
          <div className="log-content">
            <AceEditor
              mode="markdown"
              theme="kuroir"
              name={this.aceId}
              fontSize={14}
              readOnly
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={false}
              width="100%"
              height="100%"
              onLoad={this.handlerComplete}
              value={buildLog || '暂无构建日志!'}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: false,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </>
    );
  };

  renderTitle = () => {
    const { title } = this.props;
    return (
      <>
        <ExtIcon onClick={this.closeFormModal} type="left" className="trigger-back" antd />
        <BannerTitle title={title} subTitle="构建详情" />
      </>
    );
  };

  renderLogContent = () => {
    const { buildStatus } = this.state;
    return (
      <Layout className="auto-height">
        <Sider width={360} className="auto-height left-content" theme="light">
          <Card className="auto-height" bordered={false} title={this.renderTitle()}>
            <Descriptions column={1} colon={false}>
              <Descriptions.Item label="构建状态">
                <JenkinsState state={buildStatus} />
              </Descriptions.Item>
              <Descriptions.Item label="目标环境">
                {`${this.getFieldValue('envName')}(${this.getFieldValue('envCode')})`}
              </Descriptions.Item>
              <Descriptions.Item label="应用名称">
                {this.getFieldValue('appName')}
              </Descriptions.Item>
              <Descriptions.Item label="模块名称">
                {`${this.getFieldValue('moduleName')}(${this.getFieldValue('moduleCode')})`}
              </Descriptions.Item>
              <Descriptions.Item label="标签名称">
                {this.getFieldValue('tagName')}
              </Descriptions.Item>
              <Descriptions.Item label="期望完成时间">
                {this.getFieldValue('expCompleteTime')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Sider>
        <Content className={cls('main-content', 'auto-height', 'vertical')}>
          {this.renderStages()}
        </Content>
      </Layout>
    );
  };

  render() {
    const { showModal, dataLoading } = this.props;
    return (
      <Modal
        destroyOnClose
        visible={showModal}
        centered
        onCancel={this.closeFormModal}
        closable={false}
        wrapClassName={styles['build-box']}
        footer={null}
      >
        {dataLoading ? <ListLoader /> : this.renderLogContent()}
      </Modal>
    );
  }
}

export default RecordeLogModal;
