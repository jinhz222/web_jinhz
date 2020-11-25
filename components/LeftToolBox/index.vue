<template>
  <el-container class="left-toolbox-container">
    <header-logo :logo-title="logoTitle" />
    <sidebar class="left-toolbox-sidebar" :routes="routes" />
  </el-container>
</template>

<script>
import Sidebar from '../Sidebar/index'
import HeaderLogo from './HeaderLogo'

export default {
  name: 'LeftToolBox',
  components: {
    HeaderLogo,
    Sidebar,
  },
  props: {
    logoTitle: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.left-toolbox-container {
  width: 410px;
  flex-direction: column;
}

.left-toolbox-sidebar {
  height: 600px;
}
</style>
