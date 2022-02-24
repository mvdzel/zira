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

function EnumerateElements( indent, elements )
{
	// Iterate through all elements and add them to the list
	var elementEnumerator = new Enumerator( elements );
	while ( !elementEnumerator.atEnd() )
	{
		var currentElement as EA.Element;
		currentElement = elementEnumerator.item();

		var name = currentElement.Name;
		var alias = currentElement.Alias;
		var notes = currentElement.Notes;
		if (name == "")
		{
			var pkgname = Repository.GetPackageByID( currentElement.PackageID ).Name;
			Session.Output( pkgname + "/" + alias + " :: name missing", currentElement.ElementGUID );
		}
		if (notes == "")
		{
			Session.Output( name + "/" + alias + " :: notes empty", currentElement.ElementGUID );
		}
		
		EnumerateElements( indent, currentElement.Elements );
		
		elementEnumerator.moveNext();
	}
}

function DumpElements( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	EnumerateElements ( indent, thePackage.Elements );
}

function DumpPackage( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
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