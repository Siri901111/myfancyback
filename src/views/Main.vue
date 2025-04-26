<script setup>
import CommonAside from "@/components/CommonAside.vue";
import CommonHeader from "@/components/CommonHeader.vue";
import CommonTab from "@/components/CommonTab.vue";
</script>

<template>
  <div id="common-layout">
    <el-container class="lay-container">
      <!-- 自定义左侧的组件 -->
      <CommonAside />
      <el-container>
        <el-header class="el-header">
          <CommonHeader />
        </el-header>
        <CommonTab/>
        <el-main class="right-main"> 
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="less">
.common-layout,
.lay-container {
  height: 100%;
}
.el-header {
  background-color: #1e293b;
}
</style>
