<template>
  <div>
    <!--路线查询选择-->
    <div class="choose-type">
      <span ref="divFast" class="choose-start" @click="routeFast">较快捷</span>
      <span ref="divChange" class="choose-li" @click="routeChange">少换乘</span>
      <span ref="divWalk" class="choose-li" @click="routeWalk">少步行</span>
    </div>
    <!--公交路径查询结果-->
    <div
      ref="lineDom"
      class="line-content"
      @mouseenter="showOverfalow"
      @mouseleave="hideOverfalow"
    >
      <ul class="line-ul">
        <li v-for="(item, index) in busLines" :key="index" class="line-li">
          <div
            :id="index"
            ref="domDiv"
            class="block-line"
            @mouseenter="mouseEnter($event)"
            @mouseleave="mouseLeave($event)"
            @click="mouseClick($event)"
          >
            <line-name :line-name="item.lineName"></line-name>
            <br />
            <!--具体线路总距离和换乘次数-->
            <use-distance
              :busline="item.segments"
              :line-name="item.lineName"
            ></use-distance>
            <!--具体线路总耗时-->
            <use-time :busline="item.segments"></use-time>
          </div>
          <!--具体线路详情-->
          <div>
            <line-content
              v-show="isShow.lineCon[index].setting"
              :start-name="startName"
              :end-name="endName"
              :busline="item.segments"
              @walkname="walkName"
              @busname="busName"
            ></line-content>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  setPoint,
  setbusPoint,
  setbusLine,
  setwalkLine,
  goto,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState } from 'vuex'
import lineContent from '@/components/RouteLinePlan/BusRouteComponents/LineContent'
import useDistance from '@/components/RouteLinePlan/BusRouteComponents/UseDistance'
import useTime from '@/components/RouteLinePlan/BusRouteComponents/UseTime'
import lineName from '@/components/RouteLinePlan/BusRouteComponents/LineName'

export default {
  components: {
    lineContent,
    useDistance,
    useTime,
    lineName,
  },
  props: ['busLines', 'startName', 'endName', 'startlonArry', 'endlonArry'],
  data() {
    return {
      isShow: {
        lineCon: [
          { setting: false },
          { setting: false },
          { setting: false },
          { setting: false },
          { setting: false },
        ],
      },
      busLine: {},
      lonLatt: '',
      startLat: '',
      endLat: '',
      linePoint: '',
      linePath: [],
      busPro: require('@/components/RouteLinePlan/images/bus.png'),
      startPro: require('@/assets/images/start.png'),
      endPro: require('@/assets/images/ending.png'),
    }
  },
  computed: {
    /**
     * 获取地图视图对象
     */
    ...mapState('map', {
      // 获取地图视图对象
      mainView: (state) => state.mainView,
    }),
    startArry() {
      return this.startLat.split(',')
    },
    endArry() {
      return this.endLat.split(',')
    },
    lineArry() {
      return this.linePoint.split(';')
    },
    lonlatArry() {
      return this.lonLatt.split(',')
    },
  },
  watch: {},
  methods: {
    /**
     * 鼠标进入查询结果展示区域后和离开后显示下拉条或隐藏下拉条切换
     */
    showOverfalow() {
      this.$refs.lineDom.style.overflow = 'auto'
    },
    hideOverfalow() {
      this.$refs.lineDom.style.overflow = 'hidden'
    },
    /**
     * 链式传递从底层组件传递的数据
     */
    busName(value) {
      this.$emit('busname', value)
    },
    walkName(value) {
      this.$emit('walkname', value)
    },
    /**
     * @param {*} event
     * 鼠标进入查询结果区域后和离开后不同样式的切换
     */
    mouseEnter(event) {
      const divId = event.currentTarget.id
      this.$refs.domDiv[divId].style.backgroundColor = '#f2f2f2'
    },
    mouseLeave(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 设置区域的背景
      this.$refs.domDiv[divId].style.backgroundColor = '#fff'
    },
    mouseClick(event) {
      // 关闭弹窗
      this.$emit('closepro')
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 设置区域的背景
      this.$refs.domDiv[divId].style.backgroundColor = '#f0f7ff'
      // 显示或隐藏路线详细信息
      for (let i = 0; i < 5; i++) {
        if (i === parseInt(divId)) {
          this.isShow.lineCon[divId].setting = !this.isShow.lineCon[divId]
            .setting
        } else {
          this.isShow.lineCon[i].setting = false
        }
      }
      // 清除前面留下来的地图图标
      this.mainView.graphics.removeAll()
      if (this.isShow.lineCon[divId].setting === true) {
        // 添加路线地图图标
        this.busLine = this.busLines[divId]
        for (let n = 0; n < this.busLine.segments.length; n++) {
          // 判断是否为乘车类型
          if (this.busLine.segments[n].segmentType === 2) {
            // 获取每种路线的转折点字符串
            this.linePoint = this.busLine.segments[n].segmentLine[0].linePoint
            const linebusPaths = []
            for (let m = 0; m < this.lineArry.length - 1; m++) {
              this.lonLatt = this.lineArry[m]
              const pointbusLon = []
              // 将每个转折点的经纬度字符串数据转化为浮点型数组
              pointbusLon.push(parseFloat(this.lonlatArry[0]))
              pointbusLon.push(parseFloat(this.lonlatArry[1]))
              linebusPaths.push(pointbusLon)
            }
            // 在地图上添加路径
            setbusLine(linebusPaths, this.mainView)
          } else if (this.busLine.segments[n].segmentType === 1) {
            // 获取每种路线的转折点字符串
            this.linePoint = this.busLine.segments[n].segmentLine[0].linePoint
            const linewalkPaths = []
            for (let m = 0; m < this.lineArry.length - 1; m++) {
              this.lonLatt = this.lineArry[m]
              const pointwalkLon = []
              // 将每个转折点的经纬度字符串数据转化为浮点型数组
              pointwalkLon.push(parseFloat(this.lonlatArry[0]))
              pointwalkLon.push(parseFloat(this.lonlatArry[1]))
              linewalkPaths.push(pointwalkLon)
            }
            // 在地图上添加路径
            setwalkLine(linewalkPaths, this.mainView)
          }
        }
        for (let n = 0; n < this.busLine.segments.length; n++) {
          // 判断是否为乘车类型
          if (this.busLine.segments[n].segmentType === 2) {
            const busDatast = {
              name: '',
              direction: '',
              stationCount: 0,
              endTime: '',
              lat: '',
              lon: '',
            }
            const busDataen = {
              name: '',
              direction: '',
              stationCount: 0,
              endTime: '',
              lat: '',
              lon: '',
            }
            // 获取乘车起点的经纬度
            this.startLat = this.busLine.segments[n].stationStart.lonlat
            // 获取乘车终点的经纬度
            this.endLat = this.busLine.segments[n].stationEnd.lonlat
            // 添加起点公交图标
            busDatast.direction = this.busLine.segments[
              n
            ].segmentLine[0].direction
            busDatast.stationCount = this.busLine.segments[
              n
            ].segmentLine[0].segmentStationCount
            busDatast.endTime = this.busLine.segments[n].segmentLine[0].SEndTime
            busDatast.lat = this.startArry[1]
            busDatast.lon = this.startArry[0]
            busDatast.name = this.busLine.segments[n].stationStart.name
            setbusPoint(
              parseFloat(this.startArry[1]),
              parseFloat(this.startArry[0]),
              this.busPro,
              busDatast,
              this.mainView
            )
            // 添加终点公交图标
            busDataen.direction = this.busLine.segments[
              n
            ].segmentLine[0].direction
            busDataen.stationCount = this.busLine.segments[
              n
            ].segmentLine[0].segmentStationCount
            busDataen.endTime = this.busLine.segments[n].segmentLine[0].SEndTime
            busDataen.lat = this.endArry[1]
            busDataen.lon = this.endArry[0]
            busDataen.name = this.busLine.segments[n].stationEnd.name
            setbusPoint(
              parseFloat(this.endArry[1]),
              parseFloat(this.endArry[0]),
              this.busPro,
              busDataen,
              this.mainView
            )
          }
        }
        // 添加起始点地名图标
        setPoint(
          this.startlonArry[1],
          this.startlonArry[0],
          this.startPro,
          this.startName,
          this.mainView
        )
        setPoint(
          this.endlonArry[1],
          this.endlonArry[0],
          this.endPro,
          this.endName,
          this.mainView
        )
        goto(this.startlonArry[1], this.startlonArry[0], this.mainView)
        // 链式传递点击状态,用于在地图上点击显示弹框
        this.$emit('clickmap')
      } else {
        this.mainView.graphics.removeAll()
      }
    },
    /**
     * '较快捷'路线查询
     */
    routeFast() {
      // 点击较快捷的话，背景和字体改变
      this.$refs.divFast.style.backgroundColor = '#f0f7ff'
      this.$refs.divFast.style.color = '#2f87eb'
      this.$refs.divChange.style.backgroundColor = '#fff'
      this.$refs.divChange.style.color = '#4c4c4c'
      this.$refs.divWalk.style.backgroundColor = '#fff'
      this.$refs.divWalk.style.color = '#4c4c4c'
      // 在父组件进行'较快捷'路线查询
      this.$emit('routeFast', 1)
      // 关闭详细信息控件
      for (let i = 0; i < this.isShow.lineCon.length; i++) {
        this.isShow.lineCon[i].setting = false
      }
      // 关闭弹窗
      this.$emit('closepro')
      // 移除地图图标
      this.mainView.graphics.removeAll()
    },
    /**
     * '少换乘'路线查询
     */
    routeChange() {
      // 点击少换乘的话，背景和字体改变
      this.$refs.divFast.style.backgroundColor = '#fff'
      this.$refs.divFast.style.color = '#4c4c4c'
      this.$refs.divChange.style.backgroundColor = '#f0f7ff'
      this.$refs.divChange.style.color = '#2f87eb'
      this.$refs.divWalk.style.backgroundColor = '#fff'
      this.$refs.divWalk.style.color = '#4c4c4c'
      // 在父组件进行'少换乘'路线查询
      this.$emit('routeChange', 2)
      for (let i = 0; i < this.isShow.lineCon.length; i++) {
        this.isShow.lineCon[i].setting = false
      }
      // 关闭弹窗
      this.$emit('closepro')
      this.mainView.graphics.removeAll()
    },
    /**
     * '少步行'路线查询
     */
    routeWalk() {
      // 点击少换乘的话，背景和字体改变
      this.$refs.divFast.style.backgroundColor = '#fff'
      this.$refs.divFast.style.color = '#4c4c4c'
      this.$refs.divChange.style.backgroundColor = '#fff'
      this.$refs.divChange.style.color = '#4c4c4c'
      this.$refs.divWalk.style.backgroundColor = '#f0f7ff'
      this.$refs.divWalk.style.color = '#2f87eb'
      // 在父组件进行'少步行'路线查询
      this.$emit('routeWalk', 4)
      for (let i = 0; i < this.isShow.lineCon.length; i++) {
        this.isShow.lineCon[i].setting = false
      }
      // 关闭弹窗
      this.$emit('closepro')
      this.mainView.graphics.removeAll()
    },
  },
}
</script>

<style scoped>
.choose-type {
  position: relative;
  margin-top: 10px;
  padding-left: 5px;
  margin-bottom: 10px;
}
.choose-start {
  float: left;
  width: 105px;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  height: 24px;
  line-height: 24px;
  background-color: #f0f7ff;
  color: #2f87eb;
  text-align: center;
  font-size: 13px;
}
.choose-li {
  float: left;
  width: 105px;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 13px;
}
.line-content {
  position: relative;
  width: 97%;
  height: 370px;
  overflow-x: hidden;
  overflow-y: auto;
}
.line-content::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.line-content::-webkit-scrollbar-thumb {
  display: block;
  width: 10px;
  height: 1px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.2);
}
.line-content::-webkit-scrollbar-track-piece {
  height: 1px;
  width: 5px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
}
.line-ul {
  float: left;
  padding-top: 0px;
  padding-left: 10px;
}
.line-li {
  list-style: none;
  cursor: pointer;
  width: 99%;
  border-top: 1px solid #e5e5e5;
  margin-bottom: 20px;
}
.block-line {
  position: relative;
  border-width: 0px;
  background-color: white;
  margin-top: 10px;
  padding-bottom: 8px;
  padding-top: 10px;
  padding-left: 10px;
  width: 290px;
  height: 45px;
}
</style>