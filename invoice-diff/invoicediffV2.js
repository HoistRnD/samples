var j = jQuery.noConflict();
var green = [{}];
var red = [{}];
var selectedInvoiceID;
var xeroInvoice, xeroInvoice1, xeroInvoice2, xeroInvoice3;

$(document).ready(function () {     
    var settingUrl = "/hoist.json";//window.location.href.indexOf("localhost") === -1 ? "/settings" : "./hoist.json";
    $.getJSON(settingUrl, function(settings) {
        Hoist.apiKey(settings.apiKey);
        invoiceDiff.xero = Hoist.connector(settings.connectorKey);
        invoiceDiff.checkStatus();
    });
});


var invoiceDiff = {
    xero: null,
    allInvoices: null,
    recInvoiceNamesList: null,
    payInvoiceNamesList: null,
    count: new Number(0),
    connectToXero: function() {
        invoiceDiff.xero.connect(function(res) {
                invoiceDiff.renderInvoices();
            }, 
            function(err){
                console.log(err);
            }, 
            function(redirect_url) {
                window.location = redirect_url; 
            }
        );
    },
    checkStatus: function() {
        Hoist.status(function(result) {
            if (result.status == "ACTIVE") { 
                invoiceDiff.connectToXero();
            }
        },function() {
            invoiceDiff.signupToHoist();
        }); 
        invoiceDiff.attachEventHandlers();    
    },
    signupToHoist: function() {
    
        var usernamePasswordGuid = 'xxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16); 
        });
    
        var emailEnd = '@xxxxxx.com'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16); 
        });
        
        Hoist.signup({email: usernamePasswordGuid + emailEnd, password: usernamePasswordGuid}, function () {
            invoiceDiff.connectToXero();          
        }); 
    },
    renderInvoices: function() {
        var newDate = new Date();
        newDate.setMonth(newDate.getMonth() - 3);
        var date3MonthsAgo = newDate.toISOString().slice(0,10).replace(/-/g,",");
        var url = "Date>=DateTime(" + date3MonthsAgo + ")";
        invoiceDiff.xero.get("Invoices?where=" + encodeURIComponent(url), function (data) {
            invoiceDiff.allInvoices = data;
            invoiceDiff.recInvoiceNamesList = invoiceDiff.setRecInvoiceNames(invoiceDiff.allInvoices);
            invoiceDiff.payInvoiceNamesList = invoiceDiff.setPayInvoiceNames(invoiceDiff.allInvoices);
            $("#invoices").autocomplete('option', 'source', invoiceDiff.recInvoiceNamesList);
            $("#loadingMessage").hide();
            $("#modalInput").show();
        });
    },
    setPayInvoiceNames: function(invoices) {
        var accpay = [];
        _.each(invoices.Response.Invoices.Invoice, function (type) {
            if (type.Type == "ACCPAY") {
                var date = new Date(type.Date);
                date = [invoiceDiff.compare.pad(date.getDate()), invoiceDiff.compare.pad(date.getMonth() + 1), date.getFullYear()].join('.');
                accpay.push({ "label": type.Contact.Name, "value": type.InvoiceNumber + " - " + date, "id": type.InvoiceID });
            }
        });
        return accpay;
    },
    setRecInvoiceNames: function(invoices) {
        var accrec = [];
        _.each(invoices.Response.Invoices.Invoice, function (type) {
            if (type.Type == "ACCREC") {
                var date = new Date(type.Date);
                date = [invoiceDiff.compare.pad(date.getDate()), invoiceDiff.compare.pad(date.getMonth() + 1), date.getFullYear()].join('.');
                accrec.push({ "label": type.Contact.Name, "value": type.InvoiceNumber + " - " + date,  "id": type.InvoiceID });
            }
        });
        return accrec;
    },
    isOpen: false,
    showOverlayBox: function() {
        if (invoiceDiff.isOpen == false) return;
        $('.overlayBox').css({
            display: 'block',
            left: ($(window).width() - $('.overlayBox').width()) / 2,
            top: ($(window).height() - $('.overlayBox').height()) / 2 - 200,
            position: 'absolute'
        });
        $('.bgCover').css({
            display: 'block',
            width: $(window).width(),
            height: $(window).height(),
        });
    },
    doOverlayOpen: function() {
        invoiceDiff.isOpen = true;
        invoiceDiff.showOverlayBox();
        $('.bgCover').css({ opacity: 0 }).animate({ opacity: 0.5, backgroundColor: '#000' });
        return false;
    },
    doOverlayClose: function() {
        invoiceDiff.isOpen = false;
        $('.overlayBox').css('display', 'none');
        $('.bgCover').animate({ opacity: 0 }, null, null, function () { $(this).hide(); });
    }, 
    createMustacheTable: function(tableTemplate, data) {
        var template = $(tableTemplate).html();
        var invoiceTable = Mustache.to_html(template, data);
        $('#box').html(invoiceTable);
    },
    changeTableTextColor: function(green, red) {
        _.each(green, function (gr) {
            $('#invTable tr').eq(gr.col).find('td').eq(gr.row).css('color', '#16A085');
        });
        _.each(red, function (re) {
            $('#invTable tr').eq(re.col).find('td').eq(re.row).css('color', '#C0392B');
        });
    },
    updateTable: function() {
    invoiceDiff.count++;
        if (invoiceDiff.count == 1) {
            $("#getStarted").css("border", "none");
            $("#bubble").remove();
            $("#modalInput").remove();
            $("#addInvoiceButton").show();
            $("#table1").show();

            //xeroInvoice1 = xeroInvoice;

            var formatedXeroData = invoiceDiff.compare.formatXeroData(xeroInvoice.Response.Invoices.Invoice);
            invoiceDiff.createMustacheTable(tableTemplate, formatedXeroData);
        }
        else if (invoiceDiff.count == 2) {
            $("#table1").hide();
            xeroInvoice2 = xeroInvoice;
            var joinedXeroData = invoiceDiff.compare.createTableTwoInvoices(xeroInvoice1, xeroInvoice.Response.Invoices.Invoice);
            invoiceDiff.createMustacheTable(tableTemplate2, joinedXeroData);
            invoiceDiff.changeTableTextColor(green, red);
            $("#table2").show();
        }
        else if (invoiceDiff.count == 3) {
            $("#table2").hide();
            xeroInvoice3 = xeroInvoice;
            var joinedXeroData = invoiceDiff.compare.createTableThreeInvoices(xeroInvoice1, xeroInvoice2, xeroInvoice.Response.Invoices.Invoice);
            invoiceDiff.createMustacheTable(tableTemplate3, joinedXeroData);
            invoiceDiff.changeTableTextColor(green, red);
            $("#table3").show();
        }
    },
    attachEventHandlers: function() {
        $("input:radio[name=option]").click(function () {
            var radioValue = $("input:radio[name=option]:checked").val();
            if (radioValue == "Payable") {
                $("#invoices").autocomplete('option', 'source', invoiceDiff.payInvoiceNamesList)
            } else {
                $("#invoices").autocomplete('option', 'source', invoiceDiff.recInvoiceNamesList)
            }
        });

        $('#ddInvoice').on('click', 'li', function () {
            item1 = $(this).index();
            var chosenInvoice = $(this).attr('value');
            var chosenInvoiceName = $(this).text();
            console.log(item1 + "  " + "  " + chosenInvoice + "  " + chosenInvoiceName);
            $("#currentInvoice").html(chosenInvoiceName);
            $("#ddInvoice").hide();
        });

        $("#invoices").autocomplete({
            source: invoiceDiff.recInvoiceNamesList,
            appendTo: $("#addInvoice"),
            sortResults:false,
            // minLength:2,
            focus: function (event, ui) {
                $("#invoices").val(ui.item.label + " - " + ui.item.value);
                return false;
            },
            select: function (event, ui) {
                $("#invoices").val(ui.item.label + ui.item.value);
                selectedInvoiceID = ui.item.id;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append("<a><strong>" + item.label + "</strong>" + " - " + item.value + "</a>")
                .appendTo(ul);
        };

        $(window).bind('resize', invoiceDiff.showOverlayBox);

        $('#modalInput').click(invoiceDiff.doOverlayOpen);
        $('#addInvoiceButton').click(function () {
            $("#invoices").val('');
            $("#invoices").attr("placeholder", "Search Invoices");
            if (invoiceDiff.count == 0) {
                $("#rec").attr('disabled', false);
                $("#pay").attr('disabled', false);
            } else if (radioSelectValue == "Receivable") { $("#pay").attr('disabled', true); } else { $("#rec").attr('disabled', true); }
            if (invoiceDiff.count > 2) {
                $("#maxThree").fadeIn(500);
                $("#maxThree").fadeOut(7000);
            }
            else {
                invoiceDiff.doOverlayOpen();
            }
        });

        $('#closeLink').click(invoiceDiff.doOverlayClose);
        $('#Button1').click(function () {
            if (invoiceDiff.count == 0) { radioSelectValue = $("input:radio[name=option]:checked").val(); }

            var selectedInvoice = $("#invoices").val();

            if (selectedInvoice == "") {
                alert("Please select an invoice");
            } else {
                var url = "Invoices/" + selectedInvoiceID;
                invoiceDiff.xero.get(url, function (data) {
                    xeroInvoice = data;
                    if (xeroInvoice == undefined) {
                        alert("Invalid invoice selection");
                    } else {
                        invoiceDiff.doOverlayClose();
                        invoiceDiff.updateTable();
                    }
                });
            } 
        });
        
        $(".loadAll").click(function () {
            invoiceDiff.xero.get("Invoices", function (data) {
                invoiceDiff.allInvoices = data;
                invoiceDiff.recInvoiceNamesList = invoiceDiff.setRecInvoiceNames(invoiceDiff.allInvoices);
                invoiceDiff.payInvoiceNamesList = invoiceDiff.setPayInvoiceNames(invoiceDiff.allInvoices);
                $("#invoices").autocomplete('option', 'source', invoiceDiff.recInvoiceNamesList);
            });
        });
        
        $('#removeT1').click(function () { invoiceDiff.removeInvoice(); });
        $('#removeT2_1').click(function () { invoiceDiff.removeSecondInvoice(xeroInvoice2); });
        $('#removeT2_2').click(function () { invoiceDiff.removeSecondInvoice(xeroInvoice1); });
        $('#removeT3_1').click(function () { invoiceDiff.removeThirdInvoice(xeroInvoice2, xeroInvoice3); });
        $('#removeT3_2').click(function () { invoiceDiff.removeThirdInvoice(xeroInvoice1, xeroInvoice3); });
        $('#removeT3_3').click(function () { invoiceDiff.removeThirdInvoice(xeroInvoice1, xeroInvoice2); });
    },
    removeInvoice: function() {
        invoiceDiff.count = 0;
        $("#getStarted").css("border", "solid #ECF0F1");
        $("#table1").hide();
        $("#invTable").hide();
    },
    removeSecondInvoice: function(xeroInvoiceA) {
        invoiceDiff.count--;
        var formatedXeroData = invoiceDiff.compare.formatXeroData(xeroInvoiceA);
        invoiceDiff.createMustacheTable(tableTemplate, formatedXeroData);
        $("#table2").hide();
        $("#table1").show();
    },
    removeThirdInvoice: function(xeroInvoiceA, xeroInvoiceB) {
        invoiceDiff.count--;
        var joinedXeroData = invoiceDiff.compare.createTableTwoInvoices(xeroInvoiceA, xeroInvoiceB);
        invoiceDiff.createMustacheTable(tableTemplate2, joinedXeroData);
        invoiceDiff.changeTableTextColor(green, red);
        $("#table3").hide();
        $("#table2").show();
    }
}











