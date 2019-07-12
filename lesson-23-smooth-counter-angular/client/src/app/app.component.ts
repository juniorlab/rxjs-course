import {Component, ElementRef, ViewChild} from '@angular/core';
import {AfterViewInit} from "@angular/core";
import {fromEvent, Observable, Subject} from "rxjs";
import {map, startWith, tap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

}
