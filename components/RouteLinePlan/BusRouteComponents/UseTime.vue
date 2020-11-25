<template>
  <span class="time-span">约{{ useTim }}分钟</span>
</template>

<script>
export default {
  components: {},
  props: ['busline'],
  data() {
    return {}
  },
  computed: {
    /**
     * 计算路线需要的总时间
     */
    useTim() {
      let timeSum = 0
      for (let i = 0; i < this.busline.length; i++) {
        timeSum += this.busline[i].segmentLine[0].segmentTime
      }
      return timeSum
    },
  },
  watch: {},
  methods: {},
}
</script>

<style scoped>
.time-span {
  float: right;
  color: #999;
  font-size: 12px;
  padding-right: 10px;
}
</style>