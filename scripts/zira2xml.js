var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

const filename_max = "../artifacts/zira-1.0-elements-nl+en.max";

/**
 * This script takes the complete ZiRA MAX nl+en and generated the XML file that can be imported in the spreadsheet
 * using OpenOffice XML Data Source.
 */

var rawmax = fs.readFileSync(filename_max);
parser.parseString(rawmax, function (err, input) {
    // input['model'].objects[0].object.forEach(object => {
    //     console.log(object);
    // });

    var output = {
        'zira': {
            processen: {
                line: [
                    {
                        type: "type",
                        dienst: "Dienst",
					    bedrijfsproces: "Bedrijfsproces",
					    werkproces: "Werkproces",
					    processtap: "Processtap = Bedrijfsactiviteit",
					    beschrijving: "Beschrijving",
					    bedrijfsfuncties: "Bedrijfsfuncties",
                        sort_key: "sort_key",
					    zira_id: "ZiRA id"
                    }
                ]
            }
        }
    };

    var bs = input['model'].objects[0].object.filter(object => object.stereotype == 'ArchiMate_BusinessService');
    bs.forEach(object => {
        var name_bs = object.alias;
        var dienstid = object.id;
        var line = {
            type: "BS",
            dienst: name_bs,
            zira_id: dienstid
        }
        output['zira'].processen.line.push(line);

        // now find the BPs in this BS
        var bprels = input['model'].relationships[0].relationship.filter(relationship => relationship.destId[0] == dienstid && relationship.type[0] == 'Realisation');
        bprels.forEach(relationship => {
            var bpid = relationship.sourceId[0];
            var bp = input['model'].objects[0].object.find(object => object.id == bpid);
            var name_bp = bp.alias;
            var after = bp.notes[0].indexOf("<en-US>") + 7;
            var before = bp.notes[0].indexOf("</en-US>");
            var notes_bp = bp.notes[0].substring(after, before);
            var line = {
                type: "BP",
                dienst: name_bs,
                bedrijfsproces: name_bp,
                beschrijving: notes_bp,
                zira_id: bpid
            };
            output['zira'].processen.line.push(line);

            // now find the WPs in this BP
            var wprels = input['model'].relationships[0].relationship.filter(relationship => relationship.destId[0] == bpid && relationship.type[0] == 'Aggregation');
            wprels.forEach(relationship => {
                var wpid = relationship.sourceId[0];
                var wp = input['model'].objects[0].object.find(object => object.id == wpid);
                var name_wp = wp.alias;
                var after = wp.notes[0].indexOf("<en-US>") + 7;
                var before = wp.notes[0].indexOf("</en-US>");
                var notes_wp = wp.notes[0].substring(after, before);
                var line = {
                    type: "WP",
                    dienst: name_bs,
                    bedrijfsproces: name_bp,
                    werkproces: name_wp,
                    beschrijving: notes_wp,
                    zira_id: wpid
                };
                output['zira'].processen.line.push(line);

                // now find the BA in this WP
                var barels = input['model'].relationships[0].relationship.filter(relationship => relationship.destId[0] == wpid && relationship.type[0] == 'Aggregation');

                // sort based on relationship sort_key
                barels.sort((firstEl, secondEl) => { 
                    var so1 = 0;
                    if (firstEl.tag) { so1 = firstEl.tag[0]['$'].value; }
                    var so2 = 0;
                    if (secondEl.tag) { so2 = secondEl.tag[0]['$'].value; }
                    return so1 - so2;
                });

                barels.forEach(relationship => {
                    var baid = relationship.sourceId[0];
                    var ba = input['model'].objects[0].object.find(object => object.id == baid);
                    var name_ba = ba.alias;
                    var sort_key = '';
                    if (relationship.tag) {
                        sort_key = relationship.tag[0]['$'].value;
                    }
                    var after = ba.notes[0].indexOf("<en-US>") + 7;
                    var before = ba.notes[0].indexOf("</en-US>");
                    var notes_ba = ba.notes[0].substring(after, before);
                    var line = {
                        type: "BA",
                        dienst: name_bs,
                        bedrijfsproces: name_bp,
                        werkproces: name_wp,
                        processtap: name_ba,
                        beschrijving: notes_ba,
                        sort_key: sort_key,
                        zira_id: baid
                    };
                    output['zira'].processen.line.push(line);
                });
            });
        });
    });
    
    // Dump output max xml 
    var builder = new xml2js.Builder();
    console.log (builder.buildObject(output));
});
