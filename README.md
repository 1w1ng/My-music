# My-music

[预览地址](https://1w1ng.github.io/My-music/)


**jQuery + ajax 实现网页播放器，向分类接口发请求，获取音乐分类，展示音乐信息(音乐图片、歌词、标题等)**

### 功能：
- 进入页面后开始随机播放，一曲播完自动播放下一首
- 按钮控制播放下一曲
- 可拖动进度条控制播放进度
- 能够根据自己喜好来选择想听的音乐类型
---------

**1. 页面响应式**

宽度随着页面的变化而变化，高度充满，实现响应式布局，高度上10vh随着页面高度变化，`font-size`大小也可以随着屏幕大小而变化。

- 设置 @media 宽度上响应

```
.layout {
  margin: 0 auto;
  width: 600px;
}

@media (min-width: 700px) {
  .layout {
    width: 600px;
  }
}
@media (min-width: 900px) {
  .layout {
    width: 800px;
  }
}
@media (min-width: 1000px) {
  .layout {
    width: 900px;
  }
}
@media (min-width: 1200px) {
  .layout {
    width: 1100px;
  }
}

```

**2. API的使用**
```
//创建audio标签
this.audio = new Audio()

autoplay = true  // 自动播放
play()           // 播放事件
pause()          // 暂停事件
currentTime      // 设置或返回音频/视频播放的当前位置
duration         // 获取音乐长度，单位为秒。
```

**3. 歌词的处理**

让歌词与时间对应

```
var lyric = ret.lyric
var lyricObj = {}
lyric.split('\n').forEach(function (line) { // 得到一个数组遍历它
  var times = line.match(/\d{2}:\d{2}/g) // 匹配时间
  var str = line.replace(/\[.+?\]/g, '')   //匹配歌词
  // 判断数组time是否是数组存在
  if (Array.isArray(times)) {
    times.forEach(function (time) {
      lyricObj[time] = str
    })
  }
})
```

**4. 进度条逻辑**

进度条的点击（后退或快进）

```
this.$container.find('.area-bar .bar').on('click', function (e) {
  console.log(e)
  var percent = e.offsetX / parseInt(getComputedStyle(this).width)
  _this.audio.currentTime = _this.audio.duration * percent
})
```

进度条和时间对应

```
updateStatus() {
  var min = Math.floor(this.audio.currentTime / 60)
  var second = Math.floor(Fm.audio.currentTime % 60) + ''
  second = second.length === 2 ? second : '0' + second
  this.$container.find('.current-time').text(min + ':' + second)
  // 设置进度条
  this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')
  //放置歌词
  var line = this.lyricObj['0' + min + ':' + second]
  if (line) {
    this.$container.find('.lyric p').text(line)
  }
}
```