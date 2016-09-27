define([
    "dojo/_base/declare", 'dojo/Stateful'
  ],

  /* Note: the D3 library is required for this module. */

  function(declare, Stateful) {
    return declare([Stateful], {

      domNode: null, // The DOM to attach too
      view: null, // The map view
      colour: '#444444', // The colour of the scalebar
      unit: 'dual', // The scalebar units, metric, imperial or dual

      // Usage: Scalebar.set('colour', '#newColour')
      _colourSetter: function(value) {
        this.colour = value;
        this._updateColour(value);
      },

      // Usage: Scalebar.set('unit', 'dual/metric/imperial')
      _unitSetter: function(value) {
        this.unit = value;
        this._updateUnits(value);
      },

      constructor: function(args) {
        declare.safeMixin(this, args);
        console.log('Loading Scalebar');

        this.svgContainer = null;
        this.leftEndLine = null;
        this.scaleLineMetric = null;
        this.scaleLineImperial = null;
        this.metricLine = null;
        this.metricText = null;
        this.imperialLine = null;
        this.imperialText = null;

        // Initialise a SVG container into the domNode
        this.svgContainer = d3.select('#' + this.domNode).append('svg').attr("width", 175).attr("height", 35);

        // Add the scalebar lines and text SVG elements
        this.leftEndLine = this.svgContainer.append("line")
          .attr('x1', 1)
          .attr('y1', 13)
          .attr('x2', 1)
          .attr('y2', 23)
          .attr('stroke-width', 1.5)
          .attr('stroke', this.colour);

        this.scaleLineMetric = this.svgContainer.append("line")
          .attr('x1', 0)
          .attr('y1', 18)
          .attr('x2', 0)
          .attr('y2', 18)
          .attr('stroke-width', 1.5)
          .attr('stroke', this.colour);

        this.scaleLineImperial = this.svgContainer.append("line")
          .attr('x1', 0)
          .attr('y1', 18)
          .attr('x2', 0)
          .attr('y2', 18)
          .attr('stroke-width', 1.5)
          .attr('stroke', this.colour);

        this.metricLine = this.svgContainer.append("line")
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 18)
          .attr('y2', 13)
          .attr('stroke-width', 1.5)
          .attr('stroke', this.colour);

        this.metricText = this.svgContainer.append("text")
          .attr('x', 0)
          .attr('y', 10)
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .attr('fill', this.colour);

        this.imperialLine = this.svgContainer.append("line")
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 18)
          .attr('y2', 23)
          .attr('stroke-width', 1.5)
          .attr('stroke', this.colour);

        this.imperialText = this.svgContainer.append("text")
          .attr('x', 0)
          .attr('y', 33)
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .attr('fill', this.colour);

        var self = this;

        // We need to watch the views scale parameter, as Vector Tiles do not
        // trigger the updating property
        this.view.watch('scale', function() {
          self._updateScalebar();
        });
      },

      // If the colour is changed, update all the SVG elements
      _updateColour: function(colour) {
        this.leftEndLine.attr('stroke', colour);
        this.scaleLineMetric.attr('stroke', colour);
        this.scaleLineImperial.attr('stroke', colour);
        this.metricLine.attr('stroke', colour);
        this.metricText.attr('fill', colour);
        this.imperialLine.attr('stroke', colour);
        this.imperialText.attr('fill', colour);
      },

      // If the unit is changed, update the scalebar
      _updateUnits: function(units) {
        if (units === 'metric') {
          // Remove the imperial marker, then refresh the scalebar
          this.scaleLineImperial.attr('x2', 0);
          this.imperialLine.attr('x1', 0).attr('x2', 0);
          this.imperialText.text('')
            .attr('x', 0);
        }
        else if (units === 'imperial') {
          // Remove the metric marker, then refresh the scalebar
          this.scaleLineMetric.attr('x2', 0);
          this.metricLine.attr('x1', 0).attr('x2', 0);
          this.metricText.text('')
            .attr('x', 0);
        }

        this._updateScalebar();
      },

      _updateScalebar: function() {
        var self = this;

        require(['esri/geometry/Polyline', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/geometry/ScreenPoint', 'esri/geometry/support/webMercatorUtils', 'dojo/dom-geometry'],
          function(Polyline, Point, SpatialReference, ScreenPoint, webMercatorUtils, domGeom) {

          var c = domGeom.position(document.getElementById(self.domNode), !0).y - self.view.position[1],
            c = c > self.view.height ? self.view.height : c;
          c = 0 > c ? 0 : c;
          b = new ScreenPoint(0, c);
          c = new ScreenPoint(self.view.width, c);
          var f, e;
          this.mapUnit = "esriDecimalDegrees";
          var d = self._toMapGeometry(self.view.extent, self.view.width, self.view.height, b),
            h = self._toMapGeometry(self.view.extent, self.view.width, self.view.height, c),
            b = new Point({
              x: self.view.extent.xmin,
              y: (self.view.extent.ymin + self.view.extent.ymax) / 2,
              spatialReference: self.view.spatialReference
            }),
            c = new Point({
              x: self.view.extent.xmax,
              y: (self.view.extent.ymin + self.view.extent.ymax) / 2,
              spatialReference: self.view.spatialReference
            });

          if (3857 === self.view.spatialReference.wkid || 102100 === self.view.spatialReference.wkid ||
            102113 === self.view.spatialReference.wkid || self.view.spatialReference.wkt && -1 != self.view.spatialReference.wkt.indexOf("WGS_1984_Web_Mercator")) {
            d = webMercatorUtils.webMercatorToGeographic(d, !0);
            h = webMercatorUtils.webMercatorToGeographic(h, !0);
            b = webMercatorUtils.webMercatorToGeographic(b, !0);
            c = webMercatorUtils.webMercatorToGeographic(c, !0);
          }

          if ("esriDecimalDegrees" === this.mapUnit) {
            a = new Polyline();
            a.addPath([d, h]);;
            d = self._straightLineDensify(a, 10);
            a = self._geodesicLengths([d], 'esriKilometers')[0];

            d = new Polyline();
            d.addPath([b, c]);
            b = self._straightLineDensify(d, 10);
            self._geodesicLengths([b], 'esriKilometers');
            e = a / 1.609;
            f = a;
          }

          if (self.unit === 'metric') {
            self._getScaleBarLength(f, "km");
          }
          else if (self.unit === 'imperial') {
            self._getScaleBarLength(e, "mi");
          }
          else if (self.unit === 'dual') {
            self._getScaleBarLength(f, "km");
            self._getScaleBarLength(e, "mi");
          }
        });
      },

      _getScaleBarLength: function(a, c) {
        var b = 50 * a / this.view.width,
          f = 0,
          e = c;
        0.1 > b && ("mi" === c ? (b *= 5280, e = "ft") : "km" === c && (b *= 1E3, e = "m"));
        for (; 1 <= b;) b /= 10, f++;
        var d, h;
        0.5 < b ? (d = 1, h = 0.5) : 0.3 < b ? (d = 0.5, h = 0.3) : 0.2 < b ? (d = 0.3, h = 0.2) : 0.15 < b ? (d = 0.2, h = 0.15) : 0.1 <= b && (d = 0.15, h = 0.1);
        d = d / b >= b / h ? h : d;
        b = 50 * (d / b);
        f = Math.pow(10, f) * d;

        if (e === 'km' || e === 'm') {
          this.scaleLineMetric.attr('x2', (2 * Math.round(b)));
          this.metricLine.attr('x1', (2 * Math.round(b)) - 1).attr('x2', (2 * Math.round(b)) - 1);
          this.metricText.text(2 * f + e)
            .attr('x', (2 * Math.round(b)) - 4);
        }
        else {
          this.scaleLineImperial.attr('x2', (2 * Math.round(b)));
          this.imperialLine.attr('x1', (2 * Math.round(b)) - 1).attr('x2', (2 * Math.round(b)) - 1);
          this.imperialText.text(2 * f + e)
            .attr('x', (2 * Math.round(b)) - 4);
        }

      },

      _straightLineDensify: function(a, f) {
        var result = null;
        require(['esri/geometry/Polyline'], function(Polyline) {
          var c = a instanceof Polyline,
            b = [],
            e;
          dojo.forEach(c ? a.paths : a.rings, function(a) {
            b.push(e = []);
            e.push([a[0][0], a[0][1]]);
            var n, c, p, m, l, g, h, k, r, q, s, t;
            for (l = 0; l < a.length - 1; l++) {
              n = a[l][0];
              c = a[l][1];
              p = a[l + 1][0];
              m = a[l + 1][1];
              h = Math.sqrt((p - n) * (p - n) + (m - c) * (m - c));
              k = (m - c) / h;
              r = (p - n) / h;
              q = h / f;
              if (1 < q) {
                for (g = 1; g <= q - 1; g++) t = g * f, s = r * t + n, t = k * t + c, e.push([s, t]);
                g = (h + Math.floor(q - 1) * f) / 2;
                s = r * g + n;
                t = k * g + c;
                e.push([s, t])
              }
              e.push([p, m])
            }
          });
          if (c) {
            result = new Polyline({
              paths: b,
              spatialReference: a.spatialReference
            });
          }
        });
        return result;
      },

      _geodesicLengths: function(a, r) {
        var self = this;

        var A = {
          esriMeters: 1,
          esriKilometers: 1E3,
          esriYards: 0.9144,
          esriFeet: 0.3048,
          esriMiles: 1609.344,
          esriNauticalMiles: 1852,
          esriInches: 0.0254,
          esriDecimeters: 0.1,
          esriCentimeters: 0.01,
          esriMillimeters: 0.0010,
          esriSquareMeters: 1,
          esriSquareKilometers: 1E6,
          esriSquareYards: 0.83612736,
          esriSquareFeet: 0.09290304,
          esriSquareMiles: 2589988.110336,
          esriAcres: 4046.8564224,
          esriHectares: 1E4,
          esriAres: 100,
          esriSquareInches: 6.4516E-4,
          esriSquareMillimeters: 1E-6,
          esriSquareCentimeters: 1E-4,
          esriSquareDecimeters: 0.01
        };

        var b = Math.PI / 180,
          d = [];
        dojo.forEach(a, function(a, p) {
          var h = 0;
          dojo.forEach(a.paths, function(a, e) {
            var k = 0,
              c, d, g, f, l;
            for (c = 1; c < a.length; c++) d = a[c - 1][0] * b, g = a[c][0] * b, f = a[c - 1][1] * b, l = a[c][1] * b, f === l && d === g || (d = self.z(f, d, l, g), k += d.geodesicDistance);
            h += k
          });
          h /= A[r];
          d.push(h)
        });
        return d
      },

      z: function(a, r, b, d) {
        var f = 1 / 298.257223563,
          p = d - r,
          h = Math.atan((1 - f) * Math.tan(a)),
          m = Math.atan((1 - f) * Math.tan(b)),
          e = Math.sin(h),
          h = Math.cos(h),
          k = Math.sin(m),
          m = Math.cos(m),
          c = p,
          u, g = 1E3,
          w, l, n, q, s, t, v;
        do {
          n = Math.sin(c);
          q = Math.cos(c);
          l = Math.sqrt(m * n * m * n + (h * k - e * m * q) * (h * k - e * m * q));
          if (0 === l) return 0;
          q = e * k + h * m * q;
          s = Math.atan2(l, q);
          t = h * m * n / l;
          w = 1 - t * t;
          n = q - 2 * e * k / w;
          isNaN(n) && (n = 0);
          v = f / 16 * w * (4 + f * (4 - 3 * w));
          u = c;
          c = p + (1 - v) * f * t * (s +
            v * l * (n + v * q * (-1 + 2 * n * n)))
        } while (1E-12 < Math.abs(c - u) && 0 < --g);
        if (0 === g) return e = 6371009 * Math.acos(Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(d - r)), k = d - r, h = Math.sin(k) * Math.cos(b), a = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(k), {
          azimuth: Math.atan2(h, a),
          geodesicDistance: e
        };
        a = 2.7233160610754688E11 * w / 4.040829998466145E13;
        b = a / 1024 * (256 + a * (-128 + a * (74 - 47 * a)));
        a = 6356752.31424518 * (1 + a / 16384 * (4096 + a * (-768 + a * (320 - 175 * a)))) * (s - b * l * (n + b / 4 * (q * (-1 + 2 * n * n) - b / 6 * n * (-3 + 4 * l * l) * (-3 + 4 * n * n))));
        b =
          Math.atan2(m * Math.sin(c), h * k - e * m * Math.cos(c));
        e = Math.atan2(h * Math.sin(c), h * k * Math.cos(c) - e * m);
        return {
          azimuth: b,
          geodesicDistance: a,
          reverseAzimuth: e
        }
      },

      // Converts a screenPoint into a Map Point geometry
      _toMapGeometry: function(extent, width, height, screenGeometry) {
        var newPoint;

        require(['esri/geometry/Point', 'dojo/_base/array'], function(Point, array) {
          var g = extent.xmin,
            e = extent.ymax,
            f = extent.spatialReference,
            c = width / extent.width,
            h = height / extent.height,
            d = array.forEach;

          newPoint = new Point({
            x: g + screenGeometry.x / c,
            y: e - screenGeometry.y / h,
            spatialReference: f
          });
        });
        return newPoint;
      }
  });
});
