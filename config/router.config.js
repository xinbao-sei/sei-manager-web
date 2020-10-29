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
    name: 'updatePwd',
    path: '/updatePwd',
    component: './UpdatePassword',
  },
  {
    name: 'retrievePwd',
    path: '/retrievePwd',
    component: './RetrievePwd',
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
        name: 'DashBoard',
        component: './DashBoard',
      },
      {
        path: '/log/logRecord',
        name: 'Log',
        component: './Log',
      },
    ],
  },
];

export default routes;
