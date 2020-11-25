<template>
  <el-container>
    <div class="result-content">
      <!--起点搜索结果-->
      <div class="start-info">
        <div class="start-tilte">
          <img
            ref="startimgDom"
            :src="imgContent.uncheckImg"
            class="start-img"
          />
          <span style="cursor: pointer;" @click="showStart"
            >起点：{{ startName }}</span
          >
          <span
            v-show="isShow.showStr"
            class="poi-change-city"
            @click="changeCity"
            >更换城市</span
          >
        </div>
        <div>
          <name-search
            v-show="isShow.showStr"
            ref="startCom"
            :flag="flag[0]"
            :poi-data="startData"
            :search-sum="startSum"
            @settingPt="settingStart"
            @nextClick="startNext"
            @currentChange="startCurrent"
            @prevClick="startPrev"
          ></name-search>
        </div>
      </div>
      <!--途经点搜索结果-->
      <div
        v-for="(iteam, index) in Datas"
        v-show="isShow.isPass"
        :key="index"
        class="pass-info"
      >
        <div :id="index" class="pass-tilte">
          <img ref="passimgDom" :src="imgContent.uncheckImg" class="pass-img" />
          <span :id="index" style="cursor: pointer;" @click="showPass($event)"
            >途经点：{{ iteam.passName }}</span
          >
          <span
            v-show="isShow.showPa[index].setting"
            class="poi-change-city"
            @click="changeCity"
            >更换城市</span
          >
        </div>
        <div>
          <name-search
            v-show="isShow.showPa[index].setting"
            :id="index"
            ref="passCom"
            :flag="flag[2]"
            :has-pass="hasPass"
            :poi-data="iteam.passData"
            :search-sum="iteam.passSum"
            @settingPt="settingPass"
            @setIndex="setIndex(index)"
            @nextClick="passNext"
            @currentChange="passCurrent"
            @prevClick="passPrev"
          ></name-search>
        </div>
      </div>
      <!--终点搜索结果-->
      <div class="end-info">
        <div class="end-tilte">
          <img
            ref="endimgDom"
            :src="imgContent.uncheckImg"
            class="ending-img"
          />
          <span style="cursor: pointer;" @click="showEnd"
            >终点：{{ endName }}</span
          >
          <span
            v-show="isShow.showEn"
            class="poi-change-city"
            @click="changeCity"
            >更换城市</span
          >
        </div>
        <div>
          <name-search
            v-show="isShow.showEn"
            ref="nameCom"
            :flag="flag[1]"
            :poi-data="endData"
            :search-sum="endSum"
            @settingPt="settingEnd"
            @nextClick="endNext"
            @currentChange="endCurrent"
            @prevClick="endPrev"
          ></name-search>
        </div>
      </div>
    </div>
  </el-container>
</template>

<script>
import {
  addnewPoint,
  goto,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState, mapMutations } from 'vuex'
import nameSearch from '@/components/RouteLinePlan/FunctionComponents/NameSearch'

export default {
  components: {
    nameSearch,
  },
  props: [
    'startDatas', // 起点地名查询结果
    'endingDatas', // 终点地名查询结果
    'passDatas', // 途经点地名查询结果
    'inputStrat', // 起点输入地名
    'inputEnding', // 终点输入地名
    'startSum', // 起点查询总数
    'endSum', // 终点查询总数
    'hasPass', // 是否有途经点输入框
    'drivingType',
  ],
  data() {
    return {
      flag: ['设为起点', '设为终点', '设为途经点'],
      startChange: '', // 用于存储起点地名
      endChange: '', // 用于存储终点地名
      startName: this.inputStrat,
      endName: this.inputEnding,
      passIndex: 0,
      passLatlon: [],
      lant: String,
      isShow: {
        showStr: true, // 最初显示起点查询结果
        showEn: false, // 最初隐藏终点查询结果
        showPa: [{ setting: false }, { setting: false }, { setting: false }],
        isPass: true,
      },
      // 引入控件所需图片
      imgContent: {
        uncheckImg: require('@/components/RouteLinePlan/images/startPoint.png'),
        checkImg: require('@/components/RouteLinePlan/images/endPoint.png'),
        errorImg: require('@/components/RouteLinePlan/images/errorPoint.png'),
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
    // 处理获取的起点结果数据
    startData() {
      return this.startDatas
    },
    // 处理获取的终点结果数据
    endData() {
      return this.endingDatas
    },
    // 处理获取的途经点结果数据
    Datas() {
      const temp = this.passDatas
      const tempArry = []
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].message !== '') {
          tempArry.push(temp[i])
        }
      }
      return tempArry
    },
  },
  watch: {
    passinputNum(value) {},
  },
  updated() {},
  methods: {
    // 获取在vuex中的提交更换城市方法
    ...mapMutations('map', {
      cityShow: 'changeCityBoxShow',
    }),
    /**
     * 更换城市
     */
    changeCity() {
      this.cityShow(false)
    },
    /**
     * 点击显示起点地名查询结果
     */
    showStart() {
      if (this.inputStrat === '没有结果') {
        alert('没有查询到结果')
      } else {
        if (this.hasPass) {
          this.isShow.showStr = !this.isShow.showStr
          if (this.isShow.showStr) {
            this.$refs.startimgDom.src = this.imgContent.uncheckImg
          }
        } else {
          this.isShow.showStr = true
          if (this.isShow.showStr) {
            this.$refs.startimgDom.src = this.imgContent.uncheckImg
          }
          this.isShow.showEn = false
        }
        // 添加查询到的起点地名结果的地图图标
        this.mainView.graphics.removeAll()
        // 缩放到查询结果的第一条
        this.lant = this.startData[0].lonlat // 获取到经纬度字符串
        goto(
          parseFloat(this.lantArry[1]),
          parseFloat(this.lantArry[0]),
          this.mainView
        )
        // 在地图上添加图标
        this.forFor(this.startData)
      }
    },
    showPass(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      if (this.Datas[divId].passName === '没有结果') {
        alert('没有查询到结果')
      } else {
        this.isShow.showPa[divId].setting = !this.isShow.showPa[divId].setting
        if (this.isShow.showPa[divId].setting) {
          this.$refs.passimgDom[divId].src = this.imgContent.uncheckImg
        }
        // 添加查询到的起点地名结果的地图图标
        this.mainView.graphics.removeAll()
        // 缩放到查询结果的第一条
        this.lant = this.Datas[divId].passData[0].lonlat // 获取到经纬度字符串
        goto(
          parseFloat(this.lantArry[1]),
          parseFloat(this.lantArry[0]),
          this.mainView
        )
        // 在地图上添加图标
        this.forFor(this.Datas[divId].passData)
      }
    },
    /**
     * 点击显示终点查询结果
     */
    showEnd() {
      if (this.inputEnding === '没有结果') {
        alert('没有查询到结果')
      } else {
        // 关闭查询结果的显示
        if (this.hasPass) {
          this.isShow.showEn = !this.isShow.showEn
          if (this.isShow.showEn) {
            this.$refs.endimgDom.src = this.imgContent.uncheckImg
          }
        } else {
          this.isShow.showStr = false
          this.isShow.showEn = true
          if (this.isShow.showEn) {
            this.$refs.endimgDom.src = this.imgContent.uncheckImg
          }
        }
        // 添加查询到的起点地名结果的地图图标
        this.mainView.graphics.removeAll()
        // 缩放到查询结果的第一条
        this.lant = this.endData[0].lonlat // 获取到经纬度字符串
        goto(
          parseFloat(this.lantArry[1]),
          parseFloat(this.lantArry[0]),
          this.mainView
        )
        // 在地图上添加图标
        this.forFor(this.endData)
      }
    },
    /**
     * 处理子组件传递的方法(起点)
     */
    settingStart(res) {
      // 获取点击'设置为起点'对应的地名
      this.startName = res.poiName
      this.startChange = res.poiName
      // 获取点击'设置为起点'对应的地名经纬度
      this.$emit('startlon', res.lonLat, res.poiName)
      // 改变对应图片样式
      this.$refs.startimgDom.src = this.imgContent.checkImg
      // 关闭起点查询结果显示界面
      this.isShow.showStr = false
      // 打开终点查询结果显示界面
      if (this.endChange === '' && !this.hasPass) {
        if (this.inputEnding === '没有结果') {
          alert('没有查询到结果')
        } else {
          if (this.hasPass) {
            this.isShow.showEn = false
          } else {
            this.isShow.showEn = true
          }
          // 添加查询到的起点地名结果的地图图标
          this.mainView.graphics.removeAll()
          // 缩放到查询结果的第一条
          this.lant = this.endData[0].lonlat // 获取到经纬度字符串
          goto(
            parseFloat(this.lantArry[1]),
            parseFloat(this.lantArry[0]),
            this.mainView
          )
          // 在地图上添加图标
          this.forFor(this.endData)
        }
      }
    },
    setIndex(index) {
      this.passIndex = index
    },
    settingPass(res) {
      let isAdd = true
      this.Datas[this.passIndex].passName = res.poiName
      this.isShow.showPa[this.passIndex].setting = false
      this.$refs.passimgDom[this.passIndex].src = this.imgContent.checkImg
      this.passLatlon[this.passIndex] = res.lonLat
      for (let n = 0; n < this.passLatlon.length; n++) {
        if (typeof this.passLatlon[n] === 'undefined') {
          isAdd = false
          break
        }
      }
      if (this.passLatlon.length === this.Datas.length && isAdd) {
        this.$emit('passlon', this.passLatlon)
      }
    },
    /**
     * 处理子组件传递的方法(终点)
     */
    settingEnd(res) {
      // 获取点击'设置为终点'对应的地名
      this.endName = res.poiName
      this.endChange = res.poiName
      // 获取点击'设置为终点'对应的地名经纬度
      this.$emit('endlon', res.lonLat, res.poiName)
      // 改变对应图片样式
      this.$refs.endimgDom.src = this.imgContent.checkImg
      // 关闭终点查询结果显示界面
      this.isShow.showEn = false
      // 打开终点查询结果显示界面
      if (this.startChange === '' && !this.hasPass) {
        if (this.inputStrat === '没有结果') {
          alert('没有查询到结果')
        } else {
          if (this.hasPass) {
            this.isShow.showStr = false
          } else {
            this.isShow.showStr = true
          }
          // 添加查询到的起点地名结果的地图图标
          this.mainView.graphics.removeAll()
          // 缩放到查询结果的第一条
          this.lant = this.startData[0].lonlat // 获取到经纬度字符串
          goto(
            parseFloat(this.lantArry[1]),
            parseFloat(this.lantArry[0]),
            this.mainView
          )
          // 在地图上添加图标
          this.forFor(this.startData)
        }
      }
    },
    /**
     * @param {*} value
     * 获取鼠标点击起点分页页码，并向上一级组件传递信息
     */
    startNext(value) {
      this.$emit('startNext', value)
    },
    startCurrent(value) {
      this.$emit('startCurrent', value)
    },
    startPrev(value) {
      this.$emit('startPrev', value)
    },
    /**
     * @param {*} value
     * 获取鼠标点击途经点分页页码，并向上一级组件传递信息
     */
    passNext(value) {
      this.$emit('passNext', value, this.passIndex)
    },
    passCurrent(value) {
      this.$emit('passCurrent', value, this.passIndex)
    },
    passPrev(value) {
      this.$emit('passPrev', value, this.passIndex)
    },
    /**
     * @param {*} value
     * 获取鼠标点击终点分页页码，并向上一级组件传递信息
     */
    endNext(value) {
      this.$emit('endNext', value)
    },
    endCurrent(value) {
      this.$emit('endCurrent', value)
    },
    endPrev(value) {
      this.$emit('endPrev', value)
    },
    forFor(data) {
      const dataArry = []
      for (let i = 0; i < data.length; i++) {
        this.lant = data[i].lonlat
        const lat = parseFloat(this.lantArry[1])
        const lon = parseFloat(this.lantArry[0])
        const num = {
          name: String,
          address: String,
          phone: String,
          lat: Number,
          lon: Number,
        }
        num.lat = lat
        num.lon = lon
        num.name = data[i].name
        num.address = data[i].address
        num.phone = data[i].phone
        dataArry.push(num)
      }
      addnewPoint(dataArry, this.imgPosition, this.mainView)
    },
  },
}
</script>

<style scoped>
.result-content {
  position: relative;
  width: 95%;
}
.start-info {
  position: relative;
  float: left;
  margin-bottom: 10px;
  width: 100%;
}
.start-tilte {
  float: left;
  width: 100%;
  line-height: 30px;
  padding-left: 5px;
  text-decoration: none;
  background: #f2f8ff;
  font-size: 13px;
  color: #000;
}
.start-img {
  position: relative;
  top: 5px;
}
.pass-info {
  position: relative;
  float: left;
  margin-bottom: 10px;
  mask-type: 10px;
  width: 100%;
}
.pass-tilte {
  position: relative;
  float: left;
  width: 100%;
  padding-left: 5px;
  text-decoration: none;
  font-size: 13px;
  color: #000;
  line-height: 30px;
  background: #f2f8ff;
}
.pass-img {
  position: relative;
  top: 5px;
}
.end-info {
  position: relative;
  float: left;
  margin-bottom: 10px;
  mask-type: 10px;
  width: 100%;
}
.end-tilte {
  position: relative;
  float: left;
  width: 100%;
  padding-left: 5px;
  text-decoration: none;
  font-size: 13px;
  color: #000;
  line-height: 30px;
  background: #f2f8ff;
}
.ending-img {
  position: relative;
  top: 5px;
}
.poi-change-city {
  float: right;
  margin-right: 10px;
  font-size: 13px;
  color: #2f87eb;
  cursor: pointer;
}
</style>