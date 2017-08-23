import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainContentComponent } from './main-content/main-content.component';

import { MusicApiService } from "./music-api.service";
import { GlobalDataService } from "./global-data.service";
import { CookieService } from 'ng2-cookies';

import { routing } from './app.routes';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MainContentComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    routing
  ],
  providers: [MusicApiService, GlobalDataService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
