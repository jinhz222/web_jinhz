<template>
  <div>
    <div v-for="(iteam, index) in newLine.length - 1" :key="index">
      <div class="bus-div">
        <span class="bus-img"></span>
        <span class="bus-span">{{ newLine[index] }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: ['lineName'],
  data() {
    return {}
  },
  computed: {
    /**
     * 计算路线需要的总时间
     */
    newLine() {
      return this.lineName.split('|')
    },
  },
  watch: {},
  methods: {},
}
</script>

<style scoped>
.bus-div {
  position: relative;
  float: left;
}
.bus-img {
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -148px -180px;
  background-repeat: no-repeat;
  display: inline-block;
}
.bus-span {
  position: relative;
  left: -5px;
  top: -5px;
  font-size: 13px;
}
</style>