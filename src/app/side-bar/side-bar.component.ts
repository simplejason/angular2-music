import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  @Input() playListsAll: any;
  @Input() myMusicPlayer: any;
  constructor() { }

  ngOnInit() {
  }

}
