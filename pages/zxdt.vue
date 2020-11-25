<template>
  <div>
    <left-tool-box logo-title="在线地图" :routes="routes" />
  </div>
</template>

<script>
import LeftToolBox from '@/components/LeftToolBox/index'

export default {
  layout: 'map_layout',
  components: {
    LeftToolBox,
  },
  data() {
    return {
      routes: [
        {
          basePath: '/zxdt',
          path: 'search',
          meta: {
            icon: 'iconfont iconsousuo',
            title: '地名检索',
          },
        },
        {
          basePath: '/zxdt',
          path: 'route_line',
          meta: {
            icon: 'iconfont iconluxian',
            title: '路线规划',
          },
        },
        {
          basePath: '/zxdt',
          path: 'map_data',
          meta: {
            icon: 'el-icon-s-platform',
            title: '成都各区县',
          },
        },
      ],
    }
  },
  created() {},
}
</script>

<style scoped>
.header-logo {
  width: 100%;
  height: 49px;
}

.sidebar-container {
  width: 100%;
  height: 600px;
  flex: 1;
}
</style>
