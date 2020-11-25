<template>
  <el-container>
    <div class="route-content">
      <!--查询标题-->
      <div class="route-top">
        <span class="route-tilte">路线规划</span>
      </div>
      <!--路径导航及清空按钮-->
      <div class="route-choose">
        <!--自驾路径导航-->
        <div class="route-driving" @click="changeDriving">
          <span ref="driveDom" class="drive-img"></span>
        </div>
        <!--公交路径导航-->
        <div class="route-bus" @click="changeBus">
          <span ref="busDom" class="bus-img"></span>
        </div>
        <!--清除结果-->
        <div class="route-clear">
          <span class="clear-a" @click="clearRoute">清除路线</span>
        </div>
      </div>
      <!--路径导航组件-->
      <div class="route-com">
        <bus-route
          ref="divRoute"
          :key="timer"
          :driving-type="routeType.drivingType"
          :bus-type="routeType.busType"
          @walkname="walkName"
          @busname="busName"
          @closepro="closeProp"
          @clickmap="clickMap"
          @back="rollBack"
        ></bus-route>
      </div>
    </div>
    <!--弹框-->
    <transition name="fade">
      <div v-show="showProp" id="popTem" class="content-div">
        <div class="poptemplate-div">
          <pop-template
            id="popDom"
            ref="popDiv"
            :poi-name="poiName"
            :show-down="showDown"
            @closeprop="closeProp"
          >
            <template v-slot:popup-body>
              <span class="direction-span">{{ configCon.direction }}</span>
              <br />
              <span class="station-count"
                >共{{ configCon.stationCount }}站</span
              >
              <br />
              <span class="end-time"
                >首末班车时间：{{ configCon.endTime }}</span
              >
            </template>
          </pop-template>
        </div>
        <span class="popup-tip"></span>
      </div>
    </transition>
  </el-container>
</template>

<script>
import {
  goto,
  watchPoint,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState } from 'vuex'
import busRoute from '@/components/RouteLinePlan/FunctionComponents/BusRoute'
import popTemplate from '@/components/RouteLinePlan/FunctionComponents/PropTemplate'

export default {
  name: 'RouteLinePlan',
  components: {
    busRoute,
    popTemplate,
  },
  data() {
    return {
      timer: '', // 时间戳
      routeType: {
        // 页面加载时显示的时自驾导航路线
        drivingType: true,
        busType: false,
      },
      showProp: false, // 是否显示弹窗
      showDown: Boolean, // 是否显示详细信息下拉框
      poiName: '', // 弹窗标题
      configCon: {}, // 站点路线的详细信息
      walkLat: '', // 步行站点的经纬度
      busLat: '', // 公交站点的经纬度
    }
  },
  mounted() {},
  computed: {
    /**
     * 获取地图视图对象
     */
    ...mapState('map', {
      // 获取地图视图对象
      mainView: (state) => state.mainView,
    }),
    walkArry() {
      return this.walkLat.split(',')
    },
    busArry() {
      return this.busLat.split(',')
    },
  },
  methods: {
    /**
     * 清除所有
     */
    clearRoute() {
      // 关闭弹窗
      this.showProp = false
      // 输入框个数初始化
      this.$refs.divRoute.passinputNum = 0
      // 关闭显示结果控件
      this.$refs.divRoute.isShow.showResult = false
      this.$refs.divRoute.isShow.showRoute = false
      this.$refs.divRoute.isShow.showDrive = false
      // 清空输入框
      this.$refs.divRoute.inputStrat = ''
      this.$refs.divRoute.inputEnding = ''
      this.$refs.divRoute.passShow = []
      // 清空地图
      this.mainView.graphics.removeAll()
    },
    /**
     * 关闭弹窗
     */
    rollBack() {
      this.showProp = false
    },
    /**
     * 关闭弹窗
     */
    closeProp() {
      this.showProp = false
    },
    /**
     * 链式传递从底层组件传递的数据
     */
    busName(value) {
      this.poiName = value.name
      this.configCon = value
      // 获取站点的经纬度
      this.busLat = value.lonlat
      // 显示弹窗
      this.showProp = value.flag
      // 显示站点详细信息
      this.showDown = true
      // 缩放到图标
      goto(
        parseFloat(this.busArry[1]),
        parseFloat(this.busArry[0]),
        this.mainView
      )
      // 移动弹窗与图标对应
      const newptArry = []
      watchPoint(
        parseFloat(this.busArry[1]),
        parseFloat(this.busArry[0]),
        this.mainView,
        newptArry
      )
    },
    walkName(value) {
      this.poiName = value.name
      // 获取站点的经纬度
      this.walkLat = value.lonlat
      // 显示弹窗
      this.showProp = value.flag
      // 不显示详细信息
      this.showDown = false
      // 缩放到图标
      goto(
        parseFloat(this.walkArry[1]),
        parseFloat(this.walkArry[0]),
        this.mainView
      )
      // 移动弹窗与图标对应
      const newptArry = []
      watchPoint(
        parseFloat(this.walkArry[1]),
        parseFloat(this.walkArry[0]),
        this.mainView,
        newptArry
      )
    },
    clickMap() {
      if (this.routeType.busType) {
        this.mainView.on('click', (event) => {
          this.mainView.hitTest(event).then((respone) => {
            this.poiName = respone.results[0].graphic.attributes.name
            if (this.poiName !== '') {
              this.showProp = true
            } else {
              this.showProp = false
            }
            this.configCon = respone.results[0].graphic.attributes
            // 判断如果是否为公交详细信息
            if (this.configCon.type === 2) {
              this.showDown = true
            } else {
              this.showDown = false
            }
            // 缩放到图标
            goto(
              parseFloat(this.configCon.lat),
              parseFloat(this.configCon.lon),
              this.mainView
            )
            // 移动弹窗与图标对应
            const newptArry = []
            watchPoint(
              parseFloat(this.configCon.lat),
              parseFloat(this.configCon.lon),
              this.mainView,
              newptArry
            )
          })
        })
      }
    },
    /**
     * 鼠标点击切换到自驾路线规划
     */
    changeDriving() {
      this.$refs.busDom.style.backgroundColor = '#fff'
      this.$refs.busDom.style.backgroundPosition = '-56px -174px'
      this.$refs.driveDom.style.backgroundColor = '#3f88e7'
      this.$refs.driveDom.style.backgroundPosition = '-84px -175px'
      if (!this.routeType.drivingType) {
        this.routeType.drivingType = true
        this.routeType.busType = false
        this.showProp = false
        this.$refs.divRoute.passShow = []
        this.$refs.divRoute.$refs.poiCom.$refs.startCom.$refs.searchDiv.style.height =
          '300px'
        this.$refs.divRoute.$refs.poiCom.$refs.nameCom.$refs.searchDiv.style.height =
          '300px'
        this.$refs.divRoute.$refs.poiCom.isShow.isPass = false
        if (this.$refs.divRoute.isShow.showRoute) {
          this.$refs.divRoute.time1 = new Date().getTime()
          this.$refs.divRoute.getnewDrive(0)
        }
      } else {
        this.routeType.drivingType = true
      }
    },
    /**
     * 鼠标点击切换到公交路线规划
     */
    changeBus() {
      this.$refs.driveDom.style.backgroundColor = '#fff'
      this.$refs.driveDom.style.backgroundPosition = '-27px -175px'
      this.$refs.busDom.style.backgroundColor = '#3f88e7'
      this.$refs.busDom.style.backgroundPosition = '-113px -174px'
      if (!this.routeType.busType) {
        this.routeType.drivingType = false
        this.routeType.busType = true
        this.showProp = false
        this.$refs.divRoute.passShow = []
        this.$refs.divRoute.passinputNum = 0
        this.$refs.divRoute.$refs.poiCom.$refs.startCom.$refs.searchDiv.style.height =
          '300px'
        this.$refs.divRoute.$refs.poiCom.$refs.nameCom.$refs.searchDiv.style.height =
          '300px'
        this.$refs.divRoute.$refs.poiCom.isShow.isPass = false
        if (this.$refs.divRoute.isShow.showDrive) {
          this.$refs.divRoute.time = new Date().getTime()
          this.$refs.divRoute.getRoute(1)
        }
      } else {
        this.routeType.busType = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.route-content {
  position: relative;
  overflow: hidden;
  background: #fff;
  height: 600px;
  width: 100%;
}
.route-top {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 15px;
  margin-left: 10px;
  padding-left: 0px;
  padding-top: 10px;
  border-bottom-color: rgb(238, 238, 238);
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
.route-choose {
  position: relative;
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
}
.drive-img {
  width: 30px;
  height: 30px;
  border-radius: 20px;
  background-color: #3f88e7;
  background-image: url('./images/icon.3453a6e.png');
  background-position: -84px -175px;
  background-repeat: no-repeat;
  display: inline-block;
}
.bus-img {
  width: 30px;
  height: 30px;
  border-radius: 20px;
  background-color: #fff;
  background-image: url('./images/icon.3453a6e.png');
  background-position: -56px -174px;
  background-repeat: no-repeat;
  display: inline-block;
}
.route-driving {
  float: left;
  padding-top: 5px;
  padding-left: 20px;
  cursor: pointer;
}
.route-bus {
  float: left;
  padding-top: 5px;
  padding-left: 40px;
  cursor: pointer;
}
.route-clear {
  float: right;
  padding-right: 5px;
  padding-top: 5px;
  font-size: 10px;
  cursor: pointer;
}
.clear-a {
  text-decoration: none;
  font-size: 10px;
  color: #3f88e7;
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.content-div {
  position: absolute;
  left: 500px;
  width: 380px;
  height: 220px;
  opacity: 1;
  z-index: -1;
}
.poptemplate-div {
  position: absolute;
  bottom: 0px;
  opacity: 1;
  width: 380px;
}
.direction-span {
  position: relative;
  bottom: 0px;
  font-size: 13px;
}
.station-count {
  position: relative;
  bottom: 0px;
  font-size: 13px;
}
.end-time {
  font-size: 13px;
}
.popup-tip {
  position: absolute;
  width: 21px;
  height: 17px;
  bottom: -14px;
  left: 168px;
  background-image: url('./images/icon.3453a6e.png');
  background-position: -348px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
</style>
