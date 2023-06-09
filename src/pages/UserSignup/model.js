/*
 * @Author: Eason
 * @Date:   2020-01-16 09:17:05
 * @Last Modified by: Eason
 * @Last Modified time: 2020-12-22 10:37:00
 */
import { utils, message } from 'suid';
import { getVerifyCode, goSignup, registVerify, getMailServer } from './service';

const { pathMatchRegexp, dvaModel, getUUID } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'userSignup',
  state: {
    loginReqId: getUUID(),
    verifyCode: null,
    verifyTip: '',
    successTip: '',
    suffixHostData: [],
    defaultMailHost: '',
    sign: '',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/userSignup', location.pathname)) {
          dispatch({
            type: 'getVerifyCode',
          });
          dispatch({
            type: 'getMailServer',
          });
        }
      });
    },
  },
  effects: {
    *getMailServer(_, { call, put }) {
      const re = yield call(getMailServer);
      if (re.success) {
        const mailData = re.data || [];
        const suffixHostData = mailData.map((m, idx) => {
          return {
            id: idx,
            host: m,
          };
        });
        yield put({
          type: 'updateState',
          payload: {
            defaultMailHost: suffixHostData.length > 0 ? suffixHostData[0].host : '',
            suffixHostData,
          },
        });
      } else {
        message.destroy();
        message.error(re.message);
      }
    },
    *getVerifyCode(_, { call, put, select }) {
      const { loginReqId } = yield select(sel => sel.userSignup);
      const result = yield call(getVerifyCode, { reqId: loginReqId });
      const { success, data, message: msg } = result || {};
      if (success) {
        yield put({
          type: 'updateState',
          payload: {
            verifyCode: data,
          },
        });
      } else {
        message.destroy();
        message.error(msg);
      }
    },
    *registVerify({ payload, callback }, { call, select, put }) {
      const { loginReqId } = yield select(sel => sel.userSignup);
      const re = yield call(registVerify, { reqId: loginReqId, ...payload });
      const { success, message: msg, data } = re || {};
      if (success) {
        yield put({
          type: 'updateState',
          payload: {
            successTip: '',
            verifyTip: msg,
            sign: data,
          },
        });
      } else {
        message.destroy();
        message.error(msg);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *goSignup({ payload, callback }, { call, select, put }) {
      const { sign } = yield select(sel => sel.userSignup);
      const re = yield call(goSignup, { reqId: sign, email: 'test', ...payload });
      const { success, message: msg } = re || {};
      if (success) {
        yield put({
          type: 'updateState',
          payload: {
            successTip: msg,
          },
        });
      } else {
        message.destroy();
        message.error(msg);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
