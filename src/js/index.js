require('../css/index.css')
require('amfe-flexible')
const myPlanImg = require('../image/我的飞机.gif')
const myPlanBoom = require('../image/本方飞机爆炸.gif')

const enemyMiddleImg = require('../image/enemy3_fly_1.png')
const enemyMiddleBoom = require('../image/中飞机爆炸.gif')
const enemyMiddleAttached = require('../image/中飞机挨打.png')

const enemyLargeImg = require('../image/enemy2_fly_1.png')
const enemyLargeBoom = require('../image/大飞机爆炸.gif')
const enemyLargeAttached = require('../image/大飞机挨打.png')

const enemySmallImg = require('../image/enemy1_fly_1.png')
const enemySmallBoom = require('../image/小飞机爆炸.gif')

const bulletImg = require('../image/bullet1.png')

const drag = require('./drag.js')
const startPage = document.querySelector('#start-page')
const mainPage = document.querySelector('#main-page')
const pausePage = document.querySelector('#pause-page')
const endToast = document.querySelector('.end-toast')
const endScore = document.querySelector('.final-score')
const scoreEl = document.querySelector('.score')
const bgMusic = document.querySelector('.bg-music')
bgMusic.src = require('../radio/bg.mp3')

const turnMusicBtn = document.querySelector('.turn-music')
const startBtn = document.querySelector('.start-btn')
const continueBtn = document.querySelector('.continue-btn')
const reloadBtn = document.querySelector('.reload-btn')
const homeBtn = document.querySelector('.home-btn')
const restartBtn = document.querySelector('.restart-btn')

let scores = 0 // 分数
let myPlan = null // 我方战机器对象
let timerId = null // setInterval
let dragObj = null // 拖拽函数返回的对象 用于解除拖拽事件

let screenWidth = document.documentElement.clientWidth // 全屏宽
let screenHeight = document.documentElement.clientHeight // 全屏高
let backgroundPositionY = 0

window.onresize = function () {
  screenWidth = document.documentElement.clientWidth
  screenHeight = document.documentElement.clientHeight
}

// 开始
function begin() {
  mainPage.style.display = 'block'
  scoreEl.style.display = 'block'
  startPage.style.display = 'none'
  myPlan = new Ourplan() // 初始化我方战机
  dragObj = drag.drag(myPlan.imagenode) // 添加拖拽

  timerId = setInterval(start, 20)

  myPlan.imagenode.addEventListener('mouseup', gamePause)
  myPlan.imagenode.addEventListener('touchend', gamePause)

  bgMusic.play()
}

// 游戏重新开始
function gameReload() {
  // 清屏
  mainPage.innerHTML = ''

  // 数值回滚为初始
  scores = 0
  myPlan = null
  timerId = null
  dragObj = null
  bullets = []
  enemys = []
  mark = 0 // 时间标志 每20毫秒
  mark1 = 0 // 时间标志 每400毫秒

  // 重新开始
  begin()
  pausePage.style.display = 'none'
}

// 游戏暂停
function gamePause() {
  clearInterval(timerId)
  if (!bgMusic.muted) {
    turnMusicBtn.innerText = '关闭音乐'
  } else {
    turnMusicBtn.innerText = '开启音乐'
  }
  pausePage.style.display = 'flex'
}
// 游戏继续
function gameContinue() {
  timerId =setInterval(start, 20)
  pausePage.style.display = 'none'
}
//回到首页
function goHome() {
  window.location.reload(true)
}
// 游戏结束
function gameOver() {
  myPlan.imagenode.src = myPlan.planboomimage
      
  // 事件移除
  dragObj.removeEventListener()
  myPlan.imagenode.removeEventListener('mouseup', gamePause)
  myPlan.imagenode.removeEventListener('touchend', gamePause)

  endScore.innerText = scores
  endToast.style.display = 'block'
  clearInterval(timerId)
  bgMusic.pause()
}

// 背景音乐开关
function turnMusic() {
  if (!bgMusic.muted) {
    bgMusic.muted = true
  } else {
    bgMusic.muted = false
  }
  pausePage.style.display = 'none'
  gameContinue()
}

let bullets = [] // 子弹列表
let enemys = [] // 敌机列表
let mark = 0 // 时间标志 每20毫秒
let mark1 = 0 // 时间标志 每400毫秒

function start() {
  let aliveEnemys = enemys.filter(item => !item.planisdie) // 存活的敌机
  mark++
  // 更新分数
  scoreEl.querySelector('.scoreText').innerText = scores
  // 背景图向下移动
  mainPage.style['background-position-y'] = backgroundPositionY + 'px'
  if (backgroundPositionY < screenHeight) {
    backgroundPositionY += 0.5
  } else {
    backgroundPositionY = 0
  }

  // 发射子弹
  if (mark % 5 === 0) { // 相当于每 20 * 5 = 100 毫秒发射一颗子弹
    bullets.push(new oddbullet())
  }

  // bullets.forEach((item, index) => {
  //   item.bulletmove()
  //   if (item.bulletimage.offsetTop < 0) {
  //     mainPage.removeChild(item.bulletimage)
  //     bullets.splice(index, 1)
  //     // console.log(bullets)
  //   }
  // })

  // 子弹移动
  for (let i=0; i<bullets.length; i++) { // 用for循环更精准
    bullets[i].bulletmove()
    if (bullets[i].bulletimage.offsetTop < 0) {
      mainPage.removeChild(bullets[i].bulletimage)
      bullets.splice(i, 1)
      i-=1 // 删除一个后将i回调至上一位
    }
  }
  // 每400ms 生成敌机
  if (mark > 20) { // 每20 * 20 = 400 毫秒
    mark1++
    if (mark1 % 5 === 0) { // 400 * 5 = 2000ms 每2s生成一架中型飞机 血量6 分数5000 爆炸时间360ms 速度随机1,3
      enemys.push(new EnemyPlan(6, 'enemy-plan-middle', 5000, 360, random(1, 3), enemyMiddleBoom, enemyMiddleAttached,enemyMiddleImg))
    } else if (mark1 > 20) { // 400 * 20 = 8000ms 每8s生成一架大飞机 血量12 分数30000 爆炸时间540ms
      enemys.push(new EnemyPlan(12, 'enemy-plan-large', 30000, 540, 1, enemyLargeBoom, enemyLargeAttached, enemyLargeImg))
      mark1 = 0
    } else { // 每400ms 生成一架小飞机 血量1 分数1000 爆炸时间360ms 速度随机1,4
      enemys.push(new EnemyPlan(1, 'enemy-plan-small', 1000, 360, random(1, 4), enemySmallBoom, '',enemySmallImg))
    }
    mark = 0 // 重新计时
  }

  // 敌机运动
  for (let i=0; i<aliveEnemys.length; i++) {
    let item = aliveEnemys[i]
    item.planmove()
    // 超出边界的删除
    if (item.imagenode.offsetTop >= screenHeight) {
      mainPage.removeChild(item.imagenode)
      aliveEnemys.splice(i, 1)
      i -= 1
    }
  }

  // 敌机销毁
  enemys.forEach((item, index) => {
    // 当敌机死亡标记为true时，经过一段时间后清除敌机
    if (item.planisdie) {
      item.plandietimes += 20
      if (item.plandietimes >= item.plandietime) {
        mainPage.removeChild(item.imagenode)
        enemys.splice(index, 1)
      }
    }
  })

  // 碰撞判断
  // 和本机碰撞
  aliveEnemys.forEach((item, index) => {
    if (isCrashed(item.imagenode, myPlan.imagenode, 0.6)) {
      gameOver()
    }
  })

  // 子弹和敌机的碰撞
  for (let i=0; i<aliveEnemys.length; i++) {
    for (let j=0; j<bullets.length; j++) {
      if (isCrashed(bullets[j].bulletimage, aliveEnemys[i].imagenode)) {
        // 敌机hp减少
        aliveEnemys[i].planhp -= bullets[j].bulletattach
        // console.log(aliveEnemys[i].planhp)
        // 子弹消失
         mainPage.removeChild(bullets[j].bulletimage)
         bullets.splice(j, 1)
         j -= 1
         // 大中飞机被击中后更换挨打图
         if (aliveEnemys[i].className === 'enemy-plan-middle'|| aliveEnemys[i].className === 'enemy-plan-large') {
            aliveEnemys[i].imagenode.src = aliveEnemys[i].planattachedimage
         }
         // 敌机hp小于0
        if (aliveEnemys[i].planhp <= 0) {
          aliveEnemys[i].planisdie = true
          aliveEnemys[i].imagenode.src = aliveEnemys[i].planboomimage
          scores += aliveEnemys[i].planscore
        }
      }
    }
  }
}

function Plan(hp, className, score, dietime, sudu, boomimage, attachedimage,imagesrc) {
  this.imagenode = null
  this.planhp = hp
  this.planscore = score
  this.className = className
  this.planboomimage = boomimage
  this.planattachedimage = attachedimage
  this.planisdie = false
  this.plandietimes = 0
  this.plandietime = dietime
  this.plansudu = sudu
  //行为
  /*
  移动行为
     */
  this.planmove = function () {
    if (scores <= 50000) {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + "px"
    }
    else if (scores > 50000 && scores <= 100000) {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + 1 + "px"
    }
    else if (scores > 100000 && scores <= 150000) {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + 2 + "px"
    }
    else if (scores > 150000 && scores <= 200000) {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + 3 + "px"
    }
    else if (scores > 200000 && scores <= 300000) {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + 4 + "px"
    }
    else {
      this.imagenode.style.top = this.imagenode.offsetTop + this.plansudu + 5 + "px"
    }
  }
  this.init = function () {
    this.imagenode = document.createElement("img")
    this.imagenode.className = this.className
    this.imagenode.src = imagesrc
    mainPage.appendChild(this.imagenode)
  }
  this.init()
}

// 我方飞机类
function Ourplan() {
  Plan.call(this, 1, 'my-plan', 0, 660, 0, myPlanBoom, '',myPlanImg)
  this.offsetWidth = this.imagenode.offsetWidth
  this.offsetHeight = this.imagenode.offsetHeight
  // 我方战机生成的初始位置为 下中
  this.imagenode.style.left = (screenWidth - this.offsetWidth) / 2 + 'px'
  this.imagenode.style.top = (screenHeight - this.offsetHeight) + 'px'
}

// 敌方飞机类
function EnemyPlan(hp, className, score, dietime, sudu, boomimage, attachedimage,imagesrc) {
  Plan.call(this, hp, className, score, dietime, sudu, boomimage, attachedimage, imagesrc)
  this.offsetWidth = this.imagenode.offsetWidth
  this.offsetHeight = this.imagenode.offsetHeight
  // 敌方战机位置随机生成
  this.imagenode.style.left = random(0, screenWidth - this.offsetWidth) + 'px'
  this.imagenode.style.top = -1 * this.offsetHeight + 'px'
}

// 子弹类
function bullet(className, imagesrc) {
  this.bulletimage = null
  this.bulletattach = 1
  this.className = className
  //行为
  /*
  移动行为
  */
  this.bulletmove = function () {
    this.bulletimage.style.top = this.bulletimage.offsetTop - 20 + "px"
  }
  this.init = function () {
    this.bulletimage = document.createElement("img")
    this.bulletimage.className = this.className
    this.bulletimage.src = imagesrc
    mainPage.appendChild(this.bulletimage)
  }
  this.init()
}

/*
 创建我方飞机单行子弹类
 */
function oddbullet() {
  bullet.call(this, 'bullet', bulletImg)
  this.offsetWidth = this.bulletimage.offsetWidth
  this.offsetHeight = this.bulletimage.offsetHeight

  // 子弹在我放飞机的当中
  this.bulletimage.style.left = myPlan.imagenode.offsetLeft + myPlan.imagenode.offsetWidth / 2 - this.offsetWidth / 2 + 'px'
  // this.bulletimage.style.top = myPlan.imagenode.offsetTop - this.offsetHeight + "px"
  this.bulletimage.style.top = myPlan.imagenode.offsetTop + "px"

}

// 随机函数
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min + 1)
}

// 碰撞判断
/**
 * @param {box1} 碰撞物
 * @param {box2} 被碰撞物
 * @param {ratio} 被碰撞物的碰撞体积的与其本身体积的比率 只支持y轴
 * */ 
function isCrashed(box1, box2, ratio=1) {
  var crash = false
  // container的四条边界
  T1 = box1.offsetTop
  B1 = box1.offsetTop + box1.offsetHeight
  L1 = box1.offsetLeft
  R1 = box1.offsetLeft + box1.offsetWidth

  // collision的四条边界
  T2 = box2.offsetTop + box2.offsetHeight*(1 - ratio) // 我方飞机的碰撞优化 飞机的碰撞体积是图片的60%
  B2 = box2.offsetTop + box2.offsetHeight
  L2 = box2.offsetLeft
  R2 = box2.offsetLeft + box2.offsetWidth

  // 判断不触发碰撞的条件
  if (B1 <= T2 || T1 >= B2 || R1 <= L2 || L1 >= R2) {
    crash = false
  } else {
    crash = true
  }
  return crash
}


startBtn.onclick = begin
continueBtn.onclick = gameContinue
reloadBtn.onclick = gameReload
homeBtn.onclick = goHome
turnMusicBtn.onclick = turnMusic
restartBtn.onclick = goHome


