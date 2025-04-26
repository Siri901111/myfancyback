<template>
  <el-aside width="realWidth" >
    <el-menu 
    background-color="#021425" 
    text-color="#fff" 
    :collapse="isCollapse"
    :collapse-transation="false"
    :collapse-transition="false"
    :popper-effect = 'light'
    :default-active = 'activeMenu'
    >
      <h3 v-show="!isCollapse">Backend Controller</h3>
      <h3 v-show="isCollapse">Back</h3>
      <el-menu-item
        v-for="item in noChildren"
        :index="item.path"
        :key="item.path"
        @click="handleMenu(item)"
      >
        <component class="icons" :is="item.icon"></component>
        <span>{{ item.label }}</span>
      </el-menu-item>
      <el-sub-menu
        v-for="item in hasChildren"
        :index="item.path"
        :key="item.path"
      >
        <template #title>
          <component class="icons" :is="item.icon"></component>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(subItem, subIndex) in item.children"
            :index="subItem.path"
            :key="subIndex.path"
            @click="handleMenu(subItem)"
          >
            <component class="icons" :is="subItem.icon"></component>
            <span>{{ subItem.label }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, computed } from "vue";
import {useAllDataStore} from '@/stores/index.js'
import { useRouter, useRoute } from "vue-router";
const store = useAllDataStore();
const list = ref([
  {
    path: "/home",
    name: "home",
    label: "首页",
    icon: "house",
    url: "Home",
  },
  {
    path: "/mall",
    name: "mall",
    label: "商品管理",
    icon: "video-play",
    url: "Mall",
  },
  {
    path: "/user",
    name: "user",
    label: "用户管理",
    icon: "user",
    url: "User",
  },
  {
    path: "other",
    label: "其他",
    icon: "location",
    children: [
      {
        path: "/page1",
        name: "page1",
        label: "文件管理",
        icon: "setting",
        url: "Page1",
      },
      {
        path: "/page2",
        name: "page2",
        label: "页面2",
        icon: "setting",
        url: "Page2",
      },
    ],
  },
]);
// 过滤没有子菜单的项目
const noChildren = computed(() => list.value.filter((item) => !item.children));

// 过滤有子菜单的项目
const hasChildren = computed(() => list.value.filter((item) => item.children));

// 菜单点击处理函数
const clickMenu = (item) => {
  router.push(item.path);
};
const router = useRouter()
const route = useRoute()
const activeMenu = computed(()=>route.path)
const handleMenu = (item)=>{
  router.push(item.path)
  store.selectMenu(item)
}
// 控制侧边栏缩放
const isCollapse = computed(()=>store.state.isCollapse);

const realWidth = store.realWidth;
</script>

<style lang="less" scoped>
.icons {
  width: 18px;
  height: 18px;
  margin-right: 5px;
}

.el-menu {
  border-right: none;
  h3 {
    line-height: 48px;
    color: #fff;
    text-align: center;
    font-size: 18px;
  }
}

.el-aside {
  height: 100vh; /* 使用视窗高度 */
  background-color: #0f172a;
}
// // 侧边栏丝滑缩放
// .smooth-transition {
//  transition: width 0.5s ease; /* 0.3s 是过渡时间，ease 是缓动效果，可按需调整 */
// }
// .el-menu-vertical-demo:not(.el-menu--collapse) {
//   width: 200px;
//   min-height: 400px;
// }
</style>
