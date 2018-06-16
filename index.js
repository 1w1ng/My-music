//自定义事件
var EventCenter = {
  on: function (type, handler) {
    $(document).on(type, handler)
  },
  fire: function (type, data) {
    //trigger()方法触发被选元素的指定事件类型
    $(document).trigger(type, data)
  }
}

var Footer = {
  //初始化页面
  init: function () {
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.icon-left')
    this.$rightBtn = this.$footer.find('.icon-right')
    //判断图片是不是到最后
    this.isToEnd = false
    this.isToStart = true
    //状态锁,防止重复点击
    this.isAnimate = false

    this.bind()
    this.render()
  },
  //绑定事件
  bind: function () {
    var _this = this
    //点击底部右边按钮，往左移动
    this.$rightBtn.on('click', function () {
      if (_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)//包含内边距外边距及边框
      var rowCount = Math.floor(_this.$box.width() / itemWidth)

      if (!_this.isToEnd) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToStart = false
          if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true
          }
        })
      }
    })
    //点击底部左边按钮，往右移动
    this.$leftBtn.on('click', function () {
      if (_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)

      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToEnd = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })
    //点击底部曲风图片后改变状态样式
    this.$footer.on('click', 'li', function () {
      $(this).addClass('active').siblings().removeClass('active')
      //自定义事件
      EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  },
  //渲染页面
  render() {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
      .done(function (ret) {
        //console.log(ret)
        //渲染数据
        _this.renderFooter(ret.channels)
      }).fail(function () {
        console.log('error')
      })
  },
  //数据展示到底部
  renderFooter: function (channels) {
    //console.log(channels)
    var html = ''
    channels.forEach(function (channel) {
      html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>'
            + '  <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
            + '  <h3>' + channel.name + '</h3>'
            + '</li>'
    })
    this.$ul.html(html)
    this.setStyle()
  },
  //设置底部样式
  setStyle: function () {
    //li的数量
    var count = this.$footer.find('li').length
    //li的宽度,包括外边距
    var width = this.$footer.find('li').outerWidth(true)
    //console.log(count, width)
    this.$ul.css({
      width: count * width + 'px'
    })
  }
}



var Fm = {
  init: function () {
    this.channelId = 'public_shiguang_80hou'
    this.channelName = '随机播放'
    this.$container = $('#page-music')
    //创建audio标签播放歌曲
    this.audio = new Audio()
    //自动播放
    this.audio.autoplay = true
    this.bind()
    this.loadMusic(function(){
      this.setMusic
    })
  },
  bind: function () {
    var _this = this
    EventCenter.on('select-albumn', function (e, channelObj) {
      //专辑名字
      _this.channelId = channelObj.channelId
      _this.channelName = channelObj.channelName
      _this.loadMusic()
    })
    //播放暂停按钮事件
    this.$container.find('.btn-play').on('click', function () {
      var $btn = $(this)
      if ($btn.hasClass('icon-play')) {
        $btn.removeClass('icon-play').addClass('icon-pause')
        _this.audio.play()
      } else {
        $btn.removeClass('icon-pause').addClass('icon-play')
        _this.audio.pause()
      }
    })
    //下一曲
    this.$container.find('.btn-next').on('click', function () {
      _this.loadMusic(function(){
        _this.setMusic()
      })
    })
    //播放时进度条变化
    this.audio.addEventListener('play', function () {
      // console.log('play')
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function () {
        _this.updateStatus()
      }, 1000)
    })
    this.audio.addEventListener('pause', function () {
      //一曲结束自动播放下一首
      if (_this.audio.currentTime === _this.audio.duration) {
        _this.loadMusic()
      } else {
        clearInterval(_this.statusClock)
        // console.log('pause')
      }
    })
    //点击进度条，后退或快进
    this.$container.find('.area-bar .bar').on('click', function (e) {
      console.log(e)
      var percent = e.offsetX / parseInt(getComputedStyle(this).width)
      _this.audio.currentTime = _this.audio.duration * percent
    })
  },
  loadMusic(callback) {
    var _this = this
    // console.log('loadMusic...')
    //获取歌曲内容
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', { channel: this.channelId }).done(function (ret) {
      //console.log(ret)
      _this.song = ret['song'][0]
      _this.setMusic()
      _this.loadLyric()
    })
  },
  //获取歌词
  loadLyric() {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', { sid: this.song.sid })
      .done(function (ret) {
        // console.log(ret.lyric)
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
        _this.lyricObj = lyricObj
        // console.log(_this.lyricObj)
      })
  },
  setMusic(song){
    //console.log('set music...')
    //console.log(this.song)
    
    this.audio.src = this.song.url
    $('.bg').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('.detail h1').text(this.song.title)
    this.$container.find('.detail .author').text(this.song.artist)
    this.$container.find('.tag').text(this.channelName)

    //播放按钮重置
    this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
  },
  //进度条和时间
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
}

Footer.init()
Fm.init()