<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
	xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
	xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
	xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	exclude-result-prefixes="office table text xs">

    <xsl:output indent="yes" method="xml"/>
    
   <!--
    	Input flat Open Document Spreadsheet (.fods gegenereerd vanuit LibreOffice Calc) snipet:
    	 
		   <table:table table:name="Sheet1" table:style-name="ta1">
		    <table:table-column table:style-name="co1" table:number-columns-repeated="2" table:default-cell-style-name="Default"/>
		    <table:table-row table:style-name="ro1">
		     <table:table-cell office:value-type="string" calcext:value-type="string"><text:p>TI.2.1 CC#4</text:p><text:p>RI.2 CC#5</text:p>
		     </table:table-cell>
		     <table:table-cell/>
		    </table:table-row>
	-->
	
    <xsl:template match="/">
    	<lookup>
            <xsl:apply-templates mode="entries"/>
    	</lookup>
    </xsl:template>
    
    <xsl:template match="//table:table[@table:name='Informatie']/table:table-row" mode="entries">
        <entry>
            <xsl:attribute name="zira_id"><xsl:value-of select="table:table-cell[6]/text:p"/></xsl:attribute>
            <xsl:attribute name="english"><xsl:value-of select="table:table-cell[9]/text:p"/></xsl:attribute>
        </entry>
    </xsl:template>

	<xsl:template match="text()" mode="entries"/>

</xsl:stylesheet>