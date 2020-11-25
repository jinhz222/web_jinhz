<template>
  <div>
    <div>
      <span class="index-name">{{ index }}.</span>
      {{ simpleData.strguide }}
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: ['simpleData', 'index'],
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {},
}
</script>

<style scoped>
.index-name {
  color: #2f87eb;
}
</style>