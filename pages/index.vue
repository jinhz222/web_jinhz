<template>
  <el-container class="el-container is-vertical">
    <el-container class="header-content">
      <el-aside>
        <div id="portalMap">
          <nuxt-link to="/zxdt">这里是菜单直通车</nuxt-link>
        </div>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script>
import { loadModules } from 'esri-loader'

export default {
  layout: 'tdt_home_page',
  data() {
    return {
      esriMap: null,
    }
  },
  mounted() {
    loadModules(['esri/Map', 'esri/views/MapView'], {
      url: 'https://js.arcgis.com/4.16/',
    }).then(([EsriMap, MapView]) => {
      const map = new EsriMap({
        basemap: 'satellite',
        ground: 'world-elevation',
      })
      this.esriMap = new MapView({
        container: 'protalMap',
        map,
      })
    })
  },
}
</script>

<style scoped>
@import url('https://js.arcgis.com/4.16/esri/css/main.css');

.el-container.is-vertical {
  -webkit-box-orient: vertical;
}

.header-content {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

#protalMap {
  width: 500px;
  height: 500px;
}

@media (min-width: 992px) {
  .header-content {
    width: 970px;
  }
}

@media (min-width: 1200px) {
  .header-content {
    width: 1170px;
  }
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
