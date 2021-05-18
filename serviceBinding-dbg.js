function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSOL_USER_ACTIVITY_CDS/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}