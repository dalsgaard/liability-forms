const angular = require('angular');
const template = require('./signature-area.component.html');
require('./signature-area.scss');

function getPoint(e) {
  const touch = e.touches[0];
  return [touch.clientX, touch.clientY];
}

function controller($element, $scope, $window) {
  if ($window.orientation % 180) {
    this.width = $window.innerWidth;
    this.height = $window.innerHeight;
  } else {
    this.height = $window.innerWidth;
    this.width = $window.innerHeight;
  }

  this.$onInit = () => {
    const el = $element.find('canvas');
    this.canvas = el[0];
    this.ctx = this.canvas.getContext('2d');
    const color = '#00b';

    this.drawn = false;
    let drawing = false;
    let dot = false;
    let start = [];
    el.bind('touchstart', (e) => {
      start = getPoint(e);
      this.ctx.beginPath();
      this.ctx.moveTo(...start);
      drawing = true;
      dot = true;
      e.preventDefault();
    });
    el.bind('touchmove', (e) => {
      if (drawing) {
        this.drawn = true;
        dot = false;
        const [x, y] = getPoint(e);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
      }
      e.preventDefault();
    });
    el.bind('touchend', (e) => {
      drawing = false;
      if (dot) {
        this.ctx.fillStyle = color;
        this.ctx.arc(...start, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      e.preventDefault();
    });
    el.bind('touchcancel', (e) => {
      drawing = false;
      e.preventDefault();
    });

    $window.addEventListener('orientationchange', (e) => {
      this.createSignature();
    });
  };

  this.createSignature = () => {
    if (this.drawn) {
      this.canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          this.signature = reader.result;
          $scope.$apply();
        });
        reader.readAsDataURL(blob);
      });
    }
  };

  this.clear = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawn = false;
    this.signature = null;
  };
}

angular.module('demoApp').component('signatureArea', {
  template,
  bindings: {
    signature: '=',
  },
  controller,
});
