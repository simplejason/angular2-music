import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-explore-content',
  templateUrl: './explore-content.component.html',
  styleUrls: ['./explore-content.component.css']
})
export class ExploreContentComponent implements OnInit {
  @Input() exploreResults: any;
  constructor() { }

  ngOnInit() {
  }

}
