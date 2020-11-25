<template>
  <span class="use-span">{{ isChange }}/约{{ useDis }}公里</span>
</template>

<script>
export default {
  components: {},
  props: ['busline', 'lineName'],
  data() {
    return {}
  },
  computed: {
    /**
     * 计算路线需要的总距离
     */
    useDis() {
      let distanceSum = 0
      for (let i = 0; i < this.busline.length; i++) {
        distanceSum += this.busline[i].segmentLine[0].segmentDistance
      }
      return (distanceSum / 1000).toFixed(2)
    },
    nameArry() {
      return this.lineName.split('|')
    },
    /**
     * 计算路线需要换乘几次
     */
    isChange() {
      if (this.nameArry.length === 2) {
        return '无换乘'
      } else {
        return '换乘' + (this.nameArry.length - 2) + '次'
      }
    },
  },
  watch: {},
  methods: {},
}
</script>

<style scoped>
.use-span {
  position: absolute;
  top: 35px;
  left: 13px;
  color: #999;
  font-size: 12px;
}
</style>