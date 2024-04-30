(function(){
    
_Cheltuieli.Module = _Components.Container.extend(
{
    _setupResources_: function()
    {
        var pageOptions;
                
        pageOptions = {
            Module: this 
        };
        
        this.Panes = new PanesConstructor( this.find( '>.panes-container' ), {
            $tabsContainer: this.find( '>.tabs-container' ),
            defaultPane:    'curente',
            paneConstructors: {
                curente:    [ _Cheltuieli.CheltuieliCurente, pageOptions ],
                neachitate: [ _Cheltuieli.CheltuieliNeachitate, pageOptions ]
            }
        });
    }
    
});

var PanesConstructor = _Components.Panes.extend(
{
    
});

})();