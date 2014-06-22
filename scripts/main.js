require.config({
    baseUrl: '.',
    paths: {
        jquery: 'bower_components/jquery/dist/jquery',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap',
        jspdf: 'bower_components/jspdf/dist/jspdf.debug',
        html2canvas: 'bower_components/html2canvas/build/html2canvas'

    }
});

Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
};

require(['jquery', 'jspdf', 'html2canvas'], function ($, jsPDF) {
    $(function () {
        var orderCol = 3;
        var $batchStyle = $("#batchStyle");

        var getInvoiceColumn = function() {
            return parseInt($("#invoiceCol").val());
        };

        var getPageSize = function() {
            return  parseInt($("#sheetSize").val());
        };

        $batchStyle.change(function(){
            var $oldStyleRow = $("#oldStyleRow");
            var $netSuiteStyleRow = $("#netSuiteStyleRow");
            switch(this.value) {
                case 'oldStyle':
                    $oldStyleRow.show();
                    $netSuiteStyleRow.hide();
                    break;
                case 'netSuiteStyle':
                    $oldStyleRow.hide();
                    $netSuiteStyleRow.show();
                    break;
            }
        });

        $batchStyle.change();


        var fillPicksTable = function(picks) {
            var picks2 = [];

            picks.forEach(
                function(pick) {
                    if (pick.toString().indexOf("\t") != -1) {
                        var theString = pick.toString().split("\t")[getInvoiceColumn()];
                    }
                    else {
                        theString = pick
                    }
                    if (typeof theString != 'undefined') {
                        picks2.push(theString);
                    }
                }
            );

            var mainBody = $('#mainTable > tbody');
            mainBody.html("");
            picks2.forEach(function(pick) {
                mainBody.append("<tr><td>" + pick + "</td><td></td><td></td><td></td></tr>");
            });
        };

        var getNetSuitePicks = function() {
            return $("#picks").get(0).value;
        };

        var getOldPicks = function () {
            var ret = [];
            var start = parseInt($("#invoiceStart").val());
            var end = parseInt($("#invoiceEnd").val());

            var num = start;
            while (num <= end) {
                ret.push(num);
                num ++;
            }
            return ret;

        };

        var getChunks = function() {
            var type = $("#batchStyle").val();
            var picks = [];
            switch (type) {
                case 'oldStyle':
                    picks = getOldPicks();
                    break;
                case 'netSuiteStyle':
                    picks = getNetSuitePicks();
                    picks = picks.split("\n");
                    break;
            }




            return picks.chunk(getPageSize());
//            return picks.chunk(10);
        };



        $('#generate-pdf-btn').click(function () {
            console.log("let's generate a pdf");
            var chunks = getChunks();
            var pdf = new jsPDF('p', 'pt', 'letter');
            var doPages = function(pages) {
                var dfd = new jQuery.Deferred();
                fillPicksTable(pages.shift());
                pdf.addHTML($("#pdfme"),
                    {
                        background: '#ffffff'
                    },
                    function () {
                        dfd.resolve();
                    });

                dfd.done(
                    function() {
                        if (pages.length > 0) {
                            pdf.addPage();
                            doPages(pages);
                        } else {
                            pdf.save("Test.pdf");
                        }
                    }
                );
            };
            doPages(chunks);
        });

    });
});