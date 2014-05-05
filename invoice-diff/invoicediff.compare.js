//format a invoice to display in table
var invoiceDiff = invoiceDiff || {}
invoiceDiff.compare = {
    formatXeroData: function(data) {
        
        xeroInvoice1 = data;
        var d1 = new Date(data.Date);
        d1 = [invoiceDiff.compare.pad(d1.getDate()), invoiceDiff.compare.pad(d1.getMonth() + 1), d1.getFullYear()].join('.');

        var xeroInvoiceData = {
            "tableData": {
                "InvoiceName1": data.Contact.Name + " - " + d1 + " - " + data.InvoiceNumber,
                "Compare": []
            }
        }
        var total = new Number();

        var dataLineItems;
        var check = data.LineItems.LineItem.LineAmount;
        if (check == undefined) {
            dataLineItems = data.LineItems.LineItem;
        } else {
            dataLineItems = data.LineItems;
        }
        _.each(dataLineItems, function (lItems) {
            total += parseFloat(lItems.LineAmount);
            xeroInvoiceData.tableData.Compare.push({ "CostsName": lItems.Description, "value1": "$" + invoiceDiff.compare.formatNumber(parseFloat(lItems.LineAmount)), "comp": parseFloat(lItems.Quantity) + " @ " + lItems.UnitAmount });
        });
        xeroInvoiceData.tableData["Total1"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total));
        return xeroInvoiceData;
    },
    createTableTwoInvoices: function(dA, dB) {

        var d1Date = new Date(dA.Date), d2Date = new Date(dB.Date);
        if (d1Date > d2Date) {
            var temp = dA;
            dA = dB;
            dB = temp;
        }

        xeroInvoice1 = dA; xeroInvoice2 = dB;

        var total1 = new Number(), total2 = new Number();
        var up = [], down = [];

        var d1 = new Date(dA.Date), d2 = new Date(dB.Date);
        d1 = [invoiceDiff.compare.pad(d1.getDate()), invoiceDiff.compare.pad(d1.getMonth() + 1), d1.getFullYear()].join('.');
        d2 = [invoiceDiff.compare.pad(d2.getDate()), invoiceDiff.compare.pad(d2.getMonth() + 1), d2.getFullYear()].join('.');

        var table = {
                "tableData": {
                    "InvoiceName1": dA.Contact.Name + " - " + d1 + " - " + dA.InvoiceNumber,
                    "InvoiceName2": dB.Contact.Name + " - " + d2 + " - " + dB.InvoiceNumber, 
                    "Compare": []
                }
            }


        var dataLineItems1, check = dA.LineItems.LineItem.LineAmount;
        if (check == undefined) {
            dataLineItems1 = dA.LineItems.LineItem;
        } else {
            dataLineItems1 = dA.LineItems;
        }

        _.each(dataLineItems1, function(data){
            total1 += parseFloat(data.LineAmount);
            table.tableData.Compare.push({ "CostsName": invoiceDiff.compare.removeFromDescription(data.Description), "value1": data.LineAmount , "comp": parseFloat(data.Quantity)  + " @ " + data.UnitAmount, "value2": " -", "comp2":"-", "match": -1 });
        });

        var dataLineItems2;
        var check = dB.LineItems.LineItem.LineAmount;
        if (check == undefined) {
            dataLineItems2 = dB.LineItems.LineItem;
        } else {
            dataLineItems2 = dB.LineItems;
        }

        _.each(table.tableData.Compare, function(tableItem) {
            total2 = 0;
            _.each(dataLineItems2, function(data){
                total2 += parseFloat(data.LineAmount);
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description));
                if (dif < 5 ) {
                    if ( tableItem.match == -1 || dif < tableItem.match ) {
                        tableItem.value2 = data.LineAmount;
                        tableItem.comp2 = parseFloat(data.Quantity)  + " @ " + data.UnitAmount
                        tableItem.match = dif;
                    }
                }
            });
        });

        var x = 3, y = 0;
        _.each( table.tableData.Compare, function(data) {
            y++;         
            if (data.value1 != undefined && data.value2 != undefined) {
                if (parseFloat(data.value1) < parseFloat(data.value2)) {
                    up.push({ "col": y, "row": x });
                } else if (parseFloat(data.value1) > parseFloat(data.value2)) {
                    down.push({ "col": y, "row": x });
                }
            }
        });   

        _.each(dataLineItems2, function(data){
            var inTable = false;
            _.each(table.tableData.Compare, function(tableItem) {
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description)) ;
                if (dif < 5 ) {
                    inTable = true;
                }
            });
            if (inTable === false) {
                table.tableData.Compare.push({ "CostsName": invoiceDiff.compare.removeFromDescription(data.Description), "value1": " -" , "comp": "-", "value2": data.LineAmount, "comp2": parseFloat(data.Quantity)  + " @ " + data.UnitAmount, "match": -1 });
            }
        });

        table.tableData["Total1"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total1));
        table.tableData["Total2"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total2));

        invoiceDiff.compare.setRedGreen(up, down);

        return table;
    },
    createTableThreeInvoices: function(dA, dB, dC) {

        var d1Date = new Date(dA.Date), d2Date = new Date(dB.Date), d3Date = new Date(dC.Date);
        if (d1Date > d2Date) {
            var temp = dA; dA = dB; dB = temp;
            temp = d1Date; d1Date = d2Date; d2Date = temp;
        }
        if (d2Date > d3Date) {
            var temp = dB; dB = dC; dC = temp;
            temp = d2Date; d2Date = d3Date; d3Date = temp;
        }
        if (d1Date > d2Date) {
            var temp = dA; dA = dB; dB = temp;
        }
        xeroInvoice1 = dA; xeroInvoice2 = dB; xeroInvoice3 = dC;
        var up = [];
        var down = [];

        var d1 = new Date(dA.Date), d2 = new Date(dB.Date), d3 = new Date(dC.Date);
        d1 = [invoiceDiff.compare.pad(d1.getDate()), invoiceDiff.compare.pad(d1.getMonth() + 1), d1.getFullYear()].join('.');
        d2 = [invoiceDiff.compare.pad(d2.getDate()), invoiceDiff.compare.pad(d2.getMonth() + 1), d2.getFullYear()].join('.');
        d3 = [invoiceDiff.compare.pad(d3.getDate()), invoiceDiff.compare.pad(d3.getMonth() + 1), d3.getFullYear()].join('.');

        var table = {
            "tableData": {
                "InvoiceName1": dA.Contact.Name + " - " + d1 + " - " + dA.InvoiceNumber,
                "InvoiceName2": dB.Contact.Name + " - " + d2 + " - " + dB.InvoiceNumber,
                "InvoiceName3": dC.Contact.Name + " - " + d3 + " - " + dC.InvoiceNumber,
                "Compare": []
            }
        }

        var total1 = new Number(), total2 = new Number(), total3 = new Number();
        
        var dataLineItems1 = invoiceDiff.compare.checkLineItems(dA);
        _.each(dataLineItems1, function(data){
            total1 += parseFloat(data.LineAmount);
            table.tableData.Compare.push({ "CostsName": invoiceDiff.compare.removeFromDescription(data.Description), "value1": data.LineAmount , "comp": parseFloat(data.Quantity)  + " @ " + data.UnitAmount, "value2": " -", "comp2":"-", "value3": " -", "comp3": "-", "match": -1, "match2": -1 });
        });

        var dataLineItems2 = invoiceDiff.compare.checkLineItems(dB);

        _.each(table.tableData.Compare, function(tableItem) {
            total2 = 0;
            _.each(dataLineItems2, function(data){
                total2 += parseFloat(data.LineAmount);
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description));
                if (dif < 5 ) {
                    if ( tableItem.match == -1 || dif < tableItem.match ) {
                        tableItem.value2 = data.LineAmount;
                        tableItem.comp2 = parseFloat(data.Quantity)  + " @ " + data.UnitAmount
                        tableItem.match = dif;
                    }
                }
            });
        });

        var x = 3, y = 0;
        _.each( table.tableData.Compare, function(data) {
            y++;         
            if (data.value1 != undefined && data.value2 != undefined) {
                if (parseFloat(data.value1) < parseFloat(data.value2)) {
                    up.push({ "col": y, "row": x });
                } else if (parseFloat(data.value1) > parseFloat(data.value2)) {
                    down.push({ "col": y, "row": x });
                }
            }
        });   

        _.each(dataLineItems2, function(data){
            var inTable = false;
            _.each(table.tableData.Compare, function(tableItem) {
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description)) ;
                if (dif < 5 ) {
                    inTable = true;
                }
            });
            if (inTable === false) {
                table.tableData.Compare.push({ "CostsName": invoiceDiff.compare.removeFromDescription(data.Description), "value1": " -" , "comp": "-", "value2": data.LineAmount, "comp2": parseFloat(data.Quantity)  + " @ " + data.UnitAmount, "value3": " -", "comp3": "-", "match": -1, "match2": -1 });
            }
        });
    
    
       var dataLineItems3 = invoiceDiff.compare.checkLineItems(dC);
    
        _.each(table.tableData.Compare, function(tableItem) {
            total3 = 0;
            _.each(dataLineItems3, function(data){
                total3 += parseFloat(data.LineAmount);
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description));
                if (dif < 5 ) {
                    if ( tableItem.match2 == -1 || dif < tableItem.match2 ) {
                        tableItem.value3 = data.LineAmount;
                        tableItem.comp3 = parseFloat(data.Quantity)  + " @ " + data.UnitAmount
                        tableItem.match2 = dif;
                    }
                }
            });
        });

        var x = 5, y = 0;
        _.each( table.tableData.Compare, function(data) {
            y++;         
            if (data.value1 != undefined && data.value2 != undefined) {
                if (parseFloat(data.value2) < parseFloat(data.value3)) {
                    up.push({ "col": y, "row": x });
                } else if (parseFloat(data.value2) > parseFloat(data.value3)) {
                    down.push({ "col": y, "row": x });
                }
            }
        });   

        _.each(dataLineItems3, function(data){
            var inTable = false;
            _.each(table.tableData.Compare, function(tableItem) {
                var dif = invoiceDiff.compare.fuzzy(invoiceDiff.compare.removeFromDescription(tableItem.CostsName), invoiceDiff.compare.removeFromDescription(data.Description)) ;
                if (dif < 5 ) {
                    inTable = true;
                }
            });
            if (inTable === false) {
                table.tableData.Compare.push({ "CostsName": invoiceDiff.compare.removeFromDescription(data.Description), "value1": " -" , "comp": "-", "value2": "", "comp2": " -", "value3": data.LineAmount, "comp3": parseFloat(data.Quantity)+" @ "+data.UnitAmount, "match": -1, "match2": -1 });
            }
        });

        table.tableData["Total1"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total1));
        table.tableData["Total2"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total2));
        table.tableData["Total3"] = "$" + invoiceDiff.compare.formatNumber(parseFloat(total3));

        invoiceDiff.compare.setRedGreen(up, down);

        return table;
    },
    checkLineItems: function(data) {
        var retval;
        var check = data.LineItems.LineItem.LineAmount;
        if (check == undefined) {
            retval = data.LineItems.LineItem;
        } else {
            retval = data.LineItems;
        }
        return retval;
    },
    pad: function (s) { 
        return (s < 10) ? '0' + s : s; 
    },
    removeFromDescription: function ( description) { 
        var months = eval("/January|Jan|Febuary|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|October|Oct|November|Nov|December|Dec/ig");
        var alteredDescription = description.replace(months, "{month}");
        return alteredDescription;
    },
    formatNumber: function(number) {
        number = number.toFixed(2) + '';
        x = number.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    fuzzy: function(s, t){
        //the levenshtein distance function
        var d = []; 

        var n = s.length;
        var m = t.length;

        if (n == 0) return m;
        if (m == 0) return n;

        for (var i = n; i >= 0; i--) d[i] = [];

        for (var i = n; i >= 0; i--) d[i][0] = i;
        for (var j = m; j >= 0; j--) d[0][j] = j;

        for (var i = 1; i <= n; i++) {
            var s_i = s.charAt(i - 1);

            for (var j = 1; j <= m; j++) {

                if (i == j && d[i][j] > 4) return n;

                var t_j = t.charAt(j - 1);
                var cost = (s_i == t_j) ? 0 : 1;

                var mi = d[i - 1][j] + 1;
                var b = d[i][j - 1] + 1;
                var c = d[i - 1][j - 1] + cost;

                if (b < mi) mi = b;
                if (c < mi) mi = c;

                d[i][j] = mi;

                if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }
        return d[n][m];
    },
    setRedGreen: function(up, down) {
        if (radioSelectValue === "Receivable") {
            green = up;
            red = down;
        } else {
            green = down;
            red = up;
        }
    }
}