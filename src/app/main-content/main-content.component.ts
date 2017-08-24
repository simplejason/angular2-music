import { Component, OnInit } from '@angular/core';
import { CookieService, Cookie } from 'ng2-cookies';
import { Route, Router, ActivatedRoute, Params } from '@angular/router';

import { globalconfig } from "../app.config";

import { MusicApiService } from "../music-api.service";
import { GlobalDataService } from "../global-data.service";

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {
  cookies: Object;
  typeSub: any;
  isShowLoading: boolean;
  userID: string;
  playListsAll: any;
  playLists: any;
  searchResults: any;
  searchOptions: any;
  exploreResults: any;
  menuState: number;
  errorInfo: string;
  searchWord: string;
  currentSearchOption: string;
  listId: string;
  myMusicPlayer: any;
  lyricStyles: any;
  constructor(private _musicapi: MusicApiService, public _globaldata: GlobalDataService, public _cookieService: CookieService, private route: ActivatedRoute, ) {
  }
  ngOnInit() {
    // 初始化加载
    this.isShowLoading = true;
    this.searchOptions = [
      { "type": "1", "name": "单曲" },
      // {"type":"10", "name":"专辑"}
    ];
    this.myMusicPlayer = {
      "currentTime": 0,
      "duration": 0,
      "played": "0%",
      "musicPic": "",
      "mid": "",
      "lyric": [],
      "lyricTime": "00:00",
      "currentIndex": 0,
      "currentType": "playLists",
      "lastClickTime": (new Date()).getTime()
    };
    this.lyricStyles = {
      "top": "100%",
      "right": "100%",
      "opacity": "0"
    }
    // 查询tab点击参数
    this.currentSearchOption = "1";
    // 捕获路由状态参数
    this.typeSub = this.route.params.subscribe(params => {
      // 消除歌词页
      this.expandLyric(true);
      // cookie存object要格式化,初始化菜单信息
      if (this._cookieService.check("userProfiles") && globalconfig.userName == JSON.parse(this._cookieService.get("userProfiles"))['userName']) {
        this.userID = JSON.parse(this._cookieService.get("userProfiles"))['userId'];
        this._musicapi.fetchMyplaylistByUID(this.userID)
          .subscribe(
          items => {
            this.playListsAll = items.playlist;
          },
          error => console.log('Error fetching'));
      } else {
        // 歌单初始化
        this._musicapi.searchAnything(globalconfig.userName, 1, "1002").subscribe(
          items => {
            if (items) {
              let userProfiles = {
                "userId": items.result.userprofiles[0].userId,
                "userName": items.result.userprofiles[0].nickname,
                "avatarUrl": items.result.userprofiles[0].avatarUrl
              };
              this._cookieService.set("userProfiles", JSON.stringify(userProfiles));
              //获取用户歌单
              this.userID = items.result.userprofiles[0].userId;
              this._musicapi.fetchMyplaylistByUID(this.userID)
                .subscribe(
                items => {
                  this.playListsAll = items.playlist;
                },
                error => console.log('Error fetching'));

            }
          },
          error => console.log(error));
      }

      // 按照路由参数查询结果
      // search存在表示是搜索结果|id存在是歌单|否则是随机
      // 这里要再修改
      this.searchWord = params['search'] ? params['search'] : "";
      this.listId = params['id'] ? params['id'] : "";
      if (this.searchWord) {
        this.searchData(this.searchWord);
      }
      if (this.listId) {
        this.searchPlayList(this.listId);
      }
      if (this.route.snapshot.url.join('/') == "explore") {
        this.explorePlayList();
      }
    });


  }
  // 换类别高亮
  reSearch(search, type) {
    this.currentSearchOption = type;
  }
  // 精品歌单
  explorePlayList(limit = 40) {
    this.isShowLoading = true;
    this._musicapi.fetchHighquality(limit).subscribe(
      items => {
        if (items) {
          this.exploreResults = items.playlists;
          this.isShowLoading = false;
        }
      },
      error => console.log(error));
  }
  // 单曲搜索
  searchData(search, limit = 99, type = '1') {
    this.isShowLoading = true;
    this._musicapi.searchAnything(search, limit, type).subscribe(
      items => {
        if (items) {
          this.myMusicPlayer.currentIndex = 0;
          this.myMusicPlayer.currentType = "searchResults";
          this.searchResults = items.result.songs;
          this.isShowLoading = false;
        }
      },
      error => console.log(error));
  }
  // 歌单歌曲搜索
  searchPlayList(id) {
    this.isShowLoading = true;
    this._musicapi.fetchMyplaylist(id).subscribe(
      items => {
        if (items) {
          this.myMusicPlayer.currentIndex = 0;
          this.myMusicPlayer.currentType = "playLists";
          this.playLists = items.playlist;
          this.isShowLoading = false;
        }
      },
      error => console.log(error));
  }
  searchLyric() {
    this._musicapi.fetcMusicLyric(this.myMusicPlayer.mid).subscribe(
      items => {
        this.myMusicPlayer.lyric.splice(0, this.myMusicPlayer.lyric.length);
        if (items.hasOwnProperty('lrc')) {
          let tmpLyric = items.lrc.lyric.split('\n');
          let tmp = {};
          for (let ly of tmpLyric) {
            if (/(\d+:){1,2}\d+\.?\d+/g.test(ly)) {
              tmp = {
                "time": ly.match(/(\d+:){1,2}\d+/g)[0],
                "lyric": ly.replace(/\[(\d+:){1,2}\d+\.?\d+\]/g, "")
              }
            }
            this.myMusicPlayer.lyric.push(tmp);
          }
          this.isShowLoading = false;

        }
      },
      error => console.log(error));
  }
  // -----------播放音乐相关-----------------
  playMusic(audio, mid?: string, musicsinger?: string, musicname?: string, musicalbumname?: string, musicpic?: string, index?: number) {
    if (mid) {
      this.myMusicPlayer.currentIndex = index;
      this.errorInfo = "";
      this.isShowLoading = true;
      this._musicapi.fetchMusicUrl(mid).subscribe(
        items => {
          if (items) {
            this.isShowLoading = false;
            if (items.data[0].url == null) {
              this.errorInfo = "版权原因,无法获取歌曲信息."
            } else {
              // 歌曲id
              this.myMusicPlayer.mid = mid;

              if (musicname && musicsinger && musicalbumname) {
                this.myMusicPlayer.musicName = musicname;
                this.myMusicPlayer.musicAlbumName = musicalbumname;
                this.myMusicPlayer.musicSinger = musicsinger;
              }
              audio.src = items.data[0].url;
              audio.play();
              // 预加载歌词
              this.searchLyric();
            }

          }
        },
        error => { console.log(error); });
    } else {
      if (!audio.src) {
        this.errorInfo = "没有等待播放的音乐.";
        return;
      }
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }
  // 时间/加载进度变化
  timeUpdate(audio) {
    this.myMusicPlayer.lyricTime = this.formatTime(audio.currentTime.toFixed(0)) != this.myMusicPlayer.lyricTime ? this.formatTime(audio.currentTime.toFixed(0)) : this.myMusicPlayer.lyricTime;
    this.myMusicPlayer.currentTime = audio.currentTime;
    this.myMusicPlayer.duration = audio.duration;
    this.myMusicPlayer.played = (this.myMusicPlayer.currentTime / this.myMusicPlayer.duration * 100).toFixed(4) + "%";
  }
  progressUpdate(audio) {
    if (audio.buffered && audio.duration) {
      this.myMusicPlayer.progress = (audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100).toFixed(4) + "%";
    }
    
  }
  errorShow(errorShow){
    console.log(123);
  }
  switchMusic(audio, forward?: string) {
    // 快速点击上下一首
    let nowTimestamp = (new Date()).getTime();
    if ( (nowTimestamp-this.myMusicPlayer.lastClickTime) < 1500 ) {
      this.errorInfo = "点击频率过快";
      return;
    }
    // 快速点击会报错,设置点击时间
    this.myMusicPlayer.lastClickTime = nowTimestamp;
    if (forward == 'forward') {
      this.myMusicPlayer.currentIndex += 1;
    } else {
      if (this.myMusicPlayer.currentIndex > 0) {
        this.myMusicPlayer.currentIndex -= 1;
      } else {
        this.errorInfo = "已经到最前.";
        return;
      }
    }
    if (this.myMusicPlayer.currentType == 'playLists') {
      // 注意格式
      let tmp = this.playLists.tracks[this.myMusicPlayer.currentIndex];
      if (this.myMusicPlayer.currentIndex < (this.playLists.tracks.length - 1)) {
        this.playMusic(audio, tmp.id, tmp.ar[0].name, tmp.name, tmp.al.name, tmp.al.picUrl, this.myMusicPlayer.currentIndex);
      }
    } else {
      let tmp = this.searchResults[this.myMusicPlayer.currentIndex];
      if (this.myMusicPlayer.currentIndex < (this.searchResults.length - 1)) {
        this.playMusic(audio, tmp.id, tmp.artists[0].name, tmp.name, tmp.album.name, tmp.album.picUrl, this.myMusicPlayer.currentIndex);
      }
    }
  }
  // 歌词变化
  // 设置歌词显示页样式
  setLyricStyles(reset?: boolean) {
    if (reset) {
      // 展开歌词
      this.lyricStyles.top = "100%";
      this.lyricStyles.right = "100%";
      this.lyricStyles.opacity = "0";
    } else {
      // 展开歌词
      this.lyricStyles.top = this.lyricStyles.top == "100%" ? "60px" : "100%";
      this.lyricStyles.right = this.lyricStyles.right == "100%" ? "0px" : "100%";
      this.lyricStyles.opacity = this.lyricStyles.opacity == "0" ? "1" : "0";
    }

  }
  /*
  * 歌词页弹开收起
  * true:收起重置,false每点击一次更换状态
  */
  expandLyric(reset?: boolean) {
    this.setLyricStyles(reset);
  }
  // 音量
  volumeChange(audio) {
    audio.muted = !audio.muted;
  }
  // 快进
  positionChange(event) {
    console.log(event.target);
  }

  // 格式化时间
  /*
   * 将秒数格式化时间
   * @param {Number} seconds: 整数类型的秒数
   * @return {String} time: 格式化之后的时间
   */
  formatTime(seconds) {
    let min = Math.floor(seconds / 60),
      second = seconds % 60,
      hour, newMin, time, resultSec, resultMin;
    resultSec = second;
    resultMin = min;
    if (min > 60) {
      hour = Math.floor(min / 60);
      newMin = min % 60;
    }

    if (second < 10) { resultSec = '0' + second; }
    if (min < 10) { resultMin = '0' + min; }

    return time = hour ? (hour + ':' + newMin + ':' + resultSec) : (resultMin + ':' + resultSec);
  }
}
