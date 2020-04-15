const angular = require('angular');
const PDFDocument = require('pdfkit').default;
const blobStream = require('blob-stream');
const template = require('./liability-list.component.html');
require('./liability-list.scss');

console.log(PDFDocument);

const texts = require('./liability-texts.json');

function controller() {
  this.texts = texts;
  this.signature = null;

  this.read = (text) => {
    console.log(text.title);
    text.hasRead = !text.hasRead;
  };

  this.allRead = () => {
    return !this.texts.find((text) => !text.hasRead);
  };

  this.readAll = () => {
    const allRead = this.allRead();
    this.texts.forEach((text) => (text.hasRead = !allRead));
  };

  this.complete = () => {
    console.log(this.allRead());
    return !!(this.allRead() && this.signature);
  };

  this.sign = () => {
    this.createPdf();
  };

  this.createPdf = () => {
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    this.texts.forEach((text) => {
      doc
        .fontSize(20)
        .text(text.title)
        .fontSize(12)
        .moveDown()
        .text(text.body)
        .moveDown();
    });

    doc.image(this.signature, { height: 100 });
    doc.end();

    stream.on('finish', () => {
      const pdf = stream.toBlob('application/pdf');
      this.sendPdf(pdf);
    });
  };

  this.sendPdf = (pdf) => {
    const reader = new FileReader();
    reader.onload = (e) => console.log(e.target.result);
    reader.readAsDataURL(pdf);
  };
}

angular.module('demoApp').component('liabilityList', {
  template,
  controller,
});