!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: Find Not Translated
 * Author: Michael van der Zel
 * Purpose: Find with no Name after swap or empty translation after select English
 * Date: 4-feb-2022
 */
	function moveNext()
	{
		if(this.iElem > -1)
		{
			this.iElem++;
			if(this.iElem < this.Package.Count)
			{
				return true;
			}
			this.iElem = this.Package.Count;
		}
		return false;
	}
	function item()
	{
		if( this.iElem > -1 && this.iElem < this.Package.Count)
		{
			return this.Package.GetAt(this.iElem);
		}
		return null;
	}

	function atEnd()
	{
		if((this.iElem > -1) && (this.iElem < this.Package.Count))
		{
			return false;
		}
		//Session.Output("at end!");
		return true;
	}

	function Check( obj)
	{
		if(obj == undefined)
		{
			//Session.Output("Undefined object");
			return false;
		}
		return true;
	}	
 
function Enumerator( object )
{
	this.iElem = 0;
	this.Package = object;
	this.atEnd = atEnd;
	this.moveNext = moveNext;
	this.item = item;
	this.Check = Check;
	if(!Check(object))
	{
		this.iElem = -1;
	}
}

function DumpElements( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Iterate through all elements and add them to the list
	var elementEnumerator = new Enumerator( currentPackage.Elements );
	while ( !elementEnumerator.atEnd() )
	{
		var currentElement as EA.Element;
		currentElement = elementEnumerator.item();

		var name = currentElement.Name;
		var alias = currentElement.Alias;
		var label = (alias == "") ? name : alias;
		var notes = currentElement.Notes;
		if (name == "")
		{
			Session.Output( thePackage.Name + "/" + label + " :: name missing" );
		}
		if (alias == "")
		{
			Session.Output( thePackage.Name + "/" + label + " :: alias missing" );
		}
		if (notes.indexOf ("<en-US>") == -1)
		{
			Session.Output( thePackage.Name + "/" + label + " :: en-US notes missing" );
		}
		if (notes.indexOf ("<en-US>undefined") != -1)
		{
			Session.Output( thePackage.Name + "/" + label + " :: notes undefined" );
		}
		elementEnumerator.moveNext();
	}
}

function DumpPackage( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;

	var name = thePackage.Name;
	var alias = thePackage.Alias;
	var label = (alias == "") ? name : alias;
	if (name == "")
	{
		Session.Output( label + " :: name missing" );
	}
	if (alias == "")
	{
		Session.Output( label + " :: alias missing" );
	}
	
	// Dump the elements this package contains
	DumpElements( indent + "    ", currentPackage );
	
	// Recursively process any child packages
	var childPackageEnumerator = new Enumerator( currentPackage.Packages );
	while ( !childPackageEnumerator.atEnd() )
	{
		var childPackage as EA.Package;
		childPackage = childPackageEnumerator.item();
		
		DumpPackage( indent + "    ", childPackage );
		
		childPackageEnumerator.moveNext();
	}
}

function main()
{
	// Show the script output window
	//Repository.EnsureOutputVisible( "Script" );

	// Get the currently selected package in the tree to work on
	var thePackage as EA.Package;
	thePackage = Repository.GetTreeSelectedPackage();
	DumpPackage ( "    ", thePackage );
}

main();