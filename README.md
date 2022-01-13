
docs/ Generated HTML from the Enterprise Architect project

artifacts/ Different generated versions of the ZiRA model (master source is the ZiRA Enterprise Architect Project): XLSX, MAX, XML, ArchMate

zira2xls/ Converts the MAX export of the ZiRA into a spreadsheet

ziraim2gv/ Converts the ZiRA Information model to GraphViz diagrams

appfuncties2max/ Temporary conversion script from RDZ

adden2max/ Convert the English translations spreadsheet to a max file for import in the EA model 

===============
ziraim2gv:

> java -jar /home/michael/Develop/saxon9he.jar -s:Informatiemodel\ ZORG\ Resultaten.max -xsl:ziraim-to-gv.xslt -o:Informatiemodel\ ZORG\ Resultaten.gv
> dot "Informatiemodel ZORG Resultaten.gv" -Tpng > Informatiemodel\ ZORG\ Resultaten.png

----------------
ziraim2gv: OpenGroup ENGLISH

N.B. zira.fods is "ZiRA v1.0 Spreadsheet+Matrix July 11 2021+EN.xlsx" converted to Open Office Sheets.

English names lookup table from fods export of zira spreadsheet with english column.
> java -jar /home/michael/Develop/saxon9he.jar -s:/tmp/zira.fods -xsl:english.xslt -o:english.xml 

> java -jar /home/michael/Develop/saxon9he.jar -s:Informatiemodel\ ZORG\ Resultaten.max -xsl:ziraim-to-gv-en.xslt -o:Informatiemodel\ ZORG\ Resultaten-en.gv
> dot "Informatiemodel ZORG Resultaten-en.gv" -Tpng > Informatiemodel\ ZORG\ Resultaten-en.png

> java -jar /home/michael/Develop/saxon9he.jar -s:Informatiemodel\ ZORG\ Activiteiten.max -xsl:ziraim-to-gv-en.xslt -o:Informatiemodel\ ZORG\ Activiteiten-en.gv
> dot "Informatiemodel ZORG Activiteiten-en.gv" -Tpng > Informatiemodel\ ZORG\ Activiteiten-en.png
-----------------
zira2xls:

> java -jar /home/michael/Develop/saxon9he.jar -s:../artifacts/zira-v1.0-en-full.max -xsl:zira2sheet-4-nl.xslt -o:../artifacts/zira-v1.0-nl.xml
> java -jar /home/michael/Develop/saxon9he.jar -s:../artifacts/zira-v1.0-en-full.max -xsl:zira2sheet-4-en.xslt -o:../artifacts/zira-v1.0-en.xml
.. then import the xml file using LibreOffice "XML Source" and map each type/line to the top/left column of a sheet  

-----------------
adden2max: Adding engligh translation to original zira-v1.0.max file

> docker run -it -v "$(pwd)":/app node:lts-buster /bin/bash
@> cd /app/adden2max
@> node index.js > ../artifacts/zira-v1.0-en-add.max
.. then import the file in dit ZiRA v1.0.eap using EA and the MAX extension
.. then export the whole model to v-1.0-en-full.max
