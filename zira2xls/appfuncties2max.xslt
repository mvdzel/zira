<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
	xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
	xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
	xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:max="http://www.umcg.nl/MAX"
	exclude-result-prefixes="office table text xs">

    <xsl:output indent="yes" method="xml"/>
    <xsl:variable name="zira" select="document('zira-v03.max')"/>
    
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
    	<max:model>
	    	<objects>
	    		<xsl:apply-templates mode="objects"/>
	    	</objects>
	    	<relationships>
    			<xsl:apply-templates mode="relationships"/>
			</relationships>    			
    	</max:model>
    </xsl:template>
    
    <xsl:template match="//table:table[@table:name='Import']/table:table-row" mode="objects">
   		<xsl:variable name="domein" select="table:table-cell[1]/text:p"/>
   		<xsl:variable name="subdomein" select="table:table-cell[2]/text:p"/>
   		<xsl:variable name="appfunctie" select="table:table-cell[3]/text:p"/>
   		<xsl:variable name="beschrijving" select="table:table-cell[4]/text:p"/>
   		<!-- multi-line extref in tagged value! -->
   		<xsl:variable name="extref" select="table:table-cell[5]/text:p"/>
   		<!-- multi-line BA naar relationship -->
   		<xsl:variable name="bas" select="table:table-cell[6]/text:p"/>
   		<xsl:variable name="afid" select="concat('AF-',position())"/>
   		
   		<object>
   			<id><xsl:value-of select="$afid"/></id>
   			<name><xsl:value-of select="$appfunctie"/></name>
   			<notes><xsl:value-of select="$beschrijving"/></notes>
   			<stereotype>ArchiMate_ApplicationFunction</stereotype>
   			<type>Activity</type>
   			<parentId>2536</parentId>
   			<xsl:for-each select="$extref">
   				<tag name="ExternalReference"><xsl:attribute name="value" select="."/></tag>
   			</xsl:for-each>
   		</object>
   	</xsl:template>

    <xsl:template match="//table:table[@table:name='Import']/table:table-row" mode="relationships">
   		<xsl:variable name="domein" select="table:table-cell[1]/text:p"/>
   		<xsl:variable name="subdomein" select="table:table-cell[2]/text:p"/>
   		<xsl:variable name="appfunctie" select="table:table-cell[3]/text:p"/>
   		<xsl:variable name="beschrijving" select="table:table-cell[4]/text:p"/>
   		<!-- multi-line extref in tagged value! -->
   		<xsl:variable name="extref" select="table:table-cell[5]/text:p"/>
   		<!-- multi-line BA naar releationship -->
   		<xsl:variable name="bas" select="table:table-cell[6]/text:p"/>
   		<xsl:variable name="afid" select="concat('AF-',position())"/>

		<xsl:for-each select="$bas">
			<xsl:variable name="baname" select="normalize-space(.)"/>
			<xsl:choose>
				<xsl:when test="$baname = 'GENERIEK'">
					<!--
						GENERIEK zijn de appfuncties die rechtstreeks aan het sub-domein zitten 
					 -->
					<xsl:variable name="sdid" select="$zira//object[name=upper-case($subdomein)]/id"/>
			  		<relationship>
			  			<sourceId><xsl:value-of select="$afid"/></sourceId>
			  			<destId><xsl:value-of select="$sdid"/></destId>
			  			<xsl:comment>SD <xsl:value-of select="$subdomein"/></xsl:comment>
			  			<stereotype>ArchiMate_Aggregation</stereotype>
			  			<type>Aggregation</type>
			  		</relationship>
				</xsl:when>
				<xsl:when test="$baname != ''">
					<xsl:variable name="baid" select="$zira//object[name=$baname]/id"/>
			  		<relationship>
			  			<sourceId><xsl:value-of select="$afid"/></sourceId>
			  			<destId><xsl:value-of select="$baid"/></destId>
			  			<xsl:comment>BA <xsl:value-of select="$baname"/></xsl:comment>
			  			<stereotype>ArchiMate_Association</stereotype>
			  			<type>Association</type>
			  		</relationship>
			  	</xsl:when>
			</xsl:choose>
	  	</xsl:for-each>
   	</xsl:template>

	
	<xsl:template match="text()" mode="objects"/>

	<xsl:template match="text()" mode="relationships"/>
	    
</xsl:stylesheet>
	