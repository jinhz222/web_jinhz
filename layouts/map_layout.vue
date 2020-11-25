<template>
  <div>
    <el-container class="map-contanier">
      <esri-map class="map-content"></esri-map>
    </el-container>
    <el-container class="sidebar-container">
      <Nuxt />
    </el-container>
  </div>
</template>

<script>
import EsriMap from '@/components/EsriMap/index'

export default {
  components: { EsriMap },
}
</script>

<style lang="scss">
$margin-top: 20px;
$margin-both-side: 20px;

.map-contanier {
  position: relative;
  z-index: 1;
}

/* .map-contanier:first-child {
  z-index: inherit;
} */

.sidebar-container {
  display: inline-flex;
  position: relative;
  z-index: 2;
  top: $margin-top;
  left: $margin-both-side;
  flex-direction: column;
}

.sidebar-container:first-child {
  z-index: inherit;
}

.right-tool-container {
  display: inline-flex;
  position: relative;
  z-index: 3;
  float: right;
  top: $margin-top;
  right: $margin-both-side;
  flex-direction: column;
}

.map-content {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
  position: absolute;
  z-index: 1;
}

.left-top-container {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 310px;
  z-index: 1005;
  min-height: 49px;
  overflow: hidden;
  border-radius: 3px;
  background: #fff;
  box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.3);
  transition: 0.3s;
}

.right-top-container {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
