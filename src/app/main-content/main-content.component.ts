import { Component, OnInit } from '@angular/core';
import { CookieService, Cookie } from 'ng2-cookies';
import { Route, Router, ActivatedRoute, Params } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

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
  menuState: number;
  errorInfo: string;
  searchWord: string;
  currentSearchOption: string;
  listId: string;
  myMusicPlayer: any;
  lyricStyles: any;
  lyricPlayStyles: any;
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
      "lyric": []
    };
    this.lyricStyles = {
      "top": "100%",
      "right": "100%",
      "opacity": "0"
    }
    this.lyricPlayStyles = {
      "-webkit-animation-play-state": "running",
      "animation-play-state": "running"
    }
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
      // search存在表示是搜索结果|id存在是歌单
      this.searchWord = params['search'] ? params['search'] : "";
      this.listId = params['id'] ? params['id'] : "";
      if (this.searchWord) {
        this.searchData(this.searchWord);
      }
      if (this.listId) {
        this.searchPlayList(this.listId);
      }
    });


  }
  // 换类别高亮
  reSearch(search, type) {
    this.currentSearchOption = type;
  }

  searchData(search, limit = 99, type = '1') {
    this.isShowLoading = true;
    this._musicapi.searchAnything(search, limit, type).subscribe(
      items => {
        if (items) {
          this.searchResults = items.result.songs;
          this.isShowLoading = false;
        }
      },
      error => console.log(error));
  }
  searchPlayList(id) {
    this.isShowLoading = true;
    this._musicapi.fetchMyplaylist(id).subscribe(
      items => {
        if (items) {
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
        if (!items.nolyric) {
          let tmpLyric = items.lrc.lyric.split('\n');
          let tmp = {};
          for (let ly of tmpLyric) {
            if (/(\d+:){1,2}\d+\.?\d+/g.test(ly)) {
              tmp = {
                "time": ly.match(/(\d+:){1,2}\d+\.?\d+/g)[0],
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
  playMusic(audio, mid?: string, musicsinger?: string, musicname?: string, musicalbumname?: string, musicpic?: string) {
    if (mid) {
      this.errorInfo = "";
      this.isShowLoading = true;
      this._musicapi.fetchMusicUrl(mid).subscribe(
        items => {
          if (items) {
            this.isShowLoading = false;
            if (items.data[0].url == null) {
              this.errorInfo = "版权原因,无法获取歌曲信息."
              return;
            }
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
    this.myMusicPlayer.currentTime = audio.currentTime;
    this.myMusicPlayer.duration = audio.duration;
    this.myMusicPlayer.played = (this.myMusicPlayer.currentTime / this.myMusicPlayer.duration * 100).toFixed(4) + "%";
  }
  progressUpdate(audio) {
    this.myMusicPlayer.progress = (audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100).toFixed(4) + "%";
  }

  // 歌词变化
  // 设置歌词显示页样式
  setLyricStyles(reset?: boolean) {
    if (reset) {
      // 展开歌词
      this.lyricStyles.top = "100%";
      this.lyricStyles.right = "100%";
      this.lyricStyles.opacity ="0";      
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
  expandLyric(reset?:boolean) {
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

    if (min > 60) {
      hour = Math.floor(min / 60);
      newMin = min % 60;
    }

    if (second < 10) { resultSec = '0' + second; }
    if (min < 10) { resultMin = '0' + min; }

    return time = hour ? (hour + ':' + newMin + ':' + resultSec) : (resultMin + ':' + resultSec);
  }
}
