var fs = require('fs');
var xml2js = require('xml2js');
const readXlsxFile = require('read-excel-file/node');
var parser = new xml2js.Parser();

const filename_xlsx_en = "../input/ZiRA v1.0a Spreadsheet+Matrix including translation.xlsx";
const filename_max = "../input/zira-v1.0.max";

/**
 * This script takes the original Dutch ZiRA v1.0 MAX file export from the source ZiRA EA model
 * and adds the English translations from the spreadsheet.
 * The output will be a MAX file with the objects were an English translations was defined for import in EA 
 * to create the ZiRA Dutch + English version created with the OpenGroup HealthCareForum.
 */

var rawmax = fs.readFileSync(filename_max);
parser.parseString(rawmax, function (err, input) {
    // input['model'].objects[0].object.forEach(object => {
    //     console.log(object);
    // });

    // Map columns of the 'Informatie' sheet to a js-struct
    const map_informatie = {
        'zira_id': 'id',
        'informatieobject_en': 'name',
        'beschrijving_en': 'description'
    }
    // Map columns of the 'Proces' sheet to a js-struct
    const map_proces = {
        'type': 'type',
        'ZiRA id': 'id',
        'Bedrijfsproces_en': 'name_bp',
        'Werkproces_en': 'name_wp',
        'BA / Processtap_en': 'name_ba',
        'Beschrijving_en': 'description'
    }
    // Map columns of the 'BedrijfsFuncties' sheet to a js-struct
    const map_bf = {
        'type': 'type',
        'ZiRA id': 'id',
        'Business Function': 'name',
        'Description': 'description'
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
    readXlsxFile(filename_xlsx_en, { sheet: "Informatie", map: map_informatie }).then(( {rows, errors}) => {
        rows.forEach(row => {
            var object = input['model'].objects[0].object.find(element => element.id == row.id);
            delete object["modified"];
            object["alias"] = row.name;
            object["notes"] = '<languages xml:space="preserve"><nl-NL>' + object["notes"] + '</nl-NL><en-US>' + row.description + '</en-US></languages>';
            output['model'].objects.object.push(object);
        });

        readXlsxFile(filename_xlsx_en, { sheet: "Proces", map: map_proces }).then(( {rows, errors}) => {
            rows.forEach(row => {
                var object = input['model'].objects[0].object.find(element => element.id == row.id);
                delete object["modified"];
                switch(row.type) {
                    case 'BP': object["alias"] = row.name_bp; break;
                    case 'WP': object["alias"] = row.name_wp; break;
                    case 'BA': object["alias"] = row.name_ba; break;
                }
                object["notes"] = '<languages xml:space="preserve"><nl-NL>' + object["notes"] + '</nl-NL><en-US>' + row.description + '</en-US></languages>';
                output['model'].objects.object.push(object);
            });

            readXlsxFile(filename_xlsx_en, { sheet: "BedrijfsFuncties", map: map_bf }).then(( {rows, errors}) => {
                rows.forEach(row => {
                    if (row.type == "BF") {
                        var object = input['model'].objects[0].object.find(element => element.id == row.id);
                        delete object["modified"];
                        object["alias"] = row.name;
                        object["notes"] = '<languages xml:space="preserve"><nl-NL>' + object["notes"] + '</nl-NL><en-US>' + row.description + '</en-US></languages>';
                        output['model'].objects.object.push(object);
                    }
                });

                // Dump output max xml 
                var builder = new xml2js.Builder();
                console.log (builder.buildObject(output));
            });
        });    
    });
});
