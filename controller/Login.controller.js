sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("TrackerEntry.TrackerEntry.controller.Login", {
		
		onInit: function (){
			this.sapAuth();
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
			        		var empid = data.results["0"].user_id;
			        		var bta = btoa(empid + dd);
							that.getOwnerComponent().getRouter().navTo("Activity", {
								Emp: (bta)
							});	
			        	},
			        	error: function(){
			        			that.getOwnerComponent().getRouter().navTo("login");
			        	}
			        });
			    }
	        };
		        
		    xmlHttp.open( "GET", y, false );
		    xmlHttp.send(null);
		},

		onSignin: function () {
			var user = this.getView().byId("user").getValue().toLowerCase();
			var password = this.getView().byId("pass").getValue();
			var regex = /[A-Z]/;
			if (user.match(regex)) {
				// alert("UserId should be in lowercase");
				sap.m.MessageBox.error("Username should be in lowercase", {
					icon: sap.m.MessageBox.Icon.Error,
					title: "Alert",
					action: sap.m.MessageBox.Action.OK,
					onClose: null
				});
				return;
			} else {
				var self = this;
				var oModel = this.getOwnerComponent().getModel("DTUser");
				oModel.read("/ZSOL_USER_CDS", {
					success: function (data, OwnerComponent) {
						var l = data.results.length; // to find total no of entries
						var oValidate = new sap.ui.model.json.JSONModel(data.results); // storing data into json model
						self.applyNext(oValidate, l); // calling another function
					},
					error: function (e) {
						MessageToast.show("Fail");
					}

				});
			}
		},
		applyNext: function (oValidate, l) {
			var user = this.getView().byId("user").getValue().toLowerCase();
			var password = this.getView().byId("pass").getValue();
			
			
			for (var i = 0; i < l; i++) {
				var emp = oValidate.getProperty("/" + i + "/user_id");
				var u = oValidate.getProperty("/" + i + "/user_uname");
				var p = oValidate.getProperty("/" + i + "/user_psw");
				var flag = oValidate.getProperty("/" + i + "/flag");
				var dd = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
				
				var bta = btoa(emp+dd);
				
				if (user === u && password === p) {
					
					if(flag === "1"){
						this.getOwnerComponent().getRouter().navTo("Activity", {
							Emp: (bta)
						});	
					}else if(flag === "0"){
						// MessageToast.show("Userid or password is incorrect");
						MessageBox.error("The user: "+ u +" is inactive, ask your admin for access", {
							icon: sap.m.MessageBox.Icon.Error,
							title: "Alert",
							action: sap.m.MessageBox.Action.OK,
							onClose: null
						});	
					}
					return;
				} else if ((user !== u || password !== p) && i === (l - 1)) {
					// MessageToast.show("Userid or password is incorrect");
					MessageBox.error("Username or Password is incorrect", {
						icon: sap.m.MessageBox.Icon.Error,
						title: "Alert",
						action: sap.m.MessageBox.Action.OK,
						onClose: null
					});
				}
			}
		}

	});

});