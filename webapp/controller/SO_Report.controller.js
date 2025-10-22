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
        // createColumnConfig: function () {
        //     return [
        //         {
        //             label: "Material Group",
        //             property: "MaterialGroupCombined",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Plant",
        //             property: "Plant",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "UOM",
        //             property: "unit_of_measure",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Opening Stock Qty",
        //             property: "open_stk_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Received Against PO Qty",
        //             property: "rcvd_po_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Received From Prodn Ord Qty-Unrestricted",
        //             property: "rcvd_mo_qty_unsl",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Received From Prodn Ord Qty-Rejection",
        //             property: "rcvd_mo_qty_resl",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Foundary Return Qty",
        //             property: "foundary_ret_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Other Receipt Qty",
        //             property: "oth_rcv_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Transfer In Qty",
        //             property: "trnsf_in_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Sales Return Qty",
        //             property: "SLS_RET_QTY",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Delivery Against SO Qty",
        //             property: "SLS_DELV_QTY",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Issue to Prodn Order Qty",
        //             property: "iss_prd_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Other Issue Qty",
        //             property: "oth_iss_QTY",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Return Against PO Qty",
        //             property: "RET_PO_QTY",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Transfer Out Qty",
        //             property: "trans_out_qty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Total Received Qty",
        //             property: "totalrcvdqty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Total Issue Qty",
        //             property: "totalissueqty",
        //             type: EdmType.String
        //         },
        //         {
        //             label: "Closing Stock",
        //             property: "closing_stk",
        //             type: EdmType.String
        //         }

        //     ];
        // },

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
                { label: "SC/Direct SO Qty", property: "OrderQuantity", type: EdmType.String },
                { label: "Unit Price", property: "unit_price", type: EdmType.String },
                { label: "Total Price", property: "total_price", type: EdmType.String },
                { label: "Exchange Rate", property: "PriceDetnExchangeRate", type: EdmType.String },
                { label: "Total Price - INR", property: "total_price_inr", type: EdmType.String },
                { label: "Unit Wt (Kg)", property: "ItemGrossWeight", type: EdmType.String },
                { label: "Total Wt (Kg)", property: "ItemNetWeight", type: EdmType.String }
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
            if (!this._validateInputFields()) {
                return; // Validation failed
            }

            var that = this;
            var oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();
            sap.ui.core.BusyIndicator.show(0); // show loading spinner

            try {
                var oModel = this.getOwnerComponent().getModel();
                let sPath = "/ZC_SCSO_RECD_RPT(p_date_low=datetime'" +
                    oGlobalModelData.fromDate + "T00:00:00'," +
                    "p_date_high=datetime'" + oGlobalModelData.toDate + "T00:00:00')/Set";

                await new Promise(function (resolve, reject) {
                    oModel.read(sPath, {
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();

                            let aAllData = oData.results || [];

                            if (aAllData.length === 0) {
                                sap.m.MessageBox.warning("No Data Available!");
                            } else {
                                // Format each record
                                aAllData = aAllData.map(function (item) {
                                    // Format SalesDocumentDate to dd-mm-yyyy
                                    item.SalesDocumentDate = that._formatDateToDDMMYYYY(item.SalesDocumentDate);

                                    // Format numeric fields to 2 decimals
                                    const numericFields = [
                                        "OrderQuantity", "unit_price", "total_price",
                                        "PriceDetnExchangeRate", "total_price_inr",
                                        "ItemGrossWeight", "ItemNetWeight"
                                    ];

                                    numericFields.forEach(function (field) {
                                        if (item[field] !== undefined && item[field] !== null) {
                                            var num = parseFloat(item[field]);
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
                            }

                            // **Always update table model**, even if array is empty
                            var oTableDataModel = that.getView().getModel("TableDataModel");
                            oTableDataModel.setData(aAllData);

                            resolve();
                        },
                        error: function (oError) {
                            sap.ui.core.BusyIndicator.hide();
                            console.error("Error while fetching data:", oError);
                            reject(oError);
                        }
                    });
                });

            } catch (error) {
                sap.ui.core.BusyIndicator.hide();
                console.error("Error while fetching data:", error);
            }
        },



        /* Used $top and $skip - Not Working Below Code Fetching Function Running Infinitely

        // getDataFromBackend2: async function () {
        //     if (!this._validateInputFields()) {
        //         return; // Validation failed
        //     }

        //     const that = this;
        //     const oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();
        //     const oNewModel = this.getOwnerComponent().getModel();

        //     // Build and encode your parameterized OData URL
        //     let sPath = "/ZC_SCSO_RECD_RPT(p_date_low=datetime'" +
        //         oGlobalModelData.fromDate + "T00:00:00'," +
        //         "p_date_high=datetime'" + oGlobalModelData.toDate + "T00:00:00')/Set";

        //     sPath = encodeURI(sPath);

        //     sap.ui.core.BusyIndicator.show(0);

        //     try {
        //         const iBatchSize = 100;  // safe large batch size
        //         let iSkip = 0;
        //         let iBatchNumber = 1;
        //         let aAllData = [];
        //         let bMoreData = true;

        //         console.log(" Starting OData batch fetch...");

        //         // Fetch loop
        //         while (bMoreData) {
        //             const sPagedUrl = `${sPath}?$top=${iBatchSize}&$skip=${iSkip}`;

        //             console.log(` Fetching Batch #${iBatchNumber} → skip=${iSkip}, top=${iBatchSize}`);

        //             // eslint-disable-next-line no-await-in-loop
        //             const oResponse = await new Promise((resolve, reject) => {
        //                 oNewModel.read(sPagedUrl, {
        //                     success: function (oData) {
        //                         resolve(oData);
        //                     },
        //                     error: function (oError) {
        //                         reject(oError);
        //                     }
        //                 });
        //             });

        //             if (oResponse && oResponse.results && oResponse.results.length > 0) {
        //                 console.log(` Batch #${iBatchNumber} fetched: ${oResponse.results.length} records`);
        //                 aAllData = aAllData.concat(oResponse.results);

        //                 // Increment counters
        //                 iSkip += iBatchSize;
        //                 iBatchNumber++;

        //                 // Stop if this batch returned less than batch size
        //                 if (oResponse.results.length < iBatchSize) {
        //                     bMoreData = false;
        //                 }
        //             } else {
        //                 bMoreData = false;
        //             }

        //             // Optional: small delay between requests (good for backend stability)
        //             await new Promise(r => setTimeout(r, 50));
        //         }

        //         console.log(" Total Records Fetched:", aAllData.length);

        //         if (aAllData.length === 0) {
        //             sap.m.MessageBox.warning("No Data Available!");
        //             return;
        //         }

        //         //  Format fetched data
        //         const numericFields = [
        //             "OrderQuantity", "unit_price", "total_price",
        //             "PriceDetnExchangeRate", "total_price_inr",
        //             "ItemGrossWeight", "ItemNetWeight"
        //         ];

        //         aAllData = aAllData.map(function (item) {
        //             // Format date
        //             item.SalesDocumentDate = that._formatDateToDDMMYYYY(item.SalesDocumentDate);

        //             // Format numeric fields
        //             numericFields.forEach(function (field) {
        //                 if (item[field] !== undefined && item[field] !== null) {
        //                     const num = parseFloat(item[field]);
        //                     if (!isNaN(num)) {
        //                         item[field] = num.toLocaleString("en-US", {
        //                             minimumFractionDigits: 2,
        //                             maximumFractionDigits: 2
        //                         });
        //                     }
        //                 }
        //             });

        //             return item;
        //         });

        //         // Bind formatted data to TableDataModel
        //         const oTableDataModel = that.getView().getModel("TableDataModel");
        //         oTableDataModel.setData(aAllData);

        //     } catch (error) {
        //         console.error(" Error while fetching data:", error);
        //         try {
        //             const errorObject = JSON.parse(error.responseText);
        //             sap.m.MessageBox.error(errorObject.error.message.value);
        //         } catch (e) {
        //             sap.m.MessageBox.error("Error while fetching data. Please try again.");
        //         }
        //     } finally {
        //         sap.ui.core.BusyIndicator.hide();
        //     }
        // },

        */

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
        }

    });
});