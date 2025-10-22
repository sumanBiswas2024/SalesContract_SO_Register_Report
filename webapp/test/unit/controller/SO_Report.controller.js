/*global QUnit*/

sap.ui.define([
	"com/crescent/app/soregisteredreport/controller/SO_Report.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SO_Report Controller");

	QUnit.test("I should test the SO_Report controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
