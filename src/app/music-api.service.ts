import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class MusicApiService {
  musicApiURL: string;
  constructor(private http: Http) {
    this.musicApiURL = 'http://23.106.147.246:3000';
  }
  // 歌单列表详情
  fetchMyplaylist(id): Observable<any> {
    let data = new URLSearchParams();
    data.append('id', id.toString());
    return this.http.get(`${this.musicApiURL}/playlist/detail`, { search: data })
      .map(response => response.json());
  }
  // 按用户ID获取歌单
  fetchMyplaylistByUID(id: string): Observable<any> {
    let data = new URLSearchParams();
    data.append('uid', id.toString());
    return this.http.get(`${this.musicApiURL}/user/playlist`, { search: data })
      .map(response => response.json());
  }
  // 搜索
  searchAnything(searchStr: string, limit?: number, type?: string): Observable<any> {
    let data = new URLSearchParams();
    data.append('keywords', searchStr);
    data.append('limit', limit.toString());
    data.append('type', type.toString());
    return this.http.get(`${this.musicApiURL}/search`, { search: data })
      .map(response => response.json());
  }
  // 获取歌曲真实url
  fetchMusicUrl(id): Observable<any> {
    let data = new URLSearchParams();
    data.append('id', id);
    return this.http.get(`${this.musicApiURL}/music/url`, { search: data })
      .map(response => response.json());
  }

  // 获取歌词
  fetcMusicLyric(id): Observable<any> {
    let data = new URLSearchParams();
    data.append('id', id);
    return this.http.get(`${this.musicApiURL}/lyric`, { search: data })
      .map(response => response.json());
  }
}
