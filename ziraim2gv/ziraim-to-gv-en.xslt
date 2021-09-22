<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:max="http://www.umcg.nl/MAX">

	<xsl:output indent="yes" method="text" />
	<xsl:strip-space elements="*" />
	<xsl:variable name="dq">"</xsl:variable>

	<xsl:variable name="lookup_table" select='document("english.xml")//lookup/entry'/>

	<xsl:template match="max:model">
digraph{
layout=twopi;
graph [splines=true];
node [style="rounded,filled" fontname="Roboto"];
edge [fontname="Roboto" nodesep="1"];
overlap=false;
<xsl:apply-templates mode="nodes"/>
<xsl:apply-templates mode="edges"/>
}
	</xsl:template>

	<xsl:template match="object" mode="nodes">
	
		<!--
			Rood als generalization met Activiteit, Order of als tagged value "ZiRA:isActiviteit=1" 
		 -->
		<xsl:if test="stereotype='ArchiMate_BusinessObject'">
			<xsl:variable name="id" select="id"/>
			<xsl:variable name="gvid" select="concat('&quot;',$id,'&quot;')"/>
			<xsl:variable name="tooltip" select="concat(replace(replace(notes, $dq,''), '&#10;', '&amp;#10;'),' ')"/>
			<xsl:variable name="name" select="name"/>
			<xsl:variable name="name_en" select="$lookup_table[@zira_id = $id]/@english"/>
			<xsl:choose>
				<xsl:when test="$id='2171' or $id='1811' or
					exists(//relationships/relationship[sourceId=$id and destId='1811' and type='Generalization']) or
					exists(//relationships/relationship[sourceId=$id and destId='2171' and type='Generalization']) or
					tag[@name='ZiRA:isActiviteit']/@value='1'">
<xsl:value-of select="$gvid"/> [shape=rect fontcolor=black fillcolor=salmon label="<xsl:value-of select="$name_en"/>" tooltip="<xsl:value-of select="$tooltip"/>"];
				</xsl:when>
				<xsl:when test="exists(//relationships/relationship[destId=$id and type='Aggregation']) or
					tag[@name='ZiRA:isAggregatie']/@value='1'">
<xsl:value-of select="$gvid"/> [shape=rect fontcolor=black fillcolor=green label="<xsl:value-of select="$name_en"/>" tooltip="<xsl:value-of select="$tooltip"/>"];
				</xsl:when>
				<xsl:when test="@isAbstract='true'">
<xsl:value-of select="$gvid"/> [shape=rect fontcolor=white fillcolor="#ffff99" label="<xsl:value-of select="$name_en"/>" tooltip="<xsl:value-of select="$tooltip"/>"];
				</xsl:when>
				<xsl:otherwise>
<xsl:value-of select="$gvid"/> [shape=rect fillcolor="#ffff99" label="<xsl:value-of select="$name_en"/>" tooltip="<xsl:value-of select="$tooltip"/>"];
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="relationship" mode="edges">
		<xsl:variable name="destId" select="destId"/>
		<xsl:variable name="gvDestId" select="concat('&quot;',destId,'&quot;')"/>
		<xsl:if test="/max:model/objects/object[id=$destId]/stereotype='ArchiMate_BusinessObject'">
			<xsl:variable name="gvSourceId" select="concat('&quot;',sourceId,'&quot;')"/>
			<xsl:choose>
				<xsl:when test="type='Generalization'">
	<xsl:value-of select="$gvSourceId"/>-&gt;<xsl:value-of select="$gvDestId"/> [arrowhead=empty color=blue];
				</xsl:when>
				<xsl:when test="type='Aggregation'">
	<xsl:value-of select="$gvSourceId"/>-&gt;<xsl:value-of select="$gvDestId"/> [arrowhead=odiamond color=green];
				</xsl:when>
				<xsl:otherwise>
	<xsl:value-of select="$gvSourceId"/>-&gt;<xsl:value-of select="$gvDestId"/> [arrowhead=vee color=lightgray label="<xsl:value-of select="label"/>"];
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>

	<xsl:template match="relationship" mode="nodes"/>
	<xsl:template match="object" mode="edges"/>


</xsl:stylesheet>