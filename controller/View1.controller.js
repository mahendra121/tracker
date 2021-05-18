sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label"
], function (Controller, MessageToast, Dialog, Button, Label) {
	"use strict";

	return Controller.extend("TrackerEntry.TrackerEntry.controller.View1", {

			onInit: function () {
			var oModel = this.getOwnerComponent().getModel("NSmartModel");
			this.getView().setModel(oModel);
			this.sapAuth();
		},
		onAfterRendering: function () {
			// this.getView().byId("myapp").setBusy(false);
		},
		sapAuth: function () {
			//Get User details by using srv;
			var that = this;
			var y = "/sap/bc/ui2/start_up";
			var xmlHttp = null;
			xmlHttp = new XMLHttpRequest();

			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
					var oUserData = JSON.parse(xmlHttp.responseText);
					//console.log(oUserData);
					var fname = oUserData.fullName;
					that.getView().byId("welcomeLabel").setText("Welcome, " + fname);
				}
			};

			xmlHttp.open("GET", y, false);
			xmlHttp.send(null);
		},
		setActiState: function (oEvent) {

			var switchRef = oEvent.getSource();
			var id = oEvent.oSource.oParent.mAggregations.cells[0].mProperties.text;
			var val = oEvent.oSource.oParent.mAggregations.cells[1].mProperties.text;
			var flag = oEvent.oSource.oParent.mAggregations.cells[2].mProperties.text;
			var oModel = this.getOwnerComponent().getModel("DTActivity");

			var jsonPutEnable = {
				acti_name: val,
				flag: "1"
			};
			var jsonPutDisable = {
				acti_name: val,
				flag: "0"
			};

			if (flag === "1") {
				oModel.update("/ZSOL_ACTI_SRV('" + id + "')", jsonPutDisable, {

					method: "PUT",
					success: function (data) {
						sap.m.MessageToast.show(val + ": Activity Disabled");
						switchRef.setState(false);

					},
					error: function (data) {
						sap.m.MessageToast.show("connection error");
						switchRef.setState(true);
					},
					refreshAfterChange: true
				});
			} else if (flag === "0") {
				oModel.update("/ZSOL_ACTI_SRV('" + id + "')", jsonPutEnable, {
					method: "PUT",
					success: function (data) {
						sap.m.MessageToast.show(val + ": Activity Enabled");
						switchRef.setState(true);

					},
					error: function (data) {
						sap.m.MessageToast.show("connection error");
						switchRef.setState(false);
					},
					refreshAfterChange: true

				});
			}
		},
		setProjState: function (oEvent) {

			var switchRef = oEvent.getSource();
			var id = oEvent.oSource.oParent.mAggregations.cells[0].mProperties.text;
			var val = oEvent.oSource.oParent.mAggregations.cells[1].mProperties.text;
			var flag = oEvent.oSource.oParent.mAggregations.cells[2].mProperties.text;
			var oModel = this.getOwnerComponent().getModel("DTProject");

			var jsonPutEnable = {
				proj_name: val,
				flag: "1"
			};
			var jsonPutDisable = {
				proj_name: val,
				flag: "0"
			};

			if (flag === "1") {
				oModel.update("/ZSOL_PROJ_SRV('" + id + "')", jsonPutDisable, {
					method: "PUT",
					success: function (data) {
						sap.m.MessageToast.show(val + ": Project Disabled");
						switchRef.setState(false);

					},
					error: function (data) {
						sap.m.MessageToast.show("connection error");
						switchRef.setState(true);

					},
					refreshAfterChange: true
				});
			} else if (flag === "0") {
				oModel.update("/ZSOL_PROJ_SRV('" + id + "')", jsonPutEnable, {
					method: "PUT",
					success: function (data) {
						sap.m.MessageToast.show(val + ": Project Enabled");
						switchRef.setState(true);

					},
					error: function (data) {
						sap.m.MessageToast.show("connection error");
						switchRef.setState(false);
					},
					refreshAfterChange: true
				});
			}
		},
		quickDeleteConfirm: function (oEvent) {
			var btnref = oEvent.getSource();
			var id = oEvent.oSource.oParent.mAggregations.cells[0].mProperties.text;

			var oView = this.getView();
			this._Dialog = oView.byId("confirm_delete");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.confirmDelete", this);
				oView.addDependent(this._Dialog);
			}
			this.getView().byId("confirm_delete_id").setText(id);
			this._Dialog.open();
		},
		quickDeleteUser: function (oEvent) {
			var self = this;
			// var btnref = oEvent.getSource();
			// var id = oEvent.oSource.oParent.mAggregations.cells[0].mProperties.text;
			var id = this.getView().byId("confirm_delete_id").getText();

			var oModel = this.getOwnerComponent().getModel("DTUser");

			var uproModel = this.getOwnerComponent().getModel("HeaderW");

			oModel.remove("/ZSOL_USER_CDS('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("success DTUser");
					self.getOwnerComponent().getModel("DTHeaderRead").refresh();
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show(e + "\n error DTUser");
					self.getOwnerComponent().getModel("DTHeaderRead").refresh();
				}
			});
			uproModel.remove("/ZSOL_UPRO_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					MessageToast.show("success UPRO");
					self.getOwnerComponent().getModel("DTHeaderRead").refresh();
				},
				error: function (e) {
					MessageToast.show(e + "\n error UPRO");
					self.getOwnerComponent().getModel("DTHeaderRead").refresh();
				}
			});
			this.onClose();

		},
		logoff: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("");
			$.ajax({
				type: "GET",
				url: "/sap/public/bc/icf/logoff", //Clear SSO cookies: SAP Provided service to do that
			}).done(function (data) { //Now clear the authentication header stored in the browser
				if (!document.execCommand("ClearAuthenticationCache")) {
					//"ClearAuthenticationCache" will work only for IE. Below code for other browsers
					$.ajax({
						type: "GET",
						url: "/sap/bc/ui5_ui5/sap/ztrackerentry/", //any URL to a Gateway service
						username: 'dummy', //dummy credentials: when request fails, will clear the authentication header
						password: 'dummy',
						statusCode: {
							401: function () {
								//This empty handler function will prevent authentication pop-up in chrome/firefox
								window.location.reload(true);
								//window.location.href = window.location.href;
							}
						},

						error: function () {
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
		handleIconTabBarSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key"),
				footerModel = new sap.ui.model.json.JSONModel(),
				footerToolbar = this.getView().byId("footerToolbar"),
				newBtn = this.getView().byId("newBtn"),
				editBtn = this.getView().byId("editBtn"),
				cancelBtn = this.getView().byId("cancelBtn"),
				deleteBtn = this.getView().byId("deleteBtn"),
				pageref = this.getView().byId("admin_page");

			this.getView().byId("footerToolbar").setModel(footerModel);

			if (sKey === "admin_entry") {
				footerToolbar.setVisible(false);
				pageref.setShowFooter(false);

			} else if (sKey === "dashboard") {
				footerToolbar.setVisible(false);
				pageref.setShowFooter(false);

			} else if (sKey === "reports") {
				footerToolbar.setVisible(false);
				pageref.setShowFooter(false);

			} else if (sKey === "project_master") {
				pageref.setShowFooter(true);
				footerToolbar.setVisible(true);

				footerModel.setData({
					State: "proj"
				}, false);

			} else if (sKey === "activity_master") {
				pageref.setShowFooter(true);
				footerToolbar.setVisible(true);

				footerModel.setData({
					State: "acti"
				}, false);

			} else if (sKey === "lead_master") {
				pageref.setShowFooter(true);
				footerToolbar.setVisible(true);

				footerModel.setData({
					State: "lead"
				}, false);

			} else if (sKey === "skills_master") {
				pageref.setShowFooter(true);
				footerToolbar.setVisible(true);

				footerModel.setData({
					State: "skill"
				}, false);
			} else if (sKey === "users") {
				pageref.setShowFooter(true);
				footerToolbar.setVisible(true);

				footerModel.setData({
					State: "user"
				}, false);

			}
		},

		//Close Functions for Create
		onClose: function (oEvent) {
			this._Dialog.close();
		},
		onCloseProjS: function (oEvent) {
			this.onClearProjCreate();
			this._Dialog.close();
		},
		onCloseActiS: function (oEvent) {
			this.onClearActiCreate();
			this._Dialog.close();
		},
		onCloseLeadS: function (oEvent) {
			this.onClearLeadCreate();
			this._Dialog.close();
		},
		onCloseSkillS: function (oEvent) {
			this.onClearSkillCreate();
			this._Dialog.close();
		},
		onCloseUserS: function (oEvent) {
			this.onClearUserCreate();
			this._Dialog.close();
		},
		
		// Close Functions for Edit
		onCloseUserEdit: function (oEvent) {
			this.onClearUserEdit();
			this._Dialog.close();
		},
		onCloseProjEdit: function (oEvent) {
			this.onClearProjEdit();
			this._Dialog.close();
		},
		onCloseActiEdit: function (oEvent) {
			this.onClearActiEdit();
			this._Dialog.close();
		},
		onCloseLeadEdit: function (oEvent) {
			this.onClearLeadEdit();
			this._Dialog.close();
		},
		onCloseSkillEdit: function (oEvent) {
			this.onClearSkillEdit();
			this._Dialog.close();
		},

		//NEW DIALOG FUNC
		newPressProject: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("proj_dialog");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.createProjectDialog", this);
				oView.addDependent(this._Dialog);
			}

			this._Dialog.open();

		},
		newPressActivity: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("acti_dialog");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.createActivityDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();

		},
		newPressLead: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("lead_dialog");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.createLeadDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		newPressSkill: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("skill_dialog");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.createSkillDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		newPressUser: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("user_dialog");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.createUserDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},

		//EDIT  DIALOG FUNC
		editPressProject: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("proj_dialog_edit");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.editProjectDialog", this);
				oView.addDependent(this._Dialog);
			}

			this._Dialog.open();
		},
		editPressActivity: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("acti_dialog_edit");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.editActivityDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		editPressLead: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("lead_dialog_edit");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.editLeadDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		editPressSkill: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("skill_dialog_edit");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.editSkillDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		editPressUser: function () {
			var oView = this.getView();
			this._Dialog = oView.byId("user_dialog_edit");
			// create dialog lazily
			if (!this._Dialog) {
				// create dialog via fragment factory
				this._Dialog = sap.ui.xmlfragment(oView.getId(), "TrackerEntry.TrackerEntry.fragments.editUserDialog", this);
				oView.addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		
		//MODIFY
		onEditProjSave: function () {
			var projid = this.getView().byId("iped_projid").getValue();
			var projname = this.getView().byId("iped_projname").getValue();
			var oModel = this.getOwnerComponent().getModel("DTProject");

			var oProperties = {
				proj_name: projname
			};

			oModel.update("/ZSOL_PROJ_SRV('" + projid + "')", oProperties, {
				method: "PUT",
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Project saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: null
					});

				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});
		},
		onEditActiSave: function () {
			var actiid = this.getView().byId("iped_actiid").getValue();
			var actiname = this.getView().byId("iped_actiname").getValue();
			var oModel = this.getOwnerComponent().getModel("DTActivity");

			var oProperties = {
				acti_name: actiname
			};

			oModel.update("/ZSOL_ACTI_SRV('" + actiid + "')", oProperties, {
				method: "PUT",
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Activity saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: null
					});

				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});
		},
		onEditLeadSave: function () {
			var id = this.getView().byId("iped_leadid").getValue();
			var name = this.getView().byId("iped_leadname").getValue();
			var oModel = this.getOwnerComponent().getModel("DTLead");

			var oProperties = {
				lead_name: name
			};

			oModel.update("/ZSOL_LEAD_SRV('" + id + "')", oProperties, {
				method: "PUT",
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Lead saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: null
					});

				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});
		},
		onEditSkillSave: function () {
			var id = this.getView().byId("iped_skillid").getValue();
			var name = this.getView().byId("iped_skillname").getValue();
			var oModel = this.getOwnerComponent().getModel("DTSkill");

			var oProperties = {
				skill_name: name
			};

			oModel.update("/ZSOL_SKILL_SRV('" + id + "')", oProperties, {
				method: "PUT",
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Skill saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: null
					});

				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});
		},
		onEditUserSave: function () {
			var self = this;
			var empid = this.getView().byId("iped_userid").getValue();
			var userid = this.getView().byId("iped_uname").getValue();
			var empname = this.getView().byId("iped_lname").getValue() + ", " + this.getView().byId("iped_fname").getValue();
			var pass = "noPass";
			var email_value = this.getView().byId("iped_email").getValue().trim();
			var lead = this.getView().byId("iped_userlead").getSelectedItem().getKey();
			var skill = this.getView().byId("iped_userskill").getSelectedItem().getKey();
			var resource = this.getView().byId("iped_userrest").getSelectedItem().getKey();
			var location = this.getView().byId("iped_userloca").getSelectedItem().getKey();
			
			var validTo = this.getView().byId("iped_VALTO").getDateValue();
			var d4 = validTo.getDate();
			var m4 = validTo.getMonth();
			var y4 = validTo.getFullYear();
			var h4 = validTo.getHours();

			var dateEnd = new Date(Date.UTC(y4, m4, d4, h4, 0, 0));
			
			

			var oModel = this.getOwnerComponent().getModel("DTUser");
			var uproModel = this.getOwnerComponent().getModel("HeaderW");

			var oProperties = {

				user_uname: userid,
				user_fname: empname,
				user_psw: pass,
				flag: "1",
				user_email: email_value,
				valto: dateEnd

			};
			var adminState = this.getView().byId("iped_admin").getState();
			var userState = this.getView().byId("iped_state").getState();

			if (userState) {
				oProperties.flag = "1";
			} else if (!userState) {
				oProperties.flag = "0";
			}
			if (adminState) {
				oProperties.flag = "9";
			}

			var oProperties1 = {

				skill_id: skill,
				rest_id: resource,
				lead_id: lead,
				loca_id: location
			};

			oModel.update("/ZSOL_USER_CDS('" + empid + "')", oProperties, {
				method: "PUT",
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("User saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: function () {
							self.getOwnerComponent().getModel("DTHeaderRead").refresh();
						}
					});

				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});

			uproModel.update("/ZSOL_UPRO_SRV('" + empid + "')", oProperties1, {
				method: "PUT",
				success: function (data) {
					MessageToast.show("upro success");
					uproModel.refresh();
				},
				error: function (err) {
					MessageToast.show("fail");
				}
			});

		},

		//DELETE DIALOG  FUNC
		deletePressProject: function () {
			var id = this.getView().byId("iped_projid").getValue();
			var oModel = this.getOwnerComponent().getModel("DTProject");
			oModel.remove("/ZSOL_PROJ_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("Deleted Project");
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show("Error deleting Project\n" + e.responseText);
				}
			});
		},
		deletePressActivity: function () {
			var id = this.getView().byId("iped_actiid").getValue();
			var oModel = this.getOwnerComponent().getModel("DTActivity");
			oModel.remove("/ZSOL_ACTI_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("Deleted Activity");
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show("Error deleting Activity\n" + e.responseText);
				}
			});
		},
		deletePressLead: function () {
			var id = this.getView().byId("iped_leadid").getValue();
			var oModel = this.getOwnerComponent().getModel("DTLead");
			oModel.remove("/ZSOL_LEAD_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("success delete Lead");
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show("error delete lead\n" + e.responseText);
				}
			});
		},
		deletePressSkill: function () {
			var id = this.getView().byId("iped_skillid").getValue();
			var oModel = this.getOwnerComponent().getModel("DTSkill");
			oModel.remove("/ZSOL_SKILL_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("Deleted Skill");
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show("Error deleting Skill\n" + e.responseText);
				}
			});
		},
		deletePressUser: function () {
			var id = this.getView().byId("iped_userid").getValue();
			var oModel = this.getOwnerComponent().getModel("DTUser");
			var uproModel = this.getOwnerComponent().getModel("HeaderW");

			oModel.remove("/ZSOL_USER_CDS('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					//alert("success DTUser");
					MessageToast.show("Success DTUser");
				},
				error: function (e) {
					//alert("error DTUser");
					MessageToast.show("Error DTUser\n" + e.responseText);
				}
			});
			uproModel.remove("/ZSOL_UPRO_SRV('" + id + "')", {
				method: "DELETE",
				success: function (data) {
					MessageToast.show("Success UPRO");
				},
				error: function (e) {
					MessageToast.show("Error UPRO\n" + e.responseText);
				}
			});
		},

		//Save Functions
		applyNextA: function (l, oValidateEntry) {
			// creating a new entry
			var temp = l;
			var tempcom = l;
			for (var k = 0; k < temp; k++) {
				var value = oValidateEntry.getProperty("/" + k + "/acti_id");
				var value2 = parseInt(value, 10);
				if (value2 > tempcom) {
					l = l + (value2 - l);
					tempcom = l;

				}
			}
			var AId = l + 1;
			var ActivityId = AId.toString();
			var ActivityName = this.getView().byId("ipcr_actiName").getValue();
			var oModel = this.getOwnerComponent().getModel("DTActivity");

			var oProperties = {
				acti_id: ActivityId,
				acti_name: ActivityName,
				flag: "1"
			};

			oModel.create("/ZSOL_ACTI_SRV", oProperties, {
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Activity Added Successfully", {
						title: "Dear User",
						icon: sap.m.MessageBox.Icon.INFORMATION,
						action: sap.m.MessageBox.Action.OK,
						onclose: null
					});
				},
				error: function (err) {
					MessageToast.show("Activity addition fail\n" + err.responseText);
				}
			});
		},
		onSaveActiCreate: function () {
			var ActivityName = this.getView().byId("ipcr_actiName").getValue();
			var self = this;
			var regex2 = /^[a-z A-Z 0-9.\-\)\(\.\_\/]+$/;
			if (!ActivityName.match(regex2)) {
				sap.m.MessageBox.error("Please enter the Activity Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}

			var oModelr = this.getOwnerComponent().getModel("DTActivity");
			oModelr.read("/ZSOL_ACTI_SRV", {
				// sorting:"en_id",
				success: function (edata) {
					var l = edata.results.length;
					var oValidateEntry = new sap.ui.model.json.JSONModel(edata.results); // to find total no of enteries
					self.applyNextA(l, oValidateEntry);
					oModelr.refresh();

				},
				error: function (e) {
					MessageToast.show("Fail in fetching last entry\n" + e.responseText);
				}
			});

		},

		applyNext: function (l, oValidateEntry) {
			// creating a new entry
			var temp = l;
			var tempcom = l;
			for (var k = 0; k < temp; k++) {
				var value = oValidateEntry.getProperty("/" + k + "/proj_id");
				var value2 = parseInt(value, 10);
				if (value2 > tempcom) {
					l = l + (value2 - l);
					tempcom = l;

				}
			}
			//------------------------ 

			var PId = l + 1;
			var ProjectId = PId.toString();
			var ProjectName = this.getView().byId("ipcr_ProjName").getValue();
			var oModel = this.getOwnerComponent().getModel("DTProject");

			var oProperties = {
				proj_id: ProjectId,
				proj_name: ProjectName,
				flag: "1"
			};

			oModel.create("/ZSOL_PROJ_SRV", oProperties, {
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Project Added Successfully", {
						title: "Dear User",
						icon: sap.m.MessageBox.Icon.INFORMATION,
						action: sap.m.MessageBox.Action.OK,
						onclose: null
					});
				},
				error: function (err) {
					MessageToast.show("fail\n" + err.responseText);
				}
			});
		},
		onSaveProjCreate: function () {
			var ProjectName = this.getView().byId("ipcr_ProjName").getValue();
			var self = this;

			var regex2 = /^[a-z A-Z 0-9.\-\)\(\.\_\/]+$/;

			if (!ProjectName.match(regex2)) {
				sap.m.MessageBox.error("Please enter the Project Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}

			// increminting id value
			var oModelr = this.getOwnerComponent().getModel("DTProject");
			oModelr.read("/ZSOL_PROJ_SRV", {
				// sorting:"en_id",
				success: function (edata) {
					var l = edata.results.length;
					var oValidateEntry = new sap.ui.model.json.JSONModel(edata.results); // to find total no of enteries
					self.applyNext(l, oValidateEntry);
					oModelr.refresh();

				},
				error: function (e) {
					MessageToast.show("Fail in fetching last entry\n" + e.responseText);
				}
			});
		},

		onSaveLeadCreate: function () {
			var LeadId = this.getView().byId("ipcr_leadID").getValue();
			var LeadName = this.getView().byId("ipcr_leadName").getValue();
			var oModel = this.getOwnerComponent().getModel("DTLead");
			var regex = /^[0-9]+$/;
			var regex2 = /^[a-z A-Z]+$/;
			var leadidlength = LeadId.length;

			if (!LeadId.match(regex)) {
				sap.m.MessageBox.error("Please enter Employee id in Lead id (integers only)", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}
			if ((leadidlength < 6) || (leadidlength > 6)) {
				sap.m.MessageBox.error("Lead Id should be of 6 digits", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Success",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (!LeadName) {
				sap.m.MessageBox.error("Please enter the Lead Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}

			var oProperties = {
				lead_id: LeadId,
				lead_name: LeadName
			};

			oModel.create("/ZSOL_LEAD_SRV", oProperties, {
				success: function (data) {
					MessageToast.show("Lead Successfully Added");
					oModel.refresh();
				},
				error: function (err) {
					MessageToast.show("Lead fail\n" + err.responseText);
				}
			});
		},

		applyNextSK: function (l, oValidateEntry) {
			// creating a new entry
			var temp = l;
			var tempcom = l;
			for (var k = 0; k < temp; k++) {
				var value = oValidateEntry.getProperty("/" + k + "/skill_id");
				var value2 = parseInt(value, 10);
				if (value2 > tempcom) {
					l = l + (value2 - l);
					tempcom = l;

				}
			}
			var SId = l + 1;
			var SkillId = SId.toString();
			var SkillName = this.getView().byId("ipcr_skillName").getValue();
			var oModel = this.getOwnerComponent().getModel("DTSkill");

			var oProperties = {
				skill_id: SkillId,
				skill_name: SkillName
			};

			oModel.create("/ZSOL_SKILL_SRV", oProperties, {
				success: function (data) {
					oModel.refresh();
					sap.m.MessageBox.show("Skill Added Successfully", {
						title: "Dear User",
						icon: sap.m.MessageBox.Icon.INFORMATION,
						action: sap.m.MessageBox.Action.OK,
						onclose: null
					});
				},
				error: function (err) {
					MessageToast.show("Skill addition fail\n" + err.responseText);
				}
			});
		},
		onSaveSkillCreate: function () {
			var SkillName = this.getView().byId("ipcr_skillName").getValue();
			var self = this;
			var regex2 = /^[a-z A-Z 0-9.\-\)\(]+$/;
			if (!SkillName.match(regex2)) {
				sap.m.MessageBox.error("Please enter the Skill Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}

			var oModelr = this.getOwnerComponent().getModel("DTSkill");
			oModelr.read("/ZSOL_SKILL_SRV", {
				// sorting:"en_id",
				success: function (edata) {
					var l = edata.results.length;
					var oValidateEntry = new sap.ui.model.json.JSONModel(edata.results); // to find total no of enteries
					self.applyNextSK(l, oValidateEntry);
					oModelr.refresh();

				},
				error: function (e) {
					MessageToast.show("Fail in fetching last entry\n" + e.responseText);
				}
			});

		},
		onSaveUserCreate: function () {
			var empid = this.getView().byId("ipcr_userid").getValue();
			var self = this;
			
			//Date
			var today = this.getView().byId("ipcr_validFrom").getDateValue();
			var endDate = new Date("9999/12/31");
			var d2 = today.getDate();
			var m2 = today.getMonth();
			var y2 = today.getFullYear();
			var h2 = today.getHours();
			
			var d3 = endDate.getDate();
			var m3 = endDate.getMonth();
			var y3 = endDate.getFullYear();
			var h3 = endDate.getHours();
			
			var dateFrom = new Date(Date.UTC(y2, m2, d2, h2, 0, 0));
			var dateEnd = new Date(Date.UTC(y3, m3, d3, h3, 0, 0));
			
			
			// Employee id validation

			var empidlength = empid.length;
			var regex = /^[0-9]+$/;
			if (empidlength === 0) {
				sap.m.MessageBox.error("Please enter Employee id", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Success",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}
			if (!empid.match(regex)) {
				sap.m.MessageBox.error("Employee Id should contain integers only", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Success",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}
			if ((empidlength < 6) || (empidlength > 6)) {
				sap.m.MessageBox.error("Employee Id should be of 6 digits", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Success",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}

			var userid = this.getView().byId("ipcr_username").getValue();
			var empname = this.getView().byId("ipcr_lname").getValue() + ", " + this.getView().byId("ipcr_fname").getValue();
			var pass = "noPass";
			var email_value = this.getView().byId("ipcr_email").getValue().trim();
			var lead = this.getView().byId("ipcr_userlead").getSelectedItem().getKey();
			var skill = this.getView().byId("ipcr_userskill").getSelectedItem().getKey();
			var resource = this.getView().byId("ipcr_userrest").getSelectedItem().getKey();
			var location = this.getView().byId("ipcr_userloca").getSelectedItem().getKey();

			var oModel1 = this.getOwnerComponent().getModel("DTUser");
			var oModel2 = this.getOwnerComponent().getModel("HeaderW");
		
		//enhancement	
			var valFrom = dateFrom;
			var valTo = dateEnd;

			var regex2 = /^[a-z A-Z /,]+$/;
			var regex3 = /^[a-z 0-9]+$/;
			if (!userid.match(regex3)) {
				sap.m.MessageBox.error("Username should be lowercase and can contain number", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (!empname.match(regex2)) {
				sap.m.MessageBox.error("Please enter the Employee Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (pass.length === 0) {
				sap.m.MessageBox.error("Please enter the Password", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (lead === "0") {
				sap.m.MessageBox.error("Select the Lead name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (skill === "0") {
				sap.m.MessageBox.error("Select the Skill Name", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (resource === "0") {
				sap.m.MessageBox.error("Select the Resource type", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else if (location === "0") {
				sap.m.MessageBox.error("Please enter the Location", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			}
			var userState = this.getView().byId("ipcr_userstate").getState();
			var adminState = this.getView().byId("ipcr_adminstate").getState();

			var oProperties = {
				user_id: empid,
				user_uname: userid,
				user_fname: empname,
				user_psw: pass,
				flag: "1",
				valfr: valFrom,
				valto: valTo,
				user_email: email_value
			};

			if (userState) {
				oProperties.flag = "1";
			} else if (!userState) {
				oProperties.flag = "0";
			}
			if (adminState) {
				oProperties.flag = "9";
			}

			var oProperties1 = {
				user_id: empid,
				skill_id: skill,
				rest_id: resource,
				lead_id: lead,
				loca_id: location
			};

			oModel1.create("/ZSOL_USER_CDS", oProperties, {
				method: "POST",
				success: function (data) {
					oModel1.refresh();
					sap.m.MessageBox.show("User saved", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Success",
						action: sap.m.MessageBox.Action.OK,
						onClose: function () {
							self.getOwnerComponent().getModel("DTHeaderRead").refresh();
						}
					});

				},
				error: function (err) {
					MessageToast.show("fail\n" + err.responseText);
				}
			});

			oModel2.create("/ZSOL_UPRO_SRV", oProperties1, {
				method: "POST",
				success: function (data) {
					//MessageBox.show("User saved2",{
					// 	icon:sap.m.MessageBox.Icon.Error,
					// 	title:"Success",
					// 	action:sap.m.MessageBox.Action.OK,
					// 	onClose:null
					// });
					oModel2.refresh();
				},
				error: function (err) {
					MessageToast.show("fail\n" + err.responseText);
				}
			});
		},

		//Searching Functions
		newf: function (data, pass, flag, empid, email, valfr, valto) {
			// debugger;
			var l = data.results.length;

			var json = new sap.ui.model.json.JSONModel(data.results);

			for (var i = 0; i < l; i++) {
				var empid2 = json.getProperty("/" + i + "/user_id");

				if (empid2 === empid) {
					var uid = json.getProperty("/" + i + "/user_uname");
					var lead = json.getProperty("/" + i + "/lead_id");
					
					var empname = json.getProperty("/" + i + "/user_fname");
					var skill = json.getProperty("/" + i + "/skill_id");
					var resource = json.getProperty("/" + i + "/rest_id");
					var location = json.getProperty("/" + i + "/loca_id");
				
					// var email = json.getProperty("/" + i + "/user_email");
					// var flag = json.getProperty("/" + i + "/flag");
					//alert(flag);
					var lname = empname.substr(0, empname.indexOf(","));
					var fname = empname.substr((empname.indexOf(", ") + 2));
					
					if (valfr === null) {
						
						this.getView().byId("iped_VALFR").setValue(null);
						
					}
					else {
						
						var validFrom = valfr.getDate() + "/" + (valfr.getMonth() + 1) + "/" + valfr.getFullYear();
						this.getView().byId("iped_VALFR").setValue(validFrom);
					}
					
					if (valto === null) {
						
						this.getView().byId("iped_VALTO").setValue(null);
						
					}
					else {
						
						var validTo = 	valto.getDate() + "/" + (valto.getMonth() + 1) + "/" + valto.getFullYear();
						this.getView().byId("iped_VALTO").setValue(validTo);
					}
					

					this.getView().byId("iped_userid").setValue(empid);
					this.getView().byId("iped_uname").setValue(uid);
					this.getView().byId("iped_email").setValue(email);

					this.getView().byId("iped_fname").setValue(fname);
					this.getView().byId("iped_lname").setValue(lname);
					
					

					this.getView().byId("iped_userloca").setSelectedKey(location);
					this.getView().byId("iped_userlead").setSelectedKey(lead);
					this.getView().byId("iped_userskill").setSelectedKey(skill);
					this.getView().byId("iped_userrest").setSelectedKey(resource);

					if (flag === "0") {
						this.getView().byId("iped_state").setState(false);
						this.getView().byId("iped_admin").setState(false);
					} else if (flag === "1") {
						this.getView().byId("iped_state").setState(true);
						this.getView().byId("iped_admin").setState(false);
					} else if (flag === "9") {
						this.getView().byId("iped_state").setState(true);
						this.getView().byId("iped_admin").setState(true);
					}

					this.getView().byId("iped_userid").setEnabled(false);
					this.getView().byId("iped_uname").setEnabled(true);

					this.getView().byId("iped_fname").setEnabled(true);
					this.getView().byId("iped_lname").setEnabled(true);

					this.getView().byId("iped_userloca").setEnabled(true);
					this.getView().byId("iped_userlead").setEnabled(true);
					this.getView().byId("iped_userskill").setEnabled(true);
					this.getView().byId("iped_userrest").setEnabled(true);
					this.getView().byId("iped_state").setEnabled(true);
					this.getView().byId("iped_VALFR").setEnabled(false);
					this.getView().byId("iped_VALTO").setEnabled(true);

					this.getView().byId("userEditForm").setBusy(false);
					return;
				} else if ((empid2 !== empid) & (i === (l - 1))) {
					this.getView().byId("userEditForm").setBusy(false);
					sap.m.MessageBox.error("No Entry exists for this Employee Id", {
						title: "Alert",
						action: sap.m.MessageBox.Action.OK,
						onclose: null
					});

				}
			}
		},

		onFetchProj: function () {
			var comboKey = this.getView().byId("searchComboProj").getSelectedKey();
			this.getView().byId("proj_dialog_edit").setBusy(true);
			var self = this;
			var oModel = this.getOwnerComponent().getModel("DTProject");
			oModel.read("/ZSOL_PROJ_SRV('" + comboKey + "')", {
				method: "PUT",
				success: function (res) {
					self.getView().byId("iped_projid").setValue(res.proj_id);
					self.getView().byId("iped_projname").setValue(res.proj_name);
					self.getView().byId("proj_dialog_edit").setBusy(false);
				},
				error: function (err) {
					sap.m.MessageBox.error("Unable to fetch enteries in PROJ\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});
					self.getView().byId("proj_dialog_edit").setBusy(false);
				}
			});
		},
		onFetchActi: function () {
			var comboKey = this.getView().byId("searchComboActi").getSelectedKey();
			this.getView().byId("acti_dialog_edit").setBusy(true);
			var self = this;
			var oModel = this.getOwnerComponent().getModel("DTActivity");
			oModel.read("/ZSOL_ACTI_SRV('" + comboKey + "')", {
				method: "PUT",
				success: function (res) {
					self.getView().byId("iped_actiid").setValue(res.acti_id);
					self.getView().byId("iped_actiname").setValue(res.acti_name);
					self.getView().byId("acti_dialog_edit").setBusy(false);
				},
				error: function (err) {
					sap.m.MessageBox.error("Unable to fetch enteries in ACTI\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});
					self.getView().byId("acti_dialog_edit").setBusy(false);
				}
			});
		},
		onFetchLead: function () {
			var comboKey = this.getView().byId("searchComboLead").getSelectedKey();
			this.getView().byId("lead_dialog_edit").setBusy(true);
			var self = this;
			var oModel = this.getOwnerComponent().getModel("DTLead");
			oModel.read("/ZSOL_LEAD_SRV('" + comboKey + "')", {
				method: "PUT",
				success: function (res) {
					self.getView().byId("iped_leadid").setValue(res.lead_id);
					self.getView().byId("iped_leadname").setValue(res.lead_name);
					self.getView().byId("lead_dialog_edit").setBusy(false);
				},
				error: function (err) {
					sap.m.MessageBox.error("Unable to fetch enteries in LEAD\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});
					self.getView().byId("lead_dialog_edit").setBusy(false);
				}
			});
		},
		onFetchSkill: function (oEvent) {
			// var comboKey = this.getView().byId("searchComboSkill").getSelectedKey();
			var comboKey = oEvent.getSource().getSelectedKey();
			this.getView().byId("skill_dialog_edit").setBusy(true);
			var self = this;
			var oModel = this.getOwnerComponent().getModel("DTSkill");
			oModel.read("/ZSOL_SKILL_SRV('" + comboKey + "')", {
				method: "PUT",
				success: function (res) {
					self.getView().byId("iped_skillid").setValue(res.skill_id);
					self.getView().byId("iped_skillname").setValue(res.skill_name);
					self.getView().byId("skill_dialog_edit").setBusy(false);
				},
				error: function (err) {
					sap.m.MessageBox.error("Unable to fetch enteries in SKILL\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});
					self.getView().byId("skill_dialog_edit").setBusy(false);
				}
			});
		},
		onfetchEmp: function (oEvent) {
			// var empid;
			// var comboKey = this.getView().byId("searchComboEmp").getSelectedKey();
			// var comboKey = oEvent.getSource().getSelectedKey();
			var comboKey = this.getView().byId("searchComboEmpName").getSelectedKey();

			this.getView().byId("userEditForm").setBusy(true);

			var self = this;

			var userModel = this.getOwnerComponent().getModel("DTUser");
			var oModel = this.getOwnerComponent().getModel("HeaderR");

			userModel.read("/ZSOL_USER_CDS('" + comboKey + "')", {
				success: function (data) {
					//alert(data);
					var empid = data.user_id;
					var flag = data.flag;
					var email = data.user_email;
					var pass = "noPass";
					var valfr = data.valfr;
					var valto = data.valto;

					oModel.read("/ZSOL_UPRO_R_SRV", {
						success: function (res) {
							self.newf(res, pass, flag, empid, email, valfr, valto);

						},
						error: function (err) {
							sap.m.MessageBox.error("Unable to fetch enteries in UPRO", {
								title: "Alert",
								action: sap.m.MessageBox.Action.Ok,
								onclose: null
							});
							this.getView().byId("userEditForm").setBusy(false);
						}
					});
				},
				error: function (err) {

					sap.m.MessageBox.error("Unable to fetch enteries in USER\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});

					this.getView().byId("userEditForm").setBusy(false);
				}
			});

		},
		onfetchEmpID: function (oEvent) {
			// var empid;
			// var comboKey = this.getView().byId("searchComboEmpID").getSelectedKey();
			// var comboKey = oEvent.getSource().getSelectedKey();
			
			var comboKey = this.getView().byId("searchComboEmpId").getSelectedKey();

			this.getView().byId("userEditForm").setBusy(true);

			var self = this;

			var userModel = this.getOwnerComponent().getModel("DTUser");
			var oModel = this.getOwnerComponent().getModel("HeaderR");

			userModel.read("/ZSOL_USER_CDS('" + comboKey + "')", {
				success: function (data) {
					//alert(data);
					var empid = data.user_id;
					var flag = data.flag;
					var email = data.user_email;
					var pass = "noPass";
					var valfr = data.valfr;
					var valto = data.valto;

					oModel.read("/ZSOL_UPRO_R_SRV", {
						success: function (res) {
							self.newf(res, pass, flag, empid, email, valfr, valto);

						},
						error: function (err) {
							sap.m.MessageBox.error("Unable to fetch enteries in UPRO", {
								title: "Alert",
								action: sap.m.MessageBox.Action.Ok,
								onclose: null
							});
							this.getView().byId("userEditForm").setBusy(false);
						}
					});
				},
				error: function (err) {

					sap.m.MessageBox.error("Unable to fetch enteries in USER\n" + err.responseText, {
						title: "Alert",
						action: sap.m.MessageBox.Action.Ok,
						onclose: null
					});

					this.getView().byId("userEditForm").setBusy(false);
				}
			});

		},

		//Clear Create Functions 
		onClearProjCreate: function () {
			var projName = this.getView().byId("ipcr_ProjName");
			/*	projDesc = this.getView().byId("ipcr_ProjDesc"),
				projSDate = this.getView().byId("ipcr_ProjSDate"),
				projEDate = this.getView().byId("ipcr_ProjEDate");
*/
			projName.setValue(null);
/*			projDesc.setValue(null);
			projSDate.setValue(null);
			projEDate.setValue(null);*/
		},
		onClearActiCreate: function () {
			var activityName = this.getView().byId("ipcr_actiName");
			
			activityName.setValue(null);
	
		},
		onClearLeadCreate: function () {
			var leadName = this.getView().byId("ipcr_leadName"),
				leadID = this.getView().byId("ipcr_leadID");

			leadName.setValue(null);
			leadID.setValue(null);

		},
		onClearSkillCreate: function () {
			var skillName = this.getView().byId("ipcr_skillName");
			
			skillName.setValue(null);
		},
		onClearUserCreate: function () {
			var userName = this.getView().byId("ipcr_username"),
				userId = this.getView().byId("ipcr_userid"),
				userEmail = this.getView().byId("ipcr_email"),
				userFname = this.getView().byId("ipcr_fname"),
				userLname = this.getView().byId("ipcr_lname"),
				userSkill = this.getView().byId("ipcr_userskill"),
				userLead = this.getView().byId("ipcr_userlead"),
				userRest = this.getView().byId("ipcr_userrest"),
				userLoca = this.getView().byId("ipcr_userloca"),
				validFrom = this.getView().byId("ipcr_validFrom");
				

			userName.setValue(null);
			userId.setValue(null);
			userEmail.setValue(null);
			userFname.setValue(null);
			userLname.setValue(null);
			userSkill.setValue(null);
			userLead.setValue(null);
			userRest.setValue(null);
			userLoca.setValue(null);
			validFrom.setValue(null);

		},
		
		//Clear Edit Functions 
		
		onClearProjEdit: function () {
				var projName = this.getView().byId("iped_projname"),
				projId = this.getView().byId("iped_projid"),
				projectSearch = this.getView().byId("searchComboProj");

			projName.setValue(null);
			projId.setValue(null);
			projectSearch.setValue(null);
		},
		onClearActiEdit: function () {
			
			var activityName = this.getView().byId("iped_actiname"),
				activitySearch = this.getView().byId("searchComboActi"),
				activityId = this.getView().byId("iped_actiid");
			
			activityName.setValue(null);
			activitySearch.setValue(null);
			activityId.setValue(null);
			
		},
		onClearLeadEdit: function () {
			
			var leadName = this.getView().byId("iped_leadname"),
				leadID = this.getView().byId("iped_leadid"),
				leadSearch = this.getView().byId("searchComboLead");

			leadName.setValue(null);
			leadID.setValue(null);
			leadSearch.setValue(null);
			
		},
		onClearSkillEdit: function () {
			
			var skillName = this.getView().byId("searchComboSkill"),
				skillId = this.getView().byId("iped_skillid"),
				skillSearch = this.getView().byId("iped_skillname");
			
			skillName.setValue(null);
			skillId.setValue(null);
			skillSearch.setValue(null);
			
		},
		onClearUserEdit: function () {
			
			var comboKeyEmpId = this.getView().byId("searchComboEmpId"),
				comboKeyEmpName = this.getView().byId("searchComboEmpName"),
				userName = this.getView().byId("iped_uname"),
				userId = this.getView().byId("iped_userid"),
				userEmail = this.getView().byId("iped_email"),
				userFname = this.getView().byId("iped_fname"),
				userLname = this.getView().byId("iped_lname"),
				userSkill = this.getView().byId("iped_userskill"),
				userLead = this.getView().byId("iped_userlead"),
				userRest = this.getView().byId("iped_userrest"),
				userLoca = this.getView().byId("iped_userloca"),
				validFrom = this.getView().byId("iped_VALFR"),
				validTo = this.getView().byId("iped_VALTO");
				
			comboKeyEmpId.setValue(null);
			comboKeyEmpName.setValue(null);
			userName.setValue(null);
			userId.setValue(null);
			userEmail.setValue(null);
			userFname.setValue(null);
			userLname.setValue(null);
			userSkill.setValue(null);
			userLead.setValue(null);
			userRest.setValue(null);
			userLoca.setValue(null);
			validFrom.setValue(null);
			validTo.setValue(null);
			
		}

	});
});