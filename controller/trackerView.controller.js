sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/layout/Grid",
	"sap/m/MessagePopover"
], function (Controller, HBox, VBox, Grid, MessagePopover) {
	"use strict";
	var empid;
	var msgPop = new MessagePopover("msgPop", {
		placement: sap.m.VerticalPlacementType.Top,
		initiallyExpanded: true
	});
	var isCountValid = 0;
	var Active = [];
	var Deleted = [];
	var entryArray = [];
	var visited = 0;
	//	var globalCount = null;
	return Controller.extend("TrackerEntry.TrackerEntry.controller.trackerView", {

		onInit: function () { //onInitFilter1
			//user found & is admin
			
			// this.getOwnerComponent().getRouter().getRoute("Activity").attachPatternMatched(this._onObjectMatched, this);
			this.sapAuth();
		},
		onTrackerUserSave: function(){
			var userid = this.getView().byId("tred_userid").getValue();
			var fname =	this.getView().byId("tred_fname").getValue();
			var lname = this.getView().byId("tred_lname").getValue();
			var skill = this.getView().byId("tred_userskill").getSelectedKey();
			
			var userModel = this.getOwnerComponent().getModel("DTUser");
			var oModel = this.getOwnerComponent().getModel("HeaderW");
			
			var oProperties = {
				
				user_fname: lname + ", " + fname,
				user_psw: "noPass",
				flag: "1"
			};

			var oProperties1 = {
				
				skill_id: skill
				
			};
			
			userModel.update("/ZSOL_USER_CDS('"+userid+"')", oProperties, {
				method: "PUT",
				success: function (data) {
					userModel.refresh();
					sap.m.MessageToast.show("update success: 200");
				},
				error: function (err) {
					sap.m.MessageToast.show("fail");
				}
			});

			oModel.update("/ZSOL_UPRO_SRV('"+userid+"')", oProperties1, {
				method: "PUT",
				success: function (data) {
					sap.m.MessageToast.show("update success: 201");
					oModel.refresh();
				},
				error: function (err) {
					sap.m.MessageToast.show("fail");
				}
			});
		},
		onClose: function(oEvent){
			this._Dialog.close();
		},
		onfetchEmp: function () {
			// var empid;
			// var comboKey = this.getView().byId("searchComboEmp").getSelectedKey();
			
			// this.getView().byId("tracker_profile").setBusy(true);

			var self = this;

			var userModel = this.getOwnerComponent().getModel("DTUser");
			var oModel = this.getOwnerComponent().getModel("HeaderR");

			userModel.read("/ZSOL_USER_CDS('" + empid + "')", {
				success: function (data) {
					//alert(data);
					self.getView().byId("tred_username").setValue(data.user_uname);
					self.getView().byId("tred_userid").setValue(data.user_id);
					
					var full_name, fname, lname;
					full_name = data.user_fname;
					lname = full_name.substr(0, full_name.indexOf(","));
					fname = full_name.substr((full_name.indexOf(", ") + 2));
					self.getView().byId("tred_fname").setValue(fname);
					self.getView().byId("tred_lname").setValue(lname);
					
				},
				error: function (err) {
					
					sap.m.MessageBox.error("Unable to fetch enteries in USER\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});
					
					this.getView().byId("tracker_profile").setBusy(false);
				}
			});
			oModel.read("/ZSOL_UPRO_R_SRV('" + empid + "')", {
					success: function (res) {
						self.getView().byId("tred_userskill").setSelectedKey(res.skill_id);
						self.getView().byId("tred_userlead").setSelectedKey(res.lead_id);
						
						self.getView().byId("tred_userrest").setSelectedKey(res.rest_id);
						self.getView().byId("tred_userloca").setSelectedKey(res.loca_id);

					},
					error: function (err) {
						sap.m.MessageBox.error("Unable to fetch enteries in UPRO", {
							title: "Alert",
							action: sap.m.MessageBox.Action.Ok,
							onclose: null
						});
						this.getView().byId("tracker_profile").setBusy(false);
					}
				});
		},
		triggerSettings: function() {
			var oView = this.getView();
			this._Dialog = oView.byId("tracker_profile_edit");
			// create dialog lazily
			if (!this._Dialog) {
			// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.trackerUserProfile", this);
				oView.addDependent(this._Dialog);
			}
			this.onfetchEmp();
			this._Dialog.open();
			
		},
		triggerExport: function() {
			var oView = this.getView();
			this._Dialog = oView.byId("tracker_export");
			// create dialog lazily
			if (!this._Dialog) {
			// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.trackerExport", this);
				oView.addDependent(this._Dialog);
			}
			
			this._Dialog.open();
			
		},
		logoff: function(oEvent){
			
			$.ajax({
	           type: "GET",
	           url: "/sap/public/bc/icf/logoff",  //Clear SSO cookies: SAP Provided service to do that
			        }).done(function(data){ //Now clear the authentication header stored in the browser
			                            if (!document.execCommand("ClearAuthenticationCache")) {
			                                 //"ClearAuthenticationCache" will work only for IE. Below code for other browsers
			                                 $.ajax({
			                                               type: "GET",
			                                               url: "/sap/bc/ui5_ui5/sap/ztrackerentry/", //any URL to a Gateway service
			                                               username: 'dummy', //dummy credentials: when request fails, will clear the authentication header
			                                               password: 'dummy',
			                                               statusCode: { 401: function() {
			                                                         //This empty handler function will prevent authentication pop-up in chrome/firefox
			                                                         window.location.reload(true);
			                                                         //window.location.href = window.location.href;
			                                               } },
			                                               
			                                               error: function() {
			                                                    //alert('reached error of wrong username password')
			                                                    window.location.reload(true);
			                                                    // window.location.href = window.location.href;
			                                               }
			                                });
			                                window.location.reload(true);
			                                // window.location.href = window.location.href;
			                                
			                            }
			                            window.location.href = window.location.href;
			        });
	        // window.location.reload();
		},
		sapAuth: function (){
			//Get User details by using srv;
			var that = this;
		    var y = "/sap/bc/ui2/start_up";
		    var xmlHttp = null;
		    xmlHttp = new XMLHttpRequest();
		    
		    xmlHttp.onreadystatechange = function() {
			    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			        var oUserData = JSON.parse(xmlHttp.responseText);
			        //console.log(oUserData);
			        var usr = oUserData.id.toLowerCase();
			        var myFill = [];
					var filter1 = new sap.ui.model.Filter("user_uname", sap.ui.model.FilterOperator.EQ, usr);
					myFill.push(filter1);
					
					var dd = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
					// var bta = btoa(oUserData.id);
			        
			        that.getOwnerComponent().getModel("DTUser").read("/ZSOL_USER_CDS", {
			        	filters: myFill,
			        	success: function(data){
			        		var count, flag;
			        		count = data.results.length;
			        		flag = data.results["0"].flag;
			        		
			        		if( count <= 0 ){
			        			//user not found
		        				that.getOwnerComponent().getRouter().navTo("nouserLogin");
			        		}
			        		if( count > 0, flag == 1 ){
			        			//user found & is active
			        			if(visited === 0) {
				        			
			        			}else{
			        				empid = data.results["0"].user_id;
			        				that.uname = data.results["0"].user_uname;
			        				that.email = data.results["0"].user_email;
			        				that._onObjectMatched(empid);	
			        			}
			        			visited++;
			        			
			        		}
			        		if( count > 0, flag == 0 ){
			        			//user found & is inactive
		        				that.getOwnerComponent().getRouter().navTo("inactiveLogin");
			        		}
			        		if( count > 0, flag == 9 ){
			        			
			        			// that.getView().byId("myapp").setBusy(true);
			        			//user found & is admin
		        				that.getOwnerComponent().getRouter().navTo("adminLogin");
			        		}
			        	},
			        	error: function(){
			        		
			        	}
			        });
			    }
	        };
		        
		    xmlHttp.open( "GET", y, false );
		    xmlHttp.send(null);
		},
		_onObjectMatched: function (emp) {
			empid = emp;
			// var atb = oEvent.getParameter("arguments").Emp;
			// empid = atob(atb).substring(0, 6);
			// empid = atb ;
			
			//Get Date from Date Picker
			var dd = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
			var picker = this.getView().byId("picker1");
			picker.setValue(dd);

			//Create Date Object
			var d2 = picker.getDateValue().getDate();
			var m2 = picker.getDateValue().getMonth();
			var y2 = picker.getDateValue().getFullYear();
			var d3 = d2 + 0.99;
			var h2 = 5.5;

			var d = new Date(Date.UTC(y2, m2, d2, h2, 0, 0));
			var final = new Date(Date.UTC(y2, m2, d3, 0, 0, 0));

			//Get Table Reference and Bindings
			var table0 = this.getView().byId("table0");
			var htab = this.getView().byId("htab");
			
			var toolbar = this.getView().byId("mbar0");

			//Manifest Models
			var DTDataRead = this.getOwnerComponent().getModel("NDataModel");

			//Create Filters

			//alert(d1);
			var myFill = [];
			var filter1 = new sap.ui.model.Filter("dt_uid", sap.ui.model.FilterOperator.EQ, empid);
			var filter2 = new sap.ui.model.Filter("dt_cdat", sap.ui.model.FilterOperator.BT, d, final);
			myFill.push(filter1, filter2);

			//Set Model to Tables
			table0.setModel(DTDataRead);
			htab.setModel(DTDataRead);

			//Bind
			table0.bindAggregation("items", "/ZSOL_NDATA_SRV", new sap.m.ColumnListItem({
				cells: [new sap.m.Text({
					text: "{proj_name}"
				}), new sap.m.Text({
					text: "{acti_name}"
				}), new sap.m.Text({
					text: "{dt_hrs}"
				}), new sap.m.Text({
					text: "{dt_comm}"
				})]
			}));
			//Hidden Table to calculate safeId
			htab.bindAggregation("items", "/ZSOL_NDATA_SRV", new sap.m.ColumnListItem({
				cells: [new sap.m.Text({
					text: "{dt_enid}"
				}), new sap.m.Text({
					text: "{proj_name}"
				}), new sap.m.Text({
					text: "{acti_name}"
				}), new sap.m.Text({
					text: "{dt_hrs}"
				}), new sap.m.Text({
					text: "{dt_comm}"
				})]
			}));

			//Add Filters and sort tables
			var tab0 = table0.getBinding("items");
			tab0.filter(myFill);

			//Create Dynamic Button to add entries
			var addNew0 = new sap.m.Button("addNew0", {
				text: "Entry",
				icon: "sap-icon://add",
				width: "auto",
				press: [this.addActivity, this],
				type: sap.m.ButtonType.Emphasized,
				visible: false
			}).addStyleClass("roundButton2");

			var copyGenBut = new sap.m.Button("copyGen", {
				text: "Copy",
				icon: "sap-icon://copy",
				width: "auto",
				press: [this.triggerCopy, this],
				type: sap.m.ButtonType.Emphasized,
				visible: false
			}).addStyleClass("roundButton2");

			//Add Dynamic Content
			toolbar.insertContentRight(copyGenBut);
			toolbar.insertContentRight(addNew0);

			this.loadHeader(empid);

			//setViewButtonActive
			this.getView().byId("viewButton").addStyleClass("enableButton");
			this.getView().byId("fillButton").addStyleClass("disableButton");

			//CSS
			this.getView().byId("panel0").addStyleClass("sticky");
			
			
		},
		loadHeader: function (empId) {
			var that = this;
			//var picker = this.getView().byId("picker1");
		
			var panel = this.getView().byId("panel0");
			panel.addStyleClass("panelGrad");
			var headGrid = this.getView().byId("grid_head");
			var DTHead = this.getOwnerComponent().getModel("DTHeaderRead");
			headGrid.setModel(DTHead);
			headGrid.bindElement("/ZSOL_UPRO_R_SRV('" + empId + "')");

			var headItem0 = this.getView().byId("item0");
			var headItem2 = this.getView().byId("item2");
			var headItem3 = this.getView().byId("item3");
			var headItem4 = this.getView().byId("item4");

			headItem0.bindProperty("title", "user_fname");
			headItem2.bindProperty("title", "lead_name");
			headItem3.bindProperty("title", "rest_name");
			headItem4.bindProperty("title", "skill_name");
			
			DTHead.read("/ZSOL_UPRO_R_SRV('"+empId+"')", {
				method: "GET",
				success: function (data) {
					that.loca = data.loca_name;
					that.rest_id = data.rest_id;
					that.loca_id = data.loca_id;
					that.skill_id = data.skill_id;
					that.lead_id = data.lead_id;
					
					},
				error: function (oError) {
					
					}
			});

			headItem0.addStyleClass("headItem");
			headItem2.addStyleClass("headItem");
			headItem3.addStyleClass("headItem");
			headItem4.addStyleClass("headItem");

		},
		setViewActive: function () {
			//setViewButtonActive
			this.getView().byId("viewButton").removeStyleClass("disableButton");
			this.getView().byId("viewButton").addStyleClass("enableButton");
			this.getView().byId("fillButton").removeStyleClass("enableButton");
			this.getView().byId("fillButton").addStyleClass("disableButton");
			sap.ui.getCore().byId("copyGen").setVisible(false);
		},
		setFillActive: function () {
			//setFillButtonActive
			this.getView().byId("fillButton").removeStyleClass("disableButton");
			this.getView().byId("fillButton").addStyleClass("enableButton");
			this.getView().byId("viewButton").removeStyleClass("enableButton");
			this.getView().byId("viewButton").addStyleClass("disableButton");

		},
		gridClearForCopy: function () {
			//Destroy all grid content
			var rGrid = this.getView().byId("grid0");
			rGrid.destroyContent();
			Active = [];
			entryArray = [];
			
		},
		jsonStoreForCopy: function (model, fil0, fil1) {
			var self = this;
			var rGrid = this.getView().byId("grid0");

			model.read("/ZSOL_NDATA_SRV", {
				method: "GET",
				filters: [fil0, fil1],
				success: function (oData2, oResponse) {
					var jsonStore = new sap.ui.model.json.JSONModel();
					jsonStore.setData({
						modelData: oData2.results
					});
					var count = oData2.results.length;
					if (count > 0) {
						isCountValid = 1;
						self.genCopyElements(count, rGrid, jsonStore);
					} else if (count === 0) {
						//MessagePopover
						msgPop.insertItem(new sap.m.MessagePopoverItem({
							title: "Previous records don't exist",
							type: sap.ui.core.MessageType.Success
						}), -1);
						if (msgPop.isOpen() === false) {
							msgPop.toggle(self.getView().byId("buttonPop"));
						}
					}

					return jsonStore;
				},
				error: function (oError) {
					//MessagePopover
					msgPop.insertItem(new sap.m.MessagePopoverItem({
						title: "Connection Error",
						type: sap.ui.core.MessageType.Success
					}), -1);
				}
			});
		},
		genCopyElements: function (num, grid, jsonStore) {
			var i;
			var actiModel = this.getOwnerComponent().getModel("DTActivity");
			var projModel = this.getOwnerComponent().getModel("DTProject");

			for (i = 0; i < num; i++) {
				var hbox = new sap.m.HBox("hbox" + i, {
					width: "100%"
				});
				var vboxProj = new sap.m.VBox("vboxProj" + i, {
					items: [
						new sap.m.Label("ProjLbl" + i, {
							text: "Project",
							width: "90%"
						}),
						new sap.m.Select("ProjSel" + i, {
							width: "90%",
							enabled: false
						}).setModel(projModel).bindItems("/ZSOL_PROJ_SRV", new sap.ui.core.Item({
							key: "{proj_id}",
							text: "{proj_name}"
						}), new sap.ui.model.Sorter('proj_name'))
					],
					width: "90%",
					fitContainer: true
				});
				var projBind = sap.ui.getCore().byId("ProjSel" + i).getBinding("items");
				var projFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
				projBind.filter([projFill]);

				var vboxActi = new sap.m.VBox("vboxActi" + i, {
					items: [
						new sap.m.Label("ActiLbl" + i, {
							text: "Activity",
							width: "90%"

						}),
						new sap.m.Select("ActiSel" + i, {
							width: "90%",
							enabled: false
						}).setModel(actiModel).bindItems("/ZSOL_ACTI_SRV", new sap.ui.core.Item({
							key: "{acti_id}",
							text: "{acti_name}"
						}), new sap.ui.model.Sorter('acti_name'))
					],
					width: "90%",
					fitContainer: true
				});

				var actiBind = sap.ui.getCore().byId("ActiSel" + i).getBinding("items");
				var actiFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
				actiBind.filter([actiFill]);

				var vboxHours = new sap.m.VBox("vboxHours" + i, {
					items: [
						new sap.m.Label("HoursLbl" + i, {
							text: "Hours",
							width: "90%"
						}),
						new sap.m.Input("HoursSel" + i, {
							width: "90%",
							editable: false,
							type: sap.m.InputType.Text
						})
					],
					width: "15%",
					fitContainer: true
				});
				var vboxComm = new sap.m.VBox("vboxComm" + i, {
					items: [
						new sap.m.Label("CommLbl" + i, {
							text: "Comments",
							width: "90%"
						}),
						new sap.m.TextArea("CommSel" + i, {
								width: "90%",
								rows: 1,
								growing: true,
								editable: true
								
							})
					],
					width: "90%",
					fitContainer: true
				});
				var vboxDel = new sap.m.VBox("vboxButtDel" + i, {
					items: [
						new sap.m.Button("delBut" + i, {
							text: "",
							width: "auto",
							press: [this.onDeletePress, this],
							type: sap.m.ButtonType.Reject,
							icon: "sap-icon://delete"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});
				var vboxEdit = new sap.m.VBox("vboxButtEdit" + i, {
					items: [
						new sap.m.Button("editBut" + i, {
							text: "Edit",
							width: "auto",
							press: [this.onEditPress, this],
							type: sap.m.ButtonType.Accept,
							icon: "sap-icon://edit"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});
				hbox.addItem(vboxProj);
				hbox.addItem(vboxActi);
				hbox.addItem(vboxHours);
				hbox.addItem(vboxComm);
				hbox.addItem(vboxEdit);
				hbox.addItem(vboxDel);
				grid.addContent(hbox);
				Active.push(i);
				//alert(Active);

				var enidData = jsonStore.getProperty("/modelData/" + i + "/dt_enid");
				var projData = jsonStore.getProperty("/modelData/" + i + "/proj_id");
				var actiData = jsonStore.getProperty("/modelData/" + i + "/acti_id");
				var hrsData = jsonStore.getProperty("/modelData/" + i + "/dt_hrs");
				var commData = jsonStore.getProperty("/modelData/" + i + "/dt_comm");

				sap.ui.getCore().byId("ProjSel" + i).setSelectedKey(projData);
				sap.ui.getCore().byId("ActiSel" + i).setSelectedKey(actiData);
				sap.ui.getCore().byId("HoursSel" + i).setValue(hrsData);
				sap.ui.getCore().byId("CommSel" + i).setValue(commData);

				entryArray.push(enidData);

			}

		},
		triggerCopy: function() {
			var oView = this.getView();
			this._Dialog = oView.byId("copy_helper");
			// create dialog lazily
			if (!this._Dialog) {
			// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.userCopyHelper", this);
				oView.addDependent(this._Dialog);
			}
			
			this._Dialog.open();
			
		},
		onCopyPressHelper: function(){
			var sDate  =  this.getView().byId("pickerCopyHelper").getDateValue();
			this.onCopyPress(sDate);
		},
		onCopyPress: function (sDate) {
			//Clear grid items & adjust array
			this.gridClearForCopy();

			//read Data
			var DTDataRead = this.getOwnerComponent().getModel("NDataModel");

			
			var nDate = sDate;
			nDate = nDate.setDate(sDate.getDate() + 1);
			//Filters
			var filter1 = new sap.ui.model.Filter("dt_uid", sap.ui.model.FilterOperator.EQ, empid);
			var filter2 = new sap.ui.model.Filter("dt_cdat", sap.ui.model.FilterOperator.BT, sDate, nDate);

			//Read to JSON 
			this.jsonStoreForCopy(DTDataRead, filter1, filter2);
			this.onClose();

		},
		onViewPress: function (oEvent) {
			this.setViewActive();

			var table0 = this.getView().byId("table0");
			var tableModel = table0.getModel();
			tableModel.refresh();
			var rGrid = this.getView().byId("grid0");
			rGrid.destroyContent();
			rGrid.setVisible(false);
			table0.setVisible(true);
			var plusButt = sap.ui.getCore().byId("addNew0");
			plusButt.setVisible(false);
			Active = [];

			this.getView().byId("save").setEnabled(false);

		},
		onFillPress: function (oEvent) {
			
			entryArray = [];
			this.setFillActive();

			//Get Table Reference and length
			var table0 = this.getView().byId("table0");
			var plusButt = sap.ui.getCore().byId("addNew0");
			var itemCount = parseInt(table0.getItems().length, 10);
			var DTDataRead = this.getOwnerComponent().getModel("NDataModel");
			var actiModel = this.getOwnerComponent().getModel("DTActivity");
			var projModel = this.getOwnerComponent().getModel("DTProject");
			this.getView().byId("save").setEnabled(true);
			//Create Date Object
			var picker = this.getView().byId("picker1");
			var d2 = picker.getDateValue().getDate();
			var m2 = picker.getDateValue().getMonth();
			var y2 = picker.getDateValue().getFullYear();
			var d3 = d2 + 0.99;
			//var h2 = 5.5;

			var d = new Date(Date.UTC(y2, m2, d2, 0, 0, 0));
			var final = new Date(Date.UTC(y2, m2, d3, 0, 0, 0));

			//Get UI references
			var rGrid = this.getView().byId("grid0");
			var gridCount = rGrid.getContent().length;
			//var iconFilter2 = this.getView().byId("filter2");
			//var objectHeader2 = this.getView().byId("header2");
			table0.setVisible(false);
			rGrid.setVisible(true);

			//var d1 = new Date();

			var filter1 = new sap.ui.model.Filter("dt_uid", sap.ui.model.FilterOperator.EQ, empid);
			var filter2 = new sap.ui.model.Filter("dt_cdat", sap.ui.model.FilterOperator.BT, d, final);

			//Generate dynamic items if entries exist
			if (itemCount === 0 && gridCount === 0) {
				//Make + , Save button active
				sap.ui.getCore().byId("copyGen").setVisible(true);
				plusButt.setVisible(true);
			} else if (itemCount > 0 && gridCount === 0) {
				//For item count generate elements and fill data from model read
				for (var i = 0; i < itemCount; i++) {

					var hbox = new sap.m.HBox("hbox" + i, {
						width: "100%"
					});
					var vboxProj = new sap.m.VBox("vboxProj" + i, {
						items: [
							new sap.m.Label("ProjLbl" + i, {
								text: "Project",
								width: "90%"
							}),
							new sap.m.Select("ProjSel" + i, {
								width: "90%",
								enabled: false
							}).setModel(projModel).bindItems("/ZSOL_PROJ_SRV", new sap.ui.core.Item({
								key: "{proj_id}",
								text: "{proj_name}"
							}), new sap.ui.model.Sorter('proj_name'))
						],
						width: "90%",
						fitContainer: true
					});
					var projBind = sap.ui.getCore().byId("ProjSel" + i).getBinding("items");
					var projFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
					projBind.filter([projFill]);

					var vboxActi = new sap.m.VBox("vboxActi" + i, {
						items: [
							new sap.m.Label("ActiLbl" + i, {
								text: "Activity",
								width: "90%"

							}),
							new sap.m.Select("ActiSel" + i, {
								width: "90%",
								enabled: false
							}).setModel(actiModel).bindItems("/ZSOL_ACTI_SRV", new sap.ui.core.Item({
								key: "{acti_id}",
								text: "{acti_name}"
							}), new sap.ui.model.Sorter('acti_name'))
						],
						width: "90%",
						fitContainer: true
					});

					var actiBind = sap.ui.getCore().byId("ActiSel" + i).getBinding("items");
					var actiFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
					actiBind.filter([actiFill]);
					var vboxHours = new sap.m.VBox("vboxHours" + i, {
						items: [
							new sap.m.Label("HoursLbl" + i, {
								text: "Hours",
								width: "90%"
							}),
							new sap.m.Input("HoursSel" + i, {
								width: "90%",
								editable: false,
								type: sap.m.InputType.Text
							})
						],
						width: "15%",
						fitContainer: true
					});
					var vboxComm = new sap.m.VBox("vboxComm" + i, {
						items: [
							new sap.m.Label("CommLbl" + i, {
								text: "Comments",
								width: "90%"
							}),
							new sap.m.TextArea("CommSel" + i, {
								width: "90%",
								rows: 1,
								growing: true,
								editable: false
								
							})
						],
						width: "90%",
						fitContainer: true
					});
					var vboxDel = new sap.m.VBox("vboxButtDel" + i, {
						items: [
							new sap.m.Button("delBut" + i, {
								text: "",
								width: "auto",
								press: [this.onDeletePress, this],
								type: sap.m.ButtonType.Reject,
								icon: "sap-icon://delete"
							}).addStyleClass("roundButton")
						],
						alignItems: "Center",
						direction: "ColumnReverse",
						width: "20%",
						fitContainer: true
					});
					var vboxEdit = new sap.m.VBox("vboxButtEdit" + i, {
						items: [
							new sap.m.Button("editBut" + i, {
								text: "Edit",
								width: "auto",
								press: [this.onEditPress, this],
								type: sap.m.ButtonType.Accept,
								icon: "sap-icon://edit"
							}).addStyleClass("roundButton")
						],
						alignItems: "Center",
						direction: "ColumnReverse",
						width: "20%",
						fitContainer: true
					});
					hbox.addItem(vboxProj);
					hbox.addItem(vboxActi);
					hbox.addItem(vboxHours);
					hbox.addItem(vboxComm);
					hbox.addItem(vboxEdit);
					hbox.addItem(vboxDel);
					rGrid.addContent(hbox);
					Active.push(i);
					//alert(Active);
				}

				//READ DATA_CRUD to JSON Model
				DTDataRead.read("/ZSOL_NDATA_SRV", {
					method: "GET",
					filters: [filter1, filter2],
					success: function (data) {

						for (var j = 0; j < itemCount; j++) {

							var enid = data.results[j.toString()].dt_enid;
							var act = data.results[j.toString()].acti_id;
							var proj = data.results[j.toString()].proj_id;
							var hrs = data.results[j.toString()].dt_hrs;
							var comm = data.results[j.toString()].dt_comm;

							sap.ui.getCore().byId("ProjSel" + j).setSelectedKey(proj);
							sap.ui.getCore().byId("ActiSel" + j).setSelectedKey(act);
							sap.ui.getCore().byId("HoursSel" + j).setValue(hrs);
							sap.ui.getCore().byId("CommSel" + j).setValue(comm);
							entryArray.push(enid);
						}
						sap.m.MessageToast.show("Click save after modifying values");

					},
					error: function (oError) {
						sap.m.MessageToast.show("Error in Data!");
					}
				});

				plusButt.setVisible(true);
				sap.ui.getCore().byId("copyGen").setVisible(false);
			} else if (itemCount > 0 && itemCount === gridCount) {
				rGrid.setVisible(true);
				plusButt.setVisible(true);
				sap.ui.getCore().byId("copyGen").setVisible(false);
			}

		},
		addActivity: function (oEvent) { //function attached to create entry button
			this.getView().byId("save").setEnabled(true);
			var actiModel = this.getOwnerComponent().getModel("DTActivity");
			var projModel = this.getOwnerComponent().getModel("DTProject");
			var rGrid = this.getView().byId("grid0");
			var idx = 0;

			if (Active.length === 0) {
				idx = 0;
				var hbox = new sap.m.HBox("hbox" + idx, {
					width: "100%"
				});
				var vboxProj = new sap.m.VBox("vboxProj" + idx, {
					items: [
						new sap.m.Label("ProjLbl" + idx, {
							text: "Project",
							width: "90%"
						}),
						new sap.m.Select("ProjSel" + idx, {
							width: "90%"
						}).setModel(projModel).bindItems("DTProject>/ZSOL_PROJ_SRV", new sap.ui.core.Item({
							key: "{DTProject>proj_id}",
							text: "{DTProject>proj_name}"
						}), new sap.ui.model.Sorter('proj_name'))
					],
					width: "90%",
					fitContainer: true
				});
			
				
				var vboxActi = new sap.m.VBox("vboxActi" + idx, {
					items: [
						new sap.m.Label("ActiLbl" + idx, {
							text: "Activity",
							width: "90%"

						}),
						new sap.m.Select("ActiSel" + idx, {
							width: "90%"
						}).setModel(actiModel).bindItems("DTActivity>/ZSOL_ACTI_SRV", new sap.ui.core.Item({
							key: "{DTActivity>acti_id}",
							text: "{DTActivity>acti_name}"
						}), new sap.ui.model.Sorter('acti_name'))
					],
					width: "90%",
					fitContainer: true
				});
				
				
				
				var vboxHours = new sap.m.VBox("vboxHours" + idx, {
					items: [
						new sap.m.Label("HoursLbl" + idx, {
							text: "Hours",
							width: "90%"
						}),
						new sap.m.Input("HoursSel" + idx, {
							width: "90%",
							type: sap.m.InputType.Text
						})
					],
					width: "15%",
					fitContainer: true
				});
				var vboxComm = new sap.m.VBox("vboxComm" + idx, {
					items: [
						new sap.m.Label("CommLbl" + idx, {
							text: "Comments",
							width: "90%"
						}),
						new sap.m.TextArea("CommSel" + idx, {
								width: "90%",
								rows: 1,
								growing: true,
								editable: true
								
							})
					],
					width: "90%",
					fitContainer: true
				});
				var vboxDel = new sap.m.VBox("vboxButtDel" + idx, {
					items: [
						new sap.m.Button("delBut" + idx, {
							text: "",
							width: "auto",
							press: [this.onDeletePress, this],
							type: sap.m.ButtonType.Reject,
							icon: "sap-icon://delete"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});
				var vboxEdit = new sap.m.VBox("vboxButtEdit" + idx, {
					items: [
						new sap.m.Button("editBut" + idx, {
							text: "Edit",
							width: "auto",
							press: [this.onEditPress, this],
							type: sap.m.ButtonType.Accept,
							icon: "sap-icon://edit"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});

				hbox.addItem(vboxProj);
				hbox.addItem(vboxActi);
				hbox.addItem(vboxHours);
				hbox.addItem(vboxComm);
				hbox.addItem(vboxEdit);
				hbox.addItem(vboxDel);
				rGrid.addContent(hbox);
				Active.push(idx);
				//alert(Active);
				idx++;

			} else if (Active.length > 0) {
				idx = Active[Active.length - 1] + 1;

				var hbox = new sap.m.HBox("hbox" + idx, {
					width: "100%"
				});
				var vboxProj = new sap.m.VBox("vboxProj" + idx, {
					items: [
						new sap.m.Label("ProjLbl" + idx, {
							text: "Project",
							width: "90%"
						}),
						new sap.m.Select("ProjSel" + idx, {
							width: "90%"
						}).setModel(projModel).bindItems("DTProject>/ZSOL_PROJ_SRV", new sap.ui.core.Item({
							key: "{DTProject>proj_id}",
							text: "{DTProject>proj_name}"
						}), new sap.ui.model.Sorter('proj_name'))
					],
					width: "90%",
					fitContainer: true
				});
				
			
				var vboxActi = new sap.m.VBox("vboxActi" + idx, {
					items: [
						new sap.m.Label("ActiLbl" + idx, {
							text: "Activity",
							width: "90%"

						}),
						new sap.m.Select("ActiSel" + idx, {
							width: "90%"
						}).setModel(actiModel).bindItems("DTActivity>/ZSOL_ACTI_SRV", new sap.ui.core.Item({
							key: "{DTActivity>acti_id}",
							text: "{DTActivity>acti_name}"
						}), new sap.ui.model.Sorter('acti_name'))
					],
					width: "90%",
					fitContainer: true
				});
			
			
				var vboxHours = new sap.m.VBox("vboxHours" + idx, {
					items: [
						new sap.m.Label("HoursLbl" + idx, {
							text: "Hours",
							width: "90%"
						}),
						new sap.m.Input("HoursSel" + idx, {
							width: "90%",
							type: sap.m.InputType.Text
						})
					],
					width: "15%",
					fitContainer: true
				});
				var vboxComm = new sap.m.VBox("vboxComm" + idx, {
					items: [
						new sap.m.Label("CommLbl" + idx, {
							text: "Comments",
							width: "90%"
						}),
						new sap.m.Input("CommSel" + idx, {
							width: "90%"
						})
					],
					width: "90%",
					fitContainer: true
				});
				var vboxDel = new sap.m.VBox("vboxButtDel" + idx, {
					items: [
						new sap.m.Button("delBut" + idx, {
							width: "auto",
							press: [this.onDeletePress, this],
							type: sap.m.ButtonType.Reject,
							icon: "sap-icon://delete"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});
				var vboxEdit = new sap.m.VBox("vboxButtEdit" + idx, {
					items: [
						new sap.m.Button("editBut" + idx, {
							text: "Edit",
							width: "auto",
							press: [this.onEditPress, this],
							type: sap.m.ButtonType.Accept,
							icon: "sap-icon://edit"
						}).addStyleClass("roundButton")
					],
					alignItems: "Center",
					direction: "ColumnReverse",
					width: "20%",
					fitContainer: true
				});
				hbox.addItem(vboxProj);
				hbox.addItem(vboxActi);
				hbox.addItem(vboxHours);
				hbox.addItem(vboxComm);
				hbox.addItem(vboxEdit);
				hbox.addItem(vboxDel);
				rGrid.addContent(hbox);
				Active.push(idx);
				//alert(Active);
				idx++;
			}
			
			var n;
			for(n = 0; n < Active.length; n++){
				
				var projBind = sap.ui.getCore().byId("ProjSel"+ Active[n]).getBinding("items");
				var projFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
				projBind.filter([projFill]);
				
				var actiBind = sap.ui.getCore().byId("ActiSel"+ Active[n]).getBinding("items");
				var actiFill = new sap.ui.model.Filter("flag", sap.ui.model.FilterOperator.EQ, "1");
				actiBind.filter([actiFill]);
			}
		},
		onDeletePress: function (oEvent) { // function to delete dynamic vbox
			this.getView().byId("save").setEnabled(true);
			var rGrid = oEvent.getSource().getParent().getParent().getParent();
			var hBoxRef = oEvent.getSource().getParent().getParent();
			rGrid.removeContent(hBoxRef);

			var itemId = hBoxRef.getId().slice(4);
			var id = Active.indexOf(parseInt(itemId, 10));

			hBoxRef.destroy();

			Active.splice(id, 1); //remove from activeItems
			//alert(Active);
			Deleted.push(itemId); //Add to Deleted Items
			// console.log(itemId);

		},
		onEditPress: function (oEvent) {
			var id = oEvent.getSource().getParent().getParent().getId().slice(4);
			sap.ui.getCore().byId("ProjSel" + id).setEnabled(true);
			sap.ui.getCore().byId("ActiSel" + id).setEnabled(true);
			sap.ui.getCore().byId("HoursSel" + id).setEditable(true);
			sap.ui.getCore().byId("CommSel" + id).setEditable(true);
			this.getView().byId("save").setEnabled(true);

		},
		GetSortOrder:function(prop) {  
		    return function(a, b) {  
		        if (a[prop] > b[prop]) {  
		            return 1;  
		        } else if (a[prop] < b[prop]) {  
		            return -1;  
		        }  
		        return 0;  
		    };
		}  ,
		onSaveHelper: function(){
			var self = this;
			var oModel = this.getOwnerComponent().getModel("NDataModel");
			// var enid = [];
			var len = 0;
			var sid = 0;
			oModel.read("/ZSOL_NDATA_SRV", {
				method: "GET",
				success: function(data){
					
					len  = data.results.length;
					
					data.results.sort(self.GetSortOrder("dt_enid"));
					// for (var item in data.results) {  
					//   	sid = data.results[item].dt_enid;  
					// }  
					
					sid = data.results[len - 1].dt_enid;  
					sid = parseInt(sid, 10);
					
					if (data.results.length === 0) {
						// enid.push(0);
						self.onSavePress(0);
					}else{
						// enid.push(parseInt(data.results[len - 1].enid, 10));
						self.onSavePress(sid);
					}
					
				},
				error: function(err){
					sap.m.MessageToast.show("Error");
				}
			});
		},
		
		onSavePress: function (sid) {
			sap.ui.core.BusyIndicator.show(0);
			/*this.getView().byId("save").setBusy(true);*/
						
			//Various Flags to handle notifications & validation
			var projFlag = 0;
			var actiFlag = 0;
			var hrsFlag = 0;
			var commFlag = 0;

			var createSuccessFlag = 0;
			var updateSuccessFlag = 0;
			var deleteSuccessFlag = 0;

			var createErrorFlag = 0;
			var updateErrorFlag = 0;
			var deleteErrorFlag = 0;

			//Get CRUD Model
			var DTData= this.getOwnerComponent().getModel("NDataModel");
			var self = this;
			
			var valid = 0;
			//Create Date object
			var d2 = this.getView().byId("picker1").getDateValue().getDate();
			var m2 = this.getView().byId("picker1").getDateValue().getMonth();
			var y2 = this.getView().byId("picker1").getDateValue().getFullYear();
			var h2 = this.getView().byId("picker1").getDateValue().getHours();
			var date = new Date(Date.UTC(y2, m2, d2, h2, 0, 0));

			//Get items in table
			var table0 = this.getView().byId("table0");
			var tableItems = table0.getItems();

			//Get entries
			var rGrid = this.getView().byId("grid0");
			var rGridItems = rGrid.getContent();

			//Show Message Popover
			msgPop.destroyItems();
			if (msgPop.isOpen() === false) {
				msgPop.toggle(this.getView().byId("buttonPop"));
			}
			
			var user_fname = this.getView().byId("item0").getTitle();
			var lead_name = this.getView().byId("item2").getTitle();
			var rest_name = this.getView().byId("item3").getTitle();
			var skill_name = this.getView().byId("item4").getTitle();
			
		
			//if valid entries
			if (tableItems.length === rGridItems.length && tableItems.length > 0 && rGridItems.length > 0 ) {
				//if n items in table === n entries
				//PUT entries

				//Array to store entries
				var DTSet = [];
				var hrs = 0;

				//Get Entries to array
				for (var k = 0; k < rGridItems.length; k++) {
					//Get Values from UI
					var hboxRef = sap.ui.getCore().byId("hbox" + Active[k]);
					var selProj = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getText();
					var selActi = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getText();
					var actiId = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getKey();
					var inHours = sap.ui.getCore().byId("HoursSel" + Active[k]).getValue();
					var projId = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getKey();
					var inHoursString = inHours.toString();
					var inHoursInt = parseFloat(inHours);
					var inComm = sap.ui.getCore().byId("CommSel" + Active[k]).getValue().trim();
					//Hours Calculation
					hrs = hrs + inHoursInt;
					//Create DTEntry
					var DTEntry = {};
					DTEntry.dt_enid = entryArray[k];
					// DTEntry.dt_enid = jQuery.sap.uid();
					DTEntry.dt_uid = empid;
					DTEntry.fname = user_fname;
					DTEntry.uname = this.uname;
					DTEntry.email = this.email;
					
					DTEntry.dt_cdat = date;
					DTEntry.proj_name = selProj;
					DTEntry.acti_name = selActi;
					
					DTEntry.lead_id = this.lead_id;
					DTEntry.acti_id = actiId;
					DTEntry.proj_id = projId;
					DTEntry.skill_id = this.skill_id;
					DTEntry.rest_id = this.rest_id;
					DTEntry.loca_id = this.loca_id;
					DTEntry.lead_name = lead_name;
					DTEntry.skill_name = skill_name;
					DTEntry.loca_name = this.loca;
					DTEntry.rest_name = rest_name;
					
					DTEntry.dt_hrs = inHoursString;
					DTEntry.dt_comm = inComm;

					DTSet.push(DTEntry);

					//Validation
					if (self.isProjValid(selProj) === true && self.isActiValid(selActi) === true && self.isHoursValid(inHours) === true && self.isCommvalid(
							inComm) === true) {
						//set valid flag = 1;
						valid = valid + 0;
						sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");
						sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("validHbox");
					} else if (self.isProjValid(selProj) === false || self.isActiValid(selActi) === false || self.isHoursValid(inHours) === false ||
						self.isCommvalid(inComm) === false) {

						if (self.isProjValid(selProj) === false) {
							sap.ui.getCore().byId("ProjSel" + Active[k]).addStyleClass("invalidIt2");
							projFlag++;
						} else {
							sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isActiValid(selActi) === false) {
							sap.ui.getCore().byId("ActiSel" + Active[k]).addStyleClass("invalidIt2");
							actiFlag++;
						} else {
							sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isHoursValid(inHours) === false) {
							sap.ui.getCore().byId("HoursSel" + Active[k]).addStyleClass("invalidIt");
							hrsFlag++;
						} else {
							sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");

						}

						if (self.isCommvalid(inComm) === false) {
							sap.ui.getCore().byId("CommSel" + Active[k]).addStyleClass("invalidIt");
							commFlag++;
						} else {
							sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						}

						valid = valid + 1;
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("invalidHbox");
					}

				} //PUT

				//Hours validation
				if (hrs === 9 && valid === 0) {
					var l;
					for (l = 0; l < DTSet.length; l++) {
							//add guid here
						DTData.update("/ZSOL_NDATA_SRV('" + DTSet[l].dt_enid + "')", DTSet[l], {
							context: null,
							success: function (data) {
								if (updateSuccessFlag === 0) {
									updateSuccessFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Updated " + rGridItems.length + " records successfully",
										type: sap.ui.core.MessageType.Success
									}), -1);
								} else {
									//do nothing
								}
								self.onViewPress();
							},
							error: function (data) {
								if (updateErrorFlag === 0) {
									updateErrorFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Update Error",
										type: sap.ui.core.MessageType.Error
									}), -1);
								} else {
									//do nothing
								}
							},
							refreshAfterChange: true
						});
						//mtabModel.refresh(true);
						//sap.m.MessageToast.show("Success");
					}
				}
				if (hrs < 9 || hrs > 9 && valid === 0) {
					//MessagePopover
					msgPop.insertItem(new sap.m.MessagePopoverItem({
						title: "Total Hours should exactly be 9",
						type: sap.ui.core.MessageType.Warning
					}), -1);
				}

			} else if (tableItems.length < rGridItems.length && tableItems.length > 0) {
				//if n items in table < n entries
				//PUT and
				//POST with safeID /GUID

				//Array to store entries
				DTSet = [];
				hrs = 0;
				k = 0;
				var safeId = sid + 1;
				//Get EntrySet1 to array
				for (k; k < tableItems.length; k++) {
					//Get Values from UI
					var hboxRef = sap.ui.getCore().byId("hbox" + Active[k]);
					var selProj = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getText();
					var selActi = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getText();
					var actiId = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getKey();
					var projId = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getKey();
					var inHours = sap.ui.getCore().byId("HoursSel" + Active[k]).getValue();
					var inHoursString = inHours.toString();
					var inHoursInt = parseFloat(inHours);
					var inComm = sap.ui.getCore().byId("CommSel" + Active[k]).getValue().trim();
					//Hours Calculation
					hrs = hrs + inHoursInt;
					//Create DTEntry
					DTEntry = {};
					DTEntry.dt_enid = entryArray[k];
					DTEntry.dt_uid = empid;
					DTEntry.dt_cdat = date;
	
					DTEntry.dt_hrs = inHoursString;
					DTEntry.dt_comm = inComm;
			
					DTEntry.fname = user_fname;
					DTEntry.uname = this.uname;
					DTEntry.email = this.email;
			
					DTEntry.proj_name = selProj;
					DTEntry.acti_name = selActi;
					
					DTEntry.lead_id = this.lead_id;
					DTEntry.acti_id = actiId;
					DTEntry.proj_id = projId;
					DTEntry.skill_id = this.skill_id;
					DTEntry.rest_id = this.rest_id;
					DTEntry.loca_id = this.loca_id;
					DTEntry.lead_name = lead_name;
					DTEntry.skill_name = skill_name;
					DTEntry.loca_name = this.loca;
					DTEntry.rest_name = rest_name;
					
					
					DTSet.push(DTEntry);

					//Validation
					if (self.isProjValid(selProj) === true && self.isActiValid(selActi) === true && self.isHoursValid(inHours) === true && self.isCommvalid(
							inComm) === true) {
						//set valid flag = 1;
						valid = valid + 0;
						sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");
						sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("validHbox");
					} else if (self.isProjValid(selProj) === false || self.isActiValid(selActi) === false || self.isHoursValid(inHours) === false ||
						self.isCommvalid(inComm) === false) {

						if (self.isProjValid(selProj) === false) {
							sap.ui.getCore().byId("ProjSel" + Active[k]).addStyleClass("invalidIt2");
							projFlag++;
						} else {
							sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isActiValid(selActi) === false) {
							sap.ui.getCore().byId("ActiSel" + Active[k]).addStyleClass("invalidIt2");
							actiFlag++;
						} else {
							sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isHoursValid(inHours) === false) {
							sap.ui.getCore().byId("HoursSel" + Active[k]).addStyleClass("invalidIt");
							hrsFlag++;
						} else {
							sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");

						}

						if (self.isCommvalid(inComm) === false) {
							sap.ui.getCore().byId("CommSel" + Active[k]).addStyleClass("invalidIt");
							commFlag++;
						} else {
							sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						}

						valid = valid + 1;
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("invalidHbox");
					}
				} //PUT

				for (k; k < rGridItems.length; k++) {
					//Get Values from UI
					var hboxRef = sap.ui.getCore().byId("hbox" + Active[k]);
					var selProj = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getText();
					var selActi = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getText();
					var actiId = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getKey();
					var projId = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getKey();
					var inHours = sap.ui.getCore().byId("HoursSel" + Active[k]).getValue();
					var inHoursString = inHours.toString();
					var inHoursInt = parseFloat(inHours);
					var inComm = sap.ui.getCore().byId("CommSel" + Active[k]).getValue().trim();
					//Hours Calculation
					hrs = hrs + inHoursInt;
					//Create DTEntry
					DTEntry = {};
					// DTEntry.dt_enid = safeId.toString();
					DTEntry.dt_enid = jQuery.sap.uid();
					DTEntry.dt_uid = empid;
					DTEntry.dt_cdat = date;

					DTEntry.dt_hrs = inHoursString;
					DTEntry.dt_comm = inComm;
					
		
					DTEntry.fname = user_fname;
					DTEntry.uname = this.uname;
					DTEntry.email = this.email;

					DTEntry.proj_name = selProj;
					DTEntry.acti_name = selActi;
					
					DTEntry.lead_id = this.lead_id;
					DTEntry.acti_id = actiId;
					DTEntry.proj_id = projId;
					DTEntry.skill_id = this.skill_id;
					DTEntry.rest_id = this.rest_id;
					DTEntry.loca_id = this.loca_id;
					DTEntry.lead_name = lead_name;
					DTEntry.skill_name = skill_name;
					DTEntry.loca_name = this.loca;
					DTEntry.rest_name = rest_name;

					DTSet.push(DTEntry);
					safeId++;

					//Validation
					if (self.isProjValid(selProj) === true && self.isActiValid(selActi) === true && self.isHoursValid(inHours) === true && self.isCommvalid(
							inComm) === true) {
						//set valid flag = 1;
						valid = valid + 0;
						sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");
						sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("validHbox");
					} else if (self.isProjValid(selProj) === false || self.isActiValid(selActi) === false || self.isHoursValid(inHours) === false ||
						self.isCommvalid(inComm) === false) {

						if (self.isProjValid(selProj) === false) {
							sap.ui.getCore().byId("ProjSel" + Active[k]).addStyleClass("invalidIt2");
							projFlag++;
						} else {
							sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isActiValid(selActi) === false) {
							sap.ui.getCore().byId("ActiSel" + Active[k]).addStyleClass("invalidIt2");
							actiFlag++;
						} else {
							sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isHoursValid(inHours) === false) {
							sap.ui.getCore().byId("HoursSel" + Active[k]).addStyleClass("invalidIt");
							hrsFlag++;
						} else {
							sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");

						}

						if (self.isCommvalid(inComm) === false) {
							sap.ui.getCore().byId("CommSel" + Active[k]).addStyleClass("invalidIt");
							commFlag++;
						} else {
							sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						}

						valid = valid + 1;
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("invalidHbox");
					}
				} //PUT + POST
				//Hours validation

				if (hrs === 9 && valid === 0) {
					var l;
					for (l = 0; l < DTSet.length; l++) {

						var l;
						var f;
						for (l = 0; l < tableItems.length; l++) {
							DTData.update("/ZSOL_NDATA_SRV('" + DTSet[l].dt_enid + "')", DTSet[l], {
								context: null,
								success: function (data) {
									if (updateSuccessFlag === 0) {
										updateSuccessFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Updated " + tableItems.length + " records successfully",
											type: sap.ui.core.MessageType.Success
										}), -1);
									} else {
										//do nothing
									}
									f = l;
									self.onViewPress();

								},
								error: function (data) {
									if (updateErrorFlag === 0) {
										updateErrorFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Update Error",
											type: sap.ui.core.MessageType.Error
										}), -1);
									} else {
										//do nothing
									}

								},
								refreshAfterChange: true
							});
							//mtabModel.refresh(true);
							//sap.m.MessageToast.show("Success");
						}

						for (l; l < rGridItems.length; l++) {
							DTData.create("/ZSOL_NDATA_SRV", DTSet[l], {
								context: null,
								success: function (data) {
									if (createSuccessFlag === 0) {
										createSuccessFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Created " + (rGridItems.length - tableItems.length) + " records successfully",
											type: sap.ui.core.MessageType.Success
										}), -1);

									} else {
										//do nothing
									}
									self.onViewPress();

								},
								error: function (data) {
									if (createErrorFlag === 0) {
										createErrorFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Create Error 222",
											type: sap.ui.core.MessageType.Error
										}), -1);

									} else {
										//do nothing
									}

								},
								refreshAfterChange: true
							});
							//mtabModel.refresh(true);
							//sap.m.MessageToast.show("Success");
						}
					}
				}
				if (hrs < 9 || hrs > 9 && valid === 0) {
					//MessagePopover
					msgPop.insertItem(new sap.m.MessagePopoverItem({
						title: "Total Hours should exactly be 9",
						type: sap.ui.core.MessageType.Warning
					}), -1);
				}

			} else if (tableItems.length > rGridItems.length && rGridItems.length > 0) {
				//if n items in table > n entries
				//PUT and delete other items from table
				//Array to store entries
				DTSet = [];
				var hrs = 0;
				var k = 0;
				//Get Entries to array
				for (var k; k < rGridItems.length; k++) {
					//Get Values from UI
					var hboxRef = sap.ui.getCore().byId("hbox" + Active[k]);
					var selProj = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getText();
					var selActi = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getText();
					var actiId = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getKey();
					var projId = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getKey();
					var inHours = sap.ui.getCore().byId("HoursSel" + Active[k]).getValue();
					var inHoursString = inHours.toString();
					var inHoursInt = parseFloat(inHours);
					var inComm = sap.ui.getCore().byId("CommSel" + Active[k]).getValue().trim();
					//Hours Calculation
					hrs = hrs + inHoursInt;
					//Create DTEntry
					var DTEntry = {};
					DTEntry.dt_enid = entryArray[k];
					DTEntry.dt_uid = empid;
					DTEntry.dt_cdat = date;

					DTEntry.dt_hrs = inHoursString;
					DTEntry.dt_comm = inComm;

					DTEntry.fname = user_fname;
					DTEntry.uname = this.uname;
					DTEntry.email = this.email;
	
					DTEntry.proj_name = selProj;
					DTEntry.acti_name = selActi;
					
					DTEntry.lead_id = this.lead_id;
					DTEntry.acti_id = actiId;
					DTEntry.proj_id = projId;
					DTEntry.skill_id = this.skill_id;
					DTEntry.rest_id = this.rest_id;
					DTEntry.loca_id = this.loca_id;
					DTEntry.lead_name = lead_name;
					DTEntry.skill_name = skill_name;
					DTEntry.loca_name = this.loca;
					DTEntry.rest_name = rest_name;
					

					DTSet.push(DTEntry);

					//Validation
					if (self.isProjValid(selProj) === true && self.isActiValid(selActi) === true && self.isHoursValid(inHours) === true && self.isCommvalid(
							inComm) === true) {
						//set valid flag = 1;
						valid = valid + 0;
						sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");
						sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("validHbox");
					} else if (self.isProjValid(selProj) === false || self.isActiValid(selActi) === false || self.isHoursValid(inHours) === false ||
						self.isCommvalid(inComm) === false) {

						if (self.isProjValid(selProj) === false) {
							sap.ui.getCore().byId("ProjSel" + Active[k]).addStyleClass("invalidIt2");
							projFlag++;
						} else {
							sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isActiValid(selActi) === false) {
							sap.ui.getCore().byId("ActiSel" + Active[k]).addStyleClass("invalidIt2");
							actiFlag++;
						} else {
							sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isHoursValid(inHours) === false) {
							sap.ui.getCore().byId("HoursSel" + Active[k]).addStyleClass("invalidIt");
							hrsFlag++;
						} else {
							sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");

						}

						if (self.isCommvalid(inComm) === false) {
							sap.ui.getCore().byId("CommSel" + Active[k]).addStyleClass("invalidIt");
							commFlag++;
						} else {
							sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						}

						valid = valid + 1;
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("invalidHbox");
					}
				} //PUT
				//Hours validation
				if (hrs === 9 && valid === 0) {
					var l;
					for (l = 0; l < rGridItems.length; l++) {
						DTData.update("/ZSOL_NDATA_SRV('" + DTSet[l].dt_enid + "')", DTSet[l], {
							context: null,
							success: function (data) {
								if (updateSuccessFlag === 0) {
									updateSuccessFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Updated " + rGridItems.length + " records successfully",
										type: sap.ui.core.MessageType.Success
									}), -1);

								} else {
									//do nothing
								}

								self.onViewPress();

							},
							error: function (data) {
								if (updateErrorFlag === 0) {
									updateErrorFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Update Error 333",
										type: sap.ui.core.MessageType.Error
									}), -1);

								} else {
									//do nothing
								}

							},
							refreshAfterChange: true
						});
						//mtabModel.refresh(true);
						//sap.m.MessageToast.show("Success");
					}
					//Delete other entries
					for (var k; k < tableItems.length; k++) {
						//Delete Active[k] entry
						DTData.remove("/ZSOL_NDATA_SRV('" + entryArray[k] + "')", {
							method: "DELETE",
							success: function (data) {
								if (deleteSuccessFlag === 0) {
									deleteSuccessFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Deleted " + (tableItems.length - rGridItems.length) + " records successfully",
										type: sap.ui.core.MessageType.Success
									}), -1);

								} else {
									//do nothing
								}

								self.onViewPress();

							},
							error: function (e) {
								if (deleteErrorFlag === 0) {
									deleteErrorFlag++;
									//MessagePopover
									msgPop.insertItem(new sap.m.MessagePopoverItem({
										title: "Delete Error",
										type: sap.ui.core.MessageType.Error
									}), -1);

								} else {
									//do nothing
								}

							}
						});
					} //DELETE
				}
				if (hrs < 9 || hrs > 9 && valid === 0) {
					//MessagePopover
					msgPop.insertItem(new sap.m.MessagePopoverItem({
						title: "Total Hours should exactly be 9",
						type: sap.ui.core.MessageType.Warning
					}), -1);
				}

			} else if (tableItems.length > 0 && rGridItems.length === 0) {

				for (k = 0; k < entryArray.length; k++) {
					//Delete entryArray[k] entry
					DTData.remove("/ZSOL_NDATA_SRV('" + entryArray[k] + "')", {
						method: "DELETE",
						success: function (data) {
							if (deleteSuccessFlag === 0) {
								deleteSuccessFlag++;
								//MessagePopover
								msgPop.insertItem(new sap.m.MessagePopoverItem({
									title: "Deleted " + tableItems.length + " records successfully",
									type: sap.ui.core.MessageType.Success
								}), -1);

							} else {
								//do nothing
							}

							self.onViewPress();

						},
						error: function (e) {
							if (deleteErrorFlag === 0) {
								deleteErrorFlag++;
								//MessagePopover
								msgPop.insertItem(new sap.m.MessagePopoverItem({
									title: "Delete Error",
									type: sap.ui.core.MessageType.Success
								}), -1);

							} else {
								//do nothing
							}

						}
					});
				} //DELETE

			} else if (tableItems.length === 0 && rGridItems.length > 0) {
				//CREATE
				//Array to store entries
				var DTSet = [];
				var hrs = 0;
				var k = 0;
				var safeId = sid + 1;
				//Get EntrySet1 to array
				for (k; k < rGridItems.length; k++) {
					//Get Values from UI
					
					var hboxRef = sap.ui.getCore().byId("hbox" + Active[k]);
					var selProj = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getText();
					var selActi = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getText();
					var actiId = sap.ui.getCore().byId("ActiSel" + Active[k]).getSelectedItem().getKey();
					var projId = sap.ui.getCore().byId("ProjSel" + Active[k]).getSelectedItem().getKey();	
					var inHours = sap.ui.getCore().byId("HoursSel" + Active[k]).getValue();
					var inHoursString = inHours.toString();
					var inHoursInt = parseFloat(inHours);
					var inComm = sap.ui.getCore().byId("CommSel" + Active[k]).getValue().trim();
					//Hours Calculation
					hrs = hrs + inHoursInt;
					//Create DTEntry
					var DTEntry = {};
					// DTEntry.dt_enid = entryArray[k];
					// DTEntry.dt_enid = safeId.toString();
					DTEntry.dt_enid = jQuery.sap.uid();
					DTEntry.dt_uid = empid;
					DTEntry.dt_cdat = date;

					DTEntry.dt_hrs = inHoursString;
					DTEntry.dt_comm = inComm;
					

					DTEntry.fname = user_fname;
					DTEntry.uname = this.uname;
					DTEntry.email = this.email;

					DTEntry.proj_name = selProj;
					DTEntry.acti_name = selActi;
					
					DTEntry.lead_id = this.lead_id;
					DTEntry.acti_id = actiId;
					DTEntry.proj_id = projId;
					DTEntry.skill_id = this.skill_id;
					DTEntry.rest_id = this.rest_id;
					DTEntry.loca_id = this.loca_id;

					DTEntry.lead_name = lead_name;
					DTEntry.skill_name = skill_name;
					DTEntry.loca_name = this.loca;
					DTEntry.rest_name = rest_name;

					DTSet.push(DTEntry);
					safeId++;
					//Validation
					if (self.isProjValid(selProj) === true && self.isActiValid(selActi) === true && self.isHoursValid(inHours) === true && self.isCommvalid(inComm) === true) {
						//set valid flag = 1;
						valid = valid + 0;
						sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");
						sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");
						sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("validHbox");
					} 
					else if (self.isProjValid(selProj) === false || self.isActiValid(selActi) === false || self.isHoursValid(inHours) === false ||
						self.isCommvalid(inComm) === false) {

						if (self.isProjValid(selProj) === false) {
							sap.ui.getCore().byId("ProjSel" + Active[k]).addStyleClass("invalidIt2");
							projFlag++;
						} else {
							sap.ui.getCore().byId("ProjSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isActiValid(selActi) === false) {
							sap.ui.getCore().byId("ActiSel" + Active[k]).addStyleClass("invalidIt2");
							actiFlag++;
						} else {
							sap.ui.getCore().byId("ActiSel" + Active[k]).removeStyleClass("invalidIt2");

						}

						if (self.isHoursValid(inHours) === false) {
							sap.ui.getCore().byId("HoursSel" + Active[k]).addStyleClass("invalidIt");
							hrsFlag++;
						} else {
							sap.ui.getCore().byId("HoursSel" + Active[k]).removeStyleClass("invalidIt");

						}

						if (self.isCommvalid(inComm) === false) {
							sap.ui.getCore().byId("CommSel" + Active[k]).addStyleClass("invalidIt");
							commFlag++;
						} else {
							sap.ui.getCore().byId("CommSel" + Active[k]).removeStyleClass("invalidIt");

						}

						valid = valid + 1;
						hboxRef.removeStyleClass("validHbox");
						hboxRef.removeStyleClass("invalidHbox");
						hboxRef.addStyleClass("invalidHbox");
					}
				}
				//Hours validation
				if (hrs === 9 && valid === 0 ) {
					var l;
					
					for (l = 0; l < rGridItems.length; l++) {
						
						DTData.create("/ZSOL_NDATA_SRV", DTSet[l], {
								context: null,
								success: function (data) {
									if (createSuccessFlag === 0) {
										createSuccessFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Created " + (rGridItems.length - tableItems.length) + " records successfully",
											type: sap.ui.core.MessageType.Success
										}), -1);

									} else {
										//do nothing
									}
									self.onViewPress();

								},
								error: function (data) {
									if (createErrorFlag === 0) {
										createErrorFlag++;
										//MessagePopover
										msgPop.insertItem(new sap.m.MessagePopoverItem({
											title: "Create Error 999",
											type: sap.ui.core.MessageType.Error
										}), -1);

									} else {
										//do nothing
									}

								},
								refreshAfterChange: true
							});
						
					}
				}
				if (hrs < 9 || hrs > 9 && valid === 0) {
					//MessagePopover
					msgPop.insertItem(new sap.m.MessagePopoverItem({
						title: "Total Hours should exactly be 9",
						type: sap.ui.core.MessageType.Warning
					}), -1);
				}

			}

			this.addPopMsg(actiFlag, projFlag, hrsFlag, commFlag);
			
			
			if (msgPop.isOpen() === false) {
				msgPop.toggle(this.getView().byId("buttonPop"));
			}
			sap.ui.core.BusyIndicator.hide();
		/*	this.getView().byId("save").setBusy(false);*/
			
		},
		addPopMsg: function (acti, proj, hrs, comm) {

			if (acti > 0) {
				msgPop.insertItem(new sap.m.MessageItem({
					count: acti,
					title: "Activity Invalid",
					subtitle: "Activity should not be blank",
					type: sap.ui.core.MessageType.Error,
					description: "Edit the highlighted fields to a valid value"
				}));
			}
			if (proj > 0) {
				msgPop.insertItem(new sap.m.MessageItem({
					count: parseInt(proj, 10),
					title: "Project Invalid",
					subtitle: "Project should not be blank",
					type: sap.ui.core.MessageType.Error,
					description: "Edit the highlighted fields to a valid value"
				}));
			}
			if (hrs > 0) {
				msgPop.insertItem(new sap.m.MessageItem({
					count: parseInt(hrs, 10),
					title: "Hours Invalid",
					subtitle: "Hours should be in the range on 1-9",
					type: sap.ui.core.MessageType.Error,
					description: "Edit the highlighted fields to a valid value"
				}));
			}
			if (comm > 0) {
				msgPop.insertItem(new sap.m.MessageItem({
					count: parseInt(comm, 10),
					title: "Comments Invalid",
					subtitle: "Comments should not be blank",
					type: sap.ui.core.MessageType.Error,
					description: "Edit the highlighted fields to a valid value"
				}));
			}
		},
		getSafeId: function (oEvent) {
			var idx = 0;

			var htab = this.getView().byId("htab");
			htab.setGrowingThreshold(20000);
			var htabModel = htab.getModel();
			htabModel.setSizeLimit(50000);
			htabModel.refresh();

			var htabItems = htab.getItems();
			var enid = [];
			//var res = [];
			if (htab.getItems().length === 0) {
				enid.push(0);
			} else {
				for (idx; idx < htabItems.length; idx++) {
					enid.push(parseInt(htabModel.getProperty("dt_enid", htabItems[idx].getBindingContext()), 10));
				}
				enid.sort(function (a, b) {
					return b - a;
				});
			}
			return enid[0];
		},
		onDateChange: function () {

			var picker = this.getView().byId("picker1");
			var rGrid = this.getView().byId("grid0");
			var plusButt = sap.ui.getCore().byId("addNew0");
			plusButt.setVisible(false);
			this.getView().byId("save").setEnabled(false);
			rGrid.destroyContent();
			rGrid.setVisible(false);

			Active = [];
			Deleted = [];
			entryArray = [];
			//this.onFillPress();

			var Model = this.getOwnerComponent().getModel("NDataModel");

			//Create Date Object
			var d2 = picker.getDateValue().getDate();
			var m2 = picker.getDateValue().getMonth();
			var y2 = picker.getDateValue().getFullYear();
			var d3 = d2 + 0.99;
			var h2 = 5.5;

			var d = new Date(Date.UTC(y2, m2, d2, 0, 0, 0));
			var final = new Date(Date.UTC(y2, m2, d3, 0, 0, 0));

			var aFilter = [];

			aFilter.push(
				new sap.ui.model.Filter("dt_uid", sap.ui.model.FilterOperator.EQ, empid),
				new sap.ui.model.Filter("dt_cdat", sap.ui.model.FilterOperator.BT, d, final)
			);

			var oTable = this.getView().byId("table0");
			oTable.setVisible(true);
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);
			//oBinding.sort(aSorter);
			Model.refresh();
			this.setViewActive();
		},
		isHoursValid: function (hrs) {
			if (hrs == "0" || hrs == "") {
				return false;
			} else if (hrs > 9 || hrs < 0) {
				return false;
			} else if (hrs > 0 && hrs <= 9) {
				return true;
			} else {
				return false;
			}
		},
		isCommvalid: function (comm) {
			if (comm === "") {

				return false;
			} else {
				return true;
			}
		},
		isProjValid: function (proj) {
			if (proj === "" || proj === " " || proj === null) {

				return false;
			} else {
				return true;
			}
		},
		isActiValid: function (acti) {
			if (acti === "" || acti === " " || acti === null) {

				return false;
			} else {
				return true;
			}
		},
		showMessagePopover: function (oEvent) {
			msgPop.toggle(oEvent.getSource());
		},
		onUserExportPress: function(){
			var self = this;
			var fromDate = this.getView().byId("pickerFrom").getDateValue();
			var toDate = this.getView().byId("pickerTo").getDateValue();
			var filter = new sap.ui.model.Filter("dt_cdat", sap.ui.model.FilterOperator.BT, fromDate, toDate);
			var filter0 = new sap.ui.model.Filter("dt_uid", sap.ui.model.FilterOperator.EQ, empid);
			var oModel = this.getOwnerComponent().getModel("SmartTab");
			
		
			oModel.read("/ZSOL_NSMART", {
				method: "GET",
				urlParameters:{"$select" : "user_fname,dt_uid,proj_name,acti_name,dt_comm,dt_cdat,loca_name"},
				filters: [filter0, filter],
				success: function(data){
					self.JSONToCSVConvertor(data.results, "Tracker Data Export", true);
				},
				error: function(err){
					sap.m.MessageToast.show("Unable to fetch data");
				}
			});
			
			
		},
		JSONToCSVConvertor: function(JSONData, ReportTitle, ShowLabel) {
		    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
		    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
		    
		    var CSV = '';    
		    //Set Report title in first row or line
		    
		    CSV += ReportTitle + '\r\n\n';
		
		    //This condition will generate the Label/Header
		    if (ShowLabel) {
		        var row = "";
		        
		        //This loop will extract the label from 1st index of on array
		        for (var index in arrData[0]) {
		            
		            //Now convert each value to string and comma-seprated
		            row += index + ',';
		        }
		
		        row = row.slice(0, -1);
		        
		        //append Label row with line break
		        CSV += row + '\r\n';
		    }
		    
		    //1st loop is to extract each row
		    for (var i = 0; i < arrData.length; i++) {
		        var row = "";
		        
		        //2nd loop will extract each column and convert it in string comma-seprated
		        for (var index in arrData[i]) {
		            row += '"' + arrData[i][index] + '",';
		        }
		
		        row.slice(0, row.length - 1);
		        
		        //add a line break after each row
		        CSV += row + '\r\n';
		    }
		
		    if (CSV == '') {        
		        alert("Invalid data");
		        return;
		    }   
		    
		    //Generate a file name
		    var fileName = "MyReport_";
		    //this will remove the blank-spaces from the title and replace it with an underscore
		    fileName += ReportTitle.replace(/ /g,"_");   
		    
		    //Initialize file format you want csv or xls
		    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
		    
		    // Now the little tricky part.
		    // you can use either>> window.open(uri);
		    // but this will not work in some browsers
		    // or you will not get the correct file extension    
		    
		    //this trick will generate a temp <a /> tag
		    var link = document.createElement("a");    
		    link.href = uri;
		    
		    //set the visibility hidden so it will not effect on your web-layout
		    link.style = "visibility:hidden";
		    link.download = fileName + ".csv";
		    
		    //this part will append the anchor tag and remove it after automatic click
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		}
	});
});