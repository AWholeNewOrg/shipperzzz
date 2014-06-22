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
        var pageSize = 10;

        var fillPicksTable = function(picks) {
            var picks2 = [];

            picks.forEach(
                function(pick) {
                    var theString = pick.split("\t")[orderCol];
                    if ( typeof theString != 'undefined') {
                        picks2.push(theString);
                    }

                }
            );

            var mainBody = $('#mainTable > tbody');
            mainBody.html("");
            picks2.forEach(function(pick) {

                console.log(pick);
                mainBody.append("<tr><td>" + pick + "</td><td></td><td></td><td></td></tr>");

            });
        };

        $('#popTable').click(function(){
            var chunks = getChunks();
            var picks = [];
            console.log ("chunks is " + chunks);
            var chunk = chunks.shift();
            console.log("chunk is " + chunk);

            chunk.forEach(
                function(pick) {
                    picks.push(pick.split("\t")[orderCol]);
                }
            );

            fillPicksTable(picks);

        });



        $('#filltestdata').click(function(){
            var testData =
            "	6/16/2014	Sales Order	SO81	Ajith N	test Veinna VA 22081	USPS Priority Mail	 	 \n" +
            "\t6/18/2014	Sales Order	SO100	Test-Lucy Jones	136 Whispering Winds Dr Gunter TX 75058	USPS First Class Mail   \n" +
            "\t6/18/2014	Sales Order	SO101	Test-Lucy Jones	136 Whispering Winds Dr Gunter TX 75058	USPS First Class Mail   \n" +
            "\t6/18/2014	Sales Order	SO102	Test-Lucy Jones	136 Whispering Winds Dr Gunter TX 75058	USPS First Class Mail   \n" +
            "\t6/14/2014	Sales Order	SO75	Test-Sarah Roden	1100 S Congress Ave Denver CO 80209	USPS Priority Mail  \n" +
            "\t6/18/2014	Sales Order	SO98	Test-Sarah Roden	1825 E 38 1/2 St, Ste 205 Austin TX 78722	USPS First Class Mail   \n";
            $("#picks").val(testData);
        });


        var getChunks = function() {
            var picks = $("#picks").get(0).value;
            picks = picks.split("\n");

            return picks.chunk(pageSize);
        };


        $('#generate-pdf-btn').click(function () {
            console.log("let's generate a pdf");


            var chunks = getChunks();

            console.log( "chunks is " + chunks);

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