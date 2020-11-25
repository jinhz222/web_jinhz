import {
  loadModules
} from 'esri-loader'
/**
 * 地图缩放
 * @param {*} lat
 * @param {*} lon
 * @param {*} mainView
 */
export function goto(lat, lon, mainView) {
  loadModules(['esri/geometry/Point']).then(([Point]) => {
    const pt = new Point({
      latitude: lat,
      longitude: lon,
    })
    mainView.goTo(pt)
  })
}
/**
 * 获取当前视图的地图范围
 * @param {*} mainView
 * @param {*} checked
 * @param {*} mapExtent
 * @param {*} viewBound
 */
export function getmapBound(self, mainView, mapExtent) {
  loadModules([
    'esri/geometry/support/webMercatorUtils',
    'esri/geometry/Extent',
    'esri/core/watchUtils',
  ]).then(([webMercatorUtils, Extent, watchUtils]) => {
    watchUtils.when(mainView, 'extent', function () {
      // 获取当前视图的投影坐标系下的范围
      const extent = new Extent({
        xmin: mainView.extent.xmin,
        ymin: mainView.extent.ymin,
        xmax: mainView.extent.xmax,
        ymax: mainView.extent.ymax,
        spatialReference: {
          wkid: 102100,
        },
      })
      // 将投影坐标系下的视图范围转变为地理坐标系下的视图范围
      const newExtent = webMercatorUtils.webMercatorToGeographic(extent)
      // 将数据转化为字符串
      mapExtent[0] = newExtent.xmin + ''
      mapExtent[1] = newExtent.ymin + ''
      mapExtent[2] = newExtent.xmax + ''
      mapExtent[3] = newExtent.ymax + ''
      // 将视图范围进行拼接并赋值到控制视图的变量
      self.searchConfig.viewBound =
        mapExtent[0] +
        ',' +
        mapExtent[1] +
        ',' +
        mapExtent[2] +
        ',' +
        mapExtent[3]
    })
  })
}
/**
 * 地图上添加起始点图标
 * @param {*} lat
 * @param {*} lon
 * @param {*} imgPosition
 * @param {*} ptGraphic
 * @param {*} mainView
 */
export function addPoint(lat, lon, imgPosition, ptGraphic, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const pointImg = {
      type: 'point',
      latitude: lat,
      longitude: lon,
    }
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition,
      width: '24px',
      height: '32px',
    }
    const pointGraphic = new Graphic({
      geometry: pointImg,
      symbol: pointSymbol,
    })
    ptGraphic = pointGraphic
    mainView.graphics.add(pointGraphic)
  })
}
/**
 * 地图上添加位置图标
 * @param {*} dataArry
 * @param {*} imgPosition
 * @param {*} mainView
 */
export function addnewPoint(dataArry, imgPosition, mainView) {
  loadModules([
    'esri/geometry/Point',
    'esri/symbols/PictureMarkerSymbol',
    'esri/Graphic',
  ]).then(([Point, PictureMarkerSymbol, Graphic]) => {
    for (let i = 0; i < dataArry.length; i++) {
      const pointImg = {
        type: 'point',
        latitude: dataArry[i].lat,
        longitude: dataArry[i].lon,
      }
      const pointSymbol = {
        type: 'picture-marker',
        url: imgPosition.positionDiv[i],
        width: '24px',
        height: '32px',
      }
      const pointAtt = {
        name: dataArry[i].name,
        address: dataArry[i].address,
        phpne: dataArry[i].phone,
        lat: dataArry[i].lat,
        lon: dataArry[i].lon,
      }
      const pointGraphic = new Graphic({
        geometry: pointImg,
        symbol: pointSymbol,
        attributes: pointAtt,
      })
      mainView.graphics.add(pointGraphic)
      mainView.graphics.getItemAt(i).visible = true
    }
  })
}
/**
 * 更换图标样式
 * @param {*} imgPosition
 * @param {*} flag
 * @param {*} mainView
 * @param {*} index
 */
export function replacePoint(imgPosition, flag, mainView, index) {
  if (flag === 'enter') {
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition.positionMap[index],
      width: '24px',
      height: '32px',
    }
    mainView.graphics.getItemAt(index).symbol = pointSymbol
  } else if (flag === 'leave') {
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition.positionDiv[index],
      width: '24px',
      height: '32px',
    }
    mainView.graphics.getItemAt(index).symbol = pointSymbol
  }
}
/**
 * 周边区域样式
 * @param {*} lat
 * @param {*} lon
 * @param {*} ptGraphic
 * @param {*} mainView
 */
export function nearbyExtent(lat, lon, ptGraphic, mainView) {
  loadModules([
    'esri/geometry/Circle',
    'esri/geometry/Point',
    'esri/Graphic',
  ]).then(([Circle, Point, Graphic]) => {
    const pt = new Point({
      latitude: lat,
      longitude: lon,
    })
    const circle = new Circle({
      center: pt,
      radius: 1000,
      spatialReference: {
        wkid: 102100,
      },
    })
    const fillSymbol = {
      type: 'simple-fill',
      color: [0, 0, 205, 0.2],
      outline: {
        color: [0, 0, 205, 1],
        width: '3px',
      },
    }
    const fillGraphic = new Graphic({
      geometry: circle,
      symbol: fillSymbol,
    })
    ptGraphic = fillGraphic
    mainView.graphics.addMany([fillGraphic])
  })
}
/**
 * 坐标实时监控，更改弹框位置
 * @param {*} lat
 * @param {*} lon
 * @param {*} mainView
 * @param {*} newptArry
 */
export function watchPoint(lat, lon, mainView, newptArry) {
  loadModules([
    'esri/geometry/Point',
    'esri/core/watchUtils',
  ]).then(([Point, watchUtils]) => {
    const pt = new Point({
      latitude: lat,
      longitude: lon,
    })
    watchUtils.when(mainView, 'extent', function () {
      const newPt = mainView.toScreen(pt)
      newptArry[0] = newPt.y - 277 + ''
      newptArry[1] = newPt.x - 190 + ''
      document.getElementById('popTem').style.top = newptArry[0] + 'px'
      document.getElementById('popTem').style.left = newptArry[1] + 'px'
    })
  })
}
/**
 * 添加起点、终点
 * @param {*} pointLat
 * @param {*} pointLon
 * @param {*} imgPosition
 * @param {*} pointName
 * @param {*} mainView
 */
export function setPoint(pointLat, pointLon, imgPosition, pointName, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const pointImg = {
      type: 'point',
      latitude: pointLat,
      longitude: pointLon,
    }
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition,
      width: '24px',
      height: '32px',
    }
    const pointAtt = {
      name: pointName,
      lat: pointLat,
      lon: pointLon,
      type: 1,
    }
    const pointGraphic = new Graphic({
      geometry: pointImg,
      symbol: pointSymbol,
      attributes: pointAtt,
    })
    mainView.graphics.add(pointGraphic)
  })
}
/**
 * 添加公交站点
 * @param {*} pointLat
 * @param {*} pointLon
 * @param {*} imgPosition
 * @param {*} busData
 * @param {*} mainView
 */
export function setbusPoint(pointLat, pointLon, imgPosition, busData, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const pointImg = {
      type: 'point',
      latitude: pointLat,
      longitude: pointLon,
    }
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition,
      width: '24px',
      height: '32px',
    }
    const pointAtt = {
      name: busData.name,
      lat: pointLat,
      lon: pointLon,
      stationCount: busData.stationCount,
      direction: busData.direction,
      endTime: busData.endTime,
      type: 2,
    }
    const pointGraphic = new Graphic({
      geometry: pointImg,
      symbol: pointSymbol,
      attributes: pointAtt,
    })
    mainView.graphics.add(pointGraphic)
  })
}
/**
 * 添加公交路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setbusLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [226, 119, 40],
      width: 4,
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 添加步行路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setwalkLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [0, 0, 255],
      width: 4,
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 添加自驾详细路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setdriveLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [0, 0, 255],
      width: 4,
    }
    const lineAtt = {
      name: 'driveLine',
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
      attributes: lineAtt,
    })
    // lastGraphic = lineGraphic
    mainView.graphics.add(lineGraphic)
  })
}
export function Deleteriveline(mainView) {
  const grap = mainView.graphics.getItemAt(
    mainView.graphics.length - 1
  )
  if (grap.attributes.name === 'driveLine') {
    mainView.graphics.removeAt(mainView.graphics.length - 1)
  }
}
