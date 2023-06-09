const routes = [
  {
    path: '/user',
    component: '../layouts/TempLoginLayout',
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './Login',
      },
    ],
  },
  {
    name: '用户注册',
    path: '/userSignup',
    component: './UserSignup',
  },
  {
    name: '忘记密码',
    path: '/userForgotPassword',
    component: './ForgotPassword',
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['./src/components/PrivateRoute'],
    routes: [
      {
        path: '/',
        redirect: '/dashBoard',
      },
      {
        path: '/dashBoard',
        name: 'Dashboard',
        component: './Dashboard',
      },
      {
        path: '/deploy',
        namd: '部署管理',
        routes: [
          {
            path: '/deploy/certificate',
            name: '凭证管理',
            component: './Certificate',
          },
          {
            path: '/deploy/serverNode',
            name: '服务器节点管理',
            component: './ServerNode',
          },
          {
            path: '/deploy/deployStage',
            name: '部署阶段管理',
            component: './DeployStage',
          },
          {
            path: '/deploy/deployTemplate',
            name: '部署模板管理',
            component: './DeployTemplate',
          },
        ],
      },
      {
        path: '/auth',
        namd: '系统配置',
        routes: [
          {
            path: '/auth/env',
            name: '环境管理',
            component: './Env',
          },
          {
            path: '/auth/feature',
            name: '功能项',
            component: './Feature',
          },
          {
            path: '/auth/menu',
            name: '菜单管理',
            component: './Menu',
          },
          {
            path: '/auth/featureRole',
            name: '角色管理',
            component: './FeatureRole',
          },
          {
            path: '/auth/userGroup',
            name: '用户组',
            component: './UserGroup',
          },
          {
            path: '/auth/userList',
            name: '用户',
            component: './User',
          },
          {
            path: '/auth/workflow',
            name: '流程全局配置',
            component: './WorkFlow',
          },
          {
            path: '/auth/flowRedefined',
            name: '流程评审配置',
            component: './FlowRedefined',
          },
        ],
      },
      {
        path: '/integration',
        namd: '持续集成',
        routes: [
          {
            path: '/integration/projectGroup',
            name: '项目组',
            component: './ProjectGroup',
          },
          {
            path: '/integration/application',
            name: '应用管理',
            component: './Application',
          },
          {
            path: '/integration/applicationModule',
            name: '模块管理',
            component: './ApplicationModule',
          },
          {
            path: '/integration/moduleTag',
            name: '模块标签',
            component: './ModuleTag',
          },
          {
            path: '/integration/deployConfig',
            name: '部署配置',
            component: './DeployConfig',
          },
          {
            path: '/integration/buildRecord',
            name: '构建记录',
            component: './BuildRecord',
          },
          {
            path: '/integration/versionRecord',
            name: '版本记录',
            component: './VersionRecord',
          },
        ],
      },
      {
        path: '/my-center',
        namd: '个人中心',
        routes: [
          {
            path: '/my-center/workTodo',
            name: '我的待办',
            component: './WorkTodo',
          },
          {
            path: '/my-center/apply',
            name: '我的申请',
            component: './ApplyOrder',
          },
          {
            path: '/my-center/apply/application',
            name: '应用申请',
            component: './ApplyOrder/Application',
          },
          {
            path: '/my-center/apply/application/new',
            name: '应用申请-新建',
            component: './ApplyOrder/NewApply/Application',
          },
          {
            path: '/my-center/apply/applicationModule',
            name: '模块申请',
            component: './ApplyOrder/Module',
          },
          {
            path: '/my-center/apply/applicationModule/new',
            name: '模块申请-新建',
            component: './ApplyOrder/NewApply/Module',
          },
          {
            path: '/my-center/apply/publish',
            name: '发版申请',
            component: './ApplyOrder/Publish',
          },
          {
            path: '/my-center/apply/publish/new',
            name: '发版申请-新建',
            component: './ApplyOrder/NewApply/Publish',
          },
          {
            path: '/my-center/apply/deploy',
            name: '部署申请',
            component: './ApplyOrder/Deploy',
          },
          {
            path: '/my-center/apply/deploy/new',
            name: '部署申请-新建',
            component: './ApplyOrder/NewApply/Deploy',
          },
          {
            name: '个人设置',
            path: '/my-center/userProfile',
            component: './UserProfile',
          },
        ],
      },
      {
        path: '/log',
        namd: '日志分析',
        routes: [
          {
            path: '/log/logRecord',
            name: 'Log',
            component: './Log',
          },
        ],
      },
      {
        path: '/configCenter',
        namd: '配置中心',
        routes: [
          {
            path: '/configCenter/evnVar',
            name: '环境变量',
            component: './ConfigCenter/EvnVar',
          },
          {
            path: '/configCenter/common',
            name: '通用配置',
            component: './ConfigCenter/Common',
          },
          {
            path: '/configCenter/application',
            name: '应用配置',
            component: './ConfigCenter/Application',
          },
          {
            path: '/configCenter/gateway',
            name: '应用网关白名单',
            component: './ConfigCenter/Gateway',
          },
        ],
      },
      {
        path: '/monitorCenter',
        namd: '监控中心',
        routes: [
          {
            path: '/monitorCenter/availableService',
            name: '服务目录',
            component: './MonitorCenter/AvailableService',
          },
        ],
      },
      {
        path: '/model',
        namd: '数据模型',
        routes: [
          {
            path: '/model/dataSource',
            name: '数据源',
            component: './DataModel/DataSource',
          },
          {
            path: '/model/elementLibrary',
            name: '元素库',
            component: './DataModel/ElementLibrary',
          },
          {
            path: '/model/labelLibrary',
            name: '标签库',
            component: './DataModel/LabelLibrary',
          },
          {
            path: '/model/dataType',
            name: '数据类型',
            component: './DataModel/DataType',
          },
          {
            path: '/model/dataModel',
            name: '数据类型',
            component: './DataModel/DataModelManager',
          },
        ],
      },
    ],
  },
];

export default routes;
