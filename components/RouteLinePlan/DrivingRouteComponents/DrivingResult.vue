<template>
  <div>
    <!--路线查询选择-->
    <div class="choose-type">
      <span ref="mostFast" class="choose-start" @click="driveFast"
        >最快路线</span
      >
      <span ref="mostLess" class="choose-li" @click="driveLess">最短路线</span>
      <span ref="highWay" class="choose-li" @click="driveWay">少走高速</span>
    </div>
    <!--路线总路程-->
    <div v-show="hasRoute" class="route-result">
      <div>
        <span class="drive-distance"
          >总里程：约{{ driveData.distance }}公里</span
        >
        <br />
        <span class="start-img"></span>
        <span class="start-name">{{ startName }}</span>
      </div>
      <!--公交路径查询结果-->
      <div ref="lineDom" class="line-content">
        <ul class="line-ul">
          <li
            v-for="(iteam, index) in driveData.simple.item"
            :key="index"
            class="line-li"
          >
            <div
              :id="index"
              ref="domDiv"
              class="block-line"
              @mouseenter="mouseEnter($event)"
              @mouseleave="mouseLeave($event)"
              @click="showMore($event)"
            >
              <simple-drive
                :simple-data="iteam"
                :index="index + 1"
              ></simple-drive>
              <!--具体线路详情-->
              <div v-show="isShow[index].setting">
                <more-drive
                  :key="timer"
                  :more-data="moreDatas[index].moreData"
                ></more-drive>
              </div>
            </div>
          </li>
        </ul>
        <div class="end-div">
          <span class="end-img"></span>
          <span class="end-name">{{ endName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  setdriveLine,
  goto,
  Deleteriveline,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState } from 'vuex'
import simpleDrive from '@/components/RouteLinePlan/DrivingRouteComponents/SimpleDrive'
import moreDrive from '@/components/RouteLinePlan/DrivingRouteComponents/MoreDrive'

export default {
  components: {
    simpleDrive,
    moreDrive,
  },
  props: ['driveData', 'startName', 'endName'],
  data() {
    return {
      startPro: require('@/assets/images/start.png'),
      endPro: require('@/assets/images/ending.png'),
      segmentNumber: '',
      linePoint: '', // 自驾线路经纬度字符串
      lonLatt: '', // 自驾路线转折点经纬度字符串
      lant: '', // 地图缩放坐标点
      startLat: '', // 起点经纬度
      endLat: '', // 终点经纬度
      isNoshow: [{ setting: false }],
      startNum: 0,
      endNum: 0,
      driveInfo: true,
      timer: '1',
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
    cutNum() {
      return this.segmentNumber.split('-')
    },
    startlonArry() {
      return this.startLat.split(',')
    },
    endlonArry() {
      return this.endLat.split(',')
    },
    lineArry() {
      return this.linePoint.split(';')
    },
    lonlatArry() {
      return this.lonLatt.split(',')
    },
    lantArry() {
      return this.lant.split(',')
    },
    hasRoute() {
      if (this.driveData.simple.item === undefined) {
        return false
      } else {
        return this.driveInfo
      }
    },
    moreDatas() {
      const tempArry = []
      if (this.driveData.simple.item === undefined) {
        tempArry.push({ moreData: [] })
        return tempArry
      } else if (this.driveData.simple.item.length === undefined) {
        tempArry.push({ moreData: [] })
        return tempArry
      } else {
        for (let i = 0; i < this.driveData.simple.item.length; i++) {
          tempArry.push({ moreData: [] })
        }
        return tempArry
      }
    },
    isShow() {
      const showArry = []
      if (this.driveData.simple.item === undefined) {
        return this.isNoshow
      } else if (this.driveData.simple.item.constructor !== Array) {
        return this.isNoshow
      } else {
        for (let i = 0; i < this.driveData.simple.item.length; i++) {
          showArry.push({ setting: false })
        }
        return showArry
      }
    },
  },
  watch: {},
  methods: {
    showMore(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 获得详细路线说明的起始索引字符串并转化为数值型
      this.segmentNumber = this.driveData.simple.item[
        divId
      ].segmentNumber.split('-')
      if (this.segmentNumber.length === 2) {
        this.startNum = parseInt(this.segmentNumber[0])
        this.endNum = parseInt(this.segmentNumber[1])
      } else {
        this.startNum = parseInt(this.segmentNumber[0])
        this.endNum = parseInt(this.segmentNumber[0])
      }
      this.timer = new Date().getTime()
      let n = 0
      // 根据详细路线说明的起始索引将器添加进数组里
      for (let i = this.startNum; i <= this.endNum; i++) {
        this.moreDatas[divId].moreData[n] = this.driveData.routes.item[
          i
        ].strguide
        n++
      }
      // 点击显示详细信息并关闭其他详细信息
      for (let m = 0; m < this.isShow.length; m++) {
        if (parseInt(divId) === m) {
          this.isShow[m].setting = !this.isShow[m].setting
          if (this.isShow[m].setting) {
            // 删除前面留下的详细路径
            Deleteriveline(this.mainView)
            // 在地图上添加每段路线
            // 获取路线经纬度字符串
            this.linePoint = this.driveData.simple.item[m].streetLatLon
            const linebusPaths = []
            for (let k = 0; k < this.lineArry.length - 1; k++) {
              this.lonLatt = this.lineArry[k]
              const pointbusLon = []
              // 将每个转折点的经纬度字符串数据转化为浮点型数组
              pointbusLon.push(parseFloat(this.lonlatArry[0]))
              pointbusLon.push(parseFloat(this.lonlatArry[1]))
              linebusPaths.push(pointbusLon)
            }
            // 在地图上添加路径
            setdriveLine(linebusPaths, this.mainView)
            // 地图缩放
            this.lant = this.driveData.simple.item[m].turnlatlon
            goto(
              parseFloat(this.lantArry[1]),
              parseFloat(this.lantArry[0]),
              this.mainView
            )
          } else {
            Deleteriveline(this.mainView)
          }
        } else {
          this.isShow[m].setting = false
        }
      }
    },
    driveFast() {
      // 点击最快路线的话，背景和字体改变
      this.$refs.mostFast.style.backgroundColor = '#f0f7ff'
      this.$refs.mostFast.style.color = '#2f87eb'
      this.$refs.mostLess.style.backgroundColor = '#fff'
      this.$refs.mostLess.style.color = '#4c4c4c'
      this.$refs.highWay.style.backgroundColor = '#fff'
      this.$refs.highWay.style.color = '#4c4c4c'
      for (let m = 0; m < this.isShow.length; m++) {
        this.isShow[m].setting = false
      }
      // 在父组件进行'最快路线'路线查询
      this.$emit('driveFast', 0)
    },
    driveLess() {
      // 点击最短路线话，背景和字体改变
      this.$refs.mostFast.style.backgroundColor = '#fff'
      this.$refs.mostFast.style.color = '#4c4c4c'
      this.$refs.mostLess.style.backgroundColor = '#f0f7ff'
      this.$refs.mostLess.style.color = '#2f87eb'
      this.$refs.highWay.style.backgroundColor = '#fff'
      this.$refs.highWay.style.color = '#4c4c4c'
      for (let m = 0; m < this.isShow.length; m++) {
        this.isShow[m].setting = false
      }
      // 在父组件进行'最短路线'路线查询
      this.$emit('driveLest', 1)
    },
    driveWay() {
      // 点击少走高速的话，背景和字体改变
      this.$refs.mostFast.style.backgroundColor = '#fff'
      this.$refs.mostFast.style.color = '#4c4c4c'
      this.$refs.mostLess.style.backgroundColor = '#fff'
      this.$refs.mostLess.style.color = '#4c4c4c'
      this.$refs.highWay.style.backgroundColor = '#f0f7ff'
      this.$refs.highWay.style.color = '#2f87eb'
      for (let m = 0; m < this.isShow.length; m++) {
        this.isShow[m].setting = false
      }
      // 在父组件进行'少走高速'路线查询
      this.$emit('driveHighway', 2)
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
.drive-distance {
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  text-align: right;
  padding: 10px;
  font-size: 13px;
}
.line-content {
  position: relative;
  width: 97%;
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
  text-align: left;
  width: 300px;
  font-size: 13px;
}
.start-img {
  float: left;
  margin-left: 12px;
  margin-top: 9px;
  padding-top: 10px;
  font-size: 13px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -508px -147px;
  background-repeat: no-repeat;
}
.start-name {
  float: left;
  margin-left: 0px;
  margin-top: 5px;
  font-size: 13px;
  padding-top: 10px;
}
.end-div {
  position: relative;
  top: -30px;
}
.end-img {
  float: left;
  margin-left: 12px;
  margin-top: 8px;
  font-size: 13px;
  padding-top: 10px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -533px -150px;
  background-repeat: no-repeat;
}
.end-name {
  float: left;
  margin-left: 0px;
  margin-top: 2px;
  font-size: 13px;
  padding-top: 10px;
}
</style>