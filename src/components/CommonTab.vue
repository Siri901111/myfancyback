<template>
  <div class="tags">
    <el-tag
      v-for="(tag) in tags"
      :key="tag.name"
      :closable="tag.name !== 'home'"
      :effect="route.name === tag.name ? 'dark' : 'plain'"
      @click="handleMenu(tag)"
      @close.stop="handleClose(tag)"
    >
    {{tag.label}}
    </el-tag>
  </div>
</template>

<script setup>
import {ref,computed} from 'vue'
import {useAllDataStore}from '@/stores'
import {useRoute,useRouter} from 'vue-router'

const state = useAllDataStore()
const tags = computed(()=>state.state.tags)
const route = useRoute()
const router = useRouter()
const handleMenu = (tag) =>{
  router.push(tag.name)
  state.selectMenu(tag)
}

// 添加关闭标签的处理函数
const handleClose = (tag) => {
  state.closeTag(tag, router)
}
</script>

<style lang="less" scoped>
.tags{
  margin:20px 0 0 20px;
}
.el-tag{
  margin-right: 10px;
  cursor: pointer;
}
</style>
