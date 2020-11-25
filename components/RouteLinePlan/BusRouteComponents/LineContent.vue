<template>
  <div class="line-con">
    <!--起点-->
    <div>
      <span class="start-img"></span>
      <span class="start-span">{{ startName }}</span>
    </div>
    <!--中途经过点-->
    <div v-for="(item, index) in busline" :key="index">
      <station-info
        :station-index="index"
        :station-content="item"
        :start-name="startName"
        :end-name="endName"
        @walkname="walkName"
        @busname="busName"
      ></station-info>
    </div>
    <span class="balnk-img"></span>
    <!--终点-->
    <div>
      <span class="end-img"></span>
      <span class="end-span">{{ endName }}</span>
    </div>
  </div>
</template>

<script>
import stationInfo from '@/components/RouteLinePlan/BusRouteComponents/StationInfo'

export default {
  components: {
    stationInfo,
  },
  props: ['busline', 'startName', 'endName'],
  data() {
    return {
      name: '',
    }
  },
  computed: {},
  watch: {},
  methods: {
    /**
     * 链式传递从底层组件传递的数据
     */
    walkName(value) {
      this.$emit('walkname', value)
    },
    busName(value) {
      this.$emit('busname', value)
    },
  },
}
</script>

<style scoped>
.line-con {
  position: relative;
  margin-top: 10px;
}
.start-img {
  position: relative;
  left: 8px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -508px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
.start-span {
  position: relative;
  top: -3px;
  left: 10px;
  font-size: 13px;
}
.end-img {
  position: relative;
  left: 8px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -533px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
.end-span {
  position: relative;
  top: -3px;
  left: 10px;
  font-size: 13px;
}
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
</style>