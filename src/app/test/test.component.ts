import { Component, OnInit } from '@angular/core';

import { CookieService , Cookie} from 'ng2-cookies';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  test: string;
  constructor(public _cookieService: CookieService) {
    if (this._cookieService.check("userProfiles")){
      console.log(this._cookieService.get('userProfiles'));
      this.test = JSON.parse(this._cookieService.get("userProfiles"))['userId'];
    } else {
      this.test = "123";
    }
    
  }

  ngOnInit() {
  }

}
