<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:max="http://www.umcg.nl/MAX"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
	exclude-result-prefixes="xsl max xsi xsd">
	
	<!--
		7-sep-2016
	
		Dit XSLT script checked op basis van een MAX export van het hele ZIRA model of het model
		conform het metamodel is opgesteld.
		TODO: Omzetten naar Schematron
		
		1. Geen relaties tussen BA's
		2. Create/Update relatie tussen BA en IO
		3. etc... 
	 -->

	<xsl:output indent="yes" method="xml" />
	<xsl:strip-space elements="*" />

	<xsl:template match="max:model">
		<results>
			<xsl:apply-templates/>
		</results>
	</xsl:template>
	
	<xsl:template match="object">
		<!-- ID L0 tests -->
		<xsl:if test="starts-with(id,'2.16.840.1.113883.2.4.3.11.29.0.')">
			<xsl:variable name="sourceId" select="id"/>
			<!-- Test if the ID L0 is not empty -->
			<xsl:variable name="count" select="count(/max:model/relationships/relationship[destId=$sourceId])"/>
			<xsl:if test="$count=0">
				<error><xsl:value-of select="$sourceId"/> has no incomming relationships</error>
			</xsl:if>
		</xsl:if>

		<!-- ID L1 tests -->
		<xsl:if test="starts-with(id,'2.16.840.1.113883.2.4.3.11.29.1.')">
			<xsl:variable name="sourceId" select="id"/>
			<!-- Test if the ID L1 is not empty -->
			<xsl:variable name="count" select="count(/max:model/relationships/relationship[destId=$sourceId])"/>
			<xsl:if test="$count=0">
				<error><xsl:value-of select="$sourceId"/> has no incomming relationships</error>
			</xsl:if>
		</xsl:if>
		
		<!-- ID L2 tests -->
		<xsl:if test="starts-with(id,'2.16.840.1.113883.2.4.3.11.29.2.')">
			<xsl:variable name="sourceId" select="id"/>
			<xsl:variable name="name" select="/max:model/objects/object[id=$sourceId]/name"/>

			<!-- Test if the ID L2 is not empty -->
			<xsl:variable name="count" select="count(/max:model/relationships/relationship[destId=$sourceId])"/>
			<xsl:if test="$count=0">
				<error><xsl:value-of select="$name"/> (<xsl:value-of select="$sourceId"/>) has no incomming relationships</error>
			</xsl:if>
			
			<!-- Test if the ID L2 is aggregated exactly once with a L0 or L1 -->
			<xsl:variable name="countL0L1agg" select="count(/max:model/relationships/relationship[sourceId=$sourceId and (starts-with(destId,'2.16.840.1.113883.2.4.3.11.29.0.') or starts-with(destId,'2.16.840.1.113883.2.4.3.11.29.1.'))])"/>
			<xsl:if test="$countL0L1agg!=1">
				<error><xsl:value-of select="$name"/> (<xsl:value-of select="$sourceId"/>) shall be aggregated exactly once with a L0 or L1 ID but is <xsl:value-of select="$countL0L1agg"/></error>
			</xsl:if>
			
		</xsl:if>
		
		<!-- Test if the Dienst has 1 realization -->
		<xsl:if test="stereotype='ArchiMate_BusinessService'">
			<xsl:variable name="sourceId" select="id"/>
			<xsl:variable name="count" select="count(/max:model/relationships/relationship[destId=$sourceId and stereotype='ArchiMate_Realization'])"/>
			<xsl:if test="$count!=1">
				<xsl:variable name="name" select="/max:model/objects/object[id=$sourceId]/name"/>
				<message><xsl:value-of select="$name"/> (<xsl:value-of select="$sourceId"/>) has no realization</message>
			</xsl:if>
		</xsl:if>
		
		<!-- Test if the WerkProces has 1 aggregation relationship with a Hoofdproces
			Is there a relationship from this object to an object in the Hoofdprocess(680) package? -->
		<xsl:if test="parentId='681'"> <!-- This is an object in package Werkproces(681) -->
			<xsl:variable name="wpId" select="id"/>
			<xsl:for-each select="/max:model/relationships/relationship[sourceId=$wpId and type='Aggregation']">
				<xsl:variable name="hpId" select="destId"/>
				<xsl:if test="/max:model/objects/object[id=$hpId]/parentId!=680">
					<message>Werkproces hangt los</message> 
				</xsl:if>
			</xsl:for-each>
		
			<!-- Test if the Werkprocess has BA relationships -->
			<xsl:variable name="count" select="count(/max:model/relationships/relationship[destId=$wpId and starts-with(sourceId,'2.16.840.1.113883.2.4.3.11.29.3.')])"/>
			<xsl:if test="$count=0">
				<wpWithoutBa><xsl:value-of select="$wpId"/> has no BA's</wpWithoutBa>
			</xsl:if>
		</xsl:if>
		
		<xsl:if test="starts-with(id,'2.16.840.1.113883.2.4.3.11.29.3.')">
			<xsl:variable name="baId" select="id"/>
			<xsl:variable name="baName" select="name"/>
			
			<!-- Report on not used BA's in WP's -->
			<xsl:variable name="baWpRel">
				<xsl:for-each select="/max:model/relationships/relationship[sourceId=$baId]">
					<xsl:variable name="destId" select="destId"/>
					<xsl:if test="/max:model/objects/object[id=$destId]/parentId='681'">.</xsl:if>
				</xsl:for-each>
			</xsl:variable>
			<xsl:variable name="id2Id" select="/max:model/relationships/relationship[sourceId=$baId and starts-with(destId,'2.16.840.1.113883.2.4.3.11.29.2.')]/destId"/>
			<xsl:variable name="idName" select="/max:model/objects/object[id=$id2Id]/name"/>
			<xsl:if test="normalize-space($baWpRel)=''">
				<baWpRelMissing><xsl:value-of select="$baName"/> (Domein: <xsl:value-of select="$idName"/>)</baWpRelMissing>
			</xsl:if>
			
			<!-- Report on BA's that don't have a relationship with the ID -->
			<xsl:if test="count(/max:model/relationships/relationship[sourceId=$baId and starts-with(destId,'2.16.840.1.113883.2.4.3.11.29.2.')])=0">
				<baIdRelMissing><xsl:value-of select="$baId"/> - <xsl:value-of select="$baName"/></baIdRelMissing>
			</xsl:if>
			
		</xsl:if>
		
	</xsl:template>
	
	<xsl:template match="relationship">
		<!-- Is dit een BA -->
		<xsl:if test="starts-with(sourceId,'2.16.840.1.113883.2.4.3.11.29.3.')">
			<!-- Is dit ook een BA? -->
			<xsl:if test="starts-with(destId,'2.16.840.1.113883.2.4.3.11.29.3.')">
				<error>not-expected-relationship between BA's <xsl:value-of select="sourceId"/> -&gt; <xsl:value-of select="destId"/></error>
			</xsl:if>
		</xsl:if>
	</xsl:template>
	
</xsl:stylesheet>
