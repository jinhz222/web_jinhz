<template>
  <div class="bus-com">
    <!--输入控件的显示与增加-->
    <div class="input-controls">
      <!--起点输入框-->
      <div class="start-position">
        <span class="img-start"></span>
        <el-input
          v-model="inputStrat"
          type="text"
          class="start-input"
          placeholder="请输入起点"
          @keyup.enter.native="busSearch"
        ></el-input>
        <span
          v-show="isShow.startClose"
          class="start-clear el-icon-close"
          @click="clearStart"
        ></span>
        <span v-show="busType" class="center-ptr" @click="changeInput" />
      </div>
      <!--途经点输入框-->
      <ul v-show="drivingType" class="pass-ul">
        <li
          v-for="(item, index) in passShow"
          ref="divPass"
          :key="index"
          class="pass-li"
        >
          <span class="img-start"></span>
          <el-input
            v-model="item.text"
            type="text"
            class="pass-input"
            placeholder="请输入途经点"
            @keyup.enter.native="busSearch"
          ></el-input>
          <span
            class="clear-pass el-icon-close"
            @click="clearPass(index)"
          ></span>
          <span class="delete-pass" @click="reduceOne(index)"></span>
        </li>
      </ul>
      <!--终点输入框-->
      <div class="end-position">
        <span class="img-end"></span>
        <el-input
          v-model="inputEnding"
          type="text"
          class="end-input"
          placeholder="请输入终点"
          @keyup.enter.native="busSearch"
        ></el-input>
        <span
          v-show="isShow.endClose"
          class="end-clear el-icon-close"
          @click="clearEnd"
        ></span>
      </div>
    </div>
    <!--查询按钮-->
    <div class="bus-button">
      <span v-show="drivingType" class="add-new" @click="addOne"
        >+添加途经点</span
      >
      <div>
        <button class="search-but" @click="busSearch">搜索</button>
      </div>
    </div>
    <!--结果内容展示-->
    <div class="result-content">
      <poi-result
        v-show="isShow.showResult"
        ref="poiCom"
        :key="timer"
        :start-datas="startDatas"
        :pass-datas="passDatas"
        :ending-datas="endingDatas"
        :input-strat="startName"
        :input-ending="endName"
        :start-sum="startSum"
        :end-sum="endSum"
        :has-pass="hasPass"
        :driving-type="drivingType"
        @startlon="startLon"
        @passlon="passLon"
        @endlon="endLon"
        @startNext="startNext"
        @startCurrent="startCurrent"
        @startPrev="startPrev"
        @passNext="passNext"
        @passCurrent="passCurrent"
        @passPrev="passPrev"
        @endNext="endNext"
        @endCurrent="endCurrent"
        @endPrev="endPrev"
      ></poi-result>
      <route-result
        v-show="isShow.showRoute"
        :key="time"
        :bus-lines="busLine"
        :start-name="startPoiname"
        :end-name="endPoiname"
        :startlon-arry="startlonArry"
        :endlon-arry="endlonArry"
        @routeFast="routeFast"
        @routeChange="routeChange"
        @routeWalk="routeWalk"
        @walkname="walkName"
        @busname="busName"
        @closepro="closeProp"
        @clickmap="clickMap"
      ></route-result>
      <driving-result
        v-show="isShow.showDrive"
        ref="driveDom"
        :key="time1"
        :drive-data="driveDatas.result"
        :start-name="startPoiname"
        :end-name="endPoiname"
        @driveFast="driveFast"
        @driveLest="driveLest"
        @driveHighway="driveHighway"
      ></driving-result>
    </div>
  </div>
</template>

<script>
import X2js from 'x2js'
import { busRoute, driveRoute } from '@/api/routeRequest'
import { poiSearch, citySearch } from '@/api/poiRequest'
import {
  addnewPoint,
  goto,
  setbusLine,
  setPoint,
} from '@/components/RouteLinePlan/FunctionJSfile/mapFun'
import { mapState, mapMutations } from 'vuex'
import poiResult from '@/components/RouteLinePlan/FunctionComponents/PoiResult'
import routeResult from '@/components/RouteLinePlan/BusRouteComponents/RouteResult'
import drivingResult from '@/components/RouteLinePlan/DrivingRouteComponents/DrivingResult'

export default {
  components: {
    poiResult,
    routeResult,
    drivingResult,
  },
  props: ['drivingType', 'busType'],
  data() {
    return {
      cityNames: '成都',
      timer: '1', // 设置时间戳
      time: '2',
      time1: '4',
      timer1: '3',
      searchType: 0,
      inputStrat: '', // 起点输入框值
      startName: '',
      inputEnding: '', // 终点输入框值
      endName: '',
      // 地名查询所需参数
      searchConfig: {
        searchInfo: '', // 查询所需要的内容
        cityCode: '', // 获取城市的行政编码
        startValue: 0, // 起点查询页数点击切换初始值
        endValue: 0, // 终点查询页数点击切换初始值
        passValue: 0, // 途经点页数点击切换初始值
        mapBound: '', // 用于存储搜索范围
      },
      // 标签展示或隐藏
      isShow: {
        showResult: false, // 显示地名查询结果
        showRoute: false, // 公交路径查询结果
        drivingResult: false,
        showDrive: false, // 自驾路径查询结果
        startClose: false, // 清除起点输入框
        endClose: false, // 清除终点输入框
        passEmpty: true, // 判断途经点输入框是否为空
      },
      // 经过点输入框
      passShow: [], // 输入框途经点字符串
      passLat: [], // 途经点的经纬度字符串数组
      passPoint: '', // 每个途经点经纬度
      passinputNum: 0, // 途经点输入框个数
      passName: '',
      passDatas: [
        // 途经点poi搜索结果数组
        {
          passName: '',
          passSum: 0,
          message: '',
          passData: [],
        },
        {
          passName: '',
          passSum: 0,
          message: '',
          passData: [],
        },
        {
          passName: '',
          passSum: 0,
          message: '',
          passData: [],
        },
      ],
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
        startPro: require('@/assets/images/start.png'),
        passingPro: require('@/assets/images/passing.png'),
        endPro: require('@/assets/images/ending.png'),
        errorImg: require('@/components/RouteLinePlan/images/errorPoint.png'),
      },
      // 起点地名查询数据结果
      startDatas: [],
      // 起点地名查询结果总数
      startSum: 0,
      // 起点查询无结果传递参数
      startString: '',
      // 终点地名查询数据结果
      endingDatas: [],
      // 起点地名查询结果总数
      endSum: 0,
      // 终点查询无结果传递参数
      endString: '',
      // 经纬度字符串
      lant: String,
      startLonlat: '', // 起点地名经纬度
      endLonlat: '', // 终点地名经纬度
      startPoiname: '', // 设置为起点的名字
      endPoiname: '', // 设置为终点的名字
      // 公交导航路线相关变量
      busLine: [],
      // 自驾导航路线相关变量
      driveDatas: {
        // 自驾路线网络请求返回数据
        result: {
          simple: {
            item: [],
          },
          routes: {
            item: [],
          },
          distance: '',
          routelatlon: '',
          _dest: '',
          _mid: '',
          _orig: '',
        },
      },
      startIndex: 0,
      linePoint: '', // 自驾线路经纬度字符串
      lonLatt: '', // 自驾路线转折点经纬度字符串
    }
  },
  mounted() {
    this.inputStrat = this.setStartName
    this.inputEnding = this.setEndName
    if (this.setPassName !== '') {
      this.addOne()
      this.passShow[0].text = this.setPassName
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
     * 获取设置的起点、途经点、终点的地名字符串
     */
    ...mapState({
      setStartName: (state) => state.startPOI,
      setPassName: (state) => state.passPOI,
      setEndName: (state) => state.endPOI,
    }),
    hasPass() {
      if (this.passShow.length > 0) {
        return true
      } else {
        return false
      }
    },
    /**
     * 将获取到的经纬度字符串按空格分割成数组
     */
    lantArry() {
      return this.lant.split(' ')
    },
    // 处理从子组件获取到的起点和终点地名的经纬度
    startlonArry() {
      return this.startLonlat.split(' ')
    },
    endlonArry() {
      return this.endLonlat.split(' ')
    },
    lineArry() {
      return this.linePoint.split(';')
    },
    lonlatArry() {
      return this.lonLatt.split(',')
    },
    passPointarry() {
      return this.passPoint.split(' ')
    },
    passString() {
      const temp = this.passLat
      let passArr = []
      let passStr = ''
      for (let i = 0; i < temp.length; i++) {
        passArr = temp[i].split(' ')
        for (let n = 0; n < passArr.length; n++) {
          if (n === passArr.length - 1) {
            passStr = passStr + passArr[n] + ';'
          } else {
            passStr = passStr + passArr[n] + ','
          }
        }
      }
      return passStr
    },
  },
  watch: {
    inputStrat(value) {
      if (value !== '') {
        this.isShow.startClose = true
      } else {
        this.isShow.startClose = false
      }
    },
    inputEnding(value) {
      if (value !== '') {
        this.isShow.endClose = true
      } else {
        this.isShow.endClose = false
      }
    },
  },
  updated() {},
  methods: {
    // 提交vuex中state的状态
    ...mapMutations({
      setStart: 'setStartPOI',
      setPass: 'setPassPOI',
      setEnd: 'setEndPOI',
    }),
    /**
     * 起点和终点输入框互换
     */
    changeInput() {
      if (this.inputStrat !== '' && this.inputEnding !== '') {
        let tempInput = ''
        tempInput = this.inputStrat
        this.inputStrat = this.inputEnding
        this.inputEnding = tempInput
      }
    },
    /**
     * 清空起点输入框
     */
    clearStart() {
      this.inputStrat = ''
    },
    /**
     * 清空途经点输入框
     */
    clearPass(index) {
      this.passShow[index].text = ''
    },
    /**
     * 清空终点输入框
     */
    clearEnd() {
      this.inputEnding = ''
    },
    /**
     * 关闭弹窗
     */
    closeProp() {
      this.$emit('closepro')
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
    clickMap() {
      this.$emit('clickmap')
    },
    /**
     * @param {*} value
     * 根据起始点经纬度进行路线导航查询
     */
    startLon(value, name) {
      // 获取路线查询的起点的经纬度
      this.startLonlat = value
      // 获取路线查询的地名
      this.startPoiname = name
      if (this.startLonlat !== '' && this.endLonlat !== '') {
        const _self = this
        if (this.busType) {
          busRoute({
            startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
            endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
            linetype: 1,
          })
            .then((res) => {
              if (res.data.resultCode === 0) {
                _self.busLine = res.data.results[0].lines
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showDrive = false
                // 重新渲染子组件
                this.time = new Date().getTime()
                // 打开路径显示结果
                _self.isShow.showRoute = true
                // 清空地图图标
                _self.mainView.graphics.removeAll()
              } else {
                alert('没有结果')
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showDrive = false
                // 打开路径显示结果
                _self.busLine = []
                _self.mainView.graphics.removeAll()
                _self.isShow.showRoute = true
              }
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          console.log('3')
          if (this.hasPass && this.passLat.length === this.passShow.length) {
            driveRoute({
              startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
              endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
              passposition: this.passString,
              style: 0,
            })
              .then((res) => {
                const xjsData = new X2js()
                _self.driveDatas = xjsData.xml2js(res.data)
                // console.log(_self.driveDatas.result)
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showRoute = false
                // 清空地图图标
                _self.mainView.graphics.removeAll()
                // 重新渲染子组件
                this.time1 = new Date().getTime()
                // 打开路径显示结果
                _self.isShow.showDrive = true
                if (
                  typeof _self.driveDatas.result.simple.item === 'undefined'
                ) {
                  alert('没有详细路线结果')
                } else {
                  // 添加自驾路线
                  // 获取路线经纬度字符串
                  _self.linePoint = _self.driveDatas.result.routelatlon
                  const linebusPaths = []
                  for (let m = 0; m < _self.lineArry.length - 1; m++) {
                    _self.lonLatt = _self.lineArry[m]
                    const pointbusLon = []
                    // 将每个转折点的经纬度字符串数据转化为浮点型数组
                    pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                    pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                    linebusPaths.push(pointbusLon)
                  }
                  // 在地图上添加路径
                  setbusLine(linebusPaths, _self.mainView)
                  // 在地图上添加起点、途经点、终点
                  setPoint(
                    _self.startlonArry[1],
                    _self.startlonArry[0],
                    _self.imgPosition.startPro,
                    _self.startPoiname,
                    _self.mainView
                  )
                  setPoint(
                    _self.endlonArry[1],
                    _self.endlonArry[0],
                    _self.imgPosition.endPro,
                    _self.endPoiname,
                    _self.mainView
                  )
                  for (let i = 0; i < this.passLat.length; i++) {
                    this.passPoint = this.passLat[i]
                    setPoint(
                      _self.passPointarry[1],
                      _self.passPointarry[0],
                      _self.imgPosition.passingPro,
                      _self.passShow[i].text,
                      _self.mainView
                    )
                  }
                  // 地图缩放
                  goto(
                    parseFloat(_self.startlonArry[1]),
                    parseFloat(_self.startlonArry[0]),
                    _self.mainView
                  )
                }
              })
              .catch((err) => {
                console.log(err)
              })
          } else if (!this.hasPass) {
            driveRoute({
              startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
              endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
              passposition: '',
              style: 0,
            })
              .then((res) => {
                const xjsData = new X2js()
                _self.driveDatas = xjsData.xml2js(res.data)
                // console.log(_self.driveDatas.result)
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showRoute = false
                // 重新渲染子组件
                this.time1 = new Date().getTime()
                // 清空地图图标
                _self.mainView.graphics.removeAll()
                // 打开路径显示结果
                _self.isShow.showDrive = true
                if (
                  typeof _self.driveDatas.result.simple.item === 'undefined'
                ) {
                  alert('没有详细路线结果')
                } else {
                  // 添加自驾路线
                  // 获取路线经纬度字符串
                  _self.linePoint = _self.driveDatas.result.routelatlon
                  const linebusPaths = []
                  for (let m = 0; m < _self.lineArry.length - 1; m++) {
                    _self.lonLatt = _self.lineArry[m]
                    const pointbusLon = []
                    // 将每个转折点的经纬度字符串数据转化为浮点型数组
                    pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                    pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                    linebusPaths.push(pointbusLon)
                  }
                  // 在地图上添加路径
                  setbusLine(linebusPaths, _self.mainView)
                  // 在地图上添加起点、途经点、终点
                  setPoint(
                    _self.startlonArry[1],
                    _self.startlonArry[0],
                    _self.imgPosition.startPro,
                    _self.startPoiname,
                    _self.mainView
                  )
                  setPoint(
                    _self.endlonArry[1],
                    _self.endlonArry[0],
                    _self.imgPosition.endPro,
                    _self.endPoiname,
                    _self.mainView
                  )
                  // 地图缩放
                  goto(
                    parseFloat(_self.startlonArry[1]),
                    parseFloat(_self.startlonArry[0]),
                    _self.mainView
                  )
                }
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }
      }
    },
    passLon(value) {
      this.passLat = value
      console.log('2')
      if (this.startLonlat !== '' && this.endLonlat !== '' && this.hasPass) {
        const _self = this
        driveRoute({
          startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
          endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
          passposition: this.passString,
          style: 0,
        })
          .then((res) => {
            const xjsData = new X2js()
            _self.driveDatas = xjsData.xml2js(res.data)
            // c.log(_self.driveDatas.result)
            // 关闭路径导航起始点地名搜索
            _self.isShow.showResult = false
            _self.isShow.showRoute = false
            // 重新渲染子组件
            this.time1 = new Date().getTime()
            // 清空地图图标
            _self.mainView.graphics.removeAll()
            // 打开路径显示结果
            _self.isShow.showDrive = true
            if (typeof _self.driveDatas.result.simple.item === 'undefined') {
              alert('没有详细路线结果')
            } else {
              // 添加自驾路线
              // 获取路线经纬度字符串
              _self.linePoint = _self.driveDatas.result.routelatlon
              const linebusPaths = []
              for (let m = 0; m < _self.lineArry.length - 1; m++) {
                _self.lonLatt = _self.lineArry[m]
                const pointbusLon = []
                // 将每个转折点的经纬度字符串数据转化为浮点型数组
                pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                linebusPaths.push(pointbusLon)
              }
              // 在地图上添加路径
              setbusLine(linebusPaths, _self.mainView)
              // 在地图上添加起点、途经点、终点
              setPoint(
                _self.startlonArry[1],
                _self.startlonArry[0],
                _self.imgPosition.startPro,
                _self.startPoiname,
                _self.mainView
              )
              setPoint(
                _self.endlonArry[1],
                _self.endlonArry[0],
                _self.imgPosition.endPro,
                _self.endPoiname,
                _self.mainView
              )
              for (let i = 0; i < this.passLat.length; i++) {
                this.passPoint = this.passLat[i]
                setPoint(
                  _self.passPointarry[1],
                  _self.passPointarry[0],
                  _self.imgPosition.passingPro,
                  _self.passShow[i].text,
                  _self.mainView
                )
              }
              // 地图缩放
              goto(
                parseFloat(_self.startlonArry[1]),
                parseFloat(_self.startlonArry[0]),
                _self.mainView
              )
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    /**
     * @param {*} value
     * 根据起始点经纬度进行路线导航查询
     */
    endLon(value, name) {
      // 获取路线查询的终点的经纬度
      this.endLonlat = value
      // 获取路线查询的地名
      this.endPoiname = name
      if (this.startLonlat !== '' && this.endLonlat !== '') {
        const _self = this
        if (this.busType) {
          busRoute({
            startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
            endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
            linetype: 1,
          })
            .then((res) => {
              if (res.data.resultCode === 0) {
                _self.busLine = res.data.results[0].lines
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showDrive = false
                // 重新渲染子组件
                this.time = new Date().getTime()
                // 打开路径显示结果
                _self.isShow.showRoute = true
                // 清空地图图标
                _self.mainView.graphics.removeAll()
              } else {
                alert('没有结果')
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showDrive = false
                // 打开路径显示结果
                _self.busLine = []
                _self.mainView.graphics.removeAll()
                _self.isShow.showRoute = true
              }
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          console.log('1')
          if (this.hasPass && this.passLat.length === this.passShow.length) {
            driveRoute({
              startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
              endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
              passposition: this.passString,
              style: 0,
            })
              .then((res) => {
                const xjsData = new X2js()
                _self.driveDatas = xjsData.xml2js(res.data)
                // console.log(_self.driveDatas.result)
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showRoute = false
                // 重新渲染子组件
                this.time1 = new Date().getTime()
                // 清空地图图标
                _self.mainView.graphics.removeAll()
                // 打开路径显示结果
                _self.isShow.showDrive = true
                if (
                  typeof _self.driveDatas.result.simple.item === 'undefined'
                ) {
                  alert('没有详细路线结果')
                } else {
                  // 添加自驾路线
                  // 获取路线经纬度字符串
                  _self.linePoint = _self.driveDatas.result.routelatlon
                  const linebusPaths = []
                  for (let m = 0; m < _self.lineArry.length - 1; m++) {
                    _self.lonLatt = _self.lineArry[m]
                    const pointbusLon = []
                    // 将每个转折点的经纬度字符串数据转化为浮点型数组
                    pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                    pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                    linebusPaths.push(pointbusLon)
                  }
                  // 在地图上添加路径
                  setbusLine(linebusPaths, _self.mainView)
                  // 在地图上添加起点、途经点、终点
                  setPoint(
                    _self.startlonArry[1],
                    _self.startlonArry[0],
                    _self.imgPosition.startPro,
                    _self.startPoiname,
                    _self.mainView
                  )
                  setPoint(
                    _self.endlonArry[1],
                    _self.endlonArry[0],
                    _self.imgPosition.endPro,
                    _self.endPoiname,
                    _self.mainView
                  )
                  for (let i = 0; i < this.passLat.length; i++) {
                    this.passPoint = this.passLat[i]
                    setPoint(
                      _self.passPointarry[1],
                      _self.passPointarry[0],
                      _self.imgPosition.passingPro,
                      _self.passShow[i].text,
                      _self.mainView
                    )
                  }
                  // 地图缩放
                  goto(
                    parseFloat(_self.startlonArry[1]),
                    parseFloat(_self.startlonArry[0]),
                    _self.mainView
                  )
                }
              })
              .catch((err) => {
                console.log(err)
              })
          } else if (!this.hasPass) {
            driveRoute({
              startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
              endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
              passposition: '',
              style: 0,
            })
              .then((res) => {
                const xjsData = new X2js()
                _self.driveDatas = xjsData.xml2js(res.data)
                // console.log(_self.driveDatas.result)
                // 关闭路径导航起始点地名搜索
                _self.isShow.showResult = false
                _self.isShow.showRoute = false
                // 重新渲染子组件
                this.time1 = new Date().getTime()
                // 清空地图图标
                _self.mainView.graphics.removeAll()
                // 打开路径显示结果
                _self.isShow.showDrive = true
                if (
                  typeof _self.driveDatas.result.simple.item === 'undefined'
                ) {
                  alert('没有详细路线结果')
                } else {
                  // 添加自驾路线
                  // 获取路线经纬度字符串
                  _self.linePoint = _self.driveDatas.result.routelatlon
                  const linebusPaths = []
                  for (let m = 0; m < _self.lineArry.length - 1; m++) {
                    _self.lonLatt = _self.lineArry[m]
                    const pointbusLon = []
                    // 将每个转折点的经纬度字符串数据转化为浮点型数组
                    pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                    pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                    linebusPaths.push(pointbusLon)
                  }
                  // 在地图上添加路径
                  setbusLine(linebusPaths, _self.mainView)
                  // 在地图上添加起点、途经点、终点
                  setPoint(
                    _self.startlonArry[1],
                    _self.startlonArry[0],
                    _self.imgPosition.startPro,
                    _self.startPoiname,
                    _self.mainView
                  )
                  setPoint(
                    _self.endlonArry[1],
                    _self.endlonArry[0],
                    _self.imgPosition.endPro,
                    _self.endPoiname,
                    _self.mainView
                  )
                  // 地图缩放
                  goto(
                    parseFloat(_self.startlonArry[1]),
                    parseFloat(_self.startlonArry[0]),
                    _self.mainView
                  )
                }
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }
      }
    },
    /**
     * @param {*} value
     * 根据选择的为'较快捷'类型进行路线查询
     */
    routeFast(value) {
      this.getRoute(value)
    },
    /**
     * @param {*} value
     * 根据选择的为'少换乘'类型进行路线查询
     */
    routeChange(value) {
      this.getRoute(value)
    },
    /**
     * @param {*} value
     * 根据选择的为'少步行'类型进行路线查询
     */
    routeWalk(value) {
      this.getRoute(value)
    },
    /**
     * @param {*} value
     * 根据选择的为'最快路线'类型进行路线查询
     */
    driveFast(value) {
      if (this.hasPass) {
        this.getDrive(value)
      } else {
        this.getnewDrive(value)
      }
    },
    /**
     * @param {*} value
     * 根据选择的为'最短路线'类型进行路线查询
     */
    driveLest(value) {
      if (this.hasPass) {
        this.getDrive(value)
      } else {
        this.getnewDrive(value)
      }
    },
    /**
     * @param {*} value
     * 根据选择的为'少走高速'类型进行路线查询
     */
    driveHighway(value) {
      if (this.hasPass) {
        this.getDrive(value)
      } else {
        this.getnewDrive(value)
      }
    },
    /**
     * 增加或减少输入框
     */
    addOne() {
      if (this.passShow.length < 3) {
        this.passinputNum++
        this.passShow.push({
          text: '',
        })
      }
    },
    reduceOne(divId) {
      const copyTmep = JSON.parse(JSON.stringify(this.passShow))
      copyTmep.splice(divId, 1)
      this.passShow = copyTmep
      this.passinputNum--
    },
    /**
     * @param {*} value
     * 鼠标点击起点分页的下一页进行查询
     */
    startNext(value) {
      // 获得分页查询的起始位置
      this.searchConfig.startValue = value
      // 进行起点地名查询
      this.getStartinfo()
    },
    /**
     * @param {*} value
     * 鼠标点击起点分页的下一页进行查询
     */
    startCurrent(value) {
      this.searchConfig.startValue = value
      this.getStartinfo()
    },
    /**
     * @param {*} value
     * 鼠标点击起点分页的上一页进行查询
     */
    startPrev(value) {
      this.searchConfig.startValue = value
      this.getStartinfo()
    },
    /**
     * @param {*} value
     * 鼠标点击途经点分页的下一页进行查询
     */
    passNext(value, index) {
      // 获得分页查询的起始位置
      this.searchConfig.passValue = value
      // 进行途经点地名查询
      this.getPassinfo(this.passShow[index].text, index, true)
    },
    /**
     * @param {*} value
     * 鼠标点击途经点分页的下一页进行查询
     */
    passCurrent(value, index) {
      this.searchConfig.passValue = value
      this.getPassinfo(this.passShow[index].text, index, true)
    },
    /**
     * @param {*} value
     * 鼠标点击途经点分页的上一页进行查询
     */
    passPrev(value, index) {
      this.searchConfig.passValue = value
      this.getPassinfo(this.passShow[index].text, index, true)
    },
    /**
     * @param {*} value
     * 鼠标点击终点分页的下一页进行查询
     */
    endNext(value) {
      // 获得分页查询的起始位置
      this.searchConfig.endValue = value
      // 进行终点地名查询
      this.getEndinfo(true)
    },
    /**
     * @param {*} value
     * 鼠标点击终点分页的下一页进行查询
     */
    endCurrent(value) {
      this.searchConfig.endValue = value
      this.getEndinfo(true)
    },
    /**
     * @param {*} value
     * 鼠标点击终点分页的上一页进行查询
     */
    endPrev(value) {
      this.searchConfig.endValue = value
      this.getEndinfo(true)
    },
    /**
     * 根据起始点的地名进行地名查询
     */
    busSearch() {
      // 提交vuex中的状态值
      this.setStart('')
      this.setPass('')
      this.setEnd('')
      if (this.drivingType) {
        if (this.passinputNum > 0) {
          this.searchType = 3
        } else {
          this.searchType = 2
        }
      } else {
        this.searchType = 1
      }
      switch (this.searchType) {
        case 1:
          if (this.inputStrat !== '' && this.inputEnding !== '') {
            // 初始化弹框
            this.$emit('back')
            // 分页查询初始化
            this.searchConfig.startValue = 0
            this.searchConfig.endValue = 0
            // 关闭路径控件
            this.isShow.showRoute = false
            this.isShow.showDrive = false
            this.isShow.showResult = true
            // 初始化变量
            this.endPoiname = ''
            this.startPoiname = ''
            this.startLonlat = ''
            this.endLonlat = ''
            this.passDatas = [
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
            ]
            // 获取起始点输入值
            this.startName = this.inputStrat
            this.endName = this.inputEnding
            // 获取城市编码
            // 根据城市编码以及地名关键字进行查询
            this.getBound()
            // 获得起点和终点结果后将结果传到子组件中
            // 对查询结果进行渲染
            // 初始化子组件
            this.timer = new Date().getTime()
          } else {
            alert('请输入起点或终点的地名')
          }
          break
        case 2:
          if (this.inputStrat !== '' && this.inputEnding !== '') {
            // 初始化弹框
            this.$emit('back')
            // 分页查询初始化
            this.searchConfig.startValue = 0
            this.searchConfig.endValue = 0
            // 关闭路径控件
            this.isShow.showRoute = false
            this.isShow.showDrive = false
            this.isShow.showResult = true
            // 初始化变量
            this.endPoiname = ''
            this.startPoiname = ''
            this.startLonlat = ''
            this.endLonlat = ''
            this.passDatas = [
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
            ]
            // 获取起始点输入值
            this.startName = this.inputStrat
            this.endName = this.inputEnding
            // 获取城市编码
            // 根据城市编码以及地名关键字进行查询
            this.getBound()
            // 获得起点和终点结果后将结果传到子组件中
            // 对查询结果进行渲染
            // 初始化子组件
            this.timer = new Date().getTime()
          } else {
            alert('请输入起点或终点的地名')
          }
          break
        case 3:
          for (let i = 0; i < this.passinputNum; i++) {
            if (this.passShow[i].text === '') {
              this.isShow.passEmpty = true
              break
            } else {
              this.isShow.passEmpty = false
            }
          }
          if (
            this.inputStrat !== '' &&
            this.inputEnding !== '' &&
            !this.isShow.passEmpty
          ) {
            // 初始化弹框
            this.$emit('back')
            // 分页查询初始化
            this.searchConfig.startValue = 0
            this.searchConfig.endValue = 0
            this.searchConfig.passValue = 0
            // 关闭路径控件
            this.isShow.showRoute = false
            this.isShow.showDrive = false
            this.isShow.showResult = true
            // 初始化变量
            this.endPoiname = ''
            this.startPoiname = ''
            this.startLonlat = ''
            this.passLat = []
            this.endLonlat = ''
            this.passDatas = [
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
              {
                passName: '',
                passSum: 0,
                message: '',
                passData: [],
              },
            ]
            // 获取起始点输入值
            this.startName = this.inputStrat
            this.endName = this.inputEnding
            this.passNames = this.inputPass
            // 获取城市编码
            // 根据城市编码以及地名关键字进行查询
            this.getBound()
            // 获得起点和终点结果后将结果传到子组件中
            // 对查询结果进行渲染
            // 初始化子组件
            this.timer = new Date().getTime()
          } else {
            alert('请输入起点或途经点或终点的地名')
          }
          break
      }
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
    /**
     * 进行路线搜索
     */
    getRoute(routeType) {
      if (this.startLonlat !== '' && this.endLonlat !== '') {
        const _self = this
        busRoute({
          startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
          endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
          linetype: routeType,
        })
          .then((res) => {
            if (res.data.resultCode === 0) {
              _self.busLine = res.data.results[0].lines
              // 关闭路径导航起始点地名搜索
              _self.isShow.showResult = false
              _self.isShow.showDrive = false
              // 打开路径显示结果
              _self.mainView.graphics.removeAll()
              _self.isShow.showRoute = true
            } else {
              alert('没有路线查询结果')
              // 关闭路径导航起始点地名搜索
              _self.isShow.showResult = false
              _self.isShow.showDrive = false
              // 打开路径显示结果
              _self.busLine = []
              _self.mainView.graphics.removeAll()
              _self.isShow.showRoute = true
            }
          })
          .catch((err) => {
            console.log(err)
          })
      } else {
        alert('无起始点结果信息')
      }
    },
    getDrive(styleType) {
      if (this.startLonlat !== '' && this.endLonlat !== '') {
        const _self = this
        driveRoute({
          startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
          endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
          passposition: this.passString,
          style: styleType,
        })
          .then((res) => {
            const xjsData = new X2js()
            _self.driveDatas = xjsData.xml2js(res.data)
            // 关闭路径导航起始点地名搜索
            _self.isShow.showResult = false
            // 重新渲染子组件
            // 打开路径显示结果
            _self.isShow.showRoute = false
            // 清空地图图标
            _self.mainView.graphics.removeAll()
            _self.isShow.showDrive = true
            if (typeof _self.driveDatas.result.simple.item === 'undefined') {
              alert('没有详细路线结果')
            } else {
              // 在地图上添加自驾路线
              _self.linePoint = _self.driveDatas.result.routelatlon
              const linebusPaths = []
              for (let m = 0; m < _self.lineArry.length - 1; m++) {
                _self.lonLatt = _self.lineArry[m]
                const pointbusLon = []
                // 将每个转折点的经纬度字符串数据转化为浮点型数组
                pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                linebusPaths.push(pointbusLon)
              }
              // 在地图上添加路径
              setbusLine(linebusPaths, _self.mainView)
              // 在地图上添加起点、途经点、终点
              setPoint(
                _self.startlonArry[1],
                _self.startlonArry[0],
                _self.imgPosition.startPro,
                _self.startPoiname,
                _self.mainView
              )
              setPoint(
                _self.endlonArry[1],
                _self.endlonArry[0],
                _self.imgPosition.endPro,
                _self.endPoiname,
                _self.mainView
              )
              if (_self.hasPass) {
                for (let i = 0; i < this.passLat.length; i++) {
                  this.passPoint = this.passLat[i]
                  setPoint(
                    _self.passPointarry[1],
                    _self.passPointarry[0],
                    _self.imgPosition.passingPro,
                    _self.passShow[i].text,
                    _self.mainView
                  )
                }
              }
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    getnewDrive(styleType) {
      if (this.startLonlat !== '' && this.endLonlat !== '') {
        const _self = this
        driveRoute({
          startposition: this.startlonArry[0] + ',' + this.startlonArry[1],
          endposition: this.endlonArry[0] + ',' + this.endlonArry[1],
          passposition: '',
          style: styleType,
        })
          .then((res) => {
            const xjsData = new X2js()
            _self.driveDatas = xjsData.xml2js(res.data)
            // 关闭路径导航起始点地名搜索
            _self.isShow.showResult = false
            // 重新渲染子组件
            // 打开路径显示结果
            _self.isShow.showRoute = false
            // 清空地图图标
            _self.mainView.graphics.removeAll()
            _self.isShow.showDrive = true
            if (typeof _self.driveDatas.result.simple.item === 'undefined') {
              alert('没有详细路线结果')
            } else {
              // 在地图上添加自驾路线
              _self.linePoint = _self.driveDatas.result.routelatlon
              const linebusPaths = []
              for (let m = 0; m < _self.lineArry.length - 1; m++) {
                _self.lonLatt = _self.lineArry[m]
                const pointbusLon = []
                // 将每个转折点的经纬度字符串数据转化为浮点型数组
                pointbusLon.push(parseFloat(_self.lonlatArry[0]))
                pointbusLon.push(parseFloat(_self.lonlatArry[1]))
                linebusPaths.push(pointbusLon)
              }
              // 在地图上添加路径
              setbusLine(linebusPaths, _self.mainView)
              // 在地图上添加起点、途经点、终点
              setPoint(
                _self.startlonArry[1],
                _self.startlonArry[0],
                _self.imgPosition.startPro,
                _self.startPoiname,
                _self.mainView
              )
              setPoint(
                _self.endlonArry[1],
                _self.endlonArry[0],
                _self.imgPosition.endPro,
                _self.endPoiname,
                _self.mainView
              )
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    /**
     * 网络请求获取地图范围信息后，进行poi查询
     */
    getBound() {
      // 确定查询的地图范围
      const _self = this
      citySearch({
        cityName: this.cityNames,
      })
        .then((res) => {
          // 获取行政区范围
          _self.searchConfig.mapBound = res.data.data[0].bound
          // 获取城市编码
          _self.searchConfig.cityCode = res.data.data[0].cityCode
          // 进行起点地名查询
          _self.getStartinfo()
          // 进行经过点地名查询
          for (let i = 0; i < _self.passShow.length; i++) {
            if (_self.passShow[i].text !== '') {
              _self.getPassinfo(_self.passShow[i].text, i, false)
            }
          }
          // 进行终点地名查询
          _self.getEndinfo(false)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取行政区内起点poi数据信息
     */
    getStartinfo() {
      const _self = this
      poiSearch({
        input: this.inputStrat,
        mapBound: this.searchConfig.mapBound,
        queryType: '1',
        start: this.searchConfig.startValue + '',
        count: '5',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.startSum = res.data.count // 获取起点地名查询总数
          _self.startDatas = res.data.pois // 获取起点地名查询结果集
          if (_self.startSum > 0) {
            if (this.drivingType) {
              _self.isShow.showDrive = false
              _self.isShow.showResult = true
            } else {
              _self.isShow.showResult = true
              _self.isShow.showRoute = false
            }
            _self.mainView.graphics.removeAll()
            // 缩放到查询结果的第一条
            _self.lant = _self.startDatas[0].lonlat // 获取到经纬度字符串
            goto(
              parseFloat(_self.lantArry[1]),
              parseFloat(_self.lantArry[0]),
              _self.mainView
            )
            // 在地图上添加图标
            _self.forFor(_self.startDatas)
          } else {
            this.startName = '没有结果'
            // 将子组件对应的img标签改变
            this.$refs.poiCom.isShow.showStr = false
            this.$refs.poiCom.startName = '没有结果'
            this.$refs.poiCom.$refs.startimgDom.src = this.imgPosition.errorImg
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取行政区内途经点poi数据信息
     */
    getPassinfo(passName, index, flag) {
      const _self = this
      poiSearch({
        input: passName,
        mapBound: this.searchConfig.mapBound,
        queryType: '1',
        start: this.searchConfig.passValue + '',
        count: '5',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.passDatas[index].passSum = res.data.count // 获取起点地名查询总数
          _self.passDatas[index].passData = res.data.pois // 获取起点地名查询结果集
          if (_self.passDatas[index].passSum > 0) {
            _self.passDatas[index].message = '有结果'
            _self.passDatas[index].passName = passName
            if (this.drivingType) {
              _self.isShow.showDrive = false
              _self.isShow.showResult = true
            } else {
              _self.isShow.showResult = true
              _self.isShow.showRoute = false
            }
            if (flag) {
              _self.mainView.graphics.removeAll()
              // 缩放到查询结果的第一条
              _self.lant = _self.passDatas[index].passData[0].lonlat // 获取到经纬度字符串
              goto(
                parseFloat(_self.lantArry[1]),
                parseFloat(_self.lantArry[0]),
                _self.mainView
              )
              // 在地图上添加图标
              _self.forFor(_self.passDatas[index].passData)
            }
          } else {
            _self.passDatas[index].message = '没有结果'
            _self.passDatas[index].passName = '没有结果'
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取行政区内终点poi数据信息
     */
    getEndinfo(flag) {
      const _self = this
      poiSearch({
        input: this.inputEnding,
        mapBound: this.searchConfig.mapBound,
        queryType: '1',
        start: this.searchConfig.endValue + '',
        count: '5',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.endSum = res.data.count // 获取起点地名查询总数
          _self.endingDatas = res.data.pois // 获取起点地名查询结果集
          if (_self.endSum > 0) {
            if (this.drivingType) {
              _self.isShow.showDrive = false
              _self.isShow.showResult = true
            } else {
              _self.isShow.showResult = true
              _self.isShow.showRoute = false
            }
            if (flag) {
              _self.mainView.graphics.removeAll()
              // 缩放到查询结果的第一条
              _self.lant = _self.endingDatas[0].lonlat // 获取到经纬度字符串
              goto(
                parseFloat(_self.lantArry[1]),
                parseFloat(_self.lantArry[0]),
                _self.mainView
              )
              // 在地图上添加图标
              _self.forFor(_self.endingDatas)
            }
          } else {
            this.endName = '没有结果'
            this.$refs.poiCom.isShow.showEn = false
            this.$refs.poiCom.endName = '没有结果'
            this.$refs.poiCom.$refs.endimgDom.src = this.imgPosition.errorImg
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
  },
}
</script>

<style scoped>
.bus-com {
  position: relative;
  padding-left: 10px;
  height: 600px;
  overflow: auto;
}
.bus-com::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.bus-com::-webkit-scrollbar-thumb {
  display: block;
  width: 10px;
  height: 1px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.2);
}
.bus-com::-webkit-scrollbar-track-piece {
  height: 1px;
  width: 5px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
}
.img-start {
  position: relative;
  top: 5px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -508px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
.start-input {
  position: relative;
  width: 88%;
  height: 25px;
  margin-bottom: 20px;
  padding-left: 5px;
}
.pass-input {
  position: relative;
  width: 88%;
  height: 25px;
  padding-left: 5px;
  margin-bottom: 20px;
}
.start-clear {
  position: absolute;
  left: 300px;
  top: 12px;
  cursor: pointer;
}
.center-ptr {
  position: absolute;
  left: 0px;
  top: 35px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -560px -152px;
  background-repeat: no-repeat;
  display: inline-block;
  cursor: pointer;
}
.img-end {
  position: relative;
  top: 5px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -533px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
.end-input {
  position: relative;
  width: 88%;
  height: 25px;
  padding-left: 5px;
}
.start-position {
  position: relative;
  margin-bottom: 0px;
}
.pass-ul {
  list-style: none;
  position: relative;
  padding-left: 0px;
  padding-top: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}
.pass-li {
  list-style: none;
  position: relative;
  padding-left: 0px;
  padding-top: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}
.delete-pass {
  position: absolute;
  top: 12px;
  right: 18px;
  width: 20px;
  height: 20px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -170px -181px;
  background-repeat: no-repeat;
  display: inline-block;
  cursor: pointer;
}
.clear-pass {
  position: absolute;
  top: 12px;
  right: 35px;
  cursor: pointer;
}
.end-clear {
  position: absolute;
  left: 300px;
  top: 12px;
  cursor: pointer;
}
.end-position {
  position: relative;
  margin-bottom: 10px;
  top: 0px;
}
.bus-button {
  position: relative;
  margin-top: 30px;
}
.add-new {
  position: relative;
  top: 10px;
  float: left;
  width: 81px;
  height: 19px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  font-size: 13px;
  letter-spacing: normal;
  text-align: center;
  line-height: normal;
  color: #3f88e7;
  text-decoration: none;
  cursor: pointer;
}
.search-but {
  position: relative;
  top: 0px;
  float: right;
  right: 10px;
  width: 84px;
  height: 35px;
  background: inherit;
  background-color: rgba(0, 84, 146, 1);
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 1);
  border-radius: 0px;
  font-family: 'FontAwesome';
  font-weight: 400;
  font-style: normal;
  font-size: 15px;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
}
.result-content {
  position: relative;
  top: 10px;
  width: 100%;
  overflow-y: auto;
}
</style>