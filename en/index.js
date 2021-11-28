var fs = require('fs');
var xml2js = require('xml2js');
const readXlsxFile = require('read-excel-file/node');
var parser = new xml2js.Parser();

var rawmax = fs.readFileSync("../input/zira-v1.0.max");
parser.parseString(rawmax, function (err, input) {
    // input['model'].objects[0].object.forEach(object => {
    //     console.log(object);
    // });

    // Map columns of the 'Infomratie' sheet to a js-struct
    const sheet = "Informatie";
    const map = {
        'zira_id': 'id',
        'Information Object': 'name',
        'DESCRIPTION': 'description'
    }

    var output = {
        'model': {
            $: { 'xmlns': 'http://www.umcg.nl/MAX' },
            objects: {
                $: { 'xmlns': '' },
                object: []
            }
        }
    };

    // Read spreadsheet to add English translations of Informatie tab
    readXlsxFile("../input/ZiRA v1.0 Spreadsheet+Matrix July 11 2021+EN.xlsx", { sheet: "Informatie", map }).then(( {rows, errors}) => {
        rows.forEach(row => {
            var object = input['model'].objects[0].object.find(element => element.id == row.id);
            delete object["modified"];
            object["alias"] = row.name;
            object["notes"] = '<languages xml:space="preserve"><nl-NL>' + object["notes"] + '</nl-NL><en-US>' + row.description + '</en-US></languages>';
            output['model'].objects.object.push(object);
        });

        // Dump output max xml 
        var builder = new xml2js.Builder();
        console.log (builder.buildObject(output))
    });
});
