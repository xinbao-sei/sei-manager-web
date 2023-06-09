import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 配置新建保存 */
export async function saveConfig(data) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/addConfig`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 配置修改保存 */
export async function saveConfigItem(data) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 配置项删除 */
export async function delConfigItem(params) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 批量停用配置 */
export async function disableConfig(data) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/disableConfig`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 批量启用配置 */
export async function enableConfig(data) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/enableConfig`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 同步配置到多环境 */
export async function syncConfigs(data) {
  const url = `${SERVER_PATH}/sei-manager/appConfig/syncConfigs`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 发布前比较 */
export async function compareBeforeRelease(data) {
  const { appCode, envCode } = data;
  const url = `${SERVER_PATH}/sei-manager/appConfig/compareBeforeRelease/${appCode}/${envCode}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}

/** 发布前比较 */
export async function appRelease(data) {
  const { appCode, envCode } = data;
  const url = `${SERVER_PATH}/sei-manager/appConfig/release/${appCode}/${envCode}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}

/** 获取应用yaml格式配置 */
export async function getYamlData(data) {
  const { appCode, envCode } = data;
  const url = `${SERVER_PATH}/sei-manager/appConfig/getYamlData/${appCode}/${envCode}`;
  return request({
    url,
  });
}

/** 保存应用yaml格式配置 */
export async function saveYamlData(data) {
  const { yamlText, appCode, envCode } = data;
  const url = `${SERVER_PATH}/sei-manager/appConfig/saveYamlData/${appCode}/${envCode}`;
  return request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;',
    },
    data: yamlText,
  });
}

/** 获取应用运行时的配置 */
export async function getAppRuntimeConfig(data) {
  const { appCode, envCode } = data;
  const url = `${SERVER_PATH}/sei-manager/configserver/${appCode}/${envCode}`;
  return request({
    url,
  });
}

/** 跨环境比较 */
export async function getCompareData(data) {
  const { appCode, currentEnv, targetEnv } = data;
  const url = `${SERVER_PATH}/sei-manager/releaseHistory/crossEnvCompare/${appCode}/${currentEnv}/${targetEnv}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}

/** 获取所有项目组 */
export async function getProjectList(params) {
  const url = `${SERVER_PATH}/sei-manager/projectGroup/getGroupTree`;
  return request({
    url,
    method: 'GET',
    params,
  });
}
