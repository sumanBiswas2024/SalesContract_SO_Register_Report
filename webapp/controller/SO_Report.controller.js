// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ], (Controller) => {
//     "use strict";

//     return Controller.extend("com.crescent.app.soregisteredreport.controller.SO_Report", {
//         onInit() {
//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/m/MessageBox',
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/m/Dialog",
    "sap/m/BusyIndicator",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Label, Filter, FilterOperator, PersonalizableInfo, MessageBox, exportLibrary, Spreadsheet, MessageToast, CustModels, PDFViewer, Dialog, BusyIndicator, VBox, Text, Fragment) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("com.crescent.app.soregisteredreport.controller.SO_Report", {
        onInit() {

            //this.getView().setModel(this.oModel);
            this.oModel = new JSONModel();

            sap.ui.getCore().setModel(this.oModel, "UIDataModel");
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Visible", true);
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Invisible", false);
            //this.applyData = this.applyData.bind(this);
            //this.fetchData = this.fetchData.bind(this);
            //this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oSmartVariantManagement = this.getView().byId("svm");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oTable = this.getView().byId("table");

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            var oPersInfo = new PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

            var oTable = this.byId("table");

        },
        onDialogEquipmentNumber: function () {
            new CustModels();
        },
        /*
        onExport: function () {

            const oTable = this.oTable;
            const oBinding = oTable.getBinding("items");
            const aCols = this.createColumnConfig();
            // const oSettings = {
            //     workbook: { columns: aCols },
            //     dataSource: oBinding
            // };
            const oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: "SO Register Report" // Sheet tab name
                    }
                },
                dataSource: oBinding,
                fileName: "Sales Contract - SO Register Report" // File name after download
            };
            const oSheet = new Spreadsheet(oSettings);

            oSheet.build()
                .then(function () {
                    MessageToast.show("Spreadsheet export has finished");
                }).finally(function () {
                    oSheet.destroy();
                });
        },
        */
        onExport: function () {
            // Get all data from the model, not table binding
            const oTableDataModel = this.getView().getModel("TableDataModel");
            const oData = oTableDataModel.getData(); // all records
            const that = this;

            //  Step 1: Recalculate values before export
            let aProcessedData = oData.map(item => {
                let docType = item.doc_type;
                // const orderQty = parseFloat(item.OrderQuantity) || 0;
                // const targetQty = parseFloat(item.TargetQuantity) || 0;
                // const price = parseFloat(item.unit_price) || 0;

                let orderQtyStr = (item.OrderQuantity || "").toString().replace(/,/g, "");
                let targetQtyStr = (item.TargetQuantity || "").toString().replace(/,/g, "");
                let unitPriceStr = (item.unit_price || "").toString().replace(/,/g, "");

                //  Convert to float (now clean of commas)
                let orderQty = parseFloat(orderQtyStr) || 0;
                let targetQty = parseFloat(targetQtyStr) || 0;
                let price = parseFloat(unitPriceStr) || 0;

                //  1. Decide which quantity to show in "SC/Direct SO Qty"
                let finalQty = 0;
                if (docType === "Sales Contract") {
                    finalQty = targetQty;
                } else if (docType === "Direct Sales Order") {
                    finalQty = orderQty;
                }

                //  2. Calculate total price in INR
                let totalPriceINR = 0;
                if (docType === "Sales Contract") {
                    totalPriceINR = targetQty * price;
                } else if (docType === "Direct Sales Order") {
                    totalPriceINR = orderQty * price;
                }

                //  3. Assign formatted values
                item.OrderQuantity = parseFloat(finalQty.toFixed(2)); // numeric with 2 decimals
                item.unit_price = parseFloat(price.toFixed(2));
                item.total_price_inr = parseFloat(totalPriceINR.toFixed(2));

                console.log(
                    `Export Calc → DocType: ${docType}, Qty: ${finalQty}, UnitPrice: ${price}, TotalINR: ${item.total_price_inr}`
                );

                return item;
            });

            //  Step 2: Define Excel column configuration
            const aCols = this.createColumnConfig();

            //  Step 3: Configure and export
            const oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: "SO Register Report"
                    }
                },
                dataSource: aProcessedData, // ✅ use full model data
                fileName: "Sales Contract - SO Register Report"
            };

            const oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build()
                .then(() => sap.m.MessageToast.show("Spreadsheet export has finished"))
                .finally(() => oSheet.destroy());
        },
        
        createColumnConfig: function () {
            return [
                { label: "Sales Document Type", property: "doc_type", type: EdmType.String },
                { label: "SO/SC No", property: "SalesDocument", type: EdmType.String },
                { label: "Line Item No", property: "SalesDocumentItem", type: EdmType.String },
                { label: "SO/SC Date", property: "SalesDocumentDate", type: EdmType.String },
                { label: "Customer Code", property: "SoldToParty", type: EdmType.String },
                { label: "Currency", property: "TransactionCurrency", type: EdmType.String },
                { label: "Bank", property: "BankIdentification", type: EdmType.String },
                { label: "Plant", property: "Plant", type: EdmType.String },
                { label: "Sales Person", property: "salesperson", type: EdmType.String },
                { label: "Material Code", property: "Material", type: EdmType.String },
                { label: "Material Name", property: "SalesDocumentItemText", type: EdmType.String },
                { label: "Material Group", property: "MaterialGroup", type: EdmType.String },
                { label: "Material Group Name", property: "ProductGroupName", type: EdmType.String },

                // Numbers with Excel style
                {
                    label: "SC/Direct SO Qty",
                    property: "OrderQuantity",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                },
                {
                    label: "Unit Price",
                    property: "unit_price",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                },
                {
                    label: "Exchange Rate",
                    property: "PriceDetnExchangeRate",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                },
                {
                    label: "Total Price - INR",
                    property: "total_price_inr",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                },
                {
                    label: "Unit Wt (Kg)",
                    property: "ItemGrossWeight",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                },
                {
                    label: "Total Wt (Kg)",
                    property: "ItemNetWeight",
                    type: EdmType.Number,
                    scale: 2,
                    textAlign: "Right"
                }
            ];
        },

        onExit: function () {
            this.oModel = null;
            this.oSmartVariantManagement = null;
            this.oExpandedLabel = null;
            this.oSnappedLabel = null;
            this.oFilterBar = null;
            this.oTable = null;
        },
        onPressText: function () {
            this.oTable.removeSelections(true);
            var oModel = sap.ui.getCore().getModel("UIDataModel");
            oModel.setProperty('/Visible', !oModel.getProperty('/Visible'));
            oModel.setProperty('/Invisible', !oModel.getProperty('/Invisible'));
        },
        getDateFormatString: function (fullDate) {
            var oDate = fullDate.getDate();
            if (oDate < 10) {
                oDate = "0" + oDate.toString();
            }
            var oMonth = fullDate.getMonth() + 1;
            if (oMonth < 10) {
                oMonth = "0" + oMonth.toString();
            }
            var oYear = fullDate.getFullYear();

            var oDateStr = oYear + "-" + oMonth + "-" + oDate;
            return oDateStr;

        },
        onSearch: function () {
            var that = this;
            var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl instanceof sap.m.DatePicker) {
                    var aSelectedKeys = oControl.getDateValue();
                    if (aSelectedKeys != null) {
                        var oDateStr = that.getDateFormatString(aSelectedKeys);
                        aResult.push(oDateStr);
                    } else {
                        // var arrayOfStrings = oControl.getId().split('-');
                        // var oMessage = "";
                        // var str = ["fromDate", "toDate"];
                        // var found = arrayOfStrings.find(v => str.includes(v));
                        // if (found == "fromDate") {
                        //     oMessage = "Please Fill in the compulsory From-Date Fields";
                        // } else if (found == "toDate") {
                        //     oMessage = "Please Fill in the compulsory To-Date Fields";
                        // }
                        // else {
                        //     oMessage = "Please Fill in the compulsory Fields";
                        // }

                        // MessageBox.error(oMessage);

                        // return;
                    }

                }
                //aSelectedKeys = oControl.getSelectedKeys(),
                /*aFilters = aSelectedKeys.map(function (sSelectedKey) {
                    return new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.Contains,
                        value1: sSelectedKey
                    });
                });
                
            if (oDate.length > 0) {
                aResult.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
*/
                return aResult;
            }, []);
            // var oUrl = "/ZC_METER_READING_REPORT(pa_data_from=" + aTableFilters[0] + ",pa_data_to=" + aTableFilters[1] + ")/Set"

            // var oTableJsonModel = this.getDataFromBackend(oUrl);


            // For extract From and To Date
            this.fromDate = aTableFilters[0];
            this.toDate = aTableFilters[1];
            // End

            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            oGlobalModel.setProperty("/fromDate", this.fromDate);
            oGlobalModel.setProperty("/toDate", this.toDate);

            this.getDataFromBackend2();


            /*this.oTable.bindItems({
                path: oUrl,
                template: that.oTable.getBindingInfo("items").template
            });*/
            //this.oTable.getBinding("items").filter(aTableFilters);
            //this.oTable.setShowOverlay(false);
        },
        _validateInputFields: function () {
            var inputfromDate = this.byId("fromDate");
            var inputtoDate = this.byId("toDate");

            var isValid = true;
            var message = '';

            if (!inputfromDate.getValue()) {
                inputfromDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'From Date , ';
            } else {
                inputfromDate.setValueState(sap.ui.core.ValueState.None);
            }
            if (!inputtoDate.getValue()) {
                inputtoDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'To Date , ';
            } else {
                inputtoDate.setValueState(sap.ui.core.ValueState.None);
            }

            if (!isValid) {
                // Remove the last comma and space from the message
                message = message.slice(0, -2);
                sap.m.MessageBox.error("Please fill up the following fields: " + message);
                return false;
            }

            return true;
        },
        onDateChange: function () {
            var oFromDate = this.getView().byId("fromDate");
            var oToDate = this.getView().byId("toDate");

            var sFromDate = oFromDate.getDateValue();
            var sToDate = oToDate.getDateValue();

            if (sFromDate && sToDate) {
                if (sToDate < sFromDate) {
                    sap.m.MessageBox.error("To Date cannot be earlier than From Date.");
                    oToDate.setValue("");
                }
            }
        },

        getDataFromBackend2: async function () {
            // Step 1: Validate input fields
            if (!this._validateInputFields()) {
                return; // Validation failed
            }

            var that = this;
            var oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();
            var oModel = this.getOwnerComponent().getModel();
            var oTableDataModel = this.getView().getModel("TableDataModel");
            var oExportDataModel = this.getView().getModel("exportDataModel");
            var allResults = []; // collect all records

            sap.ui.core.BusyIndicator.show(0); // show loading spinner

            // Recursive function to fetch paginated data
            function readData(skipToken) {
                var mParameters = {
                    success: function (oData) {
                        // Append current batch
                        allResults = allResults.concat(oData.results || []);

                        if (oData.__next) {
                            // Extract skiptoken from __next link
                            var nextToken = decodeURIComponent(oData.__next.split("$skiptoken=")[1]);
                            readData(nextToken); // Recursive call for next page
                        } else {
                            // No more data → process final results
                            sap.ui.core.BusyIndicator.hide();

                            if (allResults.length === 0) {
                                sap.m.MessageBox.warning("No Data Available!");
                                oTableDataModel.setData([]); // show blank table
                                return;
                            }

                            // Format each record
                            allResults = allResults.map(function (item) {
                                // Format SalesDocumentDate
                                item.SalesDocumentDate = that._formatDateToDDMMYYYY(item.SalesDocumentDate);

                                // Format numeric fields to 2 decimals
                                const numericFields = [
                                    "OrderQuantity",
                                    "unit_price",
                                    "total_price",
                                    "PriceDetnExchangeRate",
                                    "total_price_inr",
                                    "ItemGrossWeight",
                                    "ItemNetWeight"
                                ];

                                numericFields.forEach(function (field) {
                                    if (item[field] !== undefined && item[field] !== null) {
                                        let num = parseFloat(item[field]);
                                        if (!isNaN(num)) {
                                            item[field] = num.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            });
                                        }
                                    }
                                });

                                return item;
                            });

                            // Set final data to TableDataModel
                            oTableDataModel.setData(allResults);
                            console.log("Total Records Fetched:", allResults.length);
                            oExportDataModel.setData(allResults);   // Export Function
                        }
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        console.error("Error while fetching data:", oError);
                        sap.m.MessageBox.error("Error while fetching data. Check console for details.");
                    }
                };

                // Build path for the function import
                var sPath = `/ZC_SCSO_RECD_RPT(p_date_low=datetime'${oGlobalModelData.fromDate}T00:00:00',p_date_high=datetime'${oGlobalModelData.toDate}T00:00:00')/Set`;

                // Add skiptoken if exists
                if (skipToken) {
                    mParameters.urlParameters = { "$skiptoken": skipToken };
                }

                oModel.read(sPath, mParameters);
            }

            // Start first call without skipToken
            readData();
        },

        _formatDateToDDMMYYYY: function (value) {
            if (!value) return "";

            let d;

            if (typeof value === "string") {
                // Case 1: OData string format "/Date(1751328000000)/"
                let timestamp = parseInt(value.replace(/[^0-9]/g, ""), 10);
                d = new Date(timestamp);
            } else if (value instanceof Date) {
                // Case 2: Already a Date object
                d = value;
            } else if (typeof value === "number") {
                // Case 3: Raw timestamp
                d = new Date(value);
            }

            if (d instanceof Date && !isNaN(d)) {
                let dd = String(d.getDate()).padStart(2, "0");
                let mm = String(d.getMonth() + 1).padStart(2, "0");
                let yyyy = d.getFullYear();
                return `${dd}-${mm}-${yyyy}`;
            }

            return "";
        },
        getOrderQuantity: function (doc_type, OrderQuantity, TargetQuantity) {
            if (doc_type === "Sales Contract") {
                return TargetQuantity || "0";
            } else if (doc_type === "Direct Sales Order") {
                return OrderQuantity || "0";
            } else {
                return "";
            }
        },

        getTotalPriceInr: function (doc_type, OrderQuantity, TargetQuantity, unit_price) {
            //  Clean the input strings by removing commas but keep decimals
            let orderQtyStr = (OrderQuantity || "").toString().replace(/,/g, "");
            let targetQtyStr = (TargetQuantity || "").toString().replace(/,/g, "");
            let unitPriceStr = (unit_price || "").toString().replace(/,/g, "");

            //  Convert to float (now clean of commas)
            let orderQty = parseFloat(orderQtyStr) || 0;
            let targetQty = parseFloat(targetQtyStr) || 0;
            let price = parseFloat(unitPriceStr) || 0;

            let totalPriceINR = 0;

            //  Business logic
            if (doc_type === "Sales Contract") {
                totalPriceINR = targetQty * price;
            } else if (doc_type === "Direct Sales Order") {
                totalPriceINR = orderQty * price;
            } else {
                return "0.00";
            }

            //  Return nicely formatted with commas and decimals
            return totalPriceINR.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }



    });
});