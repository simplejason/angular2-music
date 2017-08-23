import { Component, OnInit } from '@angular/core';
import { Route, Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  search: string;
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
  }
  searchChange() {
    if (!this.search){ return; };
    this.router.navigate(['/explore/'+this.search],{relativeTo:this.route});
  }
}
