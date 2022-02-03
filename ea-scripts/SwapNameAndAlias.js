!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: Swap Name and Alias
 * Author: Michael van der Zel
 * Purpose: Swap the Name and Alias (Dutch vs English labels) for HTML Document Generation
 * Date: 3-feb-2022
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

		Session.Output( indent + currentElement.Name + " <-> " + currentElement.Alias );

		var name = currentElement.Name;
		var alias = currentElement.Alias;
		currentElement.Name = alias;
		currentElement.Alias = name;
		currentElement.Update();

		elementEnumerator.moveNext();
	}
}

function DumpPackage( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Add the current package's name to the list
	Session.Output( indent + currentPackage.Name + " <-> " + currentPackage.Alias );
	
	var name = currentPackage.Name;
	var alias = currentPackage.Alias;
	currentPackage.Name = alias;
	currentPackage.Alias = name;
	currentPackage.Update();

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