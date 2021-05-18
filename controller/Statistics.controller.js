sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("TrackerEntry.TrackerEntry.controller.Statistics", {

			onInit: function () {
			
			var newDate = new Date();
			
			var todayFormatted = this.startDate = this.adjustDate(newDate);
			var previousFormatted = this.endDate = this.adjustDate(newDate);
			
			this.onSetModelProject(previousFormatted, todayFormatted);
			
		},
		
		onSetModelProject: function(today, previous) {
			
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel();
			
			this.viewName = "projectView";
			
			var oModelSetProj = this.getOwnerComponent().getModel("zsol_proj");
			
			oModelSetProj.read("/ZSOL_PROJ_HRS(p_sDate='" + today + "',p_eDate='" + previous + "')/Set", {
				method: "GET",
				async: true,
				success: function (oData) {
					oModel.setData(oData.results);
					that.getView().setModel(oModel, "oModel");
				},
				error: function(error) {
					 sap.m.MessageBox.alert("Failure");
				}
			});
			/*
			var oVizFrame = this.oVizFrame = this.getView().byId("idProjChart");
			that.vizPopover = that.getView().byId("idPopOverProj");
            that.vizPopover.connect(oVizFrame.getVizUid());
            */
            this.getView().byId("chartContainerProj").setVisible(true);
			this.getView().byId("chartContainerActivity").setVisible(false);
			this.getView().byId("chartContainerUser").setVisible(false);
			this.getView().byId("buttonBack").setVisible(false);  
			
		},
		
		onDateChange: function (oEvent) {
			// var picker = this.getView().byId("picker0");
			// var newDate = picker.getDateValue();
			var dateFrom = oEvent.getParameter("from");
			var dateTo = oEvent.getParameter("to");
			
			var dateFromFormatted = this.startDate = this.adjustDate(dateFrom);
			var dateToFormatted = this.endDate = this.adjustDate(dateTo);
			
			if(this.viewName === "projectView"){
				
					this.onSetModelProject(dateFromFormatted, dateToFormatted);
			}
			
			else if(this.viewName === "activityView"){
				
				this.onSetModelActivity(this.projName, dateFromFormatted, dateToFormatted);
			}
			
			else{
				
				this.onSetModelUser(this.projName, dateFromFormatted, dateToFormatted, this.activityName);
			}
		
			
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
		
		onClickProject: function(oEvent){
			
			var oItem = oEvent.getSource();
			
			var projName = this.projName = oEvent.getSource().vizSelection()[0].data.ProjectName;

            // Clear VizFrame Selection
            var action = {
              clearSelection: true
            };
            oItem.vizSelection("", action);
            
            this.onSetModelActivity(projName, this.startDate, this.endDate);
           
		},
		
		onSetModelActivity: function(projName, startDate, endDate) {
			
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel();
			
			this.viewName = "activityView";
			
			var oModelSetActivity = this.getOwnerComponent().getModel("zsol_activity");
			
			var filterSet = [];
			filterSet.push(new sap.ui.model.Filter("proj_name", sap.ui.model.FilterOperator.EQ, this.projName));
			
			oModelSetActivity.read("/ZSOL_PROJECT_ACTIVITY(p_sDate='" + startDate + "',p_eDate='" + endDate + "')/Set", {
				method: "GET",
				async: true,
				success: function (oData) {
					oModel.setData(oData.results);
					that.getView().setModel(oModel, "oModel");
				},
				error: function(error) {
					 sap.m.MessageBox.alert("Failure");
				},
				
				filters: filterSet
			});
			
/*			var oVizFrame = this.oVizFrame = this.getView().byId("idActivityChart");
			that.vizPopover = that.getView().byId("idPopOverActivity");
            that.vizPopover.connect(oVizFrame.getVizUid());*/
            
            this.getView().byId("chartContainerProj").setVisible(false);
			this.getView().byId("chartContainerActivity").setVisible(true);
			this.getView().byId("chartContainerUser").setVisible(false);
			this.getView().byId("buttonBack").setVisible(true);     
			
		},
		
		onClickActivity: function(oEvent){
			
			 var oItem = oEvent.getSource();

			var activityName = this.activityName = oEvent.getSource().vizSelection()[0].data.ActivityName;

            // Clear VizFrame Selection
            var action = {
              clearSelection: true
            };
            oItem.vizSelection("", action);
            
            this.onSetModelUser(this.projName, this.startDate, this.endDate, activityName);

		},
		
		onSetModelUser: function(projName, startDate, endDate, activityName) {
			
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel();
			 
			 this.viewName = "userView";
			 
			var oModelSetUser = this.getOwnerComponent().getModel("zsol_users");
			
			var filterSet = [];
			filterSet.push(new sap.ui.model.Filter("proj_name", sap.ui.model.FilterOperator.EQ, this.projName));
			filterSet.push(new sap.ui.model.Filter("acti_name", sap.ui.model.FilterOperator.EQ, this.activityName));
			
			oModelSetUser.read("/ZSOL_USER_ACTIVITY(p_sDate='" + startDate + "',p_eDate='" + endDate + "')/Set", {
				method: "GET",
				async: true,
				success: function (oData) {
					oModel.setData(oData.results);
					that.getView().setModel(oModel, "oModel");
				},
				error: function(error) {
					 sap.m.MessageBox.alert("Failure");
				},
				
				filters: filterSet
			});
/*			
			var oVizFrame = this.oVizFrame = this.getView().byId("idUserChart");
			that.vizPopover = that.getView().byId("idPopOverUser");
            that.vizPopover.connect(oVizFrame.getVizUid());*/
            
            this.getView().byId("chartContainerProj").setVisible(false);
			this.getView().byId("chartContainerActivity").setVisible(false);
			this.getView().byId("chartContainerUser").setVisible(true);
			this.getView().byId("buttonBack").setVisible(true);     
			
		},
		
		onNavBack: function(oEvent){
			
			if(this.viewName === "activityView") {
				
				this.onSetModelProject(this.startDate, this.endDate);
			}
			
			else if(this.viewName === "userView") {
				
				this.onSetModelActivity(this.projName, this.startDate, this.endDate);
			}
			
			else {
				
				this.onSetModelUser(this.projName, this.startDate, this.endDate, this.activityName);
			}
			
		},
		
		onPageRefresh: function(oEvent) {
			
			if(this.viewName === "projectView") {
				
				this.onSetModelProject(this.startDate, this.endDate);
			}
			
			else if(this.viewName === "activityView") {
				
				this.onSetModelActivity(this.projName, this.startDate, this.endDate);
			}
			
			else {
				
				this.onSetModelUser(this.projName, this.startDate, this.endDate, this.activityName);
			}
			
		},
		
		onProjectExport: function () {
			// var sUrl = "/sap/opu/odata/sap/ZSOL_PROJ_HRS_CDS/ZSOL_PROJ_HRS(p_sDate='" + this.startDate + "',p_eDate='" + this.endDate + "')/Set?&$select=proj_name,Hrs&$format=xlsx";
	        var sUrl = "/sap/opu/odata/sap/ZSOL_PROJ_HRS_CDS/ZSOL_PROJ_HRS(p_sDate='" + this.startDate + "',p_eDate='" + this.endDate + "')/Set?&$select=Start_Date,End_Date,proj_name,Hrs&$format=xlsx";
	          var encodeUrl = encodeURI(sUrl);
		  sap.m.URLHelper.redirect(encodeUrl,true);
		},
		
		onActivityExport: function(){
		  var sUrl = "/sap/opu/odata/sap/ZSOL_PROJECT_ACTIVITY_CDS/ZSOL_PROJECT_ACTIVITY(p_sDate='" + this.startDate + "',p_eDate='" + this.endDate + "')/Set?$filter=proj_name eq '" + this.projName + "'&$select=Start_Date,End_Date,proj_name,acti_name,hrs&$format=xlsx";
	          var encodeUrl = encodeURI(sUrl);
		  sap.m.URLHelper.redirect(encodeUrl,true);
		},
		
		onUserExport: function() {
			 var sUrl = "/sap/opu/odata/sap/ZSOL_USER_ACTIVITY_CDS/ZSOL_USER_ACTIVITY(p_sDate='" + this.startDate + "',p_eDate='" + this.endDate + "')/Set?$filter=proj_name eq '" + this.projName + "' and acti_name eq '" + this.activityName + "'&$select=Start_Date,End_Date,fname,proj_name,acti_name,hrs&$format=xlsx";
	          var encodeUrl = encodeURI(sUrl);
		  sap.m.URLHelper.redirect(encodeUrl,true);
		}

	});

});