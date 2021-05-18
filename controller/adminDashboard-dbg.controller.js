sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"TrackerEntry/TrackerEntry/libs/FileSaver",
	"TrackerEntry/TrackerEntry/libs/tableexport",
	"TrackerEntry/TrackerEntry/libs/xlsx"
], function (Controller, Spreadsheet, fsjs, texjs, exclsxjs) {
	"use strict";

	return Controller.extend("TrackerEntry.TrackerEntry.controller.adminDashboard", {
		onInit: function () {

			var picker = this.getView().byId("picker0");
			var newDate = new Date();
			picker.setDateValue(newDate);

			var dateSubmit = picker.getDateValue();
			/*var dateFinal = ""+ dateSubmit.getYear() + "/" + (dateSubmit.getMonth() + 1) + "/" + dateSubmit.getDate();*/
			//var daySubmit = dateSubmit.getDay();

			//Hide all Boxes
			this.getView().byId("defaulterHBox").setVisible(false);
			this.getView().byId("billableHBox").setVisible(false);
			this.getView().byId("nonBillableHBox").setVisible(false);
			//attach Data to Micro Charts
			this.attachDataMicroCharts(dateSubmit);
			//Dynamic Harvey Chart
			this.attachHarveyCharts();
			//Data for Billable & Non Billable Table
			this.attachDataBillable();
			this.attachDataNonBillable();
			this.showDefaulters(dateSubmit);
			this.changeHeaderDate(dateSubmit);

			//Style
			this.styleThis();
			//Highlight Today
			this.highlightToday(dateSubmit);
		},
		exportToExcel: function () {
			var that = this;

			// new TableExport(document.getElementById("__xmlview2--table1-listUl"), {
			//     headers: true,                              // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
			//     footers: true,                              // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
			//     formats: ['xls'],             // (String[]), filetype(s) for the export, (default: ['xls', 'csv', 'txt'])
			//     filename: 'defaulterList',                             // (id, String), filename for the downloaded file, (default: 'id')
			//     bootstrap: false,                           // (Boolean), style buttons using bootstrap, (default: true)
			//     exportButtons: true,                        // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
			//     position: 'top',                         // (top, bottom), position of the caption element relative to table, (default: 'bottom')
			//     ignoreRows: null,                           // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
			//     ignoreCols: null,                           // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
			//     trimWhitespace: true                        // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
			// });
			var tabId = that.getView().getId() + "--table1-listUl";
			var ExportButtons = document.getElementById(tabId);

			var instance = new TableExport(ExportButtons, {
				headers: true,
				footers: true,
				formats: ['xls'],
				exportButtons: false,
				filename: 'DefaulterList',
				trimWhitespace: true
			});

			//                                        // "id" of selector    // format
			var exportData = instance.getExportData()[tabId]['xls'];
			instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);

			// var aBoundProperties, aCols, oProperties, oRowBinding, oSettings, oTable, oController;
			// oController = this;

			// if (!this._oTable) {
			// 	this._oTable = this.byId("table1");
			// }

			// oTable = this._oTable;
			// oRowBinding = oTable.getBinding("items");
			// aCols = this.createColumnConfig();

			// // aProducts = this.getView().getModel().getProperty("/ProductCollection");

			// var oModel = oRowBinding.getModel();
			// var oModelInterface = oModel.getInterface();

			// oSettings = {
			// 	workbook: { columns: aCols,
			// 		hierarchyLevel: 'Level'
			// 		},
			// 	dataSource: {
			// 		type: "oData",
			// 		dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
			// 		serviceUrl: oModelInterface.sServiceUrl,
			// 		headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
			// 		count: oRowBinding.getLength ? oRowBinding.getLength() : null,
			// 		useBatch: oModelInterface.bUseBatch,
			// 		sizeLimit: oModelInterface.iSizeLimit
			// 	},
			// 	worker: true // We need to disable worker because we are using a MockServer as OData Service
			// };

			// new Spreadsheet(oSettings)
			// 	.build()
			// 	.then( function() {
			// 		sap.m.MessageToast.show("Spreadsheet export has finished");
			// 	});
		},
		exportToExcel2: function () {
			var that = this;
			var tabId = that.getView().getId() + "--table2-listUl";
			var ExportButtons = document.getElementById(tabId);

			var instance = new TableExport(ExportButtons, {
				headers: true,
				footers: true,
				formats: ['xls'],
				exportButtons: false,
				filename: 'Billable',
				trimWhitespace: true
			});

			//                                        // "id" of selector    // format
			var exportData = instance.getExportData()[tabId]['xls'];
			instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);

		},
		exportToExcel3: function () {
			var that = this;
			var tabId = that.getView().getId() + "--table3-listUl";
			var ExportButtons = document.getElementById(tabId);

			var instance = new TableExport(ExportButtons, {
				headers: true,
				footers: true,
				formats: ['xls'],
				exportButtons: false,
				filename: 'Billable',
				trimWhitespace: true
			});

			//                                        // "id" of selector    // format
			var exportData = instance.getExportData()[tabId]['xls'];
			instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);

		},
		changeHeaderDate: function (date) {
			this.getView().byId("table1_HLabel").setText("Defaulter's List for " + date);

		},
		styleThis: function () {
			this.getView().byId("monLbl").addStyleClass("chartCSS");
			this.getView().byId("tueLbl").addStyleClass("chartCSS");
			this.getView().byId("wedLbl").addStyleClass("chartCSS");
			this.getView().byId("thuLbl").addStyleClass("chartCSS");
			this.getView().byId("friLbl").addStyleClass("chartCSS");

			this.getView().byId("table1_HLabel").addStyleClass("tablLbl");
			this.getView().byId("table2_HLabel").addStyleClass("tablLbl");
			this.getView().byId("table3_HLabel").addStyleClass("tablLbl");

		},
		onDateChange: function () {
			var picker = this.getView().byId("picker0");
			var newDate = picker.getDateValue();
			// var dateSubmit = picker.getValue();
			this.highlightToday(newDate);
			this.showDefaulters(newDate);
			this.changeHeaderDate(newDate);
			//attach Data to Micro Charts
			this.attachDataMicroCharts(newDate);
		},
		adjustDate: function (dateObj) {
			var d, m, y;

			d = dateObj.getDate();
			m = dateObj.getMonth() + 1;
			y = dateObj.getFullYear();

			if (d < 10) {
				d = "0" + d;
			}
			if (m < 10) {
				m = "0" + m;
			}

			var res = "" + y + "" + m + "" + d;

			return res;
		},
		getEmailString: function(){
			var sMail = this.emailArray.toString();
			sMail = sMail.replace(/\s*,\s*|\s+,/g, ';');
			sMail = sMail + ";";
			return sMail;
		},
		mailTrigger: function(evt){
			var that = this;
			that.getView().setBusy(true);
			var oModel = this.getOwnerComponent().getModel("mailTracker");
	
			var picker = this.getView().byId("picker0");
			var newDate = picker.getDateValue();
			
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
			var curDate = dateFormat.format(newDate);
			

			var curDate2 = "" + curDate + "T05:30:00";
			
			oModel.callFunction(
				"/ZEmailTrigger",{
					method: "GET", 
					urlParameters: {	
						Date: curDate2
					},
					
					success: function(oData, response) {
						
						that.getView().setBusy(false);
						Spreadsheet.show("Email Sent");
						
					},
					
					error: function(oError){
						that.getView().setBusy(false);
						Spreadsheet.show("Email Not Sent");
						
					}
				}
			
			);
			
		/*	var sDate = new Date();
			var sBody = "Hello," + "\n\n" +
						"Please update the portal ASAP." + "\n" +
						"Note: Deadline to update the portal is 4 PM daily." + "\n\n" +
						"Thanks & Regards," + "\n" +
						"Divya Fernandes" + "\n" +
						"PMO Manager | AppsNA SAP Solution Center" + "\n\n" +
						"Tel.: +91 22 67 55 7000 Ext.: 2283189 Mob.: + 91 9819504210" + "\n" +
						"www.capgemini.com"
						;
						
		
			sDate = sDate.toLocaleDateString();
			
			sap.m.URLHelper.triggerEmail(this.getEmailString(), "Reminder! Daily tracker portal update -" + sDate, sBody);*/
			
			
		},
		showDefaulters: function (curDate) {
			var that = this;
			var allUsers = [];
			var allUserNames = [];
			var allUnames = [];
			var allEmails = [];

			//Get all references	
			var self = this;
			var oModel = this.getOwnerComponent().getModel("DTDashF");
			oModel.setUseBatch(false);
			//Change here for defaulters
			// var oModelUsers = this.getOwnerComponent().getModel("DTUser");
			
			var oModelActive = this.getOwnerComponent().getModel("DTActiveUsers");
			
			var table1 = self.getView().byId("table1");
			table1.destroyItems();

			//Date to string manipulation
			var curDate2 = this.adjustDate(curDate);
			/*curDate2 = curDate2.substr(0,10);
			curDate2 = curDate2.replace(/-/g, "");*/

		/*	//Filters
			var filter = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
			var filter2 = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "9");*/

			// oModelUsers.read("/ZSOL_USER_CDS", {
			oModelActive.read("/ZSOL_ACTIVE_USERS('" + curDate2 + "')/Set", {
				method: "GET",
				async: true,
				// filters: [filter, filter2],
				success: function (oData) {

					for (var i = 0; i < oData.results.length; i++) {
						var emp = oData.results[i].user_id;
						var name = oData.results[i].user_fname;
						var uname = oData.results[i].user_uname;
						var email = oData.results[i].user_email;
						allUsers.push(emp);
						allUserNames.push(name);
						allUnames.push(uname);
						allEmails.push(email);
					}
			oModel.read("/ZSOL_DASHF_SRV('" + curDate2 + "')/Set", {
						method: "GET",
						async: true,
						success: function (oData2) {

							for (var k = 0; k < oData2.results.length; k++) {
								var emp = oData2.results[k].dt_uid;
								var name = oData2.results[k].fname;
								var uname = oData2.results[k].uname;
								var email = oData2.results[k].email;

								var indexUsers = allUsers.indexOf(emp);
								var indexNames = allUserNames.indexOf(name);
								var indexUnames = allUnames.indexOf(uname);
								var indexEmails = allEmails.indexOf(email);
								
								if (indexUsers > -1) {
									allUsers.splice(indexUsers, 1);
								}
								if (indexNames > -1) {
									allUserNames.splice(indexNames, 1);
								}
								if (indexUnames > -1) {
									allUnames.splice(indexUnames, 1);
								}
								if (indexEmails > -1) {
									allEmails.splice(indexEmails, 1);
								}

							}
							for (var c = 0; c < allUsers.length; c++) {
								table1.addItem(new sap.m.ColumnListItem({
									cells: [new sap.m.Text({
											text: allUsers[c]
										}),
										new sap.m.Text({
											text: allUserNames[c]
										}),
										new sap.m.Text({
											text: allUnames[c]
										}),
										new sap.m.Text({
											text: allEmails[c]
										})
									]
								}));
							}
							that.emailArray = allEmails;

						}
					});
				}
			});
			
			// oModel.read("/ZSOL_DASHF_SRV('" + curDate2 + "')/Set", {
			// 	async: true,
			// 	success: function (oData2) {

			// 		for (var k = 0; k < oData2.results.length; k++) {
			// 			var emp = oData2.results[k].dt_uid;
			// 			var name = oData2.results[k].user_fname;

			// 			var index = allUsers.indexOf(emp);

			// 			var index2 = allUserNames.indexOf(name);
			// 			if (index > -1) {
			// 				allUsers.splice(index, 1);
			// 			}
			// 			if (index > -1) {
			// 				allUserNames.splice(index2, 1);
			// 			}

			// 		}
			// 		for (var c = 0; c < allUsers.length; c++) {
			// 			table1.addItem(new sap.m.ColumnListItem({
			// 				cells: [new sap.m.Text({
			// 						text: allUsers[c]
			// 					}),
			// 					new sap.m.Text({
			// 						text: allUserNames[c]
			// 					})
			// 				]
			// 			}));
			// 		}

			// 	}
			// });
		},
		attachDataNonBillable: function () {
			var UPROModel = this.getOwnerComponent().getModel("HeaderR");
			var table = this.getView().byId("table3");
			table.setModel(UPROModel);

			var myFill = [];

			var filter = new sap.ui.model.Filter("rest_id", sap.ui.model.FilterOperator.EQ, "2");
			var filter2 = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.NE, "0");
			myFill.push(filter, filter2);

			table.bindAggregation("items", "/ZSOL_UPRO_R_SRV", new sap.m.ColumnListItem({
				cells: [new sap.m.Text({
					text: "{user_id}"
				}), new sap.m.Text({
					text: "{user_fname}"
				})]
			}));

			var tableBind = table.getBinding("items");
			tableBind.filter(myFill);
		},
		attachDataBillable: function () {
			var UPROModel = this.getOwnerComponent().getModel("HeaderR");
			var table = this.getView().byId("table2");
			table.setModel(UPROModel);

			var myFill = [];

			var filter = new sap.ui.model.Filter("rest_id", sap.ui.model.FilterOperator.Contains, "1");
			var filter2 = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.NE, "0");
			myFill.push(filter, filter2);

			table.bindAggregation("items", "/ZSOL_UPRO_R_SRV", new sap.m.ColumnListItem({
				cells: [new sap.m.Text({
					text: "{user_id}"
				}), new sap.m.Text({
					text: "{user_fname}"
				})]
			}));

			var tableBind = table.getBinding("items");
			tableBind.filter(myFill);
		},
		attachHarveyCharts: function () {

			var self = this;
			var harveyChart = this.getView().byId("chartRes1");
			var harveyChart2 = this.getView().byId("chartRes2");
			var DTDashT = this.getOwnerComponent().getModel("DTDashT");
			var DTUser = this.getOwnerComponent().getModel("DTUser");

			DTUser.read("/ZSOL_USER_CDS", {
				// method:  "GET",
				success: function (res) {
					var count = res.results.length;
					harveyChart.setTotal(count);
					//Get billable Total
					DTDashT.read("/ZSOL_DASHT_SRV('" + 1 + "')/Set", {
						// method: "GET",
						// context: "Set",
						success: function (oData) {
							var frac = oData.results[0].countRest;

							var chartItem = new sap.suite.ui.microchart.HarveyBallMicroChartItem("harveyItem1", {
								fraction: frac,
								color: sap.m.ValueColor.Good
							});
							harveyChart.addItem(chartItem);
						},
						error: function (oError) {
							// alert("Harvey Error");
							sap.m.MessageToast.show("Harvey Error", {
								duration: 3000, // default
								width: "15em", // default
								my: "center bottom", // default
								at: "center bottom", // default
								of: window, // default
								offset: "0 0", // default
								collision: "fit fit", // default
								onClose: null, // default
								autoClose: true, // default
								animationTimingFunction: "ease", // default
								animationDuration: 1000, // default
								closeOnBrowserNavigation: true // default
							});
						}
					});
				}

			});

			DTUser.read("/ZSOL_USER_CDS", {
				// method:  "GET",
				success: function (res) {
					var count = res.results.length;
					harveyChart2.setTotal(count);
					//Get billable Total
					DTDashT.read("/ZSOL_DASHT_SRV('" + 2 + "')/Set", {
						// method: "GET",
						// context: "Set",
						success: function (oData) {
							var frac = oData.results[0].countRest;

							var chartItem2 = new sap.suite.ui.microchart.HarveyBallMicroChartItem("harveyItem2", {
								fraction: frac,
								color: sap.m.ValueColor.Critical
							});

							harveyChart2.addItem(chartItem2);
						},
						error: function (oError) {
							// alert("Harvey Error");
							sap.m.MessageToast.show("Harvey Error", {
								duration: 3000, // default
								width: "15em", // default
								my: "center bottom", // default
								at: "center bottom", // default
								of: window, // default
								offset: "0 0", // default
								collision: "fit fit", // default
								onClose: null, // default
								autoClose: true, // default
								animationTimingFunction: "ease", // default
								animationDuration: 1000, // default
								closeOnBrowserNavigation: true // default
							});
						}
					});
				}

			});
		},
		handleHBox: function () {
			var selectedItem = this.getView().byId("dashBarSelect").getSelectedKey();

			if (selectedItem === "SelectDefaulter") {
				this.getView().byId("defaulterHBox").setVisible(true);
				this.getView().byId("billableHBox").setVisible(false);
				this.getView().byId("nonBillableHBox").setVisible(false);
			} else if (selectedItem === "SelectBillable") {
				this.getView().byId("billableHBox").setVisible(true);
				this.getView().byId("defaulterHBox").setVisible(false);
				this.getView().byId("nonBillableHBox").setVisible(false);
			} else if (selectedItem === "SelectNonBillable") {
				this.getView().byId("nonBillableHBox").setVisible(true);
				this.getView().byId("defaulterHBox").setVisible(false);
				this.getView().byId("billableHBox").setVisible(false);
			} else if (selectedItem === "blank") {
				this.getView().byId("defaulterHBox").setVisible(false);
				this.getView().byId("billableHBox").setVisible(false);
				this.getView().byId("nonBillableHBox").setVisible(false);
			}
		},
		highlightToday: function (currDate) {
			//Highlight Today Chart
			var self = this;
			var dayOfWeek = currDate.getDay();
			this.getView().byId("dayVbox" + 1).removeStyleClass("highlightToday");
			this.getView().byId("dayVbox" + 2).removeStyleClass("highlightToday");
			this.getView().byId("dayVbox" + 3).removeStyleClass("highlightToday");
			this.getView().byId("dayVbox" + 4).removeStyleClass("highlightToday");
			this.getView().byId("dayVbox" + 5).removeStyleClass("highlightToday");

			if (dayOfWeek === 1) { //Monday
				self.getView().byId("dayVbox" + dayOfWeek).addStyleClass("highlightToday");
			}
			if (dayOfWeek === 2) { //Tuesday
				self.getView().byId("dayVbox" + dayOfWeek).addStyleClass("highlightToday");
			}
			if (dayOfWeek === 3) { //Wednesday
				self.getView().byId("dayVbox" + dayOfWeek).addStyleClass("highlightToday");
			}
			if (dayOfWeek === 4) { //Thursday
				self.getView().byId("dayVbox" + dayOfWeek).addStyleClass("highlightToday");
			}
			if (dayOfWeek === 5) { //Friday
				self.getView().byId("dayVbox" + dayOfWeek).addStyleClass("highlightToday");
			}
		},
		attachDataMicroCharts: function (currDate) {
			var self = this;

			// var TotalUsers = this.getOwnerComponent().getModel("DTUser");
			
			var oModelActive = this.getOwnerComponent().getModel("DTActiveUsers");

			
			var TotalActiveUsers = 0;
			var week = this.getWeek(currDate);
			
			var date0 = this.adjustDate(week[0]);
			var date1 = this.adjustDate(week[1]);
			var date2 = this.adjustDate(week[2]);
			var date3 = this.adjustDate(week[3]);
			var date4 = this.adjustDate(week[4]);
			
			oModelActive.read("/ZSOL_ACTIVE_USERS('" + date0 + "')/Set", {
				// method: "GET",
				// filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[0], "chartMon", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});
			
				oModelActive.read("/ZSOL_ACTIVE_USERS('" + date1 + "')/Set", {
				// method: "GET",
				// filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[1], "chartTue", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});
			
				oModelActive.read("/ZSOL_ACTIVE_USERS('" + date2 + "')/Set", {
				// method: "GET",
				// filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[2], "chartWed", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});
			
				oModelActive.read("/ZSOL_ACTIVE_USERS('" + date3 + "')/Set", {
				// method: "GET",
				// filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[3], "chartThu", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});
			
			oModelActive.read("/ZSOL_ACTIVE_USERS('" + date4 + "')/Set", {
				// method: "GET",
				// filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[4], "chartFri", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});

			
			

		/*	var filter = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
			var filter2 = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "9");
			
			TotalUsers.read("/ZSOL_USER_CDS", {
				// method: "GET",
				filters: [filter, filter2],
				success: function (oData) {
					TotalActiveUsers = oData.results.length;

					self.createChart(week[0], "chartMon", TotalActiveUsers);
					self.createChart(week[1], "chartTue", TotalActiveUsers);
					self.createChart(week[2], "chartWed", TotalActiveUsers);
					self.createChart(week[3], "chartThu", TotalActiveUsers);
					self.createChart(week[4], "chartFri", TotalActiveUsers);

				},
				error: function (oError) {
					// alert("total error");
					sap.m.MessageToast.show("Total Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});*/
		},
		attachAllStyles: function () {
			//Style Top Bar
			//Make Stats label bold and center
			this.getView().byId("monLbl");
			this.getView().byId("tueLbl");
			this.getView().byId("wedLbl");
			this.getView().byId("thuLbl");
			this.getView().byId("friLbl");
			//Style Stats Header label
			//Style Micro Charts
			//Style Defaulter HBox
			//Style Billable HBox
			//Style Non Billable HBox

		},
		getWeek: function (dats) {
			//var self = this;
			var currMonth = dats.getMonth();
			var currYear = dats.getFullYear();
			var sDate = 1;
			
			var mon = new Date(currYear, currMonth, sDate, 10, 10, 10);
			var tue = new Date(currYear, currMonth, sDate, 10, 10, 10);
			var wed = new Date(currYear, currMonth, sDate, 10, 10, 10);
			var thu = new Date(currYear, currMonth, sDate, 10, 10, 10);
			var fri = new Date(currYear, currMonth, sDate, 10, 10, 10);

			var currDay = dats.getDay();

			/*var mon, tue, wed, thu, fri;*/
			var week = [];

			if (currDay === 0) {

				mon = new Date(mon.setDate(dats.getDate() + 1));
				tue = new Date(tue.setDate(dats.getDate() + 2));
				wed = new Date(wed.setDate(dats.getDate() + 3));
				thu = new Date(thu.setDate(dats.getDate() + 4));
				fri = new Date(fri.setDate(dats.getDate() + 5));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 1) {

				mon = new Date(mon.setDate(dats.getDate() + 0));
				tue = new Date(tue.setDate(dats.getDate() + 1));
				wed = new Date(wed.setDate(dats.getDate() + 2));
				thu = new Date(thu.setDate(dats.getDate() + 3));
				fri = new Date(fri.setDate(dats.getDate() + 4));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 2) {

				mon = new Date(mon.setDate(dats.getDate() - 1));
				tue = new Date(tue.setDate(dats.getDate() + 0));
				wed = new Date(wed.setDate(dats.getDate() + 1));
				thu = new Date(thu.setDate(dats.getDate() + 2));
				fri = new Date(fri.setDate(dats.getDate() + 3));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 3) {

				mon = new Date(mon.setDate(dats.getDate() - 2));
				tue = new Date(tue.setDate(dats.getDate() - 1));
				wed = new Date(wed.setDate(dats.getDate() + 0));
				thu = new Date(thu.setDate(dats.getDate() + 1));
				fri = new Date(fri.setDate(dats.getDate() + 2));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 4) {

				mon = new Date(mon.setDate(dats.getDate() - 3));
				tue = new Date(tue.setDate(dats.getDate() - 2));
				wed = new Date(wed.setDate(dats.getDate() - 1));
				thu = new Date(thu.setDate(dats.getDate() + 0));
				fri = new Date(fri.setDate(dats.getDate() + 1));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 5) {

				mon = new Date(mon.setDate(dats.getDate() - 4));
				tue = new Date(tue.setDate(dats.getDate() - 3));
				wed = new Date(wed.setDate(dats.getDate() - 2));
				thu = new Date(thu.setDate(dats.getDate() - 1));
				fri = new Date(fri.setDate(dats.getDate() + 0));

				week.push(mon, tue, wed, thu, fri);
				return week;

			} else if (currDay === 6) {

				mon = new Date(mon.setDate(dats.getDate() - 5));
				tue = new Date(tue.setDate(dats.getDate() - 4));
				wed = new Date(wed.setDate(dats.getDate() - 3));
				thu = new Date(thu.setDate(dats.getDate() - 2));
				fri = new Date(fri.setDate(dats.getDate() - 1));

				week.push(mon, tue, wed, thu, fri);
				return week;
			}
			return week;
		},
		createChart: function (Date, Id, Total) {
			var chartModel = this.getOwnerComponent().getModel("DTDashF");
			chartModel.setUseBatch(false);
			var chart = this.getView().byId(Id);
			var dats = Date.toISOString();
			dats = dats.substr(0, 10);
			dats = dats.replace(/-/g, "");

			chart.setFraction(0);
			chart.setTotal(100);
			chart.setValueColor("Neutral");

			chartModel.read("/ZSOL_DASHF_SRV('" + dats + "')/Set", {
				// method: "GET",
				// context: "Set",
				success: function (oData) {

					if (oData.results.length > 0) {
						var count = oData.results.length;
						var perc = count / Total;
						if (perc >= 0.75) {
							chart.setValueColor("Good");
						} else if (perc >= 0.50 && perc < 0.75) {
							chart.setValueColor("Neutral");
						} else if (perc >= 0.25 && perc < 0.50) {
							chart.setValueColor("Critical");
						} else if (perc >= 0 && perc < 0.25) {
							chart.setValueColor("Error");
						}
						chart.setFraction(count);
						chart.setTotal(Total);
					}
				},
				error: function (oError) {
					// alert("chart error");
					sap.m.MessageToast.show("Chart Error", {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			});

		}
	});
});