<template>
  <div id="tdtMap" class="mapviewStyle"></div>
</template>

<script>
import { loadModules } from 'esri-loader'
import { mapState, mapMutations } from 'vuex'
import { jsApi, tianditu } from './../../settings'

const options = {
  url: jsApi.url,
  css: jsApi.css,
}

export default {
  data() {
    return {
      esriMap: null,
      vecLabelCheck: false, // 矢量标注
      imgLabelCheck: false, // 影像标注
    }
  },
  computed: {
    ...mapState('map', {
      mainView: (state) => state.mainView,
    }),
  },
  methods: {
    ...mapMutations('map', ['saveMainView']),
    async _createMapView() {
      const _self = this
      const vecTileLayer = await _self._createTianDiTuLayer(
        'vec_w',
        'vecTileLayer'
      )
      _self.vecLabelCheck = true
      _self.imgLabelCheck = false
      const poiLayers = await _self.initLabelLayer(
        _self.vecLabelCheck,
        _self.imgLabelCheck
      )
      // 创建地图
      loadModules(
        [
          'esri/views/MapView',
          'esri/Map',
          'esri/layers/WebTileLayer',
          'esri/layers/FeatureLayer',
        ],
        options
      )
        .then(([MapView, Map, WebTileLayer, FeatureLayer]) => {
          const initMap = new Map({
            basemap: {
              baseLayers: [vecTileLayer, ...poiLayers],
            },
          })
          const view = new MapView({
            container: 'tdtMap',
            map: initMap,
            zoom: 12,
            center: [104.075206, 30.676912], // 定位到成都
          })
          _self.esriMap = initMap
          view.ui.components = []

          // view保存进vuex
          _self.saveMainView(view)
        })
        .catch((err) => {
          console.log('底图创建失败，' + err)
        })
    },

    // 创建天地图图层系列
    _createTianDiTuLayer(layerType, layerID, layerVisible = true) {
      return new Promise((resolve, reject) => {
        loadModules(['esri/layers/WebTileLayer'], options)
          .then(([WebTileLayer]) => {
            const resultLayer = new WebTileLayer({
              urlTemplate: `${tianditu.urlTemplateHost}/DataServer?T=${layerType}&x={col}&y={row}&l={level}&tk=${tianditu.key}`,
              subDomains: tianditu.subDomains,
              visible: layerVisible,
              id: layerID,
            })
            resolve(resultLayer)
          })
          .catch((err) => {
            console.log('天地图图层创建失败，' + err)
            reject(new Error('天地图图层创建失败'))
          })
      })
    },
    async initLabelLayer(vecLabel, imgLabel) {
      const vecPOILayer = await this._createTianDiTuLayer(
        'cva_w',
        'vecPOILayer',
        vecLabel
      )

      const imgPOILayer = await this._createTianDiTuLayer(
        'cia_w',
        'imgPOILayer',
        imgLabel
      )

      return [vecPOILayer, imgPOILayer]
    },
  },
  mounted() {
    this._createMapView()
  },
}
</script>

<style>
.mapviewStyle {
  height: 100%;
  width: 100%;
}
</style>
