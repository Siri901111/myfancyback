import { createRouter, createWebHashHistory } from 'vue-router'
import Main from '@/views/Main.vue'  // 使用相对路径可能更安全
import Home from '@/views/Home.vue'
import User from '@/views/User.vue'
import Mall from '@/views/Mall.vue'
import Page1 from '@/views/Page1.vue'  // 导入Page1组件
// 定义路由规则
// const routes = [
//     {
//         path:'/',
//         name:'main',
//         component: Main,
//         redirect:'/home',
//         children:[
//           {
//             path:'home',
//             name:'home',
//             component: Home,
//           }
//         ]
//     }
// ]

// 定义路由规则
const routes = [
  {
    path: '/',
    name: 'main',
    component: Main,
    redirect: '/home', // 重定向配置放在主路由对象内
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home // 修正为 Home 组件
      },
      {
        path: 'user',
        name: 'user',
        component: User 
      },
      {
        path: 'mall',
        name: 'mall',
        component: Mall 
      },
      {
        path: 'page1',
        name: 'page1',
        component: Page1  // 添加Page1路由
      }
    ]
  }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router

