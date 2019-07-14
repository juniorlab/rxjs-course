import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { NormalizeNegativeNumberPipe } from './normalize-negative-number.pipe';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    NormalizeNegativeNumberPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
