<template>
  <el-container>
    <div class="sidebar-icon-container" v-show="changShow">
      <el-menu
        :default-active="activateMenu"
        :collapse="true"
        background-color="#fff"
        active-text-color="#fff"
        text-color="#999"
        :unique-opened="true"
        :collapse-transition="false"
        class="sidebar-el-menu"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.basePath"
        />
      </el-menu>
    </div>
    <div class="sidebar-main-container" v-show="changShow">
      <nuxt />
    </div>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  name: 'Sidebar',
  components: {
    SidebarItem,
  },
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    activateMenu() {
      return this.$route.path
    },
    ...mapState({
      changShow: (state) => state.isShowDown,
    }),
  },
}
</script>

<style scoped>
.sidebar-icon-container {
  width: 66px !important;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #eee;
}

.sidebar-el-menu {
  border-right: none;
}

.sidebar-main-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
