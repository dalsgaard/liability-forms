const angular = require('angular');
const PDFDocument = require('pdfkit').default;
const blobStream = require('blob-stream');
const template = require('./liability-list.component.html');
require('./liability-list.scss');

const texts = require('./liability-texts.json');

function controller($mdDialog) {
  this.texts = texts;
  this.signature = null;
  this.name = null;
  this.signatureOpen = false;

  this.texts.forEach((text) => {
    text.active = text.mandatory || text.initial;
  });

  this.openSignature = () => {
    this.signatureOpen = true;
  };

  this.findActiveTexts = () => {
    this.activeTexts = this.texts.filter((text) => text.active);
  };

  this.read = (text) => {
    text.hasRead = !text.hasRead;
  };

  this.allRead = () => {
    //return !this.texts.find((text) => !text.hasRead);
    return true;
  };

  this.readAll = () => {
    const allRead = this.allRead();
    this.texts.forEach((text) => (text.hasRead = !allRead));
  };

  this.complete = () => {
    return !!(this.allRead() && this.signature && this.name);
  };

  this.submit = () => {
    this.createPdf();
  };

  this.createPdf = () => {
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    this.activeTexts.forEach((text) => {
      doc.fontSize(18).text(text.title);
      doc.fontSize(12);
      text.body.forEach((p) => {
        doc.moveDown().text(p);
      });
      doc.moveDown().moveDown();
    });
    doc.image(this.signature, { height: 100 }).moveDown().text(this.name);
    doc.end();

    stream.on('finish', () => {
      const pdf = stream.toBlob('application/pdf');
      this.sendPdf(pdf);
    });
  };

  this.hideDialog = () => {
    $mdDialog.hide();
  };

  this.addText = (e) => {
    $mdDialog
      .show({
        contentElement: '#textsDialog',
        parent: angular.element(document.body),
        targetEvent: e,
        clickOutsideToClose: true,
      })
      .then(
        () => this.findActiveTexts(),
        () => this.findActiveTexts()
      );
  };

  this.sendPdf = (pdf) => {
    const reader = new FileReader();
    reader.onload = (e) => console.log(e.target.result); // TODO: Send to image queue
    reader.readAsDataURL(pdf);
  };

  this.findActiveTexts();
}

angular.module('demoApp').component('liabilityList', {
  template,
  controller,
});
