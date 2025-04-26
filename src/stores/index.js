import { defineStore } from "pinia";  
import { reactive, ref, computed } from "vue";
// function initState(){
//   return {isCollapse:true}
// };

export const useAllDataStore = defineStore("allData",()=>{
  // ref state
  // computer getters
  // function actions
  // const state = ref(initState());
  const state = reactive({
     isCollapse:true,
     tags:[
      {
        path:'/home',
        name:'home',
        label:'首页',
        icon:'home'
      }
    ],
    currentMenu:null
    })
  // 定义action来修改状态
  const toggleCollapse = () => {
    state.isCollapse = !state.isCollapse;
  };
  const realWidth = computed(()=>{
    return state.isCollapse ? '64px' : '180px';
  })
  function selectMenu(val){
    if(val.name==='home'){
      state.currentMenu = null
    }else{
      state.currentMenu = val
      // 查找是否已存在相同name的标签
      const index = state.tags.findIndex(item => item.name === val.name)
      // 如果不存在，则添加到tags数组中
      if(index === -1) {
        state.tags.push(val)
      }
    }
  }
  // 添加删除tabs的方法
  function closeTag(tag, router) {
    // 找到要删除的标签的索引
    const index = state.tags.findIndex(item => item.name === tag.name)
    
    // 如果找到了对应的标签
    if (index !== -1) {
      // 删除该标签
      state.tags.splice(index, 1)
      
      // 如果删除的是当前选中的标签，则需要切换路由
      if (tag.name === state.currentMenu?.name) {
        // 如果还有其他标签，则跳转到最后一个标签
        if (state.tags.length > 0) {
          // 如果删除的是最后一个标签，则跳转到前一个标签
          const targetTag = state.tags[index === 0 ? 0 : index - 1]
          state.currentMenu = targetTag
          router.push(targetTag.name)
        } else {
          // 如果没有其他标签了，则跳转到首页
          state.currentMenu = null
          router.push('/home')
        }
      }
    }
  }
  return {
    state,toggleCollapse,realWidth,selectMenu,closeTag
  };
});

