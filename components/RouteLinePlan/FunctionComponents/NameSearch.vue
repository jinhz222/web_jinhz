<template>
  <div>
    <div class="res-content">
      <div class="search-result">
        <div ref="searchDiv" class="search-bolck">
          <ul class="no-ul">
            <!--查询显示内容-->
            <li v-for="(item, index) in poiData" :key="index" class="no-li">
              <div
                :id="index"
                ref="domDiv"
                class="place-bolck"
                @mouseleave="mouseLeave($event)"
                @mouseenter="mouseEnter($event)"
                @click="mouseClick($event)"
              >
                <div style="text-decoration: none;">
                  <!--地名图标-->
                  <img
                    ref="domImg"
                    :src="imgPosition.positionDiv[index]"
                    class="img-position"
                  />
                  <!--搜索地名-->
                  <span class="place-name">{{ item.name }}</span>
                  <span
                    v-show="isShow.isSetting[index].setting"
                    :id="index"
                    ref="domSetting"
                    class="set-position"
                    @click="setPoint($event)"
                    >{{ flag }}</span
                  >
                  <br />
                  <!--地名地址-->
                  <span class="address-info">地址：{{ item.address }}</span>
                  <!--地名电话-->
                  <phone-info :phoneinfo="item.phone"></phone-info>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--分页控件-->
    <div class="search-paging">
      <el-pagination
        :total="parseInt(searchSum)"
        :pager-count="pagerConfig.pagerCount"
        :page-size="pagerConfig.pageSize"
        :current-page.sync="pagerConfig.currentPage"
        class="el-paging"
        background
        small
        layout="prev, pager, next"
        @next-click="nextClick"
        @current-change="currentChange"
        @prev-click="prevClick"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import {
  goto,
  replacePoint,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState } from 'vuex'
import phoneInfo from '@/components/RouteLinePlan/FunctionComponents/PhoneInfos'

export default {
  components: {
    phoneInfo,
  },
  props: [
    'flag', // 起点或终点标志
    'poiData', // 地名查询结果
    'searchSum', // 地名查询结果总数
    'hasPass',
  ],
  data() {
    return {
      // 获取最终需要路径检索需要的起点或终点名字和经纬度
      nameRes: {
        poiName: String,
        lonLat: String,
      },
      lant: String, // 用于存储经纬度字符串
      isShow: {
        // 用与是否显示设为起点或终点的按钮
        isSetting: [
          { setting: false },
          { setting: false },
          { setting: false },
          { setting: false },
          { setting: false },
        ],
      },
      // 分页所需要变量
      pagerConfig: {
        currentPage: 1,
        pagerCount: 5,
        pageSize: 5,
        startValue: Number,
      },
      imgPosition: {
        positionDiv: [
          require('@/assets/images/positionL1.png'),
          require('@/assets/images/positionL2.png'),
          require('@/assets/images/positionL3.png'),
          require('@/assets/images/positionL4.png'),
          require('@/assets/images/positionL5.png'),
        ],
        positionMap: [
          require('@/assets/images/positionH1.png'),
          require('@/assets/images/positionH2.png'),
          require('@/assets/images/positionH3.png'),
          require('@/assets/images/positionH4.png'),
          require('@/assets/images/positionH5.png'),
        ],
      },
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
    /**
     * 将获取到的经纬度字符串按空格分割成数组
     */
    lantArry() {
      return this.lant.split(' ')
    },
    currPage() {
      return this.pagerConfig.currentPage
    },
  },
  watch: {},
  updated() {},
  methods: {
    /**
     * @param {*} event
     * 鼠标进入查询结果区域后和离开后不同样式的切换
     */
    mouseEnter(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 显示设为起点或终点选项
      const setId = this.$refs.domSetting[divId].id
      if (divId === setId) {
        this.isShow.isSetting[divId].setting = true
      }
      // 设置区域的背景
      this.$refs.domDiv[divId].style.backgroundColor = '#f2f2f2'
      // 切换不同颜色的图片
      this.$refs.domImg[divId].src = this.imgPosition.positionMap[divId]
      this.lant = this.poiData[divId].lonlat // 获取到经纬度字符串
      // 在地图上替换蓝色图标
      replacePoint(this.imgPosition, 'enter', this.mainView, divId)
    },
    mouseLeave(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 隐藏设为起点或终点选项
      const setId = this.$refs.domSetting[divId].id
      if (divId === setId) {
        this.isShow.isSetting[divId].setting = false
      }
      // 设置区域的背景
      this.$refs.domDiv[divId].style.backgroundColor = '#fff'
      // 切换不同颜色的图片
      this.$refs.domImg[divId].src = this.imgPosition.positionDiv[divId]
      this.lant = this.poiData[divId].lonlat // 获取到经纬度字符串
      // 在地图上替换红色图标
      replacePoint(this.imgPosition, 'leave', this.mainView, divId)
    },
    /**
     * @param {*} event
     * 鼠标点击查询结果区域后地图缩放到该地名
     */
    mouseClick(event) {
      // 获取鼠标到达区域的id
      const ptId = event.currentTarget.id
      // 缩放到查询结果的第一条
      this.lant = this.poiData[ptId].lonlat // 获取到经纬度字符串
      goto(
        parseFloat(this.lantArry[1]),
        parseFloat(this.lantArry[0]),
        this.mainView
      )
    },
    /**
     * @param {*} value
     * 获取鼠标点击起点或终点的分页页码，并向上一级组件传递信息
     */
    nextClick(value) {
      this.$emit('setIndex')
      this.pagerConfig.startValue = (value - 1) * 5
      this.$emit('nextClick', this.pagerConfig.startValue)
    },
    currentChange(value) {
      this.$emit('setIndex')
      this.pagerConfig.startValue = (value - 1) * 5
      this.$emit('currentChange', this.pagerConfig.startValue)
    },
    prevClick(value) {
      this.$emit('setIndex')
      this.pagerConfig.startValue = (value - 1) * 5
      this.$emit('prevClick', this.pagerConfig.startValue)
    },
    /**
     * 点击设置为起点或者终点
     */
    setPoint(event) {
      this.$emit('setIndex')
      // 获取鼠标点击的设置起点或终点结果的id
      const nameId = event.currentTarget.id
      // 获取鼠标点击的设置起点或终点结果的名字
      this.nameRes.poiName = this.poiData[nameId].name
      // 获取鼠标点击的设置起点或终点结果的经纬度
      this.nameRes.lonLat = this.poiData[nameId].lonlat
      // 将鼠标点击所获取的结果传递到上一级组件
      this.$emit('settingPt', this.nameRes)
    },
  },
}
</script>

<style scoped>
.res-content {
  position: relative;
  margin-top: 10px;
  float: left;
  width: 100%;
  overflow: hidden;
}
.search-result {
  position: relative;
  float: left;
  background-color: white;
  width: 100%;
  overflow-x: hidden;
}
.search-bolck {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}
.place-bolck {
  float: left;
  border-width: 0px;
  background-color: white;
  margin-top: 3px;
  padding-bottom: 8px;
  padding-top: 0px;
  width: 320px;
}
.no-ul {
  float: left;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-top: 0px;
  padding-left: 0px;
}
.no-li {
  float: left;
  padding-bottom: 0px;
  list-style: none;
  cursor: pointer;
}
.img-position {
  position: relative;
  float: left;
  left: 30px;
  top: 12px;
  width: 21px;
  height: 25px;
}
.set-position {
  float: right;
  padding-top: 15px;
  padding-right: 10px;
  font-size: 12px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  color: #169bd5;
}
.place-name {
  position: relative;
  float: left;
  padding-top: 15px;
  padding-left: 38px;
  color: #169bd5;
  width: 190px;
  font-size: 13px;
  font-family: 'PingFang SC';
  font-weight: 500;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.address-info {
  position: relative;
  float: left;
  padding-left: 57px;
  padding-top: 10px;
  color: #7f7f7f;
  width: 248px;
  font-size: 12px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.el-paging {
  display: flex;
  justify-content: center;
}
</style>