import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { CryptoQuote } from '../cryptoquote.service';


export interface CryptoPrice {
  date: Date;
  value: number;
}


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})

export class ChartComponent implements OnInit {

  title = 'Crypto Tracker';
  subtitle = 'Fake CryptoPrice Prices By Day';

  margin = {top: 20, right: 20, bottom: 30, left: 50};
  width: number;
  height: number;
  x: any;
  y: any;
  svg: any;
  line: d3Shape.Line<[number, number]>;

  CryptoPrices: CryptoPrice[] = [];

  constructor(private cryptoQuote: CryptoQuote) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  updateQuotes() {
    let _this = this;
    this.cryptoQuote.getPastDayBars('btcusd', 'gdax', 1).subscribe(bars => {
      bars.forEach( function (bar) {
        _this.CryptoPrices.push({
          date: new Date(bar.time),
          value: +bar.open
        });
      });
      _this.initSvg();
      _this.initAxis();
      _this.drawAxis();
      _this.drawLine();
    })
  }

  ngOnInit() {
    this.updateQuotes();
  }

  initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.CryptoPrices, (d) => d.date ));
    this.y.domain(d3Array.extent(this.CryptoPrices, (d) => d.value ));
  }

  drawAxis() {
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3Axis.axisBottom(this.x));

    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');
  }

  drawLine() {
    this.line = d3Shape.line()
      .x( (d: any) => this.x(d.date) )
      .y( (d: any) => this.y(d.value) );

    this.svg.append('path')
      .datum(this.CryptoPrices)
      .attr('class', 'line')
      .attr('d', this.line);
  }
}
