!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: Swap Diagram Name and Notes
 * Author: Michael van der Zel
 * Purpose: Swap the Name and Notes (Dutch vs English labels) for HTML Document Generation
 *		    remove any markup from the Notes
 * Date: 24-feb-2022
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

function DumpDiagrams( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Iterate through all diagrams and add them to the list
	var diagramEnumerator = new Enumerator( currentPackage.Diagrams );
	while ( !diagramEnumerator.atEnd() )
	{
		var currentDiagram as EA.Diagram;
		currentDiagram = diagramEnumerator.item();
		var name = currentDiagram.Name;
		var notes = currentDiagram.Notes.replace(/<[^>]*>/g, '').split("\n")[0];
		Session.Output( indent + name + " <-> " + notes );

		currentDiagram.Name = notes;
		currentDiagram.Notes = name;
		currentDiagram.Update();

		diagramEnumerator.moveNext();
	}
}

function DumpPackage( indent, thePackage )
{
	// Cast thePackage to EA.Package so we get intellisense
	var currentPackage as EA.Package;
	currentPackage = thePackage;
	
	// Add the current package's name to the list
	Session.Output( indent + currentPackage.Name + " / " + currentPackage.Alias );
	
	// Dump the diagrams this package contains
	DumpDiagrams( indent + "    ", currentPackage );
	
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