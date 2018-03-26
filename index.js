var EventCenter = {
on: function(type,handler){
    $(document).on(type,handler)
},
fire: function(type,data){
    //trigger()方法触发被选元素的指定事件类型
    $(document).trigger(type,data)
}
}

var Footer = {
init: function(){
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.icon-left')
    this.$rightBtn = this.$footer.find('.icon-right')
    this.isToEnd = false
    this.isToStart = false
    this.isAnimate = false
    
    this.bind()
    this.render()
},

bind: function(){
    var _this = this
    this.$rightBtn.on('click', function(){
        if(_this.isAnimate) return
        var itemWidth = _this.$box.find('li').outerWidth(true)//包含内边距外边距及边框
        var rowCount = Math.floor(_this.$box.width()/itemWidth)
        if(!_this.isToEnd){
        _this.isAnimate = true
        _this.$ul.animate({
            left: '-='+rowCount*itemWidth
        }, 400, function(){
            _this.isAnimate = false
            _this.isToStart = false
            if(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width')) ){
            _this.isToEnd = true
            }
        })
        }
    })

    this.$leftBtn.on('click', function(){
        if(_this.isAnimate) retur
        var itemWidth = _this.$box.find('li').outerWidth(true)
        var rowCount = Math.floor(_this.$box.width()/itemWidth)
        if(!_this.isToStart) {
        _this.isAnimate = true  
        _this.$ul.animate({
            left: '+='+rowCount*itemWidth
        }, 400, function(){
            _this.isAnimate = false
            _this.isToEnd = false
            if(parseFloat(_this.$ul.css('left')) >= 0 ){
            _this.isToStart = true
            }
        })
        }     
    })

    this.$footer.on('click', 'li', function(){
        $(this).addClass('active').siblings().removeClass('active')

        EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
        })
    })
},

render(){
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
        .done(function(ret){
            console.log(ret)
            _this.renderFooter(ret.channels)
    }).fail(function(){
        console.log('error')
    })
},

renderFooter: function(channels){
    console.log(channels)
    var html = ''
    channels.unshift({
        channel_id:0,
        name:'我喜欢的',
        cover_small:'http://p64wf7hkf.bkt.clouddn.com/3.jpg', 
    })
    channels.forEach(function(channel){
        html += '<li data-channel-id='+channel.channel_id + ' data-channel-name='+channel.name+'>'
                + '  <div class="cover" style="background-image:url('+channel.cover_small+')"></div>'
                + '  <h3>'+channel.name+'</h3>'
                +'</li>'
    })
    this.$ul.html(html)
    this.setStyle()
},

setStyle: function(){
    var count = this.$footer.find('li').length
    var width = this.$footer.find('li').outerWidth(true)
    console.log(count,width)
    this.$ul.css({
        width: count * width + 'px'
    })
 }
}



var Fm = {
init: function(){
    this.channelId = 'public_shiguang_80hou'
    this.channelName = '随机播放'
    this.$container = $('#page-music')
    this.audio = new Audio()
    this.audio.autoplay = true
    this.currentSong = null
    this.statusClock = null
    this.collections = this.loadFromLocal()
    this.bind()
    this.playInit()
},
playInit(){
    if(this.collections.length > 0 ){
        EventCenter.fire('select-albumn',{
            channelId:'0',
            channelName:'我喜欢的'
        })
    }else{
        this.loadMusic()
    }
},
bind: function(){
    var _this = this
    EventCenter.on('select-albumn', function(e,channelObj){
        _this.channelId = channelObj.channelId
        _this.channelName = channelObj.channelName
        _this.loadMusic()
    })
    //播放暂停按钮事件
    this.$container.find('.btn-play').on('click',function(){
        var $btn = $(this)
        if($btn.hasClass('icon-play')){
            $btn.removeClass('icon-play').addClass('icon-pause')
            _this.audio.play()
        }else{
            $btn.removeClass('icon-pause').addClass('icon-play')
            _this.audio.pause()
        }
    })
    //下一曲
    this.$container.find('.btn-next').on('click',function(){
        _this.loadMusic()
    })

    this.audio.addEventListener('play',function(){
        // console.log('play')
        clearInterval(_this.statusClock)
        _this.statusClock = setInterval(function(){
            _this.updateStatus()
            _this.setLyric()
        },1000)
    })
    this.audio.addEventListener('pause',function(){
        //一曲结束自动播放下一首
        if(_this.audio.currentTime === _this.audio.duration){
            _this.loadMusic()
        }else{
            clearInterval(_this.statusClock)
            // console.log('pause')
        }
    })

    this.$container.find('.btn-collect').on('click',function(){
        var $btn = $(this)
        if($btn.hasClass('active')){
            $btn.removeClass('active')
            delete _this.collections[_this.currentSong.sid]
        }else{
            $(this).addClass('active')
            _this.collections[_this.currentSong.sid] = _this.currentSong
        }
        _this.saveToLocal()
    })
},
loadMusic(){
    var _this = this
    // console.log('loadMusic...')
    if(this.channelId === '0'){
        _this.loadCollection()
    }else{
        //获取歌曲内容
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', { channel: this.channelId }).done(function (ret){
            //获取数据成功后播放返回的数据中的第一项，没有返回则不播放
            _this.play(ret.song[0] || null)
        })
    }
},
play(song) {
    // console.log(song)
    this.currentSong = song
    this.audio.src = song.url
    this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
    // this.$container.find('.aside figure').css('background-image', 'url(' + song.picture + ')')
    this.$container.find('figure').css('background-image', 'url(' + song.picture + ')')
    $('.bg').css('background-image', 'url(' + song.picture + ')')
    this.$container.find('.detail h1').text(song.title)
    this.$container.find('.detail .author').text(song.artist)
    this.$container.find('.tag').text(this.channelName)

    if (this.collections[song.sid]) {
        this.$container.find('.btn-collect').addClass('active')
    } else {
        this.$container.find('.btn-collect').removeClass('active')
    }

    this.loadLyric(song.sid)
},
//歌词
// loadLyric(){
//     var _this = this
//     $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php',{sid: this.song.sid}).done(function(ret){
//         var lyric = ret.lyric
//         var lyricObj = {}
//         lyric.split('\n').forEach(function(line){
//             var times = line.match(/\d{2}:\d{2}/g)
//             var str = line.replace(/\[.+?\]/g,'')
//             if(Array.isArray(times)){
//                 times.forEach(function(time){
//                 lyricObj[time]=str
//             })
//         }
//         })
//         _this.lyricObj = lyricObj
//     })
// },  

// setMusic(){
//     console.log('set music...')
//     console.log(this.song)
//     this.audio.src = this.song.url
//     $('.bg').css('background-image', 'url('+this.song.picture+')')
//     this.$container.find('.aside figure').css('background-image', 'url('+this.song.picture+')')
//     this.$container.find('.detail h1').text(this.song.title)
//     this.$container.find('.detail .author').text(this.song.artist)
//     this.$container.find('.tag').text(this.channelName)
//     this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
// },

//进度条和时间
updateStatus(){

this.$container.find('.current-time').text(this.formatTime())
this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')

//以下为进度条逻辑，锁屏部分的进度条只做展示用，因为页面获得焦点后锁屏页面就消失了，所以不用管锁屏页面的进度条控制
var _this = this
this.$container.find('.bar').on('click', function (e) {
    var postX = e.clientX//postX为bar进度条当前点击位置距离浏览器窗口原点的水平距离
    // console.log(postX)
    var outerLeft = document.querySelector('.bar').getBoundingClientRect().x//bar原点距离浏览器窗口原点的水平距离
    // console.log(outerLeft)
    var offsetLeft = postX - outerLeft//这里得到的是长度数字，没有单位，代表当前点击位置，即bar-progress的长度
    // console.log(offsetLeft)
    var percentage = offsetLeft / $('.bar').width()
    // console.log(percentage)
    _this.audio.currentTime = _this.audio.duration * percentage
    $('.bar-progress').css('width', _this.audio.currentTime / _this.audio.duration * 100 + '%')
})
},
formatTime(){
    var totalMinutes = Math.floor(this.audio.duration / 60)
    if(totalMinutes < 10){
        var timeStr = '0' + Math.floor(this.audio.currentTime / 60) + ':'
            +(Math.floor(this.audio.currentTime) % 60 / 100)
                .toFixed(2).substr(2)//如果有小数，小数四舍五入，只获取整数秒数
    }
    return timeStr
},
loadFromLocal(){
    return JSON.parse(localStorage['collections'] || '{}')
},
saveToLocal() {
    localStorage['collections'] = JSON.stringify(this.collections)
},
loadCollection(){
    var keyArray = Object.keys(this.collections)
    if (keyArray.length === 0) return
    var randomIndex = Math.floor(Math.random() * keyArray.length)
    var randomSid = keyArray[randomIndex]
    this.play(this.collections[randomSid])
},
//获取歌词
loadLyric(sid) {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', { sid: sid })
        .done(function (ret) {
            // console.log(ret.lyric)
            var lyricObj = {}
            ret.lyric.split('\n').forEach(function (line) { // 得到一个数组遍历它
                var timeArr = line.match(/\d{2}:\d{2}/g) // 匹配时间 
                // 判断数组time是否是数组存在
                if (timeArr) {
                    timeArr.forEach(function (time) {
                        lyricObj[time] = line.replace(/\[.+?\]/g, '') // 匹配歌词
                    })
                }
            })
            _this.lyricObj = lyricObj
            // console.log(_this.lyricObj)
        })
},
setLyric() {
    // console.log(this.lyricObj)
    if (this.lyricObj && this.lyricObj[this.formatTime()]) {
        this.$container.find('.lyric p')
            .text(this.lyricObj[this.formatTime()])
            // .boomText()
    }
    // console.log(this.formatTime())

    // 以下代码也可，一样的效果
    // var timeStr = '0' + Math.floor(this.audio.currentTime / 60) + ':'
    //     + (Math.floor(this.audio.currentTime) % 60 / 100).toFixed(2).substr(2)
    // if (this.lyricObj && this.lyricObj[timeStr]) {
    //     this.$container.find('.lyric p').text(this.lyricObj[timeStr])
    //         .boomText('rollIn')
    // }
    // console.log(timeStr)
},
change() {
    // $('#loginAndSignIn').addClass('hide')
    $('#page-music').addClass('hide')
    // $('#lockScreen').removeClass('hide')
  }
}



//歌词效果
// $.fn.boomText = function(type){
//     type = type || 'fadeInDown'
//     console.log(type)
//     this.html(function(){
//         var arr = $(this).text()
//         .split('').map(function(word){
//             return '<span class="boomText">'+ word + '</span>'
//         })
//         return arr.join('')
//     })

//     var index = 0
//     var $boomTexts = $(this).find('span')
//     var clock = setInterval(function(){
//       $boomTexts.eq(index).addClass('animated ' + type)
//       index++
//       if(index >= $boomTexts.length){
//         clearInterval(clock)
//       }
//     }, 300)
//   }

Footer.init()
Fm.init()