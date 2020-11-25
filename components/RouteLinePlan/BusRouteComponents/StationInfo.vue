<template>
  <div>
    <span class="balnk-img"></span>
    <div v-show="showRun">
      <span class="walk-img"></span>
      <span class="walk-span">
        从{{ startStation }}步行至
        <a class="walk-name" @click="walkName">{{ endStation }}</a>
      </span>
    </div>
    <div v-show="showTake">
      <span class="bus-img"></span>
      <span class="bus-span">
        乘坐{{ stationContent.segmentLine[0].lineName }}在
        <a class="bus-name" @click="busName">{{ endStation }}</a
        >下车
        <span class="station-num"
          >{{ stationContent.segmentLine[0].segmentStationCount }}站</span
        >
      </span>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: ['stationIndex', 'stationContent', 'startName', 'endName'],
  data() {
    return {
      configWalk: {
        flag: true,
        name: String,
        lonlat: String,
      },
      configBus: {
        flag: true,
        name: String,
        direction: String,
        stationCount: Number,
        endTime: String,
        lonlat: String,
      },
    }
  },
  computed: {
    /**
     * 处理终点站名
     */
    endStation() {
      if (this.stationContent.stationEnd.name === '') {
        return this.endName
      } else {
        return this.stationContent.stationEnd.name
      }
    },
    /**
     * 处理起点站名
     */
    startStation() {
      if (this.stationContent.stationStart.name === '') {
        return this.startName
      } else {
        return this.stationContent.stationStart.name
      }
    },
    /**
     * 控制显示步行还是乘坐公交
     */
    showRun() {
      switch (this.stationContent.segmentType) {
        case 1:
          return true
        case 2:
          return false
      }
      return false
    },
    showTake() {
      switch (this.stationContent.segmentType) {
        case 1:
          return false
        case 2:
          return true
      }
      return false
    },
  },
  watch: {},
  methods: {
    /**
     * 链式传递从底层组件传递的数据
     */
    walkName() {
      this.configWalk.name = this.endStation
      this.configWalk.lonlat = this.stationContent.stationEnd.lonlat
      this.$emit('walkname', this.configWalk)
    },
    /**
     * 链式传递从底层组件传递的数据
     */
    busName() {
      this.configBus.name = this.endStation
      this.configBus.lonlat = this.stationContent.stationEnd.lonlat
      this.configBus.direction = this.stationContent.segmentLine[0].direction
      this.configBus.stationCount = this.stationContent.segmentLine[0].segmentStationCount
      this.configBus.endTime = this.stationContent.segmentLine[0].SEndTime
      this.$emit('busname', this.configBus)
    },
  },
}
</script>

<style scoped>
.balnk-img {
  position: relative;
  left: 14px;
  width: 10px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -333px -180px;
  background-repeat: no-repeat;
  display: inline-block;
}
.walk-img {
  position: relative;
  left: 6px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -233px -180px;
  background-repeat: no-repeat;
  display: inline-block;
}
.walk-span {
  position: relative;
  font-size: 13px;
  top: -3px;
  left: 10px;
}
.walk-name {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-style: normal;
  color: #2f87eb;
}
.bus-img {
  position: relative;
  left: 12px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -148px -180px;
  background-repeat: no-repeat;
  display: inline-block;
}
.bus-span {
  position: relative;
  top: -5px;
  left: 10px;
  font-size: 13px;
}
.bus-name {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-style: normal;
  color: #2f87eb;
}
.station-num {
  position: relative;
  float: right;
  padding-right: 15px;
  color: #999;
  padding-top: 5px;
}
</style>