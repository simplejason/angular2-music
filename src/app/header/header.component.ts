import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
// observable
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/skipWhile";

import { MusicApiService } from "../music-api.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // search: string;
  searchItems: any;
  search = new FormControl();
  constructor(private route: ActivatedRoute, private router: Router, private _musicapi: MusicApiService) {
    this.searchItems = {
      "songs": [],
      "singers": []
    };
    // 优化延时搜索
    this.search.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .flatMap(item => this._musicapi.searchMusicSuggest(item))
      .subscribe(items => {
        if (items.hasOwnProperty('result')) {
          this.searchItems.songs = items.result.songs ? items.result.songs : [];
          this.searchItems.singers = items.result.artists ? items.result.artists : [];
        } else {
          // 恢复初始化
          this.searchItems = {
            "songs": [],
            "singers": []
          };
        }
      });
  }

  ngOnInit() {
  }
  searchChange(searchStr: string = "") {
    // 恢复初始化
    this.searchItems = {
      "songs": [],
      "singers": []
    };
    if (searchStr) {
      this.router.navigate(['/explore/' + searchStr], { relativeTo: this.route });
      return;
    }
    this.router.navigate(['/explore/' + this.search.value], { relativeTo: this.route });
  }
}
